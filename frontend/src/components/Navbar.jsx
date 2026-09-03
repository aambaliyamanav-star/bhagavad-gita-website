import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // AUTH CONTEXT
  // =====================================================

  const { user, logout } = useAuth();

  // =====================================================
  // THEME CONTEXT
  // =====================================================

  const { theme, toggleTheme } = useTheme();

  // =====================================================
  // MENU
  // =====================================================

  const [menuOpen, setMenuOpen] = useState(false);

  // =====================================================
  // NAVIGATION HISTORY
  // =====================================================

  const [historyStack, setHistoryStack] =
    useState(["/"]);

  const [historyIndex, setHistoryIndex] =
    useState(0);

  const [isNavigating, setIsNavigating] =
    useState(false);

  // =====================================================
  // CURRENT PAGE NAME
  // =====================================================

  const getPageTitle = () => {
    const path = location.pathname;

    // HOME
    if (path === "/") {
      return "હોમ";
    }

    // CHAPTERS
    if (path === "/chapters") {
      return "18 અધ્યાય";
    }

    // CHAPTER READER
    if (path.startsWith("/chapter/")) {
      const chapterNumber =
        path.split("/")[2];

      if (chapterNumber) {
        return `અધ્યાય ${chapterNumber}`;
      }

      return "અધ્યાય";
    }

    // FAVORITES
    if (path === "/favorites") {
      return "મનપસંદ શ્લોક";
    }

    // QUIZ CATEGORY
    if (path === "/quiz-category") {
      return "Quiz";
    }

    // QUIZ
    if (path === "/quiz") {
      return "Quiz";
    }

    // QUIZ RESULT
    if (path.startsWith("/quiz-result")) {
      return "Quiz Result";
    }

    // HISTORY
    if (path === "/history") {
      return "History";
    }

    // PROFILE
    if (path === "/profile") {
      return "Profile";
    }

    // LOGIN
    if (path === "/login") {
      return "લોગિન";
    }

    // REGISTER
    if (path === "/register") {
      return "રજીસ્ટર";
    }

    // ADMIN
    if (path === "/admin") {
      return "Admin";
    }

    // ADMIN QUIZ
    if (path === "/admin/quiz") {
      return "Quiz Management";
    }

    // ADMIN SHLOKS
    if (path === "/admin/shloks") {
      return "Shlok Management";
    }

    // DEFAULT
    return "";
  };

  // =====================================================
  // TRACK ROUTE CHANGE
  // =====================================================

  useEffect(() => {
    const currentPath =
      location.pathname + location.search;

    if (isNavigating) {
      setIsNavigating(false);
      return;
    }

    setHistoryStack((previousHistory) => {
      const currentPathInHistory =
        previousHistory[historyIndex];

      // Same page
      if (
        currentPathInHistory ===
        currentPath
      ) {
        return previousHistory;
      }

      // Back પછી નવી page ખોલે તો
      // Forward history remove થશે
      const newHistory =
        previousHistory.slice(
          0,
          historyIndex + 1
        );

      newHistory.push(currentPath);

      setHistoryIndex(
        newHistory.length - 1
      );

      return newHistory;
    });
  }, [
    location.pathname,
    location.search,
  ]);

  // =====================================================
  // CLOSE MENU ON PAGE CHANGE
  // =====================================================

  useEffect(() => {
    setMenuOpen(false);
  }, [
    location.pathname,
    location.search,
  ]);

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    if (historyIndex <= 0) {
      return;
    }

    const newIndex =
      historyIndex - 1;

    setIsNavigating(true);

    setHistoryIndex(newIndex);

    navigate(
      historyStack[newIndex]
    );
  };

  // =====================================================
  // FORWARD
  // =====================================================

  const handleForward = () => {
    if (
      historyIndex >=
      historyStack.length - 1
    ) {
      return;
    }

    const newIndex =
      historyIndex + 1;

    setIsNavigating(true);

    setHistoryIndex(newIndex);

    navigate(
      historyStack[newIndex]
    );
  };

  // =====================================================
  // BUTTON STATUS
  // =====================================================

  const canGoBack =
    historyIndex > 0;

  const canGoForward =
    historyIndex <
    historyStack.length - 1;

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmed =
      window.confirm(
        "શું તમે ખરેખર Logout કરવા માંગો છો?"
      );

    if (!confirmed) {
      return;
    }

    setMenuOpen(false);

    logout();

    navigate("/");
  };

  // =====================================================
  // NORMAL NAVIGATION
  // =====================================================

  const handleNormalNavigation = () => {
    setIsNavigating(false);
    setMenuOpen(false);
  };

  // =====================================================
  // QUIZ NAVIGATION
  // =====================================================

  const handleQuizNavigation = () => {
    setIsNavigating(false);
    setMenuOpen(false);

    navigate("/quiz-category");
  };

  // =====================================================
  // HISTORY NAVIGATION
  // =====================================================

  const handleHistoryNavigation = () => {
    setIsNavigating(false);
    setMenuOpen(false);

    navigate("/history");
  };

  // =====================================================
  // TOGGLE MENU
  // =====================================================

  const toggleMenu = () => {
    setMenuOpen(
      (previous) => !previous
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="navbar">

        {/* =================================================
            BACK + FORWARD
        ================================================= */}

        <div className="history-buttons">

          {/* BACK */}

          <button
            type="button"
            className="history-btn back-btn"
            onClick={handleBack}
            disabled={!canGoBack}
            title="પાછળ જાઓ"
            aria-label="પાછળ જાઓ"
          >
            <span className="arrow-3d left-arrow">
              ❮
            </span>
          </button>

          {/* FORWARD */}

          <button
            type="button"
            className="history-btn forward-btn"
            onClick={handleForward}
            disabled={!canGoForward}
            title="આગળ જાઓ"
            aria-label="આગળ જાઓ"
          >
            <span className="arrow-3d right-arrow">
              ❯
            </span>
          </button>

        </div>


        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/chapters"
          className="logo"
          onClick={handleNormalNavigation}
          title="18 અધ્યાય"
          aria-label="18 અધ્યાય"
        >
          🪷 ભગવદ્ ગીતા
        </Link>


        {/* =================================================
            RIGHT SIDE
            PAGE NAME + HAMBURGER
        ================================================= */}

        <div className="navbar-right">

          {/* CURRENT PAGE NAME */}

          <span className="current-page-title">
            {getPageTitle()}
          </span>


          {/* HAMBURGER */}

          <button
            type="button"
            className={
              menuOpen
                ? "hamburger-btn active"
                : "hamburger-btn"
            }
            onClick={toggleMenu}
            aria-label={
              menuOpen
                ? "મેનુ બંધ કરો"
                : "મેનુ ખોલો"
            }
            aria-expanded={menuOpen}
            title={
              menuOpen
                ? "મેનુ બંધ કરો"
                : "મેનુ ખોલો"
            }
          >

            <span></span>
            <span></span>
            <span></span>

          </button>

        </div>

      </nav>


      {/* =====================================================
          NAVBAR SPACE

          Navbar fixed હોવાથી page navbarની પાછળ
          ન જાય તે માટે આ જગ્યા reserve કરશે.
      ===================================================== */}

      <div
        className="navbar-spacer"
        aria-hidden="true"
      />


      {/* =====================================================
          OVERLAY
      ===================================================== */}

      {menuOpen && (
        <div
          className="navbar-menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}


      {/* =====================================================
          SIDE MENU
      ===================================================== */}

      <aside
        className={
          menuOpen
            ? "navbar-side-menu open"
            : "navbar-side-menu"
        }
      >

        {/* =================================================
            MENU HEADER
        ================================================= */}

        <div className="side-menu-header">

          <div className="side-menu-title">

            <div className="side-menu-logo">
              🪷
            </div>

            <div>

              <h2>
                ભગવદ્ ગીતા
              </h2>

              <span>
                {user
                  ? `${user.name} • ${
                      user.role === "admin"
                        ? "Administrator"
                        : "Logged in user"
                    }`
                  : "Navigation Menu"}
              </span>

            </div>

          </div>


          {/* CLOSE */}

          <button
            type="button"
            className="side-menu-close"
            onClick={() =>
              setMenuOpen(false)
            }
            aria-label="મેનુ બંધ કરો"
            title="બંધ કરો"
          >
            ×
          </button>

        </div>


        {/* =================================================
            MENU CONTENT
        ================================================= */}

        <div className="side-menu-content">

          {/* =================================================
              HOME
          ================================================= */}

          <Link
            to="/"
            className="side-menu-item"
            onClick={
              handleNormalNavigation
            }
          >

            <span className="side-menu-icon">
              ⌂
            </span>

            <span className="side-menu-text">

              <strong>
                હોમ
              </strong>

              <small>
                Home
              </small>

            </span>

            <span className="side-menu-arrow">
              ›
            </span>

          </Link>


          {/* =================================================
              18 CHAPTERS
          ================================================= */}

          <Link
            to="/chapters"
            className="side-menu-item"
            onClick={
              handleNormalNavigation
            }
          >

            <span className="side-menu-icon">
              📖
            </span>

            <span className="side-menu-text">

              <strong>
                18 અધ્યાય
              </strong>

              <small>
                Bhagavad Gita Chapters
              </small>

            </span>

            <span className="side-menu-arrow">
              ›
            </span>

          </Link>


          {/* =================================================
              FAVOURITES
          ================================================= */}

          <Link
            to="/favorites"
            className="side-menu-item"
            onClick={
              handleNormalNavigation
            }
          >

            <span className="side-menu-icon">
              ♥
            </span>

            <span className="side-menu-text">

              <strong>
                મનપસંદ શ્લોક
              </strong>

              <small>
                Favourite Shlokas
              </small>

            </span>

            <span className="side-menu-arrow">
              ›
            </span>

          </Link>


          {/* =================================================
              QUIZ
          ================================================= */}

          {user && (
            <button
              type="button"
              className="side-menu-item side-menu-button"
              onClick={
                handleQuizNavigation
              }
            >

              <span className="side-menu-icon">
                🧠
              </span>

              <span className="side-menu-text">

                <strong>
                  Quiz
                </strong>

                <small>
                  Test Your Knowledge
                </small>

              </span>

              <span className="side-menu-arrow">
                ›
              </span>

            </button>
          )}


          {/* =================================================
              HISTORY
          ================================================= */}

          {user && (
            <button
              type="button"
              className="side-menu-item side-menu-button"
              onClick={
                handleHistoryNavigation
              }
            >

              <span className="side-menu-icon">
                ◷
              </span>

              <span className="side-menu-text">

                <strong>
                  History
                </strong>

                <small>
                  Your Quiz History
                </small>

              </span>

              <span className="side-menu-arrow">
                ›
              </span>

            </button>
          )}


          {/* =================================================
              PROFILE
          ================================================= */}

          {user && (
            <Link
              to="/profile"
              className="side-menu-item"
              onClick={
                handleNormalNavigation
              }
            >

              <span className="side-menu-icon">
                ◉
              </span>

              <span className="side-menu-text">

                <strong>
                  Profile
                </strong>

                <small>
                  Your Account
                </small>

              </span>

              <span className="side-menu-arrow">
                ›
              </span>

            </Link>
          )}


          {/* =================================================
              ADMIN
          ================================================= */}

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="side-menu-item admin-menu-item"
              onClick={
                handleNormalNavigation
              }
            >

              <span className="side-menu-icon">
                ◆
              </span>

              <span className="side-menu-text">

                <strong>
                  Admin
                </strong>

                <small>
                  Admin Dashboard
                </small>

              </span>

              <span className="side-menu-arrow">
                ›
              </span>

            </Link>
          )}


          {/* =================================================
              LOGIN
          ================================================= */}

          {!user && (
            <Link
              to="/login"
              className="side-menu-item"
              onClick={
                handleNormalNavigation
              }
            >

              <span className="side-menu-icon">
                🔐
              </span>

              <span className="side-menu-text">

                <strong>
                  લોગિન
                </strong>

                <small>
                  Login to your account
                </small>

              </span>

              <span className="side-menu-arrow">
                ›
              </span>

            </Link>
          )}


          {/* =================================================
              REGISTER
          ================================================= */}

          {!user && (
            <Link
              to="/register"
              className="side-menu-item"
              onClick={
                handleNormalNavigation
              }
            >

              <span className="side-menu-icon">
                ✦
              </span>

              <span className="side-menu-text">

                <strong>
                  રજીસ્ટર
                </strong>

                <small>
                  Create new account
                </small>

              </span>

              <span className="side-menu-arrow">
                ›
              </span>

            </Link>
          )}


          {/* =================================================
              THEME
          ================================================= */}

          <button
            type="button"
            className="side-menu-theme"
            onClick={toggleTheme}
          >

            <span className="theme-left">

              <span className="theme-icon">
                {theme === "light"
                  ? "☾"
                  : "☀"}
              </span>

              <span className="side-menu-text">

                <strong>
                  {theme === "light"
                    ? "Dark Theme"
                    : "Light Theme"}
                </strong>

                <small>
                  Change appearance
                </small>

              </span>

            </span>

            <span className="theme-switch">

              <span
                className={
                  theme === "dark"
                    ? "theme-switch-dot dark"
                    : "theme-switch-dot"
                }
              />

            </span>

          </button>


          {/* =================================================
              LOGOUT
          ================================================= */}

          {user && (
            <button
              type="button"
              className="side-menu-logout"
              onClick={handleLogout}
            >

              <span className="logout-icon">
                ↪
              </span>

              <span>
                Logout
              </span>

            </button>
          )}

        </div>


        {/* =================================================
            MENU FOOTER
        ================================================= */}

        <div className="side-menu-footer">

          <span>
            🕉️
          </span>

          <p>
            ॥ श्रीमद्भगवद्गीता ॥
          </p>

        </div>

      </aside>
    </>
  );
}

export default Navbar;