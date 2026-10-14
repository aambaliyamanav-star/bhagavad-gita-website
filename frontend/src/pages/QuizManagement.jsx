import { getValidToken, handleAuth401, clearAuthSession } from "../utils/authHelper.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Save,
  Plus,
  Library,
  BookOpen,
  RefreshCw,
  Search,
  Lightbulb,
  Trash2,
  Edit3,
  Loader2,
  ArrowLeft,
  Check,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileQuestion,
  Sparkles
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./QuizManagement.css";

function QuizManagement() {
  const navigate = useNavigate();
  const { isHindi, isEnglish, isGujarati, txt } = useLanguage();
  // =====================================================
  // API
  // =====================================================

  const API_URL =
    "https://bhagavad-gita-website.onrender.com/api/quiz";

  // =====================================================
  // STATE
  // =====================================================

  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  // Active language tab: "gu" (Gujarati) or "hi" (Hindi)
  const [activeLangTab, setActiveLangTab] = useState("gu");
  const [translating, setTranslating] = useState(false);
  const [autoTranslateSuccess, setAutoTranslateSuccess] = useState("");

  // =====================================================
  // EXPANDED QUESTION
  // =====================================================

  const [expandedQuestionId, setExpandedQuestionId] =
    useState(null);

  // =====================================================
  // QUESTION FILTER
  // =====================================================

  const [questionFilter, setQuestionFilter] =
    useState("all");

  // =====================================================
  // FORM
  // =====================================================

  const [formData, setFormData] =
    useState({
      category: "all",
      chapterNumber: "",
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctAnswer: "",
      explanation: "",
      // Hindi fields
      questionHi: "",
      option1Hi: "",
      option2Hi: "",
      option3Hi: "",
      option4Hi: "",
      correctAnswerHi: "",
      explanationHi: "",
      // English fields
      questionEn: "",
      option1En: "",
      option2En: "",
      option3En: "",
      option4En: "",
      correctAnswerEn: "",
      explanationEn: "",
    });

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return getValidToken();
  };

  // =====================================================
  // LOAD QUESTIONS
  // =====================================================

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/admin/questions`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Questions load થઈ શક્યા નથી."
        );
      }

      setQuestions(
        data.questions || []
      );

    } catch (error) {
      console.error(
        "Load Quiz Questions Error:",
        error
      );

      setError(
        error.message ||
          "Questions load કરવામાં error આવ્યો."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadQuestions();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setError("");
    setSuccess("");
  };

  // =====================================================
  // CATEGORY CHANGE
  // =====================================================

  const handleCategoryChange = (event) => {
    const category =
      event.target.value;

    setFormData(
      (previous) => ({
        ...previous,

        category,

        chapterNumber:
          category.startsWith(
            "chapter-"
          )
            ? category.replace(
                "chapter-",
                ""
              )
            : "",
      })
    );

    setError("");
    setSuccess("");
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData({
      category: "all",
      chapterNumber: "",
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctAnswer: "",
      explanation: "",
      questionHi: "",
      option1Hi: "",
      option2Hi: "",
      option3Hi: "",
      option4Hi: "",
      correctAnswerHi: "",
      explanationHi: "",
      questionEn: "",
      option1En: "",
      option2En: "",
      option3En: "",
      option4En: "",
      correctAnswerEn: "",
      explanationEn: "",
    });

    setEditingId(null);
    setActiveLangTab("gu");
    setError("");
    setSuccess("");
    setAutoTranslateSuccess("");
  };

  // =====================================================
  // EDIT QUESTION
  // =====================================================

  const handleEdit = (question) => {
    let category =
      question.category || "all";

    let chapterNumber =
      question.chapterNumber || "";

    // -------------------------------------------------
    // OLD DATA SUPPORT
    // -------------------------------------------------

    if (
      category.startsWith(
        "chapter-"
      )
    ) {
      chapterNumber =
        category.replace(
          "chapter-",
          ""
        );
    }

    setEditingId(
      question._id
    );

    setFormData({
      category,

      chapterNumber,

      question:
        question.question || "",

      option1:
        question.options?.[0] || "",

      option2:
        question.options?.[1] || "",

      option3:
        question.options?.[2] || "",

      option4:
        question.options?.[3] || "",

      correctAnswer:
        question.correctAnswer || "",

      explanation:
        question.explanation || "",

      // Hindi fields
      questionHi:
        question.questionHi || "",

      option1Hi:
        question.optionsHi?.[0] || "",

      option2Hi:
        question.optionsHi?.[1] || "",

      option3Hi:
        question.optionsHi?.[2] || "",

      option4Hi:
        question.optionsHi?.[3] || "",

      correctAnswerHi:
        question.correctAnswerHi || "",

      explanationHi:
        question.explanationHi || "",

      // English fields
      questionEn:
        question.questionEn || "",

      option1En:
        question.optionsEn?.[0] || "",

      option2En:
        question.optionsEn?.[1] || "",

      option3En:
        question.optionsEn?.[2] || "",

      option4En:
        question.optionsEn?.[3] || "",

      correctAnswerEn:
        question.correctAnswerEn || "",

      explanationEn:
        question.explanationEn || "",
    });

    setActiveLangTab("gu");
    setError("");
    setSuccess("");
    setAutoTranslateSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // AI AUTO-TRANSLATE (GUJARATI -> HINDI & ENGLISH)
  // =====================================================

  const handleAutoTranslate = async (targetLang = "all") => {
    try {
      setTranslating(true);
      setError("");
      setAutoTranslateSuccess("");

      if (!formData.question || !formData.question.trim()) {
        throw new Error(
          "કૃપા કરીને પહેલાં ગુજરાતી પ્રશ્ન (Question) લખો જેથી AI તેનું હિન્દી અને અંગ્રેજીમાં ઓટો-અનુવાદ કરી શકે."
        );
      }

      const rawOptions = [
        formData.option1,
        formData.option2,
        formData.option3,
        formData.option4,
      ].map((o) => (o || "").trim());

      if (rawOptions.some((o) => !o)) {
        throw new Error(
          "કૃપા કરીને પહેલાં ચારેય ગુજરાતી વિકલ્પો (Options 1 થી 4) ભરો જેથી AI તેનું અનુવાદ કરી શકે."
        );
      }

      if (!formData.correctAnswer || !formData.correctAnswer.trim()) {
        throw new Error(
          "કૃપા કરીને પહેલાં સાચો જવાબ (Correct Answer) પસંદ કરો."
        );
      }

      const token = getToken();

      const response = await fetch(`${API_URL}/admin/auto-translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: formData.category,
          chapterNumber: formData.chapterNumber,
          question: formData.question,
          options: rawOptions,
          correctAnswer: formData.correctAnswer,
          explanation: formData.explanation,
          targetLang: targetLang || "all",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "ઓટો-અનુવાદ થઈ શક્યો નથી."
        );
      }

      const translated = data?.data || data?.translated;

      if (!translated) {
        throw new Error(
          data?.message || "ઓટો-અનુવાદ માહિતી પ્રાપ્ત થઈ શકી નથી."
        );
      }

      setFormData((prev) => ({
        ...prev,
        questionHi:
          translated.questionHi || prev.questionHi,
        option1Hi:
          translated.optionsHi?.[0] || prev.option1Hi,
        option2Hi:
          translated.optionsHi?.[1] || prev.option2Hi,
        option3Hi:
          translated.optionsHi?.[2] || prev.option3Hi,
        option4Hi:
          translated.optionsHi?.[3] || prev.option4Hi,
        correctAnswerHi:
          translated.correctAnswerHi || prev.correctAnswerHi,
        explanationHi:
          translated.explanationHi || prev.explanationHi,

        // English fields
        questionEn:
          translated.questionEn || prev.questionEn,
        option1En:
          translated.optionsEn?.[0] || prev.option1En,
        option2En:
          translated.optionsEn?.[1] || prev.option2En,
        option3En:
          translated.optionsEn?.[2] || prev.option3En,
        option4En:
          translated.optionsEn?.[3] || prev.option4En,
        correctAnswerEn:
          translated.correctAnswerEn || prev.correctAnswerEn,
        explanationEn:
          translated.explanationEn || prev.explanationEn,
      }));

      setAutoTranslateSuccess(
        "✨ ગુજરાતી પ્રશ્ન અને વિકલ્પોનું હિન્દી અને અંગ્રેજીમાં સફળતાપૂર્વક AI ઓટો-અનુવાદ થઈ ગયું!"
      );
      if (targetLang === "en") {
        setActiveLangTab("en");
      } else if (targetLang === "hi") {
        setActiveLangTab("hi");
      }
    } catch (err) {
      console.error("Auto translate error:", err);
      setError(
        err.message || "ઓટો-અનુવાદ કરવામાં error આવ્યો."
      );
    } finally {
      setTranslating(false);
    }
  };

  // =====================================================
  // TOGGLE QUESTION
  // =====================================================

  const toggleQuestion = (id) => {
    setExpandedQuestionId(
      (previous) =>
        previous === id
          ? null
          : id
    );
  };

  // =====================================================
  // SUBMIT FORM
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------------------------
    // CATEGORY VALIDATION
    // -------------------------------------------------

    if (!formData.category) {
      setError(
        "Category પસંદ કરો."
      );
      return;
    }

    // -------------------------------------------------
    // CHAPTER VALIDATION
    // -------------------------------------------------

    if (
      formData.category.startsWith(
        "chapter-"
      )
    ) {
      if (
        !formData.chapterNumber
      ) {
        setError(
          "Chapter number જરૂરી છે."
        );
        return;
      }

      const chapter =
        Number(
          formData.chapterNumber
        );

      if (
        chapter < 1 ||
        chapter > 18
      ) {
        setError(
          "Chapter number 1 થી 18 વચ્ચે હોવો જોઈએ."
        );
        return;
      }
    }

    // -------------------------------------------------
    // QUESTION VALIDATION
    // -------------------------------------------------

    if (
      !formData.question.trim()
    ) {
      setError(
        "Question લખો."
      );
      return;
    }

    // -------------------------------------------------
    // OPTIONS
    // -------------------------------------------------

    const options = [
      formData.option1,
      formData.option2,
      formData.option3,
      formData.option4,
    ].map((option) =>
      option.trim()
    );

    if (
      options.some(
        (option) => !option
      )
    ) {
      setError(
        "ચારેય options ભરવા જરૂરી છે."
      );
      return;
    }

    // -------------------------------------------------
    // CORRECT ANSWER
    // -------------------------------------------------

    if (
      !formData.correctAnswer.trim()
    ) {
      setError(
        "Correct answer પસંદ કરો."
      );
      return;
    }

    if (
      !options.includes(
        formData.correctAnswer.trim()
      )
    ) {
      setError(
        "Correct answer options માંથી જ હોવો જોઈએ."
      );
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      // =================================================
      // PREPARE CATEGORY + CHAPTER
      // =================================================

      let finalCategory =
        formData.category;

      let finalChapterNumber =
        null;

      // -------------------------------------------------
      // CHAPTER QUESTION
      // -------------------------------------------------

      if (
        formData.category.startsWith(
          "chapter-"
        )
      ) {
        finalChapterNumber =
          Number(
            formData.chapterNumber
          );

        finalCategory =
          `chapter-${finalChapterNumber}`;
      }

      // -------------------------------------------------
      // MAHABHARATA
      // -------------------------------------------------

      if (
        formData.category ===
        "mahabharata"
      ) {
        finalChapterNumber = null;
      }

      // -------------------------------------------------
      // ALL / GENERAL
      // -------------------------------------------------

      if (
        formData.category ===
        "all"
      ) {
        finalChapterNumber = null;
      }

      // =================================================
      // HINDI DATA PREPARATION
      // =================================================

      const rawOptionsHi = [
        formData.option1Hi,
        formData.option2Hi,
        formData.option3Hi,
        formData.option4Hi,
      ].map((opt) => String(opt || "").trim());

      let finalCorrectAnswerHi = formData.correctAnswerHi?.trim() || "";
      if (!finalCorrectAnswerHi && rawOptionsHi.some(Boolean)) {
        const correctIndex = options.findIndex(
          (opt) => opt.toLowerCase() === formData.correctAnswer.trim().toLowerCase()
        );
        if (correctIndex !== -1 && rawOptionsHi[correctIndex]) {
          finalCorrectAnswerHi = rawOptionsHi[correctIndex];
        }
      }

      // =================================================
      // ENGLISH DATA PREPARATION
      // =================================================

      const rawOptionsEn = [
        formData.option1En,
        formData.option2En,
        formData.option3En,
        formData.option4En,
      ].map((opt) => String(opt || "").trim());

      let finalCorrectAnswerEn = formData.correctAnswerEn?.trim() || "";
      if (!finalCorrectAnswerEn && rawOptionsEn.some(Boolean)) {
        const correctIndex = options.findIndex(
          (opt) => opt.toLowerCase() === formData.correctAnswer.trim().toLowerCase()
        );
        if (correctIndex !== -1 && rawOptionsEn[correctIndex]) {
          finalCorrectAnswerEn = rawOptionsEn[correctIndex];
        }
      }

      // =================================================
      // PAYLOAD
      // =================================================

      const payload = {
        category:
          finalCategory,

        chapterNumber:
          finalChapterNumber,

        question:
          formData.question.trim(),

        options,

        correctAnswer:
          formData.correctAnswer.trim(),

        explanation:
          formData.explanation.trim(),

        // Hindi fields
        questionHi:
          formData.questionHi?.trim() || "",

        optionsHi:
          rawOptionsHi,

        correctAnswerHi:
          finalCorrectAnswerHi,

        explanationHi:
          formData.explanationHi?.trim() || "",

        // English fields
        questionEn:
          formData.questionEn?.trim() || "",

        optionsEn:
          rawOptionsEn,

        correctAnswerEn:
          finalCorrectAnswerEn,

        explanationEn:
          formData.explanationEn?.trim() || "",
      };

      let response;

      // =================================================
      // UPDATE
      // =================================================

      if (editingId) {
        response = await fetch(
          `${API_URL}/admin/question/${editingId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );
      }

      // =================================================
      // ADD
      // =================================================

      else {
        response = await fetch(
          `${API_URL}/admin/question`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Question save થઈ શક્યો નથી."
        );
      }

      setSuccess(
        data.message ||
          "Question successfully save થયો."
      );

      resetForm();

      await loadQuestions();

    } catch (error) {
      console.error(
        "Save Quiz Question Error:",
        error
      );

      setError(
        error.message ||
          "Question save કરવામાં error આવ્યો."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE QUESTION
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "શું તમે ખરેખર આ quiz question delete કરવા માંગો છો?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const token = getToken();

      const response =
        await fetch(
          `${API_URL}/admin/question/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Question delete થઈ શક્યો નથી."
        );
      }

      setSuccess(
        data.message ||
          "Question delete થયો."
      );

      if (
        editingId === id
      ) {
        resetForm();
      }

      if (
        expandedQuestionId === id
      ) {
        setExpandedQuestionId(
          null
        );
      }

      await loadQuestions();

    } catch (error) {
      console.error(
        "Delete Quiz Question Error:",
        error
      );

      setError(
        error.message ||
          "Question delete કરવામાં error આવ્યો."
      );
    }
  };

  // =====================================================
  // CATEGORY NAME
  // =====================================================

  const getCategoryName = (
    category,
    chapterNumber
  ) => {
    // -------------------------------------------------
    // CHAPTER
    // -------------------------------------------------

    if (
      category &&
      String(category).startsWith(
        "chapter-"
      )
    ) {
      const number =
        chapterNumber ||
        String(category).replace(
          "chapter-",
          ""
        );

      return `અધ્યાય ${number}`;
    }

    // -------------------------------------------------
    // MAHABHARATA
    // -------------------------------------------------

    if (
      category ===
      "mahabharata"
    ) {
      return "સમગ્ર મહાભારત";
    }

    // -------------------------------------------------
    // ALL / GENERAL
    // -------------------------------------------------

    if (
      category === "all"
    ) {
      return "All / General";
    }

    return category;
  };

  // =====================================================
  // FILTER QUESTIONS
  // =====================================================

  const filteredQuestions =
    questions.filter(
      (item) => {

        // ---------------------------------------------
        // ALL
        // ---------------------------------------------

        if (
          questionFilter ===
          "all"
        ) {
          return true;
        }

        // ---------------------------------------------
        // MAHABHARATA
        // ---------------------------------------------

        if (
          questionFilter ===
          "mahabharata"
        ) {
          return (
            item.category ===
            "mahabharata"
          );
        }

        // ---------------------------------------------
        // CHAPTER
        // ---------------------------------------------

        if (
          questionFilter.startsWith(
            "chapter-"
          )
        ) {
          const selectedChapter =
            Number(
              questionFilter.replace(
                "chapter-",
                ""
              )
            );

          const itemChapter =
            Number(
              item.chapterNumber
            );

          const itemCategory =
            String(
              item.category || ""
            );

          // New data
          if (
            itemChapter ===
            selectedChapter
          ) {
            return true;
          }

          // Old data support
          if (
            itemCategory ===
            `chapter-${selectedChapter}`
          ) {
            return true;
          }

          return false;
        }

        return false;
      }
    );

  // =====================================================
  // FILTER CHANGE
  // =====================================================

  const handleQuestionFilterChange = (
    event
  ) => {
    const filter =
      event.target.value;

    setQuestionFilter(filter);

    // Close opened question
    setExpandedQuestionId(null);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="quiz-management-page">

        <div className="quiz-management-loading">
          <span>
            <Loader2 className="btn-icon animate-spin" size={20} />{" "}
            {txt("Quiz questions load થઈ રહ્યા છે...", "Quiz प्रश्न लोड हो रहे हैं...", "Loading quiz questions...")}
          </span>
        </div>

      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="quiz-management-page">

      {/* =================================================
          HEADER
      ================================================= */}

<section className="quiz-management-header">

  <div className="quiz-management-icon">
    <BrainCircuit size={34} color="#1d4ed8" strokeWidth={1.75} />
  </div>

  <div className="quiz-management-header-content">

    <h1>
      Quiz Management
    </h1>
  </div>

  <button
    type="button"
    className="quiz-dashboard-back-button"
    onClick={() => navigate("/admin")}
  >
    <ArrowLeft className="btn-icon" size={16} /> Admin Dashboard
  </button>

</section>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {error && (
        <div className="quiz-management-error">
          <AlertCircle className="btn-icon" size={18} /> {error}
        </div>
      )}

      {success && (
        <div className="quiz-management-success">
          <CheckCircle2 className="btn-icon" size={18} /> {success}
        </div>
      )}


      {/* =================================================
          FORM
      ================================================= */}

      <section className="quiz-form-card">

        <div className="quiz-form-title">

          <h2>
            {editingId ? (
              <span>
                <Edit3 className="btn-icon" size={20} /> Quiz Question Edit કરો
              </span>
            ) : (
              <span>
                <Plus className="btn-icon" size={20} /> New Quiz Question Add કરો
              </span>
            )}
          </h2>

          {editingId && (
            <button
              type="button"
              className="quiz-cancel-button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </div>


        <form
          onSubmit={handleSubmit}
        >

          {/* =================================================
              CATEGORY
          ================================================= */}

          <div className="quiz-form-group">

            <label>
              Category
            </label>

            <select
              name="category"
              value={
                formData.category
              }
              onChange={
                handleCategoryChange
              }
            >

              <option value="all">
                All / General
              </option>

              {Array.from(
                { length: 18 },
                (_, index) => (
                  <option
                    key={index + 1}
                    value={`chapter-${index + 1}`}
                  >
                    અધ્યાય {index + 1}
                  </option>
                )
              )}

              <option value="mahabharata">
                સમગ્ર મહાભારત
              </option>

            </select>

          </div>


          {/* =================================================
              CHAPTER INFORMATION
          ================================================= */}

          {formData.category.startsWith(
            "chapter-"
          ) && (
            <div className="quiz-form-group">

              <label>
                Chapter Number
              </label>

              <input
                type="number"
                name="chapterNumber"
                value={
                  formData.chapterNumber
                }
                onChange={
                  handleChange
                }
                min="1"
                max="18"
                placeholder="1 થી 18"
              />

              <small>
                આ question આ અધ્યાયમાં
                અને "બધા અધ્યાય" quizમાં દેખાશે.
              </small>

            </div>
          )}


          {/* =================================================
              AUTO TRANSLATE SUCCESS BANNER
          ================================================= */}
          {autoTranslateSuccess && (
            <div className="auto-translate-success-banner">
              <CheckCircle2 size={18} />
              <span>{autoTranslateSuccess}</span>
            </div>
          )}

          {/* =================================================
              LANGUAGE TABS & AI AUTO-TRANSLATE
          ================================================= */}
          <div className="admin-lang-tabs-bar" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className={`admin-lang-tab ${activeLangTab === "gu" ? "active" : ""}`}
                onClick={() => setActiveLangTab("gu")}
              >
                🇬🇯 ગુજરાતી પ્રશ્ન & વિકલ્પો
              </button>
              <button
                type="button"
                className={`admin-lang-tab ${activeLangTab === "hi" ? "active" : ""}`}
                onClick={() => setActiveLangTab("hi")}
              >
                🇮🇳 हिन्दी प्रश्न एवं विकल्प (Auto)
              </button>
              <button
                type="button"
                className={`admin-lang-tab ${activeLangTab === "en" ? "active" : ""}`}
                onClick={() => setActiveLangTab("en")}
              >
                🇬🇧 English Question & Options (Auto)
              </button>
            </div>

            <button
              type="button"
              className="auto-translate-ai-btn"
              onClick={() => handleAutoTranslate("all")}
              disabled={translating}
              title="ગુજરાતી પ્રશ્ન અને વિકલ્પો પરથી AI દ્વારા આપોઆપ હિન્દી અને અંગ્રેજી અનુવાદ કરો"
            >
              <Sparkles className={`btn-icon ${translating ? "spinning" : ""}`} size={16} />
              {translating
                ? txt("AI અનુવાદ થઈ રહ્યું છે...", "AI अनुवाद हो रहा है...", "AI translating...")
                : txt("✨ AI બધી ભાષા ઓટો-અનુવાદ (Hindi & English)", "✨ AI सभी भाषा ऑटो-अनुवाद (Hindi & English)", "✨ AI Auto-Translate (Hindi & English)")}
            </button>
          </div>

          {activeLangTab === "gu" && (
            <>
              {/* =================================================
                  GUJARATI QUESTION
              ================================================= */}
              <div className="quiz-form-group">
                <label>
                  Question (ગુજરાતી પ્રશ્ન) <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="Quiz question લખો..."
                  rows="4"
                  required
                />
              </div>

              {/* GUJARATI OPTION 1 */}
              <div className="quiz-form-group">
                <label>
                  Option 1 (ગુજરાતી) <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <input
                  type="text"
                  name="option1"
                  value={formData.option1}
                  onChange={handleChange}
                  placeholder="Option 1"
                  required
                />
              </div>

              {/* GUJARATI OPTION 2 */}
              <div className="quiz-form-group">
                <label>
                  Option 2 (ગુજરાતી) <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <input
                  type="text"
                  name="option2"
                  value={formData.option2}
                  onChange={handleChange}
                  placeholder="Option 2"
                  required
                />
              </div>

              {/* GUJARATI OPTION 3 */}
              <div className="quiz-form-group">
                <label>
                  Option 3 (ગુજરાતી) <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <input
                  type="text"
                  name="option3"
                  value={formData.option3}
                  onChange={handleChange}
                  placeholder="Option 3"
                  required
                />
              </div>

              {/* GUJARATI OPTION 4 */}
              <div className="quiz-form-group">
                <label>
                  Option 4 (ગુજરાતી) <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <input
                  type="text"
                  name="option4"
                  value={formData.option4}
                  onChange={handleChange}
                  placeholder="Option 4"
                  required
                />
              </div>

              {/* GUJARATI CORRECT ANSWER */}
              <div className="quiz-form-group">
                <label>
                  Correct Answer (સાચો જવાબ) <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <select
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Correct Answer પસંદ કરો --</option>
                  {[
                    formData.option1,
                    formData.option2,
                    formData.option3,
                    formData.option4,
                  ]
                    .filter((option) => option && option.trim())
                    .map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
              </div>

              {/* GUJARATI EXPLANATION */}
              <div className="quiz-form-group">
                <label>
                  Explanation (સમજણ) <span> (Optional)</span>
                </label>
                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleChange}
                  placeholder="Answer નું explanation લખો..."
                  rows="3"
                />
              </div>
            </>
          )}

          {activeLangTab === "hi" && (
            <>
              {/* =================================================
                  HINDI QUESTION (AUTO-TRANSLATED / EDITABLE)
              ================================================= */}
              <div className="quiz-form-group">
                <label>
                  Question (हिन्दी प्रश्न) - <i>AI દ્વારા આપોઆપ ભરાશે અથવા તમે જાતે પણ લખી શકો છો</i>
                </label>
                <textarea
                  name="questionHi"
                  value={formData.questionHi}
                  onChange={handleChange}
                  placeholder="हिन्दी में प्रश्न લખો અથવા ઉપર '✨ AI હિન્દી ઓટો-અનુવાદ' બટન દબાવો..."
                  rows="4"
                />
              </div>

              {/* HINDI OPTION 1 */}
              <div className="quiz-form-group">
                <label>Option 1 (हिन्दी)</label>
                <input
                  type="text"
                  name="option1Hi"
                  value={formData.option1Hi}
                  onChange={handleChange}
                  placeholder="हिन्दी Option 1"
                />
              </div>

              {/* HINDI OPTION 2 */}
              <div className="quiz-form-group">
                <label>Option 2 (हिन्दी)</label>
                <input
                  type="text"
                  name="option2Hi"
                  value={formData.option2Hi}
                  onChange={handleChange}
                  placeholder="हिन्दी Option 2"
                />
              </div>

              {/* HINDI OPTION 3 */}
              <div className="quiz-form-group">
                <label>Option 3 (हिन्दी)</label>
                <input
                  type="text"
                  name="option3Hi"
                  value={formData.option3Hi}
                  onChange={handleChange}
                  placeholder="हिन्दी Option 3"
                />
              </div>

              {/* HINDI OPTION 4 */}
              <div className="quiz-form-group">
                <label>Option 4 (हिन्दी)</label>
                <input
                  type="text"
                  name="option4Hi"
                  value={formData.option4Hi}
                  onChange={handleChange}
                  placeholder="हिन्दी Option 4"
                />
              </div>

              {/* HINDI CORRECT ANSWER */}
              <div className="quiz-form-group">
                <label>
                  Correct Answer (हिन्दी सही उत्तर)
                </label>
                <select
                  name="correctAnswerHi"
                  value={formData.correctAnswerHi}
                  onChange={handleChange}
                >
                  <option value="">-- हिन्दी Correct Answer પસંદ કરો --</option>
                  {[
                    formData.option1Hi,
                    formData.option2Hi,
                    formData.option3Hi,
                    formData.option4Hi,
                  ]
                    .filter((option) => option && option.trim())
                    .map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
              </div>

              {/* HINDI EXPLANATION */}
              <div className="quiz-form-group">
                <label>
                  Explanation (हिन्दी व्याख्या) <span> (Optional)</span>
                </label>
                <textarea
                  name="explanationHi"
                  value={formData.explanationHi}
                  onChange={handleChange}
                  placeholder="हिन्दी में व्याख्या લખો અથવા AI ઓટો-અનુવાદ વાપરો..."
                  rows="3"
                />
              </div>
            </>
          )}

          {activeLangTab === "en" && (
            <>
              {/* =================================================
                  ENGLISH QUESTION (AUTO-TRANSLATED / EDITABLE)
              ================================================= */}
              <div className="quiz-form-group">
                <label>
                  Question (English Question) - <i>AI દ્વારા આપોઆપ ભરાશે અથવા તમે જાતે પણ લખી શકો છો</i>
                </label>
                <textarea
                  name="questionEn"
                  value={formData.questionEn}
                  onChange={handleChange}
                  placeholder="Type question in English or click '✨ AI બધી ભાષા ઓટો-અનુવાદ' above..."
                  rows="4"
                />
              </div>

              {/* ENGLISH OPTION 1 */}
              <div className="quiz-form-group">
                <label>Option 1 (English)</label>
                <input
                  type="text"
                  name="option1En"
                  value={formData.option1En}
                  onChange={handleChange}
                  placeholder="English Option 1"
                />
              </div>

              {/* ENGLISH OPTION 2 */}
              <div className="quiz-form-group">
                <label>Option 2 (English)</label>
                <input
                  type="text"
                  name="option2En"
                  value={formData.option2En}
                  onChange={handleChange}
                  placeholder="English Option 2"
                />
              </div>

              {/* ENGLISH OPTION 3 */}
              <div className="quiz-form-group">
                <label>Option 3 (English)</label>
                <input
                  type="text"
                  name="option3En"
                  value={formData.option3En}
                  onChange={handleChange}
                  placeholder="English Option 3"
                />
              </div>

              {/* ENGLISH OPTION 4 */}
              <div className="quiz-form-group">
                <label>Option 4 (English)</label>
                <input
                  type="text"
                  name="option4En"
                  value={formData.option4En}
                  onChange={handleChange}
                  placeholder="English Option 4"
                />
              </div>

              {/* ENGLISH CORRECT ANSWER */}
              <div className="quiz-form-group">
                <label>
                  Correct Answer (English Correct Answer)
                </label>
                <select
                  name="correctAnswerEn"
                  value={formData.correctAnswerEn}
                  onChange={handleChange}
                >
                  <option value="">-- Select English Correct Answer --</option>
                  {[
                    formData.option1En,
                    formData.option2En,
                    formData.option3En,
                    formData.option4En,
                  ]
                    .filter((option) => option && option.trim())
                    .map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
              </div>

              {/* ENGLISH EXPLANATION */}
              <div className="quiz-form-group">
                <label>
                  Explanation (English Explanation) <span> (Optional)</span>
                </label>
                <textarea
                  name="explanationEn"
                  value={formData.explanationEn}
                  onChange={handleChange}
                  placeholder="Explain why this answer is correct in English..."
                  rows="3"
                />
              </div>
            </>
          )}


          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="quiz-form-actions">

            <button
              type="submit"
              className="quiz-save-button"
              disabled={saving}
            >
              {saving ? (
                <span>
                  <Loader2 className="btn-icon animate-spin" size={16} />{" "}
                  {txt("સાચવી રહ્યું છે...", "सहेजा जा रहा है...", "Saving...")}
                </span>
              ) : editingId ? (
                <span>
                  <Save className="btn-icon" size={16} /> Update Question
                </span>
              ) : (
                <span>
                  <Plus className="btn-icon" size={16} /> Add Question
                </span>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                className="quiz-cancel-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </section>


      {/* =================================================
          QUESTIONS LIST
      ================================================= */}

      <section className="quiz-question-list-section">

        {/* =================================================
            LIST HEADER
        ================================================= */}

        <div className="quiz-list-header">

          <div>

            <h2>
              <span className="quiz-heading-icon-wrap">
                <FileQuestion size={22} />
              </span>
              Quiz Questions
            </h2>

            <p>
              કુલ{" "}
              {filteredQuestions.length}{" "}
              questions
            </p>

          </div>


          {/* =================================================
              FILTER
          ================================================= */}

          <div className="quiz-question-filter">

            <label htmlFor="question-filter">
              Filter:
            </label>

            <select
              id="question-filter"
              value={
                questionFilter
              }
              onChange={
                handleQuestionFilterChange
              }
            >

              <option value="all">
                <Library className="btn-icon" size={16} /> બધા Questions
              </option>

              {Array.from(
                { length: 18 },
                (_, index) => (
                  <option
                    key={index + 1}
                    value={`chapter-${index + 1}`}
                  >
                    <BookOpen className="btn-icon" size={16} /> અધ્યાય {index + 1}
                  </option>
                )
              )}

              <option value="mahabharata">
                સમગ્ર મહાભારત
              </option>

            </select>

          </div>


          {/* =================================================
              REFRESH
          ================================================= */}

          <button
            type="button"
            className="quiz-refresh-button"
            onClick={
              loadQuestions
            }
          >
            <RefreshCw className="btn-icon" size={16} /> Refresh
          </button>

        </div>


        {/* =================================================
            NO QUESTIONS AFTER FILTER
        ================================================= */}

        {questions.length === 0 ? (

          <div className="quiz-no-questions">

            <div className="quiz-no-questions-icon">
              <BookOpen size={42} strokeWidth={1.5} color="#3b82f6" />
            </div>

            <h3>
              હજુ કોઈ quiz question નથી.
            </h3>

            <p>
              ઉપરથી પ્રથમ question add કરો.
            </p>

          </div>

        ) : filteredQuestions.length === 0 ? (

          <div className="quiz-no-questions">

            <div className="quiz-no-questions-icon">
              <Search size={42} strokeWidth={1.5} color="#3b82f6" />
            </div>

            <h3>
              આ filter માટે કોઈ question નથી.
            </h3>

            <p>
              બીજો chapter પસંદ કરો અથવા
              "બધા Questions" પસંદ કરો.
            </p>

          </div>

        ) : (

          /* =================================================
              QUESTION GRID
          ================================================= */

          <div className="quiz-question-grid">

            {filteredQuestions.map(
              (item, index) => {

                const isExpanded =
                  expandedQuestionId ===
                  item._id;

                return (
                  <article
                    className={
                      isExpanded
                        ? "quiz-question-card expanded"
                        : "quiz-question-card collapsed"
                    }
                    key={item._id}
                  >

                    {/* =================================================
                        QUESTION
                    ================================================= */}

                    <h3
                      className="quiz-question-clickable"
                      onClick={() =>
                        toggleQuestion(
                          item._id
                        )
                      }
                    >
                      <span className="quiz-question-title-text">
                        <HelpCircle className="btn-icon question-help-icon" size={18} />
                        {item.question}
                      </span>
                      <span className="quiz-card-expand-indicator">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </h3>


                    {/* =================================================
                        FULL QUESTION CONTENT
                    ================================================= */}

                    {isExpanded && (
                      <>

                        {/* =================================================
                            TOP
                        ================================================= */}

                        <div className="quiz-question-card-top">

                          <span className="quiz-question-number">
                            #{index + 1}
                          </span>

                          <span className="quiz-question-category">
                            {getCategoryName(
                              item.category,
                              item.chapterNumber
                            )}
                          </span>

                          {item.questionHi ? (
                            <span style={{
                              marginLeft: "8px",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              background: "#e0e7ff",
                              color: "#4338ca",
                              fontSize: "11.5px",
                              fontWeight: "700",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              🇮🇳 हिन्दी ઉપલબ્ધ
                            </span>
                          ) : (
                            <span style={{
                              marginLeft: "8px",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              background: "#fef3c7",
                              color: "#92400e",
                              fontSize: "11px",
                              fontWeight: "600"
                            }}>
                              🇬🇯 માત્ર ગુજરાતી
                            </span>
                          )}

                        </div>

                        {item.questionHi && (
                          <div style={{
                            margin: "10px 0 14px",
                            padding: "10px 14px",
                            background: "#f5f7ff",
                            borderRadius: "10px",
                            borderLeft: "3.5px solid #6366f1"
                          }}>
                            <div style={{ fontSize: "12px", color: "#4f46e5", fontWeight: "750", marginBottom: "3px" }}>
                              🇮🇳 हिन्दी प्रश्न (Auto-Translated / Hindi):
                            </div>
                            <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: "600" }}>
                              {item.questionHi}
                            </div>
                            {item.explanationHi && (
                              <div style={{ marginTop: "5px", fontSize: "12.5px", color: "#475569" }}>
                                <b>हिन्दी व्याख्या:</b> {item.explanationHi}
                              </div>
                            )}
                          </div>
                        )}


                        {/* =================================================
                            CHAPTER NUMBER
                        ================================================= */}

                        {item.chapterNumber && (
                          <div className="quiz-question-chapter">

                            <BookOpen className="btn-icon" size={14} /> Chapter{" "}
                            {item.chapterNumber}

                          </div>
                        )}


                        {/* =================================================
                            OPTIONS
                        ================================================= */}

                        <div className="quiz-options-list">

                          {item.options?.map(
                            (
                              option,
                              optionIndex
                            ) => {

                              const isCorrect =
                                option.trim() ===
                                item.correctAnswer?.trim();

                              return (
                                <div
                                  className={
                                    isCorrect
                                      ? "quiz-option correct"
                                      : "quiz-option"
                                  }
                                  key={
                                    optionIndex
                                  }
                                >

                                  <span>
                                    {String.fromCharCode(
                                      65 +
                                        optionIndex
                                    )}
                                    .
                                  </span>

                                  <span>
                                    {option}
                                  </span>

                                  {isCorrect && (
                                    <strong>
                                      <Check size={14} className="btn-icon" /> Correct
                                    </strong>
                                  )}

                                </div>
                              );

                            }
                          )}

                        </div>


                        {/* =================================================
                            EXPLANATION
                        ================================================= */}

                        {item.explanation && (
                          <div className="quiz-question-explanation">

                            <strong>
                              <Lightbulb className="btn-icon" size={14} /> Explanation:
                            </strong>

                            <p>
                              {item.explanation}
                            </p>

                          </div>
                        )}


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="quiz-question-actions">

                          <button
                            type="button"
                            className="quiz-edit-button"
                            onClick={() =>
                              handleEdit(
                                item
                              )
                            }
                          >
                            <Edit3 className="btn-icon" size={15} /> Edit
                          </button>

                          <button
                            type="button"
                            className="quiz-delete-button"
                            onClick={() =>
                              handleDelete(
                                item._id
                              )
                            }
                          >
                            <Trash2 className="btn-icon" size={16} /> Delete
                          </button>

                        </div>

                      </>
                    )}

                  </article>
                );
              }
            )}

          </div>

        )}

      </section>

    </main>
  );
}

export default QuizManagement;