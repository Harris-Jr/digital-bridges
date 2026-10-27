-- Optional short video per lesson (stage: civic content). YouTube URL, lazily
-- embedded on the lesson page (low data until the learner taps play).
alter table lessons add column if not exists video_url text;

-- Candidate civic-education videos seeded on each civic course's intro lesson.
-- FIRST-PASS: review each one (topic, length, regional availability) and replace
-- with a Zambia-specific clip where possible from the CMS lesson editor.
update lessons l set video_url = v.url
from (values
  ('your-right-to-information',            'information-you-can-ask-for',   'https://www.youtube.com/watch?v=uQzMZRH56f0'),
  ('taking-part-in-your-community',        'where-decisions-are-made',      'https://www.youtube.com/watch?v=IQhc6s_KPgQ'),
  ('understanding-public-budgets',         'where-public-money-comes-from', 'https://www.youtube.com/watch?v=nTqqTEj1E2Y'),
  ('making-a-complaint',                   'which-office-handles-your-concern', 'https://www.youtube.com/watch?v=rsf7wb66Grs'),
  ('digital-rights-and-responsibilities',  'your-data-and-privacy',         'https://www.youtube.com/watch?v=-ZrqxAB-ABQ')
) as v(course_slug, lesson_slug, url)
where l.slug = v.lesson_slug
  and l.course_id = (select id from courses c where c.slug = v.course_slug);
