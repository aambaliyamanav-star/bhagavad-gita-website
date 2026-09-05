import { useEffect, useState } from "react";
import "./ChapterReader.css";

import {
  useParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function ChapterReader() {
  const { chapterNumber } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // =====================================================
  // AUTH CONTEXT
  // =====================================================

  const { user } = useAuth();

  // =====================================================
  // STATE
  // =====================================================

  const [shlokas, setShlokas] = useState([]);
  const [chapterName, setChapterName] = useState("");
  const [currentShloka, setCurrentShloka] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Currently clicked Sanskrit word
  const [activeWordIndex, setActiveWordIndex] = useState(null);

  // =====================================================
  // FAVOURITE STATE
  // =====================================================

  const [favoriteShlokas, setFavoriteShlokas] = useState([]);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  // =====================================================
  // API URL
  // =====================================================

  const API_URL =
    "https://bhagavad-gita-website.onrender.com/api/shloks";

  const FAVORITE_API_URL =
    "https://bhagavad-gita-website.onrender.com/api/favorites";

  const CONTINUE_READING_API_URL =
    "https://bhagavad-gita-website.onrender.com/api/continue-reading";

  // =====================================================
  // CHAPTER NUMBER
  // =====================================================

  const currentChapterNumber =
    Number(chapterNumber);

  // =====================================================
  // REQUESTED SHLOK
  // =====================================================

  const requestedShloka = Number(
    searchParams.get("shloka")
  );

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
  // NORMALIZE WORD
  // =====================================================

  const normalizeWord = (word) => {
    return String(word || "")
      .replace(/<[^>]*>/g, "")
      .replace(
        /[।॥,;:!?()[\]{}"“”‘’'`]/gu,
        ""
      )
      .trim();
  };

  // =====================================================
  // REMOVE HTML
  // =====================================================

  const removeHtml = (text) => {
    if (!text) {
      return "";
    }

    const temp =
      document.createElement("div");

    temp.innerHTML = text;

    temp
      .querySelectorAll("br")
      .forEach((br) => {
        br.replaceWith("\n");
      });

    temp
      .querySelectorAll("div, p, li")
      .forEach((element) => {
        element.insertAdjacentText(
          "afterend",
          "\n"
        );
      });

    return (
      temp.textContent ||
      temp.innerText ||
      ""
    )
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .trim();
  };

  // =====================================================
  // FETCH CHAPTER SHLOKAS
  // =====================================================

  useEffect(() => {
    const fetchChapterShlokas =
      async () => {
        try {
          setLoading(true);
          setError("");
          setActiveWordIndex(null);

          const response = await fetch(
            `${API_URL}/chapter/${currentChapterNumber}`
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
            data.shlokas || [];

          // =================================================
          // SORT SHLOKAS
          // =================================================

          fetchedShlokas.sort(
            (a, b) =>
              Number(a.shlokNumber) -
              Number(b.shlokNumber)
          );

          setShlokas(fetchedShlokas);

          // =================================================
          // CHAPTER NAME
          // =================================================

          if (
            fetchedShlokas.length > 0
          ) {
            setChapterName(
              fetchedShlokas[0]
                .chapterName ||
                chapterNames[
                  currentChapterNumber
                ] ||
                `અધ્યાય ${currentChapterNumber}`
            );
          } else {
            setChapterName(
              chapterNames[
                currentChapterNumber
              ] ||
                `અધ્યાય ${currentChapterNumber}`
            );
          }

          // =================================================
          // REQUESTED SHLOK
          // =================================================

          if (requestedShloka) {
            const shlokaIndex =
              fetchedShlokas.findIndex(
                (item) =>
                  Number(
                    item.shlokNumber
                  ) === requestedShloka
              );

            if (shlokaIndex !== -1) {
              setCurrentShloka(
                shlokaIndex
              );
            } else {
              setCurrentShloka(0);
            }
          } else {
            setCurrentShloka(0);
          }
        } catch (err) {
          console.error(
            "Fetch Chapter Shlokas Error:",
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

    if (
      currentChapterNumber >= 1 &&
      currentChapterNumber <= 18
    ) {
      fetchChapterShlokas();
    } else {
      setLoading(false);
      setError(
        "Invalid chapter number."
      );
    }
  }, [
    currentChapterNumber,
    requestedShloka,
  ]);

  // =====================================================
  // LOAD FAVOURITES FROM BACKEND
  // =====================================================

  useEffect(() => {
    const loadFavorites = async () => {
      // User login નથી
      if (!user) {
        setFavoriteShlokas([]);
        return;
      }

      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          setFavoriteShlokas([]);
          return;
        }

        const response = await fetch(
          FAVORITE_API_URL,
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
              "Favourite શ્લોક load થઈ શક્યા નથી."
          );
        }

        setFavoriteShlokas(
          data.favorites || []
        );
      } catch (error) {
        console.error(
          "Load Favorites Error:",
          error
        );

        setFavoriteShlokas([]);
      }
    };

    loadFavorites();
  }, [user]);

  // =====================================================
  // CONTINUE READING
  // SAVE CURRENT SHLOK
  // =====================================================

  const saveContinueReading = async (
    chapter,
    shlok
  ) => {
    // Login વગર save નહીં થાય
    if (!user) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      return;
    }

    if (
      !chapter ||
      !shlok
    ) {
      return;
    }

    try {
      const response = await fetch(
        CONTINUE_READING_API_URL,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            chapterNumber: Number(
              chapter
            ),
            shlokNumber: Number(
              shlok
            ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Continue Reading save થઈ શક્યું નથી."
        );
      }

      console.log(
        "Continue Reading Saved:",
        data.continueReading
      );
    } catch (error) {
      console.error(
        "Save Continue Reading Error:",
        error
      );
    }
  };

  // =====================================================
  // SAVE CONTINUE READING WHEN CURRENT SHLOK CHANGES
  // =====================================================

  useEffect(() => {
    if (
      !user ||
      shlokas.length === 0
    ) {
      return;
    }

    const current =
      shlokas[currentShloka];

    if (!current) {
      return;
    }

    saveContinueReading(
      currentChapterNumber,
      current.shlokNumber
    );
  }, [
    currentShloka,
    shlokas,
    user,
    currentChapterNumber,
  ]);

  // =====================================================
  // CHECK FAVOURITE
  // =====================================================

  const isFavorite = (shloka) => {
    if (!shloka || !user) {
      return false;
    }

    return favoriteShlokas.some(
      (favorite) =>
        String(favorite._id) ===
        String(shloka._id)
    );
  };

  // =====================================================
  // TOGGLE FAVOURITE
  // =====================================================

  const toggleFavorite = async () => {
    if (!shloka) {
      return;
    }

    // User login નથી
    if (!user) {
      navigate("/login");
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setFavoriteLoading(true);

      const alreadyFavorite =
        isFavorite(shloka);

      // =================================================
      // REMOVE FAVOURITE
      // =================================================

      if (alreadyFavorite) {
        const response = await fetch(
          `${FAVORITE_API_URL}/${shloka._id}`,
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
              "Favourite દૂર થઈ શક્યું નથી."
          );
        }

        setFavoriteShlokas(
          data.favorites || []
        );

        return;
      }

      // =================================================
      // ADD FAVOURITE
      // =================================================

      const response = await fetch(
        `${FAVORITE_API_URL}/${shloka._id}`,
        {
          method: "POST",
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

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Favouriteમાં add થઈ શક્યું નથી."
        );
      }

      setFavoriteShlokas(
        data.favorites || []
      );
    } catch (error) {
      console.error(
        "Toggle Favourite Error:",
        error
      );

      alert(
        error.message ||
          "Favouriteમાં ફેરફાર કરવામાં error આવ્યો."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // =====================================================
  // SELECT SHLOK
  // =====================================================

 const selectShloka = (index) => {
  if (
    index < 0 ||
    index >= shlokas.length
  ) {
    return;
  }

  setCurrentShloka(index);
  setActiveWordIndex(null);

  // Continue Reading
  const selectedShlok =
    shlokas[index];

  if (selectedShlok) {
    saveContinueReading(
      currentChapterNumber,
      selectedShlok.shlokNumber
    );
  }

  // Scroll to current shloka
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  // =====================================================
  // INVALID CHAPTER
  // =====================================================

  if (
    currentChapterNumber < 1 ||
    currentChapterNumber > 18
  ) {
    return (
      <main className="chapter-reader">
        <div className="reader-error-card">
          <div className="error-icon">
            ❌
          </div>

          <h1>
            અધ્યાય મળ્યો નથી
          </h1>

          <p>
            તમે પસંદ કરેલો અધ્યાય
            ઉપલબ્ધ નથી.
          </p>

          <button
            className="error-back-button"
            onClick={() =>
              navigate("/chapters")
            }
          >
            ← 18 અધ્યાય પર પાછા જાઓ
          </button>
        </div>
      </main>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="chapter-reader">
        <div className="reader-loading-card">
          <div className="loading-spinner">
            🕉️
          </div>

          <h2>
            શ્લોક લોડ થઈ રહ્યા છે...
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
      <main className="chapter-reader">
        <div className="reader-error-card">
          <div className="error-icon">
            ❌
          </div>

          <h1>
            કંઈક સમસ્યા આવી
          </h1>

          <p>{error}</p>

          <button
            className="error-back-button"
            onClick={() =>
              navigate("/chapters")
            }
          >
            ← 18 અધ્યાય પર પાછા જાઓ
          </button>
        </div>
      </main>
    );
  }

  // =====================================================
  // EMPTY CHAPTER
  // =====================================================

  if (shlokas.length === 0) {
    return (
      <main className="chapter-reader">
        <section className="reader-header">
          <div className="reader-om">
            ॐ
          </div>

          <p className="reader-sacred-title">
            ॥ श्रीमद्भगवद्गीता ॥
          </p>

          <h1>
            અધ્યાય{" "}
            {currentChapterNumber}
          </h1>

          <h2>
            {chapterName}
          </h2>
        </section>

        <div className="reader-empty-card">
          <div className="empty-icon">
            📖
          </div>

          <h2>
            આ અધ્યાયમાં હજુ કોઈ શ્લોક નથી
          </h2>

          <p>
            Admin Panelમાંથી આ અધ્યાયના
            શ્લોક add કરો.
          </p>

          <button
            className="error-back-button"
            onClick={() =>
              navigate("/chapters")
            }
          >
            ← 18 અધ્યાય
          </button>
        </div>
      </main>
    );
  }

  // =====================================================
  // CURRENT SHLOKA
  // =====================================================

  const shloka =
    shlokas[currentShloka];

  // =====================================================
  // NEXT SHLOK
  // =====================================================

  const nextShloka = () => {
    if (
      currentShloka <
      shlokas.length - 1
    ) {
      const nextIndex =
        currentShloka + 1;

      setCurrentShloka(
        nextIndex
      );

      setActiveWordIndex(null);

      // Continue Reading
      const next =
        shlokas[nextIndex];

      if (next) {
        saveContinueReading(
          currentChapterNumber,
          next.shlokNumber
        );
      }
    }
  };

  // =====================================================
  // PREVIOUS SHLOK
  // =====================================================

  const previousShloka = () => {
    if (currentShloka > 0) {
      const previousIndex =
        currentShloka - 1;

      setCurrentShloka(
        previousIndex
      );

      setActiveWordIndex(null);

      // Continue Reading
      const previous =
        shlokas[previousIndex];

      if (previous) {
        saveContinueReading(
          currentChapterNumber,
          previous.shlokNumber
        );
      }
    }
  };

  // =====================================================
  // NEXT CHAPTER
  // =====================================================

  const nextChapter = () => {
    const nextChapterNumber =
      currentChapterNumber + 1;

    if (nextChapterNumber <= 18) {
      setActiveWordIndex(null);

      // Save current reading position
      saveContinueReading(
        currentChapterNumber,
        shloka.shlokNumber
      );

      navigate(
        `/chapter/${nextChapterNumber}`
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =====================================================
  // PREVIOUS CHAPTER
  // =====================================================

  const previousChapter = () => {
    const previousChapterNumber =
      currentChapterNumber - 1;

    if (
      previousChapterNumber >= 1
    ) {
      setActiveWordIndex(null);

      // Save current reading position
      saveContinueReading(
        currentChapterNumber,
        shloka.shlokNumber
      );

      navigate(
        `/chapter/${previousChapterNumber}`
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =====================================================
  // PROGRESS
  // =====================================================

  const progress =
    ((currentShloka + 1) /
      shlokas.length) *
    100;

  // =====================================================
  // GET WORD MEANING
  // =====================================================

  const getWordMeaning = (word) => {
    const wordMeanings =
      Array.isArray(
        shloka.wordMeanings
      )
        ? shloka.wordMeanings
        : [];

    const cleanWord =
      normalizeWord(word);

    if (!cleanWord) {
      return null;
    }

    const foundMeaning =
      wordMeanings.find((item) => {
        const databaseWord =
          normalizeWord(
            item?.word
          );

        return (
          databaseWord === cleanWord
        );
      });

    return foundMeaning || null;
  };

  // =====================================================
  // HANDLE WORD CLICK
  // =====================================================

  const handleWordClick = (index) => {
    if (
      activeWordIndex === index
    ) {
      setActiveWordIndex(null);
    } else {
      setActiveWordIndex(index);
    }
  };

  // =====================================================
  // PREPARE SANSKRIT WORDS
  // =====================================================

  const prepareSanskritLines =
    () => {
      const plainSanskrit =
        removeHtml(
          shloka.sanskrit
        );

      if (!plainSanskrit) {
        return [];
      }

      const rawLines =
        plainSanskrit.split(/\n+/);

      const lines = rawLines
        .map((line) =>
          line
            .replace(/\s+/g, " ")
            .trim()
        )
        .filter(Boolean);

      return lines.map((line) =>
        line
          .split(" ")
          .filter(Boolean)
      );
    };

  // =====================================================
  // RENDER SANSKRIT
  // =====================================================

  const renderSanskritWords =
    () => {
      const lines =
        prepareSanskritLines();

      if (lines.length === 0) {
        return (
          <div className="sanskrit-original">
            સંસ્કૃત શ્લોક ઉપલબ્ધ નથી.
          </div>
        );
      }

      let globalWordIndex = 0;

      return (
        <div className="sanskrit-word-container">
          {lines.map(
            (
              line,
              lineIndex
            ) => (
              <div
                className="sanskrit-line"
                key={`sanskrit-line-${lineIndex}`}
              >
                {line.map(
                  (
                    word,
                    wordPosition
                  ) => {
                    const wordIndex =
                      globalWordIndex++;

                    const meaning =
                      getWordMeaning(
                        word
                      );

                    const isActive =
                      activeWordIndex ===
                      wordIndex;

                    return (
                      <span
                        key={`${word}-${wordIndex}`}
                        className="sanskrit-word-wrapper"
                      >
                        <span
                          className={
                            isActive
                              ? "sanskrit-word active-word"
                              : meaning
                              ? "sanskrit-word clickable-word"
                              : "sanskrit-word"
                          }
                          onClick={() => {
                            if (
                              meaning
                            ) {
                              handleWordClick(
                                wordIndex
                              );
                            }
                          }}
                          title={
                            meaning
                              ? "ગુજરાતી અર્થ જોવા માટે click કરો"
                              : undefined
                          }
                        >
                          {word}
                        </span>

                        {wordPosition <
                          line.length -
                            1 && (
                          <span className="sanskrit-word-space">
                            {" "}
                          </span>
                        )}

                        {isActive &&
                          meaning && (
                          <span className="word-meaning-popup">
                            <span className="word-meaning-sanskrit">
                              {word}
                            </span>

                            <span className="word-meaning-arrow">
                              →
                            </span>

                            <span className="word-meaning-gujarati">
                              {
                                meaning.meaning
                              }
                            </span>
                          </span>
                        )}
                      </span>
                    );
                  }
                )}
              </div>
            )
          )}
        </div>
      );
    };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="chapter-reader">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="reader-header">
        <div className="reader-om">
          ॐ
        </div>

        <p className="reader-sacred-title">
          ॥ श्रीमद्भगवद्गीता ॥
        </p>

        <h1>
          અધ્યાય{" "}
          {currentChapterNumber}
        </h1>

        <h2>
          {chapterName}
        </h2>

        <p className="chapter-total">
          કુલ {shlokas.length} શ્લોક
        </p>
      </section>

      {/* =================================================
          PROGRESS
      ================================================= */}

      <section className="reader-progress">
        <div className="progress-info">
          <span>
            શ્લોક{" "}
            {shloka.shlokNumber}
            {" / "}
            {shlokas.length}
          </span>

          <span>
            {Math.round(progress)}%
          </span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </section>

      {/* =================================================
          CURRENT SHLOKA CARD
      ================================================= */}

      <section className="shloka-card">

        {/* PREVIOUS SHLOK */}

        <button
          type="button"
          className="shloka-side-button shloka-prev-button"
          onClick={previousShloka}
          disabled={
            currentShloka === 0
          }
          aria-label="પાછલો શ્લોક"
          title="પાછલો શ્લોક"
        >
          ←
        </button>

        {/* MAIN CONTENT */}

        <div className="shloka-main-content">

          {/* SHLOK NUMBER */}

          <div className="shloka-number">
            શ્લોક{" "}
            {shloka.shlokNumber}
          </div>

          {/* =================================================
              FAVOURITE BUTTON
          ================================================= */}

          <button
            type="button"
            className={
              isFavorite(shloka)
                ? "favorite-shloka-button favorited"
                : "favorite-shloka-button"
            }
            onClick={
              toggleFavorite
            }
            disabled={favoriteLoading}
            aria-label={
              isFavorite(shloka)
                ? "Favouriteમાંથી દૂર કરો"
                : "Favouriteમાં ઉમેરો"
            }
            title={
              isFavorite(shloka)
                ? "Favouriteમાંથી દૂર કરો"
                : "Favouriteમાં ઉમેરો"
            }
          >
            {isFavorite(shloka)
              ? "❤️"
              : "🤍"}
          </button>

          {/* SPEAKER */}

          <div className="speaker">
            🎙️ {shloka.speaker}
          </div>

          {/* =================================================
              SANSKRIT
          ================================================= */}

          <div className="content-box sanskrit-box">

            <h3>
              🕉️ સંસ્કૃત શ્લોક
            </h3>

            <div className="sanskrit formatted-content">
              {renderSanskritWords()}
            </div>

            {/* WORD MEANING INFO */}

            <div className="word-meaning-info">
              💡 સંસ્કૃત શબ્દનો અર્થ
              ઉપલબ્ધ છે તેના પર click
              કરીને ગુજરાતી અર્થ જુઓ.
            </div>

          </div>

          {/* =================================================
              TRANSLATION
          ================================================= */}

          <div className="content-box translation-box">

            <h3>
              📖 ગુજરાતી અનુવાદ
            </h3>

            <div
              className="gujarati-meaning formatted-content"
              dangerouslySetInnerHTML={{
                __html:
                  shloka.translation ||
                  "ગુજરાતી અનુવાદ ઉપલબ્ધ નથી.",
              }}
            />

          </div>

          {/* =================================================
              MESSAGE
          ================================================= */}

          <div className="content-box message-box">

            <h3>
              🌸 સંદેશ / સમજણ
            </h3>

            <div
              className="message-text formatted-content"
              dangerouslySetInnerHTML={{
                __html:
                  shloka.message ||
                  "સંદેશ ઉપલબ્ધ નથી.",
              }}
            />

          </div>

        </div>

        {/* NEXT SHLOK */}

        <button
          type="button"
          className="shloka-side-button shloka-next-button"
          onClick={nextShloka}
          disabled={
            currentShloka ===
            shlokas.length - 1
          }
          aria-label="આગળનો શ્લોક"
          title="આગળનો શ્લોક"
        >
          →
        </button>

      </section>

      {/* =====================================================
          CHAPTER NAVIGATION
      ===================================================== */}

      <section className="chapter-navigation">

        {/* PREVIOUS CHAPTER */}

        <button
          type="button"
          className="chapter-nav-button previous-chapter-button"
          onClick={
            previousChapter
          }
          disabled={
            currentChapterNumber ===
            1
          }
        >
          <span className="chapter-nav-text">
            <h3>
              પાછલો અધ્યાય
            </h3>

            {currentChapterNumber >
              1 && (
              <strong>
                અધ્યાય{" "}
                {currentChapterNumber -
                  1}
              </strong>
            )}
          </span>
        </button>

        {/* CURRENT CHAPTER */}

        <div className="chapter-nav-center">
          <span>
            અધ્યાય{" "}
            {currentChapterNumber}
          </span>

          <div>
            {chapterName}
          </div>
        </div>

        {/* NEXT CHAPTER */}

        <button
          type="button"
          className="chapter-nav-button next-chapter-button"
          onClick={nextChapter}
          disabled={
            currentChapterNumber ===
            18
          }
        >
          <span className="chapter-nav-text">
            <h3>
              આગળનો અધ્યાય
            </h3>

            {currentChapterNumber <
              18 && (
              <strong>
                અધ્યાય{" "}
                {currentChapterNumber +
                  1}
              </strong>
            )}
          </span>
        </button>

      </section>

      {/* =====================================================
          ALL SHLOK BUTTONS
      ===================================================== */}

      <section className="chapter-shloka-selector">

        <div className="shloka-selector-header">

          <div>
            <span className="selector-small-title">
              📖 અધ્યાય{" "}
              {currentChapterNumber}
            </span>

            <h2>
              બધા શ્લોક
            </h2>

            <p>
              કોઈપણ શ્લોક પસંદ કરો
            </p>
          </div>

          <div className="selector-count">
            <strong>
              {shlokas.length}
            </strong>

            <span>
              Shlokas
            </span>
          </div>

        </div>

        {/* SHLOK BUTTON GRID */}

        <div className="chapter-shloka-grid">

          {shlokas.map(
            (item, index) => {
              const isActive =
                index ===
                currentShloka;

              return (
                <button
                  key={
                    item._id ||
                    `${item.shlokNumber}-${index}`
                  }
                  type="button"
                  className={
                    isActive
                      ? "chapter-shloka-button active"
                      : "chapter-shloka-button"
                  }
                  onClick={() =>
                    selectShloka(
                      index
                    )
                  }
                  aria-label={`શ્લોક ${item.shlokNumber}`}
                  aria-current={
                    isActive
                      ? "true"
                      : undefined
                  }
                >
                  <span className="shlok-btn-label">
                    શ્લોક
                  </span>

                  <strong>
                    {item.shlokNumber}
                  </strong>

                  {isActive && (
                    <span className="active-shlok-indicator">
                      ●
                    </span>
                  )}
                </button>
              );
            }
          )}

        </div>

      </section>

    </main>
  );
}

export default ChapterReader;