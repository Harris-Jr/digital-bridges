import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { hashPassword, signToken, verifyPassword } from "../lib/auth.js";
import { asyncHandler, badRequest, conflict, unauthorized } from "../lib/http.js";
import { requireAuth, type Role } from "../middleware.js";
import { sendMail, welcomeEmail, passwordResetEmail } from "../lib/mailer.js";
import { env } from "../env.js";

export const authRouter = Router();

type ProfileRow = {
  id: string;
  full_name: string;
  phone: string | null;
  district: string | null;
  language_pref: string;
};

async function profileAndRoles(userId: string): Promise<{ profile: ProfileRow | null; roles: Role[] }> {
  const [{ rows: p }, { rows: r }] = await Promise.all([
    query<ProfileRow>(
      "select id, full_name, phone, district, language_pref from profiles where id = $1",
      [userId],
    ),
    query<{ role: Role }>("select role from user_roles where user_id = $1", [userId]),
  ]);
  return { profile: p[0] ?? null, roles: r.map((x) => x.role) };
}

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(200),
  full_name: z.string().trim().max(100).default(""),
  district: z.string().trim().max(60).optional(),
});

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const input = signupSchema.safeParse(req.body);
    if (!input.success) throw badRequest("Please check the details you entered.");
    const { email, password, full_name, district } = input.data;

    const exists = await query("select 1 from users where email = $1", [email]);
    if (exists.rowCount) throw conflict("There is already an account with this email.");

    const password_hash = await hashPassword(password);

    const user = await withTransaction(async (client) => {
      const { rows } = await client.query<{ id: string; email: string }>(
        "insert into users (email, password_hash) values ($1, $2) returning id, email",
        [email, password_hash],
      );
      const u = rows[0]!;
      await client.query(
        "insert into profiles (id, full_name, district) values ($1, $2, $3)",
        [u.id, full_name, district ?? null],
      );
      return u;
    });

    const token = signToken({ sub: user.id, email: user.email });
    const { profile, roles } = await profileAndRoles(user.id);

    // Fire-and-forget welcome email — never blocks or fails signup.
    const welcome = welcomeEmail(full_name ?? "");
    void sendMail({ to: user.email, subject: welcome.subject, html: welcome.html });

    res.status(201).json({ token, user, profile, roles });
  }),
);

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.safeParse(req.body);
    if (!input.success) throw badRequest("Please enter your email and password.");
    const { email, password } = input.data;

    const { rows } = await query<{ id: string; email: string; password_hash: string }>(
      "select id, email, password_hash from users where email = $1",
      [email],
    );
    const found = rows[0];
    if (!found || !(await verifyPassword(password, found.password_hash))) {
      throw unauthorized("That email and password do not match.");
    }

    const token = signToken({ sub: found.id, email: found.email });
    const { profile, roles } = await profileAndRoles(found.id);
    res.json({ token, user: { id: found.id, email: found.email }, profile, roles });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id, email } = req.auth!;
    const { profile, roles } = await profileAndRoles(id);
    res.json({ user: { id, email }, profile, roles });
  }),
);

authRouter.patch(
  "/password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const schema = z.object({ password: z.string().min(8).max(200) });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Use at least 8 characters.");
    const hash = await hashPassword(input.data.password);
    await query("update users set password_hash = $1 where id = $2", [hash, req.auth!.id]);
    res.json({ ok: true });
  }),
);

// Request a password reset link by email. Always returns 200 so the response
// never reveals whether an email is registered.
authRouter.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const schema = z.object({ email: z.string().trim().toLowerCase().email() });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Please enter a valid email address.");
    const { rows } = await query<{ id: string }>("select id from users where lower(email) = $1", [input.data.email]);
    const user = rows[0];
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await query(
        "insert into password_reset_tokens (user_id, token_hash, expires_at) values ($1, $2, $3)",
        [user.id, tokenHash, expires],
      );
      const url = `${env.APP_URL.replace(/\/$/, "")}/reset-password?token=${token}`;
      const mail = passwordResetEmail(url);
      void sendMail({ to: input.data.email, subject: mail.subject, html: mail.html });
    }
    res.json({ ok: true });
  }),
);

// Complete a password reset with the emailed token.
authRouter.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const schema = z.object({ token: z.string().min(10), password: z.string().min(8).max(200) });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("Please choose a new password of at least 8 characters.");
    const tokenHash = crypto.createHash("sha256").update(input.data.token).digest("hex");
    const { rows } = await query<{ id: string; user_id: string; expires_at: string; used_at: string | null }>(
      "select id, user_id, expires_at, used_at from password_reset_tokens where token_hash = $1",
      [tokenHash],
    );
    const row = rows[0];
    if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
      throw badRequest("This reset link is invalid or has expired. Please request a new one.");
    }
    const hash = await hashPassword(input.data.password);
    await withTransaction(async (client) => {
      await client.query("update users set password_hash = $1 where id = $2", [hash, row.user_id]);
      // Mark this token used and invalidate any other outstanding ones.
      await client.query("update password_reset_tokens set used_at = now() where user_id = $1 and used_at is null", [row.user_id]);
    });
    res.json({ ok: true });
  }),
);

// Admin is provisioned server-side via `npm run set-admin -- <email>`, never
// self-claimed through the API. (See server/src/scripts/set-admin.ts.)

authRouter.post(
  "/request-trainer",
  requireAuth,
  asyncHandler(async (req, res) => {
    await query(
      "insert into user_roles (user_id, role) values ($1, 'trainer') on conflict do nothing",
      [req.auth!.id],
    );
    res.json({ ok: true });
  }),
);
