-- Digital Bridges — seed content.
-- Courses, lessons, quizzes, site pages, badges, partners and localized strings.

insert into site_settings(key, value) values ('policy_version', '"1.0"');

insert into categories(slug,name,icon_name,sort_order) values
('safety','Safety','ShieldCheck',1),('communication','Communication','MessageCircle',2),('money','Money','Wallet',3),
('work','Work','Briefcase',4),('business','Business','Store',5),('citizenship','Citizenship','Users',6);

insert into courses(slug,title,tagline,description,category_id,icon_name,difficulty,estimated_hours,outcomes,is_published,sort_order)
select v.slug,v.title,v.tagline,v.description,c.id,v.icon,v.diff,v.hrs,v.outcomes::jsonb,true,v.so from (values
('getting-to-know-your-device','Getting to Know Your Device','Smartphone and computer basics, explained simply.','If you have never used a smartphone or computer before, start here. We go slowly: turning the device on, using the screen, charging, connecting to data, and finding your way around apps.','communication','Smartphone','start_here',2,'["Turn your phone on and off and unlock it","Use the touchscreen: tap, swipe and type","Connect to mobile data or Wi-Fi safely","Install and remove an app","Save your battery and your data bundle"]',1),
('staying-safe-online','Staying Safe Online','Passwords, scams, and protecting your personal information.','Learn the habits that keep your phone, your accounts and your money safe. We cover strong passwords, scam messages, and what not to share with strangers online.','safety','ShieldCheck','easy',2,'["Make a strong password you can remember","Spot the red flags in a scam message","Lock your phone with a PIN","Keep your personal details private","Know what to do if you are tricked"]',2),
('talking-and-working-online','Talking and Working Online','Email, messaging, and video calls for daily life.','Send an email, join a WhatsApp group the right way, and make a video call to family in another town. Simple steps for everyday communication.','communication','MessageCircle','easy',2.5,'["Create and use an email address","Write a clear, polite message","Send photos and documents","Join and make a video call","Use group chats respectfully"]',3),
('spotting-false-information','Spotting False Information','How to check if news and messages are true before you share.','Not everything forwarded on WhatsApp is true. Learn quick checks to tell real news from rumours, so you protect your family and community.','citizenship','SearchCheck','easy',1.5,'["Ask three questions before you share","Check who really sent a message","Spot edited photos and old videos","Find trusted news sources in Zambia","Talk to others kindly about false news"]',4),
('mobile-money-made-safe','Mobile Money, Made Safe','Send, receive, and protect your money on your phone.','Mobile money is part of daily life in Zambia. Learn to send and receive safely, check numbers before you send, protect your PIN, and spot common mobile money scams.','money','Wallet','easy',2,'["Send and receive money step by step","Check the name before you confirm","Keep your PIN secret","Spot fake reversal messages","Keep records of your transactions"]',5),
('digital-skills-for-work','Digital Skills for Work','Documents, research, and online job applications.','Write a CV on your phone, search for jobs safely, and send an application by email. Skills that help you find and keep work.','work','Briefcase','intermediate',3,'["Write a simple CV on your phone","Search for jobs and avoid fake offers","Send an application by email","Use a shared document","Prepare for an online interview"]',6),
('running-a-business-online','Running a Business Online','Social media marketing and selling online.','Whether you sell tomatoes, chitenge or phone repairs, learn to show your products online, talk to customers, and take payments safely.','business','Store','intermediate',3,'["Set up a business profile","Take clear photos of your products","Write posts customers understand","Take mobile money payments safely","Keep simple records of sales"]',7),
('being-a-good-digital-citizen','Being a Good Digital Citizen','Rights, respect, and wellbeing in online spaces.','The internet is a community too. Learn your rights, how to treat others with respect, how to deal with bullying, and how to look after your wellbeing.','citizenship','Users','easy',1.5,'["Know your rights online in Zambia","Treat others with respect","Report and block bullies","Protect children online","Balance screen time with rest"]',8)
) v(slug,title,tagline,description,cat,icon,diff,hrs,outcomes,so) join categories c on c.slug=v.cat;

