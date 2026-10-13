import { getValidToken, handleAuth401 } from "../utils/authHelper.js";
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Flame,
  Award,
  Sparkles,
  BookOpen,
  Shield,
  Compass,
  Brain,
  Heart,
  Star,
  Crown,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Search,
  ChevronRight,
  Info,
  X,
  RefreshCw,
  Clock,
  BookMarked,
  LogIn,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import {
  CHAPTER_METADATA,
  SPIRITUAL_BADGES,
  TOTAL_GITA_SHLOKAS,
  getCombinedReadingProgress,
  countChapterRead,
  syncLocalToCloud,
} from "../utils/readingTracker.js";
import "./ReadingTracker.css";

const BADGE_ICONS = {
  Sparkles: Sparkles,
  Flame: Flame,
  Zap: Zap,
  Shield: Shield,
  Compass: Compass,
  Brain: Brain,
  Heart: Heart,
  Award: Award,
  Star: Star,
  Crown: Crown,
};

function ReadingTracker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isHindi, CHAPTER_NAMES } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [progressData, setProgressData] = useState({
    totalShlokas: TOTAL_GITA_SHLOKAS,
    readCount: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: null,
    chapterBreakdown: {},
    readShlokas: [],
    unlockedBadges: [],
  });
  const [chapterFilter, setChapterFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBadge, setSelectedBadge] = useState(null);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const token = getValidToken();
      const data = await getCombinedReadingProgress(token);
      if (data) setProgressData(data);
    } catch (err) {
      console.error("Error loading reading progress:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [user]);

  useEffect(() => {
    if (selectedBadge) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [selectedBadge]);

  const handleSyncCloud = async () => {
    const token = getValidToken();
    if (!token) {
      navigate("/login", {
        state: {
          from: "/reading-tracker",
          message: isHindi ? "Cloud Sync के लिए Login आवश्यक है।" : "Cloud Sync માટે Login કરવું જરૂરી છે.",
        },
      });
      return;
    }
    try {
      setSyncing(true);
      setSyncMessage("");
      setSyncSuccess(false);
      const res = await syncLocalToCloud(token);
      if (res.success) {
        await loadProgress();
        setSyncSuccess(true);
        setSyncMessage("ડેટા સફળતાપૂર્વક Cloud સાથે Sync થઈ ગયો.");
      } else {
        setSyncMessage("Sync failed. ફરી પ્રયત્ન કરો.");
      }
    } catch (err) {
      setSyncMessage("Sync error: " + (err.message || "Unknown error"));
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(""), 5000);
    }
  };

  const readCount = progressData.readCount || (progressData.readShlokas || []).length;
  const overallPercent = Math.min(100, Math.round((readCount / TOTAL_GITA_SHLOKAS) * 1000) / 10);

  const unlockedBadgeIds = useMemo(() => {
    return new Set(
      (progressData.unlockedBadges || []).map((b) =>
        typeof b === "string" ? b : b.badgeId
      )
    );
  }, [progressData.unlockedBadges]);

  const unlockedBadgesCount = unlockedBadgeIds.size;

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const isReadToday = progressData.lastReadDate === todayStr;

  const lastReadInfo = useMemo(() => {
    const list = progressData.readShlokas || [];
    if (list.length === 0) return null;
    return list[list.length - 1];
  }, [progressData.readShlokas]);

  const filteredChapters = useMemo(() => {
    return CHAPTER_METADATA.filter((item) => {
      const breakdown = progressData.chapterBreakdown?.[item.chapter];
      const read = breakdown
        ? breakdown.read
        : countChapterRead(progressData.readShlokas, item.chapter);
      const isCompleted = read >= item.shlokas;
      const isInProgress = read > 0 && read < item.shlokas;
      const isUnread = read === 0;

      if (chapterFilter === "completed" && !isCompleted) return false;
      if (chapterFilter === "in_progress" && !isInProgress) return false;
      if (chapterFilter === "unread" && !isUnread) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          String(item.chapter).includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.englishName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [progressData, chapterFilter, searchQuery]);

  const circumference = 2 * Math.PI * 50;

  return (
    <div className="rt-page">
      <div className="rt-container">

        {/* ============================================================
            PAGE HEADER
        ============================================================ */}
        <div className="rt-header">
          <div className="rt-header-left">
            <div className="rt-header-icon-wrap">
              <BookMarked size={22} />
            </div>
            <div>
              <h1 className="rt-page-title">{isHindi ? "पठन प्रगति" : "વાંચન પ્રગતિ"}</h1>
            </div>
          </div>

          <div className="rt-header-right">
            {user ? (
              <button
                type="button"
                className="rt-sync-btn"
                onClick={handleSyncCloud}
                disabled={syncing}
              >
                <RefreshCw size={15} className={syncing ? "rt-spin" : ""} />
                {syncing ? (isHindi ? "सिंक हो रहा है..." : "Syncing...") : (isHindi ? "क्लाउड सिंक" : "Cloud Sync")}
              </button>
            ) : (
              <button
                type="button"
                className="rt-login-hint-btn"
                onClick={() => navigate("/login")}
              >
                <LogIn size={15} />
                {isHindi ? "सुरक्षित करने हेतु Login करें" : "Login to Save"}
              </button>
            )}
          </div>
        </div>

        {syncMessage && (
          <div className={`rt-sync-toast ${syncSuccess ? "rt-toast-success" : "rt-toast-error"}`}>
            {syncSuccess ? <CheckCircle2 size={15} /> : <Info size={15} />}
            <span>{syncMessage}</span>
          </div>
        )}

        {/* ============================================================
            STATS ROW — 4 CARDS
        ============================================================ */}
        <div className="rt-stats-grid">

          {/* Card 1: Overall Progress */}
          <div className="rt-stat-card">
            <div className="rt-ring-wrap">
              <svg className="rt-ring-svg" viewBox="0 0 120 120">
                <circle className="rt-ring-track" strokeWidth="9" fill="transparent" r="50" cx="60" cy="60" />
                <circle
                  className="rt-ring-fill"
                  strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - overallPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  r="50"
                  cx="60"
                  cy="60"
                />
              </svg>
              <div className="rt-ring-inner">
                <span className="rt-ring-pct">{overallPercent}%</span>
              </div>
            </div>
            <div className="rt-stat-body">
              <span className="rt-stat-label">{isHindi ? "सम्पूर्ण गीता प्रगति" : "સમગ્ર ગીતા પ્રગતિ"}</span>
              <div className="rt-stat-value">{readCount} <span className="rt-stat-of">/ {TOTAL_GITA_SHLOKAS}</span></div>
              <p className="rt-stat-sub">{isHindi ? "श्लोक पढ़े गए" : "શ્લોક વંચાયા"}</p>
            </div>
          </div>

          {/* Card 2: Streak */}
          <div className="rt-stat-card">
            <div className="rt-stat-icon-box rt-icon-blue">
              <Flame size={26} />
            </div>
            <div className="rt-stat-body">
              <span className="rt-stat-label">{isHindi ? "दैनिक पठन स्ट्रीक" : "દૈનિક વાંચન સ્ટ્રીક"}</span>
              <div className="rt-stat-value">{progressData.currentStreak || 0} <span className="rt-stat-of">{isHindi ? "दिन" : "દિવસ"}</span></div>
              <div className="rt-streak-meta">
                <span className="rt-best-streak">
                  <Trophy size={12} /> {isHindi ? "सर्वोच्च" : "સર્વોચ્ચ"}: {progressData.longestStreak || 0} {isHindi ? "दिन" : "દિ."}
                </span>
                <span className={`rt-today-pill ${isReadToday ? "rt-pill-done" : "rt-pill-pending"}`}>
                  {isReadToday
                    ? <><CheckCircle2 size={12} /> {isHindi ? "आज पढ़ा गया" : "આજે વંચાયું"}</>
                    : <><Clock size={12} /> {isHindi ? "आज का बाकी" : "આજનું બાકી"}</>
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Badges */}
          <div className="rt-stat-card">
            <div className="rt-stat-icon-box rt-icon-blue">
              <Award size={26} />
            </div>
            <div className="rt-stat-body">
              <span className="rt-stat-label">{isHindi ? "अर्जित बैज" : "સિદ્ધ બેજ"}</span>
              <div className="rt-stat-value">{unlockedBadgesCount} <span className="rt-stat-of">/ {SPIRITUAL_BADGES.length}</span></div>
              <div className="rt-mini-bar-track">
                <div className="rt-mini-bar-fill" style={{ width: `${(unlockedBadgesCount / SPIRITUAL_BADGES.length) * 100}%` }} />
              </div>
              <p className="rt-stat-sub">
                {unlockedBadgesCount === SPIRITUAL_BADGES.length
                  ? (isHindi ? "सभी बैज प्राप्त!" : "તમામ બેજ પ્રાપ્ત!")
                  : (isHindi ? "और पढ़ें, बैज अनलॉक करें" : "વધુ વાંચો, બેજ અનલોક કરો")}
              </p>
            </div>
          </div>

          {/* Card 4: Continue Reading */}
          <div className="rt-stat-card rt-action-card">
            <div className="rt-stat-icon-box rt-icon-blue">
              <BookOpen size={26} />
            </div>
            <div className="rt-stat-body">
              <span className="rt-stat-label">{isHindi ? "आगे पढ़ें" : "આગળ વાંચો"}</span>
              {lastReadInfo ? (
                <>
                  <div className="rt-continue-chapter">
                    {isHindi ? "अ." : "અ."} {lastReadInfo.chapterNumber} &nbsp;•&nbsp; {isHindi ? "श्लोक" : "શ્લોક"} {lastReadInfo.shlokNumber}
                  </div>
                  <p className="rt-stat-sub">{isHindi ? "पिछला यहाँ तक" : "છેલ્લે અહીં સુધી"}</p>
                  <button
                    type="button"
                    className="rt-continue-btn"
                    onClick={() => navigate(`/chapter/${lastReadInfo.chapterNumber}?shloka=${lastReadInfo.shlokNumber}`)}
                  >
                    <span>{isHindi ? "जारी रखें" : "ચાલુ રાખો"}</span>
                    <ArrowRight size={15} />
                  </button>
                </>
              ) : (
                <>
                  <div className="rt-continue-chapter">{isHindi ? "प्रथम अध्याय" : "પ્રથમ અધ્યાય"}</div>
                  <p className="rt-stat-sub">{isHindi ? "गीता पठन शुरू करें" : "ગીતા વાંચના ઉઘડો"}</p>
                  <button
                    type="button"
                    className="rt-continue-btn"
                    onClick={() => navigate("/chapter/1?shloka=1")}
                  >
                    <span>{isHindi ? "शुरू करें" : "શરૂ કરો"}</span>
                    <ArrowRight size={15} />
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* ============================================================
            SPIRITUAL BADGES SECTION
        ============================================================ */}
        {/* ============================================================
            SPIRITUAL BADGES SECTION
        ============================================================ */}
        <div className="rt-section">
          <div className="rt-section-head">
            <div className="rt-section-title-row">
              <Award size={20} className="rt-section-icon rt-icon-blue-text" />
              <div>
                <h2 className="rt-section-title">{isHindi ? "आध्यात्मिक उपलब्धियां" : "આધ્યાત્મિક સિદ્ધિઓ"}</h2>
                <p className="rt-section-desc">
                  {isHindi
                    ? "स्ट्रीक, अध्ययन और भक्ति पर आधारित १० उपलब्धियां"
                    : "સ્ટ્રીક, અધ્યયન અને ભક્તિ આધારિત ૧૦ ઉપલબ્ધિઓ"}
                </p>
              </div>
            </div>
            <div className="rt-badge-count-chip">
              <Award size={13} />
              {unlockedBadgesCount} / {SPIRITUAL_BADGES.length} {isHindi ? "अनलॉक" : "અનલોક"}
            </div>
          </div>

          <div className="rt-badges-grid">
            {SPIRITUAL_BADGES.map((badge) => {
              const isUnlocked = unlockedBadgeIds.has(badge.id);
              const IconComp = BADGE_ICONS[badge.icon] || Award;
              return (
                <div
                  key={badge.id}
                  className={`rt-badge-card ${isUnlocked ? "rt-badge-unlocked" : "rt-badge-locked"}`}
                  onClick={() => setSelectedBadge({ ...badge, isUnlocked })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedBadge({ ...badge, isUnlocked });
                  }}
                >
                  <div
                    className="rt-badge-icon"
                    style={{ background: isUnlocked ? badge.gradient : undefined }}
                  >
                    {isUnlocked
                      ? <IconComp size={24} className="rt-badge-icon-svg" />
                      : <Lock size={20} className="rt-badge-lock-svg" />
                    }
                  </div>
                  <div className="rt-badge-info">
                    <h4 className="rt-badge-name">{badge.title}</h4>
                    {isUnlocked
                      ? <span className="rt-badge-tag rt-tag-unlocked"><CheckCircle2 size={12} /> {isHindi ? "सिद्ध" : "સિદ્ધ"}</span>
                      : <span className="rt-badge-tag rt-tag-locked"><Lock size={12} /> {badge.criteriaText}</span>
                    }
                  </div>
                  {isUnlocked && <div className="rt-badge-shimmer" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            18 CHAPTERS PROGRESS SECTION
        ============================================================ */}
        <div className="rt-section">
          <div className="rt-section-head rt-section-head-wrap">
            <div className="rt-section-title-row">
              <BookOpen size={20} className="rt-section-icon rt-icon-blue-text" />
              <div>
                <h2 className="rt-section-title">
                  {isHindi ? "१८ अध्याय – प्रगति" : "૧૮ અધ્યાય – પ્રગતિ"}
                </h2>
              </div>
            </div>

            <div className="rt-filter-tabs">
              {[
                { key: "all", label: isHindi ? "सभी" : "બધા" },
                { key: "completed", label: isHindi ? "पूर्ण" : "સંપૂર્ણ" },
                { key: "in_progress", label: isHindi ? "प्रगति में" : "ચાલુ" },
                { key: "unread", label: isHindi ? "शेष" : "બાકી" },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`rt-filter-btn ${chapterFilter === f.key ? "rt-filter-active" : ""}`}
                  onClick={() => setChapterFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rt-search-bar">
            <Search size={16} className="rt-search-icon" />
            <input
              type="text"
              placeholder={isHindi ? "नाम या संख्या (उदा. 2, Karma Yoga)..." : "નામ અથવા નંબર (દા.ત. 2, Karma Yoga)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="rt-search-clear" onClick={() => setSearchQuery("")}>
                <X size={15} />
              </button>
            )}
          </div>

          {filteredChapters.length === 0 ? (
            <div className="rt-empty">
              <Info size={26} />
              <p>{isHindi ? "इस फ़िल्टर के लिए कोई अध्याय नहीं है।" : "આ ફિલ્ટર માટે કોઈ અધ્યાય નથી."}</p>
            </div>
          ) : (
            <div className="rt-chapters-grid">
              {filteredChapters.map((item) => {
                const breakdown = progressData.chapterBreakdown?.[item.chapter];
                const read = breakdown
                  ? breakdown.read
                  : countChapterRead(progressData.readShlokas, item.chapter);
                const percent = Math.min(100, Math.round((read / item.shlokas) * 100));
                const isCompleted = read >= item.shlokas;
                const isInProgress = read > 0 && !isCompleted;
                const chapterTitle = isHindi
                  ? (CHAPTER_NAMES?.[item.chapter]?.nameHi || CHAPTER_NAMES?.[item.chapter]?.hi || item.name)
                  : (CHAPTER_NAMES?.[item.chapter]?.name || CHAPTER_NAMES?.[item.chapter]?.gu || item.name);

                return (
                  <div
                    key={item.chapter}
                    className={`rt-chapter-card ${isCompleted ? "rt-ch-done" : isInProgress ? "rt-ch-progress" : "rt-ch-unread"}`}
                  >
                    <div className="rt-ch-top">
                      <div className={`rt-ch-num ${isCompleted ? "rt-ch-num-done" : ""}`}>
                        {isCompleted ? <CheckCircle2 size={16} /> : item.chapter}
                      </div>
                      <div className="rt-ch-names">
                        <h4 className="rt-ch-guj" title={chapterTitle}>{chapterTitle}</h4>
                      </div>
                      <div className={`rt-ch-pill ${isCompleted ? "rt-pill-done-ch" : isInProgress ? "rt-pill-prog-ch" : "rt-pill-unread-ch"}`}>
                        {isCompleted ? (isHindi ? "पूर्ण" : "સંપૂર્ણ") : isInProgress ? `${percent}%` : (isHindi ? "शेष" : "બાકી")}
                      </div>
                    </div>

                    <div className="rt-ch-middle">
                      <div className="rt-ch-info-row">
                        <span className="rt-ch-count"><strong>{read}</strong> / {item.shlokas} {isHindi ? "श्लोक" : "શ્લોક"}</span>
                        <span className="rt-ch-pct">{percent}%</span>
                      </div>
                      <div className="rt-ch-track">
                        <div
                          className={`rt-ch-bar ${isCompleted ? "rt-bar-done" : "rt-bar-progress"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rt-ch-btn"
                      onClick={() => navigate(`/chapter/${item.chapter}`)}
                    >
                      <span>{isCompleted ? (isHindi ? "पुनरावृत्ति" : "પુનરાવર્તન") : isInProgress ? (isHindi ? "जारी रखें" : "ચાલુ રાખો") : (isHindi ? "पढ़ें" : "વાંચો")}</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ============================================================
          BADGE MODAL (PORTALED DIRECTLY TO BODY)
      ============================================================ */}
      {selectedBadge && typeof document !== "undefined" && createPortal(
        <div className="rt-modal-overlay" onClick={() => setSelectedBadge(null)}>
          <div className="rt-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="rt-modal-close" onClick={() => setSelectedBadge(null)}>
              <X size={18} />
            </button>
            <div
              className="rt-modal-icon"
              style={{ background: selectedBadge.isUnlocked ? selectedBadge.gradient : undefined }}
            >
              {selectedBadge.isUnlocked
                ? React.createElement(BADGE_ICONS[selectedBadge.icon] || Award, { size: 44, className: "rt-modal-icon-svg" })
                : <Lock size={40} className="rt-modal-lock-svg" />
              }
            </div>
            <h3 className="rt-modal-title">{selectedBadge.title}</h3>
            <div className="rt-modal-desc">{selectedBadge.description}</div>
            <div className="rt-modal-criteria">
              <span className="rt-criteria-label">{isHindi ? "प्राप्ति शर्त" : "પ્રાપ્તિ શરત"}</span>
              <span className="rt-criteria-val">{selectedBadge.criteriaText}</span>
            </div>
            <div className={`rt-modal-status ${selectedBadge.isUnlocked ? "rt-modal-status-done" : "rt-modal-status-locked"}`}>
              {selectedBadge.isUnlocked
                ? <><CheckCircle2 size={16} /> {isHindi ? "सिद्ध — यह उपलब्धि प्राप्त हुई है" : "સિદ્ધ — આ ઉપલબ્ધિ પ્રાપ્ત થઈ છે"}</>
                : <><Lock size={15} /> {isHindi ? "अभी अनलॉक नहीं हुआ" : "હજુ અનલોક થઈ નથી"}</>
              }
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ReadingTracker;
