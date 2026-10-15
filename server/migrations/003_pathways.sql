-- Learning pathways: a top-level grouping above courses, so the platform can
-- offer distinct tracks (Digital Skills, Civic Education, …) from one home-page
-- selector while sharing accounts, courses, offline behaviour and the CMS.

create table pathways (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  subtitle    text not null default '',
  description text not null default '',
  icon_name   text not null default 'Compass',
  accent      text not null default 'primary' check (accent in ('primary', 'accent')),
  sort_order  int not null default 0,
  is_published boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table courses add column pathway_id uuid references pathways(id) on delete set null;
create index on courses (pathway_id);

insert into pathways (slug, title, subtitle, description, icon_name, accent, sort_order) values
('digital-skills', 'Digital Skills', 'Use your phone with confidence',
 'Phones, mobile money, online safety, messaging and finding work — the everyday skills to take part in the digital world.',
 'Smartphone', 'primary', 1),
('civic-education', 'Civic Education', 'Know your rights, take part',
 'How public services work, your rights, getting information, and taking part in decisions that affect your community.',
 'Landmark', 'accent', 2);

-- Existing courses all belong to the Digital Skills pathway.
update courses set pathway_id = (select id from pathways where slug = 'digital-skills') where pathway_id is null;
