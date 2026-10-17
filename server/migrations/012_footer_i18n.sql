-- Translations for the new footer copyright/attribution strings.
insert into i18n_strings(key,lang,value) values
('footer.rights','bem','Insambu shonse shasungwa.'),('footer.rights','nya','Ufulu onse asungidwa.'),
('footer.developedby','bem','Yapangilwe na'),('footer.developedby','nya','Yopangidwa ndi'),
('footer.initiative','bem','ubulongoshi'),('footer.initiative','nya','ntchito')
on conflict (key,lang) do update set value = excluded.value;
