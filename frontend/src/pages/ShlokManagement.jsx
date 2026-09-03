import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import "./ShlokManagement.css";


/* =====================================================
   RICH TEXT EDITOR
===================================================== */

function RichTextEditor({
  value,
  onChange,
  placeholder,
}) {
  const editorRef = useRef(null);
  const [textColor, setTextColor] =
    useState("#7a5a00");

  useEffect(() => {
    if (!editorRef.current) return;

    if (
      editorRef.current.innerHTML !==
      (value || "")
    ) {
      editorRef.current.innerHTML =
        value || "";
    }
  }, [value]);

  const updateValue = () => {
    if (!editorRef.current) return;

    onChange(
      editorRef.current.innerHTML
    );
  };

  const formatText = (
    command,
    commandValue = null
  ) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    document.execCommand(
      command,
      false,
      commandValue
    );

    updateValue();
  };

  const addNewLine = () => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    document.execCommand(
      "insertHTML",
      false,
      "<br>"
    );

    updateValue();
  };

  const handleTextColor = (event) => {
    const color =
      event.target.value;

    setTextColor(color);

    formatText(
      "foreColor",
      color
    );
  };

  const highlightText = () => {
    formatText(
      "backColor",
      "#fff176"
    );
  };

  const alignText = (alignment) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    if (alignment === "left") {
      document.execCommand(
        "justifyLeft"
      );
    }

    if (alignment === "center") {
      document.execCommand(
        "justifyCenter"
      );
    }

    if (alignment === "right") {
      document.execCommand(
        "justifyRight"
      );
    }

    updateValue();
  };

  const handleUndo = () => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    document.execCommand("undo");

    updateValue();
  };

  const handleRedo = () => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    document.execCommand("redo");

    updateValue();
  };

  return (
    <div className="rich-editor">
      <div className="rich-toolbar">

        {/* BOLD / ITALIC / UNDERLINE */}
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-button"
            title="Bold"
            onMouseDown={(event) => {
              event.preventDefault();
              formatText("bold");
            }}
          >
            <strong>B</strong>
          </button>

          <button
            type="button"
            className="toolbar-button"
            title="Italic"
            onMouseDown={(event) => {
              event.preventDefault();
              formatText("italic");
            }}
          >
            <em>I</em>
          </button>

          <button
            type="button"
            className="toolbar-button"
            title="Underline"
            onMouseDown={(event) => {
              event.preventDefault();
              formatText("underline");
            }}
          >
            <u>U</u>
          </button>
        </div>

        <span className="toolbar-divider" />

        {/* HIGHLIGHT / COLOR */}
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-button highlight-button"
            title="Highlight"
            onMouseDown={(event) => {
              event.preventDefault();
              highlightText();
            }}
          >
            🖍️
          </button>

          <label
            className="toolbar-color-button"
            title="Text Color"
          >
            🎨

            <input
              type="color"
              value={textColor}
              onChange={
                handleTextColor
              }
            />
          </label>
        </div>

        <span className="toolbar-divider" />

        {/* ALIGNMENT */}
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-button"
            title="Align Left"
            onMouseDown={(event) => {
              event.preventDefault();
              alignText("left");
            }}
          >
            ⬅
          </button>

          <button
            type="button"
            className="toolbar-button"
            title="Align Center"
            onMouseDown={(event) => {
              event.preventDefault();
              alignText("center");
            }}
          >
            ↔
          </button>

          <button
            type="button"
            className="toolbar-button"
            title="Align Right"
            onMouseDown={(event) => {
              event.preventDefault();
              alignText("right");
            }}
          >
            ➡
          </button>
        </div>

        <span className="toolbar-divider" />

        {/* LIST / NEW LINE */}
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-button"
            title="Bullet List"
            onMouseDown={(event) => {
              event.preventDefault();

              formatText(
                "insertUnorderedList"
              );
            }}
          >
            •
          </button>

          <button
            type="button"
            className="toolbar-button new-line-button"
            title="New Line"
            onMouseDown={(event) => {
              event.preventDefault();
              addNewLine();
            }}
          >
            ↵
          </button>
        </div>

        <span className="toolbar-divider" />

        {/* UNDO / REDO */}
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-button undo-btn"
            title="Undo"
            onMouseDown={(event) => {
              event.preventDefault();
              handleUndo();
            }}
          >
            ↶
          </button>

          <button
            type="button"
            className="toolbar-button redo-btn"
            title="Redo"
            onMouseDown={(event) => {
              event.preventDefault();
              handleRedo();
            }}
          >
            ↷
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="rich-editor-area"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(event) =>
          onChange(
            event.currentTarget.innerHTML
          )
        }
      />
    </div>
  );
}

