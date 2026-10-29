-- New home hero: three short lines plus a civic+digital intro. Newlines in the
-- title render as separate lines (the h1 uses white-space: pre-line).
update site_pages
set hero_title = E'Learn more.\nDo more.\nTake part.',
    hero_subline = 'Build confidence online and in your community. Learn practical digital skills, understand public services, and discover how to make your voice heard.'
where slug = 'home';
