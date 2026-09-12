import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Target,
  Zap,
  ShieldCheck,
  Flame,
  Sunrise,
  TrendingUp,
  Footprints,
  BookOpenCheck,
  Trophy,
  Compass,
  Crown,
  Sparkles,
  Swords,
  CalendarCheck,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Lock,
  CheckCircle2,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import {
  API_QUIZ_URL,
  calculateQuizAchievements,
} from "../utils/quizAchievements";
import "./QuizAchievements.css";

// Helper: Dynamically render Lucide Icon by name
const renderBadgeIcon = (iconName, size = 20) => {
  switch (iconName) {
    case "Target":
      return <Target size={size} />;
    case "Zap":
      return <Zap size={size} />;
    case "ShieldCheck":
      return <ShieldCheck size={size} />;
    case "Flame":
      return <Flame size={size} />;
    case "Award":
      return <Award size={size} />;
    case "Sunrise":
      return <Sunrise size={size} />;
    case "TrendingUp":
      return <TrendingUp size={size} />;
    case "Swords":
      return <Swords size={size} />;
    case "CalendarCheck":
      return <CalendarCheck size={size} />;
    case "Footprints":
      return <Footprints size={size} />;
    case "BookOpenCheck":
      return <BookOpenCheck size={size} />;
    case "Trophy":
      return <Trophy size={size} />;
    case "Compass":
      return <Compass size={size} />;
    case "Crown":
      return <Crown size={size} />;
    case "Sparkles":
      return <Sparkles size={size} />;
    default:
      return <Award size={size} />;
  }
};

