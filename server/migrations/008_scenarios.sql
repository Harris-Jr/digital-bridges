-- Interactive scenarios: a lesson of type 'scenario' walks a learner through a
-- real situation (reporting a community problem, attending a consultation) one
-- decision at a time. Each step offers choices; every choice has its own
-- feedback, and one is marked the most advisable. The migration runner wraps
-- this file in its own transaction, so no begin/commit here.

-- Allow 'scenario' as a lesson type. The lessons.type column has a CHECK
-- constraint listing the allowed types, so widen it to include 'scenario'.
alter table lessons drop constraint if exists lessons_type_check;
alter table lessons add constraint lessons_type_check
  check (type in ('read', 'quiz', 'practice', 'scenario'));

create table scenario_steps (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references lessons(id) on delete cascade,
  prompt      text not null,
  options     jsonb not null default '[]'::jsonb,  -- array of choice labels
  feedback    jsonb not null default '[]'::jsonb,  -- feedback per choice, same order
  best_index  int  not null default 0,             -- the most advisable choice
  sort_order  int  not null default 0
);
create index on scenario_steps (lesson_id, sort_order);
