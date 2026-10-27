-- Translations for the mega menu and lesson video strings (stage: navbar + civic content).
insert into i18n_strings(key,lang,value) values
('mega.browse','bem','Ceba'),
('mega.browse','nya','Yang''anani'),
('mega.open','bem','Isula isambililo'),
('mega.open','nya','Tsegulani phunziro'),
('lesson.watch','bem','Tamba ividyo'),
('lesson.watch','nya','Onani kanema'),
('lesson.video','bem','Ividyo lya sambililo'),
('lesson.video','nya','Kanema ka phunziro'),
('lesson.watchData','bem','Kofya ukutamba (kubomfya data)'),
('lesson.watchData','nya','Dinani kuti muyambe (kugwiritsa data)')
on conflict (key,lang) do update set value = excluded.value;
