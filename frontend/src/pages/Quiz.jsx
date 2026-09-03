import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./Quiz.css";

function Quiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // =====================================================
  // STATE
  // =====================================================

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [answers, setAnswers] =
    useState([]);

  const [score, setScore] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [quizCompleted, setQuizCompleted] =
    useState(false);

  // =====================================================
  // URL PARAMETERS
  // =====================================================

  const categoryParam =
    searchParams.get("category");

  const chapterParam =
    searchParams.get("chapter");

  // IMPORTANT:
  // QuizCategory.jsx માંથી પસંદ કરેલો count
  const countParam =
    searchParams.get("count");

  const questionCount =
    Number(countParam) || 10;

  // =====================================================
  // API
  // =====================================================

  const API_URL =
    "http://localhost:5000/api/quiz";

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // SHUFFLE QUESTIONS
  // =====================================================

  const shuffleQuestions = (items) => {
    const shuffled = [...items];

    for (
      let i = shuffled.length - 1;
      i > 0;
      i--
    ) {
      const j =
        Math.floor(
          Math.random() * (i + 1)
        );

      [
        shuffled[i],
        shuffled[j],
      ] = [
        shuffled[j],
        shuffled[i],
      ];
    }

    return shuffled;
  };

  // =====================================================
  // FETCH QUESTIONS
  // =====================================================

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        setQuestions([]);
        setCurrentQuestion(0);
        setSelectedAnswer("");
        setAnswers([]);
        setScore(0);
        setQuizCompleted(false);

        // =================================================
        // AUTH
        // =================================================

        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        // =================================================
        // VALIDATE QUESTION COUNT
        // =================================================

        if (
          !Number.isInteger(questionCount) ||
          questionCount < 1
        ) {
          setError(
            "Quiz question count યોગ્ય નથી."
          );

          return;
        }

        // =================================================
        // QUIZ TYPE
        // =================================================

        const selectedChapter =
          Number(chapterParam);

        const isChapterQuiz =
          categoryParam === "chapter" &&
          selectedChapter >= 1 &&
          selectedChapter <= 18;

        const isAllQuiz =
          categoryParam === "all" ||
          categoryParam === "all-chapters";

        const isMahabharataQuiz =
          categoryParam === "mahabharata";

        // =================================================
        // VALIDATE CATEGORY
        // =================================================

        if (
          !isChapterQuiz &&
          !isAllQuiz &&
          !isMahabharataQuiz
        ) {
          setError(
            "Quiz category યોગ્ય રીતે પસંદ કરવામાં આવી નથી."
          );

          return;
        }

        // =================================================
        // API URL
        // =================================================

        let url =
          `${API_URL}/questions`;

        const queryParams =
          new URLSearchParams();

        // =================================================
        // CHAPTER QUIZ
        // =================================================

        if (isChapterQuiz) {
          queryParams.set(
            "category",
            `chapter-${selectedChapter}`
          );

          queryParams.set(
            "chapter",
            String(selectedChapter)
          );
        }

        // =================================================
        // MAHABHARATA QUIZ
        // =================================================

        else if (isMahabharataQuiz) {
          queryParams.set(
            "category",
            "mahabharata"
          );
        }

        // =================================================
        // ALL CHAPTERS QUIZ
        // =================================================

        else if (isAllQuiz) {
          // All category માટે
          // category parameter જરૂરી નથી.
        }

        // =================================================
        // IMPORTANT:
        // SEND SELECTED QUESTION COUNT
        // =================================================

        queryParams.set(
          "limit",
          String(questionCount)
        );

        // =================================================
        // CREATE URL
        // =================================================

        const queryString =
          queryParams.toString();

        if (queryString) {
          url += `?${queryString}`;
        }

        console.log(
          "Quiz API URL:",
          url
        );

        console.log(
          "Selected Question Count:",
          questionCount
        );

        // =================================================
        // API REQUEST
        // =================================================

        const response =
          await fetch(
            url,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        console.log(
          "Quiz API Response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Quiz questions load થઈ શક્યા નથી."
          );
        }

        // =================================================
        // GET QUESTIONS
        // =================================================

        let fetchedQuestions =
          Array.isArray(
            data.questions
          )
            ? data.questions
            : [];

        // =================================================
        // CHAPTER FILTER
        // =================================================

        if (isChapterQuiz) {
          fetchedQuestions =
            fetchedQuestions.filter(
              (item) =>
                Number(
                  item.chapterNumber
                ) === selectedChapter
            );
        }

        // =================================================
        // ALL CHAPTER FILTER
        // =================================================

        if (isAllQuiz) {
          fetchedQuestions =
            fetchedQuestions.filter(
              (item) => {
                const chapter =
                  Number(
                    item.chapterNumber
                  );

                return (
                  chapter >= 1 &&
                  chapter <= 18
                );
              }
            );
        }

        // =================================================
        // MAHABHARATA FILTER
        // =================================================

        if (isMahabharataQuiz) {
          fetchedQuestions =
            fetchedQuestions.filter(
              (item) =>
                String(
                  item.category || ""
                )
                  .trim()
                  .toLowerCase() ===
                "mahabharata"
            );
        }

        // =================================================
        // SHUFFLE
        // =================================================

        fetchedQuestions =
          shuffleQuestions(
            fetchedQuestions
          );

        // =================================================
        // IMPORTANT:
        // EXACT QUESTION COUNT
        // =================================================

        fetchedQuestions =
          fetchedQuestions.slice(
            0,
            questionCount
          );

        console.log(
          "Final Questions Count:",
          fetchedQuestions.length
        );

        // =================================================
        // NO QUESTIONS
        // =================================================

        if (
          fetchedQuestions.length === 0
        ) {
          setError(
            isChapterQuiz
              ? `અધ્યાય ${selectedChapter} માટે હાલમાં કોઈ quiz question ઉપલબ્ધ નથી.`
              : "આ category માટે હાલમાં કોઈ quiz question ઉપલબ્ધ નથી."
          );

          return;
        }

        // =================================================
        // IF REQUESTED COUNT NOT AVAILABLE
        // =================================================

        if (
          fetchedQuestions.length <
          questionCount
        ) {
          console.warn(
            `Requested ${questionCount} questions, but only ${fetchedQuestions.length} available.`
          );
        }

        // =================================================
        // DEBUG
        // =================================================

        console.log(
          "First Question:",
          fetchedQuestions[0]
        );

        console.log(
          "Correct Answer:",
          fetchedQuestions[0]
            ?.correctAnswer
        );

        // =================================================
        // SET QUESTIONS
        // =================================================

        setQuestions(
          fetchedQuestions
        );

        setCurrentQuestion(0);
        setSelectedAnswer("");
        setAnswers([]);
        setScore(0);
        setQuizCompleted(false);

      } catch (err) {
        console.error(
          "Fetch Quiz Questions Error:",
          err
        );

        setError(
          err.message ||
            "Quiz load કરવામાં error આવ્યો."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();

  }, [
    categoryParam,
    chapterParam,
    questionCount,
    navigate,
  ]);

  // =====================================================
  // CURRENT QUESTION
  // =====================================================

  const question =
    questions[currentQuestion];

  // =====================================================
  // OPTIONS
  // =====================================================

  const getOptions = () => {
    if (!question) {
      return [];
    }

    if (
      Array.isArray(
        question.options
      )
    ) {
      return question.options;
    }

    return [];
  };

  // =====================================================
  // NORMALIZE ANSWER
  // =====================================================

  const normalizeAnswer = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(
        /\s+/g,
        " "
      );
  };

  // =====================================================
  // ANSWER
  // =====================================================

  const handleAnswer = (
    answer
  ) => {
    if (!question) {
      return;
    }

    if (selectedAnswer) {
      return;
    }

    const correctAnswer =
      String(
        question.correctAnswer ||
          ""
      ).trim();

    const isCorrect =
      normalizeAnswer(
        answer
      ) ===
      normalizeAnswer(
        correctAnswer
      );

    // =================================================
    // SELECT ANSWER
    // =================================================

    setSelectedAnswer(
      answer
    );

    // =================================================
    // SAVE ANSWER
    // =================================================

    setAnswers(
      (previous) => {
        const alreadyAnswered =
          previous.some(
            (item) =>
              String(
                item.questionId
              ) ===
              String(
                question._id
              )
          );

        if (
          alreadyAnswered
        ) {
          return previous;
        }

        return [
          ...previous,

          {
            questionId:
              question._id,

            selectedAnswer:
              answer,

            correctAnswer:
              correctAnswer,

            isCorrect,
          },
        ];
      }
    );

    // =================================================
    // SCORE
    // =================================================

    if (isCorrect) {
      setScore(
        (previous) =>
          previous + 1
      );
    }
  };

  // =====================================================
  // NEXT QUESTION
  // =====================================================

  const handleNext = () => {
    if (!selectedAnswer) {
      return;
    }

    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) =>
          previous + 1
      );

      setSelectedAnswer("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    // Last question
    finishQuiz();
  };

  // =====================================================
  // PREVIOUS QUESTION
  // =====================================================

  const handlePrevious = () => {
    if (
      currentQuestion === 0
    ) {
      return;
    }

    const previousIndex =
      currentQuestion - 1;

    setCurrentQuestion(
      previousIndex
    );

    const previousAnswer =
      answers.find(
        (item) =>
          String(
            item.questionId
          ) ===
          String(
            questions[
              previousIndex
            ]?._id
          )
      );

    if (previousAnswer) {
      setSelectedAnswer(
        previousAnswer.selectedAnswer
      );
    } else {
      setSelectedAnswer("");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // FINISH QUIZ
  // =====================================================

  const finishQuiz = async () => {
    try {
      setSubmitting(true);
      setError("");

      const token =
        getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      // =================================================
      // COPY EXISTING ANSWERS
      // =================================================

      let finalAnswers = [
        ...answers,
      ];

      // =================================================
      // CURRENT QUESTION ANSWER
      // =================================================

      if (
        question &&
        selectedAnswer
      ) {
        const existingIndex =
          finalAnswers.findIndex(
            (item) =>
              String(
                item.questionId
              ) ===
              String(
                question._id
              )
          );

        const correctAnswer =
          String(
            question.correctAnswer ||
              ""
          ).trim();

        const isCorrect =
          normalizeAnswer(
            selectedAnswer
          ) ===
          normalizeAnswer(
            correctAnswer
          );

        const currentAnswer = {
          questionId:
            question._id,

          selectedAnswer:
            selectedAnswer,

          correctAnswer:
            correctAnswer,

          isCorrect,
        };

        if (
          existingIndex ===
          -1
        ) {
          finalAnswers = [
            ...finalAnswers,
            currentAnswer,
          ];
        } else {
          finalAnswers[
            existingIndex
          ] = currentAnswer;
        }
      }

      // =================================================
      // REMOVE DUPLICATES
      // =================================================

      const uniqueAnswers =
        [];

      finalAnswers.forEach(
        (item) => {
          const exists =
            uniqueAnswers.some(
              (existing) =>
                String(
                  existing.questionId
                ) ===
                String(
                  item.questionId
                )
            );

          if (!exists) {
            uniqueAnswers.push(
              item
            );
          }
        }
      );

      finalAnswers =
        uniqueAnswers;

      // =================================================
      // FINAL SCORE
      // =================================================

      const finalScore =
        finalAnswers.filter(
          (item) =>
            item.isCorrect ===
            true
        ).length;

      // =================================================
      // WRONG ANSWERS
      // =================================================

      const wrongAnswers =
        finalAnswers.filter(
          (item) =>
            item.isCorrect ===
              false &&
            item.selectedAnswer
        ).length;

      // =================================================
      // UNANSWERED
      // =================================================

      const unanswered =
        Math.max(
          0,
          questions.length -
            finalAnswers.length
        );

      console.log(
        "Final Score:",
        finalScore
      );

      console.log(
        "Wrong:",
        wrongAnswers
      );

      console.log(
        "Unanswered:",
        unanswered
      );

      // =================================================
      // CATEGORY
      // =================================================

      let resultCategory =
        "all";

      if (
        categoryParam ===
        "chapter"
      ) {
        resultCategory =
          `chapter-${chapterParam}`;
      }

      else if (
        categoryParam ===
        "mahabharata"
      ) {
        resultCategory =
          "mahabharata";
      }

      // =================================================
      // SUBMIT DATA
      // =================================================

      const submitData = {
        category:
          resultCategory,

        chapter:
          categoryParam ===
          "chapter"
            ? Number(
                chapterParam
              )
            : null,

        answers:
          finalAnswers.map(
            (item) => ({
              questionId:
                item.questionId,

              selectedAnswer:
                item.selectedAnswer,
            })
          ),

        timeTaken: 0,
      };

      console.log(
        "Quiz Submit Data:",
        submitData
      );

      // =================================================
      // SUBMIT TO BACKEND
      // =================================================

      const response =
        await fetch(
          `${API_URL}/submit`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                submitData
              ),
          }
        );

      const data =
        await response.json();

      console.log(
        "Quiz Submit Response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Quiz result save થઈ શક્યું નથી."
        );
      }

      // =================================================
      // BACKEND SCORE
      // =================================================

      const backendScore =
        Number(
          data.result?.score
        );

      const finalResultScore =
        Number.isFinite(
          backendScore
        )
          ? backendScore
          : finalScore;

      // =================================================
      // SET FINAL DATA
      // =================================================

      setScore(
        finalResultScore
      );

      setAnswers(
        finalAnswers
      );

      // =================================================
      // COMPLETE QUIZ
      // =================================================

      setQuizCompleted(
        true
      );

    } catch (err) {
      console.error(
        "Submit Quiz Error:",
        err
      );

      setError(
        err.message ||
          "Quiz result save કરવામાં error આવ્યો."
      );

    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // RETRY
  // =====================================================

  const retryQuiz = () => {
    window.location.reload();
  };

  // =====================================================
  // EXIT
  // =====================================================

  const exitQuiz = () => {
    navigate("/quiz");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="quiz-page">

        <div className="quiz-loading">

          <div className="quiz-loading-icon">
            🕉️
          </div>

          <h2>
            Quiz લોડ થઈ રહ્યું છે...
          </h2>

          <p>
            કૃપા કરીને થોડી ક્ષણ રાહ જુઓ.
          </p>

        </div>

      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="quiz-page">

        <div className="quiz-error">

          <div className="quiz-error-icon">
            ❌
          </div>

          <h2>
            કંઈક સમસ્યા આવી
          </h2>

          <p>
            {error}
          </p>

          <div className="quiz-error-actions">

            <button
              type="button"
              onClick={retryQuiz}
            >
              🔄 ફરી પ્રયાસ કરો
            </button>

            <button
              type="button"
              onClick={exitQuiz}
            >
              ← Quiz Category
            </button>

          </div>

        </div>

      </main>
    );
  }

  // =====================================================
  // NO QUESTIONS
  // =====================================================

  if (
    questions.length === 0
  ) {
    return (
      <main className="quiz-page">

        <div className="quiz-empty">

          <div className="quiz-empty-icon">
            📖
          </div>

          <h2>
            Quiz ઉપલબ્ધ નથી
          </h2>

          <p>
            આ category માટે હાલમાં
            કોઈ question ઉપલબ્ધ નથી.
          </p>

          <button
            type="button"
            onClick={exitQuiz}
          >
            ← Quiz Category
          </button>

        </div>

      </main>
    );
  }

  // =====================================================
  // QUIZ COMPLETED
  // =====================================================

  if (quizCompleted) {

    const percentage =
      Math.round(
        (score /
          questions.length) *
          100
      );

    const correctCount =
      answers.filter(
        (item) =>
          item.isCorrect ===
          true
      ).length;

    const wrongCount =
      answers.filter(
        (item) =>
          item.isCorrect ===
            false &&
          item.selectedAnswer
      ).length;

    const unansweredCount =
      Math.max(
        0,
        questions.length -
          answers.length
      );

    // =================================================
    // RESULT MESSAGE
    // =================================================

    let resultMessage = "";
    let resultSuggestion = "";

    if (
      percentage === 100
    ) {
      resultMessage =
        "અદ્ભુત! 🎉 તમે બધા પ્રશ્નોના સાચા જવાબ આપ્યા.";

      resultSuggestion =
        "તમારી તૈયારી ખૂબ જ સરસ છે! આ જ રીતે આગળ વધતા રહો. 🌟";
    }

    else if (
      percentage >= 80
    ) {
      resultMessage =
        "ખૂબ સરસ! 👏 તમે ખૂબ સારું પ્રદર્શન કર્યું.";

      resultSuggestion =
        "થોડી વધુ પ્રેક્ટિસથી તમે 100% મેળવી શકો છો. 💪";
    }

    else if (
      percentage >= 60
    ) {
      resultMessage =
        "સારું પ્રદર્શન! 👍";

      resultSuggestion =
        "થોડી વધુ પ્રેક્ટિસ કરો અને તમારા સ્કોરને વધુ સારો બનાવો. 📖";
    }

    else if (
      percentage >= 40
    ) {
      resultMessage =
        "સારો પ્રયાસ! 😊";

      resultSuggestion =
        "જે પ્રશ્નોમાં ભૂલ થઈ છે તેનો ફરી અભ્યાસ કરો અને ફરી Quiz આપો. 📚";
    }

    else {
      resultMessage =
        "ચિંતા ન કરો! 😊 તમે Quiz પૂર્ણ કરી છે.";

      resultSuggestion =
        "વધુ ખોટા જવાબ આવ્યા છે. ફરીથી અભ્યાસ કરો અને ફરી Quiz આપો. 💪📖";
    }

    return (
      <main className="quiz-page quiz-result-page">

        <section className="quiz-complete-card">

          <div className="quiz-complete-icon">
            🏆
          </div>

          <h1 className="quiz-result-title">
            Quiz પૂર્ણ થયું!
          </h1>

          <p className="quiz-result-message">
            {resultMessage}
          </p>

          <p className="quiz-result-suggestion">
            {resultSuggestion}
          </p>

          <div
            className="quiz-percentage-circle"
            style={{
              "--percentage":
                `${percentage}%`,
            }}
          >
            <span>
              {percentage}%
            </span>
          </div>

          <div className="quiz-score-count">
            {score} / {questions.length}
          </div>

          <div className="quiz-result-summary">

            <div className="quiz-result-item quiz-result-correct">

              <strong>
                {correctCount}
              </strong>

              <span>
                સાચા
              </span>

            </div>

            <div className="quiz-result-item quiz-result-wrong">

              <strong>
                {wrongCount}
              </strong>

              <span>
                ખોટા
              </span>

            </div>

            <div className="quiz-result-item quiz-result-unanswered">

              <strong>
                {unansweredCount}
              </strong>

              <span>
                છોડેલા
              </span>

            </div>

          </div>

          <div className="quiz-complete-actions">

            <button
              type="button"
              onClick={retryQuiz}
            >
              🔄 ફરી Quiz આપો
            </button>

            <button
              type="button"
              onClick={exitQuiz}
            >
              📚 Quiz Category
            </button>

          </div>

        </section>

      </main>
    );
  }

  // =====================================================
  // PROGRESS
  // =====================================================

  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  // =====================================================
  // CURRENT ANSWER CORRECT
  // =====================================================

  const isAnswerCorrect =
    selectedAnswer &&
    normalizeAnswer(
      selectedAnswer
    ) ===
      normalizeAnswer(
        question?.correctAnswer
      );

  // =====================================================
  // QUIZ TITLE
  // =====================================================

  let quizTitle =
    "All Chapters";

  if (
    categoryParam ===
      "chapter" &&
    chapterParam
  ) {
    quizTitle =
      `અધ્યાય ${chapterParam}`;
  }

  if (
    categoryParam ===
    "mahabharata"
  ) {
    quizTitle =
      "Mahabharata Quiz";
  }

  // =====================================================
  // RENDER QUIZ
  // =====================================================

  return (
    <main className="quiz-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="quiz-header">

        <div className="quiz-header-left">

          <button
            type="button"
            className="quiz-back-btn"
            onClick={exitQuiz}
          >
            ←
          </button>

          <div>

            <span>
              🕉️ ભગવદ્ ગીતા Quiz
            </span>

            <h1>
              {quizTitle}
            </h1>

          </div>

        </div>

        <div className="quiz-score-badge">
          ⭐ {score}
        </div>

      </section>

      {/* =================================================
          PROGRESS
      ================================================= */}

      <section className="quiz-progress-section">

        <div className="quiz-progress-info">

          <span>
            પ્રશ્ન{" "}
            {currentQuestion + 1}
            {" / "}
            {questions.length}
          </span>

          <span>
            {Math.round(
              progress
            )}
            %
          </span>

        </div>

        <div className="quiz-progress-bar">

          <div
            className="quiz-progress-fill"
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>

      </section>

      {/* =================================================
          QUESTION CARD
      ================================================= */}

      <section className="quiz-question-card">

        <div className="quiz-question-number">
          પ્રશ્ન{" "}
          {currentQuestion + 1}
        </div>

        <h2 className="quiz-question-text">

          {question.question ||
            question.questionText ||
            "Question ઉપલબ્ધ નથી."}

        </h2>

        {/* =================================================
            OPTIONS
        ================================================= */}

        <div className="quiz-options">

          {getOptions().map(
            (
              option,
              index
            ) => {

              const optionText =
                typeof option ===
                "string"
                  ? option
                  : option?.text ||
                    option?.label ||
                    option?.value ||
                    "";

              const isSelected =
                normalizeAnswer(
                  selectedAnswer
                ) ===
                normalizeAnswer(
                  optionText
                );

              const isCorrect =
                normalizeAnswer(
                  optionText
                ) ===
                normalizeAnswer(
                  question.correctAnswer
                );

              let optionClass =
                "quiz-option";

              // =================================================
              // AFTER ANSWER
              // =================================================

              if (
                selectedAnswer
              ) {

                if (
                  isCorrect
                ) {
                  optionClass +=
                    " correct";
                }

                if (
                  isSelected &&
                  !isCorrect
                ) {
                  optionClass +=
                    " wrong";
                }

                if (
                  isSelected
                ) {
                  optionClass +=
                    " selected";
                }
              }

              return (
                <button
                  key={index}
                  type="button"
                  className={
                    optionClass
                  }
                  onClick={() =>
                    handleAnswer(
                      optionText
                    )
                  }
                  disabled={
                    Boolean(
                      selectedAnswer
                    ) ||
                    submitting
                  }
                >

                  <span className="quiz-option-letter">
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  <span className="quiz-option-text">
                    {optionText}
                  </span>

                  {selectedAnswer &&
                    isCorrect && (
                      <span className="quiz-option-icon">
                        ✓
                      </span>
                    )}

                  {selectedAnswer &&
                    isSelected &&
                    !isCorrect && (
                      <span className="quiz-option-icon">
                        ✕
                      </span>
                    )}

                </button>
              );
            }
          )}

        </div>

        {/* =================================================
            ANSWER FEEDBACK
        ================================================= */}

        {selectedAnswer && (

          <div
            className={
              isAnswerCorrect
                ? "quiz-answer-feedback correct"
                : "quiz-answer-feedback wrong"
            }
          >

            {isAnswerCorrect ? (

              <>
                <strong>
                  ✓ સાચો જવાબ!
                </strong>

                <span>
                  ખૂબ સરસ! 👏
                </span>
              </>

            ) : (

              <>
                <strong>
                  ✕ ખોટો જવાબ
                </strong>

                <span>
                  સાચો જવાબ:{" "}
                  <b>
                    {
                      question.correctAnswer
                    }
                  </b>
                </span>
              </>

            )}

          </div>

        )}

        {/* =================================================
            EXPLANATION
        ================================================= */}

        {selectedAnswer && (
          <div className="quiz-explanation">

            <div className="quiz-explanation-title">
              💡 સમજણ
            </div>

            <div className="quiz-explanation-text">
              {question.explanation ||
                question.explanationText ||
                "આ પ્રશ્ન માટે કોઈ સમજણ ઉપલબ્ધ નથી."}
            </div>

          </div>
        )}

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="quiz-navigation">

          <button
            type="button"
            className="quiz-prev-btn"
            onClick={
              handlePrevious
            }
            disabled={
              currentQuestion ===
                0 ||
              submitting
            }
          >
            ← પાછલો પ્રશ્ન
          </button>

          <button
            type="button"
            className="quiz-next-btn"
            onClick={
              handleNext
            }
            disabled={
              !selectedAnswer ||
              submitting
            }
          >

            {submitting
              ? "Result save થઈ રહ્યું છે..."
              : currentQuestion ===
                questions.length - 1
              ? "Quiz પૂર્ણ કરો 🏆"
              : "આગળનો પ્રશ્ન →"}

          </button>

        </div>

      </section>

    </main>
  );
}

export default Quiz;