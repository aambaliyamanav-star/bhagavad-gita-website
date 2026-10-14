import { useState, useEffect } from "react";
import { Bell, Sparkles, X, Check } from "lucide-react";
import { checkIsInstalled } from "../utils/pwaManager.js";
import {
  isAppPushSupported,
  isAppNotificationEnabled,
  enableAppNotifications,
  syncAppSubscription,
  recordAppOpen,
} from "../utils/appPushNotification.js";
import { trackAppInstallOrOpen } from "../utils/appAnalytics.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./AppNotificationPrompt.css";

function AppNotificationPrompt() {
  const { user } = useAuth();
  const { isHindi, isEnglish, isGujarati, txt } = useLanguage();
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 1. STRICT: If not running as installed standalone app, NEVER show or run!
    if (!checkIsInstalled()) {
      return;
    }

    // Track app open in analytics
    trackAppInstallOrOpen(false);

    // 2. If push not supported in this runtime, skip
    if (!isAppPushSupported()) {
      return;
    }

    // Record open in app for daily goal tracking
    recordAppOpen(user);

    // 3. If notifications already enabled, auto-sync and skip prompt
    if (isAppNotificationEnabled()) {
      syncAppSubscription(user);
      return;
    }

    // 4. If permission denied in browser/system settings, skip
    if (Notification.permission === "denied") {
      return;
    }

    // 5. If running in installed app for the very first time, wait for language selection first
    if (localStorage.getItem("gita_app_lang_selected") !== "true") {
      return;
    }

    // 6. If dismissed in the current session, don't nag repeatedly on every page navigation
    if (sessionStorage.getItem("app_notif_dismissed_session") === "true") {
      return;
    }

    // Gentle 1.5-second delay after opening the app to remind user
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [user]);

  // Listen for manual changes from Navbar toggle
  useEffect(() => {
    const handleStatusChanged = (e) => {
      if (e.detail?.enabled) {
        setShowPrompt(false);
      }
    };
    window.addEventListener("app-notification-status-changed", handleStatusChanged);
    return () => {
      window.removeEventListener("app-notification-status-changed", handleStatusChanged);
    };
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    const res = await enableAppNotifications(user);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      trackAppInstallOrOpen(false);
      setTimeout(() => {
        setShowPrompt(false);
      }, 1500);
    } else {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Dismiss only for this active browsing session; reminds them on next app open
    sessionStorage.setItem("app_notif_dismissed_session", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="app-notif-backdrop" role="dialog" aria-modal="true">
      <div className="app-notif-card">
        <button
          type="button"
          className="app-notif-close-btn"
          onClick={handleDismiss}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="app-notif-icon-wrap">
          <div className="app-notif-icon-glow" />
          <Bell size={28} className="app-notif-bell-icon" />
          <Sparkles size={14} className="app-notif-sparkle-icon" />
        </div>

        {success ? (
          <div className="app-notif-success-state">
            <div className="app-notif-check-circle">
              <Check size={22} strokeWidth={3} />
            </div>
            <h3>{txt("નોટિફિકેશન સક્રિય થઈ ગયા છે!", "नोटिफिकेशन सक्रिय हो गए हैं!", "Notifications are activated!")}</h3>
            <p>{txt("હવે તમને પવિત્ર ગીતા પ્રેરણા મળશે. 🙏", "अब आपको पवित्र गीता प्रेरणा मिलेगी। 🙏", "You will now receive divine Gita inspiration. 🙏")}</p>
          </div>
        ) : (
          <>
            <div className="app-notif-header">
              <h3 className="app-notif-title">
                {txt("દૈનિક ગીતા નોટિફિકેશન", "दैनिक गीता नोटिफिकेशन", "Daily Gita Notifications")}
              </h3>
              <p className="app-notif-sub">
                {txt("દરરોજ પવિત્ર શ્લોક અને પ્રેરણા મેળવો.", "प्रतिदिन पवित्र श्लोक और प्रेरणा प्राप्त करें।", "Receive sacred shlokas and daily inspiration.")}
              </p>
            </div>

            <div className="app-notif-actions">
              <button
                type="button"
                className="app-notif-enable-btn"
                onClick={handleEnable}
                disabled={loading}
              >
                <Bell size={16} />
                <span>
                  {loading
                    ? txt("ચાલુ થઈ રહ્યું છે...", "चालू हो रहा है...", "Enabling...")
                    : txt("ચાલુ કરો", "चालू करें", "Enable")}
                </span>
              </button>

              <button
                type="button"
                className="app-notif-later-btn"
                onClick={handleDismiss}
              >
                {txt("પછીથી", "बाद में", "Later")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AppNotificationPrompt;