export default function QuizAchievements() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'multiplier' | 'milestone' | 'unlocked'
  const [achievementData, setAchievementData] = useState({
    badges: [],
    stats: {
      totalBadgesUnlocked: 0,
      totalBadgesCount: 13,
      totalMultipliersEarned: 0,
      totalQuizzes: 0,
      totalCorrect: 0,
      uniqueChaptersPassed: 0,
    },
  });

  // Fetch user's past quiz results
  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_QUIZ_URL}/results`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("ક્વિઝ હિસ્ટ્રી લોડ કરવામાં સમસ્યા આવી.");
      }

      const data = await response.json();
      const results = Array.isArray(data.results) ? data.results : [];

      // Calculate achievements using the gamification engine
      const calculated = calculateQuizAchievements(results);
      setAchievementData(calculated);
    } catch (err) {
      console.error("Fetch Quiz Achievements Error:", err);
      setError(err.message || "સિદ્ધિઓ લોડ થઈ શકી નથી.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const { badges, stats } = achievementData;

  // Filter badges according to active tab
  const filteredBadges = badges.filter((b) => {
    if (activeTab === "multiplier") return b.type === "multiplier";
    if (activeTab === "milestone") return b.type === "milestone";
    if (activeTab === "unlocked") return b.unlocked;
    return true; // 'all'
  });

  const multiplierCount = badges.filter((b) => b.type === "multiplier").length;
  const milestoneCount = badges.filter((b) => b.type === "milestone").length;

  return (
    <main className="quiz-achievements-page">
      <div className="qa-container">
        {/* Navigation & Header */}
        <header className="qa-header">
          <button
            type="button"
            className="qa-back-btn"
            onClick={() => navigate("/quiz-results")}
          >
            <ArrowLeft size={18} />
            <span>Quiz History</span>
          </button>

          <div className="qa-header-title-box">
            <span className="qa-sacred-subtitle">॥ सिद्धिर्भवति कर्मजा ॥</span>
            <h1 className="qa-main-title">ક્વિઝ સિદ્ધિઓ અને સન્માન</h1>
          </div>
        </header>

        {/* Global Statistics Ribbon */}
        <section className="qa-stats-grid">
          <div className="qa-stat-card">
            <div className="qa-stat-icon-wrapper">
              <Trophy size={24} />
            </div>
            <div className="qa-stat-details">
              <span className="qa-stat-value">
                {stats.totalBadgesUnlocked} / {stats.totalBadgesCount}
              </span>
              <span className="qa-stat-label">કુલ અનલૉક બેજ</span>
            </div>
          </div>

          <div className="qa-stat-card">
            <div className="qa-stat-icon-wrapper">
              <TrendingUp size={24} />
            </div>
            <div className="qa-stat-details">
              <span className="qa-stat-value">×{stats.totalMultipliersEarned}</span>
              <span className="qa-stat-label">મલ્ટિપ્લાયર કાઉન્ટ</span>
            </div>
          </div>

          <div className="qa-stat-card">
            <div className="qa-stat-icon-wrapper">
              <BarChart3 size={24} />
            </div>
            <div className="qa-stat-details">
              <span className="qa-stat-value">{stats.totalQuizzes}</span>
              <span className="qa-stat-label">કુલ આપેલ ક્વિઝ</span>
            </div>
          </div>

          <div className="qa-stat-card">
            <div className="qa-stat-icon-wrapper">
              <CheckCircle2 size={24} />
            </div>
            <div className="qa-stat-details">
              <span className="qa-stat-value">{stats.totalCorrect}</span>
              <span className="qa-stat-label">કુલ સાચા ઉત્તરો</span>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <nav className="qa-tabs-bar">
          <button
            type="button"
            className={`qa-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            તમામ સિદ્ધિઓ ({badges.length})
          </button>
          <button
            type="button"
            className={`qa-tab-btn ${activeTab === "multiplier" ? "active" : ""}`}
            onClick={() => setActiveTab("multiplier")}
          >
            કાઉન્ટ વાળા બેજ ({multiplierCount})
          </button>
          <button
            type="button"
            className={`qa-tab-btn ${activeTab === "milestone" ? "active" : ""}`}
            onClick={() => setActiveTab("milestone")}
          >
            માઈલસ્ટોન સિદ્ધિઓ ({milestoneCount})
          </button>
          <button
            type="button"
            className={`qa-tab-btn ${activeTab === "unlocked" ? "active" : ""}`}
            onClick={() => setActiveTab("unlocked")}
          >
            પ્રાપ્ત કરેલ ({stats.totalBadgesUnlocked})
          </button>
        </nav>

        {/* Loading State */}
        {loading && (
          <div className="qa-loading-state">
            <Loader2 className="qa-spinner" size={36} />
            <p>સિદ્ધિઓ લોડ થઈ રહી છે...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="qa-error-state">
            <HelpCircle size={32} />
            <p>{error}</p>
            <button
              type="button"
              className="qa-retry-btn"
              onClick={fetchAchievements}
            >
              <RefreshCw size={16} /> ફરી પ્રયાસ કરો
            </button>
          </div>
        )}

        {/* Badges Cards Grid */}
        {!loading && !error && (
          <section className="qa-badges-grid">
            {filteredBadges.map((badge) => {
              const isMultiplier = badge.type === "multiplier";
              const isUnlocked = badge.unlocked;

              return (
                <div
                  key={badge.id}
                  className={`qa-badge-card ${
                    isUnlocked ? "unlocked" : "locked"
                  } ${isMultiplier ? "type-multiplier" : "type-milestone"}`}
                >
                  {/* Top Badge Action & Tag */}
                  <div className="qa-badge-top-row">
                    <div className="qa-badge-type-tag">
                      {isMultiplier ? "કાઉન્ટ બેજ" : "માઈલસ્ટોન"}
                    </div>

                    {isMultiplier ? (
                      <div
                        className={`qa-multiplier-pill ${
                          isUnlocked ? "active" : "inactive"
                        }`}
                        title={
                          isUnlocked
                            ? `આ બેજ ${badge.count} વખત મેળવ્યો છે`
                            : "હજી સુધી પ્રાપ્ત થયું નથી"
                        }
                      >
                        {isUnlocked ? `×${badge.count}` : "×૦"}
                      </div>
                    ) : (
                      <div
                        className={`qa-status-pill ${
                          isUnlocked ? "completed" : "in-progress"
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>પૂર્ણ</span>
                          </>
                        ) : (
                          <>
                            <Lock size={12} />
                            <span>પ્રગતિમાં</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Badge Icon */}
                  <div className="qa-badge-icon-holder">
                    <div
                      className={`qa-badge-icon-disc ${isUnlocked ? "unlocked" : "locked"}`}
                      style={{
                        background: isUnlocked
                          ? badge.gradient
                          : undefined,
                      }}
                    >
                      {isUnlocked ? (
                        renderBadgeIcon(badge.icon, 22)
                      ) : (
                        <Lock size={22} strokeWidth={2.4} className="qa-locked-disc-icon" />
                      )}
                    </div>
                  </div>

                  {/* Badge Info - 100% Clear & Unblocked */}
                  <div className="qa-badge-info">
                    <h3 className="qa-badge-title">{badge.title}</h3>
                    <p className="qa-badge-description">
                      {badge.description}
                    </p>
                  </div>

                  {/* Footer: Multiplier Count Status OR Milestone Progress Bar */}
                  <div className="qa-badge-footer">
                    {isMultiplier ? (
                      <div className="qa-multiplier-footer">
                        <span className="qa-criteria-text">
                          {badge.conditionText}
                        </span>
                        <span className="qa-count-summary">
                          {isUnlocked ? (
                            <strong>કુલ {badge.count} વખત પ્રાપ્ત</strong>
                          ) : (
                            <span className="qa-locked-text">
                              <Lock size={12} /> અનલોક કરવા ક્વિઝ રમો
                            </span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="qa-milestone-footer">
                        <div className="qa-progress-info">
                          <span className="qa-criteria-text">
                            {badge.conditionText}
                          </span>
                          <span className="qa-progress-numbers">
                            {badge.currentProgress} / {badge.target}{" "}
                            {badge.targetUnit}
                          </span>
                        </div>
                        <div className="qa-progress-track">
                          <div
                            className="qa-progress-fill"
                            style={{
                              width: `${badge.progressPercentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

