import { useState, useEffect } from "react";
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
import "./LifeGuidance.css";

const GUIDANCE_TOPICS = [
  {
    id: "anger",
    title: "ક્રોધ અને આવેગ",
    englishTitle: "Anger & Impatience",
    icon: Flame,
    color: "#1d4ed8",
    bgColor: "rgba(29, 78, 216, 0.10)",
    borderColor: "rgba(29, 78, 216, 0.28)",
    essence: "ક્રોધથી મનુષ્યની બુદ્ધિ ભ્રમિત થાય છે અને વિચારવાની શક્તિ નષ્ટ થઈ જાય છે. શાંત મન જ સાચો નિર્ણય લઈ શકે છે.",
    shlokas: [
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 63,
        sanskritExcerpt: "क्रोधाद्भवति संमोहः संमोहात्स्मृतिविभ्रमः। स्मृतिभ्रंशाद् बुद्धिनाशो बुद्धिनाशात्प्रणश्यति॥",
        gujaratiSummary: "ક્રોધથી અજ્ઞાન અને ભ્રમ ઉત્પન્ન થાય છે, ભ્રમથી સ્મૃતિ ભ્રષ્ટ થાય છે, સ્મૃતિ ભ્રષ્ટ થવાથી બુદ્ધિનો નાશ થાય છે અને બુદ્ધિ નષ્ટ થતાં મનુષ્યનું પતન થાય છે.",
        lifeLesson: "જ્યારે પણ ક્રોધ આવે, ત્યારે તાત્કાલિક પ્રતિક્રિયા ન આપો. ઊંડો શ્વાસ લો અને મનને શાંત થવાનો સમય આપો."
      },
      {
        chapterNumber: 5,
        chapterName: "કર્મસંન્યાસ યોગ",
        shlokNumber: 26,
        sanskritExcerpt: "कामक्रोधवियुक्तानां यतीनां यतचेतसाम्। अभितो ब्रह्मनिर्वाणं वर्तते विदितात्मनाम्॥",
        gujaratiSummary: "કામ અને ક્રોધથી સંપૂર્ણ મુક્ત, નિયંત્રિત મનવાળા અને આત્મસાક્ષાત્કારી મહાપુરુષોને બધી બાજુથી પરમ શાંતિ પ્રાપ્ત થાય છે.",
        lifeLesson: "ક્રોધ પર વિજય મેળવવો એ જ મનની સાચી શાંતિ અને સફળતાની ચાવી છે."
      },
      {
        chapterNumber: 16,
        chapterName: "દૈવાસુરસંપદ્વિભાગ યોગ",
        shlokNumber: 21,
        sanskritExcerpt: "त्रिविधं नरकस्येदं द्वारं नाशनमात्मनः। कामः क्रोधस्तथा लोभस्तस्मादेतत्त्रयं त्यजेत्॥",
        gujaratiSummary: "કામ, ક્રોધ અને લોભ - આ ત્રણ આત્માનો નાશ કરનારા નરકના દ્વાર છે. તેથી આ ત્રણેયનો સદંતર ત્યાગ કરવો જોઈએ.",
        lifeLesson: "ક્રોધ અને લોભ જીવનની સુંદરતા છીનવી લે છે; સંતોષ અને ક્ષમા કેળવો."
      }
    ]
  },
  {
    id: "stress",
    title: "ચિંતા અને તણાવ",
    englishTitle: "Anxiety & Stress",
    icon: CloudRain,
    color: "#0284c7",
    bgColor: "rgba(2, 132, 199, 0.10)",
    borderColor: "rgba(2, 132, 199, 0.28)",
    essence: "જે પરિસ્થિતિ તમારા હાથમાં નથી તેની ચિંતા ન કરો. માત્ર તમારા શ્રેષ્ઠ પ્રયાસ પર ધ્યાન કેન્દ્રિત કરો, પરિણામ ઈશ્વર પર છોડો.",
    shlokas: [
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 47,
        sanskritExcerpt: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
        gujaratiSummary: "તમારો અધિકાર ફક્ત કર્મ કરવાનો છે, તેના ફળ પર ક્યારેય નહીં. કર્મફળની આસક્તિ ન રાખો અને કર્મ ન કરવાનો આળસ પણ ન કરો.",
        lifeLesson: "પરિણામની ચિંતા છોડીને આ ક્ષણે જે કાર્ય હાથમાં છે તેમાં 100% સમર્પણ આપો."
      },
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 14,
        sanskritExcerpt: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुખદુઃખદાઃ। આગમાપાયિનોऽનિત્યાસ્તાંસ્તિતિક્ષસ્વ ભારત॥",
        gujaratiSummary: "સુખ-દુઃખ, ટાઢ-તડકો અનિત્ય છે - આવે છે અને ચાલ્યા જાય છે. હે અર્જુન! તેમને ધૈર્યપૂર્વક સહન કરતા શીખો.",
        lifeLesson: "કોઈપણ મુશ્કેલ સમય કાયમી નથી, આ સમય પણ વીતી જશે. મનને ધીરજ આપો."
      },
      {
        chapterNumber: 18,
        chapterName: "મોક્ષસંન્યાસ યોગ",
        shlokNumber: 66,
        sanskritExcerpt: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
        gujaratiSummary: "બધી ચિંતાઓ અને આશંકાઓ છોડીને માત્ર મારા શરણમાં આવ. હું તને બધા જ કષ્ટોમાંથી મુક્ત કરીશ, તું શોક ન કર.",
        lifeLesson: "જ્યારે મન અતિશય થાકી જાય, ત્યારે ઈશ્વર પર અતૂટ ભરોસો રાખીને મનને આરામ આપો."
      }
    ]
  },
  {
    id: "focus",
    title: "મનની અશાંતિ & એકાગ્રતા",
    englishTitle: "Restless Mind & Focus",
    icon: Target,
    color: "#2563eb",
    bgColor: "rgba(37, 99, 235, 0.10)",
    borderColor: "rgba(37, 99, 235, 0.28)",
    essence: "મન વાયુની જેમ ચંચળ છે, પરંતુ દૈનિક સાધના, અભ્યાસ અને વૈરાગ્ય દ્વારા તેને એકાગ્ર કરી શકાય છે.",
    shlokas: [
      {
        chapterNumber: 6,
        chapterName: "આત્મસંયમ યોગ",
        shlokNumber: 26,
        sanskritExcerpt: "यतो यतो निश्चरति मनश्चञ्चलमस्थिरम्। ततस्ततो नियम्यैतदात्मन्येव वशं नयेत्॥",
        gujaratiSummary: "આ ચંચળ અને અસ્થિર મન જે જે વિષયો તરફ ભટકે છે, ત્યાંથી તેને વાળીને વારંવાર અંતરમાં સ્થિર કરવું જોઈએ.",
        lifeLesson: "જ્યારે પણ ધ્યાન ભટકે, ત્યારે નિરાશ થયા વગર ફરીથી મનને ધીમેથી વર્તમાન કામમાં લાવો."
      },
      {
        chapterNumber: 6,
        chapterName: "આત્મસંયમ યોગ",
        shlokNumber: 35,
        sanskritExcerpt: "असंशयं महाबाहो मनो दुर्निग्रहं चलम्। अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते॥",
        gujaratiSummary: "નિઃસંદેહ મન ચંચળ અને વશ કરવું કઠિન છે; પરંતુ હે કુંતીપુત્ર! નિયમિત અભ્યાસ અને આસક્તિ મુક્તિ દ્વારા તેને નિયંત્રિત કરી શકાય છે.",
        lifeLesson: "એકાગ્રતા એ કોઈ ચમત્કાર નથી પરંતુ રોજિંદા સતત અભ્યાસનું પરિણામ છે."
      },
      {
        chapterNumber: 6,
        chapterName: "આત્મસંયમ યોગ",
        shlokNumber: 5,
        sanskritExcerpt: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
        gujaratiSummary: "પોતાના મન દ્વારા પોતાનો ઉદ્ધાર કરવો જોઈએ, પોતાનું પતન ન કરવું જોઈએ. કારણ કે મનુષ્ય પોતે જ પોતાનો મિત્ર છે અને પોતે જ શત્રુ છે.",
        lifeLesson: "તમારા જીવનના સૌથી મોટા નિર્માતા તમે પોતે જ છો. સકારાત્મક વિચારો પસંદ કરો."
      }
    ]
  },
  {
    id: "fear",
    title: "નિષ્ફળતા અને ડર",
    englishTitle: "Fear & Dealing with Failure",
    icon: ShieldAlert,
    color: "#1e40af",
    bgColor: "rgba(30, 64, 175, 0.10)",
    borderColor: "rgba(30, 64, 175, 0.28)",
    essence: "હારી જવાનો ડર મનુષ્યને સાચો પ્રયાસ પણ કરવા દેતો નથી. જય અને પરાજય બંને જીવનના પાઠ છે, અંત નથી.",
    shlokas: [
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 38,
        sanskritExcerpt: "सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ। ततो युद्धाय युज्यस्व नैवं पापमवाप्स्यसि॥",
        gujaratiSummary: "સુખ અને દુઃખ, લાભ અને હાનિ, વિજય અને પરાજયને એકસમાન ગણીને તું કર્તવ્યના પાલનમાં જોડાઈ જા.",
        lifeLesson: "પરિણામ ભલે જે આવે, જો તમે પૂરી પ્રામાણિકતાથી લડ્યા છો તો તમે ક્યારેય હાર્યા નથી."
      },
      {
        chapterNumber: 4,
        chapterName: "જ્ઞાનકર્મસંન્યાસ યોગ",
        shlokNumber: 40,
        sanskritExcerpt: "અજ્ઞશ્ચાશ્રદ્દધાનશ્ચ સંશયાત્મા વિનશ્યતિ। નાયં લોકોऽસ્તિ ન પરો ન સુખં સંશયાત્મનઃ॥",
        gujaratiSummary: "અજ્ઞાની, શ્રદ્ધાહીન અને સતત સંશય-ડર રાખનાર મનુષ્યનો નાશ થાય છે. સંશયી મનને આ લોકમાં કે પરલોકમાં ક્યાંય સુખ મળતું નથી.",
        lifeLesson: "પોતાની ક્ષમતા અને ઈશ્વરની કૃપા પર પૂર્ણ શ્રદ્ધા રાખો; શંકાને મનમાંથી વિદાય આપો."
      },
      {
        chapterNumber: 9,
        chapterName: "રાજવિદ્યા રાજગુહ્ય યોગ",
        shlokNumber: 22,
        sanskritExcerpt: "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते। तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥",
        gujaratiSummary: "જે લોકો અનન્ય ભાવથી મારું ચિંતન કરતા મારી ઉપાસના કરે છે, તે નિત્ય યુક્ત ભક્તોના રક્ષણ અને જરૂરિયાતોની જવાબદારી હું ઉઠાવું છું.",
        lifeLesson: "સાચા માર્ગ પર ચાલનાર વ્યક્તિ ક્યારેય અસહાય હોતી નથી, ઈશ્વરીય શક્તિ તમારી સાથે છે."
      }
    ]
  },
  {
    id: "decision",
    title: "નિર્ણય લેવાની મૂંઝવણ",
    englishTitle: "Confusion & Right Choice",
    icon: Scale,
    color: "#0369a1",
    bgColor: "rgba(3, 105, 161, 0.10)",
    borderColor: "rgba(3, 105, 161, 0.28)",
    essence: "જ્યારે બે માર્ગ વચ્ચે મૂંઝવણ થાય, ત્યારે સરળ માર્ગને બદલે તમારા સાચા કર્તવ્ય અને નૈતિક મૂલ્યોવાળા માર્ગને પસંદ કરો.",
    shlokas: [
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 7,
        sanskritExcerpt: "कार्पण्यदोषोपहतस्वभावः पृच्छामि त्वां धर्मसंमूढचेताः। यच्छ्रेयः स्यान्निश्चितं ब्रूहि तन्मे शिष्यस्तेऽहं शाधि मां त्वां प्रपन्नम्॥",
        gujaratiSummary: "મારું મન કર્તવ્યના મામલે મૂંઝવણમાં છે. જે માર્ગ મારા માટે નિશ્ચિતપણે કલ્યાણકારી હોય તે મને કહો. હું આપનો શિષ્ય છું, મને માર્ગદર્શન આપો.",
        lifeLesson: "જીવનમાં મૂંઝવણ થવી સામાન્ય છે, પરંતુ અહંકાર છોડીને યોગ્ય જ્ઞાન અને માર્ગદર્શન સ્વીકારવું એ શ્રેષ્ઠ નિર્ણય છે."
      },
      {
        chapterNumber: 3,
        chapterName: "કર્મ યોગ",
        shlokNumber: 35,
        sanskritExcerpt: "श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्। स्वधर्मे निधनं श्रेयः परधर्मो भयावहः॥",
        gujaratiSummary: "બીજાના કાર્યની નકલ કરવા કરતાં પોતાની કુદરતી ક્ષમતા અને કર્તવ્ય મુજબ કામ કરવું વધુ શ્રેયસ્કર છે.",
        lifeLesson: "બીજા લોકો શું કરે છે તેની ચિંતા છોડો; તમારો સાચો સ્વભાવ અને રુચિ શું છે તે મુજબ તમારા જીવનનો માર્ગ પસંદ કરો."
      },
      {
        chapterNumber: 18,
        chapterName: "મોક્ષસંન્યાસ યોગ",
        shlokNumber: 63,
        sanskritExcerpt: "इति ते ज्ञानमाख्यातं गुह्याद्गुह्यतरं मया। विमृश्यैतदशेषेण यथेच्छसि तथा कुरु॥",
        gujaratiSummary: "આ રીતે મેં તને પરમ રહસ્યમય જ્ઞાન આપ્યું છે. હવે આ સમગ્ર જ્ઞાન પર ઊંડાણપૂર્વક વિચાર કરીને તારી મરજી મુજબ નિર્ણય લે.",
        lifeLesson: "બધા પાસાઓનો તટસ્થપણે અભ્યાસ કરો, પછી પૂરા આત્મવિશ્વાસ સાથે તમારો અંતિમ નિર્ણય લો."
      }
    ]
  },
  {
    id: "peace",
    title: "એકલતા અને આંતરિક શાંતિ",
    englishTitle: "Loneliness & Inner Peace",
    icon: HeartHandshake,
    color: "#0ea5e9",
    bgColor: "rgba(14, 165, 233, 0.10)",
    borderColor: "rgba(14, 165, 233, 0.28)",
    essence: "તમે ક્યારેય એકલા નથી. પરમાત્મા દરેક પળે તમારા અંતરમાં બિરાજેલા છે. સાચી શાંતિ બહારની દુનિયામાં નહીં, ભીતરમાં છે.",
    shlokas: [
      {
        chapterNumber: 5,
        chapterName: "કર્મસંન્યાસ યોગ",
        shlokNumber: 29,
        sanskritExcerpt: "भोक्तारं यज्ञतपसां सर्वलोकमहेश्वरम्। सुहृदं सर्वभूतानां ज्ञात्वा मां शान्तिमृच्छति॥",
        gujaratiSummary: "મને સર્વ યજ્ઞો અને તપસ્યાઓનો ભોક્તા, સમસ્ત લોકોનો મહાન ઈશ્વર અને સર્વ પ્રાણીઓનો પરમ મિત્ર (હિતેચ્છુ) જાણીને મનુષ્ય પરમ શાંતિ પ્રાપ્ત કરે છે.",
        lifeLesson: "જ્યારે કોઈ તમારો સાથ ન આપે, ત્યારે યાદ રાખો કે સર્વશક્તિમાન પ્રભુ તમારા સદાકાળના સાચા મિત્ર છે."
      },
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 71,
        sanskritExcerpt: "विहाय कामान्यः सर्वान्पुमांश्चरति निःस्पृहः। निर्ममो निरहङ्कारः स शान्तिमधिगच्छति॥",
        gujaratiSummary: "જે મનુષ્ય બધી કામનાઓ ત્યજીને મમતા અને અહંકાર રહિત થઈને વિહરે છે, તે જ સાચી પરમ શાંતિ પ્રાપ્ત કરે છે.",
        lifeLesson: "'હું અને મારું' ની માનસિકતા છોડી દો; અહંકાર મુક્ત મન જ સૌથી મોટું સુખ છે."
      },
      {
        chapterNumber: 12,
        chapterName: "ભક્તિ યોગ",
        shlokNumber: 15,
        sanskritExcerpt: "यस्मान्नोद्विजते लोको लोकान्नोद्विजते च यः। हर्षामर्षभयोद्वेगैर्मुक्तो यः स च मे प्रियः॥",
        gujaratiSummary: "જેનાથી કોઈ મનુષ્ય ઉદ્વેગ (ત્રાસ) પામતો નથી અને જે પોતે પણ કોઈનાથી ઉદ્વેગ પામતો નથી, તેમજ હર્ષ, ઈર્ષ્યા, ભયથી મુક્ત છે તે મને અત્યંત પ્રિય છે.",
        lifeLesson: "બીજાના શબ્દો કે વ્યવહારથી અશાંત ન બનો. તમારી આંતરિક શાંતિની ચાવી બીજાના હાથમાં ન આપો."
      }
    ]
  },
  {
    id: "grief",
    title: "શોક અને વિયોગ",
    englishTitle: "Grief, Loss & Sorrow",
    icon: HeartCrack,
    color: "#1e3a8a",
    bgColor: "rgba(30, 58, 138, 0.10)",
    borderColor: "rgba(30, 58, 138, 0.28)",
    essence: "મૃત્યુ કે વિયોગ એ માત્ર શરીરનું રૂપાંતરણ છે, આત્મા સદા અજર-અમર છે. પ્રકૃતિના અનિવાર્ય સત્યને સ્વીકારીને આત્માની અમરતામાં સ્થિર થાઓ.",
    shlokas: [
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 11,
        sanskritExcerpt: "अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे। गतासूनगतासूंश्च नानुशोचन्ति पण्डिताः॥",
        gujaratiSummary: "જેમના માટે શોક ન કરવો જોઈએ તેમના માટે તું શોક કરે છે અને પાંડિત્યપૂર્ણ વાતો કરે છે. જ્ઞાની પુરુષો જીવિત કે મૃત કોઈના માટે શોક કરતા નથી.",
        lifeLesson: "જે વાસ્તવિકતા અને વિધાતાનો ક્રમ આપણા નિયંત્રણમાં નથી, તેનો સ્વીકાર કરવો એ જ શોકમાંથી મુક્તિ મેળવવાનો માર્ગ છે."
      },
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 20,
        sanskritExcerpt: "न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः। अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥",
        gujaratiSummary: "આત્મા ક્યારેય જન્મતો નથી કે મરતો નથી, તે અજન્મા, નિત્ય, શાશ્વત અને પુરાતન છે. શરીરનો નાશ થવા છતાં આત્માનો નાશ થતો નથી.",
        lifeLesson: "શરીર નશ્વર છે પરંતુ આત્મા અમર છે; પ્રિયજનના સદ્ગુણો અને સ્નેહને હૃદયમાં જીવંત રાખી આગળ વધો."
      },
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 27,
        sanskritExcerpt: "जातस्य हि ध्रुवो मृत्युर्ध्रुवं जन्म मृतस्य च। तस्मादपरिहार्येऽर्थे न त्वं शोचितुमर्हसि॥",
        gujaratiSummary: "જેનો જન્મ થયો છે તેનું મૃત્યુ નિશ્ચિત છે અને મૃત્યુ પામેલાનો પુનર્જન્મ નિશ્ચિત છે. તેથી આ અનિવાર્ય પ્રકૃતિના નિયમ માટે તારે શોક ન કરવો જોઈએ.",
        lifeLesson: "જીવનના અંતિમ સત્યને શાંતિપૂર્વક સ્વીકારો અને વર્તમાન કર્તવ્ય તરફ આગળ વધો."
      }
    ]
  },
  {
    id: "laziness",
    title: "આળસ અને પ્રમાદ",
    englishTitle: "Laziness & Procrastination",
    icon: Zap,
    color: "#2563eb",
    bgColor: "rgba(37, 99, 235, 0.10)",
    borderColor: "rgba(37, 99, 235, 0.28)",
    essence: "આળસ અને વિલંબ (procrastination) આત્માના તેજ અને પ્રતિભાને ઢાંકી દે છે. કર્મશીલ બનીને ઉત્સાહપૂર્વક કર્તવ્યમાં લાગી જાઓ.",
    shlokas: [
      {
        chapterNumber: 3,
        chapterName: "કર્મ યોગ",
        shlokNumber: 8,
        sanskritExcerpt: "नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः। शरीरयात्रापि च ते न प्रसिद्ध्येदकर्मणः॥",
        gujaratiSummary: "તું શાસ્ત્રવિહિત નિયત કર્મ કર, કેમ કે કર્મ ન કરવા કરતાં કર્મ કરવું શ્રેષ્ઠ છે. કર્મ કર્યા વિના તો તારા શરીરનો નિર્વાહ પણ શક્ય નથી.",
        lifeLesson: "નાના સંકલ્પથી શરૂઆત કરો; કર્મશીલ રહેવું એ જ જીવનમાં નવી ઊર્જા, ઉત્સાહ અને આત્મવિશ્વાસ લાવે છે."
      },
      {
        chapterNumber: 18,
        chapterName: "મોક્ષસંન્યાસ યોગ",
        shlokNumber: 39,
        sanskritExcerpt: "यदग्रे चानुबन्धे च सुखं मोहनमात्मनः। निद्रालस्यप्रमादोत्थं तत्तामसमुदाहृतम्॥",
        gujaratiSummary: "જે સુખ ભોગવતી વખતે અને પરિણામમાં પણ આત્માને મોહિત કરે છે, જે ઊંઘ, આળસ અને પ્રમાદમાંથી ઉત્પન્ન થાય છે તે તામસી સુખ છે.",
        lifeLesson: "આળસનું ક્ષણિક સુખ ભવિષ્યમાં મોટો પશ્ચાતાપ બને છે; આજના કામને આજે જ પૂર્ણ કરવાની ટેવ પાડો."
      },
      {
        chapterNumber: 6,
        chapterName: "આત્મસંયમ યોગ",
        shlokNumber: 5,
        sanskritExcerpt: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्। आत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
        gujaratiSummary: "મનુષ્યે પોતાના મન દ્વારા પોતાનો ઉદ્ધાર કરવો જોઈએ, પોતાનું પતન ન થવા દેવું જોઈએ. કારણ કે મનુષ્ય પોતે જ પોતાનો સાચો મિત્ર છે અને પોતે જ શત્રુ છે.",
        lifeLesson: "તમને આળસમાંથી બહાર લાવવા કોઈ અન્ય નહીં આવે; મનને સંકલ્પબદ્ધ કરી તમારી જાતને જાતે જ જાગૃત કરો."
      }
    ]
  },
  {
    id: "ego",
    title: "અહંકાર અને અભિમાન",
    englishTitle: "Ego & Pride",
    icon: Award,
    color: "#1d4ed8",
    bgColor: "rgba(29, 78, 216, 0.10)",
    borderColor: "rgba(29, 78, 216, 0.28)",
    essence: "'હું જ બધું કરું છું' એવો અહંકાર સર્વ પતનનું મૂળ છે. નમ્રતા, સરળતા અને ઈશ્વરાર્પણ ભાવના જ સાચી મુક્તિ અને આંતરિક શાંતિ આપે છે.",
    shlokas: [
      {
        chapterNumber: 3,
        chapterName: "કર્મ યોગ",
        shlokNumber: 27,
        sanskritExcerpt: "प्रकृतेः क्रियमाणानि गुणैः कर्माणि सर्वशः। अहङ्कारविमूढात्मा कर्ताहमिति मन्यते॥",
        gujaratiSummary: "બધા કર્મો વાસ્તવમાં પ્રકૃતિના ગુણો દ્વારા કરવામાં આવે છે, છતાં અહંકારથી મોહિત થયેલો અજ્ઞાની જીવ માને છે કે 'હું કર્તા છું'.",
        lifeLesson: "સફળતા મળ્યે અભિમાન ન કરો; ઈશ્વર, પ્રકૃતિ અને સાથીદારોના સહયોગ પ્રત્યે કૃતજ્ઞતા દર્શાવો."
      },
      {
        chapterNumber: 16,
        chapterName: "દૈવાસુરસંપદ્વિભાગ યોગ",
        shlokNumber: 4,
        sanskritExcerpt: "दम्भो दर्पोऽभिमानश्च क्रोधः पारुष्यमेव च। अज्ञानं चाभिजातस्य पार्थ सम्पदमासुरीम्॥",
        gujaratiSummary: "દંભ, ઘમંડ, અભિમાન, ક્રોધ, કઠોરતા અને અજ્ઞાન - આ બધા આસુરી સંપત્તિ (દુર્ગુણો) સાથે જન્મેલા મનુષ્યના લક્ષણો છે.",
        lifeLesson: "અહંકાર વ્યક્તિના સદ્ગુણો અને સંબંધો બંનેનો નાશ કરે છે; સદાય વિનમ્ર અને નમ્ર રહો."
      },
      {
        chapterNumber: 18,
        chapterName: "મોક્ષસંન્યાસ યોગ",
        shlokNumber: 58,
        sanskritExcerpt: "मच्चित्तः सर्वदुर्गाणि मत्प्रसादात्तरिष्यसि। अथ चेत्त्वमहङ्कारान्न श्रोष्यसि विनङ्क्ष्यसि॥",
        gujaratiSummary: "મારામાં મન પરોવીશ તો મારી કૃપાથી તું બધા કઠિન સંકટોને પાર કરી જઈશ. પરંતુ જો અહંકારવશ મારું માર્ગદર્શન નહીં સાંભળે તો તારો નાશ થશે.",
        lifeLesson: "હું-પણાનો અહંકાર છોડીને સાચા માર્ગદર્શન અને સદ્વિચારોને સમર્પિત થાઓ."
      }
    ]
  },
  {
    id: "attachment",
    title: "મોહ અને વાસના",
    englishTitle: "Attachment, Desire & Greed",
    icon: Gem,
    color: "#0284c7",
    bgColor: "rgba(2, 132, 199, 0.10)",
    borderColor: "rgba(2, 132, 199, 0.28)",
    essence: "વસ્તુઓ કે વ્યક્તિઓ પ્રત્યે અતિશય આસક્તિ મનુષ્યને બંધનમાં રાખે છે. અનાસક્ત ભાવે જીવવાથી જ સાચો સંતોષ અને પરમ આનંદ મળે છે.",
    shlokas: [
      {
        chapterNumber: 2,
        chapterName: "સાંખ્ય યોગ",
        shlokNumber: 62,
        sanskritExcerpt: "ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते। सङ्गात्सञ्जायते कामः कामात्क्रोधोऽभिजायते॥",
        gujaratiSummary: "સાંસારિક વિષયોનું સતત ચિંતન કરવાથી તેમાં આસક્તિ થાય છે, આસક્તિથી કામના જન્મે છે અને કામના પૂર્ણ ન થતાં ક્રોધ ઉત્પન્ન થાય છે.",
        lifeLesson: "ચીજવસ્તુઓ અને ઈચ્છાઓના દાસ ન બનો; જરૂરિયાત અને લાલસા વચ્ચેનો વિવેક સમજો."
      },
      {
        chapterNumber: 3,
        chapterName: "કર્મ યોગ",
        shlokNumber: 37,
        sanskritExcerpt: "काम एष क्रोध एष रजोगुणसमुद्भवः। महाशनो महापाप्मा विद्ध्येनमिह वैरिणम्॥",
        gujaratiSummary: "રજોગુણમાંથી ઉત્પન્ન થયેલ કામના અને ક્રોધ એ ક્યારેય ન ધરાય તેવા મહાભક્ષક અને મહાપાપી છે; તેને જ આ સંસારમાં સાચો શત્રુ જાણ.",
        lifeLesson: "કામનાઓને સંતોષવાથી તે શાંત થતી નથી, અગ્નિમાં ઘી હોમવા જેવી વધે છે; સંતોષ જ પરમ સુખ છે."
      },
      {
        chapterNumber: 14,
        chapterName: "ગુણત્રયવિભાગ યોગ",
        shlokNumber: 7,
        sanskritExcerpt: "रजो रागात्मकं विद्धि तृष्णासङ्गसमुद्भवम्। तन्निबध्नाति कौन्तेय कर्मसङ्गेन देहिनम्॥",
        gujaratiSummary: "હે અર્જુન! રજોગુણને આસક્તિ અને તૃષ્ણાથી ઉત્પન્ન થયેલો જાણ, તે મનુષ્યને કર્મોના ફળની લાલસામાં બાંધી રાખે છે.",
        lifeLesson: "પરિણામની અતિશય લાલસા છોડીને કર્તવ્યભાવથી કાર્ય કરો, તેનાથી મન મુક્ત અને પ્રસન્ન રહેશે."
      }
    ]
  },
  {
    id: "devotion",
    title: "શંકા અને શ્રદ્ધાનો અભાવ",
    englishTitle: "Doubt & Lack of Faith",
    icon: Sunrise,
    color: "#0891b2",
    bgColor: "rgba(8, 145, 178, 0.10)",
    borderColor: "rgba(8, 145, 178, 0.28)",
    essence: "સંશય મનુષ્યની ક્ષમતાઓ અને શાંતિને કોરી ખાય છે. ઈશ્વર અને પોતાના સત્કર્મ પર અતૂટ શ્રદ્ધા જ જીવનની નૌકા પાર ઉતારે છે.",
    shlokas: [
      {
        chapterNumber: 4,
        chapterName: "જ્ઞાનકર્મસંન્યાસ યોગ",
        shlokNumber: 40,
        sanskritExcerpt: "अज्ञश्चाश्रद्दधानश्च संशयात्मा विनश्यति। नायं लोकोऽस्ति न परो न सुखं संशयात्मनः॥",
        gujaratiSummary: "અજ્ઞાની, શ્રદ્ધારહિત અને સંશયગ્રસ્ત મનુષ્યનો નાશ થાય છે. સંશયી મનુષ્યને ન આ લોકમાં સુખ છે, ન પરલોકમાં કે ન શાંતિ મળે છે.",
        lifeLesson: "સતત નકારાત્મક શંકા કરવાને બદલે સકારાત્મક શ્રદ્ધા કેળવો; વિશ્વાસ જ સફળતા અને શાંતિનું મૂળ છે."
      },
      {
        chapterNumber: 9,
        chapterName: "રાજવિદ્યારાજગુહ્ય યોગ",
        shlokNumber: 22,
        sanskritExcerpt: "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते। तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥",
        gujaratiSummary: "જે અનન્ય ભાવથી કેવળ મારું ચિંતન કરતા નિષ્કામ ઉપાસના કરે છે, તે નિત્યયુક્ત ભક્તોનું યોગક્ષેમ (સંરક્ષણ અને પોષણ) હું પોતે વહન કરું છું.",
        lifeLesson: "જ્યારે નિષ્ઠાપૂર્વક ઈશ્વર પર ભરોસો મૂકો છો, ત્યારે ઈશ્વર અદ્રશ્ય રીતે તમારું ધ્યાન રાખે છે."
      },
      {
        chapterNumber: 18,
        chapterName: "મોક્ષસંન્યાસ યોગ",
        shlokNumber: 66,
        sanskritExcerpt: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
        gujaratiSummary: "બધા ધર્મો અને ઉપાધિઓનો ત્યાગ કરીને કેવળ મારી શરણમાં આવી જા. હું તને બધા પાપોમાંથી મુક્ત કરીશ, તું શોક ન કર.",
        lifeLesson: "સર્વશક્તિમાન પરમાત્માને સર્વસ્વ સોંપી દો; પૂર્ણ શરણાગતિ એ જ અંતિમ નિર્ભયતા છે."
      }
    ]
  },
  {
    id: "relationship",
    title: "સંબંધોમાં તણાવ અને ક્ષમા",
    englishTitle: "Relationship Conflicts & Forgiveness",
    icon: Users,
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.10)",
    borderColor: "rgba(59, 130, 246, 0.28)",
    essence: "સામેવાળામાં પણ પરમાત્માનો અંશ છે તે સમજીને ક્ષમા અને સહાનુભૂતિ કેળવો. મધુર વાણી સંબંધોનું અમૃત છે.",
    shlokas: [
      {
        chapterNumber: 6,
        chapterName: "આત્મસંયમ યોગ",
        shlokNumber: 32,
        sanskritExcerpt: "आत्मौपम्येन सर्वत्र समं पश्यति योऽर्जुन। सुखं वा यदि वा दुःखं स योगी परमो मतः॥",
        gujaratiSummary: "જે પોતાના આત્માની સમાન જ સર્વ પ્રાણીઓના સુખ અને દુઃખને સમાન દ્રષ્ટિએ જુએ છે, તે સર્વશ્રેષ્ઠ યોગી ગણાય છે.",
        lifeLesson: "બીજાને દોષ દેતા પહેલા પોતાને તેના સ્થાને મૂકીને જુઓ; પરસ્પર સહાનુભૂતિ સંબંધો સુધારે છે."
      },
      {
        chapterNumber: 12,
        chapterName: "ભક્તિ યોગ",
        shlokNumber: 13,
        sanskritExcerpt: "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च। निर्ममो निरहङ्कारः समदुःखसुखः क्षमी॥",
        gujaratiSummary: "જે કોઈ પ્રાણી પ્રત્યે દ્વેષ રાખતો નથી, બધાનો મિત્ર અને દયાળુ છે, મમતા-અહંકાર મુક્ત, સુખ-દુઃખમાં સમાન અને ક્ષમાવાન છે તે પ્રભુને અતિ પ્રિય છે.",
        lifeLesson: "મનમાં વેર કે કડવાશ રાખવાથી પોતાનું જ નુકસાન થાય છે; ક્ષમા આપીને મનને હળવું કરો."
      },
      {
        chapterNumber: 17,
        chapterName: "શ્રદ્ધાત્રયવિભાગ યોગ",
        shlokNumber: 15,
        sanskritExcerpt: "अनुद्वेगकरं वाक्यं सत्यं प्रियहितं च यत्। स्वाध्यायाभ्यसनं चैव वाङ्मयं तप उच्यते॥",
        gujaratiSummary: "જે વાણી કોઈને ઉદ્વેગ કે ક્ષોભ ન પહોંચાડે, સત્ય, પ્રિય અને હિતકારી હોય તેમજ સ્વાધ્યાય કરવો - તે વાણીનું સાચું તપ છે.",
        lifeLesson: "શબ્દો ઘા પણ કરી શકે છે અને મલમ પણ બની શકે છે; સદાય હિતકારી અને મધુર વાણી બોલો."
      }
    ]
  }
];

