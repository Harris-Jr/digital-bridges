-- Civic Education expansion — four more courses completing the feature set:
-- how government works, public budgets, making a complaint (with a scenario),
-- and digital citizenship (with a scenario). Plain language, Zambian context.
-- The runner wraps this file in a transaction, so no begin/commit here.

-- Courses ---------------------------------------------------------------------
insert into courses(slug,title,tagline,description,category_id,pathway_id,icon_name,difficulty,estimated_hours,outcomes,is_published,sort_order)
select v.slug,v.title,v.tagline,v.description,c.id,p.id,v.icon,v.diff,v.hrs,v.outcomes::jsonb,true,v.so from (values
('how-government-works','How Government Works','Who makes decisions, and who to go to for what.','A simple guide to how government is organised in Zambia — national, provincial and local — what each part does, and the rights and responsibilities you have as a citizen.','Landmark','start_here',1.5,'["Know the main levels of government and what they do","Understand your basic rights and responsibilities","Know which level handles which kind of concern","Feel more confident dealing with public institutions"]',13),
('understanding-public-budgets','Understanding Public Budgets','Where public money comes from and how it is spent.','Public budgets decide which services get funded. Learn in plain language where the money comes from, how a budget is decided, and how to ask informed questions about spending in your area.','Coins','easy',1.5,'["Understand where public money comes from","Follow the basic steps of how a budget is decided","Know where citizens can give input","Ask clear, informed questions about spending"]',14),
('making-a-complaint','Making a Complaint','Which office to use, how to complain clearly, and where to escalate.','When a service fails, a clear complaint to the right office gets results. Learn who handles what, how to write a strong complaint, where to escalate, and practise with a real scenario.','Scale','easy',2,'["Match a concern to the office that handles it","Write a clear, factual complaint","Know where to escalate if nothing happens","Practise handling a real situation"]',15),
('digital-rights-and-responsibilities','Digital Rights and Responsibilities','Protect your data, be respectful, and check before you share.','Digital citizenship is about using phones and the internet safely and responsibly — protecting your personal data, treating others with respect, and checking information before you pass it on.','Globe','easy',1.5,'["Protect your personal data and privacy","Communicate respectfully online","Check information before you share it","Recognise your responsibilities as a digital citizen"]',16)
) v(slug,title,tagline,description,icon,diff,hrs,outcomes,so)
join categories c on c.slug='citizenship'
join pathways p on p.slug='civic-education';

