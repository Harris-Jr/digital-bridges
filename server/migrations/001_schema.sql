-- Digital Bridges — core schema (vanilla PostgreSQL)
-- Authorization is enforced in the API layer (JWT + role checks), not via RLS.
-- All integrity rules (FK, UNIQUE, CHECK, PK) live here so the database is the
-- last line of defence for correctness.


create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Identity & access
-- ---------------------------------------------------------------------------
create type app_role as enum ('learner', 'trainer', 'editor', 'admin');

create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  created_at    timestamptz not null default now()
);
create index on users (lower(email));

create table profiles (
  id            uuid primary key references users(id) on delete cascade,
  full_name     text not null default '',
  phone         text,
  district      text,
  language_pref text not null default 'en',
  anonymized    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table user_roles (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  role    app_role not null,
  unique (user_id, role)
);
create index on user_roles (user_id);

-- ---------------------------------------------------------------------------
-- Curriculum
-- ---------------------------------------------------------------------------
create table categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  icon_name  text not null default 'Circle',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table courses (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  tagline         text not null default '',
  description     text not null default '',
  category_id     uuid references categories(id) on delete set null,
  icon_name       text not null default 'BookOpen',
  difficulty      text not null default 'easy' check (difficulty in ('start_here','easy','intermediate')),
  estimated_hours numeric not null default 1,
  outcomes        jsonb not null default '[]'::jsonb,
  image_url       text,
  is_published    boolean not null default false,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index on courses (is_published, sort_order);

create table lessons (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses(id) on delete cascade,
  slug          text not null,
  title         text not null,
  type          text not null default 'read' check (type in ('read','quiz','practice')),
  body_richtext text not null default '',
  key_points    jsonb not null default '[]'::jsonb,
  try_it_action text,
  svg_motif     text,
  image_url     text,
  sort_order    int not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (course_id, slug)
);
create index on lessons (course_id, sort_order);

create table quiz_questions (
  id            uuid primary key default gen_random_uuid(),
  lesson_id     uuid not null references lessons(id) on delete cascade,
  question      text not null,
  options       jsonb not null default '[]'::jsonb,
  correct_index int not null default 0,
  explanation   text not null default '',
  sort_order    int not null default 0
);
create index on quiz_questions (lesson_id, sort_order);

-- ---------------------------------------------------------------------------
-- Learner progress & achievements
-- ---------------------------------------------------------------------------
create table lesson_progress (
  user_id      uuid not null references users(id) on delete cascade,
  lesson_id    uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)      -- natural key → idempotent sync upserts
);
create index on lesson_progress (user_id);

create table badges (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text not null default '',
  criteria    jsonb not null default '{}'::jsonb,
  icon_name   text not null default 'Award'
);

create table user_badges (
  user_id   uuid not null references users(id) on delete cascade,
  badge_id  uuid not null references badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- Quiz attempts — recorded transactionally with progress (see api/progress).
-- id is client-generated so an offline replay of the same attempt is idempotent.
create table quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  lesson_id    uuid not null references lessons(id) on delete cascade,
  score        int not null default 0,
  total        int not null default 0,
  submitted_at timestamptz not null default now()
);
create index on quiz_attempts (user_id, lesson_id);

-- ---------------------------------------------------------------------------
-- Community / facilitators
-- ---------------------------------------------------------------------------
create table community_groups (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  location       text not null,
  learners       int not null default 0,
  avg_completion int not null default 0,
  trainer_id     uuid references users(id) on delete set null,
  created_at     timestamptz not null default now()
);

create table workshop_requests (
  id                uuid primary key default gen_random_uuid(),
  trainer_id        uuid not null references users(id) on delete cascade,
  topic             text not null,
  date              date not null,
  venue             text not null,
  expected_learners int not null default 10,
  status            text not null default 'pending' check (status in ('pending','approved','declined')),
  created_at        timestamptz not null default now()
);
create index on workshop_requests (trainer_id);

-- ---------------------------------------------------------------------------
-- Site content / marketing / compliance
-- ---------------------------------------------------------------------------
create table site_pages (
  slug         text primary key,
  hero_title   text not null default '',
  hero_subline text not null default '',
  body         jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  updated_at   timestamptz not null default now()
);

create table stats (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  value      text not null,
  sort_order int not null default 0
);

create table testimonials (
  id            uuid primary key default gen_random_uuid(),
  quote         text not null,
  name          text not null,
  role_location text not null default '',
  is_published  boolean not null default false,
  created_at    timestamptz not null default now()
);

create table partners (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text not null default 'cs' check (category in ('school','radio','cs','ict_hub','gov','telecom')),
  is_published boolean not null default false,
  created_at   timestamptz not null default now()
);

create table faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  answer       text not null,
  sort_order   int not null default 0,
  is_published boolean not null default false
);

create table resources (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  type         text not null default 'pdf' check (type in ('pdf','doc','image')),
  file_url     text not null default '',
  audience     text not null default 'trainer' check (audience in ('trainer','learner')),
  is_published boolean not null default false,
  created_at   timestamptz not null default now()
);

create table i18n_strings (
  key   text not null,
  lang  text not null check (lang in ('en','bem','nya')),
  value text not null,
  primary key (key, lang)
);

create table site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table consent_records (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete set null,
  type       text not null check (type in ('cookies','terms','age','newsletter','data_export','data_deletion','policy_ack')),
  version    text not null default '1.0',
  granted    boolean not null default true,
  details    jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  ip_hash    text
);
create index on consent_records (user_id);

create table contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now(),
  read       boolean not null default false
);

create table newsletter_subscribers (
  id             uuid primary key default gen_random_uuid(),
  email          text not null,
  consented_at   timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create table data_requests (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  type       text not null check (type in ('export','delete')),
  status     text not null default 'open' check (status in ('open','done')),
  created_at timestamptz not null default now()
);

