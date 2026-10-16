-- Facilitator cohorts: real membership, sessions and attendance.
-- Builds on the existing community_groups table (which already carries a
-- trainer_id owner and location). A short join_code lets learners self-enroll;
-- facilitators can also add members by email. The migration runner wraps this
-- file in its own transaction, so no begin/commit here.

-- A learner-facing join code and a short description for each cohort/group.
alter table community_groups add column if not exists join_code  text unique;
alter table community_groups add column if not exists description text not null default '';

-- Who belongs to a cohort.
create table cohort_members (
  id        uuid primary key default gen_random_uuid(),
  group_id  uuid not null references community_groups(id) on delete cascade,
  user_id   uuid not null references users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);
create index on cohort_members (group_id);
create index on cohort_members (user_id);

-- A workshop/meeting a cohort holds on a given day.
create table cohort_sessions (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references community_groups(id) on delete cascade,
  title        text not null,
  session_date date not null,
  created_at   timestamptz not null default now()
);
create index on cohort_sessions (group_id);

-- Per-learner attendance for a session.
create table attendance (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references cohort_sessions(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  present    boolean not null default true,
  unique (session_id, user_id)
);
create index on attendance (session_id);
