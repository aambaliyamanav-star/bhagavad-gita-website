import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Sparkles, Heart, Trophy, LogIn, X, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getValidToken } from "../utils/authHelper.js";
import "./LoginPromptModal.css";

export default function LoginPromptModal() {
  const { user } = useAuth();
  const { txt } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Notify next step in flow (Rating modal)
  const finishStep = () => {
    try {
      window.dispatchEvent(new CustomEvent("gita-login-prompt-done"));
    } catch (e) {}
  };

  useEffect(() => {
    const handleTrigger = () => {
      // 1. If already logged in, do not show!
      const token = getValidToken();
      if (user || token) {
        finishStep();
        return;
      }

      // 2. If user is currently on login / register / forgot-password page, do not show!
      const currentPath = location.pathname;
      if (
        currentPath === "/login" ||
        currentPath === "/register" ||
        currentPath === "/forgot-password"
      ) {
        finishStep();
        return;
      }

      // 3. Check if skipped in this active session
      // (User requirement: prompts every time they open web or app until they log in)
      const sessionSkipped = sessionStorage.getItem("gita_login_prompt_skipped_session") === "true";
      if (sessionSkipped) {
        finishStep();
        return;
      }

      // Show after gentle 350ms delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 350);

      return () => clearTimeout(timer);
    };

    window.addEventListener("gita-notification-prompt-done", handleTrigger);
    return () => {
      window.removeEventListener("gita-notification-prompt-done", handleTrigger);
    };
  }, [user, location.pathname]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    sessionStorage.setItem("gita_login_prompt_skipped_session", "true");
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      finishStep();
    }, 260);
  };

  const handleGoToLogin = () => {
    sessionStorage.setItem("gita_login_prompt_skipped_session", "true");
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      navigate("/login");
      finishStep();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`login-prompt-overlay ${isClosing ? "fade-out" : ""}`}
      role="dialog"
      aria-modal="true"
    >
      <div className={`login-prompt-card ${isClosing ? "slide-down" : ""}`}>
        <button
          type="button"
          className="login-prompt-close-btn"
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Glow */}
        <div className="login-prompt-glow" />

        {/* App Logo */}
        <div className="login-prompt-logo-wrap">
          <img
            src="/app-logo.png"
            alt="Bhagavad Gita Logo"
            className="login-prompt-logo"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* Header */}
        <div className="login-prompt-header">
          <h2 className="login-prompt-title">
            {txt(
              "શ્રીમદ્ ભગવદ્ ગીતામાં આપનું સ્વાગત છે",
              "श्रीमद्भगवद्गीता में आपका स्वागत है",
              "Welcome to Shrimad Bhagavad Gita"
            )}
          </h2>
          <p className="login-prompt-subtitle">
            {txt(
              "આપની આધ્યાત્મિક સાધના અને પ્રગતિ સાચવવા માટે એકાઉન્ટમાં લૉગિન કરો.",
              "अपनी आध्यात्मिक साधना और प्रगति सुरक्षित रखने के लिए खाते में लॉगिन करें।",
              "Log in to preserve your spiritual practice and track your progress."
            )}
          </p>
        </div>

        {/* Benefits list */}
        <div className="login-prompt-features">
          <div className="login-prompt-feature-item">
            <div className="login-prompt-feature-icon icon-blue">
              <BookOpen size={18} />
            </div>
            <div className="login-prompt-feature-text">
              <h4>{txt("વાંચન પ્રગતિ અને ટ્રેકર", "पठन प्रगति और ट्रैकर", "Reading Progress & Tracker")}</h4>
              <p>{txt("કેટલા શ્લોક અને અધ્યાય વાંચ્યા તે આપોઆપ સચવાશે.", "कितने श्लोक और अध्याय पढ़े वह स्वतः सुरक्षित रहेगा।", "Automatically saves your completed shlokas and chapters.")}</p>
            </div>
          </div>

          <div className="login-prompt-feature-item">
            <div className="login-prompt-feature-icon icon-amber">
              <Sparkles size={18} />
            </div>
            <div className="login-prompt-feature-text">
              <h4>{txt("જીવન માર્ગદર્શન", "जीवन मार्गदर्शन", "Divine Life Guidance")}</h4>
              <p>{txt("જીવનના પ્રશ્નોના ગીતામાંથી વ્યક્તિગત માર્ગદર્શન મેળવો.", "जीवन के प्रश्नों का गीता से व्यक्तिगत मार्गदर्शन पाएं।", "Receive personalized Gita answers for life questions.")}</p>
            </div>
          </div>

          <div className="login-prompt-feature-item">
            <div className="login-prompt-feature-icon icon-rose">
              <Heart size={18} />
            </div>
            <div className="login-prompt-feature-text">
              <h4>{txt("મનપસંદ શ્લોક સંગ્રહ", "पसंदीदा श्लोक संग्रह", "Favourite Shlokas Collection")}</h4>
              <p>{txt("તમારા મનપસંદ શ્લોક બુકમાર્ક કરી ગમે ત્યારે વાંચો.", "अपने पसंदीदा श्लोक बुकमार्क करके कभी भी पढ़ें।", "Bookmark sacred verses to read anytime.")}</p>
            </div>
          </div>

          <div className="login-prompt-feature-item">
            <div className="login-prompt-feature-icon icon-emerald">
              <Trophy size={18} />
            </div>
            <div className="login-prompt-feature-text">
              <h4>{txt("ગીતા ક્વિઝ અને સિદ્ધિઓ", "गीता क्विज़ और उपलब्धियां", "Gita Quiz & Spiritual Badges")}</h4>
              <p>{txt("જ્ઞાન કસોટી રમી સ્કોર અને પ્રમાણપત્રો પ્રાપ્ત કરો.", "ज्ञान परीक्षा देकर स्कोर और प्रमाण पत्र प्राप्त करें।", "Take tests, earn sacred badges, and test your knowledge.")}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="login-prompt-actions">
          <button
            type="button"
            className="login-prompt-submit-btn"
            onClick={handleGoToLogin}
          >
            <LogIn size={18} />
            <span>
              {txt("લૉગિન કરો / નવું એકાઉન્ટ", "लॉगिन करें / नया खाता", "Log In / Create Account")}
            </span>
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            className="login-prompt-skip-btn"
            onClick={handleClose}
          >
            {txt("પછીથી (Skip)", "बाद में (Skip)", "Later (Skip)")}
          </button>
        </div>
      </div>
    </div>
  );
}

