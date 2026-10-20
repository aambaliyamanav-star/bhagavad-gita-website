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

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000; // 48 hours cooldown

function AppNotificationPrompt() {
  const { user } = useAuth();
  const { txt } = useLanguage();
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Notify next modal in sequence (Login prompt)
  const finishStep = () => {
    try {
      window.dispatchEvent(new CustomEvent("gita-notification-prompt-done"));
    } catch (e) {}
  };

  useEffect(() => {
    const handleStartNotificationCheck = () => {
      // STRICT: Notifications are ONLY for installed App! Never on regular Web browser.
      if (!checkIsInstalled()) {
        finishStep();
        return;
      }

      // 1. If push notifications not supported in this runtime, move to next step
      if (!isAppPushSupported()) {
        finishStep();
        return;
      }

      // Track open
      try {
        trackAppInstallOrOpen(false);
        recordAppOpen(user);
      } catch (e) {}

      // 2. If notifications already enabled, auto-sync and skip prompt permanently!
      if (
        isAppNotificationEnabled() ||
        (typeof Notification !== "undefined" && Notification.permission === "granted") ||
        localStorage.getItem("app_push_notifications_enabled") === "true"
      ) {
        localStorage.setItem("app_push_notifications_enabled", "true");
        try {
          syncAppSubscription(user);
        } catch (e) {}
        finishStep();
        return;
      }

      // 3. If permission denied in system/browser settings, skip
      if (typeof Notification !== "undefined" && Notification.permission === "denied") {
        finishStep();
        return;
      }

      // 4. Check 2-Day Cooldown (48 hours)
      // "ek var skip karya pachi 2 divse aavvu joie jya sudhi notification on no kare tya shudhi"
      const skippedTime = localStorage.getItem("gita_notif_skipped_time");
      if (skippedTime) {
        const timeDiff = Date.now() - Number(skippedTime);
        if (timeDiff < TWO_DAYS_MS) {
          finishStep();
          return;
        }
      }

      // 5. Eligible! Show prompt with gentle 350ms delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 350);

      return () => clearTimeout(timer);
    };

    // Listen for language selection completion
    window.addEventListener("gita-language-selected", handleStartNotificationCheck);
    return () => {
      window.removeEventListener("gita-language-selected", handleStartNotificationCheck);
    };
  }, [user]);

  // Listen for manual changes from Navbar toggle
  useEffect(() => {
    const handleStatusChanged = (e) => {
      if (e.detail?.enabled) {
        setShowPrompt(false);
        localStorage.setItem("app_push_notifications_enabled", "true");
        localStorage.removeItem("gita_notif_skipped_time");
        finishStep();
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
      localStorage.setItem("app_push_notifications_enabled", "true");
      localStorage.removeItem("gita_notif_skipped_time");
      try {
        trackAppInstallOrOpen(false);
      } catch (e) {}

      setTimeout(() => {
        setShowPrompt(false);
        finishStep();
      }, 1200);
    } else {
      setShowPrompt(false);
      finishStep();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 2-day cooldown timestamp saved in localStorage
    localStorage.setItem("gita_notif_skipped_time", Date.now().toString());
    finishStep();
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
