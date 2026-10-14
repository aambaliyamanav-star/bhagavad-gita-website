import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getEnglishSpeaker,
  getHindiSpeaker,
  getEnglishTranslationFallback,
  getEnglishMessageFallback,
  getEnglishWordMeaning,
} from "../utils/englishGitaHelper.js";

// =====================================================
// CHAPTER NAMES (GUJARATI, HINDI & ENGLISH)
// =====================================================

export const CHAPTER_NAMES = {
  1: { gu: "અર્જુનવિષાદયોગ", hi: "अर्जुनविषादयोग", en: "Arjuna Vishada Yoga", name: "અર્જુનવિષાદયોગ", nameHi: "अर्जुनविषादयोग", nameEn: "Arjuna Vishada Yoga" },
  2: { gu: "સાંખ્યયોગ", hi: "सांख्ययोग", en: "Sankhya Yoga", name: "સાંખ્યયોગ", nameHi: "सांख्ययोग", nameEn: "Sankhya Yoga" },
  3: { gu: "કર્મયોગ", hi: "कर्मयोग", en: "Karma Yoga", name: "કર્મયોગ", nameHi: "कर्मयोग", nameEn: "Karma Yoga" },
  4: { gu: "જ્ઞાનકર્મસંન્યાસયોગ", hi: "ज्ञानकर्मसंन्यासयोग", en: "Jnana Karma Sanyasa Yoga", name: "જ્ઞાનકર્મસંન્યાસયોગ", nameHi: "ज्ञानकर्मसंन्यासयोग", nameEn: "Jnana Karma Sanyasa Yoga" },
  5: { gu: "કર્મસંન્યાસયોગ", hi: "कर्मसंन्यासयोग", en: "Karma Sanyasa Yoga", name: "કર્મસંન્યાસયોગ", nameHi: "कर्मसंन्यासयोग", nameEn: "Karma Sanyasa Yoga" },
  6: { gu: "આત્મસંયમયોગ", hi: "आत्मसंयमयोग", en: "Atma Samyama Yoga", name: "આત્મસંયમયોગ", nameHi: "आत्मसंयमयोग", nameEn: "Atma Samyama Yoga" },
  7: { gu: "જ્ઞાનવિજ્ઞાનયોગ", hi: "ज्ञानविज्ञानयोग", en: "Jnana Vijnana Yoga", name: "જ્ઞાનવિજ્ઞાનયોગ", nameHi: "ज्ञानविज्ञानयोग", nameEn: "Jnana Vijnana Yoga" },
  8: { gu: "અક્ષરબ્રહ્મયોગ", hi: "अक्षरब्रह्मयोग", en: "Akshara Brahma Yoga", name: "અક્ષરબ્રહ્મયોગ", nameHi: "अक्षरब्रह्मयोग", nameEn: "Akshara Brahma Yoga" },
  9: { gu: "રાજવિદ્યારાજગુહ્યયોગ", hi: "राजविद्याराजगुह्ययोग", en: "Raja Vidya Raja Guhya Yoga", name: "રાજવિદ્યારાજગુહ્યયોગ", nameHi: "राजविद्याराजगुह्ययोग", nameEn: "Raja Vidya Raja Guhya Yoga" },
  10: { gu: "વિભૂતિયોગ", hi: "विभूतियोग", en: "Vibhuti Yoga", name: "વિભૂતિયોગ", nameHi: "विभूतियोग", nameEn: "Vibhuti Yoga" },
  11: { gu: "વિશ્વરૂપદર્શનયોગ", hi: "विश्वरूपदर्शनयोग", en: "Vishwarupa Darshana Yoga", name: "વિશ્વરૂપદર્શનયોગ", nameHi: "विश्वरूपदर्शनयोग", nameEn: "Vishwarupa Darshana Yoga" },
  12: { gu: "ભક્તિયોગ", hi: "भक्तियोग", en: "Bhakti Yoga", name: "ભક્તિયોગ", nameHi: "भक्तियोग", nameEn: "Bhakti Yoga" },
  13: { gu: "ક્ષેત્ર-ક્ષેત્રજ્ઞવિભાગયોગ", hi: "क्षेत्र-क्षेत्रज्ञविभागयोग", en: "Kshetra Kshetrajna Vibhaga Yoga", name: "ક્ષેત્ર-ક્ષેત્રજ્ઞવિભાગયોગ", nameHi: "क्षेत्र-क्षेत्रज्ञविभागयोग", nameEn: "Kshetra Kshetrajna Vibhaga Yoga" },
  14: { gu: "ગુણત્રયવિભાગયોગ", hi: "गुणत्रयविभागयोग", en: "Gunatraya Vibhaga Yoga", name: "ગુણત્રયવિભાગયોગ", nameHi: "गुणत्रयविभागयोग", nameEn: "Gunatraya Vibhaga Yoga" },
  15: { gu: "પુરુષોત્તમયોગ", hi: "पुरुषोत्तमयोग", en: "Purushottama Yoga", name: "પુરુષોત્તમયોગ", nameHi: "पुरुषोत्तमयोग", nameEn: "Purushottama Yoga" },
  16: { gu: "દૈવાસુરસમ્પદ્વિભાગયોગ", hi: "दैवासुरसम्पद्विभागयोग", en: "Daivasura Sampad Vibhaga Yoga", name: "દૈવાસુરસમ્પદ્વિભાગયોગ", nameHi: "दैवासुरसम्पद्विभागयोग", nameEn: "Daivasura Sampad Vibhaga Yoga" },
  17: { gu: "શ્રદ્ધાત્રયવિભાગયોગ", hi: "श्रद्धात्रयविभागयोग", en: "Shraddhatraya Vibhaga Yoga", name: "શ્રદ્ધાત્રયવિભાગયોગ", nameHi: "श्रद्धात्रयविभागयोग", nameEn: "Shraddhatraya Vibhaga Yoga" },
  18: { gu: "મોક્ષસંન્યાસયોગ", hi: "मोक्षसंन्यासयोग", en: "Moksha Sanyasa Yoga", name: "મોક્ષસંન્યાસયોગ", nameHi: "मोक्षसंन्यासयोग", nameEn: "Moksha Sanyasa Yoga" },
};

