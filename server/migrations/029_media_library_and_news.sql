-- Media library: every uploaded or linked file, reusable across the site.
create table if not exists media (
  id         uuid primary key default gen_random_uuid(),
  url        text not null unique,
  public_id  text,                      -- Cloudinary id, used to delete the file
  kind       text not null default 'image' check (kind in ('image', 'video', 'audio', 'file')),
  name       text not null default '',
  alt        text not null default '',  -- description for screen readers
  bytes      int,
  width      int,
  height     int,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists media_kind_idx on media (kind, created_at desc);

-- Existing branding images become library items.
insert into media (url, kind, name)
select value #>> '{}', 'image', key
  from site_settings
 where key in ('brand_logo_url', 'about_image_url', 'trainers_image_url')
   and jsonb_typeof(value) = 'string' and value #>> '{}' <> ''
on conflict (url) do nothing;

-- News / blog posts.
create table if not exists posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text not null default '',
  body         text not null default '',
  cover_url    text,
  cover_alt    text not null default '',
  tags         text[] not null default '{}',
  author_name  text not null default '',
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists posts_published_idx on posts (status, published_at desc);

-- Stamp published_at the first time a post is published, and updated_at always.
create or replace function posts_stamp() returns trigger language plpgsql as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists posts_stamp_trg on posts;
create trigger posts_stamp_trg before insert or update on posts
  for each row execute function posts_stamp();
