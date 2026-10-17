-- Password reset tokens. We store only the SHA-256 hash of the token; the raw
-- token is emailed to the user and never persisted. Tokens are single-use and
-- expire after an hour. The runner wraps this file in a transaction.
create table password_reset_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);
create index on password_reset_tokens (token_hash);
create index on password_reset_tokens (user_id);
