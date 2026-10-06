import { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  BellRing,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Flame,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  getExistingSubscription,
  subscribeUserToPush,
  unsubscribeUserFromPush,
  syncPushSubscriptionWithBackend,
  sendTestNotificationToSelf,
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

  const [dismissedThisVisit, setDismissedThisVisit] = useState(false);
  const [testingDevice, setTestingDevice] = useState(false);

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
      if (active) {
        syncPushSubscriptionWithBackend(user);
      }

      // If user has NOT turned on notifications and hasn't dismissed it in this visit:
      // Show the Welcome Popup on website open
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
        text: "સૂચનાઓ સફળતાપૂર્વક સક્રિય કરવામાં આવી છે.",
        type: "success",
      });

      // Automatically close modal after success
      setTimeout(() => {
        setStatusMsg({ text: "", type: "" });
        setShowPromptModal(false);
        setShowSettingsModal(false);
      }, 2000);
    } catch (err) {
      console.error("Subscription error:", err);
      const perm = getNotificationPermission();
      setPermission(perm);

      let errorMsg = "સૂચનાઓ શરૂ કરવામાં સમસ્યા આવી.";
      if (
        perm === "denied" ||
        (err.message && (err.message.includes("નકારી") || err.message.includes("denied")))
      ) {
        errorMsg =
          "સૂચનાઓની પરવાનગી નકારી દીધી છે. બ્રાઉઝરના લૉક આઇકનમાંથી Allow કરો.";
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
        text: "સૂચનાઓ નિષ્ક્રિય કરવામાં આવી છે.",
        type: "success",
      });
      setTimeout(() => {
        setStatusMsg({ text: "", type: "" });
        setShowSettingsModal(false);
      }, 1800);
    } catch (err) {
      console.error(err);
      setStatusMsg({
        text: "સૂચનાઓ બંધ કરવામાં સમસ્યા આવી.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Send Test Notification to current device
  const handleSendTest = async () => {
    setTestingDevice(true);
    setStatusMsg({ text: "", type: "" });
    try {
      const res = await sendTestNotificationToSelf();
      if (res && res.success) {
        setStatusMsg({
          text: "ટેસ્ટ નોટિફિકેશન મોકલાઈ ગયું છે! કૃપા કરીને ફોનની સ્ક્રીન લોક કરીને અથવા એપ બંધ કરીને ચકાસો.",
          type: "success",
        });
      } else {
        setStatusMsg({
          text: (res && res.error) || "ટેસ્ટ મોકલવામાં સમસ્યા આવી.",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({
        text: err.message || "ટેસ્ટ મોકલવામાં સમસ્યા આવી.",
        type: "error",
      });
    } finally {
      setTestingDevice(false);
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
        text: "હજી પરવાનગી મળી નથી. બ્રાઉઝરના એડ્રેસ બારમાં લૉક આઇકન પર ક્લિક કરી Notifications: Allow કરો.",
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
            ? "દૈનિક પ્રેરણા સૂચનાઓ સક્રિય છે"
            : "દૈનિક પ્રેરણા સૂચનાઓ શરૂ કરો"
        }
        aria-label="સૂચના સેટિંગ્સ"
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
          MAIN WELCOME POPUP MODAL (જ્યાં સુધી નોટિફિકેશન શરૂ ન કરે ત્યાં સુધી દર વખતે દેખાય)
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
              title="હમણાં નહીં"
            >
              <X size={18} />
            </button>

            {/* Glowing Bell Icon Header */}
            <div className="notif-prompt-icon-wrapper">
              <div className="notif-prompt-icon-ring ring-1" />
              <div className="notif-prompt-icon-ring ring-2" />
              <div className="notif-prompt-icon-circle">
                <BellRing size={32} className="notif-prompt-bell-animated" />
              </div>
            </div>

            {/* Header / Title */}
            <div className="notif-prompt-header">
              <span className="notif-prompt-tag">
                <Sparkles size={13} />
                <span>શ્રીમદ્ ભગવદ્ ગીતા</span>
              </span>
              <h2 className="notif-prompt-title">
                દૈનિક પ્રેરણા સૂચનાઓ સક્રિય કરો
              </h2>
              <p className="notif-prompt-subtitle">
                દરરોજ તમારી વાંચન સ્ટ્રીક જાળવવા અને જીવનમાં સકારાત્મક માર્ગદર્શન મેળવવા માટે સૂચનાઓ શરૂ કરો.
              </p>
            </div>

            {/* Professional Features List */}
            <div className="notif-prompt-features">
              <div className="notif-feature-item">
                <div className="notif-feature-icon">
                  <Flame size={16} />
                </div>
                <div className="notif-feature-text">
                  <strong>દૈનિક સ્ટ્રીક (Daily Streak)</strong>
                  <span>નિયમિત વાંચનની આદત જાળવી રાખો અને લક્ષ્ય પૂર્ણ કરો</span>
                </div>
              </div>

              <div className="notif-feature-item">
                <div className="notif-feature-icon">
                  <BookOpen size={16} />
                </div>
                <div className="notif-feature-text">
                  <strong>સમયસર પ્રેરણા અને માર્ગદર્શન</strong>
                  <span>દિવસ દરમિયાન મનની શાંતિ અને એકાગ્રતા માટે સહાયક સંદેશાઓ</span>
                </div>
              </div>

              <div className="notif-feature-item">
                <div className="notif-feature-icon">
                  <ShieldCheck size={16} />
                </div>
                <div className="notif-feature-text">
                  <strong>સંપૂર્ણ નિયંત્રણ અને સુરક્ષા</strong>
                  <span>કોઈ વધારાના સંદેશાઓ નહીં, ગમે ત્યારે સહેલાઈથી બંધ કરી શકો છો</span>
                </div>
              </div>
            </div>

            {/* If Permission is Denied Warning Box */}
            {permission === "denied" && (
              <div className="notif-denied-box">
                <div className="notif-denied-header">
                  <Lock size={15} />
                  <span>સૂચનાઓની પરવાનગી બ્રાઉઝરમાં બ્લોક થયેલ છે</span>
                </div>
                <p>
                  તમે અગાઉ બ્લોક કરેલ છે. તેને ચાલુ કરવા માટે બ્રાઉઝરના એડ્રેસ બારમાં લૉક આઇકન પર ક્લિક કરી <strong>Notifications: Allow</strong> પસંદ કરો.
                </p>
                <button
                  type="button"
                  className="notif-check-perm-btn"
                  onClick={handleCheckPermissionAgain}
                  disabled={loading}
                >
                  <RefreshCw size={14} /> પરવાનગી ફરીથી ચકાસો
                </button>
              </div>
            )}

            {/* Toast Message */}
            {statusMsg.text && (
              <div className={`notif-prompt-toast ${statusMsg.type}`}>
                {statusMsg.type === "success" ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <AlertCircle size={15} />
                )}
                <span>{statusMsg.text}</span>
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
                  <BellRing size={17} />
                  <span>
                    {loading ? "પ્રક્રિયા ચાલુ છે..." : "સૂચનાઓ સક્રિય કરો"}
                  </span>
                </button>

                <button
                  type="button"
                  className="notif-prompt-btn-secondary"
                  onClick={handleDismissPrompt}
                  disabled={loading}
                >
                  હમણાં નહીં
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
                <Bell size={17} />
                <span>સૂચના સેટિંગ્સ</span>
              </span>
              <button
                type="button"
                className="notif-close-btn"
                onClick={() => setShowSettingsModal(false)}
                aria-label="બંધ કરો"
              >
                <X size={16} />
              </button>
            </div>

            <div className="notif-modal-body">
              <div className="notif-active-badge">
                <CheckCircle2 size={14} />
                <span>સૂચનાઓ સક્રિય છે</span>
              </div>
              <p style={{ margin: "8px 0 16px 0", lineHeight: "1.5", fontSize: "13px" }}>
                તમારી દૈનિક સ્ટ્રીક અને માર્ગદર્શન માટેની સૂચનાઓ નિયમિત રીતે ચાલુ છે.
              </p>

              <button
                type="button"
                className="notif-action-btn test-btn"
                style={{
                  background: "#175bb5",
                  color: "#ffffff",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%",
                }}
                onClick={handleSendTest}
                disabled={testingDevice || loading}
              >
                <BellRing size={16} />
                <span>
                  {testingDevice ? "મોકલાઈ રહ્યું છે..." : "આ ડિવાઇસ પર ટેસ્ટ નોટિફિકેશન મોકલો"}
                </span>
              </button>

              <button
                type="button"
                className="notif-action-btn unsubscribe"
                onClick={handleUnsubscribe}
                disabled={loading || testingDevice}
              >
                <BellOff size={15} />
                <span>{loading ? "પ્રક્રિયા ચાલુ છે..." : "સૂચનાઓ નિષ્ક્રિય કરો"}</span>
              </button>

              {statusMsg.text && (
                <div className={`notif-toast ${statusMsg.type}`}>
                  {statusMsg.type === "success" ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                  <span>{statusMsg.text}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
