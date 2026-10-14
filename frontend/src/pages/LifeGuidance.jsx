import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  CloudRain,
  Target,
  ShieldAlert,
  Scale,
  HeartHandshake,
  HeartCrack,
  Zap,
  Award,
  Gem,
  Sunrise,
  Users,
  Sparkles,
  BookOpen,
  ChevronRight
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./LifeGuidance.css";

const GUIDANCE_TOPICS = [
  {
    id: "anger",
    title: "ક્રોધ અને આવેગ",
    titleHi: "क्रोध और आवेग",
    englishTitle: "Anger & Impatience",
    icon: Flame,
    color: "#1d4ed8",
    bgColor: "rgba(29, 78, 216, 0.10)",
    borderColor: "rgba(29, 78, 216, 0.28)",
    essence: "ક્રોધથી મનુષ્યની બુદ્ધિ ભ્રમિત થાય છે અને વિચારવાની શક્તિ નષ્ટ થઈ જાય છે. શાંત મન જ સાચો નિર્ણય લઈ શકે છે.",
    essenceHi: "क्रोध से मनुष्य की बुद्धि भ्रमित हो जाती है और सोचने की शक्ति नष्ट हो जाती है। शांत मन ही सही निर्णय ले सकता है।",
    shlokas: [
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 63,
        sanskritExcerpt: "क्रोधाद्भवति संमोहः संमोहात्स्मृतिविभ्रमः। स्मृतिभ्रंशाद् बुद्धिनाशो बुद्धिनाशात्प्रणश्यति॥",
        gujaratiSummary: "ક્રોધથી અજ્ઞાન અને ભ્રમ ઉત્પન્ન થાય છે, ભ્રમથી સ્મૃતિ ભ્રષ્ટ થાય છે, સ્મૃતિ ભ્રષ્ટ થવાથી બુદ્ધિનો નાશ થાય છે અને બુદ્ધિ નષ્ટ થતાં મનુષ્યનું પતન થાય છે.",
        hindiSummary: "क्रोध से अविवेक और सम्मोह उत्पन्न होता है, सम्मोह से स्मृति भ्रमित होती है, स्मृति भ्रष्ट होने से बुद्धि का नाश होता है और बुद्धि नष्ट होने पर मनुष्य का पतन हो जाता है।",
        lifeLesson: "જ્યારે પણ ક્રોધ આવે, ત્યારે તાત્કાલિક પ્રતિક્રિયા ન આપો. ઊંડો શ્વાસ લો અને મનને શાંત થવાનો સમય આપો.",
        lifeLessonHi: "जब भी क्रोध आए, तत्काल प्रतिक्रिया न दें। गहरी सांस लें और मन को शांत होने का समय दें।"
      },
      {
        chapterNumber: 5,
        chapterName: "કર્મસંન્યાસ યોગ",
        shlokNumber: 26,
        sanskritExcerpt: "कामक्रोधवियुक्तानां यतीनां यतचेतसाम्। अभितो ब्रह्मनिर्वाणं वर्तते विदितात्मनाम्॥",
        gujaratiSummary: "કામ અને ક્રોધથી સંપૂર્ણ મુક્ત, નિયંત્રિત મનવાળા અને આત્મસાક્ષાત્કારી મહાપુરુષોને બધી બાજુથી પરમ શાંતિ પ્રાપ્ત થાય છે.",
        hindiSummary: "काम और क्रोध से सर्वथा मुक्त, संयत चित्त वाले और आत्मसाक्षात्कारी महापुरुषों को सब ओर से परम शांति (ब्रह्मनिर्वाण) प्राप्त होती है।",
        lifeLesson: "ક્રોધ પર વિજય મેળવવો એ જ મનની સાચી શાંતિ અને સફળતાની ચાવી છે.",
        lifeLessonHi: "क्रोध पर विजय पाना ही मन की वास्तविक शांति और सफलता की कुंजी है।"
      },
      {
        chapterNumber: 16,
        chapterName: "દૈવાસુરસંપદ્વિભાગ યોગ",
        shlokNumber: 21,
        sanskritExcerpt: "त्रिविधं नरकस्येदं द्वारं नाशनमात्मनः। कामः क्रोधस्तथा लोभस्तस्मादेतत्त्रयं त्यजेत्॥",
        gujaratiSummary: "કામ, ક્રોધ અને લોભ - આ ત્રણ આત્માનો નાશ કરનારા નરકના દ્વાર છે. તેથી આ ત્રણેયનો સદંતર ત્યાગ કરવો જોઈએ.",
        hindiSummary: "काम, क्रोध और लोभ - ये तीन आत्मा का नाश करने वाले नरक के द्वार हैं। इसलिए इन तीनों का सर्वथा त्याग करना चाहिए।",
        lifeLesson: "ક્રોધ અને લોભ જીવનની સુંદરતા છીનવી લે છે; સંતોષ અને ક્ષમા કેળવો.",
        lifeLessonHi: "क्रोध और लोभ जीवन का सौंदर्य छीन लेते हैं; संतोष और क्षमा का अभ्यास करें।"
      }
    ]
  },
  {
    id: "stress",
    title: "ચિંતા અને તણાવ",
    titleHi: "चिंता और तनाव",
    englishTitle: "Anxiety & Stress",
    icon: CloudRain,
    color: "#0284c7",
    bgColor: "rgba(2, 132, 199, 0.10)",
    borderColor: "rgba(2, 132, 199, 0.28)",
    essence: "જે પરિસ્થિતિ તમારા હાથમાં નથી તેની ચિંતા ન કરો. માત્ર તમારા શ્રેષ્ઠ પ્રયાસ પર ધ્યાન કેન્દ્રિત કરો, પરિણામ ઈશ્વર પર છોડો.",
    essenceHi: "जो परिस्थिति आपके नियंत्रण में नहीं है उसकी चिंता न करें। केवल अपने सर्वश्रेष्ठ प्रयास पर ध्यान केंद्रित करें, परिणाम ईश्वर पर छोड़ें।",
    shlokas: [
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 47,
        sanskritExcerpt: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
        gujaratiSummary: "તમારો અધિકાર ફક્ત કર્મ કરવાનો છે, તેના ફળ પર ક્યારેય નહીં. કર્મફળની આસક્તિ ન રાખો અને કર્મ ન કરવાનો આળસ પણ ન કરો.",
        hindiSummary: "कर्म करने में ही तुम्हारा अधिकार है, उसके फलों में कभी नहीं। इसलिए कर्मफल के कारण मत बनो और न ही कर्म न करने में तुम्हारी आसक्ति हो।",
        lifeLesson: "પરિણામની ચિંતા છોડીને આ ક્ષણે જે કાર્ય હાથમાં છે તેમાં 100% સમર્પણ આપો.",
        lifeLessonHi: "परिणाम की चिंता छोड़कर वर्तमान में जो कार्य हाथ में है उसमें 100% समर्पण दें।"
      },
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 14,
        sanskritExcerpt: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुખદુઃખદાઃ। આગમાપાયિનોऽનિત્યાસ્તાંસ્તિતિક્ષસ્વ ભારત॥",
        gujaratiSummary: "સુખ-દુઃખ, ટાઢ-તડકો અનિત્ય છે - આવે છે અને ચાલ્યા જાય છે. હે અર્જુન! તેમને ધૈર્યપૂર્વક સહન કરતા શીખો.",
        hindiSummary: "हे कुंतीपुत्र! सर्दी-गर्मी और सुख-दुःख देने वाले इंद्रिय-विषय संयोग क्षणभंगुर और अनित्य हैं; इसलिए हे भारत, उन्हें सहन करना सीखो।",
        lifeLesson: "કોઈપણ મુશ્કેલ સમય કાયમી નથી, આ સમય પણ વીતી જશે. મનને ધીરજ આપો.",
        lifeLessonHi: "कोई भी कठिन समय स्थायी नहीं है, यह समय भी बीत जाएगा। मन को धैर्य बंधाएं।"
      },
      {
        chapterNumber: 18,
        chapterName: "મોક્ષસંન્યાસ યોગ",
        shlokNumber: 66,
        sanskritExcerpt: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
        gujaratiSummary: "બધી ચિંતાઓ અને આશંકાઓ છોડીને માત્ર મારા શરણમાં આવ. હું તને બધા જ કષ્ટોમાંથી મુક્ત કરીશ, તું શોક ન કર.",
        hindiSummary: "मुझमें चित्त लगाने से तुम मेरी कृपा से सब संकटों और बाधाओं को अनायास ही पार कर जाओगे।",
        lifeLesson: "જ્યારે મન અતિશય થાકી જાય, ત્યારે ઈશ્વર પર અતૂટ ભરોસો રાખીને મનને આરામ આપો.",
        lifeLessonHi: "जब मन अत्यधिक थक जाए, तब ईश्वर पर अटूट विश्वास रखकर मन को विश्राम दें।"
      }
    ]
  },
  {
    id: "focus",
    title: "મનની અશાંતિ & એકાગ્રતા",
    titleHi: "मन की अशांति और एकाग्रता",
    englishTitle: "Restless Mind & Focus",
    icon: Target,
    color: "#2563eb",
    bgColor: "rgba(37, 99, 235, 0.10)",
    borderColor: "rgba(37, 99, 235, 0.28)",
    essence: "મન વાયુની જેમ ચંચળ છે, પરંતુ દૈનિક સાધના, અભ્યાસ અને વૈરાગ્ય દ્વારા તેને એકાગ્ર કરી શકાય છે.",
    essenceHi: "मन वायु की भांति चंचल है, किंतु नियमित अभ्यास और वैराग्य द्वारा इसे एकाग्र किया जा सकता है।",
    shlokas: [
      {
        chapterNumber: 6,
        chapterName: "આત્મસંયમ યોગ",
        shlokNumber: 26,
        sanskritExcerpt: "यतो यतो निश्चरति मनश्चञ्चलमस्थिरम्। ततस्ततो नियम्यैतदात्मन्येव वशं नयेत्॥",
        gujaratiSummary: "આ ચંચળ અને અસ્થિર મન જે જે વિષયો તરફ ભટકે છે, ત્યાંથી તેને વાળીને વારંવાર અંતરમાં સ્થિર કરવું જોઈએ.",
        hindiSummary: "हे महाबाहो! निसंदेह मन चंचल और कठिनता से वश में होने वाला है, किंतु हे कुंतीपुत्र, अभ्यास और वैराग्य से इसे वश में किया जा सकता है।",
        lifeLesson: "જ્યારે પણ ધ્યાન ભટકે, ત્યારે નિરાશ થયા વગર ફરીથી મનને ધીમેથી વર્તમાન કામમાં લાવો.",
        lifeLessonHi: "जब भी ध्यान भटके, निराश हुए बिना पुनः मन को धीरे से वर्तमान कार्य में लाएं।"
      },
      {
        chapterNumber: 6,
        chapterName: "આત્મસંયમ યોગ",
        shlokNumber: 35,
        sanskritExcerpt: "असंशयं महाबाहो मनो दुर्निग्रहं चलम्। अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते॥",
        gujaratiSummary: "નિઃસંદેહ મન ચંચળ અને વશ કરવું કઠિન છે; પરંતુ હે કુંતીપુત્ર! નિયમિત અભ્યાસ અને આસક્તિ મુક્તિ દ્વારા તેને નિયંત્રિત કરી શકાય છે.",
        hindiSummary: "यह चंचल और अस्थिर मन जिस-जिस विषय की ओर भागे, वहां-वहां से इसे रोककर बार-बार आत्मा में ही स्थिर करे।",
        lifeLesson: "એકાગ્રતા એ કોઈ ચમત્કાર નથી પરંતુ રોજિંદા સતત અભ્યાસનું પરિણામ છે.",
        lifeLessonHi: "एकाग्रता कोई चमत्कार नहीं बल्कि प्रतिदिन के निरंतर अभ्यास का परिणाम है।"
      },
      {
        chapterNumber: 6,
        chapterName: "આત્મસંયમ યોગ",
        shlokNumber: 5,
        sanskritExcerpt: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
        gujaratiSummary: "પોતાના મન દ્વારા પોતાનો ઉદ્ધાર કરવો જોઈએ, પોતાનું પતન ન કરવું જોઈએ. કારણ કે મનુષ્ય પોતે જ પોતાનો મિત્ર છે અને પોતે જ શત્રુ છે.",
        hindiSummary: "मनुष्य अपने द्वारा ही अपना उद्धार करे, अपने को गिराए नहीं; क्योंकि मनुष्य स्वयं ही अपना मित्र और स्वयं ही अपना शत्रु है।",
        lifeLesson: "તમારા જીવનના સૌથી મોટા નિર્માતા તમે પોતે જ છો. સકારાત્મક વિચારો પસંદ કરો.",
        lifeLessonHi: "अपने जीवन के सबसे बड़े निर्माता आप स्वयं हैं। सकारात्मक विचारों का चयन करें।"
      }
    ]
  },
  {
    id: "fear",
    title: "નિષ્ફળતા અને ડર",
    titleHi: "विफलता और भय",
    englishTitle: "Fear & Dealing with Failure",
    icon: ShieldAlert,
    color: "#1e40af",
    bgColor: "rgba(30, 64, 175, 0.10)",
    borderColor: "rgba(30, 64, 175, 0.28)",
    essence: "હારી જવાનો ડર મનુષ્યને સાચો પ્રયાસ પણ કરવા દેતો નથી. જય અને પરાજય બંને જીવનના પાઠ છે, અંત નથી.",
    essenceHi: "हारने का भय मनुष्य को सही प्रयास भी नहीं करने देता। जय और पराजय दोनों जीवन के पाठ हैं, अंत नहीं।",
    shlokas: [
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 38,
        sanskritExcerpt: "सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ। ततो युद्धाय युज्यस्व नैवं पापमवाप्स्यसि॥",
        gujaratiSummary: "સુખ અને દુઃખ, લાભ અને હાનિ, વિજય અને પરાજયને એકસમાન ગણીને તું કર્તવ્યના પાલનમાં જોડાઈ જા.",
        hindiSummary: "सुख-दुःख, लाभ-हानि और जय-पराजय को समान समझकर कर्तव्य कर्म के लिए तैयार हो जाओ; ऐसा करने से तुम्हें कोई पाप नहीं लगेगा।",
        lifeLesson: "પરિણામ ભલે જે આવે, જો તમે પૂરી પ્રામાણિકતાથી લડ્યા છો તો તમે ક્યારેય હાર્યા નથી.",
        lifeLessonHi: "परिणाम चाहे जो हो, यदि आप पूरी निष्ठा और ईमानदारी से लड़े हैं तो आप कभी पराजित नहीं हुए।"
      },
      {
        chapterNumber: 4,
        chapterName: "જ્ઞાનકર્મસંન્યાસ યોગ",
        shlokNumber: 40,
        sanskritExcerpt: "અજ્ઞશ્ચાશ્રદ્દધાનશ્ચ સંશયાત્મા વિનશ્યતિ। નાયં લોકોऽસ્તિ ન પરો ન સુખં સંશયાત્મનઃ॥",
        gujaratiSummary: "અજ્ઞાની, શ્રદ્ધાહીન અને સતત સંશય-ડર રાખનાર મનુષ્યનો નાશ થાય છે. સંશયી મનને આ લોકમાં કે પરલોકમાં ક્યાંય સુખ મળતું નથી.",
        hindiSummary: "विवेकहीन, श्रद्धारहित और संशयग्रस्त व्यक्ति का विनाश हो जाता है। संशयात्मा के लिए न यह लोक है, न परलोक और न कोई सुख।",
        lifeLesson: "પોતાની ક્ષમતા અને ઈશ્વરની કૃપા પર પૂર્ણ શ્રદ્ધા રાખો; શંકાને મનમાંથી વિદાય આપો.",
        lifeLessonHi: "अपनी क्षमता और ईश्वर की कृपा पर पूर्ण विश्वास रखें; संशय को मन से विदा करें।"
      },
      {
        chapterNumber: 9,
        chapterName: "રાજવિદ્યા રાજગુહ્ય યોગ",
        shlokNumber: 22,
        sanskritExcerpt: "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते। तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥",
        gujaratiSummary: "જે લોકો અનન્ય ભાવથી મારું ચિંતન કરતા મારી ઉપાસના કરે છે, તે નિત્ય યુક્ત ભક્તોના રક્ષણ અને જરૂરિયાતોની જવાબદારી હું ઉઠાવું છું.",
        hindiSummary: "इसलिए उठो और यश प्राप्त करो! शत्रुओं को जीतकर समृद्ध राज्य का उपभोग करो। वे सब पहले से ही मेरे द्वारा मारे जा चुके हैं, तुम केवल निमित्त मात्र बनो।",
        lifeLesson: "સાચા માર્ગ પર ચાલનાર વ્યક્તિ ક્યારેય અસહાય હોતી નથી, ઈશ્વરીય શક્તિ તમારી સાથે છે.",
        lifeLessonHi: "डरना छोड़ें और कर्म के मैदान में उतरें; ईश्वर आपके साथ है।"
      }
    ]
  },
  {
    id: "decision",
    title: "નિર્ણય લેવાની મૂંઝવણ",
    titleHi: "निर्णय क्षमता और धर्मसंकट",
    englishTitle: "Confusion & Right Choice",
    icon: Scale,
    color: "#0369a1",
    bgColor: "rgba(3, 105, 161, 0.10)",
    borderColor: "rgba(3, 105, 161, 0.28)",
    essence: "જ્યારે બે માર્ગ વચ્ચે મૂંઝવણ થાય, ત્યારે સરળ માર્ગને બદલે તમારા સાચા કર્તવ્ય અને નૈતિક મૂલ્યોવાળા માર્ગને પસંદ કરો.",
    essenceHi: "जब भी जीवन में दो रास्तों के बीच दुविधा हो, तब स्वार्थ छोड़कर सत्य, न्याय और कर्तव्य का मार्ग चुनें।",
    shlokas: [
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 7,
        sanskritExcerpt: "कार्पण्यदोषोपहतस्वभावः पृच्छामि त्वां धर्मसंमूढचेताः। यच्छ्रेयः स्यान्निश्चितं ब्रूहि तन्मे शिष्यस्तेऽहं शाधि मां त्वां प्रपन्नम्॥",
        gujaratiSummary: "મારું મન કર્તવ્યના મામલે મૂંઝવણમાં છે. જે માર્ગ મારા માટે નિશ્ચિતપણે કલ્યાણકારી હોય તે મને કહો. હું આપનો શિષ્ય છું, મને માર્ગદર્શન આપો.",
        hindiSummary: "गुणरहित होने पर भी अपना स्वधर्म श्रेष्ठ है, भली-भांति आचरण किए गए परधर्म की अपेक्षा। स्वधर्म में मरना भी कल्याणकारी है, परधर्म भय देने वाला है।",
        lifeLesson: "જીવનમાં મૂંઝવણ થવી સામાન્ય છે, પરંતુ અહંકાર છોડીને યોગ્ય જ્ઞાન અને માર્ગદર્શન સ્વીકારવું એ શ્રેષ્ઠ નિર્ણય છે.",
        lifeLessonHi: "दूसरों की नकल करने के बजाय अपनी वास्तविक क्षमता और अंतरात्मा की आवाज पहचानें।"
      },
      {
        chapterNumber: 3,
        chapterName: "કર્મ યોગ",
        shlokNumber: 35,
        sanskritExcerpt: "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्। स्वधर्मे निधनं श्रेयः परधर्मो भयावहः॥",
        gujaratiSummary: "બીજાના કાર્યની નકલ કરવા કરતાં પોતાની કુદરતી ક્ષમતા અને કર્તવ્ય મુજબ કામ કરવું વધુ શ્રેયસ્કર છે.",
        hindiSummary: "कायरता रूपी दोष से मेरा स्वभाव ग्रस्त हो गया है और धर्म के विषय में मेरी बुद्धि भ्रमित है; जो मेरे लिए निश्चित कल्याणकारी हो, वही मुझे बताइए।",
        lifeLesson: "બીજા લોકો શું કરે છે તેની ચિંતા છોડો; તમારો સાચો સ્વભાવ અને રુચિ શું છે તે મુજબ તમારા જીવનનો માર્ગ પસંદ કરો.",
        lifeLessonHi: "जब निर्णय लेना कठिन लगे, तब अहंकार छोड़कर किसी श्रेष्ठ मार्गदर्शक की सलाह लें।"
      },
      {
        chapterNumber: 18,
        chapterName: "મોક્ષસંન્યાસ યોગ",
        shlokNumber: 63,
        sanskritExcerpt: "इति ते ज्ञानमाख्यातं गुह्याद्गुह्यतरं मया। विमृश्यैतदशेषेण यथेच्छसि तथा कुरु॥",
        gujaratiSummary: "આ રીતે મેં તને પરમ રહસ્યમય જ્ઞાન આપ્યું છે. હવે આ સમગ્ર જ્ઞાન પર ઊંડાણપૂર્વક વિચાર કરીને તારી મરજી મુજબ નિર્ણય લે.",
        hindiSummary: "इस प्रकार मैंने तुम्हें गोपनीय से भी गोपनीय ज्ञान कह दिया। अब इस पर पूर्ण रूप से विचार करके जैसी तुम्हारी इच्छा हो, वैसा करो।",
        lifeLesson: "બધા પાસાઓનો તટસ્થપણે અભ્યાસ કરો, પછી પૂરા આત્મવિશ્વાસ સાથે તમારો અંતિમ નિર્ણય લો.",
        lifeLessonHi: "हर पहलू को अच्छी तरह समझकर, स्वतंत्र और शांत चित्त से सही निर्णय लें।"
      }
    ]
  },
  {
    id: "peace",
    title: "એકલતા અને આંતરિક શાંતિ",
    titleHi: "आंतरिक शांति और संतोष",
    englishTitle: "Loneliness & Inner Peace",
    icon: HeartHandshake,
    color: "#0ea5e9",
    bgColor: "rgba(14, 165, 233, 0.10)",
    borderColor: "rgba(14, 165, 233, 0.28)",
    essence: "તમે ક્યારેય એકલા નથી. પરમાત્મા દરેક પળે તમારા અંતરમાં બિરાજેલા છે. સાચી શાંતિ બહારની દુનિયામાં નહીં, ભીતરમાં છે.",
    essenceHi: "बाहरी वस्तुएं केवल क्षणिक सुख देती हैं। वास्तविक, स्थायी शांति अपनी अंतरात्मा में संतोष पाने से ही मिलती है।",
    shlokas: [
      {
        chapterNumber: 5,
        chapterName: "કર્મસંન્યાસ યોગ",
        shlokNumber: 29,
        sanskritExcerpt: "भोक्तारं यज्ञतपसां सर्वलोकमहेश्वरम्। सुहृदं सर्वभूतानां ज्ञात्वा मां शान्तिमृच्छति॥",
        gujaratiSummary: "મને સર્વ યજ્ઞો અને તપસ્યાઓનો ભોક્તા, સમસ્ત લોકોનો મહાન ઈશ્વર અને સર્વ પ્રાણીઓનો પરમ મિત્ર (હિતેચ્છુ) જાણીને મનુષ્ય પરમ શાંતિ પ્રાપ્ત કરે છે.",
        hindiSummary: "जैसे सब ओर से परिपूर्ण अचल समुद्र में सब नदियां आकर समा जाती हैं, वैसे ही जिसमें सब भोग बिना विकार उत्पन्न किए समा जाते हैं, वही शांति पाता है।",
        lifeLesson: "જ્યારે કોઈ તમારો સાથ ન આપે, ત્યારે યાદ રાખો કે સર્વશક્તિમાન પ્રભુ તમારા સદાકાળના સાચા મિત્ર છે.",
        lifeLessonHi: "इच्छाओं के पीछे भागने के बजाय जो मिला है उसमें संतोष पाकर मन को शांत रखें।"
      },
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 71,
        sanskritExcerpt: "विहाय कामान्यः सर्वान्पुमांश्चरति निःस्पृहः। निर्ममो निरहङ्कारः स शान्तिमधिगच्छति॥",
        gujaratiSummary: "જે મનુષ્ય બધી કામનાઓ ત્યજીને મમતા અને અહંકાર રહિત થઈને વિહરે છે, તે જ સાચી પરમ શાંતિ પ્રાપ્ત કરે છે.",
        hindiSummary: "जो मनुष्य संपूर्ण कामनाओं को त्यागकर ममतारहित, अहंकाररहित और स्पृहारहित होकर आचरण करता है, वही परम शांति प्राप्त करता है।",
        lifeLesson: "'હું અને મારું' ની માનસિકતા છોડી દો; અહંકાર મુક્ત મન જ સૌથી મોટું સુખ છે.",
        lifeLessonHi: "'मेरा-तेरा' और अहंकार का त्याग करें; आंतरिक शांति स्वतः प्रकट होगी।"
      },
      {
        chapterNumber: 12,
        chapterName: "ભક્તિ યોગ",
        shlokNumber: 15,
        sanskritExcerpt: "यस्मान्नोद्विजते लोको लोकान्नोद्विजते च यः। हर्षामर्षभयोद्वेगैर्मुक्तो यः स च मे प्रियः॥",
        gujaratiSummary: "જેનાથી કોઈ મનુષ્ય ઉદ્વેગ (ત્રાસ) પામતો નથી અને જે પોતે પણ કોઈનાથી ઉદ્વેગ પામતો નથી, તેમજ હર્ષ, ઈર્ષ્યા, ભયથી મુક્ત છે તે મને અત્યંત પ્રિય છે.",
        hindiSummary: "श्रद्धावान और जितेंद्रिय पुरुष ज्ञान प्राप्त करता है, और ज्ञान प्राप्त करते ही वह तत्काल परम शांति को पा लेता है।",
        lifeLesson: "બીજાના શબ્દો કે વ્યવહારથી અશાંત ન બનો. તમારી આંતરિક શાંતિની ચાવી બીજાના હાથમાં ન આપો.",
        lifeLessonHi: "सत्य ज्ञान और आत्मसंयम ही जीवन में सर्वोच्च शांति लाते हैं।"
      }
    ]
  },
  {
    id: "grief",
    title: "શોક અને વિયોગ",
    titleHi: "दुःख, वियोग और शोक",
    englishTitle: "Grief, Loss & Sorrow",
    icon: HeartCrack,
    color: "#1e3a8a",
    bgColor: "rgba(30, 58, 138, 0.10)",
    borderColor: "rgba(30, 58, 138, 0.28)",
    essence: "મૃત્યુ કે વિયોગ એ માત્ર શરીરનું રૂપાંતરણ છે, આત્મા સદા અજર-અમર છે. પ્રકૃતિના અનિવાર્ય સત્યને સ્વીકારીને આત્માની અમરતામાં સ્થિર થાઓ.",
    essenceHi: "आत्मा अमर है, केवल शरीर बदलता है। प्रकृति का यह नियम स्वीकार करने से गहरा दुःख भी हलका हो जाता है।",
    shlokas: [
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 11,
        sanskritExcerpt: "अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे। गतासूनगतासूंश्च नानुशोचन्ति पण्डिताः॥",
        gujaratiSummary: "જેમના માટે શોક ન કરવો જોઈએ તેમના માટે તું શોક કરે છે અને પાંડિત્યપૂર્ણ વાતો કરે છે. જ્ઞાની પુરુષો જીવિત કે મૃત કોઈના માટે શોક કરતા નથી.",
        hindiSummary: "यह आत्मा न कभी जन्म लेती है और न कभी मरती है; यह अजन्मा, नित्य, शाश्वत और पुरातन है। शरीर के मारे जाने पर भी यह नहीं मरती।",
        lifeLesson: "જે વાસ્તવિકતા અને વિધાતાનો ક્રમ આપણા નિયંત્રણમાં નથી, તેનો સ્વીકાર કરવો એ જ શોકમાંથી મુક્તિ મેળવવાનો માર્ગ છે.",
        lifeLessonHi: "परिवर्तन संसार का शाश्वत नियम है; जो जन्मा है उसकी मृत्यु और जो मरा है उसका पुनर्जन्म निश्चित है।"
      },
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 20,
        sanskritExcerpt: "न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः। अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥",
        gujaratiSummary: "આત્મા ક્યારેય જન્મતો નથી કે મરતો નથી, તે અજન્મા, નિત્ય, શાશ્વત અને પુરાતન છે. શરીરનો નાશ થવા છતાં આત્માનો નાશ થતો નથી.",
        hindiSummary: "जैसे मनुष्य पुराने वस्त्रों को त्यागकर नए वस्त्र धारण करता है, वैसे ही आत्मा पुराने शरीरों को छोड़कर नए शरीरों को प्राप्त होती है।",
        lifeLesson: "શરીર નશ્વર છે પરંતુ આત્મા અમર છે; પ્રિયજનના સદ્ગુણો અને સ્નેહને હૃદયમાં જીવંત રાખી આગળ વધો.",
        lifeLessonHi: "शरीर नश्वर है, आत्मीयता और प्रेम अमर है; शोक को त्यागें और आगे बढ़ें।"
      },
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 27,
        sanskritExcerpt: "जातस्य हि ध्रुवो मृत्युर्ध्रुवं जन्म मृतस्य च। तस्मादपरिहार्येऽर्थे न त्वं शोचितुमर्हसि॥",
        gujaratiSummary: "જેનો જન્મ થયો છે તેનું મૃત્યુ નિશ્ચિત છે અને મૃત્યુ પામેલાનો પુનર્જન્મ નિશ્ચિત છે. તેથી આ અનિવાર્ય પ્રકૃતિના નિયમ માટે તારે શોક ન કરવો જોઈએ.",
        hindiSummary: "तुम न शोक करने योग्य का शोक कर रहे हो और ज्ञानियों जैसी बातें करते हो; पंडित लोग मृत या जीवित किसी के लिए शोक नहीं करते।",
        lifeLesson: "જીવનના અંતિમ સત્યને શાંતિપૂર્વક સ્વીકારો અને વર્તમાન કર્તવ્ય તરફ આગળ વધો.",
        lifeLessonHi: "जो बीत चुका है उस पर शोक करने के बजाय वर्तमान और भविष्य के कर्तव्य को पहचानें।"
      }
    ]
  },
  {
    id: "laziness",
    title: "આળસ અને પ્રમાદ",
    titleHi: "आलस्य, प्रमाद और निराशा",
    englishTitle: "Laziness & Procrastination",
    icon: Zap,
    color: "#2563eb",
    bgColor: "rgba(37, 99, 235, 0.10)",
    borderColor: "rgba(37, 99, 235, 0.28)",
    essence: "આળસ અને વિલંબ (procrastination) આત્માના તેજ અને પ્રતિભાને ઢાંકી દે છે. કર્મશીલ બનીને ઉત્સાહપૂર્વક કર્તવ્યમાં લાગી જાઓ.",
    essenceHi: "आलस्य मनुष्य का सबसे बड़ा गुप्त शत्रु है। निष्काम कर्म ही जीवन में नई ऊर्जा और उत्साह भरता है।",
    shlokas: [
      {
        chapterNumber: 3,
        chapterName: "કર્મ યોગ",
        shlokNumber: 8,
        sanskritExcerpt: "नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः। शरीरयात्रापि च ते न प्रसिद्ध्येदकर्मणः॥",
        gujaratiSummary: "તું શાસ્ત્રવિહિત નિયત કર્મ કર, કેમ કે કર્મ ન કરવા કરતાં કર્મ કરવું શ્રેષ્ઠ છે. કર્મ કર્યા વિના તો તારા શરીરનો નિર્વાહ પણ શક્ય નથી.",
        hindiSummary: "तुम अपने शास्त्रविहित कर्तव्य कर्म करो, क्योंकि कर्म न करने की अपेक्षा कर्म करना श्रेष्ठ है। कर्म न करने से तुम्हारा शरीर-निर्वाह भी सिद्ध नहीं होगा।",
        lifeLesson: "નાના સંકલ્પથી શરૂઆત કરો; કર્મશીલ રહેવું એ જ જીવનમાં નવી ઊર્જા, ઉત્સાહ અને આત્મવિશ્વાસ લાવે છે.",
        lifeLessonHi: "आलस्य को त्यागें; छोटा ही सही पर प्रतिदिन नियमित रूप से कर्म करते रहें।"
      },
      {
        chapterNumber: 18,
        chapterName: "મોક્ષસંન્યાસ યોગ",
        shlokNumber: 39,
        sanskritExcerpt: "यदग्रे चानुबन्धे च सुखं मोहनमात्मनः। निद्रालस्यप्रमादोत्थं तत्तामसमुदाहृतम्॥",
        gujaratiSummary: "જે સુખ ભોગવતી વખતે અને પરિણામમાં પણ આત્માને મોહિત કરે છે, જે ઊંઘ, આળસ અને પ્રમાદમાંથી ઉત્પન્ન થાય છે તે તામસી સુખ છે.",
        hindiSummary: "हे पार्थ! नपुंसकता (कायरता) को मत प्राप्त हो, यह तुम्हें शोभा नहीं देती। हे परंतप! हृदय की इस तुच्छ दुर्बलता को त्यागकर युद्ध के लिए खड़े हो जाओ।",
        lifeLesson: "આળસનું ક્ષણિક સુખ ભવિષ્યમાં મોટો પશ્ચાતાપ બને છે; આજના કામને આજે જ પૂર્ણ કરવાની ટેવ પાડો.",
        lifeLessonHi: "निराशा और आलस्य मन की क्षणिक दुर्बलता है; आत्मविश्वास जगाएं और कर्म करें।"
      },
      {
        chapterNumber: 6,
        chapterName: "આત્મસંયમ યોગ",
        shlokNumber: 5,
        sanskritExcerpt: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
        gujaratiSummary: "મનુષ્યે પોતાના મન દ્વારા પોતાનો ઉદ્ધાર કરવો જોઈએ, પોતાનું પતન ન થવા દેવું જોઈએ. કારણ કે મનુષ્ય પોતે જ પોતાનો સાચો મિત્ર છે અને પોતે જ શત્રુ છે.",
        hindiSummary: "जो सुख आरंभ में और परिणाम में भी आत्मा को मोहित करने वाला है, जो निद्रा, आलस्य और प्रमाद से उत्पन्न होता है - वह तामस सुख कहा गया है।",
        lifeLesson: "તમને આળસમાંથી બહાર લાવવા કોઈ અન્ય નહીં આવે; મનને સંકલ્પબદ્ધ કરી તમારી જાતને જાતે જ જાગૃત કરો.",
        lifeLessonHi: "आलस्य और व्यर्थ समय गंवाने से बचें; सक्रिय और जागरूक जीवनशैली अपनाएं।"
      }
    ]
  },
  {
    id: "ego",
    title: "અહંકાર અને અભિમાન",
    titleHi: "अहंकार और ईर्ष्या",
    englishTitle: "Ego & Pride",
    icon: Award,
    color: "#1d4ed8",
    bgColor: "rgba(29, 78, 216, 0.10)",
    borderColor: "rgba(29, 78, 216, 0.28)",
    essence: "'હું જ બધું કરું છું' એવો અહંકાર સર્વ પતનનું મૂળ છે. નમ્રતા, સરળતા અને ઈશ્વરાર્પણ ભાવના જ સાચી મુક્તિ અને આંતરિક શાંતિ આપે છે.",
    essenceHi: "'सब कुछ मैं ही करता हूँ' यह भ्रम ही अहंकार है। विनम्रता और सेवाभाव ही मनुष्य को महान बनाते हैं।",
    shlokas: [
      {
        chapterNumber: 3,
        chapterName: "કર્મ યોગ",
        shlokNumber: 27,
        sanskritExcerpt: "प्रकृतेः क्रियमाणानि गुणैः कर्माणि सर्वशः। अहङ्कारविमूढात्मा कर्ताहमिति मन्यते॥",
        gujaratiSummary: "બધા કર્મો વાસ્તવમાં પ્રકૃતિના ગુણો દ્વારા કરવામાં આવે છે, છતાં અહંકારથી મોહિત થયેલો અજ્ઞાની જીવ માને છે કે 'હું કર્તા છું'.",
        hindiSummary: "संपूर्ण कर्म प्रकृति के गुणों द्वारा किए जाते हैं, फिर भी अहंकार से मोहित अंतःकरण वाला पुरुष मानता है कि 'मैं कर्ता हूँ'।",
        lifeLesson: "સફળતા મળ્યે અભિમાન ન કરો; ઈશ્વર, પ્રકૃતિ અને સાથીદારોના સહયોગ પ્રત્યે કૃતજ્ઞતા દર્શાવો.",
        lifeLessonHi: "अपनी सफलता का श्रेय प्रकृति, समाज और ईश्वर को भी दें; विनम्र बने रहें।"
      },
      {
        chapterNumber: 16,
        chapterName: "દૈવાસુરસંપદ્વિભાગ યોગ",
        shlokNumber: 4,
        sanskritExcerpt: "दम्भो दर्पोऽभिमानश्च क्रोधः पारुष्यमेव च। अज्ञानं चाभिजातस्य पार्थ सम्पदमासुरीम्॥",
        gujaratiSummary: "દંભ, ઘમંડ, અભિમાન, ક્રોધ, કઠોરતા અને અજ્ઞાન - આ બધા આસુરી સંપત્તિ (દુર્ગુણો) સાથે જન્મેલા મનુષ્યના લક્ષણો છે.",
        hindiSummary: "दंभ, दर्प, अभिमान, क्रोध, कठोरता और अज्ञान - ये सब आसुरी संपदा को लेकर उत्पन्न हुए पुरुष के लक्षण हैं।",
        lifeLesson: "અહંકાર વ્યક્તિના સદ્ગુણો અને સંબંધો બંનેનો નાશ કરે છે; સદાય વિનમ્ર અને નમ્ર રહો.",
        lifeLessonHi: "घमंड और कटुता संबंध नष्ट करते हैं; सादगी और नम्रता का आभूषण पहनें।"
      },
      {
        chapterNumber: 18,
        chapterName: "મોક્ષસંન્યાસ યોગ",
        shlokNumber: 58,
        sanskritExcerpt: "मच्चित्तः सर्वदुर्गाणि मत्प्रसादात्तरिष्यसि। अथ चेत्त्वमहङ्कारान्न श्रोष्यसि विनङ्क्ष्यसि॥",
        gujaratiSummary: "મારામાં મન પરોવીશ તો મારી કૃપાથી તું બધા કઠિન સંકટોને પાર કરી જઈશ. પરંતુ જો અહંકારવશ મારું માર્ગદર્શન નહીં સાંભળે તો તારો નાશ થશે.",
        hindiSummary: "अहंकार, बल, घमंड, काम, क्रोध और परिग्रह का त्याग कर, ममतारहित और शांत चित्त पुरुष ब्रह्मभाव को प्राप्त करने का पात्र होता है।",
        lifeLesson: "હું-પણાનો અહંકાર છોડીને સાચા માર્ગદર્શન અને સદ્વિચારોને સમર્પિત થાઓ.",
        lifeLessonHi: "अहंकार से मुक्ति ही सच्ची महानता और ईश्वर की प्राप्ति का द्वार है।"
      }
    ]
  },
  {
    id: "attachment",
    title: "મોહ અને વાસના",
    titleHi: "अत्यधिक मोह और आसक्ति",
    englishTitle: "Attachment, Desire & Greed",
    icon: Gem,
    color: "#0284c7",
    bgColor: "rgba(2, 132, 199, 0.10)",
    borderColor: "rgba(2, 132, 199, 0.28)",
    essence: "વસ્તુઓ કે વ્યક્તિઓ પ્રત્યે અતિશય આસક્તિ મનુષ્યને બંધનમાં રાખે છે. અનાસક્ત ભાવે જીવવાથી જ સાચો સંતોષ અને પરમ આનંદ મળે છે.",
    essenceHi: "मोह से कर्तव्य में रुकावट आती है। प्रेम निस्वार्थ होना चाहिए, बंधनकारी नहीं।",
    shlokas: [
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 62,
        sanskritExcerpt: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते। सङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥",
        gujaratiSummary: "સાંસારિક વિષયોનું સતત ચિંતન કરવાથી તેમાં આસક્તિ થાય છે, આસક્તિથી કામના જન્મે છે અને કામના પૂર્ણ ન થતાં ક્રોધ ઉત્પન્ન થાય છે.",
        hindiSummary: "विषयों का निरंतर चिंतन करने से उनमें आसक्ति होती है, आसक्ति से कामना उत्पन्न होती है और कामना में विघ्न पड़ने से क्रोध उत्पन्न होता है।",
        lifeLesson: "ચીજવસ્તુઓ અને ઈચ્છાઓના દાસ ન બનો; જરૂરિયાત અને લાલસા વચ્ચેનો વિવેક સમજો.",
        lifeLessonHi: "चीजों और व्यक्तियों से अत्यधिक चिपकने से बचें; संतुलन और अनासक्ति रखें।"
      },
      {
        chapterNumber: 3,
        chapterName: "કર્મ યોગ",
        shlokNumber: 37,
        sanskritExcerpt: "काम एष क्रोध एष रजोगुणसमुद्भवः। महाशनो महापाप्मा विद्ध्येनमिह वैरिणम्॥",
        gujaratiSummary: "રજોગુણમાંથી ઉત્પન્ન થયેલ કામના અને ક્રોધ એ ક્યારેય ન ધરાય તેવા મહાભક્ષક અને મહાપાપી છે; તેને જ આ સંસારમાં સાચો શત્રુ જાણ.",
        hindiSummary: "जो सब कर्मों को परमात्मा में अर्पण करके आसक्ति रहित होकर कर्म करता है, वह पाप से वैसे ही लिप्त नहीं होता जैसे कमल का पत्ता जल से।",
        lifeLesson: "કામનાઓને સંતોષવાથી તે શાંત થતી નથી, અગ્નિમાં ઘી હોમવા જેવી વધે છે; સંતોષ જ પરમ સુખ છે.",
        lifeLessonHi: "संसार में कमल की तरह रहें - जल में रहकर भी जल से अछूता।"
      },
      {
        chapterNumber: 14,
        chapterName: "ગુણત્રયવિભાગ યોગ",
        shlokNumber: 7,
        sanskritExcerpt: "रजो रागात्मकं विद्धि तृष्णासङ्गसमुद्भवम्। तन्निबध्नाति कौन्तेय कर्मसङ्गेन देहिनम्॥",
        gujaratiSummary: "હે અર્જુન! રજોગુણને આસક્તિ અને તૃષ્ણાથી ઉત્પન્ન થયેલો જાણ, તે મનુષ્યને કર્મોના ફળની લાલસામાં બાંધી રાખે છે.",
        hindiSummary: "जिसका अंतःकरण 'मैं कर्ता हूँ' के भाव से रहित है और जिसकी बुद्धि लिप्त नहीं होती, वह कर्म करते हुए भी बंधन में नहीं बंधता।",
        lifeLesson: "પરિણામની અતિશય લાલસા છોડીને કર્તવ્યભાવથી કાર્ય કરો, તેનાથી મન મુક્ત અને પ્રસન્ન રહેશે.",
        lifeLessonHi: "कर्तव्य को पूरी निष्ठा से निभाएं, किंतु फल की आसक्ति से मुक्त रहें।"
      }
    ]
  },
  {
    id: "devotion",
    title: "શંકા અને શ્રદ્ધાનો અભાવ",
    titleHi: "श्रद्धा, भक्ति और ईश्वर शरणागति",
    englishTitle: "Doubt & Lack of Faith",
    icon: Sunrise,
    color: "#0891b2",
    bgColor: "rgba(8, 145, 178, 0.10)",
    borderColor: "rgba(8, 145, 178, 0.28)",
    essence: "સંશય મનુષ્યની ક્ષમતાઓ અને શાંતિને કોરી ખાય છે. ઈશ્વર અને પોતાના સત્કર્મ પર અતૂટ શ્રદ્ધા જ જીવનની નૌકા પાર ઉતારે છે.",
    essenceHi: "सच्ची भक्ति भय नहीं, बल्कि प्रेम और समर्पण है। ईश्वर की शरण में जाने से सभी चिंताएं समाप्त हो जाती हैं।",
    shlokas: [
      {
        chapterNumber: 4,
        chapterName: "જ્ઞાનકર્મસંન્યાસ યોગ",
        shlokNumber: 40,
        sanskritExcerpt: "अज्ञश्चाश्रद्दधानश्च संशयात्मा विनश्यति। नायं लोकोऽस्ति न परो न सुखं संशयात्मनः॥",
        gujaratiSummary: "અજ્ઞાની, શ્રદ્ધારહિત અને સંશયગ્રસ્ત મનુષ્યનો નાશ થાય છે. સંશયી મનુષ્યને ન આ લોકમાં સુખ છે, ન પરલોકમાં કે ન શાંતિ મળે છે.",
        hindiSummary: "श्रद्धावान पुरुष ज्ञान को प्राप्त होता है, और ज्ञान प्राप्त करते ही वह तत्काल परम शांति को पा लेता है।",
        lifeLesson: "સતત નકારાત્મક શંકા કરવાને બદલે સકારાત્મક શ્રદ્ધા કેળવો; વિશ્વાસ જ સફળતા અને શાંતિનું મૂળ છે.",
        lifeLessonHi: "संदेह करने के बजाय सकारात्मक श्रद्धा रखें; विश्वास ही सफलता और शांति की जड़ है।"
      },
      {
        chapterNumber: 9,
        chapterName: "રાજવિદ્યારાજગુહ્ય યોગ",
        shlokNumber: 22,
        sanskritExcerpt: "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते। तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥",
        gujaratiSummary: "જે અનન્ય ભાવથી કેવળ મારું ચિંતન કરતા નિષ્કામ ઉપાસના કરે છે, તે નિત્યયુક્ત ભક્તોનું યોગક્ષેમ (સંરક્ષણ અને પોષણ) હું પોતે વહન કરું છું.",
        hindiSummary: "जो अनन्य भाव से केवल मेरा चिंतन करते हुए निष्काम उपासना करते हैं, उन नित्ययुक्त भक्तों का योगक्षेम मैं स्वयं वहन करता हूँ।",
        lifeLesson: "જ્યારે નિષ્ઠાપૂર્વક ઈશ્વર પર ભરોસો મૂકો છો, ત્યારે ઈશ્વર અદ્રશ્ય રીતે તમારું ધ્યાન રાખે છે.",
        lifeLessonHi: "जब निष्ठापूर्वक ईश्वर पर भरोसा रखते हैं, तब ईश्वर अदृश्य रूप से आपकी रक्षा करते हैं।"
      },
      {
        chapterNumber: 18,
        chapterName: "મોક્ષસંન્યાસ યોગ",
        shlokNumber: 66,
        sanskritExcerpt: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
        gujaratiSummary: "બધા ધર્મો અને ઉપાધિઓનો ત્યાગ કરીને કેવળ મારી શરણમાં આવી જા. હું તને બધા પાપોમાંથી મુક્ત કરીશ, તું શોક ન કર.",
        hindiSummary: "सब धर्मों को छोड़कर केवल मेरी शरण में आ जाओ। मैं तुम्हें सब पापों से मुक्त कर दूंगा, तुम शोक मत करो।",
        lifeLesson: "સર્વશક્તિમાન પરમાત્માને સર્વસ્વ સોંપી દો; પૂર્ણ શરણાગતિ એ જ અંતિમ નિર્ભયતા છે.",
        lifeLessonHi: "सर्वशक्तिमान परमात्मा को सर्वस्व सौंप दें; पूर्ण शरणागति ही परम निर्भयता है।"
      }
    ]
  },
  {
    id: "relationship",
    title: "સંબંધોમાં તણાવ અને ક્ષમા",
    titleHi: "संबंधों में तनाव और क्षमा",
    englishTitle: "Relationship Conflicts & Forgiveness",
    icon: Users,
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.10)",
    borderColor: "rgba(59, 130, 246, 0.28)",
    essence: "સામેવાળામાં પણ પરમાત્માનો અંશ છે તે સમજીને ક્ષમા અને સહાનુભૂતિ કેળવો. મધુર વાણી સંબંધોનું અમૃત છે.",
    essenceHi: "सामने वाले में भी परमात्मा का अंश है यह समझकर क्षमा और सहानुभूति अपनाएं। मधुर वाणी संबंधों का अमृत है।",
    shlokas: [
      {
        chapterNumber: 6,
        chapterName: "આત્મસંયમ યોગ",
        shlokNumber: 32,
        sanskritExcerpt: "आत्मौपम्येन सर्वत्र समं पश्यति योऽर्जुन। सुखं वा यदि वा दुःखं स योगी परमो मतः॥",
        gujaratiSummary: "જે પોતાના આત્માની સમાન જ સર્વ પ્રાણીઓના સુખ અને દુઃખને સમાન દ્રષ્ટિએ જુએ છે, તે સર્વશ્રેષ્ઠ યોગી ગણાય છે.",
        hindiSummary: "जो अपनी आत्मा के समान ही सब प्राणियों के सुख और दुःख को समान दृष्टि से देखता है, वही सर्वश्रेष्ठ योगी माना गया है।",
        lifeLesson: "બીજાને દોષ દેતા પહેલા પોતાને તેના સ્થાને મૂકીને જુઓ; પરસ્પર સહાનુભૂતિ સંબંધો સુધારે છે.",
        lifeLessonHi: "दूसरों को दोष देने से पहले स्वयं को उनके स्थान पर रखकर देखें; परस्पर सहानुभूति संबंध सुधारती है।"
      },
      {
        chapterNumber: 12,
        chapterName: "ભક્તિ યોગ",
        shlokNumber: 13,
        sanskritExcerpt: "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च। निर्ममो निरहङ्कारः समदुःखसुखः क्षमी॥",
        gujaratiSummary: "જે કોઈ પ્રાણી પ્રત્યે દ્વેષ રાખતો નથી, બધાનો મિત્ર અને દયાળુ છે, મમતા-અહંકાર મુક્ત, સુખ-દુઃખમાં સમાન અને ક્ષમાવાન છે તે પ્રભુને અતિ પ્રિય છે.",
        hindiSummary: "जो किसी प्राणी से द्वेष नहीं करता, सबका मित्र और दयालु है, ममतारहित, अहंकाररहित, सुख-दुःख में समान और क्षमाशील है - वह मुझे अति प्रिय है।",
        lifeLesson: "મનમાં વેર કે કડવાશ રાખવાથી પોતાનું જ નુકસાન થાય છે; ક્ષમા આપીને મનને હળવું કરો.",
        lifeLessonHi: "मन में वैर या कड़वाहट रखने से अपना ही नुकसान होता है; क्षमा देकर मन को हल्का करें।"
      },
      {
        chapterNumber: 17,
        chapterName: "શ્રદ્ધાત્રયવિભાગ યોગ",
        shlokNumber: 15,
        sanskritExcerpt: "अनुद्वेगकरं वाक्यं सत्यं प्रियहितं च यत्। स्वाध्यायाभ्यसनं चैव वाङ्मयं तप उच्यते॥",
        gujaratiSummary: "જે વાણી કોઈને ઉદ્વેગ કે ક્ષોભ ન પહોંચાડે, સત્ય, પ્રિય અને હિતકારી હોય તેમજ સ્વાધ્યાય કરવો - તે વાણીનું સાચું તપ છે.",
        hindiSummary: "जो वाणी किसी को उद्वेग न पहुंचाए, सत्य, प्रिय और हितकारी हो तथा स्वाध्याय का अभ्यास - यह वाणी की सच्ची तपस्या कही जाती है।",
        lifeLesson: "શબ્દો ઘા પણ કરી શકે છે અને મલમ પણ બની શકે છે; સદાય હિતકારી અને મધુર વાણી બોલો.",
        lifeLessonHi: "शब्द घाव भी कर सकते हैं और मरहम भी बन सकते हैं; सदैव हितकारी और मधुर वाणी बोलें।"
      }
    ]
  }
];

