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
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import "./FeedbackModal.css";

const PROD_API_BASE = "https://bhagavad-gita-website.onrender.com";
const LOCAL_API_BASE = "http://localhost:5000";

const RATING_LABELS = {
  1: "સુધારવાની જરૂર છે",
  2: "સામાન્ય",
  3: "સારું",
  4: "ઘણું સરસ",
  5: "અદ્ભુત અને દિવ્ય અનુભવ",
};

const CATEGORIES = [
  { id: "suggestion", label: "સૂચન", icon: Lightbulb },
  { id: "feedback", label: "પ્રતિસાદ", icon: MessageSquare },
  { id: "appreciation", label: "પ્રશંસા", icon: Sparkles },
  { id: "bug", label: "સમસ્યા / બગ", icon: Bug },
];

export default function FeedbackModal() {
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
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

  // Listen to open-feedback-modal event
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
      setError("");
    };
    window.addEventListener("open-feedback-modal", handleOpenEvent);
    return () => {
      window.removeEventListener("open-feedback-modal", handleOpenEvent);
    };
  }, []);

  // Fetch feedback stats
  useEffect(() => {
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

    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!rating || rating < 1 || rating > 5) {
      setError("કૃપા કરીને ૧ થી ૫ વચ્ચે સ્ટાર રેટિંગ પસંદ કરો.");
      return;
    }

    if (!message.trim()) {
      setError("કૃપા કરીને તમારું સૂચન કે પ્રતિસાદ લખો.");
      return;
    }

    setSubmitting(true);

    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");

    const targets = isLocal
      ? [`${PROD_API_BASE}/api/feedback`, `${LOCAL_API_BASE}/api/feedback`]
      : [`${PROD_API_BASE}/api/feedback`];

    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = {
      rating,
      category,
      name: name.trim() || (user?.name || "અનામી સાધક"),
      email: email.trim() || (user?.email || ""),
      message: message.trim(),
    };

    let success = false;
    let errorMsg = "સર્વર સાથે જોડાણ થઈ શક્યું નથી. કૃપા કરીને ફરી પ્રયાસ કરો.";

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

  const activeRating = hoverRating || rating;

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        className="feedback-fab-trigger"
        onClick={() => {
          setIsOpen(true);
          setError("");
        }}
        aria-label="પ્રતિસાદ અને રેટિંગ આપો"
        title="વેબસાઇટ માટે તમારો પ્રતિસાદ અને રેટિંગ આપો"
      >
        <Star size={18} className="feedback-fab-star-icon" />
        <span className="feedback-fab-text">પ્રતિસાદ / રેટિંગ</span>
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
              aria-label="બંધ કરો"
            >
              <X size={18} />
            </button>

            {submitted ? (
              /* Success Confirmation */
              <div className="feedback-success-state">
                <div className="feedback-success-icon-box">
                  <CheckCircle2 size={42} strokeWidth={2.5} />
                </div>
                <h3 className="feedback-success-title">ધન્યવાદ!</h3>
                <p className="feedback-success-desc">
                  આપનો પ્રતિસાદ અને રેટિંગ સફળતાપૂર્વક નોંધાઈ ગયો છે. આપના અમૂલ્ય
                  સૂચનો આ પવિત્ર પ્લેટફોર્મને વધુ ઉત્કૃષ્ટ બનાવવામાં મદદરૂપ થશે.
                </p>
                <button
                  type="button"
                  className="feedback-close-success-btn"
                  onClick={handleClose}
                >
                  બંધ કરો
                </button>
              </div>
            ) : (
              /* Feedback Form */
              <>
                <div className="feedback-modal-header">
                  <span className="feedback-header-badge">
                    <Sparkles size={12} />
                    તમારો અભિપ્રાય
                  </span>
                  <h2 className="feedback-modal-title">
                    પ્રતિસાદ અને સ્ટાર રેટિંગ
                  </h2>
                  <p className="feedback-modal-subtitle">
                    શ્રીમદ્ ભગવદ્ ગીતા વેબસાઇટ વિશે આપનો પવિત્ર અનુભવ અને સૂચન
                    જણાવો.
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
                      {stats.totalCount} ભક્તો દ્વારા રેટિંગ
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Star Rating Section */}
                  <div className="feedback-rating-section">
                    <label className="feedback-section-label">
                      વેબસાઇટને સ્ટાર રેટિંગ આપો
                    </label>
                    <div className="feedback-stars-row">
                      {[1, 2, 3, 4, 5].map((starNum) => (
                        <button
                          key={starNum}
                          type="button"
                          className="feedback-star-btn"
                          onMouseEnter={() => setHoverRating(starNum)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starNum)}
                          aria-label={`${starNum} સ્ટાર`}
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
                      {RATING_LABELS[activeRating] || ""}
                    </div>
                  </div>

                  {/* Category Selector */}
                  <div className="feedback-category-group">
                    <label className="feedback-group-title">
                      પ્રતિસાદનો પ્રકાર
                    </label>
                    <div className="feedback-categories-grid">
                      {CATEGORIES.map((cat) => {
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
                      <label className="feedback-field-label">આપનું નામ</label>
                      <input
                        type="text"
                        className="feedback-text-input"
                        placeholder="નામ (વૈકલ્પિક)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={50}
                      />
                    </div>
                    <div className="feedback-field">
                      <label className="feedback-field-label">ઈમેઇલ</label>
                      <input
                        type="email"
                        className="feedback-text-input"
                        placeholder="ઈમેઇલ (વૈકલ્પિક)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={80}
                      />
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div className="feedback-textarea-wrap">
                    <label className="feedback-group-title">
                      આપનું સૂચન અથવા પ્રતિસાદ
                    </label>
                    <textarea
                      className="feedback-textarea"
                      placeholder="વેબસાઇટમાં શું ગમ્યું અથવા શું નવું ઉમેરવું જોઈએ તે અહીં લખો..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={1000}
                      rows={4}
                      required
                    />
                    <span className="feedback-char-counter">
                      {message.length} / 1000 અક્ષરો
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
                        <span>સબમિટ થઈ રહ્યું છે...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>પ્રતિસાદ સબમિટ કરો</span>
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
