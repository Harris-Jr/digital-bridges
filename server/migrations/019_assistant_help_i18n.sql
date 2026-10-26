-- New help-link label shown when the AI assistant is disabled (stage: public chatbot).
insert into i18n_strings(key,lang,value) values
('assistant.help','bem','Fwaya ubwafwilisho'),
('assistant.help','nya','Pezani thandizo')
on conflict (key,lang) do update set value = excluded.value;
