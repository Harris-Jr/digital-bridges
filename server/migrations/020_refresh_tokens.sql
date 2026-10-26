-- Refresh tokens for short-lived access tokens (stage: full JWT auth).
-- Only the SHA-256 hash of each refresh token is stored, never the raw value
-- (same approach as password_reset_tokens). Tokens are revocable (logout, a
-- password change) and expire; rotation issues a new one and revokes the old.
create table if not exists refresh_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists refresh_tokens_user on refresh_tokens (user_id);
create index if not exists refresh_tokens_active on refresh_tokens (token_hash) where revoked_at is null;
