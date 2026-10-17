-- Per-field content translation overlay (stage 21).
-- One row per (entity, language, field). `value` is jsonb so it holds both
-- plain strings (stored as a JSON string) and arrays (outcomes, key_points,
-- options, feedback). The English row in the base table is the source of
-- truth; a missing translation row simply falls back to English at read time.
create table if not exists content_translations (
  entity_type text not null check (entity_type in ('course','lesson','quiz_question','scenario_step','category','pathway')),
  entity_id   uuid not null,
  lang        text not null,
  field       text not null,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  primary key (entity_type, entity_id, lang, field)
);
create index if not exists content_translations_lookup on content_translations (entity_type, lang, entity_id);
