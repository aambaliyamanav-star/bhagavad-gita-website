import React, { useState, useEffect } from "react";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { isRunningInStandaloneApp } from "../utils/pwaManager.js";
import "./MobileLanguageModal.css";

const LANGUAGE_OPTIONS = [
  {
    id: "gu",
    name: "ગુજરાતી",
    badge: "ગુ",
    color: "#eab308",
  },
  {
    id: "hi",
    name: "हिन्दी",
    badge: "हिं",
    color: "#3b82f6",
  },
  {
    id: "en",
    name: "English",
    badge: "EN",
    color: "#10b981",
  },
];

export default function MobileLanguageModal() {
  const { language, setLanguage } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language || "gu");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkEligibility = () => {
      const isStandalone = isRunningInStandaloneApp();

      if (isStandalone) {
        // INSTALLED APP (PWA):
        // Only ask the first time when installed and opened!
        // Once selected, saved permanently in localStorage and never asks again.
        const appLangChosen =
          localStorage.getItem("gita_app_lang_selected") === "true";
        return !appLangChosen;
      } else {
        // WEB (DESKTOP, TABLET, MOBILE):
        // Prompts when the user opens the web until chosen for that session
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
    } else {
      // Language already chosen previously - immediately signal next step
      const timer = setTimeout(() => {
        try {
          window.dispatchEvent(
            new CustomEvent("gita-language-selected", {
              detail: { language: language || "gu", alreadySet: true },
            })
          );
        } catch (e) {}
      }, 250);
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

    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      try {
        window.dispatchEvent(
          new CustomEvent("gita-language-selected", {
            detail: { language: selectedLang },
          })
        );
      } catch (e) {}
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
        </div>

        {/* 3 Language Options - Only Names */}
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
                  <span className="mobile-lang-name">{opt.name}</span>
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
        </div>
      </div>
    </div>
  );
}
