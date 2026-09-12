import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, RefreshCw, ArrowLeft, BookOpen, ChevronRight, ClipboardList, CheckCircle2, XCircle, SkipForward, Clock, PlayCircle, Award } from "lucide-react";
import "./QuizResult.css";

const API_URL = "https://bhagavad-gita-website.onrender.com/api/quiz";

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
      return "અદ્ભુત! ખૂબ જ સરસ પ્રદર્શન!";
    }

    if (percentage >= 75) {
      return "ખૂબ સરસ! તમારું પ્રદર્શન ઉત્તમ છે.";
    }

    if (percentage >= 50) {
      return "સારું પ્રદર્શન! વધુ અભ્યાસ કરો.";
    }

    return "વધુ મહેનત કરો અને ફરી પ્રયાસ કરો.";
  };

  // =====================================================
  // EXTRACT CHAPTER NUMBER
  // =====================================================

  const getChapterNumber = (result) => {
    if (!result) return null;

    if (result.chapterNumber !== undefined && result.chapterNumber !== null) {
      const parsed = Number(result.chapterNumber);
      if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 18) {
        return parsed;
      }
    }

    if (typeof result.category === "string") {
      const cat = result.category.trim().toLowerCase();
      if (cat.startsWith("chapter-") || cat.startsWith("chapter_")) {
        const parsed = Number(cat.replace(/^chapter[-_]/, ""));
        if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 18) {
          return parsed;
        }
      }
      const directNum = Number(cat);
      if (Number.isInteger(directNum) && directNum >= 1 && directNum <= 18) {
        return directNum;
      }
    }

    return null;
  };

  // =====================================================
  // QUIZ TARGET INFO
  // =====================================================

  const getQuizTargetInfo = (result) => {
    const chapterNumber = getChapterNumber(result);

    if (chapterNumber) {
      const chapterTitle = chapterNames[chapterNumber] || "";
      return {
        isChapter: true,
        chapterNumber,
        shortTitle: `અધ્યાય ${chapterNumber}`,
        title: `અધ્યાય ${chapterNumber}: ${chapterTitle}`,
        badge: `અધ્યાય ${chapterNumber} • ${chapterTitle}`,
        shortBadge: `અધ્યાય ${chapterNumber}`,
        subtitle: `શ્રીમદ્ ભગવદ્ ગીતા • અધ્યાય ${chapterNumber}`,
      };
    }

    if (result.category === "mahabharata") {
      return {
        isChapter: false,
        chapterNumber: null,
        shortTitle: "મહાભારત Quiz",
        title: "મહાભારત Quiz",
        badge: "મહાભારત વિશેષ ક્વિઝ",
        shortBadge: "મહાભારત",
        subtitle: "મહાભારત વિશેષ જ્ઞાન કસોટી",
      };
    }

    return {
      isChapter: false,
      chapterNumber: null,
      shortTitle: "ભગવદ્ ગીતા Quiz",
      title: "શ્રીમદ્ ભગવદ્ ગીતા Quiz",
      badge: "સમગ્ર ભગવદ્ ગીતા",
      shortBadge: "સમગ્ર ગીતા",
      subtitle: "સંપૂર્ણ ભગવદ્ ગીતા સામાન્ય જ્ઞાન કસોટી",
    };
  };

  // =====================================================
  // CATEGORY NAME
  // =====================================================

  const getCategoryName = (result) => {
    const target = getQuizTargetInfo(result);
    return target.title;
  };

  // =====================================================
  // CHAPTER TEXT
  // =====================================================

  const getChapterText = (result) => {
    const target = getQuizTargetInfo(result);
    return target.badge;
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
            <Loader2 size={40} className="spinner" color="#2563eb" />
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
            <AlertCircle size={40} color="#ef4444" />
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
              <RefreshCw size={15} className="btn-icon" /> ફરી પ્રયાસ કરો
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/quiz")
              }
            >
              <ArrowLeft size={15} className="btn-icon" /> Quiz પર પાછા જાઓ
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
            <BookOpen size={40} color="#2563eb" />
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
            <PlayCircle size={16} className="btn-icon" /> Quiz શરૂ કરો
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
          <ArrowLeft size={15} className="btn-icon" /> Quiz પર પાછા જાઓ
        </button>

        <button
          type="button"
          className="quiz-result-achievements-btn"
          onClick={() =>
            navigate("/quiz-achievements")
          }
        >
          <Award size={16} className="btn-icon" />
          <span>ક્વિઝ સિદ્ધિઓ જુઓ</span>
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
          // TARGET & CATEGORY INFO
          // ------------------------------------------------

          const targetInfo =
            getQuizTargetInfo(result);

          const categoryName =
            targetInfo.title;

          const chapterText =
            targetInfo.badge;

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

                  <h3 className="quiz-history-title">
                    {targetInfo.shortTitle}
                  </h3>

                  {formattedDate && (
                    <p className="quiz-history-date">
                      <Clock size={12} className="quiz-date-icon" />
                      {formattedDate}
                    </p>
                  )}

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
                  <ChevronRight size={18} />
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

                      <div className="quiz-result-meta-row">
                        <span className="quiz-result-number">
                          Quiz #{results.length - index}
                        </span>
                      </div>

                      <h2 className="quiz-result-title">
                        {targetInfo.title}
                      </h2>

                      <div className="quiz-result-chapter-desc">
                        {formattedDate && (
                          <span className="quiz-result-timestamp">
                            <Clock size={12} /> {formattedDate}
                          </span>
                        )}
                      </div>

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
                        <ClipboardList size={20} />
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
                        <CheckCircle2 size={20} />
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
                        <XCircle size={20} />
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
                          <SkipForward size={20} />
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

                      <Clock size={13} className="btn-icon" /> {formattedDate}

                    </div>
                  )}

                </section>
              )}

            </article>
          );
        })}

      </section>


    </main>
  );
}

export default QuizResult;