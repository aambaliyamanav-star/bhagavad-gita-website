import { useState, useEffect } from "react";
import {
  Star,
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  Bug,
  Sparkles,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getValidToken } from "../utils/authHelper.js";
import "./FeedbackModal.css";

const PROD_API_BASE = "https://bhagavad-gita-website.onrender.com";
const LOCAL_API_BASE = "http://localhost:5000";

const RATING_LABELS_GU = {
  1: "સુધારવાની જરૂર છે",
  2: "સામાન્ય",
  3: "સારું",
  4: "ઘણું સરસ",
  5: "અદ્ભુત અને દિવ્ય અનુભવ",
};

const RATING_LABELS_HI = {
  1: "सुधार की आवश्यकता है",
  2: "सामान्य",
  3: "अच्छा",
  4: "बहुत अच्छा",
  5: "अद्भुत और दिव्य अनुभव",
};

const CATEGORIES_GU = [
  { id: "suggestion", label: "સૂચન", icon: Lightbulb },
  { id: "feedback", label: "પ્રતિસાદ", icon: MessageSquare },
  { id: "appreciation", label: "પ્રશંસા", icon: Sparkles },
  { id: "bug", label: "સમસ્યા / બગ", icon: Bug },
];

const CATEGORIES_HI = [
  { id: "suggestion", label: "सुझाव", icon: Lightbulb },
  { id: "feedback", label: "प्रतिक्रिया", icon: MessageSquare },
  { id: "appreciation", label: "प्रशंसा", icon: Sparkles },
  { id: "bug", label: "समस्या / बग", icon: Bug },
];