/* =====================================================
   HELPER FUNCTIONS
===================================================== */

const htmlToPlainText = (html) => {
  if (!html) return "";

  const temp =
    document.createElement("div");

  temp.innerHTML = html;

  return (
    temp.textContent ||
    temp.innerText ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();
};

const cleanSanskritWord = (word) => {
  return String(word || "")
    .replace(
      /[।॥,;:!?()[\]{}"“”‘’'|]/gu,
      ""
    )
    .trim();
};

const extractSanskritWords = (
  sanskrit
) => {
  const plainText =
    htmlToPlainText(sanskrit);

  if (!plainText) return [];

  return plainText
    .split(/\s+/u)
    .map(cleanSanskritWord)
    .filter(Boolean);
};

const createWordId = () => {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

/* =====================================================
   SHLOK MANAGEMENT
===================================================== */

function ShlokManagement() {
  const navigate = useNavigate();

  /* =====================================================
     STATE
  ===================================================== */

  const [shlokas, setShlokas] =
    useState([]);

  const [
    selectedChapter,
    setSelectedChapter,
  ] = useState("1");

  const [
    expandedShlokId,
    setExpandedShlokId,
  ] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    wordDetectionMessage,
    setWordDetectionMessage,
  ] = useState("");

  const [
    wordMeanings,
    setWordMeanings,
  ] = useState([]);

  const previousSanskritRef =
    useRef("");

  /* =====================================================
     FORM DATA
  ===================================================== */

  const [formData, setFormData] =
    useState({
      chapterNumber: 1,
      chapterName:
        "અર્જુનવિષાદ યોગ",
      shlokNumber: "",
      speaker: "",
      sanskrit: "",
      translation: "",
      message: "",
    });

  /* =====================================================
     API URL
  ===================================================== */

  const API_URL =
    "http://localhost:5000/api/shloks";

  /* =====================================================
     CHAPTER NAMES
  ===================================================== */

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

  /* =====================================================
     ADMIN CHECK
  ===================================================== */

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const savedUser =
      localStorage.getItem("user");

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    try {
      const user =
        JSON.parse(savedUser);

      if (user.role !== "admin") {
        navigate("/");
      }
    } catch (parseError) {
      console.error(
        "User parse error:",
        parseError
      );

      navigate("/login");
    }
  }, [navigate]);

  /* =====================================================
     FETCH SHLOKAS
  ===================================================== */

  const fetchShlokas = async (
    chapterNumber
  ) => {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/chapter/${chapterNumber}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Shlokas load થઈ શક્યા નથી."
        );
      }

      const fetchedShlokas =
        Array.isArray(data.shlokas)
          ? data.shlokas
          : [];

      fetchedShlokas.sort(
        (a, b) =>
          Number(a.shlokNumber) -
          Number(b.shlokNumber)
      );

      setShlokas(
        fetchedShlokas
      );
    } catch (err) {
      console.error(
        "Fetch Shlok Error:",
        err
      );

      setError(
        err.message ||
          "Shlokas load કરવામાં error આવ્યો."
      );

      setShlokas([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchShlokas(1);
  }, []);

  /* =====================================================
     NORMAL INPUT CHANGE
  ===================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };

  /* =====================================================
     CHAPTER CHANGE
  ===================================================== */

  const handleChapterChange = (
    event
  ) => {
    const chapterNumber =
      Number(event.target.value);

    setSelectedChapter(
      String(chapterNumber)
    );

    setFormData(
      (current) => ({
        ...current,
        chapterNumber,
        chapterName:
          chapterNames[
            chapterNumber
          ],
      })
    );

    setExpandedShlokId(null);
    setEditingId(null);

    setWordMeanings([]);
    setWordDetectionMessage("");

    previousSanskritRef.current =
      "";

    fetchShlokas(
      chapterNumber
    );
  };

  /* =====================================================
     RESET FORM
  ===================================================== */

  const resetForm = () => {
    const chapterNumber =
      Number(selectedChapter);

    setEditingId(null);

    setFormData({
      chapterNumber,
      chapterName:
        chapterNames[
          chapterNumber
        ],
      shlokNumber: "",
      speaker: "",
      sanskrit: "",
      translation: "",
      message: "",
    });

    setWordMeanings([]);
    setWordDetectionMessage("");

    previousSanskritRef.current =
      "";

    setError("");
    setMessage("");
  };

  /* =====================================================
     AUTOMATIC WORD DETECTION
  ===================================================== */

  useEffect(() => {
    const words =
      extractSanskritWords(
        formData.sanskrit
      );

    if (words.length === 0) {
      setWordMeanings([]);
      setWordDetectionMessage("");

      previousSanskritRef.current =
        formData.sanskrit;

      return;
    }

    if (
      previousSanskritRef.current ===
      formData.sanskrit
    ) {
      return;
    }

    setWordMeanings(
      (currentWords) => {
        const usedOldIndexes =
          new Set();

        const updatedWords =
          words.map(
            (word, index) => {
              const samePosition =
                currentWords[index];

              if (
                samePosition &&
                cleanSanskritWord(
                  samePosition.word
                ) === word
              ) {
                usedOldIndexes.add(
                  index
                );

                return {
                  id:
                    samePosition.id ||
                    createWordId(),

                  word,

                  meaning:
                    samePosition.meaning ||
                    "",
                };
              }

              const oldIndex =
                currentWords.findIndex(
                  (
                    oldItem,
                    oldIndex
                  ) =>
                    !usedOldIndexes.has(
                      oldIndex
                    ) &&
                    cleanSanskritWord(
                      oldItem.word
                    ) === word
                );

              if (oldIndex !== -1) {
                usedOldIndexes.add(
                  oldIndex
                );

                return {
                  id:
                    currentWords[
                      oldIndex
                    ].id ||
                    createWordId(),

                  word,

                  meaning:
                    currentWords[
                      oldIndex
                    ].meaning ||
                    "",
                };
              }

              return {
                id: createWordId(),
                word,
                meaning: "",
              };
            }
          );

        return updatedWords;
      }
    );

    setWordDetectionMessage(
      `${words.length} Sanskrit શબ્દ automatically detect થયા.`
    );

    previousSanskritRef.current =
      formData.sanskrit;
  }, [formData.sanskrit]);

  /* =====================================================
     UPDATE WORD
  ===================================================== */

  const updateWord = (
    id,
    field,
    value
  ) => {
    setWordMeanings(
      (currentWords) =>
        currentWords.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        )
    );
  };

  /* =====================================================
     DELETE WORD
  ===================================================== */

  const deleteWord = (id) => {
    setWordMeanings(
      (currentWords) =>
        currentWords.filter(
          (item) =>
            item.id !== id
        )
    );
  };

  /* =====================================================
     ADD MANUAL WORD
  ===================================================== */

  const addManualWord = () => {
    setWordMeanings(
      (currentWords) => [
        ...currentWords,
        {
          id: createWordId(),
          word: "",
          meaning: "",
        },
      ]
    );

    setWordDetectionMessage(
      "નવો Sanskrit word manually add કર્યો."
    );
  };

  /* =====================================================
     MOVE WORD UP
  ===================================================== */

  const moveWordUp = (index) => {
    if (index <= 0) return;

    setWordMeanings(
      (currentWords) => {
        const updated = [
          ...currentWords,
        ];

        [
          updated[index - 1],
          updated[index],
        ] = [
          updated[index],
          updated[index - 1],
        ];

        return updated;
      }
    );
  };

  /* =====================================================
     MOVE WORD DOWN
  ===================================================== */

  const moveWordDown = (
    index
  ) => {
    setWordMeanings(
      (currentWords) => {
        if (
          index >=
          currentWords.length - 1
        ) {
          return currentWords;
        }

        const updated = [
          ...currentWords,
        ];

        [
          updated[index],
          updated[index + 1],
        ] = [
          updated[index + 1],
          updated[index],
        ];

        return updated;
      }
    );
  };

  /* =====================================================
     VALIDATE WORD MEANINGS
  ===================================================== */

  const validateWordMeanings =
    () => {
      const invalidWord =
        wordMeanings.find(
          (item) =>
            !item.word ||
            !item.word.trim()
        );

      if (invalidWord) {
        return (
          "કોઈ Sanskrit word ખાલી રાખી શકાય નહીં."
        );
      }

      return "";
    };

  /* =====================================================
     ADD / UPDATE SHLOK
  ===================================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setSaving(true);
      setError("");
      setMessage("");

      const token =
        localStorage.getItem(
          "token"
        );

      try {
        const plainSanskrit =
          htmlToPlainText(
            formData.sanskrit
          );

        const plainTranslation =
          htmlToPlainText(
            formData.translation
          );

        const plainMessage =
          htmlToPlainText(
            formData.message
          );

        if (
          !formData.chapterNumber ||
          !formData.chapterName.trim() ||
          !formData.shlokNumber ||
          !formData.speaker.trim() ||
          !plainSanskrit ||
          !plainTranslation ||
          !plainMessage
        ) {
          throw new Error(
            "બધી માહિતી ભરવી જરૂરી છે."
          );
        }

        const wordValidation =
          validateWordMeanings();

        if (wordValidation) {
          throw new Error(
            wordValidation
          );
        }

        const cleanedWordMeanings =
          wordMeanings
            .map((item) => ({
              word:
                item.word?.trim() ||
                "",

              meaning:
                item.meaning?.trim() ||
                "",
            }))
            .filter(
              (item) =>
                item.word
            );

        const payload = {
          chapterNumber:
            Number(
              formData.chapterNumber
            ),

          chapterName:
            formData.chapterName.trim(),

          shlokNumber:
            Number(
              formData.shlokNumber
            ),

          speaker:
            formData.speaker.trim(),

          sanskrit:
            formData.sanskrit,

          wordMeanings:
            cleanedWordMeanings,

          translation:
            formData.translation,

          message:
            formData.message,
        };

        const url =
          editingId
            ? `${API_URL}/${editingId}`
            : API_URL;

        const method =
          editingId
            ? "PUT"
            : "POST";

        const response =
          await fetch(url, {
            method,

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
          });

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Shlok save થઈ શક્યો નથી."
          );
        }

        setMessage(
          editingId
            ? "Shlok successfully updated. ✅"
            : "Shlok successfully added. ✅"
        );

        setExpandedShlokId(null);
        setEditingId(null);

        setFormData({
          chapterNumber:
            Number(
              selectedChapter
            ),

          chapterName:
            chapterNames[
              Number(
                selectedChapter
              )
            ],

          shlokNumber: "",
          speaker: "",
          sanskrit: "",
          translation: "",
          message: "",
        });

        setWordMeanings([]);
        setWordDetectionMessage("");

        previousSanskritRef.current =
          "";

        await fetchShlokas(
          Number(selectedChapter)
        );
      } catch (err) {
        console.error(
          "SAVE ERROR:",
          err
        );

        setError(
          err.message ||
            "Shlok save કરવામાં error આવ્યો."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =====================================================
     EDIT SHLOK
  ===================================================== */

  const handleEdit = (
    shlok
  ) => {
    setEditingId(shlok._id);

    setFormData({
      chapterNumber:
        shlok.chapterNumber,

      chapterName:
        shlok.chapterName ||
        chapterNames[
          shlok.chapterNumber
        ] ||
        "",

      shlokNumber:
        shlok.shlokNumber,

      speaker:
        shlok.speaker || "",

      sanskrit:
        shlok.sanskrit || "",

      translation:
        shlok.translation || "",

      message:
        shlok.message || "",
    });

    const existingWords =
      Array.isArray(
        shlok.wordMeanings
      )
        ? shlok.wordMeanings
        : [];

    if (
      existingWords.length > 0
    ) {
      setWordMeanings(
        existingWords.map(
          (item, index) => ({
            id: `${Date.now()}-${index}-${Math.random()}`,

            word:
              item.word || "",

            meaning:
              item.meaning || "",
          })
        )
      );

      previousSanskritRef.current =
        shlok.sanskrit || "";

      setWordDetectionMessage(
        `${existingWords.length} saved Sanskrit words loaded.`
      );
    } else {
      setWordMeanings([]);

      setWordDetectionMessage("");

      previousSanskritRef.current =
        "";
    }

    setExpandedShlokId(
      shlok._id
    );

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     DELETE SHLOK
  ===================================================== */

  const handleDelete =
    async (
      id,
      number
    ) => {
      const confirmed =
        window.confirm(
          `શું તમે Shlok ${number} ને delete કરવા માંગો છો?`
        );

      if (!confirmed) return;

      const token =
        localStorage.getItem(
          "token"
        );

      try {
        setError("");
        setMessage("");

        const response =
          await fetch(
            `${API_URL}/${id}`,
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
              "Shlok delete થઈ શક્યો નથી."
          );
        }

        setMessage(
          "Shlok successfully deleted. 🗑️"
        );

        if (
          expandedShlokId === id
        ) {
          setExpandedShlokId(
            null
          );
        }

        await fetchShlokas(
          Number(
            selectedChapter
          )
        );
      } catch (err) {
        console.error(
          "Delete Shlok Error:",
          err
        );

        setError(
          err.message ||
            "Shlok delete કરવામાં error આવ્યો."
        );
      }
    };

  /* =====================================================
     TOGGLE SHLOK
  ===================================================== */

  const toggleShlok = (id) => {
    setExpandedShlokId(
      (current) =>
        current === id
          ? null
          : id
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="shlok-management-page">
      <div className="shlok-management-container">

        {/* HEADER */}
        <div className="shlok-management-header">
          <div>
            <h1>
              📖 Shlok Management
            </h1>

            <p>
              Admin Panelમાંથી Bhagavad
              Gitaના Shlok manage કરો
            </p>
          </div>

          <button
            type="button"
            className="back-admin-btn"
            onClick={() =>
              navigate("/admin")
            }
          >
            ← Admin Dashboard
          </button>
        </div>

        {/* MESSAGES */}
        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* =================================================
            ADD / EDIT FORM
        ================================================= */}

        <section className="shlok-form-section">

          <div className="section-title">
            <div>
              <h2>
                {editingId
                  ? "✏️ Edit Shlok"
                  : "➕ Add New Shlok"}
              </h2>

              <p>
                Shlokની સંપૂર્ણ માહિતી
                અહીંથી manage કરો
              </p>
            </div>
          </div>

          <form
            className="shlok-form"
            onSubmit={handleSubmit}
          >

            {/* CHAPTER + SHLOK NUMBER */}
            <div className="form-row">

              <div className="form-group">
                <label>
                  Chapter
                </label>

                <select
                  name="chapterNumber"
                  value={
                    formData.chapterNumber
                  }
                  onChange={
                    handleChapterChange
                  }
                  required
                >
                  {Array.from(
                    {
                      length: 18,
                    },
                    (_, index) =>
                      index + 1
                  ).map(
                    (number) => (
                      <option
                        key={number}
                        value={number}
                      >
                        Chapter {number}
                        {" — "}
                        {
                          chapterNames[
                            number
                          ]
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>
                  Shlok Number
                </label>

                <input
                  type="number"
                  name="shlokNumber"
                  min="1"
                  value={
                    formData.shlokNumber
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: 1"
                  required
                />
              </div>

            </div>

            {/* SPEAKER */}
            <div className="form-group">
              <label>
                Speaker
              </label>

              <input
                type="text"
                name="speaker"
                value={
                  formData.speaker
                }
                onChange={
                  handleChange
                }
                placeholder="Example: धृतराष्ट्र उवाच"
                required
              />
            </div>

            {/* SANSKRIT SHLOK */}
            <div className="form-group">
              <label>
                🕉️ Sanskrit Shlok
              </label>

              <RichTextEditor
                value={
                  formData.sanskrit
                }
                onChange={(value) =>
                  setFormData(
                    (current) => ({
                      ...current,
                      sanskrit: value,
                    })
                  )
                }
                placeholder="અહીં સંપૂર્ણ સંસ્કૃત શ્લોક લખો..."
              />
            </div>

            {/* =================================================
                WORD-WISE GUJARATI MEANING
            ================================================= */}

            <div className="word-wise-section">

              <div className="word-wise-section-header">

                <div className="word-wise-title-area">
                  <div className="word-wise-icon">
                    🔤
                  </div>

                  <div>
                    <h3>
                      Word-wise Gujarati Meaning
                    </h3>

                    <p>
                      Sanskrit Shlokમાં word
                      લખતા જ અહીં automatically
                      words detect થશે.
                    </p>
                  </div>
                </div>

 
              </div>

              {/* INFO */}
              <div className="word-wise-info">
                💡 Sanskrit Shlokના દરેક
                word અહીં automatically
                detect થશે. તમે Gujarati
                meaning manually લખી શકો છો.
              </div>

              {/* DETECTION MESSAGE */}
              {wordDetectionMessage && (
                <div className="word-detection-message">
                  ✅{" "}
                  {
                    wordDetectionMessage
                  }
                </div>
              )}

              {/* WORD LIST */}
              {wordMeanings.length ===
              0 ? (
                <div className="word-empty-box">

                  <div className="word-empty-icon">
                    🔤
                  </div>

                  <h3>
                    Sanskrit words અહીં
                    દેખાશે
                  </h3>

                  <p>
                    ઉપર Sanskrit Shlok
                    boxમાં શ્લોક લખો.
                    તેના દરેક word અહીં
                    automatically આવી જશે.
                  </p>

                </div>
              ) : (
                <div className="word-meaning-list">

                  {wordMeanings.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="word-meaning-row"
                        key={
                          item.id
                        }
                      >

                        <div className="word-number">
                          {index + 1}
                        </div>

                        <div className="word-input-group">
                          <label>
                            Sanskrit Word
                          </label>

                          <input
                            type="text"
                            value={
                              item.word
                            }
                            onChange={(
                              event
                            ) =>
                              updateWord(
                                item.id,
                                "word",
                                event.target.value
                              )
                            }
                            placeholder="Sanskrit word"
                            className="sanskrit-word-input"
                          />
                        </div>

                        <div className="word-arrow">
                          →
                        </div>

                        <div className="word-input-group">
                          <label>
                            Gujarati Meaning
                          </label>

                          <input
                            type="text"
                            value={
                              item.meaning
                            }
                            onChange={(
                              event
                            ) =>
                              updateWord(
                                item.id,
                                "meaning",
                                event.target.value
                              )
                            }
                            placeholder="ગુજરાતી અર્થ લખો..."
                            className="gujarati-word-input"
                          />
                        </div>

                        <div className="word-row-actions">

                          <button
                            type="button"
                            className="word-move-btn"
                            title="Move Up"
                            onClick={() =>
                              moveWordUp(
                                index
                              )
                            }
                            disabled={
                              index === 0
                            }
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            className="word-move-btn"
                            title="Move Down"
                            onClick={() =>
                              moveWordDown(
                                index
                              )
                            }
                            disabled={
                              index ===
                              wordMeanings.length -
                                1
                            }
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            className="word-delete-btn"
                            title="Delete Word"
                            onClick={() =>
                              deleteWord(
                                item.id
                              )
                            }
                          >
                            🗑️
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

              {/* ADD ANOTHER WORD */}
              {wordMeanings.length >
                0 && (
                <button
                  type="button"
                  className="add-word-bottom-btn"
                  onClick={
                    addManualWord
                  }
                >
                  ➕ Add Another Sanskrit Word
                </button>
              )}

              <small className="word-translation-help">
                💡 Sanskrit word તમે
                manually edit કરી શકો છો.
                કોઈ word delete કરી શકો છો
                અને "Add Word" દ્વારા નવો
                word પણ ઉમેરી શકો છો.
              </small>

            </div>

            {/* TRANSLATION */}
            <div className="form-group">
              <label>
                📖 Gujarati Translation
              </label>

              <RichTextEditor
                value={
                  formData.translation
                }
                onChange={(value) =>
                  setFormData(
                    (current) => ({
                      ...current,
                      translation:
                        value,
                    })
                  )
                }
                placeholder="શ્લોકનો ગુજરાતી અર્થ..."
              />
            </div>

            {/* MESSAGE */}
            <div className="form-group">
              <label>
                🌸 Message / Explanation
              </label>

              <RichTextEditor
                value={
                  formData.message
                }
                onChange={(value) =>
                  setFormData(
                    (current) => ({
                      ...current,
                      message: value,
                    })
                  )
                }
                placeholder="શ્લોકમાંથી મળતો સંદેશ..."
              />
            </div>

            {/* BUTTONS */}
            <div className="form-actions">

              <button
                type="submit"
                className="save-shlok-btn"
                disabled={saving}
              >
                {saving
                  ? "⏳ Saving..."
                  : editingId
                  ? "💾 Update Shlok"
                  : "➕ Add Shlok"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-edit-btn"
                  onClick={
                    resetForm
                  }
                >
                  ✖ Cancel Edit
                </button>
              )}

            </div>

          </form>
        </section>

        {/* =================================================
            SHLOK LIST
        ================================================= */}

        <section className="shlok-list-section">

          <div className="section-title">

            <div>
              <h2>
                📜 Chapter{" "}
                {selectedChapter}{" "}
                Shlokas
              </h2>

              <p>
                Total:{" "}
                {shlokas.length}{" "}
                Shlokas
              </p>
            </div>

            <button
              type="button"
              className="refresh-btn"
              onClick={() =>
                fetchShlokas(
                  Number(
                    selectedChapter
                  )
                )
              }
            >
              🔄 Refresh
            </button>

          </div>

          {loading ? (
            <div className="loading-box">
              ⏳ Loading Shlokas...
            </div>
          ) : shlokas.length ===
            0 ? (
            <div className="empty-box">
              📭 આ Chapterમાં હજુ કોઈ
              Shlok નથી.
            </div>
          ) : (
            <div className="shlok-number-grid">

              {shlokas.map(
                (shlok) => {
                  const isExpanded =
                    expandedShlokId ===
                    shlok._id;

                  return (
                    <div
                      className={
                        isExpanded
                          ? "shlok-item expanded"
                          : "shlok-item"
                      }
                      key={
                        shlok._id
                      }
                    >

                      {/* NUMBER BOX */}
                      <button
                        type="button"
                        className="shlok-number-box"
                        onClick={() =>
                          toggleShlok(
                            shlok._id
                          )
                        }
                      >
                        <span>
                          Shlok
                        </span>

                        <strong>
                          {
                            shlok.shlokNumber
                          }
                        </strong>

                        <small>
                          {isExpanded
                            ? "▲ Close"
                            : "▼ Open"}
                        </small>
                      </button>

                      {/* DETAILS */}
                      {isExpanded && (
                        <div className="shlok-detail-panel">

                          {/* HEADER */}
                          <div className="shlok-detail-header">

                            <div>
                              <span className="detail-label">
                                અધ્યાય{" "}
                                {
                                  shlok.chapterNumber
                                }
                              </span>

                              <h3>
                                Shlok{" "}
                                {
                                  shlok.shlokNumber
                                }
                              </h3>

                              <p>
                                🎙️{" "}
                                {
                                  shlok.speaker
                                }
                              </p>
                            </div>

                            <div className="shlok-actions">

                              <button
                                type="button"
                                className="edit-shlok-btn"
                                onClick={() =>
                                  handleEdit(
                                    shlok
                                  )
                                }
                              >
                                ✏️ Edit
                              </button>

                              <button
                                type="button"
                                className="delete-shlok-btn"
                                onClick={() =>
                                  handleDelete(
                                    shlok._id,
                                    shlok.shlokNumber
                                  )
                                }
                              >
                                🗑️ Delete
                              </button>

                            </div>

                          </div>

                          {/* SANSKRIT */}
                          <div className="detail-content sanskrit-detail">

                            <h4>
                              🕉️ સંસ્કૃત શ્લોક
                            </h4>

                            <div
                              className="admin-sanskrit-text"
                              dangerouslySetInnerHTML={{
                                __html:
                                  shlok.sanskrit ||
                                  "<span>સંસ્કૃત શ્લોક ઉપલબ્ધ નથી.</span>",
                              }}
                            />

                          </div>

                          {/* WORD MEANINGS */}
                          <div className="detail-content word-meanings-detail">

                            <h4>
                              🔤 Word-wise Gujarati Meaning
                            </h4>

                            {Array.isArray(
                              shlok.wordMeanings
                            ) &&
                            shlok
                              .wordMeanings
                              .length >
                              0 ? (
                              <div className="saved-word-meaning-list">

                                {shlok.wordMeanings.map(
                                  (
                                    item,
                                    index
                                  ) => (
                                    <div
                                      className="saved-word-meaning-row"
                                      key={`${shlok._id}-word-${index}`}
                                    >

                                      <span className="saved-word-number">
                                        {
                                          index +
                                          1
                                        }
                                      </span>

                                      <span className="saved-sanskrit-word">
                                        {
                                          item.word
                                        }
                                      </span>

                                      <span className="saved-word-arrow">
                                        →
                                      </span>

                                      <span className="saved-gujarati-meaning">
                                        {
                                          item.meaning ||
                                          "અર્થ ઉમેરવામાં આવ્યો નથી"
                                        }
                                      </span>

                                    </div>
                                  )
                                )}

                              </div>
                            ) : (
                              <p>
                                Word-wise meaning
                                ઉપલબ્ધ નથી.
                              </p>
                            )}

                          </div>

                          {/* TRANSLATION */}
                          <div className="detail-content translation-detail">

                            <h4>
                              📖 ગુજરાતી અર્થ
                            </h4>

                            <div
                              className="admin-translation-text"
                              dangerouslySetInnerHTML={{
                                __html:
                                  shlok.translation ||
                                  "<span>ગુજરાતી અર્થ ઉપલબ્ધ નથી.</span>",
                              }}
                            />

                          </div>

                          {/* MESSAGE */}
                          <div className="detail-content message-detail">

                            <h4>
                              🌸 સંદેશ
                            </h4>

                            <div
                              className="admin-message-text"
                              dangerouslySetInnerHTML={{
                                __html:
                                  shlok.message ||
                                  "<span>સંદેશ ઉપલબ્ધ નથી.</span>",
                              }}
                            />

                          </div>

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

export default ShlokManagement;