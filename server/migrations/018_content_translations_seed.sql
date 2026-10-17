-- Bemba + Nyanja translations for catalogue content (stage 21).
-- First-pass translations — review by native speakers before launch.
-- Keyed by natural keys; entity ids resolved via joins so this is portable.

-- Categories
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'category', id, 'bem', 'name', '"Umutelelwe"'::jsonb from categories where slug='safety'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'category', id, 'nya', 'name', '"Chitetezo"'::jsonb from categories where slug='safety'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'category', id, 'bem', 'name', '"Ukulanshanya"'::jsonb from categories where slug='communication'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'category', id, 'nya', 'name', '"Kulankhulana"'::jsonb from categories where slug='communication'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'category', id, 'bem', 'name', '"Indalama"'::jsonb from categories where slug='money'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'category', id, 'nya', 'name', '"Ndalama"'::jsonb from categories where slug='money'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'category', id, 'bem', 'name', '"Incito"'::jsonb from categories where slug='work'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'category', id, 'nya', 'name', '"Ntchito"'::jsonb from categories where slug='work'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'category', id, 'bem', 'name', '"Amakwebo"'::jsonb from categories where slug='business'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'category', id, 'nya', 'name', '"Bizinesi"'::jsonb from categories where slug='business'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'category', id, 'bem', 'name', '"Buikalilo bwa Calo"'::jsonb from categories where slug='citizenship'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'category', id, 'nya', 'name', '"Unansi wa Dziko"'::jsonb from categories where slug='citizenship'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();

-- Pathways
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'pathway', id, 'bem', 'title', '"Amano ya Digito"'::jsonb from pathways where slug='digital-skills'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'pathway', id, 'nya', 'title', '"Luso la Digito"'::jsonb from pathways where slug='digital-skills'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'pathway', id, 'bem', 'subtitle', '"Bomfya foni yobe mu kushininkisha"'::jsonb from pathways where slug='digital-skills'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'pathway', id, 'nya', 'subtitle', '"Gwiritsani foni yanu modzidalira"'::jsonb from pathways where slug='digital-skills'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'pathway', id, 'bem', 'description', '"Mafoni, indalama sha pa foni, umutelelwe pa intaneti, ukutuma amashiwi na ukufwaya incito — amano ya cila bushiku aya kukubafyako mu calo ca digito."'::jsonb from pathways where slug='digital-skills'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'pathway', id, 'nya', 'description', '"Mafoni, ndalama za pafoni, chitetezo pa intaneti, kutumiza mauthenga ndi kupeza ntchito — luso la tsiku ndi tsiku kuti mutenge nawo mbali m''dziko la digito."'::jsonb from pathways where slug='digital-skills'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'pathway', id, 'bem', 'title', '"Isambililo lya Buikalilo bwa Calo"'::jsonb from pathways where slug='civic-education'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'pathway', id, 'nya', 'title', '"Maphunziro a Unansi"'::jsonb from pathways where slug='civic-education'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'pathway', id, 'bem', 'subtitle', '"Ishiba insambu shobe, tengako lubali"'::jsonb from pathways where slug='civic-education'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'pathway', id, 'nya', 'subtitle', '"Dziwani ufulu wanu, tengani nawo mbali"'::jsonb from pathways where slug='civic-education'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'pathway', id, 'bem', 'description', '"Ifyo amabufi ya buteko yabomba, insambu shobe, ukufwaya ilyashi, na ukutengako lubali mu mapingulo ayakuma umushi obe."'::jsonb from pathways where slug='civic-education'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'pathway', id, 'nya', 'description', '"Mmene ntchito za boma zimagwirira, ufulu wanu, kupeza chidziwitso, ndi kutenga nawo mbali pa zisankho zomwe zikhudza dera lanu."'::jsonb from pathways where slug='civic-education'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();

