-- Civic Education pathway — starter content: three courses on the priority
-- areas (public-service navigation, access to information, community
-- participation). Plain language, Zambian context.

-- Courses (all under the civic-education pathway, citizenship category) --------
insert into courses(slug,title,tagline,description,category_id,pathway_id,icon_name,difficulty,estimated_hours,outcomes,is_published,sort_order)
select v.slug,v.title,v.tagline,v.description,c.id,p.id,v.icon,v.diff,v.hrs,v.outcomes::jsonb,true,v.so from (values
('getting-help-from-public-services','Getting Help from Public Services','Where to go, what to bring, and how to follow up.','Learn how to find the right office for a service, what papers to prepare, and what to do when your request takes too long. Practical steps for everyday needs like an NRC, a clinic card or a market stand.','Building2','easy',2,'["Know which office handles which service","Prepare the right documents before you go","Ask clearly and keep a record","Follow up politely when help is delayed","Know who to turn to next if you are stuck"]',10),
('your-right-to-information','Your Right to Information','How to ask public offices for information you need.','Public offices hold information that belongs to the people. Learn what you can ask for, how to write a simple request, and what steps to take if your request is refused.','FileSearch','easy',1.5,'["Understand what information you can ask for","Write a clear, simple request","Keep a copy and a record of your request","Know what to do if you are refused","Follow the right steps to appeal"]',11),
('taking-part-in-your-community','Taking Part in Your Community','Speak up, bring evidence, and help decisions get made.','Decisions about your area are made in meetings you can take part in. Learn how to prepare, how to present a problem with evidence, and how to engage respectfully with officials and councillors.','Users','easy',2,'["Know where community decisions are made","Prepare before a meeting or consultation","Present a problem clearly, with evidence","Engage officials respectfully and constructively","Report a community problem and follow it up"]',12)
) v(slug,title,tagline,description,icon,diff,hrs,outcomes,so)
join categories c on c.slug='citizenship'
join pathways p on p.slug='civic-education';

