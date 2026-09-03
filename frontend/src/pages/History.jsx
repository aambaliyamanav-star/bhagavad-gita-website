import { useNavigate } from "react-router-dom";

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
  // RENDER
  // =====================================================

  return (
    <main className="history-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="history-header">

        <div className="history-om">
          ॐ
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
            📝
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
            →
          </div>

        </button>

      </section>

    </main>
  );
}

export default History;