import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  // =====================================================
  // AUTH CONTEXT
  // =====================================================

  const { user } = useAuth();

  // =====================================================
  // STATE
  // =====================================================

  const [allShlokas, setAllShlokas] = useState([]);

  const [chapterNumber, setChapterNumber] = useState("");
  const [shlokaNumber, setShlokaNumber] = useState("");
  const [searchText, setSearchText] = useState("");

  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // CONTINUE READING STATE
  // =====================================================

  const [continueReading, setContinueReading] =
    useState(null);

  const [continueReadingLoading, setContinueReadingLoading] =
    useState(false);

  // =====================================================
  // TODAY'S SHLOK STATE
  // =====================================================

  const [todayShlok, setTodayShlok] = useState(null);

  // =====================================================
  // API URL
  // =====================================================

  const API_URL =
    "http://localhost:5000/api/shloks";

  const CONTINUE_READING_API_URL =
    "http://localhost:5000/api/continue-reading";

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
  // LOAD ALL SHLOKAS
  // =====================================================

  useEffect(() => {
    const fetchAllShlokas = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await fetch(API_URL);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Shlok data load થઈ શક્યો નથી."
          );
        }

        const fetchedShlokas =
          data.shlokas || [];

        setAllShlokas(fetchedShlokas);

        // =================================================
        // SET TODAY'S SHLOK
        // =================================================

        if (fetchedShlokas.length > 0) {
          const today = new Date();

          const startOfYear = new Date(
            today.getFullYear(),
            0,
            1
          );

          const currentDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );

          const difference =
            currentDate.getTime() -
            startOfYear.getTime();

          const dayOfYear =
            Math.floor(
              difference /
                (1000 * 60 * 60 * 24)
            );

          const todayIndex =
            dayOfYear %
            fetchedShlokas.length;

          setTodayShlok(
            fetchedShlokas[todayIndex]
          );
        } else {
          setTodayShlok(null);
        }
      } catch (error) {
        console.error(
          "❌ Home Shlok Search Error:",
          error
        );

        setMessage(
          "❌ Server સાથે connection થઈ શક્યું નથી."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllShlokas();
  }, []);

  // =====================================================
  // LOAD CONTINUE READING
  // =====================================================

  useEffect(() => {
    const loadContinueReading = async () => {
      if (!user) {
        setContinueReading(null);
        setContinueReadingLoading(false);
        return;
      }

      const token =
        localStorage.getItem("token");

      if (!token) {
        setContinueReading(null);
        setContinueReadingLoading(false);
        return;
      }

      try {
        setContinueReadingLoading(true);

        const response = await fetch(
          CONTINUE_READING_API_URL,
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
              "Continue Reading load થઈ શક્યું નથી."
          );
        }

        if (
          data.continueReading &&
          data.continueReading.chapterNumber &&
          data.continueReading.shlokNumber
        ) {
          setContinueReading(
            data.continueReading
          );
        } else {
          setContinueReading(null);
        }
      } catch (error) {
        console.error(
          "❌ Continue Reading Load Error:",
          error
        );

        setContinueReading(null);
      } finally {
        setContinueReadingLoading(false);
      }
    };

    loadContinueReading();
  }, [user]);

  // =====================================================
  // CONTINUE READING CLICK
  // =====================================================

  const handleContinueReading = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (
      !continueReading ||
      !continueReading.chapterNumber ||
      !continueReading.shlokNumber
    ) {
      navigate("/chapters");
      return;
    }

    navigate(
      `/chapter/${continueReading.chapterNumber}?shloka=${continueReading.shlokNumber}`
    );
  };

  // =====================================================
  // START READING
  // =====================================================

  const handleStartReading = () => {
    navigate("/chapters");
  };

  // =====================================================
  // QUIZ BUTTON
  // =====================================================

  const handleQuiz = () => {
    // Login ન હોય તો Login page
    if (!user) {
      navigate("/login");
      return;
    }

    // Login હોય તો Quiz Category / Chapter Selection page
    navigate("/quiz-category");
  };

  // =====================================================
  // OPEN TODAY'S SHLOK
  // =====================================================

  const handleTodayShlok = () => {
    if (
      !todayShlok ||
      !todayShlok.chapterNumber ||
      !todayShlok.shlokNumber
    ) {
      return;
    }

    navigate(
      `/chapter/${todayShlok.chapterNumber}?shloka=${todayShlok.shlokNumber}`
    );
  };

  // =====================================================
  // GET CHAPTER MAX SHLOKA
  // =====================================================

  const getChapterMaxShloka = (chapter) => {
    if (!chapter) {
      return 0;
    }

    const chapterShlokas =
      allShlokas.filter(
        (shlok) =>
          Number(shlok.chapterNumber) ===
          Number(chapter)
      );

    if (chapterShlokas.length === 0) {
      return 0;
    }

    return Math.max(
      ...chapterShlokas.map(
        (shlok) =>
          Number(shlok.shlokNumber) || 0
      )
    );
  };

  // =====================================================
  // MAX SHLOKA OF ALL CHAPTERS
  // =====================================================

  const getOverallMaxShloka = () => {
    return 78;
  };

  // =====================================================
  // CURRENT SHLOKA MAX
  // =====================================================

  const currentShlokaMax = chapterNumber
    ? getChapterMaxShloka(
        chapterNumber
      )
    : getOverallMaxShloka();

  // =====================================================
  // CHAPTER NUMBER CHANGE
  // =====================================================

  const handleChapterChange = (event) => {
    let value =
      event.target.value;

    if (value === "") {
      setChapterNumber("");
      setShlokaNumber("");
      setMessage("");
      setResult(null);
      return;
    }

    value = value.replace(/\D/g, "");

    if (!value) {
      setChapterNumber("");
      setShlokaNumber("");
      return;
    }

    const number = Number(value);

    if (
      number < 1 ||
      number > 18
    ) {
      return;
    }

    setChapterNumber(
      String(number)
    );

    setMessage("");
    setResult(null);

    const maxShloka =
      getChapterMaxShloka(number);

    if (maxShloka === 0) {
      setShlokaNumber("0");
      return;
    }

    if (shlokaNumber) {
      const currentShloka =
        Number(shlokaNumber);

      if (
        currentShloka >
        maxShloka
      ) {
        setShlokaNumber(
          String(maxShloka)
        );
      }

      if (
        currentShloka === 0
      ) {
        setShlokaNumber("");
      }
    }
  };

  // =====================================================
  // SHLOKA NUMBER CHANGE
  // =====================================================

  const handleShlokaChange = (event) => {
    let value =
      event.target.value;

    if (value === "") {
      setShlokaNumber("");
      setMessage("");
      setResult(null);
      return;
    }

    value = value.replace(/\D/g, "");

    if (!value) {
      return;
    }

    let number =
      Number(value);

    const maxShloka =
      chapterNumber
        ? getChapterMaxShloka(
            chapterNumber
          )
        : getOverallMaxShloka();

    if (
      chapterNumber &&
      maxShloka === 0
    ) {
      setShlokaNumber("0");
      setMessage("");
      setResult(null);
      return;
    }

    if (number < 1) {
      number = 1;
    }

    if (
      maxShloka > 0 &&
      number > maxShloka
    ) {
      number = maxShloka;
    }

    setShlokaNumber(
      String(number)
    );

    setMessage("");
    setResult(null);
  };

  // =====================================================
  // TEXT CHANGE
  // =====================================================

  const handleTextChange = (event) => {
    setSearchText(
      event.target.value
    );

    setMessage("");
    setResult(null);
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    const chapterValue =
      chapterNumber.trim();

    const shlokaValue =
      shlokaNumber.trim();

    const textValue =
      searchText
        .trim()
        .toLowerCase();

    setMessage("");
    setResult(null);

    if (
      !chapterValue &&
      !shlokaValue &&
      !textValue
    ) {
      setMessage(
        "❌ કૃપા કરીને શોધવા માટે કંઈક લખો."
      );
      return;
    }

    if (
      chapterValue &&
      !shlokaValue &&
      !textValue
    ) {
      setMessage(
        "⚠️ માત્ર અધ્યાય નંબરથી શોધી શકાશે નહીં. શ્લોક નંબર અથવા શબ્દ પણ લખો."
      );
      return;
    }

    if (
      chapterValue &&
      (
        Number(chapterValue) < 1 ||
        Number(chapterValue) > 18
      )
    ) {
      setMessage(
        "❌ અધ્યાય નંબર 1 થી 18 સુધી જ હોઈ શકે છે."
      );
      return;
    }

    const maxShloka =
      chapterValue
        ? getChapterMaxShloka(
            chapterValue
          )
        : getOverallMaxShloka();

    if (shlokaValue) {
      const shlokaNum =
        Number(shlokaValue);

      if (shlokaNum === 0) {
        setMessage(
          "❌ આ અધ્યાયમાં હાલમાં કોઈ શ્લોક ઉપલબ્ધ નથી."
        );
        return;
      }

      if (shlokaNum < 1) {
        setMessage(
          "❌ શ્લોક નંબર 1 અથવા તેનાથી મોટો હોવો જોઈએ."
        );
        return;
      }

      if (maxShloka === 0) {
        setMessage(
          "❌ આ અધ્યાયમાં હાલમાં કોઈ શ્લોક ઉપલબ્ધ નથી."
        );
        return;
      }

      if (
        shlokaNum > maxShloka
      ) {
        setMessage(
          `❌ ${
            chapterValue
              ? "આ અધ્યાયમાં"
              : "ગીતા માં"
          } મહત્તમ શ્લોક નંબર ${maxShloka} સુધી જ છે.`
        );
        return;
      }
    }

    const matches =
      allShlokas.filter(
        (shlok) => {
          const matchesChapter =
            !chapterValue ||
            Number(
              shlok.chapterNumber
            ) ===
              Number(
                chapterValue
              );

          const matchesShloka =
            !shlokaValue ||
            Number(
              shlok.shlokNumber
            ) ===
              Number(
                shlokaValue
              );

          const searchableText = [
            shlok.sanskrit,
            shlok.sanskritLine1,
            shlok.sanskritLine2,
            shlok.translation,
            shlok.message,
            shlok.speaker,
            shlok.chapterName,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesText =
            !textValue ||
            searchableText.includes(
              textValue
            );

          return (
            matchesChapter &&
            matchesShloka &&
            matchesText
          );
        }
      );

    if (
      matches.length === 0
    ) {
      setMessage(
        "❌ કોઈ શ્લોક મળ્યો નથી."
      );
      return;
    }

    setResult(matches);
  };

  // =====================================================
  // ENTER KEY SEARCH
  // =====================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter"
    ) {
      event.preventDefault();
      handleSearch();
    }
  };

  // =====================================================
  // OPEN SHLOKA
  // =====================================================

  const openShloka = (item) => {
    navigate(
      `/chapter/${item.chapterNumber}?shloka=${item.shlokNumber}`
    );
  };

  // =====================================================
  // CONTINUE READING BUTTON CONTENT
  // =====================================================

  const renderReadingButton = () => {
    if (user) {
      if (continueReadingLoading) {
        return (
          <button
            type="button"
            className="continue-reading-button"
            disabled
          >
            ⏳ Continue Reading...
          </button>
        );
      }

      if (
        continueReading &&
        continueReading.chapterNumber &&
        continueReading.shlokNumber
      ) {
        return (
          <button
            type="button"
            className="continue-reading-button"
            onClick={
              handleContinueReading
            }
          >
            📖 Continue Reading
            {" • "}
            અધ્યાય{" "}
            {
              continueReading.chapterNumber
            }
            {" • "}
            શ્લોક{" "}
            {
              continueReading.shlokNumber
            }
          </button>
        );
      }

      return (
        <button
          type="button"
          className="continue-reading-button"
          onClick={
            handleStartReading
          }
        >
          📖 ગીતા વાંચવાનું શરૂ કરો
        </button>
      );
    }

    return null;
  };

  // =====================================================
  // HOME PAGE
  // =====================================================

  return (
   <main className="home-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="hero">

        {/* SACRED TITLE */}

        <p className="subtitle">
          ॥ श्रीमद्भगवद्गीता ॥
        </p>

        {/* MAIN TITLE */}

        <h1>
          ભગવદ્ ગીતા
        </h1>

        {/* DESCRIPTION */}

        <p className="description">
          ભગવાન શ્રીકૃષ્ણના દિવ્ય જ્ઞાન અને જીવનને
          સાચી દિશા આપતા અમૂલ્ય ઉપદેશની પવિત્ર
          યાત્રામાં આપનું સ્વાગત છે.
        </p>

        {/* =================================================
            START READING
        ================================================= */}

        {user ? (
          renderReadingButton()
        ) : (
          <button
            type="button"
            onClick={
              handleStartReading
            }
          >
            ગીતા વાંચવાનું શરૂ કરો
          </button>
        )}

        {/* =================================================
            QUIZ BUTTON
        ================================================= */}

        <button
          type="button"
          className="quiz-home-button"
          onClick={handleQuiz}
        >
          📝 Quiz રમો
        </button>

        {/* =================================================
            ADVANCED SEARCH
        ================================================= */}

        <div className="home-search">

          {/* SEARCH TITLE */}

          <div className="search-title">
            🔎 ગીતા શ્લોક શોધો
          </div>

          {/* SEARCH FIELDS */}

          <div className="search-fields">

            {/* CHAPTER */}

            <input
              type="number"
              placeholder="અધ્યાય નંબર"
              value={chapterNumber}
              onChange={
                handleChapterChange
              }
              onKeyDown={
                handleKeyDown
              }
              min="1"
              max="18"
            />

            {/* SHLOKA */}

            <input
              type="number"
              placeholder={
                chapterNumber
                  ? getChapterMaxShloka(
                      chapterNumber
                    ) === 0
                    ? "શ્લોક નંબર (0)"
                    : `શ્લોક નંબર (1-${getChapterMaxShloka(
                        chapterNumber
                      )})`
                  : "શ્લોક નંબર (1-78)"
              }
              value={shlokaNumber}
              onChange={
                handleShlokaChange
              }
              onKeyDown={
                handleKeyDown
              }
              min={
                chapterNumber &&
                currentShlokaMax === 0
                  ? "0"
                  : "1"
              }
              max={
                currentShlokaMax > 0
                  ? currentShlokaMax
                  : "0"
              }
              disabled={
                !!chapterNumber &&
                currentShlokaMax === 0
              }
            />

            {/* TEXT */}

            <input
              type="text"
              placeholder="શ્લોક / શબ્દ શોધો..."
              value={searchText}
              onChange={
                handleTextChange
              }
              onKeyDown={
                handleKeyDown
              }
            />

            {/* SEARCH BUTTON */}

            <button
              type="button"
              className="search-button"
              onClick={
                handleSearch
              }
              disabled={loading}
            >
              {loading
                ? "⏳ Loading..."
                : "🔍 શોધો"}
            </button>

          </div>

          {/* LOADING MESSAGE */}

          {loading && (
            <div className="search-message">
              📖 MongoDBમાંથી શ્લોક data
              લોડ થઈ રહ્યો છે...
            </div>
          )}

          {/* ERROR / MESSAGE */}

          {!loading &&
            message && (
              <div className="search-message">
                {message}
              </div>
            )}

          {/* SEARCH RESULTS */}

          {result && (
            <div className="search-results">

              <h3>
                🔎 {result.length} પરિણામ મળ્યા
              </h3>

              {result.map(
                (item, index) => (
                  <div
                    className="search-result-card"
                    key={
                      `${item._id}-${index}`
                    }
                    onClick={() =>
                      openShloka(item)
                    }
                  >

                    <div className="result-chapter">
                      અધ્યાય{" "}
                      {
                        item.chapterNumber
                      }

                      {" • "}

                      શ્લોક{" "}
                      {
                        item.shlokNumber
                      }
                    </div>

                    <h4>
                      {
                        item.chapterName ||
                        chapterNames[
                          item.chapterNumber
                        ] ||
                        `અધ્યાય ${item.chapterNumber}`
                      }
                    </h4>

                    <p>
                      {
                        item.translation
                      }
                    </p>

                    <span>
                      શ્લોક વાંચો →
                    </span>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          TODAY'S SHLOK
      ================================================= */}

      {todayShlok && (
        <section className="today-shlok">

          <div className="today-shlok-header">

            <span className="today-shlok-icon">
              🌸
            </span>

            <div>

              <h2>
                આજનો શ્લોક
              </h2>

              <p>
                આજના દિવસ માટે ગીતા માંથી પસંદ કરાયેલ
                દિવ્ય સંદેશ
              </p>

            </div>

          </div>

          <div className="today-shlok-meta">

            <span>
              અધ્યાય{" "}
              {todayShlok.chapterNumber}
            </span>

            <span>
              {todayShlok.chapterName ||
                chapterNames[
                  todayShlok.chapterNumber
                ] ||
                `અધ્યાય ${todayShlok.chapterNumber}`}
            </span>

            <span>
              શ્લોક{" "}
              {todayShlok.shlokNumber}
            </span>

          </div>

          <div className="today-shlok-content">

            <div className="today-sanskrit">

              {todayShlok.sanskrit && (
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      todayShlok.sanskrit,
                  }}
                />
              )}

            </div>

            {todayShlok.translation && (
              <div className="today-translation">

                <h3>
                  📖 ગુજરાતી અનુવાદ
                </h3>

                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      todayShlok.translation,
                  }}
                />

              </div>
            )}

            {todayShlok.message && (
              <div className="today-message">

                <h3>
                  🌼 આજનો સંદેશ
                </h3>

                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      todayShlok.message,
                  }}
                />

              </div>
            )}

          </div>

          <button
            type="button"
            className="today-shlok-button"
            onClick={
              handleTodayShlok
            }
          >
            📖 સંપૂર્ણ શ્લોક વાંચો →
          </button>

        </section>
      )}

      {/* =================================================
          WELCOME SECTION
      ================================================= */}

      <section className="welcome">

        <h2>
          ગીતા શા માટે વાંચવી?
        </h2>

        <p>
          ભગવદ્ ગીતા માત્ર એક ગ્રંથ નથી,
          પરંતુ જીવનને સમજવાની અને યોગ્ય
          માર્ગ પસંદ કરવાની દિવ્ય દિશા છે.
        </p>

      </section>

    </main>
  );
}

export default Home;