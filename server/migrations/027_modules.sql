-- Course structure: course > modules > lessons (the NetAcad / LearnDash model).
-- Each module groups 4 to 6 short lessons and usually ends with a check quiz.
create table if not exists modules (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references courses(id) on delete cascade,
  title        text not null,
  summary      text not null default '',
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists modules_course_idx on modules (course_id, sort_order);

alter table lessons add column if not exists module_id uuid references modules(id) on delete set null;
alter table lessons add column if not exists est_minutes int not null default 5;
-- The admin update handler stamps updated_at on lessons; the column was missing,
-- so every lesson edit in the CMS failed with a server error.
alter table lessons add column if not exists updated_at timestamptz not null default now();
create index if not exists lessons_module_idx on lessons (module_id, sort_order);

-- Pass mark (percent) for a course's quizzes and final check.
alter table courses add column if not exists pass_mark int not null default 70;

-- Backfill: every existing course gets one module holding its current lessons,
-- so nothing changes for learners until an editor restructures the course.
insert into modules (course_id, title, sort_order)
select c.id, 'Module 1', 0
  from courses c
 where not exists (select 1 from modules m where m.course_id = c.id);

update lessons l
   set module_id = m.id
  from modules m
 where m.course_id = l.course_id and l.module_id is null;
