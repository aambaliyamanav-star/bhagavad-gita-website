import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, X } from "lucide-react";
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
  const [showModal, setShowModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    const isSupp = isPushNotificationSupported();
    setSupported(isSupp);

    if (!isSupp) return;

    const currentPerm = getNotificationPermission();
    setPermission(currentPerm);

    getExistingSubscription().then((sub) => {
      setIsSubscribed(!!sub);

      // =====================================================
      // OPTION 1: DIRECT AUTO-PROMPT
      // Automatically request browser notification permission
      // on website visit without asking any intermediate questions!
      // =====================================================
      if (currentPerm === "default" && !sub) {
        let hasPrompted = false;

        const requestDirect = () => {
          if (hasPrompted) return;
          hasPrompted = true;
          window.removeEventListener("click", requestDirect);
          window.removeEventListener("touchstart", requestDirect);

          subscribeUserToPush(user)
            .then(() => {
              setIsSubscribed(true);
              setPermission("granted");
            })
            .catch((err) => {
              console.debug("Direct auto-prompt result:", err?.message || err);
            });
        };

        // 1. Trigger directly after a short 1.2 second delay on page load
        const timer = setTimeout(() => {
          requestDirect();
        }, 1200);

        // 2. Also listen for the very first click/touch (fallback for browsers requiring user gesture)
        window.addEventListener("click", requestDirect, { once: true });
        window.addEventListener("touchstart", requestDirect, { once: true });

        return () => {
          clearTimeout(timer);
          window.removeEventListener("click", requestDirect);
          window.removeEventListener("touchstart", requestDirect);
        };
      }
    });
  }, [user]);

  const handleSubscribe = async () => {
    setLoading(true);
    setStatusMsg({ text: "", type: "" });
    try {
      await subscribeUserToPush(user);
      setIsSubscribed(true);
      setPermission("granted");
      setStatusMsg({
        text: "નોટિફિકેશન સફળતાપૂર્વક શરૂ થઈ ગયું છે! 🙏",
        type: "success",
      });
      setTimeout(() => {
        setStatusMsg({ text: "", type: "" });
        setShowModal(false);
      }, 2500);
    } catch (err) {
      console.error("Subscription error:", err);
      let errorMsg = "નોટિફિકેશન શરૂ કરવામાં સમસ્યા આવી.";
      if (
        err.message &&
        (err.message.includes("નકારી") || err.message.includes("denied"))
      ) {
        errorMsg =
          "નોટિફિકેશનની પરવાનગી નકારી દીધી છે. બ્રાઉઝર સેટિંગ્સમાંથી Allow કરો.";
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

  const handleUnsubscribe = async () => {
    setLoading(true);
    setStatusMsg({ text: "", type: "" });
    try {
      await unsubscribeUserFromPush();
      setIsSubscribed(false);
      setStatusMsg({
        text: "નોટિફિકેશન બંધ કરવામાં આવ્યું છે.",
        type: "success",
      });
      setTimeout(() => {
        setStatusMsg({ text: "", type: "" });
        setShowModal(false);
      }, 2000);
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

  if (!supported) return null;

  return (
    <>
      {/* BELL BUTTON IN NAVBAR */}
      <button
        type="button"
        className={`notif-bell-btn ${isSubscribed ? "active" : ""}`}
        onClick={() => {
          setStatusMsg({ text: "", type: "" });
          setShowModal((prev) => !prev);
        }}
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
            {permission === "default" && <span className="notif-badge-pulse" />}
          </>
        )}
      </button>

      {/* POPUP MODAL */}
      {showModal && (
        <>
          <div
            className="notif-backdrop"
            onClick={() => setShowModal(false)}
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
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="notif-modal-body">
              {isSubscribed ? (
                <>
                  <p
                    style={{
                      color: "#27ae60",
                      fontWeight: "bold",
                      margin: "0 0 16px 0",
                      lineHeight: "1.6",
                    }}
                  >
                    ✓ નોટિફિકેશન સક્રિય છે (Active)
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
                </>
              ) : (
                <>
                  <p
                    style={{
                      margin: "0 0 16px 0",
                      lineHeight: "1.6",
                    }}
                  >
                    શ્રીમદ્ ભગવદ્ ગીતાના અમૃત જેવા પવિત્ર શ્લોક અને જ્ઞાન દરરોજ
                    મેળવવા માટે નોટિફિકેશન શરૂ કરો.
                  </p>

                  <button
                    type="button"
                    className="notif-action-btn subscribe"
                    onClick={handleSubscribe}
                    disabled={loading}
                  >
                    <BellRing size={16} />
                    {loading
                      ? "પરવાનગી મેળવી રહ્યું છે..."
                      : "હા, નોટિફિકેશન શરૂ કરો"}
                  </button>
                </>
              )}

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
