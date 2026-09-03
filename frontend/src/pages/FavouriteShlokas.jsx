import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./FavouriteShlokas.css";

function FavouriteShlokas() {
  const navigate = useNavigate();

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
    "http://localhost:5000/api/favorites";

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

        const token =
          localStorage.getItem("token");

        if (!token) {
          setError(
            "કૃપા કરીને પહેલા Login કરો."
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
          throw new Error(
            data.message ||
              "Favourite શ્લોક load થઈ શક્યા નથી."
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
            "Favourite શ્લોક load કરવામાં error આવ્યો."
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
          "Shlok ID મળ્યો નથી."
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
            "Favourite દૂર થઈ શક્યું નથી."
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
          "Favourite દૂર કરવામાં error આવ્યો."
      );
    }
  };

  // =====================================================
  // CLEAR ALL FAVOURITES
  // =====================================================

  const clearAllFavourites = async () => {
    const confirmed =
      window.confirm(
        "શું તમે બધા Favourite શ્લોક દૂર કરવા માંગો છો?"
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
            "Favourite શ્લોક દૂર થઈ શક્યા નથી."
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
          "બધા Favourite દૂર કરવામાં error આવ્યો."
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
            ❤️ Favourite શ્લોક
          </h1>

          <p>
            તમારા મનપસંદ શ્લોક જોવા માટે
            Login કરો.
          </p>

        </section>

        <section className="favourite-empty-card">

          <div className="favourite-empty-icon">
            🔐
          </div>

          <h2>
            Login જરૂરી છે
          </h2>

          <p>
            Favourite શ્લોક save કરવા અને
            જોવા માટે કૃપા કરીને Login કરો.
          </p>

          <button
            type="button"
            className="favourite-back-btn"
            onClick={() =>
              navigate("/login")
            }
          >
            🔐 Login કરો
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
            ❤️ Favourite શ્લોક
          </h1>

        </section>

        <section className="favourite-empty-card">

          <div className="favourite-empty-icon">
            🕉️
          </div>

          <h2>
            Favourite શ્લોક લોડ થઈ રહ્યા છે...
          </h2>

          <p>
            કૃપા કરીને થોડી ક્ષણ રાહ જુઓ.
          </p>

        </section>

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
            ❤️ Favourite શ્લોક
          </h1>

        </section>

        <section className="favourite-empty-card">

          <div className="favourite-empty-icon">
            ❌
          </div>

          <h2>
            કંઈક સમસ્યા આવી
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
            🔄 ફરી પ્રયાસ કરો
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
            ❤️ Favourite શ્લોક
          </h1>

          <p>
            તમારા પસંદ કરેલા શ્લોક અહીં જોવા મળશે.
          </p>

        </section>

        {/* =================================================
            EMPTY CARD
        ================================================= */}

        <section className="favourite-empty-card">

          <div className="favourite-empty-icon">
            ❤️
          </div>

          <h2>
            હજુ કોઈ Favourite શ્લોક નથી
          </h2>

          <p>
            તમને ગમતા શ્લોકને Favourite કરો,
            તે અહીં સાચવવામાં આવશે.
          </p>

          <button
            type="button"
            className="favourite-back-btn"
            onClick={() =>
              navigate("/chapters")
            }
          >
            📖 ગીતા વાંચવાનું શરૂ કરો
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
          ❤️ Favourite શ્લોક
        </h1>

        <p>
          તમારા પસંદ કરેલા શ્લોક
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
            Favourite શ્લોક
          </span>

        </div>

        <button
          type="button"
          className="clear-favourite-btn"
          onClick={
            clearAllFavourites
          }
        >
          🗑️ બધા દૂર કરો
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

            const chapterName =
              item.chapterName ||
              shlok.chapterName;

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
                    શ્લોક{" "}
                    {shlokNumber}
                  </div>

                  <button
                    type="button"
                    className="remove-favourite-btn"
                    onClick={() =>
                      removeFavourite(item)
                    }
                    title="Favourite દૂર કરો"
                    aria-label="Favourite દૂર કરો"
                  >
                    ❤️
                  </button>

                </div>

                {/* =================================================
                    CHAPTER
                ================================================= */}

                <div className="favourite-chapter">

                  અધ્યાય{" "}
                  {chapterNumber}

                  {chapterName && (
                    <>
                      {" • "}
                      {chapterName}
                    </>
                  )}

                </div>

                {/* =================================================
                    OPEN SHLOKA BUTTON
                ================================================= */}

                <button
                  type="button"
                  className="read-favourite-btn"
                  onClick={() =>
                    openShloka(item)
                  }
                >
                  📖 શ્લોક વાંચો →
                </button>

              </article>
            );
          }
        )}

      </section>

    </main>
  );
}

export default FavouriteShlokas;