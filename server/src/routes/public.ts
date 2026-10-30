// Unauthenticated public form submissions (contact, newsletter, anonymous consent).
import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { asyncHandler, badRequest } from "../lib/http.js";
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