// =====================================================
// UI TRANSLATION DICTIONARY (GUJARATI, HINDI & ENGLISH)
// =====================================================

export const UI_DICTIONARY = {
  // Navigation
  nav_home: { gu: "મુખ્ય પેજ", hi: "मुख्य पृष्ठ", en: "Home" },
  nav_chapters: { gu: "અધ્યાયો", hi: "अध्याय", en: "Chapters" },
  nav_today_shlok: { gu: "આજનો શ્લોક", hi: "आज का श्लोक", en: "Today's Shloka" },
  nav_ai: { gu: "ગીતા AI", hi: "गीता AI", en: "Gita AI" },
  nav_quiz: { gu: "ક્વિઝ", hi: "क्विज़", en: "Quiz" },
  nav_favorites: { gu: "મનપસંદ શ્લોક", hi: "पसंदीदा श्लोक", en: "Favorite Shlokas" },
  nav_about: { gu: "અમારા વિશે", hi: "हमारे बारे में", en: "About Us" },
  nav_admin: { gu: "એડમિન પેનલ", hi: "एडमिन पैनल", en: "Admin Panel" },
  nav_login: { gu: "લોગિન", hi: "लॉगिन", en: "Login" },
  nav_profile: { gu: "પ્રોફાઇલ", hi: "प्रोफ़ाइल", en: "Profile" },
  nav_install_app: { gu: "એપ ઇન્સ્ટોલ કરો", hi: "ऐप इंस्टॉल करें", en: "Install App" },
  nav_logout: { gu: "લોગ આઉટ", hi: "लॉग आउट", en: "Logout" },

  // Shlok & Reader
  shlok_label: { gu: "શ્લોક", hi: "श्लोक", en: "Shloka" },
  chapter_label: { gu: "અધ્યાય", hi: "अध्याय", en: "Chapter" },
  word_meanings_tab: { gu: "શબ્દાર્થ", hi: "शब्दार्थ", en: "Word Meanings" },
  translation_tab: { gu: "અનુવાદ", hi: "अनुवाद", en: "Translation" },
  message_tab: { gu: "ગીતા સંદેશ", hi: "गीता संदेश", en: "Gita Message" },
  play_audio: { gu: "ઓડિયો સાંભળો", hi: "ऑडियो सुनें", en: "Play Audio" },
  stop_audio: { gu: "ઓડિયો બંધ કરો", hi: "ऑडियो रोकें", en: "Stop Audio" },
  share_shlok: { gu: "શ્લોક શેર કરો", hi: "श्लोक शेयर करें", en: "Share Shloka" },
  favorite_add: { gu: "મનપસંદમાં ઉમેરો", hi: "पसंदीदा में जोड़ें", en: "Add to Favorites" },
  favorite_remove: { gu: "મનપસંદમાંથી હટાવો", hi: "पसंदीदा से हटाएं", en: "Remove from Favorites" },
  copied: { gu: "કોપી થઈ ગયું!", hi: "कॉपी हो गया!", en: "Copied!" },
  copy_text: { gu: "કોપી કરો", hi: "कॉपी करें", en: "Copy" },
  next_shlok: { gu: "આગળનો શ્લોક", hi: "अगला श्लोक", en: "Next Shloka" },
  prev_shlok: { gu: "પાછળનો શ્લોક", hi: "पिछला श्लोक", en: "Previous Shloka" },
  today_special: { gu: "આજનો વિશેષ શ્લોક", hi: "आज का विशेष श्लोक", en: "Today's Special Shloka" },
  daily_wisdom: { gu: "દૈનિક પ્રેરણા", hi: "दैनिक प्रेरणा", en: "Daily Wisdom" },

  // Common Buttons & Labels
  read_full: { gu: "સંપૂર્ણ વાંચો", hi: "पूरा पढ़ें", en: "Read Full" },
  explore: { gu: "અધ્યાયો જુઓ", hi: "अध्याय देखें", en: "Explore Chapters" },
  close: { gu: "બંધ કરો", hi: "बंद करें", en: "Close" },
  save: { gu: "સાચવો", hi: "सहेजें", en: "Save" },
  cancel: { gu: "રદ કરો", hi: "रद्द करें", en: "Cancel" },
  loading: { gu: "લોડ થઈ રહ્યું છે...", hi: "लोड हो रहा है...", en: "Loading..." },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem("gita_language");
      return saved === "hi" || saved === "en" ? saved : "gu";
    } catch (e) {
      return "gu";
    }
  });

  const setLanguage = (lang) => {
    const validLang = lang === "hi" ? "hi" : lang === "en" ? "en" : "gu";
    setLanguageState(validLang);
    try {
      localStorage.setItem("gita_language", validLang);
      document.documentElement.lang = validLang;
    } catch (e) {}
  };

  // Cycles: Gujarati -> Hindi -> English -> Gujarati
  const toggleLanguage = () => {
    if (language === "gu") {
      setLanguage("hi");
    } else if (language === "hi") {
      setLanguage("en");
    } else {
      setLanguage("gu");
    }
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch (e) {}
  }, [language]);

  // Translate helper function via dictionary key
  const t = (key) => {
    if (!UI_DICTIONARY[key]) return key;
    return UI_DICTIONARY[key][language] || UI_DICTIONARY[key]["gu"] || key;
  };

  // Universal text helper: txt(guText, hiText, enText)
  const txt = (guText, hiText, enText) => {
    if (language === "en") return enText !== undefined ? enText : guText;
    if (language === "hi") return hiText !== undefined ? hiText : guText;
    return guText;
  };

  // Helper to extract localized shlok fields while ensuring Sanskrit is 100% untouched
  const getLocalizedShlok = (shlok) => {
    if (!shlok) return null;
    const isHi = language === "hi";
    const isEn = language === "en";

    return {
      ...shlok,
      // SANSKRIT ALWAYS STAYS IN PURE SANSKRIT
      sanskrit: shlok.sanskrit,

      // Localized fields
      chapterName:
        (isEn && (shlok.chapterNameEn || CHAPTER_NAMES[shlok.chapterNumber]?.en)) ||
        (isHi && (shlok.chapterNameHi || CHAPTER_NAMES[shlok.chapterNumber]?.hi)) ||
        shlok.chapterName,

      speaker:
        (isEn && (shlok.speakerEn || getEnglishSpeaker(shlok.speaker))) ||
        (isHi && (shlok.speakerHi || getHindiSpeaker(shlok.speaker))) ||
        shlok.speaker,

      translation:
        (isEn && (shlok.translationEn || getEnglishTranslationFallback(shlok))) ||
        (isHi && (shlok.translationHi || shlok.translation)) ||
        shlok.translation,

      message:
        (isEn && (shlok.messageEn || getEnglishMessageFallback(shlok))) ||
        (isHi && (shlok.messageHi || shlok.message)) ||
        shlok.message,

      // Word meanings: Sanskrit 'word' stays untouched, 'meaning' switches to English/Hindi if available
      wordMeanings: (shlok.wordMeanings || []).map((w) => ({
        ...w,
        word: w.word, // Sanskrit stays untouched
        meaning:
          (isEn && (w.meaningEn || getEnglishWordMeaning(w.word, w.meaning))) ||
          (isHi && (w.meaningHi || w.meaning)) ||
          w.meaning,
      })),
    };
  };

  // Helper for chapter names
  const getChapterName = (chapterNumber, defaultName = "") => {
    if (CHAPTER_NAMES[chapterNumber]) {
      return CHAPTER_NAMES[chapterNumber][language] || defaultName;
    }
    return defaultName;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        txt,
        getLocalizedShlok,
        getChapterName,
        CHAPTER_NAMES,
        isGujarati: language === "gu",
        isHindi: language === "hi",
        isEnglish: language === "en",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
