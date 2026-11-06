-- AI translation suggestions with human review (phase 7).
--
-- Every translation now has a status. AI suggestions arrive as 'draft' and are
-- not shown to learners until a staff member approves them. Translations that
-- already exist were written by people, so they stay 'approved'.
--
-- source_hash is an md5 of the English text the translation was made from. When
-- the English is edited later, the hash no longer matches and the editor shows
-- "English changed" so the translation can be checked.

alter table content_translations
  add column if not exists status text not null default 'approved',
  add column if not exists origin text not null default 'human',
  add column if not exists source_hash text,
  add column if not exists reviewed_by uuid references users(id) on delete set null;

alter table content_translations drop constraint if exists content_translations_status_check;
alter table content_translations add constraint content_translations_status_check check (status in ('approved', 'draft'));
alter table content_translations drop constraint if exists content_translations_origin_check;
alter table content_translations add constraint content_translations_origin_check check (origin in ('human', 'ai'));

-- Module titles and summaries can now be translated too.
alter table content_translations drop constraint if exists content_translations_entity_type_check;
alter table content_translations add constraint content_translations_entity_type_check
  check (entity_type in ('course', 'module', 'lesson', 'quiz_question', 'scenario_step', 'category', 'pathway'));

-- Learners only ever read approved rows; keep that lookup fast.
create index if not exists content_translations_approved
  on content_translations (entity_type, lang, entity_id) where status = 'approved';

-- Agreed words, so the AI (and people) translate the same term the same way.
create table if not exists translation_glossary (
  id          uuid primary key default gen_random_uuid(),
  term        text not null unique,
  bem         text not null default '',
  nya         text not null default '',
  note        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Words that should stay as they are in every language.
insert into translation_glossary (term, bem, nya, note) values
  ('PIN', 'PIN', 'PIN', 'Keep as PIN.'),
  ('SIM', 'SIM', 'SIM', 'Keep as SIM.'),
  ('WhatsApp', 'WhatsApp', 'WhatsApp', 'Brand name, never translate.'),
  ('Airtel Money', 'Airtel Money', 'Airtel Money', 'Brand name, never translate.'),
  ('MTN MoMo', 'MTN MoMo', 'MTN MoMo', 'Brand name, never translate.'),
  ('Zamtel Kwacha', 'Zamtel Kwacha', 'Zamtel Kwacha', 'Brand name, never translate.'),
  ('ZICTA', 'ZICTA', 'ZICTA', 'Name of the regulator, never translate.'),
  ('NRC', 'NRC', 'NRC', 'National Registration Card. Keep the letters.')
on conflict (term) do nothing;
