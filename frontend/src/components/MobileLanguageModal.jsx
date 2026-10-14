import React, { useState, useEffect } from "react";
import { Check, ChevronRight, Sparkles, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { isRunningInStandaloneApp } from "../utils/pwaManager.js";
import "./MobileLanguageModal.css";

const LANGUAGE_OPTIONS = [
  {
    id: "gu",
    name: "ગુજરાતી",
    englishLabel: "Gujarati",
    tagline: "શ્રીમદ્ ભગવદ્ ગીતા શ્લોક, અનુવાદ અને જીવન માર્ગદર્શન",
    badge: "ગુ",
    color: "#eab308",
  },
  {
    id: "hi",
    name: "हिन्दी",
    englishLabel: "Hindi",
    tagline: "श्रीमद्भगवद्गीता श्लोक, हिन्दी अनुवाद और जीवन प्रेरणा",
    badge: "हिं",
    color: "#3b82f6",
  },
  {
    id: "en",
    name: "English",
    englishLabel: "English",
    tagline: "Srimad Bhagavad Gita Verses, English Meaning & Wisdom",
    badge: "EN",
    color: "#10b981",
  },
];

export default function MobileLanguageModal() {
  const { language, setLanguage, txt } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language || "gu");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkEligibility = () => {
      const isStandalone = isRunningInStandaloneApp();
      const isMobile =
        window.innerWidth <= 768 ||
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isStandalone) {
        // INSTALLED APP (PWA):
        // Only ask the first time when installed and opened!
        // Once selected, saved permanently in localStorage and never asks again.
        const appLangChosen =
          localStorage.getItem("gita_app_lang_selected") === "true";
        return !appLangChosen;
      } else {
        // MOBILE WEB:
        // Ask whenever the user opens the web (every new browser session / visit)
        // Only in mobile view.
        if (!isMobile) return false;
        const sessionLangChosen =
          sessionStorage.getItem("gita_web_lang_selected") === "true";
        return !sessionLangChosen;
      }
    };

    if (checkEligibility()) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync selectedLang with current language when modal opens
  useEffect(() => {
    if (showModal && language) {
      setSelectedLang(language);
    }
  }, [showModal, language]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (showModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showModal]);

  const handleSelectOption = (langId) => {
    setSelectedLang(langId);
    // Real-time language switch so background preview updates
    setLanguage(langId);
  };

  const handleConfirm = () => {
    setLanguage(selectedLang);
    const isStandalone = isRunningInStandaloneApp();

    if (isStandalone) {
      // PWA: Save permanently so it never asks on subsequent app launches
      localStorage.setItem("gita_app_lang_selected", "true");
    } else {
      // Mobile Web: Save for this session so it doesn't interrupt while browsing,
      // but will politely prompt on the next new web session
      sessionStorage.setItem("gita_web_lang_selected", "true");
    }

    try {
      window.dispatchEvent(
        new CustomEvent("gita-language-selected", { detail: { language: selectedLang } })
      );
    } catch (e) {}

    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 280);
  };

  if (!showModal) return null;

  return (
    <div
      className={`mobile-lang-overlay ${isClosing ? "fade-out" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-lang-title"
    >
      <div className={`mobile-lang-card ${isClosing ? "slide-down" : ""}`}>
        {/* Glow backdrop decoration */}
        <div className="mobile-lang-glow" />

        {/* Header with Sacred Om & Sparkles */}
        <div className="mobile-lang-header">
          <div className="mobile-lang-om-circle">
            <span className="mobile-lang-om">ॐ</span>
            <Sparkles className="mobile-lang-sparkle" size={16} />
          </div>

          <h2 id="mobile-lang-title" className="mobile-lang-title">
            {selectedLang === "en"
              ? "Choose Your Language"
              : selectedLang === "hi"
              ? "अपनी भाषा चुनें"
              : "તમારી ભાષા પસંદ કરો"}
          </h2>

          <p className="mobile-lang-subtitle">
            {selectedLang === "en"
              ? "Select your preferred language to read the holy Bhagavad Gita"
              : selectedLang === "hi"
              ? "श्रीमद्भगवद्गीता का अध्ययन करने के लिए अपनी पसंदीदा भाषा चुनें"
              : "શ્રીમદ્ ભગવદ્ ગીતા વાંચવા માટે તમારી અનુકૂળ ભાષા પસંદ કરો"}
          </p>
        </div>

        {/* 3 Language Options */}
        <div className="mobile-lang-list">
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = selectedLang === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`mobile-lang-item ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectOption(opt.id)}
              >
                <div
                  className="mobile-lang-badge"
                  style={{ "--badge-color": opt.color }}
                >
                  {opt.badge}
                </div>

                <div className="mobile-lang-info">
                  <div className="mobile-lang-names">
                    <span className="mobile-lang-name">{opt.name}</span>
                    <span className="mobile-lang-eng-label">
                      ({opt.englishLabel})
                    </span>
                  </div>
                  <span className="mobile-lang-tagline">{opt.tagline}</span>
                </div>

                <div
                  className={`mobile-lang-radio ${
                    isSelected ? "radio-checked" : ""
                  }`}
                >
                  {isSelected && <Check size={14} className="radio-check-icon" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Proceed Action Button */}
        <div className="mobile-lang-action">
          <button
            type="button"
            className="mobile-lang-submit-btn"
            onClick={handleConfirm}
          >
            <span className="mobile-lang-submit-text">
              {selectedLang === "gu" && "ગુજરાતીમાં આગળ વધો"}
              {selectedLang === "hi" && "हिन्दी में आगे बढ़ें"}
              {selectedLang === "en" && "Continue in English"}
            </span>
            <ChevronRight size={18} className="mobile-lang-arrow" />
          </button>

          <p className="mobile-lang-footer-hint">
            <Globe size={13} className="footer-hint-icon" />
            <span>
              {txt(
                "આ ભાષા તમે પછીથી પણ ૩-ડોટ મેનૂમાંથી બદલી શકો છો.",
                "यह भाषा आप बाद में भी 3-डॉट मेनू से बदल सकते हैं।",
                "You can change this language anytime from the 3-dot menu."
              )}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
