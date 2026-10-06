import { useState, useEffect } from "react";
import { Bell, Sparkles, X, Check } from "lucide-react";
import { checkIsInstalled } from "../utils/pwaManager.js";
import {
  isAppPushSupported,
  enableAppNotifications,
  syncAppSubscription,
  recordAppOpen,
} from "../utils/appPushNotification.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./AppNotificationPrompt.css";

function AppNotificationPrompt() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 1. STRICT: If not running as installed standalone app, NEVER show or run!
    if (!checkIsInstalled()) {
      return;
    }

    // 2. If push not supported in this runtime, skip
    if (!isAppPushSupported()) {
      return;
    }

    // Record open in app for daily goal tracking
    recordAppOpen(user);

    // 3. If permission already granted, auto-sync and skip prompt
    if (Notification.permission === "granted") {
      syncAppSubscription(user);
      return;
    }

    // 4. If permission denied, skip
    if (Notification.permission === "denied") {
      return;
    }

    // 5. If dismissed in the last 7 days, skip
    const dismissedUntil = localStorage.getItem("app_notif_prompt_dismissed_until");
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // Gentle 2-second delay after opening the app
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleEnable = async () => {
    setLoading(true);
    const res = await enableAppNotifications(user);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setShowPrompt(false);
      }, 1800);
    } else {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Dismiss for 5 days
    localStorage.setItem(
      "app_notif_prompt_dismissed_until",
      String(Date.now() + 5 * 24 * 60 * 60 * 1000)
    );
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
            <h3>નોટિફિકેશન સક્રિય થઈ ગયા છે!</h3>
            <p>હવે તમને દિવસમાં ૫ વખત પવિત્ર ગીતા પ્રેરણા મળશે. 🙏</p>
          </div>
        ) : (
          <>
            <div className="app-notif-header">
              <span className="app-notif-badge">📱 એપ સ્પેશિયલ</span>
              <h3 className="app-notif-title">
                દૈનિક ગીતા નોટિફિકેશન (૫ વખત)
              </h3>
              <p className="app-notif-sub">
                દિવસમાં ૫ વખત (સવાર, બપોર, સાંજ અને રાત્રિ) ભગવાન શ્રીકૃષ્ણના પવિત્ર શ્લોકો, અર્થ અને પ્રેરણા મેળવો.
              </p>
            </div>

            <div className="app-notif-schedule-pills">
              <span className="schedule-pill">🌅 08:00 AM</span>
              <span className="schedule-pill">🌞 12:00 PM</span>
              <span className="schedule-pill">🌿 04:00 PM</span>
              <span className="schedule-pill">🌆 07:00 PM</span>
              <span className="schedule-pill">🌙 10:00 PM</span>
            </div>

            <div className="app-notif-actions">
              <button
                type="button"
                className="app-notif-enable-btn"
                onClick={handleEnable}
                disabled={loading}
              >
                <Bell size={16} />
                <span>{loading ? "ચાલુ થઈ રહ્યું છે..." : "હા, નોટિફિકેશન ચાલુ કરો"}</span>
              </button>

              <button
                type="button"
                className="app-notif-later-btn"
                onClick={handleDismiss}
              >
                પછીથી
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AppNotificationPrompt;
