import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./QuizCategory.css";

function QuizCategory() {
  const navigate = useNavigate();

  // =====================================================
  // API
  // =====================================================

  const API_URL = "http://localhost:5000/api/quiz";

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
  // STATE
  // =====================================================

  const [quizType, setQuizType] = useState("all");

  const [selectedChapter, setSelectedChapter] =
    useState("");

  const [questionCount, setQuestionCount] =
    useState(10);

  const [availableQuestions, setAvailableQuestions] =
    useState(null);

  const [loadingQuestions, setLoadingQuestions] =
    useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // FETCH AVAILABLE QUESTION COUNT
  // =====================================================

  useEffect(() => {
    const fetchQuestionCount = async () => {
      try {
        setLoadingQuestions(true);
        setError("");

        let url = `${API_URL}/questions/count`;

        // -------------------------------------------------
        // CHAPTER
        // -------------------------------------------------

        if (
          quizType === "chapter" &&
          selectedChapter
        ) {
          url += `?category=chapter&chapter=${selectedChapter}`;
        }

        // -------------------------------------------------
        // MAHABHARATA
        // -------------------------------------------------

        else if (quizType === "mahabharata") {
          url += "?category=mahabharata";
        }

        // -------------------------------------------------
        // ALL
        // -------------------------------------------------

        else {
          url += "?category=all";
        }

        const token = getToken();

        const response = await fetch(url, {
          method: "GET",

          headers: token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {},
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Questions count load થઈ શક્યો નથી."
          );
        }

        const count = Number(
          data.count ??
          data.totalQuestions ??
          0
        );

        setAvailableQuestions(count);

        // -------------------------------------------------
        // QUESTION COUNT ADJUST
        // -------------------------------------------------

        if (count > 0) {
          setQuestionCount((previous) => {
            if (previous > count) {
              return count;
            }

            return previous;
          });
        } else {
          setQuestionCount(0);
        }

      } catch (error) {
        console.error(
          "Quiz Question Count Error:",
          error
        );

        setAvailableQuestions(null);

      } finally {
        setLoadingQuestions(false);
      }
    };

    // -----------------------------------------------------
    // CHAPTER MUST BE SELECTED
    // -----------------------------------------------------

    if (
      quizType === "chapter" &&
      !selectedChapter
    ) {
      setAvailableQuestions(null);
      setQuestionCount(10);
      return;
    }

    fetchQuestionCount();

  }, [
    quizType,
    selectedChapter,
  ]);

  // =====================================================
  // QUIZ TYPE CHANGE
  // =====================================================

  const handleQuizTypeChange = (type) => {
    setQuizType(type);

    setError("");

    if (type !== "chapter") {
      setSelectedChapter("");
    }

    setQuestionCount(10);
    setAvailableQuestions(null);
  };

  // =====================================================
  // CHAPTER CHANGE
  // =====================================================

  const handleChapterChange = (event) => {
    setSelectedChapter(
      event.target.value
    );

    setQuestionCount(10);
    setError("");
  };

  // =====================================================
  // QUESTION COUNT CHANGE
  // =====================================================

  const handleQuestionCountChange = (
    event
  ) => {
    const count =
      Number(event.target.value);

    setQuestionCount(count);

    setError("");
  };

  // =====================================================
  // START QUIZ
  // =====================================================

  const startQuiz = () => {
    setError("");

    // -------------------------------------------------
    // CHAPTER VALIDATION
    // -------------------------------------------------

    if (
      quizType === "chapter" &&
      !selectedChapter
    ) {
      setError(
        "કૃપા કરીને અધ્યાય પસંદ કરો."
      );

      return;
    }

    // -------------------------------------------------
    // QUESTION COUNT VALIDATION
    // -------------------------------------------------

    if (
      !questionCount ||
      questionCount < 1
    ) {
      setError(
        "કૃપા કરીને પ્રશ્નોની સંખ્યા પસંદ કરો."
      );

      return;
    }

    // -------------------------------------------------
    // AVAILABLE QUESTIONS VALIDATION
    // -------------------------------------------------

    if (
      availableQuestions !== null &&
      availableQuestions <= 0
    ) {
      setError(
        "આ પસંદગી માટે હાલમાં કોઈ પ્રશ્ન ઉપલબ્ધ નથી."
      );

      return;
    }

    if (
      availableQuestions !== null &&
      questionCount > availableQuestions
    ) {
      setError(
        `મહત્તમ ${availableQuestions} પ્રશ્નો ઉપલબ્ધ છે.`
      );

      return;
    }

    // =================================================
    // BUILD QUIZ URL
    // =================================================

    const params =
      new URLSearchParams();

    params.set(
      "category",
      quizType
    );

    // IMPORTANT:
    // Selected question count
    params.set(
      "count",
      String(questionCount)
    );

    // -------------------------------------------------
    // CHAPTER
    // -------------------------------------------------

    if (
      quizType === "chapter" &&
      selectedChapter
    ) {
      params.set(
        "chapter",
        selectedChapter
      );
    }

    // =================================================
    // START QUIZ
    // =================================================

    navigate(
      `/quiz/play?${params.toString()}`
    );
  };

  // =====================================================
  // BACK
  // =====================================================

  const goBack = () => {
    navigate(-1);
  };

  // =====================================================
  // QUESTION COUNT OPTIONS
  // =====================================================

  const getQuestionCountOptions = () => {
    const options = [
      5,
      10,
      15,
      20,
      25,
      30,
      40,
      50,
    ];

    if (
      availableQuestions &&
      availableQuestions > 0
    ) {
      if (
        !options.includes(
          availableQuestions
        )
      ) {
        options.push(
          availableQuestions
        );
      }
    }

    return options
      .filter(
        (count) =>
          !availableQuestions ||
          count <= availableQuestions
      )
      .sort(
        (a, b) => a - b
      );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="quiz-category-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="quiz-category-header">

        <div className="quiz-category-header-content">

          <div className="quiz-category-icon">
            🧠
          </div>

          <div>

            <p className="quiz-category-subtitle">
              ॥ श्रीमद्भगवद्गीता ॥
            </p>

            <h1>
              ગીતા ક્વિઝ
            </h1>

            <p className="quiz-category-description">
              ભગવદ્ ગીતા અને મહાભારતના પ્રશ્નો દ્વારા
              તમારું જ્ઞાન ચકાસો.
            </p>

          </div>

        </div>

        <button
          type="button"
          className="quiz-category-back-btn"
          onClick={goBack}
        >
          ← પાછા જાઓ
        </button>

      </section>

      {/* =================================================
          QUIZ SETUP
      ================================================= */}

      <section className="quiz-setup-card">

        <div className="quiz-setup-header">

          <div className="quiz-setup-icon">
            🎯
          </div>

          <div>

            <h2>
              તમારી ક્વિઝ પસંદ કરો
            </h2>

            <p>
              Quiz શરૂ કરતા પહેલા તમારી પસંદગી કરો.
            </p>

          </div>

        </div>

        {/* =================================================
            QUIZ TYPE
        ================================================= */}

        <div className="quiz-setup-group">

          <label>
            📚 Quiz પ્રકાર
          </label>

          <div className="quiz-type-options">

            {/* ALL */}

            <button
              type="button"
              className={
                quizType === "all"
                  ? "quiz-type-card active"
                  : "quiz-type-card"
              }
              onClick={() =>
                handleQuizTypeChange("all")
              }
            >

              <span className="quiz-type-icon">
                📚
              </span>

              <span className="quiz-type-text">

                <strong>
                  બધા અધ્યાય
                </strong>

                <small>
                  18 અધ્યાયમાંથી પ્રશ્નો
                </small>

              </span>

            </button>

            {/* CHAPTER */}

            <button
              type="button"
              className={
                quizType === "chapter"
                  ? "quiz-type-card active"
                  : "quiz-type-card"
              }
              onClick={() =>
                handleQuizTypeChange(
                  "chapter"
                )
              }
            >

              <span className="quiz-type-icon">
                📖
              </span>

              <span className="quiz-type-text">

                <strong>
                  અધ્યાય પ્રમાણે
                </strong>

                <small>
                  કોઈ એક અધ્યાયમાંથી
                </small>

              </span>

            </button>

            {/* MAHABHARATA */}

            <button
              type="button"
              className={
                quizType === "mahabharata"
                  ? "quiz-type-card active"
                  : "quiz-type-card"
              }
              onClick={() =>
                handleQuizTypeChange(
                  "mahabharata"
                )
              }
            >

              <span className="quiz-type-icon">
                🏹
              </span>

              <span className="quiz-type-text">

                <strong>
                  મહાભારત
                </strong>

                <small>
                  મહાભારત આધારિત પ્રશ્નો
                </small>

              </span>

            </button>

          </div>

        </div>

        {/* =================================================
            CHAPTER SELECT
        ================================================= */}

        {quizType === "chapter" && (
          <div className="quiz-setup-group">

            <label htmlFor="quiz-chapter-select">
              📖 અધ્યાય પસંદ કરો
            </label>

            <select
              id="quiz-chapter-select"
              className="quiz-setup-select"
              value={selectedChapter}
              onChange={
                handleChapterChange
              }
            >

              <option value="">
                -- અધ્યાય પસંદ કરો --
              </option>

              {Object.entries(
                chapterNames
              ).map(
                ([
                  chapterNumber,
                  chapterName,
                ]) => (
                  <option
                    key={chapterNumber}
                    value={chapterNumber}
                  >
                    અધ્યાય {chapterNumber} -{" "}
                    {chapterName}
                  </option>
                )
              )}

            </select>

          </div>
        )}

        {/* =================================================
            QUESTION COUNT
        ================================================= */}

        <div className="quiz-setup-group">

          <label htmlFor="quiz-question-count">
            🔢 કેટલા પ્રશ્નોની ક્વિઝ?
          </label>

          <div className="quiz-count-wrapper">

            <select
              id="quiz-question-count"
              className="quiz-setup-select"
              value={
                questionCount || ""
              }
              onChange={
                handleQuestionCountChange
              }
              disabled={
                quizType === "chapter" &&
                !selectedChapter
              }
            >

              <option value="">
                -- પ્રશ્નોની સંખ્યા પસંદ કરો --
              </option>

              {getQuestionCountOptions().map(
                (count) => (
                  <option
                    key={count}
                    value={count}
                  >
                    {count} Questions
                  </option>
                )
              )}

            </select>

            {loadingQuestions ? (
              <span className="quiz-available-count">
                ⏳ Questions તપાસી રહ્યા છીએ...
              </span>
            ) : availableQuestions !== null ? (
              <span className="quiz-available-count">
                📊 {availableQuestions} પ્રશ્નો ઉપલબ્ધ
              </span>
            ) : null}

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="quiz-setup-error">
            ❌ {error}
          </div>
        )}

        {/* =================================================
            QUIZ SUMMARY
        ================================================= */}

        <div className="quiz-setup-summary">

          <div className="quiz-summary-item">

            <span>
              Quiz
            </span>

            <strong>
              {quizType === "all"
                ? "બધા અધ્યાય"
                : quizType === "chapter"
                ? `અધ્યાય ${selectedChapter || "-"}`
                : "મહાભારત"}
            </strong>

          </div>

          <div className="quiz-summary-item">

            <span>
              પ્રશ્નો
            </span>

            <strong>
              {questionCount || "-"}
            </strong>

          </div>

          <div className="quiz-summary-item">

            <span>
              Mode
            </span>

            <strong>
              🎲 Random
            </strong>

          </div>

        </div>

        {/* =================================================
            START BUTTON
        ================================================= */}

        <button
          type="button"
          className="quiz-start-button"
          onClick={startQuiz}
          disabled={
            loadingQuestions ||
            (
              quizType === "chapter" &&
              !selectedChapter
            ) ||
            (
              availableQuestions !== null &&
              availableQuestions <= 0
            )
          }
        >
          🚀 Quiz શરૂ કરો
        </button>

      </section>

      {/* =================================================
          INFO
      ================================================= */}

      <section className="quiz-category-info">

        <div className="quiz-info-item">

          <div className="quiz-info-icon">
            🕉️
          </div>

          <div>
            <strong>
              જ્ઞાનની સફર
            </strong>

            <span>
              ભગવદ્ ગીતાના જ્ઞાનને પ્રશ્નો દ્વારા જાણો.
            </span>
          </div>

        </div>

        <div className="quiz-info-item">

          <div className="quiz-info-icon">
            🌸
          </div>

          <div>
            <strong>
              વિચાર અને સમજણ
            </strong>

            <span>
              ગીતા ના ઉપદેશોને પ્રશ્નોના માધ્યમથી સમજવાનો પ્રયાસ કરો.
            </span>
          </div>

        </div>

        <div className="quiz-info-item">

          <div className="quiz-info-icon">
            🏆
          </div>

          <div>
            <strong>
              પરિણામ મેળવો
            </strong>

            <span>
              તમારી ક્વિઝ પૂર્ણ કરીને તમારું પરિણામ જાણો.
            </span>
          </div>

        </div>

      </section>

    </main>
  );
}

export default QuizCategory;