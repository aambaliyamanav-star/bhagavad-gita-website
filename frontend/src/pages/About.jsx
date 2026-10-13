import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Brain,
  Compass,
  Trophy,
  Flame,
  Sparkles,
  Heart,
  Clock,
  Sun,
  Star,
  ShieldCheck,
  Flower2,
  CheckCircle2,
  Award,
  HelpCircle,
  X,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./About.css";

const FEATURES_DATA = [
  {
    id: "chapters",
    num: "01",
    category: "વાંચન & અધ્યયન",
    categoryHi: "पठन एवं अध्ययन",
    icon: BookOpen,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "સંપૂર્ણ જ્ઞાન",
    badgeHi: "सम्पूर्ण ज्ञान",
    title: "18 અધ્યાય અને 700 શ્લોક વાચન",
    titleHi: "18 अध्याय और 700 श्लोक पठन",
    description:
      "મૂળ સંસ્કૃત શ્લોકો, સચોટ અન્વય, શબ્દાર્થ, સરળ ગુજરાતી ભાવાર્થ અને તાત્પર્ય સાથે ઊંડાણપૂર્વક અભ્યાસ. વક્તા ઓળખ (શ્રીભગવાનુવાચ, અર્જુન ઉવાચ વગેરે) અને શ્લોક નેવિગેશન સુવિધા.",
    descriptionHi:
      "मूल संस्कृत श्लोक, सटीक अन्वय, शब्दार्थ, सरल हिंदी भावार्थ और तात्पर्य के साथ गहन अध्ययन। वक्ता परिचय (श्रीभगवानुवाच, अर्जुन उवाच आदि) और श्लोक नेविगेशन सुविधा।",
    highlights: [
      "18 અધ્યાયોનું વ્યવસ્થિત વર્ગીકરણ",
      "સંસ્કૃત અન્વય અને શબ્દાર્થ સાથે શુદ્ધ અર્થ",
      "સરળ અને મધુર ગુજરાતી ભાવાર્થ",
      "શ્લોક નંબર અને અધ્યાય દ્વારા ત્વરિત નેવિગેશન",
    ],
    highlightsHi: [
      "18 अध्यायों का सुव्यवस्थित वर्गीकरण",
      "संस्कृत अन्वय और शब्दार्थ सहित शुद्ध अर्थ",
      "सरल और मधुर हिंदी भावार्थ",
      "श्लोक संख्या और अध्याय द्वारा त्वरित नेविगेशन",
    ],
    link: "/chapters",
    linkText: "18 અધ્યાય વાંચો",
    linkTextHi: "18 अध्याय पढ़ें",
  },
  {
    id: "ai",
    num: "02",
    category: "આધુનિક AI",
    categoryHi: "आधुनिक AI",
    icon: Brain,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "Gemini AI",
    badgeHi: "Gemini AI",
    title: "ગીતા AI આધ્યાત્મિક સહાયક",
    titleHi: "गीता AI आध्यात्मिक सहायक",
    description:
      "અત્યાધુનિક AI ટેકનોલોજી દ્વારા તમારા અંગત પ્રશ્નો, માનસિક મૂંઝવણો કે ધર્મ સંકટનું ભગવદ્ ગીતાના શ્લોકો અને શ્રીકૃષ્ણના ઉપદેશો આધારે તુરંત સચોટ સમાધાન.",
    descriptionHi:
      "अत्याधुनिक AI तकनीक द्वारा आपके व्यक्तिगत प्रश्नों, मानसिक उलझनों अथवा धर्म संकट का भगवद् गीता के श्लोकों और श्रीकृष्ण के उपदेशों के आधार पर तुरंत सटीक समाधान।",
    highlights: [
      "ગીતા આધારિત વ્યક્તિગત આધ્યાત્મિક માર્ગદર્શન",
      "સરળ અને મૈત્રીપૂર્ણ ગુજરાતીમાં વાતચીત",
      "શ્લોક સંદર્ભ સાથે પ્રમાણિત જવાબો",
      "ચેટ હિસ્ટ્રી અને 24/7 સતત ઉપલબ્ધતા",
    ],
    highlightsHi: [
      "गीता आधारित व्यक्तिगत आध्यात्मिक मार्गदर्शन",
      "सरल और मैत्रीपूर्ण हिंदी में वार्तालाप",
      "श्लोक संदर्भ सहित प्रामाणिक उत्तर",
      "चैट हिस्ट्री और 24/7 निरंतर उपलब्धता",
    ],
    actionType: "ai",
    linkText: "ગીતા AI પૂછો",
    linkTextHi: "गीता AI से पूछें",
  },
  {
    id: "guidance",
    num: "03",
    category: "જીવન વ્યવહાર",
    categoryHi: "जीवन व्यवहार",
    icon: Compass,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "કૃષ્ણ વાણી",
    badgeHi: "कृष्ण वाणी",
    title: "જીવન માર્ગદર્શન (Life Guidance)",
    titleHi: "जीवन मार्गदर्शन (Life Guidance)",
    description:
      "આજના આધુનિક જીવનની મુખ્ય સમસ્યાઓ જેવી કે તણાવ, ક્રોધ, સંબંધો, નિર્ણયશક્તિ અને કર્મયોગ માટે ગીતાજીના સર્વોત્તમ શ્લોકોનું વ્યવહારિક સંકલન.",
    descriptionHi:
      "आज के आधुनिक जीवन की प्रमुख समस्याओं जैसे तनाव, क्रोध, संबंध, निर्णय-क्षमता और कर्मयोग के लिए गीता जी के सर्वोत्तम श्लोकों का व्यावहारिक संकलन।",
    highlights: [
      "ચિંતા, ડિપ્રેશન અને તણાવ નિવારણ",
      "ક્રોધ નિયંત્રણ અને માનસિક શાંતિ",
      "કર્મ અને ફરજ અંગે ચોક્કસ સ્પષ્ટતા",
      "સંબંધો અને આંતરિક સ્થિરતા",
    ],
    highlightsHi: [
      "चिंता, अवसाद और तनाव निवारण",
      "क्रोध नियंत्रण और मानसिक शांति",
      "कर्म और कर्तव्य संबंधी स्पष्टता",
      "संबंध और आंतरिक स्थिरता",
    ],
    link: "/guidance",
    linkText: "માર્ગદર્શન મેળવો",
    linkTextHi: "मार्गदर्शन प्राप्त करें",
  },
  {
    id: "quiz",
    num: "04",
    category: "જ્ઞાન કસોટી",
    categoryHi: "ज्ञान परीक्षा",
    icon: HelpCircle,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "MCQ કસોટી",
    badgeHi: "MCQ परीक्षा",
    title: "ઇન્ટરેક્ટિવ ગીતા ક્વિઝ",
    titleHi: "इंटरैक्टिव गीता क्विज़",
    description:
      "અધ્યાય વાઇઝ અને વિવિધ વિષયો પર રસપ્રદ બહુવિકલ્પી (MCQ) પ્રશ્નોત્તરી. રમતા રમતા ગીતાજીના ગહન સિદ્ધાંતો શીખો અને તમારો સ્કોર તપાસો.",
    descriptionHi:
      "अध्यायवार और विविध विषयों पर रोचक बहुविकल्पीय (MCQ) प्रश्नोत्तरी। खेलते-खेलते गीता जी के गहन सिद्धांतों को सीखें और अपना स्कोर जांचें।",
    highlights: [
      "અધ્યાયવાર રસપ્રદ અને જ્ઞાનવર્ધક પ્રશ્નો",
      "લાઈવ ટાઈમર અને તાત્કાલિક સ્કોરિંગ",
      "સાચા ઉત્તરો સાથે વિગતવાર સમજૂતી",
      "તમામ જૂની ક્વિઝની હિસ્ટ્રી ટ્રેકિંગ",
    ],
    highlightsHi: [
      "अध्यायवार रोचक और ज्ञानवर्धक प्रश्न",
      "लाइव टाइमर और त्वरित स्कोरिंग",
      "सही उत्तरों सहित विस्तृत व्याख्या",
      "सभी पुरानी क्विज़ की हिस्ट्री ट्रैकिंग",
    ],
    link: "/quiz-category",
    linkText: "ક્વિઝ રમો",
    linkTextHi: "क्विज़ खेलें",
  },
  {
    id: "achievements",
    num: "05",
    category: "સિદ્ધિઓ",
    categoryHi: "उपलब्धियां",
    icon: Award,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "ડિજિટલ બેજીસ",
    badgeHi: "डिजिटल बैज",
    title: "ક્વિઝ અચીવમેન્ટ્સ અને બેજીસ",
    titleHi: "क्विज़ उपलब्धियां और बैज",
    description:
      "જેમ જેમ તમે ક્વિઝ રમતા જશો અને શ્લોકો શીખતા જશો, તેમ તેમ તમને વિશેષ ડિજિટલ આધ્યાત્મિક સિદ્ધિ બેજીસ અને ટ્રોફીઝ પ્રાપ્ત થશે.",
    descriptionHi:
      "जैसे-जैसे आप क्विज़ खेलते जाएंगे और श्लोक सीखते जाएंगे, वैसे-वैसे आपको विशेष डिजिटल आध्यात्मिक उपलब्धि बैज और ट्रॉफियां प्राप्त होंगी।",
    highlights: [
      "જિજ્ઞાસુ, સાધક, જ્ઞાનરત્ન જેવા વિશિષ્ટ બેજીસ",
      "સ્કોર મલ્ટિપ્લાયર્સ અને માઇલસ્ટોન્સ",
      "અનલૉક કરેલ બેજીસનું સુંદર ડિસ્પ્લે",
      "સતત પ્રગતિ માટે પ્રેરક પ્રોગ્રેસ બાર",
    ],
    highlightsHi: [
      "जिज्ञासु, साधक, ज्ञानरत्न जैसे विशिष्ट बैज",
      "स्कोर मल्टीप्लायर्स और माइलस्टोन्स",
      "अनलॉक किए गए बैज का सुंदर डिस्प्ले",
      "निरंतर प्रगति हेतु प्रेरक प्रोग्रेस बार",
    ],
    link: "/quiz-achievements",
    linkText: "સિદ્ધિઓ જુઓ",
    linkTextHi: "उपलब्धियां देखें",
  },
  {
    id: "tracker",
    num: "06",
    category: "દૈનિક સ્વાધ્યાય",
    categoryHi: "दैनिक स्वाध्याय",
    icon: Flame,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "Daily Streak",
    badgeHi: "Daily Streak",
    title: "વાંચન પ્રગતિ ટ્રેકર અને સ્ટ્રીક્સ",
    titleHi: "पठन प्रगति ट्रैकर और स्ट्रीक्स",
    description:
      "રોજિંદા ગીતા વાચનની ટેવ કેળવો. તમારી દૈનિક Streak (સતત કેટલા દિવસ વાંચ્યું), કેટલા શ્લોકો પૂર્ણ કર્યા અને કેટલા અધ્યાય બાકી છે તેનો લાઈવ આલેખ.",
    descriptionHi:
      "प्रतिदिन गीता पठन की आदत डालें। अपनी दैनिक Streak (लगातार कितने दिन पढ़ा), कितने श्लोक पूर्ण किए और कितने अध्याय शेष हैं इसका सजीव विवरण।",
    highlights: [
      "દૈનિક સ્ટ્રીક કાઉન્ટર (Reading Streak)",
      "કુલ વાંચેલા શ્લોકો અને અધ્યાયની ટકાવારી",
      "દૈનિક વાચન ટાર્ગેટ અને પૂર્ણતા પ્રગતિ",
      "આધ્યાત્મિક શિસ્ત જાળવવામાં મદદરૂપ",
    ],
    highlightsHi: [
      "दैनिक स्ट्रीक काउंटर (Reading Streak)",
      "कुल पढ़े गए श्लोक और अध्याय का प्रतिशत",
      "दैनिक पठन लक्ष्य और पूर्णता प्रगति",
      "आध्यात्मिक अनुशासन बनाए रखने में सहायक",
    ],
    link: "/reading-tracker",
    linkText: "પ્રગતિ તપાસો",
    linkTextHi: "प्रगति जांचें",
  },
  {
    id: "daily-shlok",
    num: "07",
    category: "દૈનિક પ્રેરણા",
    categoryHi: "दैनिक प्रेरणा",
    icon: Sparkles,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "આજનો શ્લોક",
    badgeHi: "आज का श्लोक",
    title: "આજનો શ્લોક & સોશિયલ કાર્ડ શેરિંગ",
    titleHi: "आज का श्लोक एवं सोशल कार्ड शेयरिंग",
    description:
      "રોજ સવારે એક નવો પ્રેરણાદાયક શ્લોક, ગુજરાતી અર્થ અને આજના દિવસ માટેનો સંદેશ. વ્હોટ્સએપ કે સોશિયલ મીડિયા પર શેર કરવા માટે સુંદર HD કાર્ડ બનાવો.",
    descriptionHi:
      "प्रतिदिन प्रातः एक नया प्रेरणादायक श्लोक, हिंदी अर्थ और आज के दिन के लिए संदेश। व्हाट्सएप या सोशल मीडिया पर साझा करने के लिए सुंदर HD कार्ड बनाएं।",
    highlights: [
      "દરરોજ નવો પ્રેરણાદાયક દૈનિક શ્લોક",
      "આજના દિવસ માટે વ્યવહારિક જીવન સંદેશ",
      "સુંદર શ્લોક કાર્ડ ઇમેજ ડાઉનલોડ & શેર",
      "WhatsApp / Social Media એક ક્લિકમાં શેર",
    ],
    highlightsHi: [
      "प्रतिदिन नया प्रेरणादायक दैनिक श्लोक",
      "आज के दिन के लिए व्यावहारिक जीवन संदेश",
      "सुंदर श्लोक कार्ड इमेज डाउनलोड एवं शेयर",
      "WhatsApp / सोशल मीडिया एक क्लिक में शेयर",
    ],
    link: "/",
    linkText: "આજનો શ્લોક જુઓ",
    linkTextHi: "आज का श्लोक देखें",
  },
  {
    id: "favorites",
    num: "08",
    category: "અંગત સંગ્રહ",
    categoryHi: "व्यक्तिगत संग्रह",
    icon: Heart,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "Bookmarks",
    badgeHi: "Bookmarks",
    title: "મનપસંદ શ્લોક (Bookmarks)",
    titleHi: "पसंदीदा श्लोक (Bookmarks)",
    description:
      "જે શ્લોક તમને ખાસ ગમી જાય કે જીવનમાં માર્ગદર્શક લાગે તેને એક જ ક્લિકમાં બુકમાર્ક કરીને તમારા પર્સનલ કલેક્શનમાં સાચવો.",
    descriptionHi:
      "जो श्लोक आपको विशेष रूप से पसंद आए या जीवन में मार्गदर्शक लगे, उसे एक ही क्लिक में बुकमार्क करके अपने व्यक्तिगत संग्रह में सहेजें।",
    highlights: [
      "એક જ ક્લિકમાં શ્લોક બુકમાર્ક કરવાની સુવિધા",
      "ગમે ત્યારે સરળતાથી રિવિઝન કરો",
      "તમારા એકાઉન્ટ સાથે સુરક્ષિત સેવ રહે છે",
      "ઝડપી એક્સેસ માટે પર્સનલ લિસ્ટ",
    ],
    highlightsHi: [
      "एक ही क्लिक में श्लोक बुकमार्क करने की सुविधा",
      "कभी भी सरलता से पुनरावृत्ति करें",
      "आपके खाते में सुरक्षित सहेजा रहता है",
      "त्वरित पहुंच के लिए व्यक्तिगत सूची",
    ],
    link: "/favorites",
    linkText: "મનપસંદ શ્લોક",
    linkTextHi: "पसंदीदा श्लोक देखें",
  },
  {
    id: "history",
    num: "09",
    category: "ઇતિહાસ",
    categoryHi: "इतिहास",
    icon: Clock,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "Cloud Sync",
    badgeHi: "Cloud Sync",
    title: "વાંચન અને ક્વિઝ ઇતિહાસ",
    titleHi: "पठन और क्विज़ इतिहास",
    description:
      "તમે ક્યારે કયો શ્લોક વાંચ્યો અને ભૂતકાળમાં કઈ ક્વિઝ આપી હતી તેનો સંપૂર્ણ કાલક્રમિક ઇતિહાસ. કોઈપણ શ્લોક કે રિઝલ્ટ પર ફરી જવા માટે સીધો શોર્ટકટ.",
    descriptionHi:
      "आपने कब कौन सा श्लोक पढ़ा और अतीत में कौन सी क्विज़ दी थी उसका सम्पूर्ण कालक्रमिक इतिहास। किसी भी श्लोक या परिणाम पर पुनः जाने का सीधा शॉर्टकट।",
    highlights: [
      "વાંચેલા શ્લોકોની તારીખવાર નોંધ",
      "ક્વિઝ આપેલા સ્કોર્સ અને તારીખો",
      "એક ક્લિકમાં તે શ્લોક પર પાછા જવાની સુવિધા",
      "સંપૂર્ણ ક્લાઉડ સિંક્રનાઇઝેશન",
    ],
    highlightsHi: [
      "पढ़े गए श्लोकों का तिथिवार विवरण",
      "क्विज़ दिए गए स्कोर और तिथियां",
      "एक क्लिक में उस श्लोक पर वापस जाने की सुविधा",
      "सम्पूर्ण क्लाउड सिंक्रोनाइज़ेशन",
    ],
    link: "/history",
    linkText: "ઇતિહાસ જુઓ",
    linkTextHi: "इतिहास देखें",
  },
  {
    id: "theme",
    num: "10",
    category: "સુગમ વાચન",
    categoryHi: "सुगम पठन",
    icon: Sun,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "થીમ્સ & ફૉન્ટ",
    badgeHi: "थीम एवं फॉन्ट",
    title: "ડાર્ક & લાઇટ મોડ અને ફૉન્ટ કંટ્રોલ",
    titleHi: "डार्क एवं लाइट मोड और फॉन्ट नियंत्रण",
    description:
      "રાત્રિના સમયે આંખો પર તાણ ન પડે તે માટે રૉયલ ડાર્ક થીમ અને દિવસ માટે ક્લીન લાઇટ થીમ. સાથે ફૉન્ટ સાઈઝ નાના-મોટા કરવાની અનુકૂળતા.",
    descriptionHi:
      "रात्रि के समय आंखों पर तनाव न पड़े इसके लिए रॉयल डार्क थीम और दिन के लिए स्वच्छ लाइट थीम। साथ ही फॉन्ट आकार छोटा-बड़ा करने की सुविधा।",
    highlights: [
      "આંખોને અનુકૂળ ડાર્ક અને લાઇટ થીમ",
      "વાંચન માટે એડજસ્ટેબલ ફૉન્ટ સાઇઝ",
      "મોબાઇલ, ટેબ્લેટ અને ડેસ્કટોપ પર ફુલ રિસ્પોન્સિવ",
      "ઝીરો ડિસ્ટ્રેક્શન વાચન અનુભવ",
    ],
    highlightsHi: [
      "आंखों के अनुकूल डार्क और लाइट थीम",
      "पठन हेतु समायोज्य फॉन्ट आकार",
      "मोबाइल, टैबलेट और डेस्कटॉप पर पूर्णतः रिस्पॉन्सिव",
      "शून्य विचलन पठन अनुभव",
    ],
    link: "/chapters",
    linkText: "વાંચન શરૂ કરો",
    linkTextHi: "पठन शुरू करें",
  },
  {
    id: "feedback",
    num: "11",
    category: "યુઝર સંવાદ",
    categoryHi: "उपयोगकर्ता संवाद",
    icon: Star,
    iconColor: "#1a73e8",
    bgGlow: "rgba(26, 115, 232, 0.12)",
    badge: "૫-સ્ટાર રેટિંગ",
    badgeHi: "5-स्टार रेटिंग",
    title: "પ્રતિસાદ & 5-સ્ટાર રેટિંગ સિસ્ટમ",
    titleHi: "प्रतिक्रिया एवं 5-स्टार रेटिंग प्रणाली",
    description:
      "આ પ્લેટફોર્મ તમને કેવું લાગ્યું તે અંગે તમારો કિંમતી અભિપ્રાય આપો. વપરાશકર્તાઓના ફીડબેકના આધારે અમે સતત નવી સુવિધાઓ ઉમેરીએ છીએ.",
    descriptionHi:
      "यह प्लेटफॉर्म आपको कैसा लगा इस बारे में अपनी बहुमूल्य राय दें। उपयोगकर्ताओं के फीडबैक के आधार पर हम निरंतर नई सुविधाएं जोड़ते हैं।",
    highlights: [
      "સરળ 5-સ્ટાર રેટિંગ આપવાની સુવિધા",
      "સૂચનો અને મંતવ્યો સીધા શેર કરો",
      "નિરંતર સુધારા માટે સીધો સંવાદ",
      "તમારા દરેક સૂચનને સન્માન",
    ],
    highlightsHi: [
      "सरल 5-स्टार रेटिंग देने की सुविधा",
      "सुझाव और विचार सीधे साझा करें",
      "निरंतर सुधार हेतु सीधा संवाद",
      "आपके प्रत्येक सुझाव का सम्मान",
    ],
    actionType: "feedback",
    linkText: "પ્રતિસાદ આપો",
    linkTextHi: "प्रतिक्रिया दें",
  },
];