-- Courses
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Ukwishiba Foni Yobe"'::jsonb from courses where slug='getting-to-know-your-device'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Kudziwa Chipangizo Chanu"'::jsonb from courses where slug='getting-to-know-your-device'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Ifya kutendekelako pa foni na kompyuta, ukulondolola mu kwanguka."'::jsonb from courses where slug='getting-to-know-your-device'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Maziko a foni ndi kompyuta, ofotokozedwa mosavuta."'::jsonb from courses where slug='getting-to-know-your-device'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Nga tawabombeshapo foni nangu kompyuta, tendekela pano. Tuleya panono panono: ukwasha foni, ukubomfya iskrini, ukucaja, ukwikatana ku data, na ukusanga inshila mu ma app."'::jsonb from courses where slug='getting-to-know-your-device'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Ngati simunagwiritsepo ntchito foni kapena kompyuta, yambani pano. Tikupita pang''onopang''ono: kuyatsa chipangizo, kugwiritsa skirini, kuchaja, kulumikiza ku data, ndi kupeza njira mu ma app."'::jsonb from courses where slug='getting-to-know-your-device'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Asha no kuzimya foni no kwifungula", "Bomfya iskrini: kukunta, ukusunta na ukulemba", "Ikatana ku data nangu Wi-Fi mu kushininkisha", "Ikilisha no kufumya app", "Sunga batali no data bundle yobe"]'::jsonb from courses where slug='getting-to-know-your-device'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Yatsani ndi kuzimitsa foni ndi kuitsegula", "Gwiritsani skirini: kukhudza, kukwiza ndi kulemba", "Lumikizani ku data kapena Wi-Fi mwachitetezo", "Ikani ndi kuchotsa app", "Sungani batri ndi bundle yanu ya data"]'::jsonb from courses where slug='getting-to-know-your-device'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Ukuba Umutelelwe pa Intaneti"'::jsonb from courses where slug='staying-safe-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Kukhala Otetezeka pa Intaneti"'::jsonb from courses where slug='staying-safe-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Ama password, ubucenjeshi, na ukucingilila ilyashi lyobe."'::jsonb from courses where slug='staying-safe-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Mapassword, chinyengo, ndi kuteteza chidziwitso chanu."'::jsonb from courses where slug='staying-safe-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Sambilila imicitile iikacingilila foni yobe, ama akaunti na indalama shobe. Tulanda pa ma password yakosa, amashiwi ya bucenjeshi, na ifyo ushilingile ukweba abantu basho waishiba pa intaneti."'::jsonb from courses where slug='staying-safe-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Phunzirani zizolowezi zomwe zimateteza foni, ma akaunti ndi ndalama zanu. Tikambirana za mapassword amphamvu, mauthenga achinyengo, ndi zomwe simuyenera kuuza anthu osawadziwa pa intaneti."'::jsonb from courses where slug='staying-safe-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Panga password yakosa iyo kuti wibukisha", "Mona ifishibilo fya bucenjeshi mu lyashi", "Kaka foni yobe na PIN", "Sunga ifyakuma iwe mu bumfisolo", "Ishiba ifya kucita nga bakucenjesha"]'::jsonb from courses where slug='staying-safe-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Pangani password yamphamvu yomwe mungakumbukire", "Zindikirani zizindikiro za chinyengo mu uthenga", "Tsekani foni yanu ndi PIN", "Sungani zinthu zanu zaumwini mwachinsinsi", "Dziwani zoyenera kuchita ngati akunyengani"]'::jsonb from courses where slug='staying-safe-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Ukulanshanya no Kubomba pa Intaneti"'::jsonb from courses where slug='talking-and-working-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Kulankhula ndi Kugwira Ntchito pa Intaneti"'::jsonb from courses where slug='talking-and-working-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Email, ukutumasha amashiwi, na ama video call ya cila bushiku."'::jsonb from courses where slug='talking-and-working-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Imelo, kutumiza mauthenga, ndi ma vidiyo kolo a tsiku ndi tsiku."'::jsonb from courses where slug='talking-and-working-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Tuma email, ingila mu group ya WhatsApp bwino, no kucita video call ku balupwa mu mushi umbi. Intampulo shanguka isha kulanshanya kwa cila bushiku."'::jsonb from courses where slug='talking-and-working-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Tumizani imelo, lowani mu gulu la WhatsApp moyenera, ndi kuyimba vidiyo kolo kwa achibale ku tawuni ina. Masitepe osavuta a kulankhulana kwa tsiku ndi tsiku."'::jsonb from courses where slug='talking-and-working-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Panga no kubomfya adiresi ya email", "Lemba lyashi ilyabuta, ilya mucinshi", "Tuma amafoto na amadokyumenti", "Ingila no kucita video call", "Bomfya ama group chat mu mucinshi"]'::jsonb from courses where slug='talking-and-working-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Pangani ndi kugwiritsa adiresi ya imelo", "Lembani uthenga womveka, waulemu", "Tumizani zithunzi ndi zikalata", "Lowani ndi kuyimba vidiyo kolo", "Gwiritsani ma gulu a chat mwaulemu"]'::jsonb from courses where slug='talking-and-working-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Ukwishiba Ilyashi Lya Bufi"'::jsonb from courses where slug='spotting-false-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Kuzindikira Nkhani Zabodza"'::jsonb from courses where slug='spotting-false-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Ifya kusuminisha nga ilyashi lya cine ilintu ushilalituma."'::jsonb from courses where slug='spotting-false-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Mmene mungatsimikizire ngati nkhani ndi yoona musanaigawire."'::jsonb from courses where slug='spotting-false-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Te fyonse ifitumwa pa WhatsApp fya cine. Sambilila ifya kusuminisha mu kwanguka pa kupusanya ilyashi lya cine ne lya mabepo, pa kuti ucingilile ulupwa no mushi obe."'::jsonb from courses where slug='spotting-false-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Si zonse zotumizidwa pa WhatsApp ndi zoona. Phunzirani njira zofulumira zosiyanitsira nkhani yoona ndi mphekesera, kuti muteteze banja ndi dera lanu."'::jsonb from courses where slug='spotting-false-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Ipusha amepusho yatatu ilintu ushilatuma", "Ceba uwatumine lyashi ca cine", "Mona amafoto yasintwa na ama video ya kale", "Sanga ifyakufuma lyashi ifya cine mu Zambia", "Landa na bambi mu kwanashika pa lyashi lya bufi"]'::jsonb from courses where slug='spotting-false-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Funsani mafunso atatu musanagawire", "Onani amene anatumiza uthenga weniweni", "Zindikirani zithunzi zosinthidwa ndi ma vidiyo akale", "Pezani magwero a nkhani odalirika mu Zambia", "Kambiranani ndi ena mwachifundo za nkhani zabodza"]'::jsonb from courses where slug='spotting-false-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Indalama pa Foni, mu Mutelelwe"'::jsonb from courses where slug='mobile-money-made-safe'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Ndalama za Pafoni, Mwachitetezo"'::jsonb from courses where slug='mobile-money-made-safe'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Tuma, pokelela, no kucingilila indalama shobe pa foni."'::jsonb from courses where slug='mobile-money-made-safe'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Tumizani, landirani, ndi kuteteza ndalama zanu pafoni."'::jsonb from courses where slug='mobile-money-made-safe'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Indalama pa foni cintu ca cila bushiku mu Zambia. Sambilila ukutuma no kupokelela mu mutelelwe, ukuceba inomba ilintu ushilatuma, ukucingilila PIN yobe, no kumona ubucenjeshi bwa indalama pa foni."'::jsonb from courses where slug='mobile-money-made-safe'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Ndalama za pafoni ndi mbali ya moyo wa tsiku ndi tsiku mu Zambia. Phunzirani kutumiza ndi kulandira mwachitetezo, kuyang''ana nambala musanatumize, kuteteza PIN yanu, ndi kuzindikira chinyengo cha ndalama za pafoni."'::jsonb from courses where slug='mobile-money-made-safe'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Tuma no kupokelela indalama intambi ne ntambi", "Ceba ishina ilintu ushilasuminisha", "Sunga PIN yobe mu bumfisolo", "Mona amashiwi ya bufi aya kubweshako", "Sunga amalembo ya fyo wacita"]'::jsonb from courses where slug='mobile-money-made-safe'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Tumizani ndi kulandira ndalama sitepe ndi sitepe", "Onani dzina musanatsimikize", "Sungani PIN yanu mwachinsinsi", "Zindikirani mauthenga abodza obweza ndalama", "Sungani mbiri ya zochita zanu"]'::jsonb from courses where slug='mobile-money-made-safe'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Amano ya Digito ku Ncito"'::jsonb from courses where slug='digital-skills-for-work'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Luso la Digito pa Ntchito"'::jsonb from courses where slug='digital-skills-for-work'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Amadokyumenti, ukufwailisha, na ukufwaya incito pa intaneti."'::jsonb from courses where slug='digital-skills-for-work'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Zikalata, kufufuza, ndi kufunsira ntchito pa intaneti."'::jsonb from courses where slug='digital-skills-for-work'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Lemba CV pa foni yobe, fwaya incito mu mutelelwe, no kutuma ukufwaya incito pa email. Amano ayakwafwa ukusanga no kusunga incito."'::jsonb from courses where slug='digital-skills-for-work'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Lembani CV pa foni yanu, funani ntchito mwachitetezo, ndi kutumiza pempho la ntchito pa imelo. Luso lothandiza kupeza ndi kusunga ntchito."'::jsonb from courses where slug='digital-skills-for-work'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Lemba CV iyanguka pa foni yobe", "Fwaya incito no kucenjela ku fya bufi", "Tuma ukufwaya incito pa email", "Bomfya idokyumenti lyakwabana", "Ipekanye ku interview ya pa intaneti"]'::jsonb from courses where slug='digital-skills-for-work'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Lembani CV yosavuta pa foni yanu", "Funani ntchito ndi kupewa zabodza", "Tumizani pempho pa imelo", "Gwiritsani chikalata chogawana", "Konzekerani interview ya pa intaneti"]'::jsonb from courses where slug='digital-skills-for-work'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Ukubomfya Amakwebo pa Intaneti"'::jsonb from courses where slug='running-a-business-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Kuyendetsa Bizinesi pa Intaneti"'::jsonb from courses where slug='running-a-business-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Ukushimika pa social media no kushitisha pa intaneti."'::jsonb from courses where slug='running-a-business-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Kutsatsa pa social media ndi kugulitsa pa intaneti."'::jsonb from courses where slug='running-a-business-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Nangu ushitisha matimati, icitenge nangu ukuwamya mafoni, sambilila ukulanga ifyo ushitisha pa intaneti, ukulanshanya na bakashiti, no kupokelela indalama mu mutelelwe."'::jsonb from courses where slug='running-a-business-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Kaya mukugulitsa matimati, zitenje kapena kukonza mafoni, phunzirani kuonetsa katundu wanu pa intaneti, kulankhula ndi makasitomala, ndi kulandira malipiro mwachitetezo."'::jsonb from courses where slug='running-a-business-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Panga profaile ya makwebo", "Kwata amafoto yabuta aya fyo ushitisha", "Lemba amaposti ayo bakashiti bomfwa", "Pokelela indalama pa foni mu mutelelwe", "Sunga amalembo yanguka ya fyo washitisha"]'::jsonb from courses where slug='running-a-business-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Pangani profail ya bizinesi", "Jambulani zithunzi zomveka za katundu wanu", "Lembani maposti omwe makasitomala amamva", "Landirani malipiro a pafoni mwachitetezo", "Sungani mbiri yosavuta ya zogulitsa"]'::jsonb from courses where slug='running-a-business-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Ukuba Umwikashi Umusuma pa Digito"'::jsonb from courses where slug='being-a-good-digital-citizen'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Kukhala Nzika Yabwino ya Digito"'::jsonb from courses where slug='being-a-good-digital-citizen'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Insambu, umucinshi, no bumi busuma mu fifulo fya pa intaneti."'::jsonb from courses where slug='being-a-good-digital-citizen'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Ufulu, ulemu, ndi moyo wabwino m''malo a pa intaneti."'::jsonb from courses where slug='being-a-good-digital-citizen'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Intaneti nayo mushi. Sambilila insambu shobe, ifya kucindika bambi, ifya kucita ku bucenjeshi bwa kututuma, na ifya kusakamana ubumi bobe."'::jsonb from courses where slug='being-a-good-digital-citizen'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Intaneti nayonso ndi dera. Phunzirani ufulu wanu, mmene mungalemekezere ena, mmene mungachitire ndi nyozo, ndi mmene mungasamalire moyo wanu."'::jsonb from courses where slug='being-a-good-digital-citizen'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Ishiba insambu shobe pa intaneti mu Zambia", "Cindika bambi", "Shimika no kukaka abakututuma", "Cingilila abana pa intaneti", "Linganya inshita ya foni no kutusha"]'::jsonb from courses where slug='being-a-good-digital-citizen'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Dziwani ufulu wanu pa intaneti mu Zambia", "Lemekezani ena", "Nenani ndi kutseka onyoza", "Tetezani ana pa intaneti", "Lingani nthawi ya foni ndi kupuma"]'::jsonb from courses where slug='being-a-good-digital-citizen'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Ukusanga Ubwafwilisho ku Mabufi ya Buteko"'::jsonb from courses where slug='getting-help-from-public-services'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Kupeza Thandizo ku Ntchito za Boma"'::jsonb from courses where slug='getting-help-from-public-services'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Uko kuya, ifya kusenda, na ifya kukonkelulapo."'::jsonb from courses where slug='getting-help-from-public-services'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Kumene mungapite, zoyenera kutenga, ndi mmene mungatsatire."'::jsonb from courses where slug='getting-help-from-public-services'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Sambilila ifya kusanga ibufi lilingile ku mulimo, amapepala ya kupekanya, na ifya kucita nga icilombo cobe calekokola. Intampulo sha fya cila bushiku pamo nga NRC, kadi ya cipatala nangu icifulo ca maliketi."'::jsonb from courses where slug='getting-help-from-public-services'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Phunzirani kupeza ofesi yoyenera pa ntchito, zikalata zoyenera kukonza, ndi zoyenera kuchita ngati pempho lanu latenga nthawi yaitali. Masitepe a zinthu za tsiku ndi tsiku monga NRC, kadi ya chipatala kapena malo a msika."'::jsonb from courses where slug='getting-help-from-public-services'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Ishiba ibufi ilibomba umulimo nshi", "Pekanya amapepala yalingile ilintu ushilaya", "Ipusha mu kwanguka no kusunga amalembo", "Konkelulapo mu mucinshi nga ubwafwilisho bwakokola", "Ishiba uwa kuya kuli ena nga wakakatila"]'::jsonb from courses where slug='getting-help-from-public-services'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Dziwani ofesi iti imagwira ntchito iti", "Konzani zikalata zoyenera musanapite", "Funsani momveka ndi kusunga mbiri", "Tsatirani mwaulemu ngati thandizo lachedwa", "Dziwani woti mupite kwa ena ngati mwavutika"]'::jsonb from courses where slug='getting-help-from-public-services'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Insambu Shobe ku Lyashi"'::jsonb from courses where slug='your-right-to-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Ufulu Wanu wa Chidziwitso"'::jsonb from courses where slug='your-right-to-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Ifya kulomba amabufi ya buteko ilyashi ilyo ulefwaya."'::jsonb from courses where slug='your-right-to-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Mmene mungapemphere maofesi a boma chidziwitso chomwe mukufuna."'::jsonb from courses where slug='your-right-to-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Amabufi ya buteko yakwata ilyashi ilya bantu. Sambilila ifyo ninshi kuti walomba, ifya kulemba icilombo icyanguka, na intampulo isha kucita nga icilombo cobe cakaanwa."'::jsonb from courses where slug='your-right-to-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Maofesi a boma ali ndi chidziwitso cha anthu. Phunzirani zomwe mungapemphe, mmene mungalembere pempho losavuta, ndi masitepe oyenera ngati pempho lanu lakanidwa."'::jsonb from courses where slug='your-right-to-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Umfwikisha ilyashi ilyo kuti walomba", "Lemba icilombo icyabuta, icyanguka", "Sunga kopi na amalembo ya cilombo cobe", "Ishiba ifya kucita nga bakaana", "Konka intampulo shalingile isha kukatisha"]'::jsonb from courses where slug='your-right-to-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Mvetsetsani chidziwitso chomwe mungapemphe", "Lembani pempho lomveka, losavuta", "Sungani kopi ndi mbiri ya pempho lanu", "Dziwani zoyenera kuchita ngati akukanani", "Tsatirani masitepe oyenera a chidandaulo"]'::jsonb from courses where slug='your-right-to-information'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Ukutengako Lubali mu Mushi Obe"'::jsonb from courses where slug='taking-part-in-your-community'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Kutenga Nawo Mbali M''dera Lanu"'::jsonb from courses where slug='taking-part-in-your-community'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Landa, leta ubushinino, no kwafwa amapingulo ya kupangwa."'::jsonb from courses where slug='taking-part-in-your-community'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Yankhulani, bweretsani umboni, ndi kuthandiza zisankho kuti zipangidwe."'::jsonb from courses where slug='taking-part-in-your-community'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Amapingulo pa cifulo cobe yapangwa mu kukumana uko kuti watengako lubali. Sambilila ifya kupekanya, ifya kulanga icafya mu bushinino, na ifya kucita na bakankala na ba kansulu mu mucinshi."'::jsonb from courses where slug='taking-part-in-your-community'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Zisankho za dera lanu zimapangidwa m''misonkhano yomwe mungatenge nawo mbali. Phunzirani kukonzekera, kupereka vuto ndi umboni, ndi kuchita zinthu mwaulemu ndi akuluakulu ndi makhansala."'::jsonb from courses where slug='taking-part-in-your-community'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Ishiba uko amapingulo ya mushi yapangwa", "Pekanya ilintu ukukumana nangu ukufwailisha kushilaisa", "Langa icafya mu kwanguka, no bushinino", "Landa na bakankala mu mucinshi no mu kuyafwilisha", "Shimika icafya ca mushi no kucikonkelulapo"]'::jsonb from courses where slug='taking-part-in-your-community'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Dziwani kumene zisankho za dera zimapangidwa", "Konzekerani musanafike pa msonkhano kapena kufunsa", "Perekani vuto momveka, ndi umboni", "Lankhulani ndi akuluakulu mwaulemu ndi mothandiza", "Nenani vuto la dera ndi kulitsatira"]'::jsonb from courses where slug='taking-part-in-your-community'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Ifyo Ubuteko Bubomba"'::jsonb from courses where slug='how-government-works'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Mmene Boma Limagwirira Ntchito"'::jsonb from courses where slug='how-government-works'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Nani upanga amapingulo, na uku kuya ku cinshi."'::jsonb from courses where slug='how-government-works'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Ndani amapanga zisankho, ndi woti mupite kwa chiyani."'::jsonb from courses where slug='how-government-works'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Intangilishi iyanguka pa fyo ubuteko bwapangwa mu Zambia — ubwa calo conse, ubwa provinshi na ubwa mu mushi — ifyo cila lubali cibomba, na insambu ne milimo ukwata nga umwikashi."'::jsonb from courses where slug='how-government-works'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Chitsogozo chosavuta cha mmene boma la Zambia likhazikitsidwira — la dziko lonse, la chigawo ndi la komweko — zomwe mbali iliyonse imachita, ndi ufulu ndi maudindo omwe muli nawo ngati nzika."'::jsonb from courses where slug='how-government-works'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Ishiba amabashi ya buteko na fyo yabomba", "Umfwikisha insambu ne milimo yobe iyacitika", "Ishiba libashi libomba umusango nshi uwa cafya", "Ikale mu kushininkisha pa kubomba na mabufi ya buteko"]'::jsonb from courses where slug='how-government-works'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Dziwani magawo akuluakulu a boma ndi zomwe amachita", "Mvetsetsani ufulu ndi maudindo anu oyambira", "Dziwani gawo liti limagwira vuto la mtundu wanji", "Khalani odzidalira pochita ndi mabungwe a boma"]'::jsonb from courses where slug='how-government-works'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Ukumfwikisha Amabajeti ya Buteko"'::jsonb from courses where slug='understanding-public-budgets'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Kumvetsa Mabajeti a Boma"'::jsonb from courses where slug='understanding-public-budgets'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Uko indalama sha buteko shafuma na fyo shibomfiwa."'::jsonb from courses where slug='understanding-public-budgets'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Kumene ndalama za boma zimachokera ndi mmene zimagwiritsidwira."'::jsonb from courses where slug='understanding-public-budgets'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Amabajeti ya buteko yapingula imilimo iikapokelela indalama. Sambilila mu kwanguka uko indalama shafuma, ifyo ibajeti lipangwa, na ifya kwipusha amepusho yasuma pa kubomfya indalama mu cifulo cobe."'::jsonb from courses where slug='understanding-public-budgets'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Mabajeti a boma amasankha ntchito ziti zilandire ndalama. Phunzirani mosavuta kumene ndalama zimachokera, mmene bajeti imapangidwira, ndi mmene mungafunsire mafunso anzeru za kagwiritsidwe ka ndalama m''dera lanu."'::jsonb from courses where slug='understanding-public-budgets'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Umfwikisha uko indalama sha buteko shafuma", "Konka intampulo isha fyo ibajeti lipangwa", "Ishiba uko abantu kuti bapeela amano", "Ipusha amepusho yabuta, yasuma pa kubomfya"]'::jsonb from courses where slug='understanding-public-budgets'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Mvetsetsani kumene ndalama za boma zimachokera", "Tsatirani masitepe a mmene bajeti imapangidwira", "Dziwani kumene nzika zingapereke maganizo", "Funsani mafunso omveka, anzeru za kagwiritsidwe"]'::jsonb from courses where slug='understanding-public-budgets'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Ukucita Icilishanyo"'::jsonb from courses where slug='making-a-complaint'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Kupereka Chidandaulo"'::jsonb from courses where slug='making-a-complaint'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Ibufi lya kubomfya, ifya kulishanya mu kwanguka, na uko kuya ku pala."'::jsonb from courses where slug='making-a-complaint'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Ofesi yoti mugwiritse, mmene mungadandaulire momveka, ndi kumene mungapitirize."'::jsonb from courses where slug='making-a-complaint'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Ilintu umulimo wafilwa, icilishanyo icyabuta ku bufi lilingile cileta ifyo ulefwaya. Sambilila uwa kubomba icinshi, ifya kulemba icilishanyo icakosa, uko kuya ku pala, no kusambilila na scenario ya cine."'::jsonb from courses where slug='making-a-complaint'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Ntchito ikalephera, chidandaulo chomveka ku ofesi yoyenera chimabweretsa zotsatira. Phunzirani amene amagwira chiyani, mmene mungalembere chidandaulo champhamvu, kumene mungapitirize, ndi kuchita masewera a zenizeni."'::jsonb from courses where slug='making-a-complaint'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Linganya icafya ku bufi ilingile kucibomba", "Lemba icilishanyo icabuta, ica cine", "Ishiba uko kuya ku pala nga takuli ico cacitika", "Sambilila ukubomba icafya ca cine"]'::jsonb from courses where slug='making-a-complaint'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Yanjanitsani vuto ndi ofesi yoyenera kuligwira", "Lembani chidandaulo chomveka, choona", "Dziwani kumene mungapitirize ngati palibe chochitika", "Phunzirani kuthana ndi mkhalidwe weniweni"]'::jsonb from courses where slug='making-a-complaint'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'title', '"Insambu ne Milimo pa Digito"'::jsonb from courses where slug='digital-rights-and-responsibilities'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'title', '"Ufulu ndi Maudindo a Digito"'::jsonb from courses where slug='digital-rights-and-responsibilities'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'tagline', '"Cingilila ilyashi lyobe, ba uwa mucinshi, no kuceba ilintu ushilatuma."'::jsonb from courses where slug='digital-rights-and-responsibilities'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'tagline', '"Tetezani chidziwitso chanu, khalani waulemu, ndi kuonetsetsa musanagawire."'::jsonb from courses where slug='digital-rights-and-responsibilities'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'description', '"Buikalilo bwa digito bwaba pa kubomfya mafoni na intaneti mu mutelelwe no mu busakamana — ukucingilila ilyashi lyobe, ukucindika bambi, no kuceba ilyashi ilintu ushilalipitisha."'::jsonb from courses where slug='digital-rights-and-responsibilities'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'description', '"Unansi wa digito ndi kugwiritsa mafoni ndi intaneti mwachitetezo ndi udindo — kuteteza chidziwitso chanu, kulemekeza ena, ndi kuonetsetsa nkhani musanaipititse."'::jsonb from courses where slug='digital-rights-and-responsibilities'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'bem', 'outcomes', '["Cingilila ilyashi lyobe no bumfisolo", "Lanshanya mu mucinshi pa intaneti", "Ceba ilyashi ilintu ushilalituma", "Ishiba imilimo yobe nga umwikashi wa digito"]'::jsonb from courses where slug='digital-rights-and-responsibilities'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'course', id, 'nya', 'outcomes', '["Tetezani chidziwitso chanu ndi chinsinsi", "Lankhulani mwaulemu pa intaneti", "Onetsetsani nkhani musanagawire", "Zindikirani maudindo anu ngati nzika ya digito"]'::jsonb from courses where slug='digital-rights-and-responsibilities'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();

