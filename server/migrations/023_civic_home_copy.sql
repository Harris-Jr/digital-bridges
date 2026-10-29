-- Home hero was digital-only; weave civic education into it (rights, taking part
-- in the community) so the home page reflects both halves of the platform.
update site_pages
set hero_title = 'Learn to use your phone and take part in your community, one small step at a time.',
    hero_subline = 'Free, simple lessons for anyone in Zambia. Works on any smartphone, even with little data. Learn about mobile money, staying safe from scams, finding work, your rights and taking part in your community.'
where slug = 'home';
