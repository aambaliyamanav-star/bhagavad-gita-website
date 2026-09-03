import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./QuizResult.css";

const API_URL = "http://localhost:5000/api/quiz";

function QuizResult() {
  // =====================================================
  // STATE
  // =====================================================

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Which quiz result is currently expanded
  const [expandedResult, setExpandedResult] = useState(null);

  const navigate = useNavigate();

  // =====================================================
  // CHAPTER NAMES
  // =====================================================

  const chapterNames = {
    1: "અર્જુનવિષાદ યોગ",
    2: "સાંખ્ય યોગ",
    3: "કર્મ યોગ",
    4: "જ્ઞાનકર્મસંન્યાસ યોગ",
    5: "કર્મસંન્યાસ યોગ",
    6: "આત્મસંયમ યોગ",
    7: "જ્ઞાનવિજ્ઞાન યોગ",
    8: "અક્ષરબ્રહ્મ યોગ",
    9: "રાજવિદ્યા રાજગુહ્ય યોગ",
    10: "વિભૂતિ યોગ",
    11: "વિશ્વરૂપદર્શન યોગ",
    12: "ભક્તિ યોગ",
    13: "ક્ષેત્રક્ષેત્રજ્ઞ વિભાગ યોગ",
    14: "ગુણત્રયવિભાગ યોગ",
    15: "પુરુષોત્તમ યોગ",
    16: "દૈવાસુરસંપદ્વિભાગ યોગ",
    17: "શ્રદ્ધાત્રયવિભાગ યોગ",
    18: "મોક્ષસંન્યાસ યોગ",
  };

  // =====================================================
  // FETCH RESULTS
  // =====================================================

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        // -------------------------------------------------
        // LOGIN CHECK
        // -------------------------------------------------

        if (!token) {
          navigate("/login");
          return;
        }

        const resultURL = `${API_URL}/results`;

        console.log(
          "📡 Fetching Quiz Results:",
          resultURL
        );

        // -------------------------------------------------
        // API REQUEST
        // -------------------------------------------------

        const response = await fetch(resultURL, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        let data = {};

        try {
          data = await response.json();
        } catch (jsonError) {
          console.error(
            "❌ JSON Parse Error:",
            jsonError
          );
        }

        console.log(
          "📊 Quiz Result Response:",
          data
        );

        // -------------------------------------------------
        // SERVER ERROR
        // -------------------------------------------------

        if (!response.ok) {
          throw new Error(
            data.message ||
              `Server Error: ${response.status}`
          );
        }

        // -------------------------------------------------
        // SET RESULTS
        // -------------------------------------------------

        if (Array.isArray(data.results)) {
          /*
            Backend માં જેટલા અલગ Quiz attempts
            save થયેલા હશે, એટલા બધા records
            અલગ અલગ result તરીકે રહેશે.
          */

          const individualResults =
            data.results.map(
              (result, index) => ({
                ...result,

                __historyKey:
                  result._id ||
                  result.id ||
                  `${result.createdAt || "result"}-${index}`,
              })
            );

          setResults(individualResults);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error(
          "❌ Fetch Quiz Results Error:",
          err
        );

        setError(
          err.message ||
            "Quiz result load કરવામાં error આવ્યો."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [navigate]);

  // =====================================================
  // PERCENTAGE
  // =====================================================

  const getPercentage = (
    correctAnswers,
    totalQuestions
  ) => {
    if (
      !totalQuestions ||
      totalQuestions <= 0
    ) {
      return 0;
    }

    return Math.round(
      (correctAnswers / totalQuestions) * 100
    );
  };

  // =====================================================
  // RESULT MESSAGE
  // =====================================================

  const getResultMessage = (percentage) => {
    if (percentage >= 90) {
      return "અદ્ભુત! ખૂબ જ સરસ પ્રદર્શન! 🌟";
    }

    if (percentage >= 75) {
      return "ખૂબ સરસ! તમારું પ્રદર્શન ઉત્તમ છે. 🙏";
    }

    if (percentage >= 50) {
      return "સારું પ્રદર્શન! વધુ અભ્યાસ કરો. 📖";
    }

    return "વધુ મહેનત કરો અને ફરી પ્રયાસ કરો. 💪";
  };

  // =====================================================
  // CATEGORY NAME
  // =====================================================

  const getCategoryName = (result) => {
    if (result.categoryName) {
      return result.categoryName;
    }

    if (result.category === "mahabharata") {
      return "મહાભારત Quiz";
    }

    if (result.category === "gita") {
      return "ભગવદ્ ગીતા Quiz";
    }

    if (result.category === "all") {
      return "ભગવદ્ ગીતા Quiz";
    }

    if (
      typeof result.category === "string" &&
      result.category.startsWith("chapter-")
    ) {
      const chapterNumber = Number(
        result.category.replace(
          "chapter-",
          ""
        )
      );

      if (
        chapterNumber >= 1 &&
        chapterNumber <= 18
      ) {
        return `અધ્યાય ${chapterNumber} Quiz`;
      }
    }

    return "ભગવદ્ ગીતા Quiz";
  };

  // =====================================================
  // CHAPTER TEXT
  // =====================================================

  const getChapterText = (result) => {
    const chapterNumber =
      Number(result.chapterNumber);

    if (
      Number.isInteger(chapterNumber) &&
      chapterNumber >= 1 &&
      chapterNumber <= 18
    ) {
      return (
        `અધ્યાય ${chapterNumber} • ` +
        `${chapterNames[chapterNumber] || ""}`
      );
    }

    if (result.category === "mahabharata") {
      return "મહાભારત";
    }

    return "ભગવદ્ ગીતા";
  };

  // =====================================================
  // TOGGLE RESULT
  // =====================================================

  const toggleResult = (resultKey) => {
    setExpandedResult((previous) =>
      previous === resultKey
        ? null
        : resultKey
    );

    // Scroll slightly so expanded card is visible
    setTimeout(() => {
      if (expandedResult !== resultKey) {
        window.scrollBy({
          top: 120,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="quiz-result-page">

        <section className="quiz-result-loading">

          <div className="quiz-result-loading-icon">
            🕉️
          </div>

          <h2>
            Quiz Result લોડ થઈ રહ્યું છે...
          </h2>

          <p>
            કૃપા કરીને થોડી ક્ષણ રાહ જુઓ.
          </p>

        </section>

      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="quiz-result-page">

        <section className="quiz-result-error">

          <div className="quiz-result-error-icon">
            ❌
          </div>

          <h2>
            કંઈક સમસ્યા આવી
          </h2>

          <p>
            {error}
          </p>

          <div className="quiz-result-error-actions">

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              🔄 ફરી પ્રયાસ કરો
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/quiz")
              }
            >
              ← Quiz પર પાછા જાઓ
            </button>

          </div>

        </section>

      </main>
    );
  }

  // =====================================================
  // NO RESULTS
  // =====================================================

  if (results.length === 0) {
    return (
      <main className="quiz-result-page">

        <section className="quiz-result-header">

          <div className="quiz-result-om">
            ॐ
          </div>

          <p className="quiz-result-sacred-title">
            ॥ श्रीमद्भगवद्गीता ॥
          </p>

          <h1>
            Quiz Results
          </h1>

          <p>
            તમારા અત્યાર સુધીના Quiz Results
          </p>

        </section>

        <section className="quiz-result-empty">

          <div className="quiz-result-empty-icon">
            📖
          </div>

          <h2>
            હજુ કોઈ Quiz Result નથી
          </h2>

          <p>
            તમે હજુ સુધી કોઈ Quiz પૂર્ણ કરી નથી.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/quiz")
            }
          >
            📝 Quiz શરૂ કરો
          </button>

        </section>

      </main>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <main className="quiz-result-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="quiz-result-header">

        <div className="quiz-result-om">
          ॐ
        </div>

        <p className="quiz-result-sacred-title">
          ॥ श्रीमद्भगवद्गीता ॥
        </p>

        <h1>
          Quiz Results
        </h1>

        <p>
          તમારા Quiz Performance નો રેકોર્ડ
        </p>

      </section>


      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="quiz-result-actions">

        <button
          type="button"
          className="quiz-result-back-btn"
          onClick={() =>
            navigate("/quiz")
          }
        >
          ← Quiz પર પાછા જાઓ
        </button>

        
      </div>


      {/* =================================================
          QUIZ HISTORY GRID
      ================================================= */}

      <section className="quiz-history-grid">

        {results.map((result, index) => {

          // ------------------------------------------------
          // TOTAL
          // ------------------------------------------------

          const totalQuestions =
            Number(
              result.totalQuestions || 0
            );

          // ------------------------------------------------
          // CORRECT
          // ------------------------------------------------

          const correctAnswers =
            Number(
              result.correctAnswers || 0
            );

          // ------------------------------------------------
          // SKIPPED
          // ------------------------------------------------

          const skippedQuestions =
            Number(
              result.skippedQuestions || 0
            );

          // ------------------------------------------------
          // WRONG
          // ------------------------------------------------

          const calculatedWrong =
            Math.max(
              totalQuestions -
                correctAnswers -
                skippedQuestions,
              0
            );

          const wrongAnswers =
            Number.isFinite(
              Number(result.wrongAnswers)
            )
              ? Number(result.wrongAnswers)
              : calculatedWrong;

          // ------------------------------------------------
          // PERCENTAGE
          // ------------------------------------------------

          const calculatedPercentage =
            getPercentage(
              correctAnswers,
              totalQuestions
            );

          let percentage =
            Number(
              result.percentage
            );

          if (
            !Number.isFinite(
              percentage
            )
          ) {
            percentage =
              calculatedPercentage;
          }

          percentage = Math.min(
            Math.max(
              percentage,
              0
            ),
            100
          );

          // ------------------------------------------------
          // CATEGORY
          // ------------------------------------------------

          const categoryName =
            getCategoryName(result);

          // ------------------------------------------------
          // CHAPTER
          // ------------------------------------------------

          const chapterText =
            getChapterText(result);

          // ------------------------------------------------
          // UNIQUE KEY
          // ------------------------------------------------

          const resultKey =
            result.__historyKey ||
            result._id ||
            result.id ||
            `quiz-history-${index}`;

          // ------------------------------------------------
          // EXPANDED?
          // ------------------------------------------------

          const isExpanded =
            expandedResult === resultKey;

          // ------------------------------------------------
          // DATE
          // ------------------------------------------------

          let formattedDate = "";

          if (result.createdAt) {
            const date =
              new Date(
                result.createdAt
              );

            if (
              !Number.isNaN(
                date.getTime()
              )
            ) {
              formattedDate =
                date.toLocaleString(
                  "gu-IN",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );
            }
          }

          return (
            <article
              className={
                isExpanded
                  ? "quiz-history-item quiz-history-expanded"
                  : "quiz-history-item"
              }
              key={resultKey}
            >

              {/* =================================================
                  SMALL QUIZ BUTTON
              ================================================= */}

              <button
                type="button"
                className="quiz-history-button"
                onClick={() =>
                  toggleResult(resultKey)
                }
                aria-expanded={isExpanded}
                aria-label={`${categoryName} result ${
                  isExpanded
                    ? "બંધ કરો"
                    : "જુઓ"
                }`}
              >

                {/* ---------------------------------------------
                    QUIZ NUMBER
                --------------------------------------------- */}

                <div className="quiz-history-number">

                  <span>
                    QUIZ
                  </span>

                  <strong>
                    #{results.length - index}
                  </strong>

                </div>


                {/* ---------------------------------------------
                    QUIZ INFORMATION
                --------------------------------------------- */}

                <div className="quiz-history-info">

                  <h3>
                    {categoryName}
                  </h3>

                  <p>
                    {chapterText}
                  </p>

                </div>


                {/* ---------------------------------------------
                    PERCENTAGE CIRCLE
                --------------------------------------------- */}

                <div
                  className="quiz-history-circle"
                  style={{
                    "--score": `${percentage}%`,
                  }}
                >

                  <div className="quiz-history-circle-inner">

                    <strong>
                      {Math.round(
                        percentage
                      )}
                      %
                    </strong>

                    <span>
                      SCORE
                    </span>

                  </div>

                </div>


                {/* ---------------------------------------------
                    ARROW
                --------------------------------------------- */}

                <span
                  className={
                    isExpanded
                      ? "quiz-history-arrow open"
                      : "quiz-history-arrow"
                  }
                >
                  →
                </span>

              </button>


              {/* =================================================
                  FULL RESULT CARD
                  ONLY WHEN CLICKED
              ================================================= */}

              {isExpanded && (
                <section className="quiz-result-card">

                  {/* =============================================
                      CARD HEADER
                  ============================================= */}

                  <div className="quiz-result-card-header">

                    <div className="quiz-result-card-info">

                      <span className="quiz-result-number">
                        Quiz #
                        {results.length - index}
                      </span>

                      <h2>
                        {categoryName}
                      </h2>

                      <p>
                        {chapterText}
                      </p>

                    </div>


                    {/* =========================================
                        BIG SCORE
                    ========================================= */}

                    <div className="quiz-result-percentage">

                      <strong>
                        {Math.round(
                          percentage
                        )}
                        %
                      </strong>

                      <span>
                        SCORE
                      </span>

                    </div>

                  </div>


                  {/* =============================================
                      MESSAGE
                  ============================================= */}

                  <div className="quiz-result-message">

                    {getResultMessage(
                      percentage
                    )}

                  </div>


                  {/* =============================================
                      STATS
                  ============================================= */}

                  <div className="quiz-result-stats">

                    {/* TOTAL */}

                    <div className="quiz-result-stat total">

                      <span className="quiz-result-stat-icon">
                        📋
                      </span>

                      <div>

                        <strong>
                          {totalQuestions}
                        </strong>

                        <span>
                          કુલ પ્રશ્નો
                        </span>

                      </div>

                    </div>


                    {/* CORRECT */}

                    <div className="quiz-result-stat correct">

                      <span className="quiz-result-stat-icon">
                        ✓
                      </span>

                      <div>

                        <strong>
                          {correctAnswers}
                        </strong>

                        <span>
                          સાચા જવાબ
                        </span>

                      </div>

                    </div>


                    {/* WRONG */}

                    <div className="quiz-result-stat wrong">

                      <span className="quiz-result-stat-icon">
                        ✕
                      </span>

                      <div>

                        <strong>
                          {wrongAnswers}
                        </strong>

                        <span>
                          ખોટા જવાબ
                        </span>

                      </div>

                    </div>


                    {/* SKIPPED */}

                    {skippedQuestions > 0 && (
                      <div className="quiz-result-stat skipped">

                        <span className="quiz-result-stat-icon">
                          ⏭
                        </span>

                        <div>

                          <strong>
                            {skippedQuestions}
                          </strong>

                          <span>
                            છોડેલા પ્રશ્નો
                          </span>

                        </div>

                      </div>
                    )}

                  </div>


                  {/* =============================================
                      PROGRESS
                  ============================================= */}

                  <div className="quiz-result-progress-section">

                    <div className="quiz-result-progress-info">

                      <span>
                        તમારો Score
                      </span>

                      <strong>
                        {correctAnswers} /{" "}
                        {totalQuestions}
                      </strong>

                    </div>

                    <div className="quiz-result-progress">

                      <div
                        className="quiz-result-progress-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* =============================================
                      DATE
                  ============================================= */}

                  {formattedDate && (
                    <div className="quiz-result-date">

                      🕒 {formattedDate}

                    </div>
                  )}

                </section>
              )}

            </article>
          );
        })}

      </section>


      {/* =================================================
          BOTTOM SECTION
      ================================================= */}

      <section className="quiz-result-bottom">

        <div className="quiz-result-bottom-icon">
          🕉️
        </div>

        <h2>
          જ્ઞાન એ જ સાચી શક્તિ છે
        </h2>

        <p>
          ભગવદ્ ગીતાના જ્ઞાનને વધુ ઊંડાણથી
          સમજવા માટે નિયમિત Quiz આપો.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/quiz")
          }
        >
          ફરી Quiz આપો →
        </button>

      </section>

    </main>
  );
}

export default QuizResult;