-- Lessons
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Amabatani na iskrini ya foni yobe"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='your-phone-buttons-and-screen'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Mabatani ndi skirini ya foni yanu"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='your-phone-buttons-and-screen'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ikata ibatani lya maka pa sekondi 3 ukwasha", "Ukukunta kukumya kwa panono", "Sunta mpela ukwifungula"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='your-phone-buttons-and-screen'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Gwirani batani la mphamvu masekondi 3 kuti muyatse", "Kukhudza ndi kukhudza kwakanthawi kochepa", "Kwizani mmwamba kuti mutsegule"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='your-phone-buttons-and-screen'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukwikatana ku data na Wi-Fi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='connecting-to-data'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kulumikiza ku data ndi Wi-Fi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='connecting-to-data'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Sunta pa mpela ukufuma ku muulu ku fisettingi fyanguka", "Zimya data nga taulebomfya", "Bomfyeni Wi-Fi fye ukufuma uko watetekela"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='connecting-to-data'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Kwizani pansi kuchokera pamwamba kuti mupeze ma seting afulumira", "Zimitsani data ngati simukugwiritsa", "Gwiritsani Wi-Fi kuchokera kumalo omwe mumadalira"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='connecting-to-data'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukwikilisha no kufumya app"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='installing-an-app'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kuika ndi kuchotsa app"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='installing-an-app'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ikilisha fye ama app ukufuma ku Play Store", "Ceba uwapangile app", "Fumya ama app ayo ushilebomfya"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='installing-an-app'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Ikani ma app kuchokera ku Play Store kokha", "Onani amene anapanga app", "Chotsani ma app omwe simukugwiritsa"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='installing-an-app'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe", "Belenga insankulo shonse"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu", "Werengani zosankha zonse"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukupanga password yakosa iyo kuti wibukisha"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='strong-passwords'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kupanga password yamphamvu yomwe mungakumbukire"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='strong-passwords'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Iitali yakosa ukucila iipi", "Bomfya amashiwi yatatu nangu yane pamo", "Wibomfya ubushiku bwa kufyalwa nangu 1234", "Bomfya password yapusanako ku cila akaunti"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='strong-passwords'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Yaitali ndi yamphamvu kuposa yaifupi", "Gwiritsani mawu atatu kapena anayi pamodzi", "Musagwiritse tsiku lobadwa kapena 1234", "Gwiritsani password yosiyana pa akaunti iliyonse"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='strong-passwords'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ifishibilo fya bucenjeshi mu mashiwi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='red-flags-of-scam-messages'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Zizindikiro za chinyengo mu mauthenga"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='red-flags-of-scam-messages'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Amakampani ya cine tayalomba PIN yobe", "Ukukakamya kwa bwangu cishibilo ca kusoka", "Wikofya ama link ukufuma ku beshibe", "Ceba pa kwita inomba ya cine"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='red-flags-of-scam-messages'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Makampani enieni samafunsa PIN yanu", "Kukakamiza mofulumira ndi chizindikiro cha chenjezo", "Musadine ma link ochokera kwa osadziwika", "Tsimikizani poimba nambala yeniyeni"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='red-flags-of-scam-messages'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Kaka foni yobe na PIN"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='lock-your-phone'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Tsekani foni yanu ndi PIN"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='lock-your-phone'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["PIN icingilila amashiwi na indalama shobe", "Wibomfya ubushiku bwa kufyalwa", "Wakana PIN yobe, nangu ku banobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='lock-your-phone'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["PIN imateteza mauthenga ndi ndalama zanu", "Musagwiritse tsiku lobadwa", "Musagawire PIN yanu, ngakhale kwa anzanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='lock-your-phone'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Panga adiresi yobe ya email"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='create-an-email'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Pangani adiresi yanu ya imelo"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='create-an-email'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Bomfya ishina lyobe ilya cine mu adiresi", "Sunga password yobe mu mutelelwe", "Ulefwaya email ku ncito na ku milimo"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='create-an-email'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Gwiritsani dzina lanu lenileni mu adiresi", "Sungani password yanu mwachitetezo", "Mumafuna imelo pa ntchito ndi ntchito za boma"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='create-an-email'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukucita video call"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='video-calls'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kuyimba vidiyo kolo"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='video-calls'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Video ibomfya data iingi ukucila ishiwi", "Ikala apali ulubuuto lusuma", "Kunta ibatani ilikashika ukupwisha"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='video-calls'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Vidiyo imagwiritsa data yambiri kuposa mawu", "Khalani pamalo a kuwala kwabwino", "Dinani batani lofiira kuti mumalize"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='video-calls'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Imicinshi mu group chat"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='group-chat-manners'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Ulemu mu gulu la chat"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='group-chat-manners'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ikala pa mutwe wa lyashi", "Ceba ilintu ushilatumulula", "Ipusha ilintu ushilalundapo abantu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='group-chat-manners'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Khalani pa mutu umodzi", "Onetsetsani musanatumizenso", "Funsani musanawonjezere anthu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='group-chat-manners'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Amepusho yatatu ilintu ushilatuma"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='three-questions'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Mafunso atatu musanagawire"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='three-questions'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Nani watumine kutanga?", "Caba pa lyashi ilya cine?", "Ukuyumfwa kwa maka kupilibula ukusyukuluka"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='three-questions'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Ndani anatumiza choyamba?", "Chili pa nkhani yodalirika?", "Mantha amphamvu akutanthauza chedwani"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='three-questions'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Amafoto ya kale, amalyashi mapya"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='old-photos-new-stories'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Zithunzi zakale, nkhani zatsopano"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='old-photos-new-stories'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Amafoto kuti yaba ya kale nangu yasintwa", "Fwaya ifishibilo mu cifwani", "Nga tausuminisha, wituma"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='old-photos-new-stories'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Zithunzi zingakhale zakale kapena zosinthidwa", "Funani zizindikiro mu chithunzi", "Ngati simukutsimikiza, musagawire"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='old-photos-new-stories'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukubomba: ceba lyashi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='check-a-message'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Chochita: onetsetsani uthenga"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='check-a-message'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Indalama sha mahala pamo ne link cishibilo ca kusoka", "Wituma inomba ya NRC pa link", "Ceba ifyakufuma ifya cine"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='check-a-message'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Ndalama zaulere pamodzi ndi link ndi chizindikiro cha chenjezo", "Musatumize nambala ya NRC pa link", "Onani njira zovomerezeka"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='check-a-message'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukutuma indalama intambi ne ntambi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='sending-money'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kutumiza ndalama sitepe ndi sitepe"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='sending-money'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Belenga iskrini ya kusuminisha cila nshita", "Ingisha PIN yobe pa mpela", "Sunga SMS ya kusuminisha"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='sending-money'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Werengani skirini yotsimikiza nthawi zonse", "Lowetsani PIN yanu pomaliza", "Sungani SMS yotsimikiza"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='sending-money'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukuceba inomba ilintu ushilatuma"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='check-the-number'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kuyang''ana nambala musanatumize"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='check-the-number'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Iskrini ya kusuminisha ilanga ishina lya kapokelela", "Lekelesha nga ishina te lyalungama", "Sunga inomba isho ubomfya ilingi"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='check-the-number'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Skirini yotsimikiza imaonetsa dzina la wolandira", "Lekani ngati dzina silolondola", "Sungani manambala omwe mumagwiritsa kawirikawiri"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='check-the-number'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ubucenjeshi bwa kubweshako bwa bufi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='fake-reversal-scam'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Chinyengo cha kubweza kwabodza"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='fake-reversal-scam'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Lyonse ceba ibalansi yobe iya cine", "SMS ya bufi ifuma ku manomba ya foni ya cinkombalume", "Ukubweshako kwa cine kupita mu network"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='fake-reversal-scam'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Nthawi zonse onani balansi yanu yeniyeni", "SMS yabodza imachokera ku manambala wamba a foni", "Kubweza kweniweni kumadutsa mu netiweki"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='fake-reversal-scam'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukulemba CV pa foni yobe"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='cv-on-your-phone'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kulemba CV pa foni yanu"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='cv-on-your-phone'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Lenga CV yobe pa pepala limo", "Bikapo imilimo yonse, nangu iya cinkombalume", "Isunge nga PDF"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='cv-on-your-phone'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Sungani CV yanu pa tsamba limodzi", "Phatikizani ntchito zonse, ngakhale zosapanga", "Sungani ngati PDF"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='cv-on-your-phone'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukwishiba incito sha bufi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='fake-job-offers'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kuzindikira ntchito zabodza"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='fake-job-offers'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Bakashi ba cine tabakulipisha ukufwaya incito", "Umulambu uukalamba nnjo cishibilo ca kusoka", "Ceba ukuti kuli adiresi ya cine"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='fake-job-offers'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Olemba enieni samakulipirani kuti mufunse ntchito", "Malipiro okwera kwambiri ndi chizindikiro cha chenjezo", "Onetsetsani kuti pali adiresi yeniyeni"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='fake-job-offers'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukutuma ukufwaya incito pa email"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='send-an-application'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kutumiza pempho pa imelo"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='send-an-application'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Lemba umutwe uubuta", "Lenga lyashi ilipi ne lya mucinshi", "Kakatika CV yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='send-an-application'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Lembani mutu womveka", "Sungani uthenga waufupi ndi waulemu", "Phatikizani CV yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='send-an-application'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukupanga profaile ya makwebo"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-profile'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kupanga profail ya bizinesi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-profile'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Bakashiti balefwaya ishina, icifulo ne nshita shobe", "Bomfya ifoto ya profaile iyabuta", "Bomfya WhatsApp Business ku shopu yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-profile'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Makasitomala amafuna dzina, malo ndi maola anu", "Gwiritsani chithunzi cha profail chomveka", "Gwiritsani WhatsApp Business pa shopu yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-profile'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukukwata amafoto yasuma ya fyo ushitisha"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='product-photos'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kujambula zithunzi zabwino za katundu"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='product-photos'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Bomfya ulubuuto lwa kasuba", "Panuma papabula ifingi", "Pukuta linzi lyobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='product-photos'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Gwiritsani kuwala kwa dzuwa", "Kumbuyo kopanda zambiri", "Pukutani lenzi lanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='product-photos'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukupokelela indalama mu mutelelwe"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='safe-payments'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kulandira malipiro mwachitetezo"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='safe-payments'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ceba ibalansi yobe ilintu ushilapeela ifintu", "Sunga amalembo ya cila kushitisha"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='safe-payments'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Onani balansi yanu musanapereke katundu", "Sungani mbiri ya kugulitsa kulikonse"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='safe-payments'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Insambu shobe pa intaneti"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='your-rights-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Ufulu wanu pa intaneti"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='your-rights-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ilyashi lyobe licingililwe ku mafunde", "Kuti waipusha ilyashi ilyo balekwata pali iwe", "Kuti walomba ukuwamya"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='your-rights-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Chidziwitso chanu chimatetezedwa ndi malamulo", "Mungafunse chidziwitso chomwe ali nacho za inu", "Mungapemphe kukonza"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='your-rights-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukubomba no kututuma pa intaneti"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='dealing-with-bullying'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kuthana ndi nyozo pa intaneti"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='dealing-with-bullying'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Wasuka", "Sunga ubushinino", "Kaka no kushimika", "Eba umuntu uo watetekela"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='dealing-with-bullying'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Musayankhe", "Sungani umboni", "Tsekani ndi kunena", "Uzani munthu amene mumadalira"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='dealing-with-bullying'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukulinganya inshita ya pa iskrini"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='screen-time-balance'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kulinganiza nthawi ya pa skirini"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='screen-time-balance'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ukulya ukwabula foni", "Takuli iskrini ilintu ushilalaala", "Zimya inotifikeshoni ishalingile"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='screen-time-balance'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Kudya kopanda foni", "Palibe skirini musanagone", "Zimitsani zidziwitso zosafunikira"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='screen-time-balance'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ibufi libomba cinshi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='which-office-does-what'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Ofesi iti imagwira chiyani"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='which-office-does-what'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Kansulu abomba maliketi, imfwi na ama laisensi ya makwebo", "Ifipatala fibomba amakadi ya cipatala", "Amabufi ya kulemba yabomba NRC", "Kansulu wa ward yobe kuti akutungulula"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='which-office-does-what'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Khansala imagwira misika, zinyalala ndi malaisensi a malonda", "Zipatala zimagwira makadi a chipatala", "Maofesi olembetsa amagwira NRC", "Khansala wa ward wanu angakulozereni njira"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='which-office-does-what'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ifya kusenda na fya kwipusha"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='what-to-bring-and-how-to-ask'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Zotenga ndi mmene mungafunsire"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='what-to-bring-and-how-to-ask'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Senda NRC yobe no kuleta amakopi ya mapepala", "Landa ifyo ulefwaya mu kashiwi kamo akabuta", "Lemba ishina lya kabomfi", "Ipusha ukuti cikatola inshita nshi"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='what-to-bring-and-how-to-ask'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani NRC yanu ndi kubweretsa makopi a zikalata", "Nenani zomwe mukufuna mu chiganizo chimodzi chomveka", "Lembani dzina la wogwira ntchito", "Funsani kuti zitenga nthawi yotani"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='what-to-bring-and-how-to-ask'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ilintu ubwafwilisho bwakokola"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='when-help-is-delayed'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Pamene thandizo lachedwa"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='when-help-is-delayed'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Konkelulapo mu mutende no kupeela refarensi yobe", "Ipusha ukuti icilombo cobe cili pa ntampulo nshi", "Lemba cila kulanshanya", "Lomba supavaiza nangu kansulu nga wakakatila"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='when-help-is-delayed'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tsatirani mwamtendere ndi kupereka refarensi yanu", "Funsani kuti pempho lanu lili pa sitepe yanji", "Lembani kukambirana kulikonse", "Pemphani supavaiza kapena khansala ngati mwavutika"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='when-help-is-delayed'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ilyashi ilyo kuti walomba"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-you-can-ask-for'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Chidziwitso chomwe mungapemphe"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-you-can-ask-for'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ilyashi lya buteko lya bantu", "Kuti waipusha ifyo umulimo nangu projekiti ubomba", "Ilingi tawakabila ukupeela umulandu", "Ilyashi limo ilya bumfisolo licingililwe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-you-can-ask-for'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Chidziwitso cha boma ndi cha anthu", "Mungafunse mmene ntchito kapena projekiti imagwirira", "Kawirikawiri simufunika kupereka chifukwa", "Chidziwitso china cha chinsinsi chimatetezedwa"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-you-can-ask-for'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukulemba icilombo icyanguka"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='writing-a-simple-request'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kulemba pempho losavuta"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='writing-a-simple-request'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Landa nani iwe na cinshi ulefwaya", "Ba uwakulungatika pa projekiti nangu ibufi", "Sunga kopi ya cilombo cobe", "Lomba ubushinino ubwa kuti bapokelele"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='writing-a-simple-request'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Nenani kuti ndinu ndani ndi chomwe mukufuna", "Khalani womveka bwino pa projekiti kapena ofesi", "Sungani kopi ya pempho lanu", "Pemphani umboni woti analandira"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='writing-a-simple-request'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Nga batila awe"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='if-they-say-no'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Ngati anena ayi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='if-they-say-no'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Lomba umulandu wa kukaana mu kulemba", "Ipusha ifya kukatisha nangu uwa kuya kuli ena", "Sunga amakopi yobe no mulandu", "Fwaya ubwafwilisho ku ba civil society nangu legal aid"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='if-they-say-no'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Pemphani chifukwa cha kukana m''kalembedwe", "Funsani mmene mungaperekere madandaulo kapena woti mupite kwa ena", "Sungani makopi anu ndi chifukwa", "Funani thandizo kwa civil society kapena legal aid"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='if-they-say-no'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Uko amapingulo yapangwa"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='where-decisions-are-made'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kumene zisankho zimapangidwa"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='where-decisions-are-made'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ukukumana kwa ward kwaisuka ku bekashi", "Amapulani na amabajeti yalanshanishiwa kulya", "Redio na amabodi ya ku lupanga yalanga inshiku", "Ukutengako lubali kwafwa amapingulo ukulanga ifyo abantu bakabila"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='where-decisions-are-made'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Misonkhano ya ward ndi yotsegukira okhalamo", "Mapulani ndi mabajeti amakambidwa kumeneko", "Wailesi ndi mabodi amadziwitsa masiku", "Kutenga nawo mbali kumathandiza zisankho kuonetsa zosowa zenizeni"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='where-decisions-are-made'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Landa no bushinino"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='speak-up-with-evidence'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yankhulani ndi umboni"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='speak-up-with-evidence'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Sala ipusho limo ilyo ulefwaya ukulanda", "Leta ubushinino buuzaza: ifoto, ubushiku, inomba", "Ikala tuntulu no mucinshi", "Peela amano, te kulishanya fye"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='speak-up-with-evidence'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Sankhani mfundo imodzi yomwe mukufuna kunena", "Bweretsani umboni wosavuta: chithunzi, tsiku, nambala", "Khalani odekha ndi aulemu", "Perekani maganizo, osati kudandaula kokha"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='speak-up-with-evidence'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukushimika icafya ca mushi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='reporting-a-community-problem'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kunena vuto la dera"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='reporting-a-community-problem'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Shimika ku kansulu nangu ibufi ililingile", "Landa uko, inshita nshi, na bangaa bakumwa", "Ipusha ifikacitika ukukonkapo na lilali", "Konkelulapo no kuleta pa kukumana nga cakabila"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='reporting-a-community-problem'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Nenani kwa khansala kapena ofesi yoyenera", "Nenani kumene, nthawi yotani, ndi angati akhudzidwa", "Funsani zotsatira ndi liti", "Tsatirani ndi kubweretsa pa msonkhano ngati kufunika"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='reporting-a-community-problem'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Nani upanga amafunde"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='who-makes-the-rules'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Ndani amapanga malamulo"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='who-makes-the-rules'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ubuteko bwa calo bupanga amafunde no kubomfya ama ministri", "Ubuteko bwa provinshi bulinganya iprovinshi", "Ama kansulu ya mu mushi yabomfya imilimo ya cila bushiku", "Ukwishiba libashi kukwafwa ukusanga ibufi lilingile"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='who-makes-the-rules'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Boma la dziko limapanga malamulo ndi kuyendetsa ma unduna", "Oyang''anira chigawo amagwirizanitsa chigawo", "Makhansala am''deralo amayendetsa ntchito za tsiku ndi tsiku", "Kudziwa gawo kumathandiza kupeza ofesi yoyenera"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='who-makes-the-rules'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Insambu ne milimo yobe"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='your-rights-and-responsibilities'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Ufulu ndi maudindo anu"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='your-rights-and-responsibilities'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Wakwata insambu ku milimo, lyashi no kutengako lubali", "Insambu shisa pamo no kucitilwa ifyalungama", "Imilimo yabikapo ukukonka ifunde no kulipila imisonko iyalungama", "Ukutengako lubali nsambu kabili mulimo"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='your-rights-and-responsibilities'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Muli ndi ufulu ku ntchito, chidziwitso ndi kutenga nawo mbali", "Ufulu umabwera ndi kuchitidwa moyenera", "Maudindo akuphatikiza kutsatira lamulo ndi kulipira misonkho yoyenera", "Kutenga nawo mbali ndi ufulu komanso udindo"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='your-rights-and-responsibilities'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Uwa kuya kuli ena ku cinshi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='who-to-go-to-for-what'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Woti mupite kwa chiyani"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='who-to-go-to-for-what'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Kansulu: maliketi, imfwi, ifisebo, ama laisensi", "Icipatala: amakadi ya cipatala ne milimo ya bumi", "Ibufi lya kulemba: NRC no kufyalwa", "Kansulu wa ward: ifya mu mushi ne ntungululo"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='who-to-go-to-for-what'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Khansala: misika, zinyalala, ngalande, malaisensi", "Chipatala: makadi a chipatala ndi ntchito za thanzi", "Ofesi yolembetsa: NRC ndi kubadwa", "Khansala wa ward: zovuta za m''deralo ndi malangizo"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='who-to-go-to-for-what'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Uko indalama sha buteko shafuma"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='where-public-money-comes-from'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kumene ndalama za boma zimachokera"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='where-public-money-comes-from'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Indalama sha buteko shafuma maka ku misonko ne ndalama sha milimo", "Ama levi na ama laisensi nayo yaafwilisha", "Shimo shafuma ku fyabupe ne nkongole", "Indalama sha buteko cipilibula abantu kuti baipusha ifyo shibomfiwa"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='where-public-money-comes-from'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Ndalama za boma zimachokera makamaka ku misonkho ndi zolipira", "Malevi ndi malaisensi nawonso amathandizira", "Zina zimachokera ku mphatso ndi ngongole", "Ndalama za boma zikutanthauza anthu angafunse mmene zimagwiritsidwira"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='where-public-money-comes-from'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ifyo ibajeti lipangwa"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='how-a-budget-is-decided'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Mmene bajeti imapangidwira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='how-a-budget-is-decided'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ibajeti lipulani lya kubomfya indalama lya mwaka", "Likonka: ukupeela amano, ukusuminisha, ukubomfya, no kushimika", "Ukufwailisha nkuko abantu bapeela amano", "Inshita yacindama — peela amano ilintu lishilapwililishiwa"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='how-a-budget-is-decided'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Bajeti ndi pulani la chaka la kagwiritsidwe ka ndalama", "Imatsatira: kupereka, kuvomereza, kugwiritsa, ndi kufotokoza", "Kukafunsa ndi kumene nzika amapereka maganizo", "Nthawi ndi yofunika — perekani maganizo lisanamalizidwe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='how-a-budget-is-decided'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukwipusha amepusho yasuma pa kubomfya"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='asking-good-questions-about-spending'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kufunsa mafunso abwino a kagwiritsidwe"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='asking-good-questions-about-spending'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Bika cila ipusho pa projekiti imo", "Ipusha ifyabajetiwa na fyabomfiwa, na fyapeelwe", "Lomba imibalo na inshiku, te kupeela umulandu", "Sunga amalembo ya masuko ayo wapokelela"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='asking-good-questions-about-spending'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Ikani funso lililonse pa projekiti imodzi", "Funsani zomwe zinabajetiwa ndi zomwe zinagwiritsidwa, ndi zomwe zinaperekedwa", "Pemphani manambala ndi masiku, osati kuimba mlandu", "Sungani mbiri ya mayankho omwe mwalandira"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='asking-good-questions-about-spending'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ibufi libomba icafya cobe"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='which-office-handles-your-concern'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Ofesi iti imagwira vuto lanu"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='which-office-handles-your-concern'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Linganya icafya ku bufi ililecita", "Kansulu abomba amenshi, imfwi, ifisebo, maliketi", "Ifya bumi fiya ku cipatala, lyena ku bufi lya distrikiti", "Kansulu wa ward yobe kuti akutungulula"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='which-office-handles-your-concern'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Yanjanitsani vuto ndi ofesi yoyenera kuchita", "Khansala imagwira madzi, zinyalala, ngalande, misika", "Zathanzi zimapita ku chipatala, kenako ku ofesi ya boma", "Khansala wa ward wanu angakulozereni"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='which-office-handles-your-concern'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukulemba icilishanyo icabuta"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='writing-a-clear-complaint'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kulemba chidandaulo chomveka"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='writing-a-clear-complaint'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Landa icacitike, uko na lilali", "Peela ifya cine: inshiku, incende, abakumwa", "Landa mu kwanguka ico ulefwaya cicitwe", "Sunga kopi no bushinino ubwa kuti bapokelele"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='writing-a-clear-complaint'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Nenani zomwe zinachitika, kumene ndi liti", "Perekani zoona: masiku, malo, akhudzidwa", "Nenani momveka chomwe mukufuna kuchitidwa", "Sungani kopi ndi umboni woti analandira"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='writing-a-clear-complaint'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Nga takuli ico cacitika"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='if-nothing-happens'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Ngati palibe chochitika"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='if-nothing-happens'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Konkelulapo no kupeela refarensi yobe", "Lomba supavaiza nangu ibufi lya pa muulu", "Leta pa kukumana kwa mushi ukukosha", "Sunga amalembo; fwaya ubwafwilisho nga wakakatila"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='if-nothing-happens'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tsatirani ndi kupereka refarensi yanu", "Pemphani supavaiza kapena ofesi yapamwamba", "Bweretsani pa msonkhano wa dera kuti zikhale zamphamvu", "Sungani mbiri; funani thandizo ngati mwavutika"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='if-nothing-happens'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Scenario: Icafya icishilapwa"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Masewera: Vuto losathetsedwa"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ilingi kuli insankulo ishacila pa imo iyalungama", "Ifyasuko filondolola ico cimo cibomba bwino"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Kawirikawiri pali zosankha zoposa imodzi zomveka", "Mayankho amafotokoza chifukwa chimodzi chimagwira bwino"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ilyashi lyobe no bumfisolo"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='your-data-and-privacy'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Chidziwitso chanu ndi chinsinsi"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='your-data-and-privacy'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Cingilila inomba yobe ya NRC, ama PIN na ama password", "Wakana ifyakuma iwe ku beshibe", "Bomfya icikako ca iskrini na password yakosa", "Tontonkanya ilintu ama app yalefwaya ilyashi lyobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='your-data-and-privacy'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tetezani nambala yanu ya NRC, ma PIN ndi mapassword", "Musagawire zinthu zanu kwa osadziwika", "Gwiritsani chotseka cha skirini ndi password yamphamvu", "Ganizirani ma app akafuna chidziwitso chanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='your-data-and-privacy'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ukuba uwa mucinshi pa intaneti"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='being-respectful-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Kukhala waulemu pa intaneti"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='being-respectful-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ba uwa mucinshi, nangu nga tausuminishanya", "Wakana amashiwi nangu amafoto ya bumfisolo ya bambi", "Amashiwi ya pa intaneti yasalanganafye no kwikala", "Shimika ubututuma, ukutiinya no bucenjeshi"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='being-respectful-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Khalani waulemu, ngakhale musagwirizane", "Musagawire mauthenga kapena zithunzi za chinsinsi za ena", "Mawu a pa intaneti amafalikira kutali ndi kukhalitsa", "Nenani nyozo, kuopseza ndi chinyengo"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='being-respectful-online'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Scenario: Bushe ulingile ukutuma?"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Masewera: Kodi muyenera kugawira?"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Ukuceba intanshi kucingilila iwe na bambi", "Ifyasuko filondolola insankulo iya mutelelwe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Kuyang''ana poyamba kumateteza inu ndi ena", "Mayankho amafotokoza chosankha chotetezeka"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'title', '"Ceba ifyo wasambilile"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'title', '"Yesani zomwe mwaphunzira"'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'bem', 'key_points', '["Pokelela inshita yobe"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'lesson', l.id, 'nya', 'key_points', '["Tengani nthawi yanu"]'::jsonb from lessons l join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz'
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();

-- Quiz questions
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Libashi nshi ililingi libomfya imilimo ya cila bushiku pamo nga maliketi ne mfwi?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Gawo liti nthawi zambiri limayendetsa ntchito za tsiku ndi tsiku monga misika ndi zinyalala?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ubuteko bwa calo", "Kansulu wa mu mushi", "Uwapeela indalama wa ku calo cimbi", "Amakoti"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Boma la dziko", "Khansala wa m''deralo", "Wopereka ndalama wa kunja", "Makhothi"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ama kansulu ya mu mushi yabomfya imilimo ya cila bushiku pamo nga maliketi, imisebo, imfwi na ama laisensi ya makwebo."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Makhansala am''deralo amayendetsa ntchito za tsiku ndi tsiku monga misika, misewu, zinyalala ndi malaisensi a malonda."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Ukutengako lubali mu kukumana no kuvota kwalondololwa bwino nga:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Kutenga nawo mbali m''misonkhano ndi kuvota kumafotokozedwa bwino ngati:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Insambu fye", "Umulimo fye", "Insambu kabili umulimo", "Takwaba"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Ufulu wokha", "Udindo wokha", "Ufulu komanso udindo", "Palibe"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ukutengako lubali nsambu iyo ukwata kabili mulimo uukalenga imishi ukubomba."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Kutenga nawo mbali ndi ufulu womwe muli nawo komanso udindo womwe umapangitsa madera kugwira ntchito."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='how-government-works' and l.slug='government-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Ilintu ushilacita video call pa data, ufwile:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Musanaimbe vidiyo kolo pa data, muyenera:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ukuceba ukuti wakwata data iyakumana", "Ukuzimya foni yobe", "Ukufumya ama app yonse", "Ukusintha password yobe"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Kuonetsetsa kuti muli ndi data yokwanira", "Kuzimitsa foni yanu", "Kuchotsa ma app onse", "Kusintha password yanu"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ama video call yabomfya data iingi, kanshi shininkisha ukuti bundle yobe yakumana nangu bomfya Wi-Fi iyo watetekela."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Ma vidiyo kolo amagwiritsa data yambiri, choncho onetsetsani kuti bundle yanu yakwanira kapena gwiritsani Wi-Fi yodalirika."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Cinshi imicinshi isuma mu group chat?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Ndi chiyani ulemu wabwino mu gulu la chat?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ukutumulula cila lyashi", "Ukulundapo abantu ukwabula ukwipusha", "Ukwikala pa mutwe wa lyashi", "Ukutuma ama voice note ayengi ubushiku"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Kutumizanso uthenga uliwonse", "Kuwonjezera anthu osafunsa", "Kukhala pa mutu umodzi", "Kutumiza ma voisi noti ambiri usiku"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ukwikala pa mutwe wa lyashi kulenga group ukuba iyawama ku bonse."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Kukhala pa mutu umodzi kumapangitsa gulu kukhala lothandiza kwa aliyense."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='talking-and-working-online' and l.slug='communication-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Nani ilingi uabomba maliketi, imfwi na ama laisensi ya makwebo?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Ndani nthawi zambiri amagwira misika, zinyalala ndi malaisensi a malonda?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Icipatala", "Kansulu wa mu mushi", "Isukulu", "Bapokola"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Chipatala", "Khansala wa m''deralo", "Sukulu", "Apolisi"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Kansulu wa mu mushi uabomba maliketi, imfwi, ama laisensi ya makwebo ne milimo iingi iya mushi."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Khansala wa m''deralo amagwira misika, zinyalala, malaisensi a malonda ndi ntchito zambiri za dera."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Icilombo cobe cakokola. Cinshi intampulo isuma iya kutanga?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Pempho lanu latenga nthawi. Ndi sitepe yabwino yanji yoyamba?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ukuleka", "Ukukonkelulapo mu mutende no kupeela refarensi yobe", "Ukulishanya na bonse mu kupunda", "Ukutendekulula kabili ukufuma ku ntanshi"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Kusiya", "Kutsatira mwamtendere ndi kupereka refarensi yanu", "Kudandaula mokweza kwa aliyense", "Kuyambiranso kuchokera pachiyambi"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Konkelulapo mu mutende, peela refarensi yobe nangu ishina lya kabomfi, no kwipusha ukuti cili pa ntampulo nshi."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Tsatirani mwamtendere, perekani refarensi yanu kapena dzina la wogwira ntchito, ndi kufunsa kuti lili pa sitepe yanji."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-help-from-public-services' and l.slug='public-services-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Lilali ufwile ukupeela ifintu ifyalipilwa na indalama sha pa foni?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Ndi liti muyenera kupereka katundu wolipira ndi ndalama za pafoni?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ilintu wamona SMS", "Panuma pa kuceba ibalansi yobe iya cine", "Ilintu lishilalipilwa", "Ilintu kashiti atila nalipila"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Mukaona SMS", "Mutayang''ana balansi yanu yeniyeni", "Lisanalipidwe", "Kasitomala akanena kuti walipira"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"SMS kuti yaba ya bufi. Ibalansi yobe iya cine e bushinino bweka."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"SMS ingakhale yabodza. Balansi yanu yeniyeni ndiye umboni wokhawo."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Cinshi cilenga ifoto isuma iya cishitishiwa?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Ndi chiyani chimapanga chithunzi chabwino cha katundu?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Umwiputulwa uwafiita", "Panuma papabula ifingi", "Ulubuuto lwa kasuba na panuma papabula ifingi", "Linzi lyafiififya"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Chipinda chamdima", "Kumbuyo kotanganidwa", "Kuwala kwa dzuwa ndi kumbuyo kopanda zambiri", "Lenzi losaoneka bwino"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ulubuuto lwa kasuba na panuma papabula ifingi fulanga icishitishiwa mu kwanguka."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Kuwala kwa dzuwa ndi kumbuyo kopanda zambiri zimaonetsa katundu wanu momveka."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='running-a-business-online' and l.slug='business-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Password nshi iyakosisha?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Ndi password iti yamphamvu kwambiri?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["1234", "Chanda1990", "MangoTreeKitwe2009Rain", "password"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["1234", "Chanda1990", "MangoTreeKitwe2009Rain", "password"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ama password yatali ayapangwa na mashiwi ayengi yakosa ukuyelenganya, lelo yanguka kuli iwe ukwibukisha."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Mapassword aatali opangidwa ndi mawu angapo ndi ovuta kuganizira, komabe osavuta kwa inu kukumbukira."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Ilyashi litila akaunti kobe kakakwa nga taatumine PIN yobe. Cinshi ufwile ukucita?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Uthenga ukunena kuti akaunti yanu idzatsekedwa ngati simutumiza PIN yanu. Muyenera kuchita chiyani?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Tuma PIN bwangu", "Asuka ukulomba inshita iingi", "Shiya no kwita inomba ya cine", "Tumina banobe"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Tumizani PIN mofulumira", "Yankhani mukupempha nthawi yowonjezera", "Lekani ndi kuimba nambala yovomerezeka", "Tumizani kwa anzanu"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Amakampani ya cine tayalomba PIN yobe. Ita inomba ya cine nga walesakamana."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Makampani enieni samafunsa PIN yanu. Imbani nambala yovomerezeka ngati muli ndi nkhawa."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='staying-safe-online' and l.slug='safety-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Funde nshi ilicingilila ilyashi lya bumuntu mu Zambia?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Ndi lamulo liti limateteza chidziwitso chaumwini mu Zambia?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Data Protection Act ya 2021", "Roads Act", "Takuli funde", "Mining Act"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Data Protection Act ya 2021", "Roads Act", "Palibe lamulo", "Mining Act"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Data Protection Act No. 3 ya 2021 icingilila ilyashi lyobe ilya bumuntu."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Data Protection Act No. 3 ya 2021 imateteza chidziwitso chanu chaumwini."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Umuntu alekututuma pa intaneti. Cinshi ushingacita?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Wina akukunyozani pa intaneti. Ndi chiyani chomwe simuyenera kuchita?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Sunga ubushinino", "Mukake", "Asuka mu cifukushi", "Eba umuntu uo watetekela"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Sungani umboni", "Mutseke", "Yankhani mwamkwiyo", "Uzani munthu amene mumadalira"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ukwasuka kuti kwalenga ukwipishe. Sunga ubushinino, kaka, shimika no kulanda na umuntu."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Kuyankha kungapangitse zinthu kuipiraipira. Sungani umboni, tsekani, nenani ndi kukambirana ndi wina."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='being-a-good-digital-citizen' and l.slug='citizenship-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Kwi amapingulo ayengi pa cifulo cobe yalanshanishiwa?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Kodi zisankho zambiri za dera lanu zimakambidwa kuti?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Mu bumfisolo fye", "Ukukumana kwa ward no kufwailisha kwa bonse", "Pa televishoni fye", "Takuli uko ushingaya"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Mwachinsinsi kokha", "Misonkhano ya ward ndi kufunsa kwa anthu onse", "Pa wailesi yakanema kokha", "Palibe kumene mungapite"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ukukumana kwa ward, ukwa kansulu no kufwailisha kwa bonse kwaisuka ku bekashi."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Misonkhano ya ward, ya khansala ndi kufunsa kwa anthu onse ndi zotsegukira okhalamo."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Cinshi cilenga ipusho ukwikata bwino pa kukumana?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Ndi chiyani chimapangitsa mfundo kukhazikika bwino pa msonkhano?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ukupunda ukucila bonse", "Ukuba uwabuta no kuleta ubushinino", "Ukulanda pa nshita iitali", "Ukupeela umuntu umo umulandu"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Kukuwa mokweza kuposa onse", "Kukhala womveka ndi kubweretsa umboni", "Kuyankhula nthawi yaitali", "Kuimba munthu mmodzi mlandu"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ipusho ilyabuta ililetwa no bushinino buuzaza, ilyapeelwa mu mucinshi, lyikata bwino."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Mfundo yomveka yothandizidwa ndi umboni wosavuta, yoperekedwa mwaulemu, imakhazikika bwino."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='taking-part-in-your-community' and l.slug='participation-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Cinshi ufwile ukuceba ilintu ushilaingisha PIN ukutuma indalama?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Muyenera kuyang''ana chiyani musanalowetse PIN kutumiza ndalama?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Icalo", "Ishina lya kapokelela pa iskrini", "Batali yobe", "Inshita"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Nyengo", "Dzina la wolandira pa skirini", "Batri yanu", "Nthawi"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Iskrini ya kusuminisha ilanga uwa kupokelela indalama. Nga ishina te lyalungama, lekelesha."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Skirini yotsimikiza imaonetsa amene adzalandira ndalama. Ngati dzina silolondola, lekani."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Wapokelela SMS iitila wapokelela K500 na umwenso alekulomba ukubweshako. Cinshi ucita ntanshi?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Mulandira SMS yonena kuti mwalandira K500 ndipo wachilendo akufunsa kuti mubweze. Mumachita chiyani poyamba?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Bweshako", "Ceba ibalansi yobe iya cine", "Ita umwenso", "Fuuta akaunti kobe"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Bwezani", "Onani balansi yanu yeniyeni", "Imbani wachilendo", "Chotsani akaunti yanu"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ama SMS ya bufi yalibikwa. Ceba ibalansi yobe iya cine ukupitila mu menyu ya cine."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Ma SMS abodza ndi ofala. Onani balansi yanu yeniyeni kudzera mu menyu yovomerezeka."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='mobile-money-made-safe' and l.slug='mobile-money-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Ilintu wipusha ibufi lya buteko ilyashi, ilingi iwe:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Mukafunsa ofesi ya boma chidziwitso, nthawi zambiri inu:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ufwile ukulipila indalama iikalamba", "Tawakabila lyonse ukupeela umulandu", "Ufwaya kalata wa mafunde", "Tawakwanisha ukwipusha nakalya"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Muyenera kulipira ndalama zambiri", "Simufunika nthawi zonse kupereka chifukwa", "Mukufuna loya", "Simungafunse ngakhale pang''ono"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ilingi tawakabila ukupeela umulandu. Ilyashi lya buteko ilingi kuti lyabulwa pa kulomba."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Kawirikawiri simufunika kupereka chifukwa. Chidziwitso cha boma chambiri chingaperekedwe mukapempha."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Nga icilombo cobe ica lyashi cakaanwa, intampulo isuma kucita:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Ngati pempho lanu la chidziwitso lakanidwa, sitepe yabwino ndi:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ukucilaba", "Ukulomba umulandu ne fya kukatisha", "Ukusanshana mu cifukushi", "Ukulipila umuntu ukucikakamya"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Kuchiwala", "Kupempha chifukwa ndi mmene mungaperekere madandaulo", "Kukangana mwamkwiyo", "Kulipira munthu kuti akakamize"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Lomba umulandu mu kulemba na fya kukatisha nangu uwa kuya kuli ena."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Pemphani chifukwa m''kalembedwe ndi mmene mungaperekere madandaulo kapena woti mupite kwa ena."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='your-right-to-information' and l.slug='information-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Indalama sha buteko ishingi shafuma kwi?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Ndalama za boma zambiri zimachokera kuti?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ku nkongole sha ku calo cimbi fye", "Ku misonko, indalama sha milimo na ama levi", "Ku fyabupe fye", "Shisapwa fye apabula umulandu"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Ku ngongole za kunja kokha", "Ku misonkho, zolipira ndi malevi", "Ku mphatso zokha", "Zimasindikizidwa mwaulere"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Indalama sha buteko ishingi shafuma ku misonko, kumo ne ndalama sha milimo na ama levi, na shimo ku fyabupe ne nkongole."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Ndalama za boma zambiri zimachokera ku misonkho, pamodzi ndi zolipira ndi malevi, ndi zina ku mphatso ndi ngongole."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Ipusho ilisuma pa projekiti:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Funso labwino la projekiti ndi:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Nani tupeela umulandu?", "Indalama shinga shabajetiwa, shabomfiwa, na cinshi capeelwa?", "Mulandu nshi fyonse fyabipa?", "Bushe kuti mpeela indalama?"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Ndani timuimbe mlandu?", "Ndalama zingati zinabajetiwa, zinagwiritsidwa, ndi chiyani chinaperekedwa?", "Chifukwa chiyani zonse ndi zoipa?", "Kodi ndingalandire ndalama?"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Amepusho yalungatika pa fyabajetiwa na fyabomfiwa, na fyapeelwe, yabuta kabili yalungama."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Mafunso enieni a zomwe zinabajetiwa ndi zomwe zinagwiritsidwa, ndi zomwe zinaperekedwa, ndi omveka komanso oyenera."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='understanding-public-budgets' and l.slug='budget-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Ni cinshi muli ifi ufwile ukusunga mu bumfisolo?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Ndi chiti mwa izi chomwe muyenera kusunga mwachinsinsi?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Umata obe uwatemwa", "Ama PIN, ama password ne nomba ya NRC yobe", "Icalo", "Icishibisho ca bonse"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Mtundu wanu wokonda", "Ma PIN, mapassword ndi nambala yanu ya NRC", "Nyengo", "Chidziwitso cha anthu onse"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Sunga ama PIN, ama password, inomba ya NRC na ifyakuma iwe mu bumfisolo no mu mutelelwe."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Sungani ma PIN, mapassword, nambala ya NRC ndi zinthu zanu zaumwini mwachinsinsi ndi mwachitetezo."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Ilintu ushilatumulula lyashi lya kutiinya, ufwile:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Musanatumizenso uthenga wochititsa mantha, muyenera:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ukutuma ku bonse bwangu", "Ukuceba nga lya cine ntanshi", "Ukulundapo ifya kutiinya", "Ukukaana ukulibelenga"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Kutumiza kwa aliyense mofulumira", "Kuyang''ana ngati ndi loona poyamba", "Kuwonjezera zoopsa", "Kukana kuliwerenga"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ceba nga lyashi lya cine ilintu ushilalituma, pa kuti wisalanganya ilyashi lya bufi."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Onetsetsani ngati uthenga ndi woona musanagawire, kuti musafalitse nkhani zabodza."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='digital-citizenship-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Ilyashi lyakucitisha icifukushi. Cinshi intampulo isuma iya kutanga?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Uthenga ukukupsyetsani mtima. Ndi sitepe yabwino yanji yoyamba?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Tuma bwangu", "Syukuluka no kuceba", "Lundapo amashiwi", "Tumina ama group yonse"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Gawani mofulumira", "Chedwani ndi kuyang''ana", "Wonjezerani ndemanga", "Tumizani ku magulu onse"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Amashiwi ayalenga ukuyumfwa kwa maka ilingi yapangilwa ukusalangana. Syukuluka no kuceba ntanshi."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Mauthenga oyambitsa mantha amphamvu kawirikawiri amapangidwa kuti afalikire. Chedwani ndi kuyang''ana poyamba."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Ilyashi lipeela indalama sha mahala nga waingisha inomba ya NRC pa link. Ili:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Uthenga umapereka ndalama zaulere ngati mulowetsa nambala ya NRC pa link. Umenewu ndi:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Pulogram ya buteko iya cine", "Ubucenjeshi ubwingaba", "Cawama nga mwina watumine", "Cawama pa ntanshi ya Cisano"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Pulogalamu yeniyeni ya boma", "Chinyengo chomwe chingakhale", "Chotetezeka ngati bwenzi anatumiza", "Chabwino Lachisanu lisanafike"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Indalama sha mahala, inshita iyakakaminwa, ilink no kulomba NRC yobe fyonse fishibilo fya kusoka."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Ndalama zaulere, nthawi yopanikizika, link ndi kupempha NRC yanu zonse ndi zizindikiro za chenjezo."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='spotting-false-information' and l.slug='false-info-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Ufwile ukwikata ibatani lya maka pa nshita nshi ukwasha mafoni ayengi?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Muyenera kugwira batani la mphamvu kwa nthawi yotani kuti muyatse mafoni ambiri?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Hafu ya sekondi", "Mupepi na masekondi yatatu", "Miniti imo", "Tawakabila ukulikanda"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Hafu ya sekondi", "Pafupifupi masekondi atatu", "Mphindi imodzi", "Simufunika kulidina"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ukwikata mupepi na masekondi yatatu kwasha mafoni ayengi. Ukukanda kwa bwangu kulanga nangu kuzimya iskrini fye."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Kugwira pafupifupi masekondi atatu kumayatsa mafoni ambiri. Kudina kwakanthawi kumangoyatsa kapena kuzimitsa skirini."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Kwi incende iyawamisha iya kusanga ama app yapya?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Ndi malo ati otetezeka kwambiri opezera ma app atsopano?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Link ukufuma ku beshibe", "Play Store", "Faelo ya Bluetooth ukufuma ku munobe", "Website iili yonse"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Link yochokera kwa osadziwika", "Play Store", "Fayilo ya Bluetooth yochokera kwa bwenzi", "Webusaiti iliyonse"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Play Store iceba ama app ilintu ushilaikilisha. Amafaelo ukufuma ku ma link nangu Bluetooth kuti yaleta amapulogram yabipa."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Play Store imayang''ana ma app musanaike. Mafayilo ochokera ku ma link kapena Bluetooth angabweretse mapulogalamu oyipa."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='getting-to-know-your-device' and l.slug='device-basics-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Icilishanyo cibomba bwino nga catumwa ku:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Chidandaulo chimagwira bwino chikatumizidwa ku:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Umuntu uuli onse uwapepi", "Ibufi ililingile ukucita", "Pa social media fye", "Takuli umuntu"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Aliyense wapafupi", "Ofesi yoyenera kuchitapo kanthu", "Pa social media kokha", "Palibe munthu"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Icilishanyo cileta ifyo ulefwaya nga cafika ku bufi ililingile ukucita."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Chidandaulo chimabweretsa zotsatira chikafika ku ofesi yoyenera kuchitapo kanthu."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Nga icilishanyo cobe tacacitwapo, intampulo isuma iya kukonkapo:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Ngati chidandaulo chanu sichinachitidwe, sitepe yabwino yotsatira ndi:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ukuleka", "Ukukonkelulapo, lyena ukulomba supavaiza nangu ibufi lya pa muulu", "Ukupundila ababomfi", "Ukufuuta amalembo yobe"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Kusiya", "Kutsatira, kenako kupempha supavaiza kapena ofesi yapamwamba", "Kukuwira ogwira ntchito", "Kuchotsa mbiri yanu"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Konkelulapo no refarensi yobe, lyena katisha mu mutende ku supavaiza nangu ibufi lya pa muulu."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Tsatirani ndi refarensi yanu, kenako perekani madandaulo mwamtendere ku supavaiza kapena ofesi yapamwamba."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='complaint-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"Icishibisho cilekulomba ukulipila K300 ku yunifolomu ilintu ushilatendeka. Ici:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"Chotsatsa chikukufunsani kulipira K300 ya yunifolomu musanayambe. Ichi ndi:"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ca cibelelo", "Cishibilo ca ncito ya bufi", "Icipeelo icisuma", "Cakabilwa ku funde"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Chachizolowezi", "Chizindikiro cha ntchito yabodza", "Mwayi wabwino", "Chofunikira ndi lamulo"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Bakashi ba cine tabakulipisha indalama ukusanga incito."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Olemba enieni samakulipitsani ndalama kuti mupeze ntchito."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz' and q.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'question', '"CV iyanguka ifwile ukuba iitali shani?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'question', '"CV yosavuta iyenera kukhala yaitali bwanji?"'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'options', '["Ipepala limo", "Amapepala ikumi", "Umulongoti umo", "Iitali apo ingafikila"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'options', '["Tsamba limodzi", "Masamba khumi", "Mzere umodzi", "Yaitali momwe ingathere"]'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'bem', 'explanation', '"Ipepala limo ilyabuta e lyanguka ku bakashi ukubelenga."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'quiz_question', q.id, 'nya', 'explanation', '"Tsamba limodzi lomveka ndiye losavuta kwa olemba kuwerenga."'::jsonb from quiz_questions q
 join lessons l on l.id=q.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-skills-for-work' and l.slug='work-quiz' and q.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();

-- Scenario steps
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'prompt', '"Icifulo ca menshi icibombela umusebo obe califwa imilungu itatu. Cinshi intampulo isuma iya kutanga?"'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=0
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'prompt', '"Malo a madzi otumikira msewu wanu aswekera masabata atatu. Ndi sitepe yabwino yanji yoyamba?"'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=0
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'options', '["Lemba lyashi lya cifukushi mu group chat", "Shimika ku kansulu wa mu mushi nangu kansulu wa ward yobe", "Loleela no kucetekela ukuti umbi akashimika"]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=0
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'options', '["Lembani uthenga wamkwiyo mu gulu la chat", "Nenani kwa khansala wa m''deralo kapena khansala wa ward wanu", "Dikirani ndi kuyembekezera kuti wina adzanena"]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=0
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'feedback', '["Ukufukusha kwaumfwika, lelo takufika ku bufi ililingile ukuwamya.", "Cawama — kansulu nangu kansulu wa ward kuti balemba icafya no kucita.", "Nga bonse baloleela, icafya cishala icishilashimikwa, icishilawamibwa."]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=0
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'feedback', '["Kukwiya kumamveka, koma sikufika ku ofesi yoyenera kukonza.", "Chabwino — khansala kapena khansala wa ward angalembe vutoli ndi kuchitapo kanthu.", "Ngati aliyense adikira, vutoli limakhalabe losaneneka, losakonzedwa."]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=0
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'prompt', '"Ibufi lilomba ifyakufwaikwa. Cinshi cafwa icilishanyo cobe ukucila?"'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'prompt', '"Ofesi ikupempha tsatanetsatane. Ndi chiyani chothandiza chidandaulo chanu kwambiri?"'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'options', '["Landa fye ukutila amenshi tayali", "Peela incende ya cine, inshita ca cafwa, na bangaa ba mayanda bacetekela", "Kakamya ukuti ciwamibwe lelo nangu"]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'options', '["Nenani kokha kuti madzi palibe", "Perekani malo enieni, nthawi yomwe laswekera, ndi mabanja angati amadalira", "Kakamizani kuti zikonzedwe lero kapenanso"]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'feedback', '["Caluka sana — kuti bafilwa ukusanga icafya icalungama.", "Ee — ifya cine filenga ukubomba bwangu no mu kulungama.", "Ukutiinya kulenga ababomfi ukuba abakaangisha, takwafulisha."]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'feedback', '["Chosamveka bwino — angalephere kupeza vuto lenileni.", "Inde — zoona zimathandiza kuchitapo kanthu mwachangu ndi mwachilungamo.", "Kuopseza kumapangitsa ogwira ntchito kudzitchinjiriza, sikuthandiza kufulumiza."]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'prompt', '"Panuma pa milungu ibili, takuli icasintha. Cinshi nomba?"'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'prompt', '"Patatha masabata awiri, palibe chosintha. Tsopano chiyani?"'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'options', '["Leka — napapwa", "Konkelulapo no refarensi yobe, lyena lomba supavaiza no kuleta pa kukumana kwa ward kukonkapo", "Tendeka ukulwa ne bufi"]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'options', '["Siyani — zatheka", "Tsatirani ndi refarensi yanu, kenako pemphani supavaiza ndi kubweretsa pa msonkhano wa ward wotsatira", "Yambani kukangana ndi ofesi"]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'feedback', '["Ukuleka kushiila icafya ku bonse.", "Cawama — katisha mu mutende no kukosha pa kuleta pa lupaka.", "Ukulwa konaula ubunani ubo ulekabila ukupwisha ici."]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'feedback', '["Kusiya kumasiyira vutoli kwa aliyense.", "Chabwino — perekani madandaulo mwamtendere ndi kulimbitsa pobweretsa poyera.", "Kukangana kumawononga ubale womwe mukufunikira kuti muthetse vutoli."]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='making-a-complaint' and l.slug='a-broken-service-scenario' and s.sort_order=2
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'prompt', '"Ilyashi litila icipatala ca mu mushi cilepeela indalama sha mahala lelo kabili litila utumine ku bantu ikumi. Cinshi ucita?"'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario' and s.sort_order=0
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'prompt', '"Uthenga ukunena kuti chipatala cha m''deralo chikupereka ndalama zaulere lero ndipo ukuuzani kuti mutumize kwa anthu khumi. Mumachita chiyani?"'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario' and s.sort_order=0
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'options', '["Tuma bwangu pa kuti banobe besalufyanya", "Imilila no kuceba nga lya cine ilintu ushilalituma", "Tuma no kulundapo ukuti lifwile lyaba lya cine"]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario' and s.sort_order=0
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'options', '["Tumizani mofulumira kuti anzanu asaphonye", "Imani ndi kuyang''ana ngati ndi loona musanagawire", "Tumizani ndi kuwonjezera kuti liyenera kukhala loona"]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario' and s.sort_order=0
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'feedback', '["Ukutuma bwangu e nshila amashiwi ya bufi no bucenjeshi fisalanganina.", "Cawama — ukuceba ntanshi kucingilila iwe na bantu abo ngaufwa watuma.", "Ukulundapo ishina lyobe kulenga bambi ukucetekela lyashi ulyo ushilaceba."]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario' and s.sort_order=0
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'feedback', '["Kutumiza mofulumira ndi mmene mauthenga abodza ndi chinyengo zimafalikira.", "Chabwino — kuyang''ana poyamba kumateteza inu ndi anthu omwe mukanatumiza.", "Kuwonjezera dzina lanu kumapangitsa ena kudalira uthenga umene simunawuyang''ane."]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario' and s.sort_order=0
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'prompt', '"Bushe wingaceba shani?"'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario' and s.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'prompt', '"Kodi mungatsimikizire bwanji?"'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario' and s.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'options', '["Ipusha icipatala nangu umweno uwatetekela, nangu fwaya icishibisho ca cine", "Pendo bantu banga nabatuma kale", "Cetekela pantu munobe watumine"]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario' and s.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'options', '["Funsani chipatala kapena wa udindo wodalirika, kapena funani chidziwitso chovomerezeka", "Werengani anthu angati agawirapo kale", "Khulupirirani chifukwa bwenzi anatumiza"]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario' and s.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'bem', 'feedback', '["Ee — ya ku cakufuma nangu ku nshila ya cine ukusuminisha.", "Ukutuma kwa bantu abengi takulenga ukuti ca cine.", "Nangu banobe abo watetekela batumulula ifintu ifyo bashilaceba."]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario' and s.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
insert into content_translations(entity_type,entity_id,lang,field,value)
select 'scenario_step', s.id, 'nya', 'feedback', '["Inde — pitani ku gwero kapena njira yovomerezeka kuti mutsimikize.", "Kugawira kwa anthu ambiri sikupangitsa chinthu kukhala choona.", "Ngakhale anzanu odalirika amatumizanso zinthu zomwe sanaziyang''ane."]'::jsonb from scenario_steps s
 join lessons l on l.id=s.lesson_id join courses c on c.id=l.course_id
 where c.slug='digital-rights-and-responsibilities' and l.slug='check-before-you-share-scenario' and s.sort_order=1
on conflict (entity_type,entity_id,lang,field) do update set value=excluded.value, updated_at=now();
