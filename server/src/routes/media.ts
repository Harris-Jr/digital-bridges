// Media uploads via Cloudinary signed direct upload. The browser uploads the
// file straight to Cloudinary (keeping large files off this server); we only
// hand out a short-lived signature. When Cloudinary env vars are unset, uploads
// are reported as disabled and the admin falls back to pasting a URL.
import { Router } from "express";
import { createHash } from "node:crypto";
import { env } from "../env.js";
import { z } from "zod";
import { query } from "../db.js";
import { asyncHandler, badRequest, HttpError, notFound } from "../lib/http.js";
import { requireAuth, requireStaff } from "../middleware.js";

export const mediaRouter = Router();
mediaRouter.use(requireAuth, requireStaff);

function enabled(): boolean {
  return !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

mediaRouter.get(
  "/config",
  asyncHandler(async (_req, res) => {
    res.json({ enabled: enabled(), cloudName: env.CLOUDINARY_CLOUD_NAME ?? null });
  }),
);

mediaRouter.post(
  "/sign",
  asyncHandler(async (_req, res) => {
    if (!enabled()) throw new HttpError(503, "Media uploads are not configured.");
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = env.CLOUDINARY_FOLDER;
    // Cloudinary signature: SHA-1 of the alphabetically-sorted params to sign,
    // followed by the API secret. We only sign folder + timestamp, so the
    // browser must send exactly those params with the upload.
    const toSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash("sha1").update(toSign + env.CLOUDINARY_API_SECRET).digest("hex");
    res.json({
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      folder,
      timestamp,
      signature,
    });
  }),
);

// ---------------------------------------------------------------------------
// Media library
// ---------------------------------------------------------------------------
const KINDS = ["image", "video", "audio", "file"] as const;

mediaRouter.get(
  "/items",
  asyncHandler(async (req, res) => {
    const kind = typeof req.query.kind === "string" && (KINDS as readonly string[]).includes(req.query.kind) ? req.query.kind : null;
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
    const { rows } = await query(
      `select id, url, public_id, kind, name, alt, bytes, width, height, created_at
         from media
        where ($1::text is null or kind = $1)
          and ($2 = '' or name ilike '%' || $2 || '%' or alt ilike '%' || $2 || '%')
        order by created_at desc
        limit 300`,
      [kind, q],
    );
    res.json(rows);
  }),
);

const itemSchema = z.object({
  url: z.string().trim().min(1).max(1000).refine((u) => /^https:\/\//.test(u) || u.startsWith("/"), "Use an https:// link or a site path."),
  public_id: z.string().trim().max(300).nullish(),
  kind: z.enum(KINDS).default("image"),
  name: z.string().trim().max(200).default(""),
  alt: z.string().trim().max(300).default(""),
  bytes: z.coerce.number().int().nonnegative().nullish(),
  width: z.coerce.number().int().nonnegative().nullish(),
  height: z.coerce.number().int().nonnegative().nullish(),
});

// Register an uploaded (or linked) file in the library. Idempotent on url.
mediaRouter.post(
  "/items",
  asyncHandler(async (req, res) => {
    const input = itemSchema.safeParse(req.body);
    if (!input.success) throw badRequest(input.error.issues[0]?.message ?? "Invalid media item.");
    const d = input.data;
    const { rows } = await query(
      `insert into media (url, public_id, kind, name, alt, bytes, width, height, created_by)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (url) do update set name = coalesce(nullif(excluded.name, ''), media.name)
       returning *`,
      [d.url, d.public_id ?? null, d.kind, d.name, d.alt, d.bytes ?? null, d.width ?? null, d.height ?? null, req.auth!.id],
    );
    res.status(201).json(rows[0]);
  }),
);

mediaRouter.patch(
  "/items/:id",
  asyncHandler(async (req, res) => {
    const input = z.object({ name: z.string().trim().max(200).optional(), alt: z.string().trim().max(300).optional() }).safeParse(req.body);
    const id = z.string().uuid().safeParse(req.params.id);
    if (!input.success || !id.success) throw badRequest("Invalid update.");
    const { rows } = await query(
      "update media set name = coalesce($2, name), alt = coalesce($3, alt) where id = $1 returning *",
      [id.data, input.data.name ?? null, input.data.alt ?? null],
    );
    if (!rows[0]) throw notFound();
    res.json(rows[0]);
  }),
);

// Remove from the library, and delete the file from Cloudinary when we uploaded it.
mediaRouter.delete(
  "/items/:id",
  asyncHandler(async (req, res) => {
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) throw notFound();
    const { rows } = await query<{ public_id: string | null; kind: string }>("delete from media where id = $1 returning public_id, kind", [id.data]);
    const row = rows[0];
    if (!row) throw notFound();
    let cloudDeleted = false;
    if (row.public_id && enabled()) {
      const resourceType = row.kind === "image" ? "image" : row.kind === "file" ? "raw" : "video";
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = createHash("sha1").update(`public_id=${row.public_id}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`).digest("hex");
      try {
        const r = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ public_id: row.public_id, timestamp: String(timestamp), api_key: env.CLOUDINARY_API_KEY!, signature }),
        });
        cloudDeleted = r.ok;
      } catch {
        cloudDeleted = false; // the library entry is gone either way
      }
    }
    res.json({ ok: true, cloudDeleted });
  }),
);