insert into lessons(course_id,slug,title,type,body_richtext,key_points,try_it_action,svg_motif,sort_order)
select c.id,v.slug,v.title,v.type,v.body,v.kp::jsonb,v.tryit,v.motif,v.so from (values
('getting-to-know-your-device','your-phone-buttons-and-screen','Your phone''s buttons and screen','read','Most smartphones have only two or three buttons. The power button is usually on the side. Hold it down for three seconds to turn the phone on.

## The screen is the main button
On a smartphone, you touch the screen to do things. A short touch is called a tap. Sliding your finger is called a swipe.

## Unlocking
When the screen turns on, swipe up from the bottom to unlock. If you set a PIN, the phone will ask you for it.','["Hold the power button for 3 seconds to turn on","A tap is a short touch","Swipe up to unlock"]','Turn your phone off, then turn it back on and unlock it.','phone',1),
('getting-to-know-your-device','connecting-to-data','Connecting to data and Wi-Fi','read','To use WhatsApp, Facebook or the internet, your phone needs data. You can buy a data bundle from your network: Airtel, MTN or Zamtel.

## Turning data on
Swipe down from the top of the screen. Look for the icon with two arrows. Tap it to turn mobile data on. Tap again to turn it off and save your bundle.

## Wi-Fi
Some schools, ICT hubs and shops have free Wi-Fi. Only join Wi-Fi from places you trust, and never type your mobile money PIN while on public Wi-Fi.','["Swipe down from the top for quick settings","Turn data off when you are not using it","Only use Wi-Fi from places you trust"]','Swipe down and find the mobile data button on your phone.','radio',2),
('getting-to-know-your-device','installing-an-app','Installing and removing an app','practice','Apps are small programs. You get them from the Play Store on Android phones.

## Install
Open Play Store, tap the search bar, type the app name, then tap Install. Check the name of the company that made the app before you install.

## Remove
Press and hold the app icon, then drag it to Uninstall. Removing apps you do not use frees space and saves battery.','["Only install apps from the Play Store","Check who made the app","Remove apps you do not use"]','Find one app you never use and remove it.','phone',3),
('getting-to-know-your-device','device-basics-quiz','Check what you learned','quiz','Answer these short questions. You can try again as many times as you like.','["Take your time","Read every option"]',null,'circle',4),
('staying-safe-online','strong-passwords','Making a strong password you can remember','read','A strong password is long and hard for others to guess, but easy for you to remember.

## Use a sentence
Pick three or four words that mean something to you, like: MangoTree Kitwe 2009 Rain. Join them together: MangoTreeKitwe2009Rain. That is long, strong and memorable.

## Avoid these
Do not use your name, your birthday, 1234, or the word password. Do not use the same password for everything. If one account is stolen, the others stay safe.','["Long is stronger than short","Use three or four words together","Never use your birthday or 1234","Use a different password for each account"]','Think of four words you will remember and write a practice password on paper. Do not use it for a real account yet.','shield',1),
('staying-safe-online','red-flags-of-scam-messages','Red flags of scam messages','read','Scammers send messages that look real to trick you into giving money or your PIN.

## Common red flags
The message says you have won a prize you never entered. It says your account will be closed unless you act now. It asks for your PIN or a code sent to your phone. The sender is a number you do not know, or the spelling is strange.

## What to do
Stop. Do not reply, do not click links, do not send money. Call the company on its official number to check. Delete the message and warn your family.','["Real companies never ask for your PIN","Urgent pressure is a warning sign","Do not click links from strangers","Check by calling the official number"]','Look through your SMS messages. Can you find one that has a red flag?','shield',2),
('staying-safe-online','lock-your-phone','Lock your phone with a PIN','practice','If your phone is lost or stolen, a lock stops others from reading your messages or using your mobile money.

## Set a lock
Open Settings, tap Security or Lock screen, then choose PIN. Pick 4 to 6 numbers that are not your birthday. Type it twice to confirm.','["A PIN protects your messages and money","Do not use your birthday","Do not share your PIN, even with friends"]','Set a screen lock PIN on your phone today.','shield',3),
('staying-safe-online','safety-quiz','Check what you learned','quiz','Answer these short questions about staying safe.','["Take your time"]',null,'circle',4),
('talking-and-working-online','create-an-email','Create your email address','read','An email address is like a postal address for the internet. Many jobs, schools and government services ask for one.

## Choose a simple address
Use your name, for example chanda.mwale@gmail.com. Avoid nicknames that may look unprofessional to an employer.

## Write it down
Write your email address and password in a safe place at home.','["Use your real name in your address","Keep your password safe","You need email for jobs and services"]','Write down the email address you would like to create.','phone',1),
('talking-and-working-online','video-calls','Making a video call','read','A video call lets you see and hear someone far away. WhatsApp video calls work on most smartphones.

## Before you call
Video uses a lot of data. Use Wi-Fi if you can, or buy a bundle first. Sit somewhere quiet with light on your face.

## Making the call
Open the chat, tap the camera icon at the top. To end, tap the red button.','["Video uses more data than voice","Sit in good light","Tap the red button to end"]','Make a two-minute video call to a family member.','radio',2),
('talking-and-working-online','group-chat-manners','Group chat manners','practice','Group chats are useful for churches, clubs and savings groups. Good manners keep them useful.

## Simple rules
Stay on topic. Do not forward messages you have not checked. Ask before adding someone to a group. Reply privately to one person instead of the whole group.','["Stay on topic","Check before you forward","Ask before adding people"]','Look at one of your groups. Is there a rule you could share with members?','community',3),
('talking-and-working-online','communication-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',4),
('spotting-false-information','three-questions','Three questions before you share','read','Before you forward a message, ask three questions.

## Who sent it first?
A forward from a friend may have started with a stranger. Look for the real source.

## Is it on trusted news?
Check ZNBC, a trusted newspaper, or a community radio station you know.

## How does it make me feel?
Messages that make you very angry or scared are often made to spread fast. Slow down.','["Who sent it first?","Is it on trusted news?","Strong feelings mean slow down"]','Take the last forwarded message you received and ask the three questions.','radio',1),
('spotting-false-information','old-photos-new-stories','Old photos, new stories','read','A common trick is using an old photo or video and saying it happened today.

## How to check
Look for clues: the weather, signs, clothing, phone models. Ask the sender where it came from. If no one knows, do not share.','["Photos can be old or edited","Look for clues in the picture","If unsure, do not share"]','Find a photo in a group chat and look for clues about when it was taken.','circle',2),
('spotting-false-information','check-a-message','Practice: check a message','practice','Here is a message: "Government is giving K2,000 to every family. Click this link and enter your NRC number before Friday!"

## Think it through
There is a deadline, a link, a request for your NRC number and free money. These are four warning signs. Real government programmes are announced on official channels and do not ask for your details by link.','["Free money plus a link is a warning","Never send your NRC number by link","Check official channels"]','Share what you learned with one person in your family.','shield',3),
('spotting-false-information','false-info-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',4),
('mobile-money-made-safe','sending-money','Sending money step by step','read','Sending money with Airtel Money, MTN MoMo or Zamtel Kwacha follows similar steps.

## The steps
Dial the menu code or open the app. Choose Send Money. Enter the number. Enter the amount. Read the confirmation screen carefully. Enter your PIN only when everything is correct.','["Read the confirmation screen every time","Enter your PIN last","Keep the confirmation SMS"]','Dial your mobile money menu and find Send Money, without sending anything.','phone',1),
('mobile-money-made-safe','check-the-number','Checking the number before you send','read','Most mobile money mistakes happen because one digit is wrong.

## Check the name
After you type the number, the screen shows the name of the person who will receive the money. If the name is not the person you expect, cancel. It is much easier to cancel than to get money back.

## Save trusted numbers
Save the numbers you send to often in your contacts, so you can pick them instead of typing.','["The confirmation screen shows the receiver''s name","Cancel if the name is wrong","Save numbers you use often"]','Next time you send money, stop and read the name out loud before confirming.','phone',2),
('mobile-money-made-safe','fake-reversal-scam','The fake reversal scam','practice','A common scam: you get an SMS saying you received K500, then someone calls saying it was a mistake and asks you to send it back.

## What to do
Check your real balance by dialling your mobile money menu. Fake SMS messages come from normal numbers, not from your network. If your balance did not go up, do not send anything. Real reversals are handled by the network, not by strangers.','["Always check your real balance","Fake SMS comes from normal phone numbers","Real reversals go through the network"]','Find out the official customer care number for your network and save it.','shield',3),
('mobile-money-made-safe','mobile-money-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',4),
('digital-skills-for-work','cv-on-your-phone','Writing a CV on your phone','read','A CV is a short page that tells an employer who you are and what you can do.

## What to include
Your name, phone number and email. Your education. Work you have done, including piece work and volunteering. Skills like driving, tailoring or speaking Bemba and English.

## Writing it
Use a free app like Google Docs. Keep it to one page. Save it as a PDF to send.','["Keep your CV to one page","Include all work, even informal work","Save it as a PDF"]','Write the first three lines of your CV: name, phone, email.','phone',1),
('digital-skills-for-work','fake-job-offers','Spotting fake job offers','read','Fake job adverts ask you to pay money for a job, training or a uniform before you start.

## Warning signs
They ask for payment. The salary is very high for little work. They only talk on WhatsApp and have no office address. Real employers do not charge you to apply.','["Real employers never charge you to apply","Very high pay is a warning","Check there is a real address"]','Look at one job advert and check it for warning signs.','shield',2),
('digital-skills-for-work','send-an-application','Sending an application by email','practice','When you email an application, write a short message and attach your CV.

## Example
Subject: Application for Shop Assistant. Message: Dear Sir or Madam, I would like to apply for the Shop Assistant job in Kitwe. My CV is attached. Thank you, Mwaka Banda, 097 000 0000.','["Write a clear subject","Keep the message short and polite","Attach your CV"]','Write a practice email to yourself with your CV attached.','phone',3),
('digital-skills-for-work','work-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',4),
('running-a-business-online','business-profile','Setting up a business profile','read','WhatsApp Business and a Facebook page let customers find you and see your products.

## What to add
Your business name, what you sell, where you are, opening hours and your phone number. Use a clear photo as your profile picture.','["Customers need your name, location and hours","Use a clear profile photo","Use WhatsApp Business for your shop"]','Write down the five details you would put on your business profile.','community',1),
('running-a-business-online','product-photos','Taking good product photos','practice','Good photos sell more. You do not need an expensive phone.

## Tips
Take photos in daylight near a window or outside. Use a plain background like a wall or cloth. Clean the camera lens with a soft cloth. Show the price clearly in your post.','["Use daylight","Plain background","Clean your lens"]','Take three photos of one product using these tips.','phone',2),
('running-a-business-online','safe-payments','Taking payments safely','read','Customers will want to pay with mobile money.

## Protect yourself
Only release goods after you check your real balance, not after seeing an SMS. Keep a simple record of each sale: date, item, amount, customer.','["Check your balance before handing over goods","Keep a record of every sale"]','Start a simple sales notebook or phone note today.','phone',3),
('running-a-business-online','business-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',4),
('being-a-good-digital-citizen','your-rights-online','Your rights online','read','In Zambia, the Data Protection Act of 2021 protects your personal information. Companies must tell you why they collect your data and keep it safe.

## You can ask
You can ask a company what information they hold about you, and ask them to correct or delete it.','["Your data is protected by law","You can ask what data is held about you","You can ask for corrections"]','Think of one app you use. Do you know what data it collects?','community',1),
('being-a-good-digital-citizen','dealing-with-bullying','Dealing with online bullying','read','Bullying online can hurt as much as bullying in person.

## What to do
Do not reply to the bully. Take a screenshot as proof. Block and report the account. Talk to someone you trust, like a parent, teacher or facilitator.','["Do not reply","Save proof","Block and report","Tell someone you trust"]','Find the block button in WhatsApp for a contact, without pressing it.','shield',2),
('being-a-good-digital-citizen','screen-time-balance','Balancing screen time','practice','Phones are useful, but too much time on them can affect sleep and family time.

## Simple habits
Put the phone away during meals. Stop using it one hour before sleep. Turn off notifications from apps you do not need.','["Phone-free meals","No screens before sleep","Turn off extra notifications"]','Turn off notifications for one app you do not need.','circle',3),
('being-a-good-digital-citizen','citizenship-quiz','Check what you learned','quiz','Answer these short questions.','["Take your time"]',null,'circle',4)
) v(course_slug,slug,title,type,body,kp,tryit,motif,so) join courses c on c.slug=v.course_slug;

insert into quiz_questions(lesson_id,question,options,correct_index,explanation,sort_order)
select l.id,v.q,v.o::jsonb,v.ci,v.ex,v.so from (values
('device-basics-quiz','How long should you hold the power button to turn on most phones?','["Half a second","About three seconds","One minute","You do not need to press it"]',1,'Holding for about three seconds turns most phones on. A quick press usually just turns the screen on or off.',1),
('device-basics-quiz','Where is the safest place to get new apps?','["A link from a stranger","The Play Store","A Bluetooth file from a friend","Any website"]',1,'The Play Store checks apps before you install them. Files from links or Bluetooth can carry harmful programs.',2),
('safety-quiz','Which password is the strongest?','["1234","Chanda1990","MangoTreeKitwe2009Rain","password"]',2,'Long passwords made of several words are much harder to guess, and still easy for you to remember.',1),
('safety-quiz','A message says your account will close unless you send your PIN. What should you do?','["Send the PIN quickly","Reply asking for more time","Ignore it and call the official number","Forward it to friends"]',2,'Real companies never ask for your PIN. Call the official number if you are worried.',2),
('communication-quiz','Before making a video call on mobile data, you should:','["Check you have enough data","Turn your phone off","Remove all apps","Change your password"]',0,'Video calls use a lot of data, so make sure your bundle is enough or use trusted Wi-Fi.',1),
('communication-quiz','What is good manners in a group chat?','["Forward every message","Add people without asking","Stay on topic","Send many voice notes at night"]',2,'Staying on topic keeps the group useful for everyone.',2),
('false-info-quiz','A message makes you very angry. What is the best first step?','["Share it fast","Slow down and check it","Add more comments","Send it to every group"]',1,'Messages that cause strong feelings are often made to spread. Slow down and check first.',1),
('false-info-quiz','A message offers free money if you enter your NRC number at a link. This is:','["A real government programme","A likely scam","Safe if a friend sent it","Fine before Friday"]',1,'Free money, a deadline, a link and a request for your NRC are all warning signs.',2),
('mobile-money-quiz','What should you check before entering your PIN to send money?','["The weather","The receiver''s name on the screen","Your battery","The time"]',1,'The confirmation screen shows who will receive the money. If the name is wrong, cancel.',1),
('mobile-money-quiz','You get an SMS saying you received K500 and a stranger asks for it back. What do you do first?','["Send it back","Check your real balance","Call the stranger","Delete your account"]',1,'Fake SMS messages are common. Check your real balance through the official menu.',2),
('work-quiz','An advert asks you to pay K300 for a uniform before starting. This is:','["Normal","A warning sign of a fake job","A good offer","Required by law"]',1,'Real employers do not charge you money to get a job.',1),
('work-quiz','How long should a simple CV be?','["One page","Ten pages","One line","As long as possible"]',0,'One clear page is easiest for employers to read.',2),
('business-quiz','When should you hand over goods paid by mobile money?','["When you see an SMS","After checking your real balance","Before payment","When the customer says they paid"]',1,'SMS can be faked. Your real balance is the only proof.',1),
('business-quiz','What makes a good product photo?','["Dark room","Busy background","Daylight and plain background","Blurry lens"]',2,'Daylight and a plain background show your product clearly.',2),
('citizenship-quiz','Which law protects personal data in Zambia?','["The Data Protection Act of 2021","The Roads Act","There is no law","The Mining Act"]',0,'The Data Protection Act No. 3 of 2021 protects your personal information.',1),
('citizenship-quiz','Someone is bullying you online. What should you NOT do?','["Save proof","Block them","Reply angrily","Tell someone you trust"]',2,'Replying can make it worse. Save proof, block, report and talk to someone.',2)
) v(lslug,q,o,ci,ex,so) join lessons l on l.slug=v.lslug;

insert into site_pages(slug,hero_title,hero_subline,body) values
('home','Learn to use your phone safely, one small step at a time.','Free, simple lessons for anyone in Zambia. Works on any smartphone, even with little data. Learn about mobile money, staying safe from scams, finding work and more.',
'{"why":[{"title":"Simple language","body":"No difficult words. Every lesson is short and explained the way a friend would.","icon":"MessageSquareText"},{"title":"Works on any phone","body":"Lessons are light on data and work on small screens and slow networks.","icon":"Smartphone"},{"title":"Local languages","body":"Switch the menus to Bemba or Nyanja. Full lesson translations are rolling out.","icon":"Languages"},{"title":"Free for communities","body":"No fees for learners, schools, churches or community groups.","icon":"HeartHandshake"}],"steps":[{"title":"Create a free account","body":"Use your email. It takes one minute."},{"title":"Pick a course","body":"Start with Getting to Know Your Device if you are new."},{"title":"Learn and earn badges","body":"Finish short lessons and quizzes. Your progress is saved."}]}'),
('about','Built with communities, for communities.','Digital Bridges helps people across Zambia use phones and the internet with confidence, so they can stay safe, earn a living and take part in community life.',
'{"mission":"Many people in Zambia now own a smartphone but were never shown how to use it safely. Scams, false news and confusing apps keep people from the benefits. We create short, plain-language lessons, tested with real learners in Lusaka, Kitwe, Kazungula and Chipata, and train community facilitators to teach them.","groups":[{"title":"Young people 15 to 35","body":"Skills for school, work and running a small business.","icon":"GraduationCap"},{"title":"Women and girls","body":"Safe spaces to learn mobile money, safety and business skills.","icon":"Heart"},{"title":"Informal workers","body":"Marketeers, bus drivers and traders who use phones every day.","icon":"ShoppingBasket"},{"title":"Rural learners","body":"Lessons that work on slow networks and small data bundles.","icon":"Sprout"},{"title":"Community facilitators","body":"Guides and posters to run workshops in your area.","icon":"Megaphone"},{"title":"Older adults","body":"Patient, step-by-step help for first-time phone users.","icon":"HandHelping"}],"approach":[{"title":"Community consultations","body":"We met with groups in four districts to hear what people need most."},{"title":"Focus groups","body":"Learners told us which words and examples made sense."},{"title":"Pilot testing","body":"Facilitators ran the first lessons with real groups and noted what was hard."},{"title":"Feedback refinement","body":"We rewrite lessons every term based on what learners tell us."}]}'),
('trainers','Run digital skills workshops in your community.','Free guides, posters and lesson plans for facilitators, teachers and youth leaders.','{"intro":"Plan a workshop, track your groups and download materials."}'),
('privacy','Privacy Policy','How Digital Bridges collects, uses and protects your personal information.',
'{"sections":[{"heading":"Who we are","body":"Digital Bridges is a free digital literacy platform for communities in Zambia. This policy explains what personal data we collect and how we protect it, in line with the Zambia Data Protection Act No. 3 of 2021."},{"heading":"What data we collect","body":"Your name, phone number (if you give it), email address, district, language preference, the lessons you complete, quiz results, badges, and records of the consents you give (for example accepting these terms or choosing cookie settings). If you contact us, we keep your message."},{"heading":"Why we collect it","body":"To create your account, save your learning progress, award badges, show lessons in your language, reply to your messages, and improve our lessons. We only use analytics if you allow it."},{"heading":"Lawful basis","body":"We process your data with your consent, which you give when you sign up, and because it is necessary to provide the learning service you asked for. You can withdraw consent at any time."},{"heading":"How we store it","body":"Your data is stored on secure cloud servers. It is encrypted when stored and when sent. Only authorised staff can access it, and access is logged."},{"heading":"Sharing","body":"We do not sell your data. We do not share it with anyone without your consent, unless the law requires us to."},{"heading":"Your rights","body":"You have the right to access your data, correct it, delete it, and receive a copy (export). You can download your data and delete your account from Settings at any time. You can also complain to the Office of the Data Protection Commissioner of Zambia."},{"heading":"Children","body":"Learners under 18 may use Digital Bridges with the agreement of a parent or guardian, which we ask for at sign-up."},{"heading":"Contact for data requests","body":"Email privacy@digitalbridges.org.zm or use the Contact page. We reply within 30 days."}]}'),
('terms','Terms of Use','The rules for using Digital Bridges, written in plain language.',
'{"sections":[{"heading":"Using the platform","body":"Digital Bridges is free to use for learning. By creating an account you agree to these terms and our Privacy Policy."},{"heading":"Acceptable use","body":"Be respectful. Do not use the platform to harass others, share harmful content, try to break into accounts, or copy the service for sale."},{"heading":"Content licensing","body":"Our lessons are open educational resources. You may share and adapt them for non-commercial teaching, as long as you credit Digital Bridges."},{"heading":"Age policy","body":"You must be 18 or older, or have permission from a parent or guardian if you are under 18."},{"heading":"Your account","body":"Keep your password safe. You can delete your account at any time from Settings."},{"heading":"Changes","body":"If we change these terms, we will ask you to accept the new version the next time you visit."}]}'),
('accessibility','Accessibility Statement','We want everyone to be able to learn on Digital Bridges.',
'{"sections":[{"heading":"Our commitment","body":"We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 level AA."},{"heading":"What we do","body":"Clear contrast, large tap areas, plain language, keyboard navigation, labels for screen readers, and pages that work on small screens and slow connections."},{"heading":"Known limits","body":"Some lesson translations into Bemba and Nyanja are still being written. Some older uploaded documents may not be fully accessible."},{"heading":"Tell us about a barrier","body":"If something stops you from using the platform, email access@digitalbridges.org.zm or use the Contact page. We will reply within 10 working days."}]}');

insert into stats(label,value,sort_order) values ('courses','8',1),('short lessons','32',2),('districts reached','4',3),('cost to learners','K0',4);

insert into testimonials(quote,name,role_location,is_published) values
('I used to ask my nephew to send money for me. Now I check the name myself before I press OK.','Mwaka Phiri','Marketeer, Chipata',true),
('The scam lesson saved me. I got the same fake reversal message the next week and I knew what it was.','Chanda Mulenga','Bus conductor, Lusaka',true),
('I run sessions under the tree after church. The posters and short lessons make it easy.','Temba Zulu','Community facilitator, Kazungula',true);

insert into partners(name,category,is_published) values
('Kitwe Community Radio','radio',true),('Chipata Day Secondary School','school',true),('Lusaka Youth ICT Hub','ict_hub',true),('Kazungula Women''s Network','cs',true);

insert into faqs(question,answer,sort_order,is_published) values
('Does it cost anything?','No. Digital Bridges is free for all learners and community groups.',1,true),
('How much data does a lesson use?','Most lessons use less than 1 MB because they are mostly text and small drawings.',2,true),
('Can I learn in Bemba or Nyanja?','You can switch the menus now. Full lesson translations are being added over time.',3,true);

insert into badges(slug,name,description,criteria,icon_name) values
('first-lesson','First Lesson','You finished your first lesson.','{"lessons":1}','Footprints'),
('safety-star','Safety Star','You finished Staying Safe Online.','{"course":"staying-safe-online"}','ShieldCheck'),
('seven-day-streak','7-Day Streak','You learned on 7 different days in a row.','{"streak":7}','Flame'),
('money-wise','Money Wise','You finished Mobile Money, Made Safe.','{"course":"mobile-money-made-safe"}','Wallet');

insert into community_groups(name,location,learners,avg_completion) values
('Mtendere Youth Club','Lusaka',24,62),('Chimwemwe Women''s Savings Group','Kitwe',18,48),('Kazungula Marketeers','Kazungula',31,35),('Chipata Church Learners','Chipata',15,71);

insert into i18n_strings(key,lang,value) values
('nav.courses','en','Courses'),('nav.courses','bem','Amasambililo'),('nav.courses','nya','Maphunziro'),
('nav.about','en','About'),('nav.about','bem','Pali ifwe'),('nav.about','nya','Za ife'),
('nav.trainers','en','For Trainers'),('nav.trainers','bem','Ku bakafundisha'),('nav.trainers','nya','Kwa aphunzitsi'),
('nav.signin','en','Sign in'),('nav.signin','bem','Ingileni'),('nav.signin','nya','Lowani'),
('nav.start','en','Start learning'),('nav.start','bem','Tendekeni ukusambilila'),('nav.start','nya','Yambani kuphunzira'),
('nav.dashboard','en','My learning'),('nav.dashboard','bem','Ifyo nsambilila'),('nav.dashboard','nya','Zomwe ndaphunzira'),
('nav.settings','en','Settings'),('nav.settings','bem','Ifyakupanga'),('nav.settings','nya','Zokonza'),
('nav.signout','en','Sign out'),('nav.signout','bem','Fumeni'),('nav.signout','nya','Tulukani'),
('greeting','en','Moni'),('greeting','bem','Mwapoleni'),('greeting','nya','Moni'),
('cta.continue','en','Continue learning'),('cta.continue','bem','Konkanyeni ukusambilila'),('cta.continue','nya','Pitirizani kuphunzira'),
('lesson.next','en','Next'),('lesson.next','bem','Ikonkapo'),('lesson.next','nya','Kenako'),
('lesson.prev','en','Back'),('lesson.prev','bem','Bwelelapo'),('lesson.prev','nya','Bwererani'),
('lesson.complete','en','Mark as done'),('lesson.complete','bem','Nasambilila'),('lesson.complete','nya','Ndamaliza'),
('note.translations','en','Lesson translations are rolling out. Menus are translated now.'),('note.translations','bem','Ukupilibula amasambililo kulecitwa. Ifya pa menu fyapilibulwa kale.'),('note.translations','nya','Kumasulira maphunziro kukuchitika. Zinthu za pa menu zamasuliridwa kale.');

