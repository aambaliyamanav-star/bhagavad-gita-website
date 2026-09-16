import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, Check, X, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  getExistingSubscription,
  subscribeUserToPush,
  unsubscribeUserFromPush,
} from "../utils/pushNotification.js";
import "./NotificationBell.css";

export default function NotificationBell({ inMenu = false }) {
  const { user } = useAuth();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBannerPrompt, setShowBannerPrompt] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    const isSupp = isPushNotificationSupported();
    setSupported(isSupp);

    if (isSupp) {
      const perm = getNotificationPermission();
      setPermission(perm);

      getExistingSubscription().then((sub) => {
        setIsSubscribed(!!sub);

        // Show banner prompt only once if permission is default and not dismissed
        if (
          perm === "default" &&
          !sub &&
          !sessionStorage.getItem("gita_notif_prompt_dismissed")
        ) {
          const timer = setTimeout(() => {
            setShowBannerPrompt(true);
          }, 3500);
          return () => clearTimeout(timer);
        }
      });
    }
  }, [user]);

  const handleSubscribe = async () => {
    setLoading(true);
    setStatusMsg("");
    try {
      await subscribeUserToPush(user);
      setIsSubscribed(true);
      setPermission("granted");
      setShowBannerPrompt(false);
      setStatusMsg("નોટિફિકેશન સફળતાપૂર્વક શરૂ થઈ ગયું છે! 🙏");
      setTimeout(() => {
        setStatusMsg("");
        setShowModal(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      setStatusMsg(err.message || "નોટિફિકેશન શરૂ કરવામાં સમસ્યા આવી.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setStatusMsg("");
    try {
      await unsubscribeUserFromPush();
      setIsSubscribed(false);
      setStatusMsg("નોટિફિકેશન બંધ કરવામાં આવ્યું છે.");
      setTimeout(() => {
        setStatusMsg("");
        setShowModal(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatusMsg("બંધ કરવામાં સમસ્યા આવી.");
    } finally {
      setLoading(false);
    }
  };

  const handleDismissBanner = () => {
    setShowBannerPrompt(false);
    sessionStorage.setItem("gita_notif_prompt_dismissed", "true");
  };

  if (!supported) return null;

  return (
    <>
      {/* BELL BUTTON IN NAVBAR / MENU */}
      <button
        type="button"
        className={`notif-bell-btn ${isSubscribed ? "active" : ""}`}
        onClick={() => setShowModal((prev) => !prev)}
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
                  <p style={{ color: "#27ae60", fontWeight: "bold" }}>
                    ✓ નોટિફિકેશન સક્રિય છે (Active)
                  </p>
                  <ul className="notif-feature-list">
                    <li>🌸 દરરોજ દિવસમાં ૩-૪ વખત પવિત્ર શ્લોક યાદ અપાશે.</li>
                    <li>
                      ⚡ <strong>વિશેષતા:</strong> જો તમે દિવસમાં એકવાર પણ
                      વેબસાઇટ ખોલશો, તો તે દિવસ માટે વધારાના નોટિફિકેશન આપમેળે
                      બંધ થઈ જશે!
                    </li>
                    {user?.role === "admin" && (
                      <li style={{ color: "#d35400" }}>
                        🛡️ <strong>એડમિન:</strong> નવો યુઝર રજીસ્ટર થશે ત્યારે
                        તમને તુરંત સૂચના મળશે.
                      </li>
                    )}
                  </ul>

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
                  <p>
                    શ્રીમદ્ ભગવદ્ ગીતાના અમૃત જેવા પવિત્ર શ્લોક અને જ્ઞાન દરરોજ
                    મેળવવા માટે નોટિફિકેશન શરૂ કરો.
                  </p>
                  <ul className="notif-feature-list">
                    <li>📖 સવાર-સાંજ પ્રેરણાદાયક શ્લોક અને અર્થ.</li>
                    <li>
                      ✨ વેબસાઇટ ખોલતા જ તે દિવસના બાકી નોટિફિકેશન આપોઆપ શાંત થઈ
                      જશે.
                    </li>
                  </ul>

                  <button
                    type="button"
                    className="notif-action-btn subscribe"
                    onClick={handleSubscribe}
                    disabled={loading}
                  >
                    <BellRing size={16} />
                    {loading ? "પરવાનગી મેળવી રહ્યું છે..." : "હા, નોટિફિકેશન શરૂ કરો"}
                  </button>
                </>
              )}

              {statusMsg && <div className="notif-toast">{statusMsg}</div>}
            </div>
          </div>
        </>
      )}

      {/* FLOATING PROMPT BANNER (First-time visitors) */}
      {showBannerPrompt && !isSubscribed && (
        <div className="notif-banner-prompt">
          <div className="notif-banner-text">
            <strong>🌸 શ્રીમદ્ ભગવદ્ ગીતા શ્લોક</strong>
            શું તમે દરરોજ જીવન માર્ગદર્શન આપતા શ્લોકના નોટિફિકેશન મેળવવા માંગો છો?
          </div>
          <div className="notif-banner-actions">
            <button
              type="button"
              className="notif-banner-btn-yes"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? "..." : "હા, શરૂ કરો"}
            </button>
            <button
              type="button"
              className="notif-banner-btn-later"
              onClick={handleDismissBanner}
            >
              પછીથી
            </button>
          </div>
        </div>
      )}
    </>
  );
}
