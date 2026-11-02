// Unauthenticated public form submissions (contact, newsletter, anonymous consent).
import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { asyncHandler, badRequest, notFound } from "../lib/http.js";
import { rateLimit } from "../lib/ratelimit.js";

export const publicRouter = Router();

// Unauthenticated write endpoints: cap submissions per IP to curb spam/abuse.
const contactLimit = rateLimit({ name: "public-contact", max: 5, windowMs: 60 * 60_000, message: "Too many messages from this connection. Please try again later." });
const newsletterLimit = rateLimit({ name: "public-newsletter", max: 5, windowMs: 60 * 60_000, message: "Too many requests. Please try again later." });

publicRouter.post(
  "/contact",
  contactLimit,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().trim().min(2).max(100),
      email: z.string().trim().email().max(255),
      message: z.string().trim().min(10).max(2000),
    });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Please check the form and try again.");
    const { name, email, message } = input.data;
    await query(
      "insert into contact_messages (name, email, message) values ($1, $2, $3)",
      [name, email, message],
    );
    res.status(201).json({ ok: true });
  }),
);

publicRouter.post(
  "/newsletter",
  newsletterLimit,
  asyncHandler(async (req, res) => {
    const schema = z.object({ email: z.string().trim().email().max(255) });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("A valid email is required.");
    await query("insert into newsletter_subscribers (email) values ($1)", [input.data.email]);
    res.status(201).json({ ok: true });
  }),
);

// Anonymous (pre-login) consent capture, e.g. cookie banner before sign-in.
publicRouter.post(
  "/consent",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      type: z.enum(["cookies", "terms", "age", "newsletter", "data_export", "data_deletion", "policy_ack"]),
      version: z.string().default("1.0"),
      granted: z.boolean().default(true),
      details: z.record(z.string(), z.unknown()).default({}),
    });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Invalid consent payload.");
    const { type, version, granted, details } = input.data;
    await query(
      "insert into consent_records (user_id, type, version, granted, details) values (null, $1, $2, $3, $4)",
      [type, version, granted, details],
    );
    res.status(201).json({ ok: true });
  }),
);

// ---------------------------------------------------------------------------
// Public credential verification. Only credentials their owner has chosen to
// share are visible; anything else is a plain 404 (no hint that it exists).
// Ids are random UUIDs, never user ids. Only the name and the achievement are
// returned: no email, phone, district or progress.
// ---------------------------------------------------------------------------
const verifyLimit = rateLimit({ name: "public-verify", max: 120, windowMs: 60_000, message: "Too many requests. Please try again shortly." });
const uuid = z.string().uuid();

publicRouter.get(
  "/verify/certificate/:id",
  verifyLimit,
  asyncHandler(async (req, res) => {
    const id = uuid.safeParse(req.params.id);
    if (!id.success) throw notFound("Credential not found");
    const { rows } = await query<{ id: string; issued_at: string; course_title: string; course_slug: string; full_name: string; outcomes: unknown }>(
      `select ct.id, ct.issued_at, c.title as course_title, c.slug as course_slug, c.outcomes,
              coalesce(p.full_name, '') as full_name
         from certificates ct
         join courses c on c.id = ct.course_id
         left join profiles p on p.id = ct.user_id
        where ct.id = $1 and ct.is_public`,
      [id.data],
    );
    const r = rows[0];
    if (!r) throw notFound("Credential not found");
    res.json({
      kind: "certificate",
      learner_name: r.full_name || "A Civic Wise learner",
      title: r.course_title,
      course_slug: r.course_slug,
      outcomes: Array.isArray(r.outcomes) ? r.outcomes : [],
      issued_at: r.issued_at,
      serial: `DB-${r.id.slice(0, 8).toUpperCase()}`,
    });
  }),
);

publicRouter.get(
  "/verify/badge/:shareId",
  verifyLimit,
  asyncHandler(async (req, res) => {
    const id = uuid.safeParse(req.params.shareId);
    if (!id.success) throw notFound("Credential not found");
    const { rows } = await query<{ share_id: string; earned_at: string; name: string; description: string; icon_name: string; full_name: string }>(
      `select ub.share_id, ub.earned_at, b.name, b.description, b.icon_name,
              coalesce(p.full_name, '') as full_name
         from user_badges ub
         join badges b on b.id = ub.badge_id
         left join profiles p on p.id = ub.user_id
        where ub.share_id = $1 and ub.is_public`,
      [id.data],
    );
    const r = rows[0];
    if (!r) throw notFound("Credential not found");
    res.json({
      kind: "badge",
      learner_name: r.full_name || "A Civic Wise learner",
      title: r.name,
      description: r.description,
      icon_name: r.icon_name,
      issued_at: r.earned_at,
      serial: `CW-B-${r.share_id.slice(0, 8).toUpperCase()}`,
    });
  }),
);
