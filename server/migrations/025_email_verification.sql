-- Email verification. Non-blocking: accounts work before verifying, but we track
-- verified status and can prompt/enforce later. Tokens stored as SHA-256 hashes,
-- like password_reset_tokens and refresh_tokens.
alter table users add column if not exists email_verified boolean not null default false;

create table if not exists email_verification_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists email_verification_tokens_hash on email_verification_tokens (token_hash);
create index if not exists email_verification_tokens_user on email_verification_tokens (user_id);