-- Lessons ---------------------------------------------------------------------
insert into lessons(course_id,slug,title,type,body_richtext,key_points,try_it_action,svg_motif,sort_order)
select c.id,v.slug,v.title,v.type,v.body,v.kp::jsonb,v.tryit,v.motif,v.so from (values

-- Course: How Government Works
('how-government-works','who-makes-the-rules','Who makes the rules','read','Government in Zambia works at different levels, and each one has a different job.

## The main levels
National government makes national laws and runs ministries like health and education. Provincial administration coordinates government work across a province. Local councils run day-to-day services in your area — markets, roads, rubbish, trading licences.

## Why levels matter
Knowing the level helps you find the right door. A pothole is usually a council matter; a national policy is not.','["National government makes laws and runs ministries","Provincial administration coordinates a province","Local councils run everyday local services","Knowing the level helps you find the right office"]','Name one service near you and guess which level handles it.','community',1),

('how-government-works','your-rights-and-responsibilities','Your rights and responsibilities','read','Citizens have rights, and also responsibilities that keep a community working.

## Some of your rights
You have the right to access many public services, to ask public offices for information, and to take part in decisions that affect your area. Rights come with fair treatment and dignity.

## Your responsibilities
Responsibilities include following the law, respecting others, paying fair dues like trading fees, and taking part — voting, attending meetings, and keeping your community clean and safe.','["You have rights to services, information and participation","Rights come with fair treatment","Responsibilities include following the law and paying fair dues","Taking part is both a right and a responsibility"]','Write one right and one responsibility that matter to you.','shield',2),

('how-government-works','who-to-go-to-for-what','Who to go to for what','read','Matching your concern to the right office saves time.

## Everyday matches
Markets, rubbish, drainage and trading licences — the local council. A clinic card or health service — a health facility. An NRC or birth record — the civic registration office. A local problem or to be pointed the right way — your ward councillor.

## When you are unsure
Ask at reception or ask your ward councillor. It is normal to ask — a short question saves a wasted trip.','["Council: markets, rubbish, drainage, licences","Health facility: clinic cards and health services","Registration office: NRC and births","Ward councillor: local problems and directions"]','Pick a concern and write which office you would visit first.','community',3),

('how-government-works','government-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',4),

-- Course: Understanding Public Budgets
('understanding-public-budgets','where-public-money-comes-from','Where public money comes from','read','Public services are paid for with money the public provides.

## The main sources
Most public money comes from taxes (like income tax and VAT) and from fees and levies (like trading fees and licences). Some comes from grants and loans. This pooled money pays for clinics, schools, roads and more.

## Why it matters
Because it is public money, the public has a fair interest in how it is spent and a right to ask informed questions.','["Public money comes mainly from taxes and fees","Levies and licences also contribute","Some comes from grants and loans","Public money means the public can ask how it is spent"]','List two services in your area that are paid for with public money.','circle',1),

('understanding-public-budgets','how-a-budget-is-decided','How a budget is decided','read','A budget is a plan for spending over a year. It follows a cycle.

## The basic cycle
Offices propose what they need. Plans are reviewed and approved by the council or national level. Money is released and spent. At the end, spending is reported and checked.

## Where citizens fit
Public consultations and ward meetings are points where residents can give input before a budget is finalised. Showing up at the right time is how your needs get heard.','["A budget is a yearly spending plan","It follows propose, approve, spend, report","Consultations are where citizens give input","Timing matters — give input before it is finalised"]','Find out when budget or ward planning meetings happen in your area.','community',2),

('understanding-public-budgets','asking-good-questions-about-spending','Asking good questions about spending','read','You do not need to be an expert to ask useful questions.

## Good questions are specific
Ask about one project: How much was budgeted? How much has been spent? What was delivered? When will it be finished? Specific questions are easier to answer and harder to dodge.

## Stay factual and fair
Ask for figures and dates, not blame. Keep a note of answers. If figures are public, you have a right to see them.','["Focus each question on one project","Ask budgeted vs spent, and what was delivered","Ask for figures and dates, not blame","Keep a note of the answers you get"]','Write two specific questions about a project you can see in your area.','shield',3),

('understanding-public-budgets','budget-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',4),

-- Course: Making a Complaint
('making-a-complaint','which-office-handles-your-concern','Which office handles your concern','read','A complaint only works if it reaches the office that can act on it.

## Match the concern
Broken water point or drainage, uncollected rubbish, market issues — the local council. Poor treatment at a clinic — the health facility, then the district health office. A document problem — the office that issued it. Unsure — your ward councillor can direct you.

## Get the details
Find the office name and, if you can, a contact person. A complaint sent to the right place is already half-way to being solved.','["Match the concern to the office that can act","Council handles water, rubbish, drainage, markets","Health matters go to the facility, then the district office","Your ward councillor can direct you"]','Write down one concern and the office that should handle it.','community',1),

('making-a-complaint','writing-a-clear-complaint','Writing a clear complaint','read','A strong complaint is short, factual and specific.

## What to include
State what happened, where, and when. Give facts: dates, a location, how many people are affected. Say clearly what you would like done. Keep it polite — it is more persuasive.

## Keep a record
Write or type it and keep a copy. If you hand it in, ask for a stamp or note that it was received. If you send it, keep the message and the date.','["Say what happened, where and when","Give facts: dates, place, people affected","Say clearly what you want done","Keep a copy and proof it was received"]','Draft a three-sentence complaint about a real issue near you.','circle',2),

('making-a-complaint','if-nothing-happens','If nothing happens','read','If a complaint is ignored, there are calm next steps.

## Escalate in order
Follow up first and give your reference. If there is still no response, ask for the supervisor or the next office up. Raising it at a community or ward meeting adds weight.

## Keep going, stay calm
Keep your copies and your notes of who you spoke to. A civil society organisation or legal aid service can guide you if you are stuck.','["Follow up and give your reference","Ask for a supervisor or the next office up","Raise it at a community meeting for weight","Keep records; seek help if stuck"]','Write the order of people you would contact if your complaint is ignored.','shield',3),

('making-a-complaint','a-broken-service-scenario','Scenario: An unresolved problem','scenario','Work through a real situation: a service in your area has failed and nothing is happening. Choose what you would do at each step.','["There is often more than one reasonable choice","The feedback explains why one works best"]',null,'community',4),

('making-a-complaint','complaint-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',5),

-- Course: Being a Good Digital Citizen
('digital-rights-and-responsibilities','your-data-and-privacy','Your data and privacy','read','Your personal information has value. Protecting it keeps you safe.

## What to protect
Your NRC number, PINs and passwords, your home details and photos. Do not share these with people you do not trust, and never enter them on a link you did not expect.

## Simple habits
Use a screen lock. Do not reuse one password everywhere. Think before you allow an app to see your contacts, photos or location.','["Protect your NRC number, PINs and passwords","Do not share private details with strangers","Use a screen lock and strong passwords","Think before apps access your data"]','Check the screen lock on your phone and change one weak password.','shield',1),

('digital-rights-and-responsibilities','being-respectful-online','Being respectful online','read','How you treat others online matters as much as in person.

## Communicate well
Be polite, even in disagreement. Do not share private messages or photos of others without permission. Words online can spread far and last a long time.

## Report harm
If you see bullying, threats or scams, do not pass them on. Report them on the platform and talk to someone you trust.','["Be polite, even when you disagree","Do not share others'' private messages or photos","Online words spread far and last","Report bullying, threats and scams"]','Think of one way you can make a group chat you are in kinder.','community',2),

('digital-rights-and-responsibilities','check-before-you-share-scenario','Scenario: Should you share it?','scenario','A dramatic message arrives on your phone and asks you to forward it to everyone. Work through what to do.','["Checking first protects you and others","The feedback explains the safest choice"]',null,'circle',3),

('digital-rights-and-responsibilities','digital-citizenship-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',4)

) v(course_slug,slug,title,type,body,kp,tryit,motif,so)
join courses c on c.slug=v.course_slug;

-- Quiz questions --------------------------------------------------------------
insert into quiz_questions(lesson_id,question,options,correct_index,explanation,sort_order)
select l.id,v.q,v.o::jsonb,v.ci,v.ex,v.so from (values
('government-quiz','Which level usually runs everyday local services like markets and rubbish?','["National government","The local council","A foreign donor","The courts"]',1,'Local councils run day-to-day services such as markets, roads, rubbish and trading licences.',1),
('government-quiz','Taking part in meetings and voting is best described as:','["Only a right","Only a responsibility","Both a right and a responsibility","Neither"]',2,'Participation is both a right you hold and a responsibility that keeps communities working.',2),
('budget-quiz','Where does most public money come from?','["Only foreign loans","Taxes, fees and levies","Private donations only","It is printed freely"]',1,'Most public money comes from taxes, plus fees and levies, with some grants and loans.',1),
('budget-quiz','A good question about a project is:','["Who do we blame?","How much was budgeted and spent, and what was delivered?","Why is everything bad?","Can I have the money?"]',1,'Specific questions about budgeted vs spent and what was delivered are clear and fair.',2),
('complaint-quiz','A complaint works best when it is sent to:','["Anyone nearby","The office that can act on it","Only social media","No one"]',1,'A complaint only gets results when it reaches the office that can actually act on it.',1),
('complaint-quiz','If your complaint is ignored, a good next step is to:','["Give up","Follow up, then ask for a supervisor or the next office","Shout at staff","Delete your records"]',1,'Follow up with your reference, then escalate calmly to a supervisor or the next office up.',2),
('digital-citizenship-quiz','Which of these should you keep private?','["Your favourite colour","Your PINs, passwords and NRC number","The weather","A public notice"]',1,'Keep PINs, passwords, your NRC number and personal details private and safe.',1),
('digital-citizenship-quiz','Before forwarding a dramatic message, you should:','["Send it to everyone fast","Check if it is true first","Add more drama","Never read it"]',1,'Check whether a message is true before you share it, so you do not spread false information.',2)
) v(lslug,q,o,ci,ex,so)
join lessons l on l.slug=v.lslug;

-- Scenario steps --------------------------------------------------------------
insert into scenario_steps(lesson_id,prompt,options,feedback,best_index,sort_order)
select l.id,v.prompt,v.options::jsonb,v.feedback::jsonb,v.bi,v.so from (values
('a-broken-service-scenario','The water point serving your street has been broken for three weeks. What is a good first step?','["Post an angry message in a group chat","Report it to the local council or your ward councillor","Wait and hope someone else reports it"]','["Venting is understandable, but it does not reach the office that can fix it.","Right — the council or councillor can log the fault and act on it.","If everyone waits, the fault stays unreported and unfixed."]',1,0),
('a-broken-service-scenario','The office asks for details. What helps your report most?','["Just say the water is off","Give the exact location, how long it has been broken, and how many households rely on it","Demand it is fixed today or else"]','["Too vague — they may not find the right fault.","Yes — specific facts help them act quickly and fairly.","Threats make staff defensive and rarely speed things up."]',1,1),
('a-broken-service-scenario','Two weeks later nothing has changed. What now?','["Give up — it is hopeless","Follow up with your reference, then ask for a supervisor and raise it at the next ward meeting","Start a fight with the office"]','["Giving up leaves the problem for everyone.","Right — escalate calmly and add weight by raising it publicly.","Conflict damages the relationship you need to solve this."]',1,2),
('check-before-you-share-scenario','A message says a local clinic is giving free money today and tells you to forward it to ten people. What do you do?','["Forward it quickly so friends do not miss out","Pause and check whether it is true before sharing","Forward it and add that it must be true"]','["Forwarding fast is how false messages and scams spread.","Right — checking first protects you and the people you would send it to.","Adding your name makes others trust a message you have not checked."]',1,0),
('check-before-you-share-scenario','How could you check it?','["Ask the clinic or a trusted official, or look for an official notice","Count how many people already shared it","Trust it because a friend sent it"]','["Yes — go to the source or an official channel to confirm.","Many shares does not make something true.","Even trusted friends forward things they have not checked."]',0,1)
) v(lslug,prompt,options,feedback,bi,so)
join lessons l on l.slug=v.lslug;
