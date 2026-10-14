import { getValidToken, handleAuth401, clearAuthSession } from "../utils/authHelper.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Lock, Loader2, AlertCircle, RefreshCw, BookOpen, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import SudarshanShimmerLoader from "../components/SudarshanShimmerLoader.jsx";
import "./FavouriteShlokas.css";

function FavouriteShlokas() {
  const navigate = useNavigate();
  const { isHindi, isEnglish, isGujarati, txt, CHAPTER_NAMES } = useLanguage();

  // =====================================================
  // AUTH CONTEXT
  // =====================================================

  const { user } = useAuth();

  // =====================================================
  // STATE
  // =====================================================

  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // API URL
  // =====================================================

  const API_URL =
    "https://bhagavad-gita-website.onrender.com/api/favorites";

  // =====================================================
  // LOAD FAVOURITE SHLOKAS
  // =====================================================

  useEffect(() => {
    const loadFavourites = async () => {
      // User login નથી
      if (!user) {
        setFavourites([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // =================================================
        // GET TOKEN
        // =================================================

        const token = getValidToken();

        if (!token) {
          setError(
            txt(
              "કૃપા કરીને પહેલા Login કરો.",
              "पसंदीदा श्लोक देखने के लिए कृपया पहले Login करें।",
              "Please Log In to view your favorite verses."
            )
          );
          setLoading(false);
          return;
        }

        // =================================================
        // FETCH FAVOURITES
        // GET /api/favorites/
        // =================================================

        const response = await fetch(
          API_URL,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            clearAuthSession();
            setError(
              txt(
                "તમારું સત્ર સમાપ્ત થઈ ગયું છે. કૃપા કરીને ફરી Login કરો.",
                "आपका सत्र समाप्त हो गया है। कृपया पुनः Login करें।",
                "Your session has expired. Please Log In again."
              )
            );
            setLoading(false);
            return;
          }
          throw new Error(
            data.message ||
              txt(
                "Favourite શ્લોક load થઈ શક્યા નથી.",
                "पसंदीदा श्लोक लोड नहीं हो सके।",
                "Failed to load favorite verses."
              )
          );
        }

        // =================================================
        // SET FAVOURITES
        // =================================================

        setFavourites(
          data.favorites ||
            data.favourites ||
            []
        );
      } catch (err) {
        console.error(
          "Load Favourite Shlokas Error:",
          err
        );

        setError(
          err.message ||
            txt(
              "Favourite શ્લોક load કરવામાં error આવ્યો.",
              "पसंदीदा श्लोक लोड करने में त्रुटि आई।",
              "An error occurred while loading favorite verses."
            )
        );
      } finally {
        setLoading(false);
      }
    };

    loadFavourites();
  }, [user]);

  // =====================================================
  // OPEN SHLOKA
  // =====================================================

  const openShloka = (item) => {
    const shlok =
      item.shlok || item;

    const chapterNumber =
      item.chapterNumber ||
      shlok.chapterNumber;

    const shlokNumber =
      item.shlokNumber ||
      shlok.shlokNumber;

    if (
      !chapterNumber ||
      !shlokNumber
    ) {
      return;
    }

    navigate(
      `/chapter/${chapterNumber}?shloka=${shlokNumber}`
    );
  };

  // =====================================================
  // REMOVE FAVOURITE
  // =====================================================

  const removeFavourite = async (
    item
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // =================================================
      // GET SHLOK ID
      // =================================================

      const shlok =
        item.shlok || item;

      const shlokId =
        item.shlokId ||
        shlok._id;

      if (!shlokId) {
        setError(
          txt("Shlok ID મળ્યો નથી.", "श्लोक ID नहीं मिला।", "Verse ID not found.")
        );
        return;
      }

      // =================================================
      // DELETE FROM BACKEND
      // DELETE /api/favorites/:shlokId
      // =================================================

      const response = await fetch(
        `${API_URL}/${shlokId}`,
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
            txt(
              "Favourite દૂર થઈ શક્યું નથી.",
              "पसंदीदा से नहीं हटाया जा सका।",
              "Could not remove from favorites."
            )
        );
      }

      // =================================================
      // UPDATE UI
      // =================================================

      setFavourites(
        favourites.filter(
          (favourite) => {
            const favouriteShlok =
              favourite.shlok ||
              favourite;

            const favouriteId =
              favourite.shlokId ||
              favouriteShlok._id;

            return (
              String(favouriteId) !==
              String(shlokId)
            );
          }
        )
      );
    } catch (err) {
      console.error(
        "Remove Favourite Error:",
        err
      );

      setError(
        err.message ||
          txt(
            "Favourite દૂર કરવામાં error આવ્યો.",
            "पसंदीदा हटाने में त्रुटि आई।",
            "Error removing favorite verse."
          )
      );
    }
  };

  // =====================================================
  // CLEAR ALL FAVOURITES
  // =====================================================

  const clearAllFavourites = async () => {
    const confirmed =
      window.confirm(
        txt(
          "શું તમે બધા Favourite શ્લોક દૂર કરવા માંગો છો?",
          "क्या आप सभी पसंदीदा श्लोक हटाना चाहते हैं?",
          "Are you sure you want to remove all favorite verses?"
        )
      );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // =================================================
      // DELETE ALL FROM BACKEND
      // DELETE /api/favorites/
      // =================================================

      const response = await fetch(
        API_URL,
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
            txt(
              "Favourite શ્લોક દૂર થઈ શક્યા નથી.",
              "पसंदीदा श्लोक नहीं हटाए जा सके।",
              "Could not clear favorite verses."
            )
        );
      }

      // =================================================
      // UPDATE UI
      // =================================================

      setFavourites([]);
    } catch (err) {
      console.error(
        "Clear Favourite Error:",
        err
      );

      setError(
        err.message ||
          txt(
            "બધા Favourite દૂર કરવામાં error આવ્યો.",
            "सभी पसंदीदा हटाने में त्रुटि आई।",
            "Error clearing all favorite verses."
          )
      );
    }
  };

  // =====================================================
  // LOGIN REQUIRED
  // =====================================================

  if (!user) {
    return (
      <main className="favourite-page">

        <section className="favourite-header">

          <div className="favourite-om">
            ॐ
          </div>

          <p className="favourite-sacred-title">
            ॥ श्रीमद्भगवद्गीता ॥
          </p>

          <h1>
            <Heart className="btn-icon" size={28} /> {txt("Favourite શ્લોક", "पसंदीदा श्लोक", "Favorite Verses")}
          </h1>

          <p>
            {txt(
              "તમારા મનપસંદ શ્લોક જોવા માટે Login કરો.",
              "अपने पसंदीदा श्लोक देखने के लिए Login करें।",
              "Please Log In to view your saved favorite verses."
            )}
          </p>

        </section>

        <section className="favourite-empty-card">

          <div className="favourite-empty-icon">
            <Lock size={48} color="#3b82f6" />
          </div>

          <h2>
            {txt("Login જરૂરી છે", "Login आवश्यक है", "Login Required")}
          </h2>

          <p>
            {txt(
              "Favourite શ્લોક save કરવા અને જોવા માટે કૃપા કરીને Login કરો.",
              "पसंदीदा श्लोक सुरक्षित करने और देखने के लिए कृपया Login करें।",
              "Please Log In to save and view your favorite verses."
            )}
          </p>

          <button
            type="button"
            className="favourite-back-btn"
            onClick={() => {
              const loginMsg = txt(
                "મનપસંદ શ્લોક જોવા માટે Login કરવું જરૂરી છે.",
                "पसंदीदा श्लोक देखने के लिए Login करना आवश्यक है।",
                "Log In is required to view your favorite verses."
              );
              sessionStorage.setItem(
                "authRedirect",
                JSON.stringify({
                  from: "/favorites",
                  message: loginMsg,
                })
              );
              navigate("/login", {
                state: {
                  from: "/favorites",
                  message: loginMsg,
                },
              });
            }}
          >
            <Lock className="btn-icon" size={18} /> {txt("Login કરો", "Login करें", "Log In")}
          </button>

        </section>

      </main>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="favourite-page">

        <section className="favourite-header">

          <div className="favourite-om">
            ॐ
          </div>

          <p className="favourite-sacred-title">
            ॥ श्रीमद्भगवद्गीता ॥
          </p>

          <h1>
            <Heart className="btn-icon" size={28} /> {txt("Favourite શ્લોક", "पसंदीदा श्लोक", "Favorite Verses")}
          </h1>

        </section>

        <SudarshanShimmerLoader
          type="cards"
          title={txt(
            "તમારા મનપસંદ શ્લોક લોડ થઈ રહ્યા છે...",
            "आपके पसंदीदा श्लोक लोड हो रहे हैं...",
            "Loading your favorite verses..."
          )}
          subtitle={txt(
            "પવિત્ર ગીતા વાણીનું સંકલન થઈ રહ્યું છે...",
            "पवित्र गीता वाणी का संकलन हो रहा है...",
            "Compiling sacred verses from the Bhagavad Gita..."
          )}
          count={3}
        />

      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="favourite-page">

        <section className="favourite-header">

          <div className="favourite-om">
            ॐ
          </div>

          <p className="favourite-sacred-title">
            ॥ श्रीमद्भगवद्गीता ॥
          </p>

          <h1>
            <Heart className="btn-icon" size={28} /> {txt("Favourite શ્લોક", "पसंदीदा श्लोક", "Favorite Verses")}
          </h1>

        </section>

        <section className="favourite-empty-card">

          <div className="favourite-empty-icon">
            <AlertCircle size={48} color="#ef4444" />
          </div>

          <h2>
            {txt("કંઈક સમસ્યા આવી", "कोई समस्या आई", "Something went wrong")}
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="favourite-back-btn"
            onClick={() =>
              window.location.reload()
            }
          >
            <RefreshCw className="btn-icon" size={18} /> {txt("ફરી પ્રયાસ કરો", "पुनः प्रयास करें", "Try Again")}
          </button>

        </section>

      </main>
    );
  }

  // =====================================================
  // EMPTY FAVOURITES
  // =====================================================

  if (favourites.length === 0) {
    return (
      <main className="favourite-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="favourite-header">

          <div className="favourite-om">
            ॐ
          </div>

          <p className="favourite-sacred-title">
            ॥ श्रीमद्भगवद्गीता ॥
          </p>

          <h1>
            <Heart className="btn-icon" size={28} /> {txt("Favourite શ્લોક", "पसंदीदा श्लोक", "Favorite Verses")}
          </h1>

        </section>

        {/* =================================================
            EMPTY CARD
        ================================================= */}

        <section className="favourite-empty-card">

          <div className="favourite-empty-icon">
            <Heart size={48} color="#ef4444" />
          </div>

          <h2>
            {txt("હજુ કોઈ Favourite શ્લોક નથી", "अभी तक कोई पसंदीदा श्लोक नहीं", "No favorite verses yet")}
          </h2>

          <button
            type="button"
            className="favourite-back-btn"
            onClick={() =>
              navigate("/chapters")
            }
          >
            <BookOpen className="btn-icon" size={18} /> {txt("ગીતા વાંચવાનું શરૂ કરો", "गीता पढ़ना शुरू करें", "Start Reading Gita")}
          </button>

        </section>

      </main>
    );
  }

  // =====================================================
  // FAVOURITE PAGE
  // =====================================================

  return (
    <main className="favourite-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="favourite-header">

        <div className="favourite-om">
          ॐ
        </div>

        <p className="favourite-sacred-title">
          ॥ श्रीमद्भगवद्गीता ॥
        </p>

        <h1>
          <Heart className="btn-icon" size={28} /> {txt("Favourite શ્લોક", "पसंदीदा श्लोक", "Favorite Verses")}
        </h1>

        <p>
          {txt("તમારા પસંદ કરેલા શ્લોક", "आपके चुने हुए श्लोक", "Your saved favorite verses")}
        </p>

      </section>

      {/* =================================================
          FAVOURITE TOP BAR
      ================================================= */}

      <section className="favourite-top-bar">

        <div className="favourite-count">

          <strong>
            {favourites.length}
          </strong>

          <span>
            {txt("Favourite શ્લોક", "पसंदीदा श्लोक", "Favorite Verses")}
          </span>

        </div>

        <button
          type="button"
          className="clear-favourite-btn"
          onClick={
            clearAllFavourites
          }
        >
          <Trash2 className="btn-icon" size={16} /> {txt("બધા દૂર કરો", "सभी हटाएं", "Clear All")}
        </button>

      </section>

      {/* =================================================
          FAVOURITE LIST
      ================================================= */}

      <section className="favourite-list">

        {favourites.map(
          (item, index) => {

            // =================================================
            // SUPPORT DIFFERENT BACKEND RESPONSE STRUCTURES
            // =================================================

            const shlok =
              item.shlok ||
              item;

            const chapterNumber =
              item.chapterNumber ||
              shlok.chapterNumber;

            const shlokNumber =
              item.shlokNumber ||
              shlok.shlokNumber;

            const localizedChapterName = isEnglish
              ? (CHAPTER_NAMES?.[chapterNumber]?.nameEn || CHAPTER_NAMES?.[chapterNumber]?.en || item.chapterNameEn || item.chapterName)
              : isHindi
              ? (CHAPTER_NAMES?.[chapterNumber]?.nameHi || CHAPTER_NAMES?.[chapterNumber]?.hi || shlok.chapterNameHi || item.chapterName)
              : (CHAPTER_NAMES?.[chapterNumber]?.name || CHAPTER_NAMES?.[chapterNumber]?.gu || item.chapterName || shlok.chapterName);

            return (
              <article
                className="favourite-card"
                key={
                  `${chapterNumber}-${shlokNumber}-${index}`
                }
              >

                {/* =================================================
                    CARD HEADER
                ================================================= */}

                <div className="favourite-card-header">

                  <div className="favourite-number">
                    {txt("શ્લોક", "श्लोक", "Verse")}{" "}
                    {shlokNumber}
                  </div>

                  <button
                    type="button"
                    className="remove-favourite-btn"
                    onClick={() =>
                      removeFavourite(item)
                    }
                    title={txt("Favourite દૂર કરો", "पसंदीदा से हटाएं", "Remove from Favorites")}
                    aria-label={txt("Favourite દૂર કરો", "पसंदीदा से हटाएं", "Remove from Favorites")}
                  >
                    <Heart fill="#ef4444" color="#ef4444" size={20} />
                  </button>

                </div>

                {/* =================================================
                    CARD BODY (CHAPTER ON LEFT, BUTTON ON RIGHT)
                ================================================= */}

                <div className="favourite-card-body">
                  <div className="favourite-chapter">
                    {txt("અધ્યાય", "अध्याय", "Chapter")}{" "}
                    {chapterNumber}

                    {localizedChapterName && (
                      <>
                        {" • "}
                        {localizedChapterName}
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    className="read-favourite-btn"
                    onClick={() =>
                      openShloka(item)
                    }
                  >
                    <BookOpen className="btn-icon" size={15} /> {txt("શ્લોક વાંચો", "श्लोक पढ़ें", "Read Verse")}
                  </button>
                </div>

              </article>
            );
          }
        )}

      </section>

    </main>
  );
}

export default FavouriteShlokas;