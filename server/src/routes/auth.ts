import crypto from "node:crypto";
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { hashPassword, verifyPassword } from "../lib/auth.js";
import { issueSession, rotateRefreshToken, revokeRefreshToken, revokeAllForUser } from "../lib/tokens.js";
import { asyncHandler, badRequest, conflict, unauthorized } from "../lib/http.js";
import { requireAuth, type Role } from "../middleware.js";
import { sendMail, welcomeEmail, passwordResetEmail, verifyEmailEmail } from "../lib/mailer.js";
import { rateLimit } from "../lib/ratelimit.js";
import { env } from "../env.js";

export const authRouter = Router();

// Abuse protection on credential endpoints (per client IP). The limiter is
// in-memory per process; front the API with a single process or a shared store
// (see lib/ratelimit.ts) so these hold.
const FIFTEEN_MIN = 15 * 60_000;
const ONE_HOUR = 60 * 60_000;
const loginLimit = rateLimit({ name: "auth-login", max: 10, windowMs: FIFTEEN_MIN, message: "Too many sign-in attempts. Please wait a few minutes and try again." });
const signupLimit = rateLimit({ name: "auth-signup", max: 6, windowMs: ONE_HOUR, message: "Too many sign-ups from this connection. Please try again later." });
const forgotLimit = rateLimit({ name: "auth-forgot", max: 5, windowMs: ONE_HOUR, message: "Too many reset requests. Please wait a while and try again." });
const resetLimit = rateLimit({ name: "auth-reset", max: 10, windowMs: FIFTEEN_MIN, message: "Too many attempts. Please request a new reset link." });
const refreshLimit = rateLimit({ name: "auth-refresh", max: 60, windowMs: FIFTEEN_MIN, message: "Too many requests. Please slow down." });

// The refresh token lives in an HttpOnly cookie so JavaScript (and therefore any
// XSS) cannot read it. Scoped to the auth path so it is only sent where needed.
// The short-lived access token is still returned in the body for the Authorization header.
const REFRESH_COOKIE = "db_refresh";
const REFRESH_COOKIE_PATH = "/api/auth";
function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}
function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
}
function readRefreshCookie(req: Request): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    if (part.slice(0, i).trim() === REFRESH_COOKIE) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

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

// Issue a one-time email-verification token and send the confirmation email.
async function sendVerificationEmail(userId: string, email: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await query(
    "insert into email_verification_tokens (user_id, token_hash, expires_at) values ($1, $2, $3)",
    [userId, tokenHash, expires],
  );
  const url = `${env.APP_URL.replace(/\/$/, "")}/verify-email?token=${token}`;
  const mail = verifyEmailEmail(url);
  void sendMail({ to: email, subject: mail.subject, html: mail.html });
}

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(200),
  full_name: z.string().trim().max(100).default(""),
  district: z.string().trim().max(60).optional(),
});

authRouter.post(
  "/signup",
  signupLimit,
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

    const { accessToken, refreshToken } = await issueSession(user.id, user.email);
    const { profile, roles } = await profileAndRoles(user.id);
    setRefreshCookie(res, refreshToken);

    // Fire-and-forget emails, never block or fail signup.
    const welcome = welcomeEmail(full_name ?? "");
    void sendMail({ to: user.email, subject: welcome.subject, html: welcome.html });
    void sendVerificationEmail(user.id, user.email);

    res.status(201).json({ accessToken, user: { ...user, email_verified: false }, profile, roles });
  }),
);

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

authRouter.post(
  "/login",
  loginLimit,
  asyncHandler(async (req, res) => {
    const input = loginSchema.safeParse(req.body);
    if (!input.success) throw badRequest("Please enter your email and password.");
    const { email, password } = input.data;

    const { rows } = await query<{ id: string; email: string; password_hash: string; email_verified: boolean }>(
      "select id, email, password_hash, email_verified from users where email = $1",
      [email],
    );
    const found = rows[0];
    if (!found || !(await verifyPassword(password, found.password_hash))) {
      throw unauthorized("That email and password do not match.");
    }

    const { accessToken, refreshToken } = await issueSession(found.id, found.email);
    const { profile, roles } = await profileAndRoles(found.id);
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken, user: { id: found.id, email: found.email, email_verified: found.email_verified }, profile, roles });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id, email } = req.auth!;
    const { profile, roles } = await profileAndRoles(id);
    const { rows } = await query<{ email_verified: boolean }>("select email_verified from users where id = $1", [id]);
    res.json({ user: { id, email, email_verified: rows[0]?.email_verified ?? false }, profile, roles });
  }),
);

// Confirm an email address with the token from the verification email.
authRouter.post(
  "/verify-email",
  resetLimit,
  asyncHandler(async (req, res) => {
    const schema = z.object({ token: z.string().min(10) });
    const input = schema.safeParse(req.body);
    if (!input.success) throw badRequest("This confirmation link is invalid.");
    const tokenHash = crypto.createHash("sha256").update(input.data.token).digest("hex");
    const { rows } = await query<{ id: string; user_id: string; expires_at: string; used_at: string | null }>(
      "select id, user_id, expires_at, used_at from email_verification_tokens where token_hash = $1",
      [tokenHash],
    );
    const row = rows[0];
    if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
      throw badRequest("This confirmation link is invalid or has expired. Please request a new one.");
    }
    await withTransaction(async (client) => {
      await client.query("update users set email_verified = true where id = $1", [row.user_id]);
      await client.query("update email_verification_tokens set used_at = now() where user_id = $1 and used_at is null", [row.user_id]);
    });
    res.json({ ok: true });
  }),
);

// Resend the verification email to the signed-in user (if still unverified).
authRouter.post(
  "/resend-verification",
  requireAuth,
  forgotLimit,
  asyncHandler(async (req, res) => {
    const { rows } = await query<{ email: string; email_verified: boolean }>("select email, email_verified from users where id = $1", [req.auth!.id]);
    const u = rows[0];
    if (u && !u.email_verified) await sendVerificationEmail(req.auth!.id, u.email);
    res.json({ ok: true });
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
    // Atomic: change the password and revoke all refresh tokens together, so a
    // password change signs the account out everywhere.
    await withTransaction(async (client) => {
      await client.query("update users set password_hash = $1 where id = $2", [hash, req.auth!.id]);
      await revokeAllForUser(req.auth!.id, (t, p) => client.query(t, p as unknown[]));
    });
    res.json({ ok: true });
  }),
);

// Exchange a refresh token for a new access token (and a rotated refresh token).
// Exchange the refresh-token cookie for a new access token, rotating the cookie.
authRouter.post(
  "/refresh",
  refreshLimit,
  asyncHandler(async (req, res) => {
    const raw = readRefreshCookie(req);
    if (!raw) throw unauthorized("Your session has ended. Please sign in again.");
    const tokens = await rotateRefreshToken(raw);
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ accessToken: tokens.accessToken });
  }),
);

// Logout: revoke the refresh token and clear its cookie. Always 204, even for an
// unknown/absent token, so it never reveals whether a token was valid.
authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const raw = readRefreshCookie(req);
    if (raw) await revokeRefreshToken(raw);
    clearRefreshCookie(res);
    res.status(204).end();
  }),
);

// Request a password reset link by email. Always returns 200 so the response
// never reveals whether an email is registered.
authRouter.post(
  "/forgot-password",
  forgotLimit,
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
  resetLimit,
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
      // Sign the account out everywhere after a reset.
      await revokeAllForUser(row.user_id, (t, p) => client.query(t, p as unknown[]));
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