const TOPIC_DATA_EN = {
  anger: {
    essence: "Anger clouds human intellect and destroys reasoning power. Only a serene mind can make the right decisions.",
    shlokas: [
      {
        summary: "From anger arises delusion, from delusion comes loss of memory; with memory bewildered, intellect is destroyed, and with the ruin of intellect, a person falls.",
        lifeLesson: "Whenever anger rises, do not react immediately. Take deep breaths and give your mind time to cool down."
      },
      {
        summary: "For those who are free from lust and anger, who have subdued their minds, and who know the Self, divine peace is everywhere around them.",
        lifeLesson: "Mastering anger is the true key to mental peace and life success."
      },
      {
        summary: "Lust, anger, and greed are the three gates leading to the degradation of the soul. Therefore, one must completely renounce these three.",
        lifeLesson: "Anger and greed rob life of its beauty; cultivate contentment and forgiveness."
      }
    ]
  },
  stress: {
    essence: "Do not worry about circumstances beyond your control. Focus solely on your best effort and leave results to the Divine.",
    shlokas: [
      {
        summary: "You have a right only to perform your prescribed duty, never to its fruits. Let not the fruit of action be your motive, nor let there be attachment to inaction.",
        lifeLesson: "Cast aside anxiety over outcomes and give 100% devotion to the task currently at hand."
      },
      {
        summary: "O son of Kunti, the contacts of senses with objects produce sensations of heat and cold, pleasure and pain. They are fleeting; learn to endure them patiently.",
        lifeLesson: "No challenging phase lasts forever; this too shall pass. Grant your mind patient endurance."
      },
      {
        summary: "Abandon all varieties of dharmas and simply surrender unto Me alone. I shall liberate you from all sinful reactions; do not grieve.",
        lifeLesson: "Surrender your deepest anxieties to God with total faith; you will experience immense inner strength and peace."
      }
    ]
  },
  focus: {
    essence: "An untamed mind acts as an enemy, while a disciplined mind is your greatest ally. Focus is developed through steady practice and detachment.",
    shlokas: [
      {
        summary: "From wherever the restless and unsteady mind wanders away, one must bring it back under the control of the Self.",
        lifeLesson: "Whenever your attention wavers while working or studying, gently bring it back without frustration."
      },
      {
        summary: "O mighty-armed Arjuna, the mind is indeed restless and hard to curb; but through continuous practice and dispassion, it can be controlled.",
        lifeLesson: "Daily meditation and disciplined focus steadily quiet the mind's turbulence."
      },
      {
        summary: "Elevate yourself by your own mind, do not degrade yourself; for the mind alone is one's friend, and the mind alone is one's enemy.",
        lifeLesson: "Your greatest strength or biggest hurdle is your own thought pattern. Turn your inner voice into your mentor."
      }
    ]
  },
  fear: {
    essence: "The eternal soul can never be destroyed by any worldly circumstance. Renounce fear and step forward with faith and courage.",
    shlokas: [
      {
        summary: "Treating pleasure and pain, gain and loss, victory and defeat with equanimity, engage yourself in battle; thus you shall incur no sin.",
        lifeLesson: "Focus completely on putting forth your honest effort rather than fearing failure."
      },
      {
        summary: "An unlearned person without faith and full of doubts goes to destruction. For the doubting soul, there is happiness neither here nor hereafter.",
        lifeLesson: "Self-doubt paralyzes potential. Replace fear with trust in your inner capability."
      },
      {
        summary: "To those who always remember Me with focused devotion, I carry what they lack and preserve what they have.",
        lifeLesson: "When you entrust your life to righteousness and truth, divine grace protects you at every step."
      }
    ]
  },
  decision: {
    essence: "When caught in life's crossroads, choose duty and righteousness over personal convenience and desires.",
    shlokas: [
      {
        summary: "My nature is overpowered by grief; my mind is confused regarding my duty. I ask You: tell me clearly what is best for me. I am Your disciple; guide me.",
        lifeLesson: "When confused, put aside ego and seek guidance from wise mentors and spiritual teachings."
      },
      {
        summary: "It is far better to perform one's own prescribed duty, even if imperfectly, than to attempt another's duty well. Death in one's own duty is auspicious.",
        lifeLesson: "Do not compare yourself to others or imitate blindly. Follow your authentic path with integrity."
      },
      {
        summary: "Thus, wisdom more secret than all secrets has been expounded to you by Me. Reflect deeply on this, and then act as you choose.",
        lifeLesson: "Seek knowledge, contemplate thoroughly, and make decisions with conscious personal accountability."
      }
    ]
  },
  peace: {
    essence: "External possessions offer only fleeting pleasure. Authentic, lasting tranquility is found within one's own inner self.",
    shlokas: [
      {
        summary: "Knowing Me as the beneficiary of all sacrifices, Lord of all worlds, and friend of all living beings, one attains eternal peace.",
        lifeLesson: "Remember that the Divine is your eternal benefactor and friend; let this bring deep comfort to your soul."
      },
      {
        summary: "The person who abandons all desires and moves about free from longing, devoid of possessiveness and egoism—that person attains peace.",
        lifeLesson: "Reduce unnecessary desires and attachment to attain lasting mental calm."
      },
      {
        summary: "One by whom the world is not agitated and who is not agitated by the world, who is free from joy, envy, fear, and anxiety—he is dear to Me.",
        lifeLesson: "Do not let other people's opinions or chaotic surroundings disturb your inner equilibrium."
      }
    ]
  },
  grief: {
    essence: "Death or parting is merely the transition of the physical body; the soul is eternally immortal. Rest firmly in the eternity of consciousness.",
    shlokas: [
      {
        summary: "You mourn for those who need not be grieved for, yet speak words of wisdom. The truly wise grieve neither for the living nor for the departed.",
        lifeLesson: "Accept life's natural flow; sorrow lessens when we recognize eternal spiritual reality."
      },
      {
        summary: "The soul is never born, nor does it ever die; having existed, it never ceases to be. It is unborn, eternal, ever-existing, and primeval.",
        lifeLesson: "Bodies perish, but the soul and memories live on in eternity. Cultivate courage through this truth."
      },
      {
        summary: "For one who is born, death is certain; and for one who dies, rebirth is certain. Therefore, you should not grieve over the unavoidable.",
        lifeLesson: "Accept unavoidable realities with calmness; focus on constructive actions in the present."
      }
    ]
  },
  laziness: {
    essence: "Laziness and procrastination shroud the brilliance of the soul. Awaken to proactive action and dedicated duty with enthusiasm.",
    shlokas: [
      {
        summary: "Perform your prescribed duty, for action is indeed superior to inaction. Even bodily maintenance is impossible without activity.",
        lifeLesson: "Procrastination drains vital energy. Begin with small, positive actions right now."
      },
      {
        summary: "Happiness that blinds the soul from beginning to end, arising from sleep, indolence, and negligence, is said to be in the mode of ignorance.",
        lifeLesson: "Laziness provides deceptive comfort. True fulfillment comes through purposeful effort."
      },
      {
        summary: "Elevate yourself by your own mind, do not degrade yourself; for the mind alone is one's friend, and the mind alone is one's enemy.",
        lifeLesson: "Take charge of your habits today. Dedicate your mind towards creative and positive endeavors."
      }
    ]
  },
  ego: {
    essence: "Thinking 'I am the sole doer' is the root of pride and fall. Humility, simplicity, and selfless dedication grant genuine liberation and peace.",
    shlokas: [
      {
        summary: "All actions are performed by the gunas of material nature. One whose mind is deluded by false ego thinks, 'I am the doer.'",
        lifeLesson: "Remain humble in moments of success. Attributes and abilities are divine gifts."
      },
      {
        summary: "Hypocrisy, arrogance, conceit, anger, harshness, and ignorance belong to those born of demoniac nature, O Partha.",
        lifeLesson: "Ego breaks relationships and blocks self-improvement. Practice modesty and kindness."
      },
      {
        summary: "If, having become absorbed in egoism, you do not listen to My counsel, you will perish.",
        lifeLesson: "Arrogance deafens one to truth. Stay open to wise counsel and constructive feedback."
      }
    ]
  },
  attachment: {
    essence: "Excessive attachment binds the human spirit. Living with selfless detachment yields true contentment and unbounded joy.",
    shlokas: [
      {
        summary: "While contemplating objects of the senses, attachment develops; from attachment springs desire, and from desire arises anger.",
        lifeLesson: "Notice where your mind dwells excessively. Guard against obsessive thoughts before they overpower reason."
      },
      {
        summary: "It is lust, it is anger, born of the passion mode, insatiable and all-devouring—know this as the greatest enemy here in the world.",
        lifeLesson: "Channel unchecked desires into noble, creative, and selfless pursuits."
      },
      {
        summary: "The mode of passion is marked by intense longing and attachment to fruitive actions; it binds the embodied soul to continuous labor.",
        lifeLesson: "Work wholeheartedly, but do not let yourself be enslaved by greed or compulsive acquisitiveness."
      }
    ]
  },
  devotion: {
    essence: "Unshakable faith in the Divine and devotion to righteous deeds carry you across every storm in life.",
    shlokas: [
      {
        summary: "The ignorant, faithless, and doubting soul perishes. For the skeptic, there is happiness neither in this world nor in the next.",
        lifeLesson: "Doubt scatters attention; unwavering faith unifies mental power and opens doors to success."
      },
      {
        summary: "To those who always remember Me with focused devotion, I carry what they lack and preserve what they have.",
        lifeLesson: "Trust that genuine devotion and ethical work are always blessed and supported by God."
      },
      {
        summary: "Abandon all varieties of dharmas and simply surrender unto Me alone. I shall liberate you from all sins; do not grieve.",
        lifeLesson: "Release your burdens to the Lord and perform your duty with peace and devotion in your heart."
      }
    ]
  },
  relationship: {
    essence: "Recognize the divine spark within every being; foster forgiveness and empathy. Kind and truthful speech is nectar for relationships.",
    shlokas: [
      {
        summary: "He who looks upon the joys and sorrows of all beings with empathy, as if they were his own, is regarded as the highest yogi.",
        lifeLesson: "See life from others' perspectives. Empathy transforms conflicts into mutual understanding."
      },
      {
        summary: "He who harbors no hatred toward any creature, who is friendly and compassionate, free from possessiveness and ego, equal in joy and sorrow, and forgiving—he is dear to Me.",
        lifeLesson: "Holding grudges harms you first. Forgive and let go to unburden your heart."
      },
      {
        summary: "Words that cause no distress, that are truthful, pleasant, and beneficial, alongside daily self-study—this is the austerity of speech.",
        lifeLesson: "Words can wound or heal. Always speak truthfully, gently, and with benevolent intent."
      }
    ]
  }
};

