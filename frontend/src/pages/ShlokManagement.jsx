import { getValidToken, handleAuth401, clearAuthSession } from "../utils/authHelper.js";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import { BookOpen, Activity, Type, Lightbulb, Trash2, Save, FileText, RefreshCw, Archive, Mic, Sparkles, Plus, Highlighter, Palette, AlignLeft, AlignCenter, AlignRight, CornerDownLeft, ArrowLeft, List, Undo, Redo, Bold, Italic, Underline } from "lucide-react";
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
          > <Bold size={16} /> </button>

          <button
            type="button"
            className="toolbar-button"
            title="Italic"
            onMouseDown={(event) => {
              event.preventDefault();
              formatText("italic");
            }}
          > <Italic size={16} /> </button>

          <button
            type="button"
            className="toolbar-button"
            title="Underline"
            onMouseDown={(event) => {
              event.preventDefault();
              formatText("underline");
            }}
          > <Underline size={16} /> </button>
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
          > <Highlighter size={16} /> </button>

          <label
            className="toolbar-color-button"
            title="Text Color"
          > <Palette size={16} /> <input
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
          > <AlignLeft size={16} /> </button>

          <button
            type="button"
            className="toolbar-button"
            title="Align Center"
            onMouseDown={(event) => {
              event.preventDefault();
              alignText("center");
            }}
          > <AlignCenter size={16} /> </button>

          <button
            type="button"
            className="toolbar-button"
            title="Align Right"
            onMouseDown={(event) => {
              event.preventDefault();
              alignText("right");
            }}
          > <AlignRight size={16} /> </button>
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
          > <List size={16} /> </button>

          <button
            type="button"
            className="toolbar-button new-line-button"
            title="New Line"
            onMouseDown={(event) => {
              event.preventDefault();
              addNewLine();
            }}
          > <CornerDownLeft size={16} /> </button>
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
          > <Undo size={16} /> </button>

          <button
            type="button"
            className="toolbar-button redo-btn"
            title="Redo"
            onMouseDown={(event) => {
              event.preventDefault();
              handleRedo();
            }}
          > <Redo size={16} /> </button>
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
  const { isHindi, isEnglish, isGujarati, txt } = useLanguage();

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

  const [activeLangTab, setActiveLangTab] =
    useState("gu");

  const [translating, setTranslating] =
    useState(false);
  const [translatingLang, setTranslatingLang] =
    useState(null);

  const [autoTranslateSuccess, setAutoTranslateSuccess] =
    useState("");

  /* =====================================================
     FORM DATA
  ===================================================== */

  const [formData, setFormData] =
    useState({
      chapterNumber: 1,
      chapterName:
        "અર્જુનવિષાદ યોગ",
      chapterNameHi:
        "अर्जुनविषाद योग",
      chapterNameEn:
        "Arjuna Vishada Yoga",
      shlokNumber: "",
      speaker: "",
      speakerHi: "",
      speakerEn: "",
      sanskrit: "",
      translation: "",
      translationHi: "",
      translationEn: "",
      message: "",
      messageHi: "",
      messageEn: "",
    });

  /* =====================================================
     API URL
  ===================================================== */

  const API_URL =
    "https://bhagavad-gita-website.onrender.com/api/shloks";

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
    14: "गुणत्रय विभाग योग",
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
    6: "Atma Samyama Yoga",
    7: "Jnana Vijnana Yoga",
    8: "Akshara Brahma Yoga",
    9: "Raja Vidya Raja Guhya Yoga",
    10: "Vibhuti Yoga",
    11: "Vishwarupa Darshana Yoga",
    12: "Bhakti Yoga",
    13: "Kshetra Kshetrajna Vibhaga Yoga",
    14: "Gunatraya Vibhaga Yoga",
    15: "Purushottama Yoga",
    16: "Daivasura Sampad Vibhaga Yoga",
    17: "Shraddhatraya Vibhaga Yoga",
    18: "Moksha Sanyasa Yoga",
  };

  /* =====================================================
     ADMIN CHECK
  ===================================================== */

  useEffect(() => {
    const token =
      getValidToken();

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

      const token =
        getValidToken() ||
        localStorage.getItem("token");

      const response =
        await fetch(
          `${API_URL}/chapter/${chapterNumber}`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          handleAuth401();
          return;
        }
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
        chapterNameHi:
          chapterNamesHi[
            chapterNumber
          ] || "",
        chapterNameEn:
          chapterNamesEn[
            chapterNumber
          ] || "",
      })
    );

    setExpandedShlokId(null);
    setEditingId(null);

    setWordMeanings([]);
    setWordDetectionMessage("");
    setAutoTranslateSuccess("");

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
      chapterNameHi:
        chapterNamesHi[
          chapterNumber
        ] || "",
      chapterNameEn:
        chapterNamesEn[
          chapterNumber
        ] || "",
      shlokNumber: "",
      speaker: "",
      speakerHi: "",
      speakerEn: "",
      sanskrit: "",
      translation: "",
      translationHi: "",
      translationEn: "",
      message: "",
      messageHi: "",
      messageEn: "",
    });

    setWordMeanings([]);
    setWordDetectionMessage("");
    setAutoTranslateSuccess("");

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

                  meaningHi:
                    samePosition.meaningHi ||
                    "",

                  meaningEn:
                    samePosition.meaningEn ||
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

                  meaningHi:
                    currentWords[
                      oldIndex
                    ].meaningHi ||
                    "",

                  meaningEn:
                    currentWords[
                      oldIndex
                    ].meaningEn ||
                    "",
                };
              }

              return {
                id: createWordId(),
                word,
                meaning: "",
                meaningHi: "",
                meaningEn: "",
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
          meaningHi: "",
          meaningEn: "",
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
     AUTO TRANSLATE VIA AI (GEMINI)
  ===================================================== */

  const handleAutoTranslate = async (targetLang = "hi") => {
    try {
      setTranslating(true);
      setTranslatingLang(targetLang);
      setError("");
      setAutoTranslateSuccess("");

      const plainTranslation = htmlToPlainText(formData.translation);

      if (!formData.translation?.trim() && !plainTranslation) {
        throw new Error(
          targetLang === "hi"
            ? "કૃપા કરીને પહેલાં ગુજરાતી અનુવાદ લખો જેથી AI તેનું હિન્દીમાં ઓટો-અનુવાદ કરી શકે."
            : targetLang === "en"
            ? "કૃપા કરીને પહેલાં ગુજરાતી અનુવાદ લખો જેથી AI તેનું અંગ્રેજીમાં ઓટો-અનુવાદ કરી શકે."
            : "કૃપા કરીને પહેલાં ગુજરાતી અનુવાદ લખો જેથી AI તેનું હિન્દી અને અંગ્રેજીમાં ઓટો-અનુવાદ કરી શકે."
        );
      }

      const token = getValidToken();

      const cleanedWords = wordMeanings
        .map((item) => ({
          word: item.word?.trim() || "",
          meaning: item.meaning?.trim() || "",
          meaningHi: item.meaningHi?.trim() || "",
          meaningEn: item.meaningEn?.trim() || "",
        }))
        .filter((item) => item.word);

      const response = await fetch(`${API_URL}/auto-translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapterNumber: Number(formData.chapterNumber),
          chapterName: formData.chapterName,
          speaker: formData.speaker,
          sanskrit: formData.sanskrit,
          translation: formData.translation,
          message: formData.message,
          wordMeanings: cleanedWords,
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
          data?.message || "ઓટો-અનુવાદ માહિતી મળી શકી નથી."
        );
      }

      setFormData((prev) => ({
        ...prev,
        chapterNameHi:
          translated.chapterNameHi ||
          chapterNamesHi[prev.chapterNumber] ||
          prev.chapterNameHi,
        chapterNameEn:
          translated.chapterNameEn ||
          chapterNamesEn[prev.chapterNumber] ||
          prev.chapterNameEn,
        speakerHi:
          translated.speakerHi || prev.speakerHi,
        speakerEn:
          translated.speakerEn || prev.speakerEn,
        translationHi:
          translated.translationHi || prev.translationHi,
        translationEn:
          translated.translationEn || prev.translationEn,
        messageHi:
          translated.messageHi || prev.messageHi,
        messageEn:
          translated.messageEn || prev.messageEn,
      }));

      if (Array.isArray(translated.wordMeanings)) {
        setWordMeanings((prev) =>
          prev.map((item, idx) => {
            const matched = translated.wordMeanings.find(
              (m) =>
                cleanSanskritWord(m.word) ===
                cleanSanskritWord(item.word)
            ) || translated.wordMeanings[idx];

            return {
              ...item,
              meaningHi:
                matched?.meaningHi ||
                item.meaningHi ||
                "",
              meaningEn:
                matched?.meaningEn ||
                item.meaningEn ||
                "",
            };
          })
        );
      }

      setAutoTranslateSuccess(
        targetLang === "hi"
          ? "✨ ગુજરાતીમાંથી હિન્દીમાં સફળતાપૂર્વક AI ઓટો-અનુવાદ થઈ ગયું!"
          : targetLang === "en"
          ? "✨ ગુજરાતીમાંથી અંગ્રેજીમાં સફળતાપૂર્વક AI ઓટો-અનુવાદ થઈ ગયું!"
          : "✨ ગુજરાતીમાંથી હિન્દી અને અંગ્રેજીમાં સફળતાપૂર્વક AI ઓટો-અનુવાદ થઈ ગયું! સંસ્કૃત શ્લોક સુરક્ષિત છે."
      );
      if (targetLang === "en") {
        setActiveLangTab("en");
      } else if (targetLang === "hi") {
        setActiveLangTab("hi");
      }
    } catch (err) {
      console.error("Auto translate error:", err);
      setError(
        err.message ||
          "ઓટો-અનુવાદ કરવામાં error આવ્યો."
      );
    } finally {
      setTranslating(false);
      setTranslatingLang(null);
    }
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

              meaningHi:
                item.meaningHi?.trim() ||
                "",

              meaningEn:
                item.meaningEn?.trim() ||
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

          chapterNameHi:
            formData.chapterNameHi?.trim() ||
            chapterNamesHi[
              Number(formData.chapterNumber)
            ] ||
            formData.chapterName.trim(),

          chapterNameEn:
            formData.chapterNameEn?.trim() ||
            chapterNamesEn[
              Number(formData.chapterNumber)
            ] ||
            formData.chapterName.trim(),

          shlokNumber:
            Number(
              formData.shlokNumber
            ),

          speaker:
            formData.speaker.trim(),

          speakerHi:
            formData.speakerHi?.trim() ||
            formData.speaker.trim(),

          speakerEn:
            formData.speakerEn?.trim() ||
            formData.speaker.trim(),

          sanskrit:
            formData.sanskrit,

          wordMeanings:
            cleanedWordMeanings,

          translation:
            formData.translation,

          translationHi:
            formData.translationHi ||
            "",

          translationEn:
            formData.translationEn ||
            "",

          message:
            formData.message,

          messageHi:
            formData.messageHi ||
            "",

          messageEn:
            formData.messageEn ||
            "",
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

          chapterNameHi:
            chapterNamesHi[
              Number(
                selectedChapter
              )
            ] || "",

          chapterNameEn:
            chapterNamesEn[
              Number(
                selectedChapter
              )
            ] || "",

          shlokNumber: "",
          speaker: "",
          speakerHi: "",
          speakerEn: "",
          sanskrit: "",
          translation: "",
          translationHi: "",
          translationEn: "",
          message: "",
          messageHi: "",
          messageEn: "",
        });

        setWordMeanings([]);
        setWordDetectionMessage("");
        setAutoTranslateSuccess("");

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

      chapterNameHi:
        shlok.chapterNameHi ||
        chapterNamesHi[
          shlok.chapterNumber
        ] ||
        "",

      chapterNameEn:
        shlok.chapterNameEn ||
        chapterNamesEn[
          shlok.chapterNumber
        ] ||
        "",

      shlokNumber:
        shlok.shlokNumber,

      speaker:
        shlok.speaker || "",

      speakerHi:
        shlok.speakerHi || "",

      speakerEn:
        shlok.speakerEn || "",

      sanskrit:
        shlok.sanskrit || "",

      translation:
        shlok.translation || "",

      translationHi:
        shlok.translationHi || "",

      translationEn:
        shlok.translationEn || "",

      message:
        shlok.message || "",

      messageHi:
        shlok.messageHi || "",

      messageEn:
        shlok.messageEn || "",
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

            meaningHi:
              item.meaningHi || "",

            meaningEn:
              item.meaningEn || "",
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
    setAutoTranslateSuccess("");
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
          "Shlok successfully deleted."
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
              Shlok Management
            </h1>
          </div>

          <button
            type="button"
            className="back-admin-btn"
            onClick={() =>
              navigate("/admin")
            }
          >
            <ArrowLeft className="btn-icon" size={16} /> Admin Dashboard
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

            {/* SANSKRIT SHLOK - Shared across both languages */}
            <div className="form-group">
              <label>
                <Activity className="btn-icon" size={16} /> Sanskrit Shlok (સંસ્કૃત શ્લોક બંને ભાષા માટે સમાન રહેશે)
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

            {/* LANGUAGE TABS & AI AUTO-TRANSLATE */}
            <div className="admin-lang-tabs-bar">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`admin-lang-tab ${activeLangTab === "gu" ? "active" : ""}`}
                  onClick={() => setActiveLangTab("gu")}
                >
                  ગુજરાતી વિગત
                </button>
                <button
                  type="button"
                  className={`admin-lang-tab ${activeLangTab === "hi" ? "active" : ""}`}
                  onClick={() => setActiveLangTab("hi")}
                >
                  हिन्दी विवरण (Auto)
                </button>
                <button
                  type="button"
                  className={`admin-lang-tab ${activeLangTab === "en" ? "active" : ""}`}
                  onClick={() => setActiveLangTab("en")}
                >
                  English Details (Auto)
                </button>
              </div>

              <div className="auto-translate-btns-group">
                {/* 1. HINDI AUTO-TRANSLATE */}
                <button
                  type="button"
                  className="auto-translate-ai-btn hi-btn"
                  onClick={() => handleAutoTranslate("hi")}
                  disabled={translating}
                  title="ગુજરાતી અનુવાદ અને સંદેશ પરથી AI દ્વારા આપોઆપ હિન્દી અનુવાદ કરો"
                >
                  <Sparkles className={`btn-icon ${translatingLang === "hi" ? "spinning" : ""}`} size={16} />
                  {translatingLang === "hi"
                    ? txt("AI હિન્દી અનુવાદ થઈ રહ્યું છે...", "AI हिन्दी अनुवाद हो रहा है...", "AI translating Hindi...")
                    : txt("✨ AI હિન્દી ઓટો-અનુવાદ", "✨ AI हिन्दी ऑटो-अनुवाद", "✨ AI Hindi Auto-Translate")}
                </button>

                {/* 2. ENGLISH AUTO-TRANSLATE */}
                <button
                  type="button"
                  className="auto-translate-ai-btn en-btn"
                  onClick={() => handleAutoTranslate("en")}
                  disabled={translating}
                  title="ગુજરાતી અનુવાદ અને સંદેશ પરથી AI દ્વારા આપોઆપ અંગ્રેજી અનુવાદ કરો"
                >
                  <Sparkles className={`btn-icon ${translatingLang === "en" ? "spinning" : ""}`} size={16} />
                  {translatingLang === "en"
                    ? txt("AI અંગ્રેજી અનુવાદ થઈ રહ્યું છે...", "AI अंग्रेज़ी अनुवाद हो रहा है...", "AI translating English...")
                    : txt("✨ AI અંગ્રેજી ઓટો-અનુવાદ", "✨ AI अंग्रेज़ी ऑटो-अनुवाद", "✨ AI English Auto-Translate")}
                </button>
              </div>
            </div>

            {/* AUTO TRANSLATE SUCCESS BANNER */}
            {autoTranslateSuccess && (
              <div className="auto-translate-success-banner">
                {autoTranslateSuccess}
              </div>
            )}

            {/* TAB CONTENT: GUJARATI */}
            {activeLangTab === "gu" && (
              <>
                {/* SPEAKER */}
                <div className="form-group">
                  <label>
                    Speaker (વક્તા - ગુજરાતી)
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

                {/* WORD-WISE GUJARATI MEANING */}
                <div className="word-wise-section">
                  <div className="word-wise-section-header">
                    <div className="word-wise-title-area">
                      <div className="word-wise-icon">
                        <Type className="btn-icon" size={16} />
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
                    <Lightbulb className="btn-icon" size={16} /> Sanskrit Shlokના દરેક
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
                                Sanskrit Word (સંસ્કૃત)
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
                                <Trash2 className="btn-icon" size={16} />
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
                    <Lightbulb className="btn-icon" size={16} /> Sanskrit word તમે
                    manually edit કરી શકો છો.
                    કોઈ word delete કરી શકો છો
                    અને "Add Word" દ્વારા નવો
                    word પણ ઉમેરી શકો છો.
                  </small>
                </div>

                {/* TRANSLATION */}
                <div className="form-group">
                  <label>
                    <BookOpen className="btn-icon" size={16} /> Gujarati Translation (ગુજરાતી અનુવાદ)
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
                    <Sparkles className="btn-icon" size={16} /> Message / Explanation (ગુજરાતી સંદેશ)
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
              </>
            )}

            {/* TAB CONTENT: HINDI */}
            {activeLangTab === "hi" && (
              <>
                <div className="sanskrit-shared-notice">
                  ℹ️ <strong>સંસ્કૃત શ્લોક અને શબ્દો બંને ભાષા માટે એકસમાન (Pure Sanskrit) રહે છે.</strong><br/>
                  તમારે ફરીથી સંસ્કૃત શ્લોક ઉમેરવાની જરૂર નથી. ઉપર આપેલા <strong>"✨ AI હિન્દી ઓટો-અનુવાદ"</strong> બટન પર ક્લિક કરવાથી બધા જ અર્થ, શબ્દાર્થ અને સંદેશ આપોઆપ હિન્દીમાં અનુવાદ થઈ જશે.
                </div>

                {/* HINDI SPEAKER */}
                <div className="form-group">
                  <label>
                    Speaker (वक्ता - हिन्दी)
                  </label>

                  <input
                    type="text"
                    name="speakerHi"
                    value={
                      formData.speakerHi
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: धृतराष्ट्र उवाच"
                  />
                </div>

                {/* WORD-WISE HINDI MEANING */}
                <div className="word-wise-section">
                  <div className="word-wise-section-header">
                    <div className="word-wise-title-area">
                      <div className="word-wise-icon">
                        <Type className="btn-icon" size={16} />
                      </div>

                      <div>
                        <h3>
                          Word-wise Hindi Meaning (हिन्दी शब्दार्थ)
                        </h3>

                        <p>
                          સંસ્કૃત શબ્દ સમાન રહે છે, અહીં તેનો હિન્દી અર્થ AI દ્વારા આપોઆપ આવે છે અથવા તમે સુધારી શકો છો.
                        </p>
                      </div>
                    </div>
                  </div>

                  {wordMeanings.length === 0 ? (
                    <div className="word-empty-box">
                      <div className="word-empty-icon">
                        🔤
                      </div>

                      <h3>
                        પહેલાં સંસ્કૃત શ્લોક લખો જેથી શબ્દો દેખાય
                      </h3>
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
                                Sanskrit Word (Pure Sanskrit)
                              </label>

                              <input
                                type="text"
                                value={
                                  item.word
                                }
                                readOnly
                                placeholder="Sanskrit word"
                                className="sanskrit-word-input"
                                style={{ backgroundColor: "#fdf8ef" }}
                              />
                            </div>

                            <div className="word-arrow">
                              →
                            </div>

                            <div className="word-input-group">
                              <label>
                                Hindi Meaning (हिन्दी अर्थ)
                              </label>

                              <input
                                type="text"
                                value={
                                  item.meaningHi || ""
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateWord(
                                    item.id,
                                    "meaningHi",
                                    event.target.value
                                  )
                                }
                                placeholder="हिन्दी अर्थ લખો..."
                                className="gujarati-word-input"
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* HINDI TRANSLATION */}
                <div className="form-group">
                  <label>
                    <BookOpen className="btn-icon" size={16} /> Hindi Translation (हिन्दी अनुवाद)
                  </label>

                  <RichTextEditor
                    value={
                      formData.translationHi
                    }
                    onChange={(value) =>
                      setFormData(
                        (current) => ({
                          ...current,
                          translationHi:
                            value,
                        })
                      )
                    }
                    placeholder="श्लोक का हिन्दी अर्थ..."
                  />
                </div>

                {/* HINDI MESSAGE */}
                <div className="form-group">
                  <label>
                    <Sparkles className="btn-icon" size={16} /> Hindi Message / Explanation (हिन्दी संदेश)
                  </label>

                  <RichTextEditor
                    value={
                      formData.messageHi
                    }
                    onChange={(value) =>
                      setFormData(
                        (current) => ({
                          ...current,
                          messageHi: value,
                        })
                      )
                    }
                    placeholder="श्लोक से मिलने वाला आध्यात्मिक संदेश..."
                  />
                </div>
              </>
            )}

            {/* TAB CONTENT: ENGLISH */}
            {activeLangTab === "en" && (
              <>
                <div className="sanskrit-shared-notice">
                  ℹ️ <strong>સંસ્કૃત શ્લોક અને શબ્દો ત્રણેય ભાષા માટે એકસમાન (Pure Sanskrit) રહે છે.</strong><br/>
                  તમારે ફરીથી સંસ્કૃત શ્લોક ઉમેરવાની જરૂર નથી. ઉપર આપેલા <strong>"✨ AI બધી ભાષા ઓટો-અનુવાદ"</strong> બટન પર ક્લિક કરવાથી બધા જ અર્થ, શબ્દાર્થ અને સંદેશ આપોઆપ English માં અનુવાદ થઈ જશે.
                </div>

                {/* ENGLISH SPEAKER */}
                <div className="form-group">
                  <label>
                    Speaker (વક્તા - English)
                  </label>

                  <input
                    type="text"
                    name="speakerEn"
                    value={
                      formData.speakerEn
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: The Blessed Lord said / Dhritarashtra said"
                  />
                </div>

                {/* WORD-WISE ENGLISH MEANING */}
                <div className="word-wise-section">
                  <div className="word-wise-section-header">
                    <div className="word-wise-title-area">
                      <div className="word-wise-icon">
                        <Type className="btn-icon" size={16} />
                      </div>

                      <div>
                        <h3>
                          Word-wise English Meaning (Sanskrit to English)
                        </h3>

                        <p>
                          સંસ્કૃત શબ્દ સમાન રહે છે, અહીં તેનો અંગ્રેજી અર્થ AI દ્વારા આપોઆપ આવે છે અથવા તમે સુધારી શકો છો.
                        </p>
                      </div>
                    </div>
                  </div>

                  {wordMeanings.length === 0 ? (
                    <div className="word-empty-box">
                      <div className="word-empty-icon">
                        🔤
                      </div>

                      <h3>
                        પહેલાં સંસ્કૃત શ્લોક લખો જેથી શબ્દો દેખાય
                      </h3>
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
                                Sanskrit Word (Pure Sanskrit)
                              </label>

                              <input
                                type="text"
                                value={
                                  item.word
                                }
                                readOnly
                                placeholder="Sanskrit word"
                                className="sanskrit-word-input"
                                style={{ backgroundColor: "#fdf8ef" }}
                              />
                            </div>

                            <div className="word-arrow">
                              →
                            </div>

                            <div className="word-input-group">
                              <label>
                                English Meaning
                              </label>

                              <input
                                type="text"
                                value={
                                  item.meaningEn || ""
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateWord(
                                    item.id,
                                    "meaningEn",
                                    event.target.value
                                  )
                                }
                                placeholder="Enter English meaning..."
                                className="gujarati-word-input"
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* ENGLISH TRANSLATION */}
                <div className="form-group">
                  <label>
                    <BookOpen className="btn-icon" size={16} /> English Translation (અંગ્રેજી અનુવાદ)
                  </label>

                  <RichTextEditor
                    value={
                      formData.translationEn
                    }
                    onChange={(value) =>
                      setFormData(
                        (current) => ({
                          ...current,
                          translationEn:
                            value,
                        })
                      )
                    }
                    placeholder="English translation of the sacred verse..."
                  />
                </div>

                {/* ENGLISH MESSAGE */}
                <div className="form-group">
                  <label>
                    <Sparkles className="btn-icon" size={16} /> English Divine Message / Commentary (અંગ્રેજી સંદેશ)
                  </label>

                  <RichTextEditor
                    value={
                      formData.messageEn
                    }
                    onChange={(value) =>
                      setFormData(
                        (current) => ({
                          ...current,
                          messageEn: value,
                        })
                      )
                    }
                    placeholder="Spiritual message and practical life commentary in English..."
                  />
                </div>
              </>
            )}

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
                  ? (<span><Save className="btn-icon" size={16}/> Update Shlok</span>)
                  : (<span><Plus className="btn-icon" size={16}/> Add Shlok</span>)}
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
                <FileText className="btn-icon" size={16} /> Chapter{" "}
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
              <RefreshCw className="btn-icon" size={16} /> Refresh
            </button>

          </div>

          {loading ? (
            <div className="loading-box">
              ⏳ {txt("શ્લોક લોડ થઈ રહ્યા છે...", "श्लोक लोड हो रहे हैं...", "Loading shlokas...")}
            </div>
          ) : shlokas.length ===
            0 ? (
            <div className="empty-box">
              <Archive className="btn-icon" size={16} /> આ Chapterમાં હજુ કોઈ
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
                        className={
                          isExpanded
                            ? "shlok-number-box active"
                            : "shlok-number-box"
                        }
                        onClick={() =>
                          toggleShlok(
                            shlok._id
                          )
                        }
                        aria-expanded={isExpanded}
                      >
                        <span className="shlok-btn-label">
                          શ્લોક
                        </span>

                        <strong>
                          {
                            shlok.shlokNumber
                          }
                        </strong>

                        <small className="shlok-btn-status">
                          {isExpanded
                            ? "▲ બંધ"
                            : "▼ ખોલો"}
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
                                <Mic className="btn-icon" size={16} />{" "}
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
                                <Trash2 className="btn-icon" size={16} /> Delete
                              </button>

                            </div>

                          </div>

                          {/* SANSKRIT */}
                          <div className="detail-content sanskrit-detail">

                            <h4>
                              <Activity className="btn-icon" size={16} /> સંસ્કૃત શ્લોક
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
                              <Type className="btn-icon" size={16} /> Word-wise Gujarati Meaning
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
                              <BookOpen className="btn-icon" size={16} /> ગુજરાતી અર્થ
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
                              <Sparkles className="btn-icon" size={16} /> સંદેશ
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

                          {/* HINDI TRANSLATION PREVIEW */}
                          {shlok.translationHi && (
                            <div className="detail-content translation-detail" style={{ borderLeft: "3px solid #f59e0b" }}>
                              <h4>
                                <BookOpen className="btn-icon" size={16} /> हिन्दी अनुवाद (Hindi Translation)
                              </h4>

                              <div
                                className="admin-translation-text"
                                dangerouslySetInnerHTML={{
                                  __html: shlok.translationHi,
                                }}
                              />
                            </div>
                          )}

                          {/* HINDI MESSAGE PREVIEW */}
                          {shlok.messageHi && (
                            <div className="detail-content message-detail" style={{ borderLeft: "3px solid #f59e0b" }}>
                              <h4>
                                <Sparkles className="btn-icon" size={16} /> हिन्दी संदेश (Hindi Message)
                              </h4>

                              <div
                                className="admin-message-text"
                                dangerouslySetInnerHTML={{
                                  __html: shlok.messageHi,
                                }}
                              />
                            </div>
                          )}

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