-- Trainer area: real data only, and proper downloadable materials.

-- 1. Remove the demo "community groups" seeded in 002 (fixed learner counts and
--    completion figures, not linked to any learners). Only rows that are not
--    facilitator cohorts and have no members are removed.
delete from community_groups g
 where g.join_code is null
   and g.trainer_id is null
   and not exists (select 1 from cohort_members m where m.group_id = g.id);

-- 2. Teaching materials: richer metadata and more file types.
alter table resources add column if not exists description text not null default '';
alter table resources add column if not exists sort_order int not null default 0;
alter table resources drop constraint if exists resources_type_check;
alter table resources add constraint resources_type_check
  check (type in ('pdf', 'doc', 'slides', 'image', 'video', 'link'));

-- 3. The two facilitator guides are now real PDFs (no em dashes in titles).
update resources
   set title = 'Civic Education: Facilitator Discussion Guide',
       type = 'pdf',
       file_url = '/materials/civic-discussion-guide.pdf',
       description = 'Warm-up and discussion prompts to run alongside each civic course in a group session.',
       sort_order = 1
 where file_url = '/materials/civic-discussion-guide.html';

update resources
   set title = 'Running a Civic Workshop: Activity Guide',
       type = 'pdf',
       file_url = '/materials/civic-workshop-activity-guide.pdf',
       description = 'Step-by-step plan, timings and group activities for a two-hour community workshop.',
       sort_order = 2
 where file_url = '/materials/civic-workshop-activity-guide.html';

-- 4. Cohorts can follow specific courses (like a NetAcad class tied to a course).
--    Progress is then measured on those courses. Empty = all published courses.
alter table community_groups add column if not exists course_ids uuid[] not null default '{}';
