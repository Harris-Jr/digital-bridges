// Media uploads via Cloudinary signed direct upload. The browser uploads the
// file straight to Cloudinary (keeping large files off this server); we only
// hand out a short-lived signature. When Cloudinary env vars are unset, uploads
// are reported as disabled and the admin falls back to pasting a URL.
import { Router } from "express";
import { createHash } from "node:crypto";
import { env } from "../env.js";
import { asyncHandler, HttpError } from "../lib/http.js";
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