function About() {
  const { isHindi } = useLanguage();
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedFeature(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock window and body scrolling to guarantee 100% zero-scroll on About page
  useEffect(() => {
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.overflow = origBodyOverflow;
    };
  }, []);

  const openAiAssistant = () => {
    setSelectedFeature(null);
    window.dispatchEvent(new CustomEvent("open-gita-ai-assistant"));
  };

  const openFeedback = () => {
    setSelectedFeature(null);
    window.dispatchEvent(new CustomEvent("open-feedback-modal"));
  };

  return (
    <main className="about-compact-page">
      {/* =====================================================
          BACKGROUND AMBIENT RAYS & CHAKRA (CONTAINED)
      ===================================================== */}
      <div className="about-compact-bg" aria-hidden="true">
        <div className="bg-glow-orb orb-1" />
        <div className="bg-glow-orb orb-2" />
        <div className="bg-chakra spin-slow" />
      </div>

      <div className="about-compact-container">
        {/* =====================================================
            CENTERED TOP BAR: TITLE (CLEAN & COMPACT)
        ===================================================== */}
        <header className="compact-header-centered">
          <div className="compact-title-wrap">
            <Flower2 size={24} className="compact-logo-flower" />
            <h1>
              {isHindi ? "श्रीमद्भगवद्गीता" : "શ્રીમદ્ ભગવદ્ ગીતા"} <span className="title-sep">•</span>{" "}
              <span className="blue-title-text">{isHindi ? "सभी विशेषताएं" : "તમામ વિશેષતાઓ"}</span>
            </h1>
          </div>
        </header>

        {/* =====================================================
            CENTERED GRID: 11 COMPACT FEATURE BUTTONS
        ===================================================== */}
        <section className="compact-grid-wrapper">
          <div className="features-centered-grid">
            {FEATURES_DATA.map((item) => {
              const ItemIcon = item.icon;
              const itemCategory = (isHindi && item.categoryHi) ? item.categoryHi : item.category;
              const itemTitle = (isHindi && item.titleHi) ? item.titleHi : item.title;

              return (
                <button
                  key={item.id}
                  type="button"
                  className="feature-btn-card"
                  onClick={() => setSelectedFeature(item)}
                >
                  <div className="card-top-row">
                    <div className="card-top-left">
                      <span className="card-num-pill">{item.num}</span>
                      <span className="card-category-tag">{itemCategory}</span>
                    </div>
                    <span className="card-hover-hint">
                      <span>{isHindi ? "विस्तार से" : "વિગતવાર"}</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>

                  <div className="card-main-content">
                    <div className="card-icon-box">
                      <ItemIcon size={18} />
                    </div>

                    <div className="card-text-col">
                      <h3 className="card-title">{itemTitle}</h3>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* =====================================================
          CENTERED MODAL POPUP FOR FEATURE DETAILS
      ===================================================== */}
      {selectedFeature && (
        <div
          className="about-modal-backdrop"
          onClick={() => setSelectedFeature(null)}
        >
          <div
            className="about-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-left">
                <span className="modal-category-badge">
                  {(isHindi && selectedFeature.categoryHi) ? selectedFeature.categoryHi : selectedFeature.category}
                </span>
                <span className="modal-num-badge">
                  {selectedFeature.num} / 11 • {(isHindi && selectedFeature.badgeHi) ? selectedFeature.badgeHi : selectedFeature.badge}
                </span>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedFeature(null)}
                aria-label={isHindi ? "बंद करें" : "Close"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Hero Row */}
            <div className="modal-hero-row">
              <div className="modal-icon-box">
                <selectedFeature.icon size={30} />
              </div>

              <div className="modal-hero-text">
                <h2>{(isHindi && selectedFeature.titleHi) ? selectedFeature.titleHi : selectedFeature.title}</h2>
                <p>{(isHindi && selectedFeature.descriptionHi) ? selectedFeature.descriptionHi : selectedFeature.description}</p>
              </div>
            </div>

            {/* Modal Highlights 2x2 Grid */}
            <div className="modal-highlights-grid">
              {((isHindi && selectedFeature.highlightsHi) ? selectedFeature.highlightsHi : selectedFeature.highlights).map((hl, hlIdx) => (
                <div key={hlIdx} className="modal-hl-item">
                  <CheckCircle2
                    size={16}
                    className="modal-hl-check"
                  />
                  <span>{hl}</span>
                </div>
              ))}
            </div>

            {/* Modal Footer Action */}
            <div className="modal-footer">
              <button
                type="button"
                className="modal-secondary-btn"
                onClick={() => setSelectedFeature(null)}
              >
                {isHindi ? "बंद करें" : "બંધ કરો"}
              </button>

              {selectedFeature.link ? (
                <Link
                  to={selectedFeature.link}
                  className="modal-primary-btn"
                  onClick={() => setSelectedFeature(null)}
                >
                  <span>{(isHindi && selectedFeature.linkTextHi) ? selectedFeature.linkTextHi : selectedFeature.linkText}</span>
                  <ArrowRight size={16} />
                </Link>
              ) : selectedFeature.actionType === "ai" ? (
                <button
                  type="button"
                  onClick={openAiAssistant}
                  className="modal-primary-btn"
                >
                  <Brain size={16} />
                  <span>{(isHindi && selectedFeature.linkTextHi) ? selectedFeature.linkTextHi : selectedFeature.linkText}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openFeedback}
                  className="modal-primary-btn"
                >
                  <Star size={16} />
                  <span>{(isHindi && selectedFeature.linkTextHi) ? selectedFeature.linkTextHi : selectedFeature.linkText}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default About;