export default function FeedbackModal() {
  const { user } = useAuth();
  const { isHindi } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [existingRating, setExistingRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [category, setCategory] = useState("suggestion");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);

  // Initialize name and email from logged-in user
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  // Fetch user's existing rating and lock status
  const fetchUserRating = async () => {
    const token = getValidToken();
    if (!token) {
      setHasRated(false);
      setExistingRating(0);
      setIsLocked(false);
      return;
    }

    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    const targets = isLocal
      ? [`${LOCAL_API_BASE}/api/feedback/my-rating`, `${PROD_API_BASE}/api/feedback/my-rating`]
      : [`${PROD_API_BASE}/api/feedback/my-rating`, `${LOCAL_API_BASE}/api/feedback/my-rating`];

    for (const url of targets) {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.hasRated) {
              setHasRated(true);
              setExistingRating(data.rating || 0);
              setRating(data.rating);
              setIsLocked(Boolean(data.isLocked || data.rating === 5));
            } else {
              setHasRated(false);
              setExistingRating(0);
              setIsLocked(false);
              setRating(5);
            }
            break;
          }
        }
      } catch {
        // try next
      }
    }
  };

  // Fetch feedback stats
  const fetchStats = async () => {
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    const targets = isLocal
      ? [`${LOCAL_API_BASE}/api/feedback/stats`, `${PROD_API_BASE}/api/feedback/stats`]
      : [`${PROD_API_BASE}/api/feedback/stats`, `${LOCAL_API_BASE}/api/feedback/stats`];

    for (const url of targets) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.stats) {
            setStats(data.stats);
            break;
          }
        }
      } catch {
        // ignore
      }
    }
  };

  // Listen to open-feedback-modal event
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
      setError("");
      fetchUserRating();
      fetchStats();
    };
    window.addEventListener("open-feedback-modal", handleOpenEvent);
    return () => {
      window.removeEventListener("open-feedback-modal", handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchUserRating();
      fetchStats();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLocked && (!rating || rating < 1 || rating > 5)) {
      setError(isHindi ? "कृपया 1 से 5 के बीच स्टार रेटिंग चुनें।" : "કૃપા કરીને ૧ થી ૫ વચ્ચે સ્ટાર રેટિંગ પસંદ કરો.");
      return;
    }

    if (!message.trim()) {
      setError(isHindi ? "कृपया अपनी प्रतिक्रिया या सुझाव लिखें।" : "કૃપા કરીને આપનો પ્રતિસાદ અથવા સૂચન લખો.");
      return;
    }

    setSubmitting(true);

    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    const targets = isLocal
      ? [`${LOCAL_API_BASE}/api/feedback`, `${PROD_API_BASE}/api/feedback`]
      : [`${PROD_API_BASE}/api/feedback`];

    const token = getValidToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = {
      rating: isLocked ? 5 : rating,
      category,
      name: name.trim() || (user?.name || (isHindi ? "अनाम साधक" : "અનામી સાધક")),
      email: email.trim() || (user?.email || ""),
      message: message.trim(),
    };

    let success = false;
    let errorMsg = isHindi ? "सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।" : "સર્વર સાથે જોડાણ થઈ શક્યું નથી. કૃપા કરીને ફરી પ્રયાસ કરો.";

    for (const url of targets) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          success = true;
          if (data.isLocked) {
            setIsLocked(true);
            setRating(5);
          }
          break;
        } else if (data.message) {
          errorMsg = data.message;
        }
      } catch {
        // try next
      }
    }

    setSubmitting(false);

    if (success) {
      setSubmitted(true);
      setMessage("");
      fetchUserRating();
      fetchStats();
    } else {
      setError(errorMsg);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setError("");
    }, 300);
  };

  const activeRating = isLocked ? 5 : hoverRating || rating;
  const ratingLabels = isHindi ? RATING_LABELS_HI : RATING_LABELS_GU;
  const categories = isHindi ? CATEGORIES_HI : CATEGORIES_GU;

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        className="feedback-fab-trigger"
        onClick={() => {
          setIsOpen(true);
          setError("");
          fetchUserRating();
          fetchStats();
        }}
        aria-label={isHindi ? "प्रतिक्रिया और रेटिंग दें" : "પ્રતિસાદ અને રેટિંગ આપો"}
        title={isHindi ? "वेबसाइट के लिए अपनी प्रतिक्रिया और रेटिंग दें" : "વેબસાઇટ માટે તમારો પ્રતિસાદ અને રેટિંગ આપો"}
      >
        <Star size={18} className="feedback-fab-star-icon" />
        <span className="feedback-fab-text">
          {isHindi ? "प्रतिक्रिया / रेटिंग" : "પ્રતિસાદ / રેટિંગ"}
        </span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="feedback-modal-overlay" onClick={handleClose}>
          <div
            className="feedback-modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              type="button"
              className="feedback-modal-close"
              onClick={handleClose}
              aria-label={isHindi ? "बंद करें" : "બંધ કરો"}
            >
              <X size={18} />
            </button>

            {submitted ? (
              /* Success Confirmation */
              <div className="feedback-success-state">
                <div className="feedback-success-icon-box">
                  <CheckCircle2 size={42} strokeWidth={2.5} />
                </div>
                <h3 className="feedback-success-title">
                  {isHindi ? "धन्यवाद!" : "ધન્યવાદ!"}
                </h3>
                <p className="feedback-success-desc">
                  {isLocked
                    ? (isHindi
                        ? "आपकी प्रतिक्रिया सफलतापूर्वक दर्ज हो गई है। आपकी 5-स्टार (सर्वोत्तम) रेटिंग लॉक है। आपके अमूल्य सहयोग के लिए बहुत-बहुत धन्यवाद!"
                        : "આપનો પ્રતિસાદ સફળતાપૂર્વક નોંધાઈ ગયો છે. આપનું ૫-સ્ટાર (સર્વોત્તમ) રેટિંગ લૉક થયેલું છે. આપના અમૂલ્ય સાથ બદલ ખૂબ ખૂબ આભાર!")
                    : (isHindi
                        ? "आपकी प्रतिक्रिया और रेटिंग सफलतापूर्वक दर्ज हो गई है। आपके सुझाव इस पवित्र मंच को और अधिक उत्कृष्ट बनाने में मदद करेंगे।"
                        : "આપનો પ્રતિસાદ અને રેટિંગ સફળતાપૂર્વક નોંધાઈ ગયો છે. આપના સૂચનો આ પવિત્ર પ્લેટફોર્મને વધુ ઉત્કૃષ્ટ બનાવવામાં મદદરૂપ થશે.")}
                </p>
                <button
                  type="button"
                  className="feedback-close-success-btn"
                  onClick={handleClose}
                >
                  {isHindi ? "बंद करें" : "બંધ કરો"}
                </button>
              </div>
            ) : (
              /* Feedback Form */
              <>
                <div className="feedback-modal-header">
                  <span className="feedback-header-badge">
                    <Sparkles size={12} />
                    {isHindi ? "आपकी राय" : "તમારો અભિપ્રાય"}
                  </span>
                  <h2 className="feedback-modal-title">
                    {isHindi ? "प्रतिक्रिया और स्टार रेटिंग" : "પ્રતિસાદ અને સ્ટાર રેટિંગ"}
                  </h2>
                  <p className="feedback-modal-subtitle">
                    {isHindi
                      ? "श्रीमद्भगवद्गीता वेबसाइट के बारे में अपना पवित्र अनुभव और सुझाव बताएं।"
                      : "શ્રીમદ્ ભગવદ્ ગીતા વેબસાઇટ વિશે આપનો પવિત્ર અનુભવ અને સૂચન જણાવો."}
                  </p>
                </div>

                {/* Community Score Banner */}
                {stats && stats.totalCount > 0 && (
                  <div className="feedback-community-score">
                    <div className="feedback-score-left">
                      <span className="feedback-score-number">
                        {stats.averageRating}
                      </span>
                      <div className="feedback-score-stars-inline">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={
                              i <= Math.round(stats.averageRating)
                                ? "#f59e0b"
                                : "none"
                            }
                            color="#f59e0b"
                          />
                        ))}
                      </div>
                    </div>
                    <span className="feedback-score-count">
                      {stats.totalCount} {isHindi ? "भक्तों द्वारा रेटिंग" : "ભક્તો દ્વારા રેટિંગ"}
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Star Rating Section */}
                  <div className={`feedback-rating-section ${isLocked ? "rating-locked-box" : ""}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                      <label className="feedback-section-label" style={{ margin: 0 }}>
                        {isLocked
                          ? (isHindi ? "आपकी 5-स्टार रेटिंग (लॉक है)" : "આપનું ૫-સ્ટાર રેટિંગ (લૉક થયેલ છે)")
                          : hasRated
                          ? (isHindi ? "आपकी वर्तमान रेटिंग" : "તમારું હાલનું રેટિંગ")
                          : (isHindi ? "वेबसाइट को स्टार रेटिंग दें" : "વેબસાઇટને સ્ટાર રેટિંગ આપો")}
                      </label>
                      {isLocked && <Lock size={14} color="#d97706" />}
                    </div>

                    <div className="feedback-stars-row">
                      {[1, 2, 3, 4, 5].map((starNum) => (
                        <button
                          key={starNum}
                          type="button"
                          className={`feedback-star-btn ${isLocked ? "disabled-star" : ""}`}
                          disabled={isLocked}
                          onMouseEnter={() => !isLocked && setHoverRating(starNum)}
                          onMouseLeave={() => !isLocked && setHoverRating(0)}
                          onClick={() => {
                            if (isLocked) return;
                            if (hasRated && existingRating > 0 && starNum < existingRating) {
                              return;
                            }
                            setRating(starNum);
                          }}
                          aria-label={`${starNum} ${isHindi ? "स्टार" : "સ્ટાર"}`}
                          title={isLocked ? (isHindi ? "5-स्टार रेटिंग लॉक है" : "૫-સ્ટાર રેટિંગ લૉક છે") : `${starNum} ${isHindi ? "स्टार" : "સ્ટાર"}`}
                        >
                          <Star
                            size={32}
                            strokeWidth={1.8}
                            className={`feedback-star-icon ${
                              starNum <= activeRating ? "filled" : "empty"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="feedback-rating-descriptor">
                      {isLocked ? (
                        <span style={{ color: "#d97706", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Lock size={13} /> {isHindi ? "आपकी 5-स्टार रेटिंग दर्ज हो गई है" : "આપનું ૫-સ્ટાર રેટિંગ નોંધાઈ ગયું છે"}
                        </span>
                      ) : (
                        ratingLabels[activeRating] || ""
                      )}
                    </div>

                    {!isLocked && !hasRated && (
                      <p className="feedback-rating-hint">
                        {isHindi
                          ? "1 खाते से केवल 1 बार रेटिंग मान्य होगी। 5-स्टार देने के बाद यह लॉक हो जाएगी।"
                          : "૧ એકાઉન્ટમાંથી ૧ જ વાર રેટિંગ ગણાશે. ૫-સ્ટાર આપ્યા બાદ તે લૉક થઈ જશે."}
                      </p>
                    )}
                  </div>

                  {/* Category Selector */}
                  <div className="feedback-category-group">
                    <label className="feedback-group-title">
                      {isHindi ? "प्रतिक्रिया का प्रकार" : "પ્રતિસાદનો પ્રકાર"}
                    </label>
                    <div className="feedback-categories-grid">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            className={`feedback-category-pill ${
                              isSelected ? "active" : ""
                            }`}
                            onClick={() => setCategory(cat.id)}
                          >
                            <Icon size={14} />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name and Email Inputs */}
                  <div className="feedback-input-row">
                    <div className="feedback-field">
                      <label className="feedback-field-label">
                        {isHindi ? "आपका नाम" : "આપનું નામ"}
                      </label>
                      <input
                        type="text"
                        className="feedback-text-input"
                        placeholder={isHindi ? "नाम" : "નામ"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={50}
                      />
                    </div>
                    <div className="feedback-field">
                      <label className="feedback-field-label">
                        {isHindi ? "ईमेल" : "ઈમેઇલ"}
                      </label>
                      <input
                        type="email"
                        className="feedback-text-input"
                        placeholder={isHindi ? "ईमेल (वैकल्पिक)" : "ઈમેઇલ (વૈકલ્પિક)"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={80}
                      />
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div className="feedback-textarea-wrap">
                    <label className="feedback-group-title">
                      {isHindi ? "आपका सुझाव या प्रतिक्रिया" : "આપનું સૂચન અથવા પ્રતિસાદ"}
                    </label>
                    <textarea
                      className="feedback-textarea"
                      placeholder={
                        isHindi
                          ? "कोई नया सुझाव, सुधार या अपना पवित्र अनुभव यहाँ लिखें..."
                          : "કોઈ નવું સૂચન, સુધારો કે આપનો પવિત્ર અનુભવ અહીં લખો..."
                      }
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={1000}
                      rows={4}
                      required
                    />
                    <span className="feedback-char-counter">
                      {message.length} / 1000 {isHindi ? "अक्षर" : "અક્ષરો"}
                    </span>
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <div className="feedback-error-banner">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="feedback-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={18}
                          className="feedback-spinning"
                        />
                        <span>
                          {isHindi ? "सबमिट हो रहा है..." : "સબમિટ થઈ રહ્યું છે..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>
                          {isLocked
                            ? (isHindi ? "सुझाव सबमिट करें" : "સૂચન સબમિટ કરો")
                            : hasRated
                            ? (isHindi ? "रेटिंग / सुझाव अपडेट करें" : "રેટિંગ / સૂચન અપડેટ કરો")
                            : (isHindi ? "रेटिंग और सुझाव सबमिट करें" : "રેટિંગ અને સૂચન સબમિટ કરો")}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
