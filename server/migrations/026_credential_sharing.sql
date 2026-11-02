-- Shareable badges and certificates. Private by default: a credential only gets a
-- public verification page once its owner chooses to share it. share_id is a
-- random, unguessable id used in the public URL (never the user id).
alter table user_badges add column if not exists share_id uuid not null default gen_random_uuid();
alter table user_badges add column if not exists is_public boolean not null default false;
create unique index if not exists user_badges_share_id_key on user_badges (share_id);

alter table certificates add column if not exists is_public boolean not null default false;
