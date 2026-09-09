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
  FileQuestion
} from "lucide-react";
import "./QuizManagement.css";

function QuizManagement() {

    const navigate = useNavigate();
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
    });

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
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
    });

    setEditingId(null);

    setError("");
    setSuccess("");
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
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
          <span><Loader2 className="btn-icon animate-spin" size={20} /> Quiz questions load થઈ રહ્યા છે...</span>
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

    <p>
      Quiz questions Add, Edit અને Delete કરો.
    </p>

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
              QUESTION
          ================================================= */}

          <div className="quiz-form-group">

            <label>
              Question
            </label>

            <textarea
              name="question"
              value={
                formData.question
              }
              onChange={
                handleChange
              }
              placeholder="Quiz question લખો..."
              rows="4"
            />

          </div>


          {/* =================================================
              OPTION 1
          ================================================= */}

          <div className="quiz-form-group">

            <label>
              Option 1
            </label>

            <input
              type="text"
              name="option1"
              value={
                formData.option1
              }
              onChange={
                handleChange
              }
              placeholder="Option 1"
            />

          </div>


          {/* =================================================
              OPTION 2
          ================================================= */}

          <div className="quiz-form-group">

            <label>
              Option 2
            </label>

            <input
              type="text"
              name="option2"
              value={
                formData.option2
              }
              onChange={
                handleChange
              }
              placeholder="Option 2"
            />

          </div>


          {/* =================================================
              OPTION 3
          ================================================= */}

          <div className="quiz-form-group">

            <label>
              Option 3
            </label>

            <input
              type="text"
              name="option3"
              value={
                formData.option3
              }
              onChange={
                handleChange
              }
              placeholder="Option 3"
            />

          </div>


          {/* =================================================
              OPTION 4
          ================================================= */}

          <div className="quiz-form-group">

            <label>
              Option 4
            </label>

            <input
              type="text"
              name="option4"
              value={
                formData.option4
              }
              onChange={
                handleChange
              }
              placeholder="Option 4"
            />

          </div>


          {/* =================================================
              CORRECT ANSWER
          ================================================= */}

          <div className="quiz-form-group">

            <label>
              Correct Answer
            </label>

            <select
              name="correctAnswer"
              value={
                formData.correctAnswer
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                -- Correct Answer પસંદ કરો --
              </option>

              {[
                formData.option1,
                formData.option2,
                formData.option3,
                formData.option4,
              ]
                .filter(
                  (option) =>
                    option.trim()
                )
                .map(
                  (option, index) => (
                    <option
                      key={index}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}

            </select>

          </div>


          {/* =================================================
              EXPLANATION
          ================================================= */}

          <div className="quiz-form-group">

            <label>
              Explanation
              <span>
                {" "}
                (Optional)
              </span>
            </label>

            <textarea
              name="explanation"
              value={
                formData.explanation
              }
              onChange={
                handleChange
              }
              placeholder="Answer નું explanation લખો..."
              rows="3"
            />

          </div>


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
                  <Loader2 className="btn-icon animate-spin" size={16} /> Saving...
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

                        </div>


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