-- Lessons ---------------------------------------------------------------------
insert into lessons(course_id,slug,title,type,body_richtext,key_points,try_it_action,svg_motif,sort_order)
select c.id,v.slug,v.title,v.type,v.body,v.kp::jsonb,v.tryit,v.motif,v.so from (values

-- Course 1: Getting Help from Public Services
('getting-help-from-public-services','which-office-does-what','Which office does what','read','Different needs are handled by different offices. Knowing where to go first saves you time and money.

## Common places
The local council handles markets, rubbish, trading licences and many community services. A health facility handles clinic cards and health services. The civic registration office handles the National Registration Card (NRC) and births. Your ward councillor can help with local problems and point you to the right office.

## Start with the right door
If you are not sure, ask at the office reception or ask your ward councillor. Going to the right place first means fewer trips.','["The council handles markets, rubbish and trading licences","Health facilities handle clinic cards","Registration offices handle the NRC","Your ward councillor can point you the right way"]','Think of one service you need. Write down which office is most likely to handle it.','community',1),

('getting-help-from-public-services','what-to-bring-and-how-to-ask','What to bring and how to ask','read','Most offices ask for the same few things. Bringing them the first time avoids being turned away.

## Prepare your papers
Carry your NRC. Bring any forms, letters or receipts that relate to your request, and bring copies as well as the originals. If someone is helping you, bring a letter from them.

## Ask clearly
Say what you need in one sentence. Ask for the name of the officer helping you and write it down. Ask how long it will take and what the next step is.','["Carry your NRC and bring copies of papers","Say what you need in one clear sentence","Write down the officer''s name","Ask how long it will take"]','Before your next visit, make a small checklist of the papers you will carry.','circle',2),

('getting-help-from-public-services','when-help-is-delayed','When help is delayed','practice','Sometimes a request takes longer than expected. Staying calm and keeping records helps you follow up well.

## A real situation
You applied for a service two weeks ago and heard nothing. What do you do? Go back, or call, and give your reference or the officer''s name. Ask politely what stage your request is at and when it will be ready.

## Keep a record
Write the date, who you spoke to and what they said each time. If it is still stuck, ask who the supervisor is, or ask your ward councillor to help you follow up.','["Follow up calmly and give your reference","Ask what stage your request is at","Write down each conversation","Ask for a supervisor or your councillor if stuck"]','Make a simple note page: date, person, what they said. Use it next time you follow up.','community',3),

('getting-help-from-public-services','public-services-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',4),

-- Course 2: Your Right to Information
('your-right-to-information','information-you-can-ask-for','Information you can ask for','read','Public offices keep information that belongs to the people. In many cases you have a right to ask for it.

## What this means
You can ask a public office for information such as how a service works, what a project will cost, or the steps in a process. You do not always need to give a reason.

## What to expect
The office should help you or explain how to make a request. Some information is protected, for example personal details of other people, but much of it can be shared.','["Public information belongs to the people","You can ask how a service or project works","You often do not need to give a reason","Some private information is protected"]','Think of one thing about a public service you would like to understand better.','shield',1),

('your-right-to-information','writing-a-simple-request','Writing a simple request','read','A clear request is easier to answer. You do not need big words.

## What to include
Say who you are, what information you want, and how you would like to receive it. Be specific: name the project, office or time period. Keep it short.

## Keep a copy
Write or type your request and keep a copy. If you hand it in, ask for a stamp or a note that it was received. If you send it, keep the message.','["Say who you are and what you want","Be specific about the project or office","Keep a copy of your request","Ask for proof that it was received"]','Draft two sentences asking for one piece of public information you care about.','circle',2),

('your-right-to-information','if-they-say-no','If they say no','practice','Sometimes a request is refused or ignored. There are calm steps you can take.

## Ask for the reason
If you are refused, ask for the reason in writing. A reason helps you know what to do next.

## Follow the next step
Ask the office how to appeal or who to take it to next. Keep your copy and the reason. If you are still stuck, a civil society organisation or a legal aid service may be able to guide you.','["Ask for the reason for a refusal in writing","Ask how to appeal or who to go to next","Keep your copies and the reason","Seek help from a civil society or legal aid service"]','Write down one place or person you could ask for help if a request is refused.','shield',3),

('your-right-to-information','information-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',4),

-- Course 3: Taking Part in Your Community
('taking-part-in-your-community','where-decisions-are-made','Where decisions are made','read','Many decisions about your area are made in meetings that are open to residents.

## Places to take part
Ward development meetings, council meetings and public consultations are where plans and budgets are discussed. Community radio and notice boards often share when these happen.

## Why it matters
When residents take part, decisions reflect real needs. Showing up and speaking is one of the simplest ways to shape your community.','["Ward meetings and consultations are open to residents","Plans and budgets are discussed there","Radio and notice boards share the dates","Taking part helps decisions reflect real needs"]','Find out when the next community or ward meeting in your area is.','community',1),

('taking-part-in-your-community','speak-up-with-evidence','Speak up with evidence','read','A point lands better when it is clear and backed by facts.

## Prepare first
Decide the one thing you want to say. Write it in a sentence or two. Bring evidence: a photo, a date, a number of people affected, or a simple example.

## Be constructive
Speak calmly and respectfully, even when you disagree. Offer a suggestion, not only a complaint. Thank people for listening.','["Decide the one point you want to make","Bring simple evidence: a photo, a date, a number","Stay calm and respectful","Offer a suggestion, not only a complaint"]','Pick one issue and write the single sentence you would say about it.','circle',2),

('taking-part-in-your-community','reporting-a-community-problem','Reporting a community problem','practice','Reporting a problem well makes it more likely to be fixed.

## A real situation
A borehole in your area has been broken for weeks. Who do you tell? Start with your ward councillor or the responsible office. Explain clearly: where it is, how long it has been broken, and how many people it affects.

## Follow it up
Ask what will happen next and when. Keep a note of who you spoke to. If nothing changes, follow up politely and, if needed, raise it at a community meeting.','["Report to your councillor or the responsible office","Say where, how long, and how many are affected","Ask what happens next and when","Follow up and raise it at a meeting if needed"]','Think of one real problem near you. Write who you would tell and what you would say.','community',3),

('taking-part-in-your-community','participation-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',4)

) v(course_slug,slug,title,type,body,kp,tryit,motif,so)
join courses c on c.slug=v.course_slug;

-- Quiz questions --------------------------------------------------------------
insert into quiz_questions(lesson_id,question,options,correct_index,explanation,sort_order)
select l.id,v.q,v.o::jsonb,v.ci,v.ex,v.so from (values
('public-services-quiz','Who usually handles markets, rubbish and trading licences?','["The health facility","The local council","The school","The police"]',1,'The local council handles markets, rubbish, trading licences and many community services.',1),
('public-services-quiz','Your request has taken too long. What is a good first step?','["Give up","Follow up calmly and give your reference","Complain loudly to everyone","Start again from the beginning"]',1,'Follow up calmly, give your reference or the officer''s name, and ask what stage it is at.',2),
('information-quiz','When you ask a public office for information, you usually:','["Must pay a large fee","Do not always need to give a reason","Need a lawyer","Cannot ask at all"]',1,'You often do not need to give a reason. Much public information can be shared on request.',1),
('information-quiz','If your request for information is refused, a good step is to:','["Forget about it","Ask for the reason and how to appeal","Argue angrily","Pay someone to force it"]',1,'Ask for the reason in writing and how to appeal or who to take it to next.',2),
('participation-quiz','Where are many decisions about your area discussed?','["Only in private","Ward meetings and public consultations","Only on television","Nowhere you can attend"]',1,'Ward meetings, council meetings and public consultations are open to residents.',1),
('participation-quiz','What makes a point land well at a meeting?','["Shouting the loudest","Being clear and bringing evidence","Speaking for a long time","Blaming one person"]',1,'A clear point backed by simple evidence, offered respectfully, lands best.',2)
) v(lslug,q,o,ci,ex,so)
join lessons l on l.slug=v.lslug;
