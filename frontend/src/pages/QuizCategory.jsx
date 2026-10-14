import { getValidToken, handleAuth401 } from "../utils/authHelper.js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Target, BookOpen, Sword, History, BookMarked, Hash, PlayCircle, Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./QuizCategory.css";


function QuizCategory() {
  const navigate = useNavigate();
  const { isHindi, isEnglish, isGujarati, txt } = useLanguage();

  // =====================================================
  // API
  // =====================================================

  const API_URL = "https://bhagavad-gita-website.onrender.com/api/quiz";

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

  const chapterNamesHi = {
    1: "अर्जुनविषाद योग",
    2: "सांख्य योग",
    3: "कर्म योग",
    4: "ज्ञानकर्मसंन्यास योग",
    5: "कर्मसंन्यास योग",
    6: "आत्मसंयम योग",
    7: "ज्ञानविज्ञान योग",
    8: "अक्षरब्रह्म योग",
    9: "राजविद्या राजगुह्य योग",
    10: "विभूति योग",
    11: "विश्वरूपदर्शन योग",
    12: "भक्ति योग",
    13: "क्षेत्र-क्षेत्रज्ञ विभाग योग",
    14: "गुणत्रयविभाग योग",
    15: "पुरुषोत्तम योग",
    16: "दैवासुरसम्पद्विभाग योग",
    17: "श्रद्धात्रयविभाग योग",
    18: "मोक्षसंन्यास योग",
  };

  const chapterNamesEn = {
    1: "Arjuna Vishada Yoga",
    2: "Sankhya Yoga",
    3: "Karma Yoga",
    4: "Jnana Karma Sanyasa Yoga",
    5: "Karma Sanyasa Yoga",
    6: "Dhyana Yoga",
    7: "Jnana Vijnana Yoga",
    8: "Akshara Brahma Yoga",
    9: "Raja Vidya Raja Guhya Yoga",
    10: "Vibhuti Yoga",
    11: "Vishwarupa Darshana Yoga",
    12: "Bhakti Yoga",
    13: "Kshetra Kshetrajna Yoga",
    14: "Gunatraya Vibhaga Yoga",
    15: "Purushottama Yoga",
    16: "Daivasura Sampad Yoga",
    17: "Shraddhatraya Vibhaga Yoga",
    18: "Moksha Sanyasa Yoga",
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
    return getValidToken();
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
          if (response.status === 401) {
            handleAuth401(navigate, "/quiz-category");
            return;
          }
          throw new Error(
            data.message ||
              txt(
                "Questions count load થઈ શક્યો નથી.",
                "प्रश्नों की संख्या लोड नहीं हो सकी।",
                "Could not load questions count."
              )
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
        txt(
          "કૃપા કરીને અધ્યાય પસંદ કરો.",
          "कृपया अध्याय चुनें।",
          "Please select a chapter."
        )
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
        txt(
          "કૃપા કરીને પ્રશ્નોની સંખ્યા પસંદ કરો.",
          "कृपया प्रश्नों की संख्या चुनें।",
          "Please select the number of questions."
        )
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
        txt(
          "આ પસંદગી માટે હાલમાં કોઈ પ્રશ્ન ઉપલબ્ધ નથી.",
          "इस चयन के लिए वर्तमान में कोई प्रश्न उपलब्ध नहीं है।",
          "No questions currently available for this selection."
        )
      );

      return;
    }

    if (
      availableQuestions !== null &&
      questionCount > availableQuestions
    ) {
      setError(
        txt(
          `મહત્તમ ${availableQuestions} પ્રશ્નો ઉપલબ્ધ છે.`,
          `अधिकतम ${availableQuestions} प्रश्न उपलब्ध हैं।`,
          `Maximum ${availableQuestions} questions are available.`
        )
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
            <Brain size={36} color="#2563eb" />
          </div>

          <div>

            <p className="quiz-category-subtitle">
              ॥ श्रीमद्भगवद्गीता ॥
            </p>

            <h1>
              {txt("ગીતા ક્વિઝ", "गीता क्विज़", "Gita Quiz")}
            </h1>

          </div>

        </div>

        <button
          type="button"
          className="quiz-category-back-btn"
          onClick={() => navigate("/quiz-results")}
        >
          <History size={16} className="btn-icon" /> {txt("Quiz History", "क्विज़ इतिहास", "Quiz History")}
        </button>

      </section>

      {/* =================================================
          QUIZ SETUP
      ================================================= */}

      <section className="quiz-setup-card">

        <div className="quiz-setup-header">

          <div className="quiz-setup-icon">
            <Target size={28} color="#2563eb" />
          </div>

          <div>

            <h2>
              {txt("તમારી ક્વિઝ પસંદ કરો", "अपनी क्विज़ चुनें", "Choose Your Quiz")}
            </h2>

          </div>

        </div>

        {/* =================================================
            QUIZ TYPE
        ================================================= */}

        <div className="quiz-setup-group">

          <label>
            <BookOpen size={14} className="btn-icon" /> {txt("Quiz પ્રકાર", "क्विज़ प्रकार", "Quiz Type")}
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
                <BookOpen size={22} />
              </span>

              <span className="quiz-type-text">

                <strong>
                  {txt("બધા અધ્યાય", "सभी अध्याय", "All Chapters")}
                </strong>

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
                <BookMarked size={22} />
              </span>

              <span className="quiz-type-text">

                <strong>
                  {txt("અધ્યાય પ્રમાણે", "अध्याय अनुसार", "By Chapter")}
                </strong>

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
                <Sword size={22} />
              </span>

              <span className="quiz-type-text">

                <strong>
                  {txt("મહાભારત", "महाभारत", "Mahabharata")}
                </strong>

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
              <BookMarked size={14} className="btn-icon" /> {txt("અધ્યાય પસંદ કરો", "अध्याय चुनें", "Select Chapter")}
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
                {txt("-- અધ્યાય પસંદ કરો --", "-- अध्याय चुनें --", "-- Select Chapter --")}
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
                    {isEnglish
                      ? `Chapter ${chapterNumber} - ${chapterNamesEn[chapterNumber] || chapterName}`
                      : isHindi
                      ? `अध्याय ${chapterNumber} - ${chapterNamesHi[chapterNumber] || chapterName}`
                      : `અધ્યાય ${chapterNumber} - ${chapterName}`
                    }
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
            <Hash size={14} className="btn-icon" /> {txt("કેટલા પ્રશ્નોની ક્વિઝ?", "कितने प्रश्नों की क्विज़?", "Number of Questions")}
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
                {txt("-- પ્રશ્નોની સંખ્યા પસંદ કરો --", "-- प्रश्नों की संख्या चुनें --", "-- Select Question Count --")}
              </option>

              {getQuestionCountOptions().map(
                (count) => (
                  <option
                    key={count}
                    value={count}
                  >
                    {count} {txt("પ્રશ્નો", "प्रश्न", "Questions")}
                  </option>
                )
              )}

            </select>

            {loadingQuestions ? (
              <span className="quiz-available-count">
                <Loader2 size={13} className="spinner btn-icon" /> {txt("Questions તપાસી રહ્યા છીએ...", "Questions जांच रहे हैं...", "Checking questions...")}
              </span>
            ) : availableQuestions !== null ? (
              <span className="quiz-available-count">
                {availableQuestions} {txt("પ્રશ્નો ઉપલબ્ધ", "प्रश्न उपलब्ध", "questions available")}
              </span>
            ) : null}

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="quiz-setup-error">
            {error}
          </div>
        )}

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
          <PlayCircle size={18} className="btn-icon" /> {txt("Quiz શરૂ કરો", "Quiz शुरू करें", "Start Quiz")}
        </button>

      </section>

    </main>
  );
}

export default QuizCategory;