function LifeGuidance() {
  const navigate = useNavigate();
  const [selectedTopicId, setSelectedTopicId] = useState(GUIDANCE_TOPICS[0].id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const currentTopic =
    GUIDANCE_TOPICS.find((t) => t.id === selectedTopicId) || GUIDANCE_TOPICS[0];

  const handleReadFullShlok = (chapterNumber, shlokNumber) => {
    navigate(`/chapter/${chapterNumber}?shloka=${shlokNumber}`);
  };

  return (
    <main className="guidance-page">
      {/* PAGE HEADER */}
      <header className="guidance-header-banner">
        <h1>
          જીવનની મૂંઝવણ અને <span className="highlight-text">ગીતા ઉકેલ</span>
        </h1>

        <p className="guidance-intro">
          તમારી વર્તમાન મનોસ્થિતિ કે પડકાર પસંદ કરો અને ભગવાન શ્રીકૃષ્ણના અમૃતમય શબ્દોમાંથી પ્રેરણા, સાચો નિર્ણય અને આંતરિક શાંતિ પ્રાપ્ત કરો.
        </p>

        {/* TOPIC SELECTOR GRID (HORIZONTAL SCROLL ON MOBILE) */}
        <div className="guidance-topics-scroll-wrapper">
          <div className="guidance-topics-grid">
            {GUIDANCE_TOPICS.map((topic) => {
              const IconComponent = topic.icon;
              const isSelected = topic.id === selectedTopicId;

              return (
                <button
                  key={topic.id}
                  type="button"
                  className={`topic-pill-btn ${isSelected ? "active" : ""}`}
                  onClick={() => setSelectedTopicId(topic.id)}
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
                    <strong>{topic.title}</strong>
                    <small>{topic.englishTitle}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* CONTENT WRAPPER */}
      <section className="guidance-content-container">
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
            <span className="essence-tag" style={{ color: currentTopic.color }}>
              શ્રીકૃષ્ણનો મુખ્ય ઉપદેશ • {currentTopic.title}
            </span>
            <h3>{currentTopic.essence}</h3>
          </div>
        </div>

        {/* SHLOKAS SECTION */}
        <div className="guidance-shlokas-grid">
          {currentTopic.shlokas.map((shlok, index) => (
            <article
              className="guidance-card"
              key={`${currentTopic.id}-${index}`}
            >
              {/* CARD TOP META */}
              <div className="card-header-meta">
                <span className="card-ref-badge">
                  અધ્યાય {shlok.chapterNumber} • શ્લોક {shlok.shlokNumber}
                </span>
                <span className="card-chapter-title">{shlok.chapterName}</span>
              </div>

              {/* SANSKRIT VERSE */}
              <div className="card-sanskrit-block">
                <p className="sanskrit-text">"{shlok.sanskritExcerpt}"</p>
              </div>

              {/* GUJARATI TRANSLATION */}
              <div className="card-meaning-block">
                <h4>
                  <BookOpen size={16} /> સરળ ગુજરાતી અર્થ
                </h4>
                <p>{shlok.gujaratiSummary}</p>
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
                  💡 વ્યવહારિક જીવનમાં ઉપયોગ:
                </span>
                <p>{shlok.lifeLesson}</p>
              </div>

              {/* ACTION BUTTON */}
              <button
                type="button"
                className="card-navigate-btn"
                onClick={() =>
                  handleReadFullShlok(shlok.chapterNumber, shlok.shlokNumber)
                }
              >
                <span>સંપૂર્ણ શ્લોક વાંચો</span>
                <ChevronRight size={18} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default LifeGuidance;

