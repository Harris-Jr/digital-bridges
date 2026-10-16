-- Course-completion certificates: one per learner per course, issued when every
-- published lesson in that course is complete.
create table certificates (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  course_id  uuid not null references courses(id) on delete cascade,
  issued_at  timestamptz not null default now(),
  unique (user_id, course_id)
);
create index on certificates (user_id);
