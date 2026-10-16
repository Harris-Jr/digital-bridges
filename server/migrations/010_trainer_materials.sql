-- Facilitator materials (civic feature 10): printable discussion and activity
-- guides, served as static files from the app's /materials folder. Seeded as
-- published trainer resources so they appear in the "Teaching materials" list.
-- The runner wraps this file in a transaction, so no begin/commit here.
insert into resources (title, type, file_url, audience, is_published) values
  ('Civic Education — Facilitator Discussion Guide', 'doc', '/materials/civic-discussion-guide.html', 'trainer', true),
  ('Running a Civic Workshop — Activity Guide', 'doc', '/materials/civic-workshop-activity-guide.html', 'trainer', true)
on conflict do nothing;
