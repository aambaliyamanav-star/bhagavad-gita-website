import { useNavigate } from "react-router-dom";
import { History as HistoryIcon, ClipboardList, ChevronRight, BookMarked, Award } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

import "./History.css";

function History() {
  const navigate = useNavigate();
  const { isHindi, isEnglish, isGujarati, txt } = useLanguage();

  // =====================================================
  // QUIZ HISTORY
  // =====================================================

  const openQuizHistory = () => {
    navigate("/quiz-results");
  };

  // =====================================================
  // READING TRACKER
  // =====================================================

  const openReadingTracker = () => {
    navigate("/reading-tracker");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="history-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="history-header">

        <div className="history-om">
          <HistoryIcon />
        </div>

        <p className="history-sacred-title">
          ॥ श्रीमद्भगवद्गीता ॥
        </p>

        <h1>
          {txt("ઇતિહાસ", "इतिहास", "History")}
        </h1>
      </section>


      {/* =================================================
          HISTORY OPTIONS
      ================================================= */}

      <section className="history-options">

        {/* =================================================
            QUIZ HISTORY
        ================================================= */}

        <button
          type="button"
          className="history-option-card quiz-history-card"
          onClick={openQuizHistory}
        >

          <div className="history-option-icon">
            <ClipboardList />
          </div>

          <div className="history-option-content">

            <h2>
              {txt("ક્વિઝ ઇતિહાસ", "क्विज़ इतिहास", "Quiz History")}
            </h2>

          </div>

          <div className="history-option-arrow">
            <ChevronRight />
          </div>

        </button>
        {/* =================================================
            QUIZ ACHIEVEMENTS (ક્વિઝ સિદ્ધિઓ)
        ================================================= */}

        <button
          type="button"
          className="history-option-card achievements-history-card"
          onClick={() => navigate("/quiz-achievements")}
        >

          <div className="history-option-icon">
            <Award />
          </div>

          <div className="history-option-content">

            <h2>
              {txt("ક્વિઝ સિદ્ધિઓ", "क्विज़ उपलब्धियां", "Quiz Achievements")}
            </h2>

          </div>

          <div className="history-option-arrow">
            <ChevronRight />
          </div>

        </button>

        {/* =================================================
            READING TRACKER (વાંચન પ્રગતિ)
        ================================================= */}

        <button
          type="button"
          className="history-option-card reading-history-card"
          onClick={openReadingTracker}
        >

          <div className="history-option-icon">
            <BookMarked />
          </div>

          <div className="history-option-content">

            <h2>
              {txt("વાંચન પ્રગતિ", "पठन प्रगति", "Reading Progress")}
            </h2>

          </div>

          <div className="history-option-arrow">
            <ChevronRight />
          </div>

        </button>

      </section>

    </main>
  );
}

export default History;