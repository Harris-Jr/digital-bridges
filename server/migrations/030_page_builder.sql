-- Page builder: every site page is a hero plus an ordered list of blocks
-- (features, steps, text, image and text, call to action, gallery, video, and
-- live sections such as courses, testimonials, FAQs and partners). Editors can
-- add, reorder, hide and edit blocks, and create new pages.
alter table site_pages add column if not exists hero_eyebrow   text not null default '';
alter table site_pages add column if not exists hero_image_url text;
alter table site_pages add column if not exists blocks         jsonb not null default '[]'::jsonb;
alter table site_pages add column if not exists nav_label      text not null default '';
alter table site_pages add column if not exists is_system      boolean not null default false;

-- Built-in pages cannot be deleted (their addresses are fixed).
update site_pages set is_system = true where slug in ('home', 'about', 'trainers', 'privacy', 'terms', 'accessibility');

-- Page photos move from Branding settings onto the pages themselves.
update site_pages p set hero_image_url = s.value #>> '{}'
  from site_settings s
 where s.key = 'about_image_url' and p.slug = 'about' and jsonb_typeof(s.value) = 'string';
update site_pages p set hero_image_url = s.value #>> '{}'
  from site_settings s
 where s.key = 'trainers_image_url' and p.slug = 'trainers' and jsonb_typeof(s.value) = 'string';

-- Home: the current sections, in their current order, as blocks. Existing
-- "why" and "steps" content is carried over. "t" holds the interface
-- translation keys, so Bemba and Nyanja headings keep working until edited.
update site_pages set blocks = jsonb_build_array(
  jsonb_build_object('id', 'home-pathways', 'type', 'pathways', 'data', '{}'::jsonb),
  jsonb_build_object('id', 'home-stats', 'type', 'stats', 'data', '{}'::jsonb),
  jsonb_build_object('id', 'home-why', 'type', 'features', 'data', jsonb_build_object(
    'eyebrow', 'Why this platform',
    'title', 'Made for the way people here use phones',
    'subtitle', 'Short, plain-language lessons that work on any handset, built with communities, not for a classroom far away.',
    'style', 'cards',
    'items', coalesce(body->'why', '[]'::jsonb),
    't', jsonb_build_object('eyebrow', 'home.why.eyebrow', 'title', 'home.why.title', 'subtitle', 'home.why.sub'))),
  jsonb_build_object('id', 'home-courses', 'type', 'courses', 'data', jsonb_build_object(
    'eyebrow', 'Courses', 'title', 'Start With Something Useful', 'count', 4,
    't', jsonb_build_object('eyebrow', 'nav.courses', 'title', 'home.courses.title'))),
  jsonb_build_object('id', 'home-steps', 'type', 'steps', 'data', jsonb_build_object(
    'eyebrow', 'How it works', 'title', 'Three steps to get going',
    'items', coalesce(body->'steps', '[]'::jsonb),
    't', jsonb_build_object('eyebrow', 'home.how.eyebrow', 'title', 'home.how.title'))),
  jsonb_build_object('id', 'home-testimonials', 'type', 'testimonials', 'data', '{}'::jsonb),
  jsonb_build_object('id', 'home-faqs', 'type', 'faqs', 'data', '{}'::jsonb),
  jsonb_build_object('id', 'home-partners', 'type', 'partners', 'data', '{}'::jsonb),
  jsonb_build_object('id', 'home-cta', 'type', 'cta', 'data', jsonb_build_object(
    'title', 'Start learning today. It is free.',
    'body', 'Make a free account in a minute and pick up on any phone. No fees, ever, for learners and community groups.',
    'primary_label', 'Start Learning', 'primary_href', '/signup',
    'secondary_label', 'Run a workshop', 'secondary_href', '/for-trainers',
    't', jsonb_build_object('title', 'home.cta.title', 'body', 'home.cta.sub', 'primary_label', 'home.hero.cta', 'secondary_label', 'home.runworkshop'))),
  jsonb_build_object('id', 'home-strip', 'type', 'feature_strip', 'data', '{}'::jsonb)
)
where slug = 'home' and blocks = '[]'::jsonb;

-- About: mission and audience as shown today, plus the existing "groups" and
-- "approach" content (stored but never shown) as hidden blocks ready to switch on.
update site_pages set
  hero_eyebrow = 'About us',
  blocks = jsonb_build_array(
    jsonb_build_object('id', 'about-mission', 'type', 'text', 'data', jsonb_build_object(
      'title', 'Our mission', 'layout', 'side',
      'body', coalesce(body->>'mission', 'We make digital skills simple, practical and accessible. Our lessons help people stay safe online, connect with others and find new opportunities.'),
      't', jsonb_build_object('title', 'about.mission.title'))),
    jsonb_build_object('id', 'about-groups', 'type', 'features', 'hidden', true, 'data', jsonb_build_object(
      'eyebrow', 'Who it is for', 'title', 'Built for the people who need it most', 'style', 'cards',
      'items', coalesce(body->'groups', '[]'::jsonb))),
    jsonb_build_object('id', 'about-approach', 'type', 'steps', 'hidden', true, 'data', jsonb_build_object(
      'eyebrow', 'How we work', 'title', 'Designed with communities',
      'items', coalesce(body->'approach', '[]'::jsonb))),
    jsonb_build_object('id', 'about-audience', 'type', 'text', 'data', jsonb_build_object(
      'divider', true,
      'body', coalesce(body->>'audience', 'For young people, women, workers and first-time learners.'),
      't', jsonb_build_object('body', 'about.audience')))
  )
where slug = 'about' and blocks = '[]'::jsonb;

-- For Trainers: the features list and closing line.
update site_pages set
  hero_eyebrow = 'For Trainers',
  blocks = jsonb_build_array(
    jsonb_build_object('id', 'trainers-features', 'type', 'features', 'data', jsonb_build_object(
      'title', 'Everything you need to lead a session', 'style', 'plain',
      'items', jsonb_build_array(
        jsonb_build_object('icon', 'Users', 'title', 'Learner groups', 'body', 'Create a group and follow learner progress.', 't', jsonb_build_object('title', 'trainer.feat.groups', 'body', 'trainer.feat.groupsBody')),
        jsonb_build_object('icon', 'FileText', 'title', 'Teaching materials', 'body', 'Download guides and posters for your sessions.', 't', jsonb_build_object('title', 'trainer.feat.materials', 'body', 'trainer.feat.materialsBody')),
        jsonb_build_object('icon', 'CalendarCheck', 'title', 'Workshop planning', 'body', 'Submit workshop requests for team approval.', 't', jsonb_build_object('title', 'trainer.feat.workshops', 'body', 'trainer.feat.workshopsBody')),
        jsonb_build_object('icon', 'BarChart3', 'title', 'Progress overview', 'body', 'See how your community groups are learning.', 't', jsonb_build_object('title', 'trainer.feat.progress', 'body', 'trainer.feat.progressBody'))),
      't', jsonb_build_object('title', 'trainer.feat.title'))),
    jsonb_build_object('id', 'trainers-closing', 'type', 'text', 'data', jsonb_build_object(
      'divider', true, 'align', 'center',
      'body', 'Free tools. Practical lessons. Stronger communities.',
      't', jsonb_build_object('body', 'trainer.closing')))
  )
where slug = 'trainers' and blocks = '[]'::jsonb;