function LifeGuidance() {
  const navigate = useNavigate();
  const { isHindi, isEnglish, isGujarati, txt, CHAPTER_NAMES } = useLanguage();
  const [selectedTopicId, setSelectedTopicId] = useState(GUIDANCE_TOPICS[0].id);
  const shlokasSectionRef = useRef(null);

    const TOPIC_TITLES_HI = {
    anger: "क्रोध और आवेग",
    stress: "चिंता और तनाव",
    focus: "मन की अशांति और एकाग्रता",
    fear: "विफलता और भय",
    decision: "निर्णय क्षमता और धर्मसंकट",
    peace: "आंतरिक शांति और संतोष",
    grief: "दुःख, वियोग और शोक",
    laziness: "आलस्य, प्रमाद और निराशा",
    ego: "अहंकार और ईर्ष्या",
    attachment: "अत्यधिक मोह और आसक्ति",
    devotion: "श्रद्धा, भक्ति और ईश्वर शरणागति",
    relationship: "संबंधों में तनाव और क्षमा",
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const currentTopic =
    GUIDANCE_TOPICS.find((t) => t.id === selectedTopicId) || GUIDANCE_TOPICS[0];

  const handleSelectTopic = (topicId) => {
    setSelectedTopicId(topicId);

    // Automatically scroll down to the related shlokas section
    setTimeout(() => {
      if (shlokasSectionRef.current) {
        const yOffset = window.innerWidth <= 768 ? -70 : -85;
        const element = shlokasSectionRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    }, 60);
  };

  const handleReadFullShlok = (chapterNumber, shlokNumber) => {
    navigate(`/chapter/${chapterNumber}?shloka=${shlokNumber}`);
  };

  return (
    <main className="guidance-page">
      {/* PAGE HEADER */}
      <header className="guidance-header-banner">
        <h1>
          {isEnglish ? (
            <>Life Dilemmas & <span className="highlight-text">Gita Solutions</span></>
          ) : isHindi ? (
            <>जीवन की उलझन और <span className="highlight-text">गीता समाधान</span></>
          ) : (
            <>જીવનની મૂંઝવણ અને <span className="highlight-text">ગીતા ઉકેલ</span></>
          )}
        </h1>

        <p className="guidance-intro">
          {txt(
            "તમારી વર્તમાન મનોસ્થિતિ કે પડકાર પસંદ કરો અને ભગવાન શ્રીકૃષ્ણના અમૃતમય શબ્દોમાંથી પ્રેરણા, સાચો નિર્ણય અને આંતરિક શાંતિ પ્રાપ્ત કરો.",
            "अपनी वर्तमान मनःस्थिति या चुनौती चुनें और भगवान श्रीकृष्ण के अमृतमयी वचनों से प्रेरणा, सही निर्णय और आंतरिक शांति प्राप्त करें।",
            "Choose your current state of mind or challenge and discover divine inspiration, clarity, and peace through the timeless teachings of Lord Krishna."
          )}
        </p>

        {/* TOPIC SELECTOR GRID (HORIZONTAL SCROLL ON MOBILE) */}
        <div className="guidance-topics-scroll-wrapper">
          <div className="guidance-topics-grid">
            {GUIDANCE_TOPICS.map((topic) => {
              const IconComponent = topic.icon;
              const isSelected = topic.id === selectedTopicId;
              const displayedTitle = isEnglish
                ? (topic.englishTitle || topic.title)
                : isHindi
                ? (TOPIC_TITLES_HI[topic.id] || topic.title)
                : topic.title;

              return (
                <button
                  key={topic.id}
                  type="button"
                  className={`topic-pill-btn ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectTopic(topic.id)}
                  style={{
                    "--topic-accent": topic.color,
                    "--topic-bg": topic.bgColor,
                    "--topic-border": topic.borderColor
                  }}
                >
                  <span className="pill-icon">
                    <IconComponent size={18} strokeWidth={2.2} />
                  </span>
                  <span className="pill-text">
                    <strong>{displayedTitle}</strong>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* CONTENT WRAPPER */}
      <section className="guidance-content-container" ref={shlokasSectionRef}>
        {/* DIVINE ESSENCE BANNER */}
        <div
          className="divine-essence-card"
          style={{
            borderLeftColor: currentTopic.color
          }}
        >
          <div
            className="essence-badge-icon"
            style={{ background: currentTopic.color }}
          >
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div className="essence-info">
            <h3>
              {isEnglish
                ? (TOPIC_DATA_EN[currentTopic.id]?.essence || currentTopic.essence)
                : (isHindi && currentTopic.essenceHi)
                ? currentTopic.essenceHi
                : currentTopic.essence}
            </h3>
          </div>
        </div>

        {/* SHLOKAS SECTION */}
        <div className="guidance-shlokas-grid">
          {currentTopic.shlokas.map((shlok, index) => {
            const englishShlokData = TOPIC_DATA_EN[currentTopic.id]?.shlokas?.[index];
            const localizedChapterName = isEnglish
              ? (CHAPTER_NAMES?.[shlok.chapterNumber]?.nameEn || CHAPTER_NAMES?.[shlok.chapterNumber]?.en || shlok.chapterName)
              : isHindi
              ? (CHAPTER_NAMES?.[shlok.chapterNumber]?.nameHi || CHAPTER_NAMES?.[shlok.chapterNumber]?.hi || shlok.chapterName)
              : (CHAPTER_NAMES?.[shlok.chapterNumber]?.name || CHAPTER_NAMES?.[shlok.chapterNumber]?.gu || shlok.chapterName);

            return (
              <article
                className="guidance-card"
                key={`${currentTopic.id}-${index}`}
              >
                {/* CARD TOP META */}
                <div className="card-header-meta">
                  <span className="card-ref-badge">
                    {txt("અધ્યાય", "अध्याय", "Chapter")} {shlok.chapterNumber} • {txt("શ્લોક", "श्लोक", "Verse")} {shlok.shlokNumber}
                  </span>
                  <span className="card-chapter-title">{localizedChapterName}</span>
                </div>

                {/* SANSKRIT VERSE */}
                <div className="card-sanskrit-block">
                  <p className="sanskrit-text">"{shlok.sanskritExcerpt}"</p>
                </div>

                {/* TRANSLATION */}
                <div className="card-meaning-block">
                  <h4>
                    <BookOpen size={16} /> {txt("સરળ ગુજરાતી અર્થ", "सरल अर्थ", "Simple Meaning")}
                  </h4>
                  <p>
                    {isEnglish
                      ? (englishShlokData?.summary || shlok.gujaratiSummary)
                      : (isHindi && shlok.hindiSummary)
                      ? shlok.hindiSummary
                      : shlok.gujaratiSummary}
                  </p>
                </div>

                {/* PRACTICAL LIFE LESSON */}
                <div
                  className="card-lesson-block"
                  style={{
                    borderColor: `${currentTopic.color}45`,
                    background: currentTopic.bgColor
                  }}
                >
                  <span
                    className="lesson-header-tag"
                    style={{ color: currentTopic.color }}
                  >
                    💡 {txt("વ્યવહારિક જીવનમાં ઉપયોગ:", "व्यावहारिक जीवन में उपयोग:", "Practical Life Application:")}
                  </span>
                  <p>
                    {isEnglish
                      ? (englishShlokData?.lifeLesson || shlok.lifeLesson)
                      : (isHindi && shlok.lifeLessonHi)
                      ? shlok.lifeLessonHi
                      : shlok.lifeLesson}
                  </p>
                </div>

                {/* ACTION BUTTON */}
                <button
                  type="button"
                  className="card-navigate-btn"
                  onClick={() =>
                    handleReadFullShlok(shlok.chapterNumber, shlok.shlokNumber)
                  }
                >
                  <span>{txt("સંપૂર્ણ શ્લોક વાંચો", "सम्पूर्ण श्लोक पढ़ें", "Read Full Verse")}</span>
                  <ChevronRight size={18} />
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default LifeGuidance;

