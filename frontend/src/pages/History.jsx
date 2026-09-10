import { useNavigate } from "react-router-dom";
import { History as HistoryIcon, ClipboardList, ChevronRight, BookMarked, Award } from "lucide-react";

import "./History.css";

function History() {
  const navigate = useNavigate();

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
          History
        </h1>

        <p>
          તમારી પ્રવૃત્તિઓનો ઇતિહાસ
        </p>

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
              Quiz History
            </h2>

            <p>
              તમે અત્યાર સુધી આપેલી તમામ Quiz
              અને તેના Results જુઓ.
            </p>

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
              ક્વિઝ સિદ્ધિઓ (Achievements)
            </h2>

            <p>
              તમારા ૧૩ ક્વિઝ બેજ, અર્જુન દ્રષ્ટિ જેવા મલ્ટિપ્લાયર્સ
              અને દિવ્ય માઈલસ્ટોન્સ જુઓ.
            </p>

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
              વાંચન પ્રગતિ
            </h2>

            <p>
              તમારા ૭૦૦ શ્લોકોનું અધ્યયન, દૈનિક વાંચન સ્ટ્રીક
              અને આધ્યાત્મિક સિદ્ધિઓ જુઓ.
            </p>

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