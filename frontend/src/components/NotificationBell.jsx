import { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  BellRing,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sun,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  getExistingSubscription,
  subscribeUserToPush,
  unsubscribeUserFromPush,
} from "../utils/pushNotification.js";
import "./NotificationBell.css";

export default function NotificationBell() {
  const { user } = useAuth();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Centered welcome popup for users who haven't enabled notifications
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Settings dropdown modal when subscribed user clicks navbar bell
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // In-memory dismissal so user can browse other pages during current visit after clicking 'Later'
  const [dismissedThisVisit, setDismissedThisVisit] = useState(false);

  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  // On website open / page mount: check subscription status
  useEffect(() => {
    const isSupp = isPushNotificationSupported();
    setSupported(isSupp);

    if (!isSupp) return;

    const currentPerm = getNotificationPermission();
    setPermission(currentPerm);

    getExistingSubscription().then((sub) => {
      const active = !!sub && currentPerm === "granted";
      setIsSubscribed(active);

      // If user has NOT turned on notifications and hasn't dismissed it in this visit:
      // Show the Welcome Popup on website open!
      if (!active && !dismissedThisVisit) {
        const timer = setTimeout(() => {
          setShowPromptModal(true);
        }, 750);
        return () => clearTimeout(timer);
      }
    });
  }, [user, dismissedThisVisit]);

  // Handle Turn On Notification
  const handleSubscribe = async () => {
    setLoading(true);
    setStatusMsg({ text: "", type: "" });
    try {
      await subscribeUserToPush(user);
      setIsSubscribed(true);
      setPermission("granted");
      setStatusMsg({
        text: "✨ અદ્ભુત! નોટિફિકેશન સફળતાપૂર્વક શરૂ થઈ ગયું છે. જય શ્રી કૃષ્ણ! 🙏",
        type: "success",
      });

      // Automatically close modal after celebration
      setTimeout(() => {
        setStatusMsg({ text: "", type: "" });
        setShowPromptModal(false);
        setShowSettingsModal(false);
      }, 2200);
    } catch (err) {
      console.error("Subscription error:", err);
      const perm = getNotificationPermission();
      setPermission(perm);

      let errorMsg = "નોટિફિકેશન શરૂ કરવામાં સમસ્યા આવી.";
      if (
        perm === "denied" ||
        (err.message && (err.message.includes("નકારી") || err.message.includes("denied")))
      ) {
        errorMsg =
          "નોટિફિકેશનની પરવાનગી નકારી દીધી છે. બ્રાઉઝરના 🔒 લૉક આઇકનમાંથી Allow કરો.";
      } else if (err.message && err.message.includes("fetch")) {
        errorMsg =
          "સર્વર સાથે જોડાણ થઈ શક્યું નથી. કૃપા કરીને થોડીવાર પછી ફરી પ્રયાસ કરો.";
      } else if (err.message) {
        errorMsg = err.message;
      }
      setStatusMsg({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle Unsubscribe
  const handleUnsubscribe = async () => {
    setLoading(true);
    setStatusMsg({ text: "", type: "" });
    try {
      await unsubscribeUserFromPush();
      setIsSubscribed(false);
      setPermission(getNotificationPermission());
      setStatusMsg({
        text: "નોટિફિકેશન બંધ કરવામાં આવ્યું છે.",
        type: "success",
      });
      setTimeout(() => {
        setStatusMsg({ text: "", type: "" });
        setShowSettingsModal(false);
      }, 1800);
    } catch (err) {
      console.error(err);
      setStatusMsg({
        text: "નોટિફિકેશન બંધ કરવામાં સમસ્યા આવી.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check permission again (useful when user unblocks in browser settings)
  const handleCheckPermissionAgain = async () => {
    const perm = getNotificationPermission();
    setPermission(perm);
    if (perm === "granted") {
      handleSubscribe();
    } else {
      setStatusMsg({
        text: "હજી પરવાનગી મળી નથી. બ્રાઉઝરના એડ્રેસ બારમાં 🔒 લૉક આઇકન પર ક્લિક કરી Notifications: Allow કરો.",
        type: "error",
      });
    }
  };

  const handleDismissPrompt = () => {
    setShowPromptModal(false);
    setDismissedThisVisit(true);
    setStatusMsg({ text: "", type: "" });
  };

  const handleNavbarBellClick = () => {
    setStatusMsg({ text: "", type: "" });
    if (isSubscribed) {
      setShowSettingsModal((prev) => !prev);
    } else {
      setShowPromptModal((prev) => !prev);
    }
  };

  if (!supported) return null;

  return (
    <>
      {/* BELL BUTTON IN NAVBAR */}
      <button
        type="button"
        className={`notif-bell-btn ${isSubscribed ? "active" : ""}`}
        onClick={handleNavbarBellClick}
        title={
          isSubscribed
            ? "દૈનિક શ્લોક નોટિફિકેશન સક્રિય છે"
            : "દૈનિક શ્લોક નોટિફિકેશન શરૂ કરો"
        }
        aria-label="નોટિફિકેશન સેટિંગ્સ"
      >
        {isSubscribed ? (
          <>
            <BellRing size={20} strokeWidth={2} />
            <span className="notif-badge-dot" />
          </>
        ) : (
          <>
            <Bell size={20} strokeWidth={1.8} />
            <span className="notif-badge-pulse" />
          </>
        )}
      </button>

      {/* =====================================================
          MAIN WELCOME POPUP MODAL (જ્યાં સુધી નોટિફિકેશન શરૂ ન કરે ત્યાં સુધી દર વખતે વેબસાઇટ ખોલતા દેખાશે)
      ===================================================== */}
      {showPromptModal && (
        <>
          <div
            className="notif-prompt-backdrop"
            onClick={handleDismissPrompt}
          />
          <div className="notif-prompt-dialog" role="dialog" aria-modal="true">
            {/* Top Close Button */}
            <button
              type="button"
              className="notif-prompt-close-btn"
              onClick={handleDismissPrompt}
              aria-label="બંધ કરો"
              title="પછીથી"
            >
              <X size={20} />
            </button>

            {/* Glowing Bell Icon Header */}
            <div className="notif-prompt-icon-wrapper">
              <div className="notif-prompt-icon-ring ring-1" />
              <div className="notif-prompt-icon-ring ring-2" />
              <div className="notif-prompt-icon-circle">
                <BellRing size={34} className="notif-prompt-bell-animated" />
              </div>
            </div>

            {/* Header / Title */}
            <div className="notif-prompt-header">
              <span className="notif-prompt-tag">
                <Sparkles size={14} /> શ્રીમદ્ ભગવદ્ ગીતા
              </span>
              <h2 className="notif-prompt-title">
                દૈનિક શ્લોક નોટિફિકેશન શરૂ કરો 🙏
              </h2>
              <p className="notif-prompt-subtitle">
                દરરોજ સવારે અને સાંજે પવિત્ર ગીતા શ્લોક, સરળ ગુજરાતી અર્થ અને દૈનિક આધ્યાત્મિક પ્રેરણા સીધા તમારા ફોનમાં મેળવો.
              </p>
            </div>

            {/* Features List */}
            <div className="notif-prompt-features">
              <div className="notif-feature-item">
                <div className="notif-feature-icon">
                  <CheckCircle2 size={16} />
                </div>
                <div className="notif-feature-text">
                  <strong>દરરોજ નવો પવિત્ર શ્લોક</strong>
                  <span>સરળ ગુજરાતી અર્થ અને જીવન માર્ગદર્શન સાથે</span>
                </div>
              </div>

              <div className="notif-feature-item">
                <div className="notif-feature-icon">
                  <Sun size={16} />
                </div>
                <div className="notif-feature-text">
                  <strong>પ્રભાત અને સંધ્યા ચિંતન</strong>
                  <span>દિવસની શરૂઆત અને અંત સદ્વિચાર સાથે કરો</span>
                </div>
              </div>

              <div className="notif-feature-item">
                <div className="notif-feature-icon">
                  <BellOff size={16} />
                </div>
                <div className="notif-feature-text">
                  <strong>૧૦૦% નિઃશુલ્ક અને સુરક્ષિત</strong>
                  <span>કોઈ સ્પેમ નહીં, ગમે ત્યારે બંધ કરી શકો છો</span>
                </div>
              </div>
            </div>

            {/* If Permission is Denied Warning Box */}
            {permission === "denied" && (
              <div className="notif-denied-box">
                <div className="notif-denied-header">
                  <AlertTriangle size={18} />
                  <span>નોટિફિકેશન બ્રાઉઝરમાં બ્લોક થયેલ છે</span>
                </div>
                <p>
                  તમે અગાઉ 'Block' કરેલું છે. તેને ચાલુ કરવા માટે બ્રાઉઝરમાં ઉપર URL પાસે લૉક (🔒) આઇકન પર ક્લિક કરી <strong>Notifications: Allow</strong> કરો.
                </p>
                <button
                  type="button"
                  className="notif-check-perm-btn"
                  onClick={handleCheckPermissionAgain}
                  disabled={loading}
                >
                  <RefreshCw size={15} /> મેં Allow કર્યું, ફરીથી તપાસો
                </button>
              </div>
            )}

            {/* Toast Message */}
            {statusMsg.text && (
              <div className={`notif-prompt-toast ${statusMsg.type}`}>
                {statusMsg.text}
              </div>
            )}

            {/* Action Buttons */}
            {permission !== "denied" && (
              <div className="notif-prompt-actions">
                <button
                  type="button"
                  className="notif-prompt-btn-primary"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  <BellRing size={18} />
                  <span>
                    {loading ? "પરવાનગી મેળવી રહ્યું છે..." : "હા, નોટિફિકેશન શરૂ કરો"}
                  </span>
                </button>

                <button
                  type="button"
                  className="notif-prompt-btn-secondary"
                  onClick={handleDismissPrompt}
                  disabled={loading}
                >
                  પછીથી (Maybe Later)
                </button>
              </div>
            )}

            {permission === "denied" && (
              <div className="notif-prompt-actions">
                <button
                  type="button"
                  className="notif-prompt-btn-secondary"
                  onClick={handleDismissPrompt}
                >
                  બંધ કરો
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* =====================================================
          SETTINGS MODAL (FOR USERS ALREADY SUBSCRIBED)
      ===================================================== */}
      {showSettingsModal && isSubscribed && (
        <>
          <div
            className="notif-backdrop"
            onClick={() => setShowSettingsModal(false)}
          />
          <div className="notif-modal">
            <div className="notif-modal-header">
              <span className="notif-modal-title">
                <Bell size={18} />
                દૈનિક શ્લોક નોટિફિકેશન
              </span>
              <button
                type="button"
                className="notif-close-btn"
                onClick={() => setShowSettingsModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="notif-modal-body">
              <div className="notif-active-badge">
                <CheckCircle2 size={16} /> નોટિફિકેશન સક્રિય છે (Active)
              </div>
              <p style={{ margin: "8px 0 16px 0", lineHeight: "1.5", fontSize: "13px" }}>
                તમને દરરોજ ભગવદ્ ગીતાના પવિત્ર શ્લોક અને દૈનિક માર્ગદર્શન સમયસર મળી રહેશે.
              </p>

              <button
                type="button"
                className="notif-action-btn unsubscribe"
                onClick={handleUnsubscribe}
                disabled={loading}
              >
                <BellOff size={16} />
                {loading ? "પ્રક્રિયા ચાલુ..." : "નોટિફિકેશન બંધ કરો"}
              </button>

              {statusMsg.text && (
                <div className={`notif-toast ${statusMsg.type}`}>
                  {statusMsg.text}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
