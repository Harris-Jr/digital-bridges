// Refresh-token storage and rotation. Access tokens are short-lived JWTs; the
// refresh token is a long-lived opaque random string, stored only as a SHA-256
// hash, revocable and expiring. Rotation (revoke old + issue new) runs in a
// single transaction so a refresh can never leave two valid tokens or none.
import crypto from "node:crypto";
import { query, withTransaction } from "../db.js";
import { signAccessToken } from "./auth.js";
import { env } from "../env.js";
import { HttpError } from "./http.js";

// A minimal query runner satisfied by both the pool helper and a tx client.
type Exec = (text: string, params: unknown[]) => Promise<unknown>;
const pool: Exec = (text, params) => query(text, params as unknown[]);

function rawToken(): string {
  return crypto.randomBytes(48).toString("hex");
}
function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
function refreshExpiry(): Date {
  return new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

/** Insert a new refresh token row and return the raw token (shown once). */
async function insertRefreshToken(userId: string, exec: Exec): Promise<string> {
  const raw = rawToken();
  await exec(
    "insert into refresh_tokens (user_id, token_hash, expires_at) values ($1, $2, $3)",
    [userId, hashToken(raw), refreshExpiry()],
  );
  return raw;
}

export type SessionTokens = { accessToken: string; refreshToken: string };

/** Issue a fresh access + refresh token pair for a signed-in user. */
export async function issueSession(userId: string, email: string): Promise<SessionTokens> {
  const refreshToken = await insertRefreshToken(userId, pool);
  return { accessToken: signAccessToken({ sub: userId, email }), refreshToken };
}

/**
 * Exchange a valid refresh token for a new access token, rotating the refresh
 * token. Atomic: the old token is revoked and the new one inserted in one
 * transaction. Throws 401/403 when the token is missing, unknown, revoked, or
 * expired. If an already-revoked token is reused, every token for that user is
 * revoked defensively (likely theft).
 */
export async function rotateRefreshToken(raw: string): Promise<SessionTokens> {
  const tokenHash = hashToken(raw);
  // The rotation itself is one transaction. The reuse case is decided here but
  // its defensive family-revoke happens afterwards, so it is not rolled back by
  // the rejection that follows.
  type Outcome =
    | { kind: "ok"; tokens: SessionTokens }
    | { kind: "missing" }
    | { kind: "expired" }
    | { kind: "reuse"; userId: string };

  const outcome = await withTransaction<Outcome>(async (client) => {
    const exec: Exec = (text, params) => client.query(text, params as unknown[]);
    const { rows } = await client.query<{ id: string; user_id: string; email: string; expires_at: string; revoked_at: string | null }>(
      `select rt.id, rt.user_id, u.email, rt.expires_at, rt.revoked_at
         from refresh_tokens rt join users u on u.id = rt.user_id
        where rt.token_hash = $1
        for update`,
      [tokenHash],
    );
    const row = rows[0];
    if (!row) return { kind: "missing" };
    if (row.revoked_at) return { kind: "reuse", userId: row.user_id };
    if (new Date(row.expires_at) < new Date()) return { kind: "expired" };

    await exec("update refresh_tokens set revoked_at = now() where id = $1", [row.id]);
    const refreshToken = await insertRefreshToken(row.user_id, exec);
    return { kind: "ok", tokens: { accessToken: signAccessToken({ sub: row.user_id, email: row.email }), refreshToken } };
  });

  if (outcome.kind === "ok") return outcome.tokens;
  if (outcome.kind === "reuse") {
    // Reuse of a revoked token likely means theft: revoke the whole family.
    await revokeAllForUser(outcome.userId);
    throw new HttpError(403, "Your session is no longer valid. Please sign in again.");
  }
  if (outcome.kind === "expired") throw new HttpError(401, "Your session has expired. Please sign in again.");
  throw new HttpError(401, "Your session has ended. Please sign in again.");
}

/** Revoke a single refresh token (logout). No error if it is unknown already. */
export async function revokeRefreshToken(raw: string): Promise<void> {
  await query("update refresh_tokens set revoked_at = now() where token_hash = $1 and revoked_at is null", [hashToken(raw)]);
}

/** Revoke every active refresh token for a user (password change/reset). Pass a
 *  transaction client's exec to include it in a surrounding transaction. */
export async function revokeAllForUser(userId: string, exec: Exec = pool): Promise<void> {
  await exec("update refresh_tokens set revoked_at = now() where user_id = $1 and revoked_at is null", [userId]);
}
