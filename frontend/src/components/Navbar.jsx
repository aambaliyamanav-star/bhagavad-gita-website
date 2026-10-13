import { useEffect, useState, useRef } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  Flower2,
  Home,
  BookOpen,
  Heart,
  Brain,
  Clock,
  CircleUser,
  ShieldCheck,
  LogIn,
  UserPlus,
  LogOut,
  Moon,
  Sun,
  X,
  Menu,
  Compass,
  Star,
  Info,
  Download,
  Bell,
  Globe,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import {
  promptInstallApp,
  isRunningInStandaloneApp,
  onInstallPromptChange,
} from "../utils/pwaManager.js";
import {
  isAppNotificationEnabled,
  unsubscribeAppNotifications,
  enableAppNotifications,
} from "../utils/appPushNotification.js";
import { trackAppInstallOrOpen } from "../utils/appAnalytics.js";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // LANGUAGE CONTEXT
  // =====================================================

  const { language, toggleLanguage, isHindi } = useLanguage();

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
  // SCROLL STATE
  // =====================================================

  const [scrolled, setScrolled] = useState(false);

  // =====================================================
  // PWA APP RUNTIME STATE (SHOW INSTALL IN BROWSER, NOTIF IN APP)
  // =====================================================

  const [isStandaloneApp, setIsStandaloneApp] = useState(() => isRunningInStandaloneApp());

  useEffect(() => {
    setIsStandaloneApp(isRunningInStandaloneApp());
    const unsubscribe = onInstallPromptChange((canInstall, isStandalone) => {
      setIsStandaloneApp(isStandalone);
    });
    return () => unsubscribe();
  }, []);

  // =====================================================
  // APP NOTIFICATIONS STATE (INSIDE INSTALLED APP)
  // =====================================================

  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (isStandaloneApp) {
      setNotifEnabled(isAppNotificationEnabled());
    }
    const handleNotifStatus = (e) => {
      setNotifEnabled(Boolean(e.detail?.enabled));
    };
    window.addEventListener("app-notification-status-changed", handleNotifStatus);
    return () => {
      window.removeEventListener("app-notification-status-changed", handleNotifStatus);
    };
  }, [isStandaloneApp]);

  const handleToggleNotification = async () => {
    if (notifLoading) return;
    setNotifLoading(true);
    try {
      if (notifEnabled) {
        await unsubscribeAppNotifications();
        setNotifEnabled(false);
        trackAppInstallOrOpen(false);
      } else {
        const res = await enableAppNotifications(user);
        if (res.success) {
          setNotifEnabled(true);
          trackAppInstallOrOpen(false);
        }
      }
    } finally {
      setNotifLoading(false);
    }
  };

  // =====================================================
  // NAVIGATION HISTORY (ATOMIC STATE & REF)
  // =====================================================

  const [navHistory, setNavHistory] = useState(() => ({
    stack: [location.pathname + location.search],
    index: 0,
  }));

  const isNavigatingRef = useRef(false);

  // Helper to check if a route requires login
  const isProtectedPath = (path) => {
    const cleanPath = path.split("?")[0];
    const protectedPrefixes = [
      "/quiz",
      "/quiz-category",
      "/favorites",
      "/history",
      "/profile",
      "/admin",
      "/guidance",
      "/jivan-margdarshan",
      "/reading-tracker",
    ];
    if (
      protectedPrefixes.some(
        (prefix) => cleanPath === prefix || cleanPath.startsWith(prefix + "/")
      )
    ) {
      return true;
    }

    // Check if chapter shloka > 5
    if (cleanPath.startsWith("/chapter/")) {
      const queryPart = path.includes("?") ? path.split("?")[1] : "";
      const params = new URLSearchParams(queryPart);
      const shlokaNum = Number(params.get("shloka"));
      if (shlokaNum > 5) {
        return true;
      }
    }

    return false;
  };

  // =====================================================
  // CURRENT PAGE NAME
  // =====================================================

  const getPageTitle = () => {
    const path = location.pathname;

    // HOME
    if (path === "/") {
      return isHindi ? "होम" : "હોમ";
    }

    // ABOUT US
    if (path === "/about" || path === "/about-us") {
      return isHindi ? "हमारे बारे में" : "અમારા વિશે";
    }

    // CHAPTERS
    if (path === "/chapters") {
      return isHindi ? "18 अध्याय" : "18 અધ્યાય";
    }

    // LIFE GUIDANCE
    if (path === "/guidance" || path === "/jivan-margdarshan") {
      return isHindi ? "जीवन मार्गदर्शन" : "જીવન માર્ગદર્શન";
    }

    // READING TRACKER
    if (path === "/reading-tracker") {
      return isHindi ? "पठन प्रगति" : "વાંચન પ્રગતિ";
    }

    // CHAPTER READER
    if (path.startsWith("/chapter/")) {
      const chapterNumber =
        path.split("/")[2];

      if (chapterNumber) {
        return isHindi ? `अध्याय ${chapterNumber}` : `અધ્યાય ${chapterNumber}`;
      }

      return isHindi ? "अध्याय" : "અધ્યાય";
    }

    // FAVORITES
    if (path === "/favorites") {
      return isHindi ? "पसंदीदा श्लोक" : "મનપસંદ શ્લોક";
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
      return isHindi ? "इतिहास" : "History";
    }

    // PROFILE
    if (path === "/profile") {
      return isHindi ? "प्रोफ़ाइल" : "Profile";
    }

    // LOGIN
    if (path === "/login") {
      return isHindi ? "लॉगिन" : "લોગિન";
    }

    // REGISTER
    if (path === "/register") {
      return isHindi ? "रजिस्टर" : "રજીસ્ટર";
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

    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }

    setNavHistory((previous) => {
      const currentInStack =
        previous.stack[previous.index];

      // Same page - do not push duplicate
      if (currentInStack === currentPath) {
        return previous;
      }

      const prevPath =
        previous.stack[previous.index]?.split("?")[0];

      // If user just logged in (previous was /login or /register and now user exists),
      // replace the /login entry so it does not linger in history
      if (user && (prevPath === "/login" || prevPath === "/register")) {
        const newStack = previous.stack.slice(0, previous.index);
        newStack.push(currentPath);
        return {
          stack: newStack,
          index: newStack.length - 1,
        };
      }

      // Back પછી નવી page ખોલે તો Forward history remove થશે
      const newStack = previous.stack.slice(
        0,
        previous.index + 1
      );

      newStack.push(currentPath);

      return {
        stack: newStack,
        index: newStack.length - 1,
      };
    });
  }, [
    location.pathname,
    location.search,
    user,
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
  // SCROLL LISTENER — shrink navbar on scroll
  // =====================================================

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        window.scrollY ||
        0;
      setScrolled(scrollPos > 15);
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );
    document.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    // Check on mount too
    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
      document.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    // 1. If currently on /login or /register, always return to the last accessible page
    if (location.pathname === "/login" || location.pathname === "/register") {
      let targetIndex = -1;
      for (let i = navHistory.index - 1; i >= 0; i--) {
        const path = navHistory.stack[i];
        const cleanPath = path.split("?")[0];
        // Skip login/register and skip protected routes if user is not logged in
        if (
          cleanPath !== "/login" &&
          cleanPath !== "/register" &&
          (!isProtectedPath(cleanPath) || user)
        ) {
          targetIndex = i;
          break;
        }
      }

      if (targetIndex >= 0) {
        const targetPath = navHistory.stack[targetIndex];
        isNavigatingRef.current = true;
        setNavHistory((prev) => ({
          ...prev,
          index: targetIndex,
        }));
        navigate(targetPath);
        return;
      }

      // Fallback if no accessible page in stack
      navigate("/");
      return;
    }

    // 2. Normal back navigation
    if (navHistory.index <= 0) {
      return;
    }

    let targetIndex = navHistory.index - 1;
    while (targetIndex >= 0) {
      const cleanPath = navHistory.stack[targetIndex].split("?")[0];
      // If user is logged in, NEVER go back to /login or /register!
      if (user && (cleanPath === "/login" || cleanPath === "/register")) {
        targetIndex--;
        continue;
      }
      // If user is logged out, skip protected routes and login
      if (!user && (isProtectedPath(cleanPath) || cleanPath === "/login")) {
        targetIndex--;
        continue;
      }
      break;
    }

    if (targetIndex >= 0) {
      const targetPath = navHistory.stack[targetIndex];
      isNavigatingRef.current = true;
      setNavHistory((prev) => ({
        ...prev,
        index: targetIndex,
      }));
      navigate(targetPath);
    } else {
      navigate("/");
    }
  };

  // =====================================================
  // FORWARD
  // =====================================================

  const handleForward = () => {
    if (
      navHistory.index >=
      navHistory.stack.length - 1
    ) {
      return;
    }

    const newIndex =
      navHistory.index + 1;
    const targetPath =
      navHistory.stack[newIndex];

    isNavigatingRef.current = true;
    setNavHistory((prev) => ({
      ...prev,
      index: newIndex,
    }));

    navigate(targetPath);
  };

  // =====================================================
  // BUTTON STATUS
  // =====================================================

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // On Login/Register page, always enable back button so user is never stuck
  const canGoBack =
    isAuthPage || navHistory.index > 0;

  const canGoForward =
    !isAuthPage &&
    navHistory.index <
      navHistory.stack.length - 1;

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmed =
      window.confirm(
        isHindi
          ? "क्या आप वाकई Logout करना चाहते हैं?"
          : "શું તમે ખરેખર Logout કરવા માંગો છો?"
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
    isNavigatingRef.current = false;
    setMenuOpen(false);
  };

  // =====================================================
  // GUIDANCE NAVIGATION
  // =====================================================

  const handleGuidanceNavigation = () => {
    isNavigatingRef.current = false;
    setMenuOpen(false);
    handleProtectedNavigation(
      "/guidance",
      isHindi
        ? "जीवन मार्गदर्शन पाने के लिए Login करना आवश्यक है।"
        : "જીવન માર્ગદર્શન મેળવવા માટે Login કરવું જરૂરી છે."
    );
  };

  // =====================================================
  // PROTECTED NAVIGATION (FOR LOGGED IN & LOGGED OUT)
  // =====================================================

  const handleProtectedNavigation = (targetPath, requiredMessage) => {
    isNavigatingRef.current = false;
    setMenuOpen(false);

    if (user) {
      navigate(targetPath);
    } else {
      sessionStorage.setItem(
        "authRedirect",
        JSON.stringify({
          from: targetPath,
          message: requiredMessage,
        })
      );

      navigate("/login", {
        state: {
          from: targetPath,
          message: requiredMessage,
        },
      });
    }
  };

  // =====================================================
  // DIRECT LOGIN (FROM NAVBAR - NO MESSAGE)
  // =====================================================

  const handleDirectLogin = () => {
    isNavigatingRef.current = false;
    setMenuOpen(false);

    // Clear any pending redirect or messages
    sessionStorage.removeItem("authRedirect");
    localStorage.removeItem("pendingChapter");
    localStorage.removeItem("pendingShloka");

    navigate("/login", {
      state: null,
    });
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

      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>

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
            title={isHindi ? "पीछे जाएं" : "પાછળ જાઓ"}
            aria-label={isHindi ? "पीछे जाएं" : "પાછળ જાઓ"}
          >
            <ChevronLeft
              size={18}
              strokeWidth={2.2}
            />
          </button>

          {/* FORWARD */}

          <button
            type="button"
            className="history-btn forward-btn"
            onClick={handleForward}
            disabled={!canGoForward}
            title={isHindi ? "आगे जाएं" : "આગળ જાઓ"}
            aria-label={isHindi ? "आगे जाएं" : "આગળ જાઓ"}
          >
            <ChevronRight
              size={18}
              strokeWidth={2.2}
            />
          </button>

        </div>


        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/chapters"
          className="logo"
          onClick={handleNormalNavigation}
          title={isHindi ? "18 अध्याय" : "18 અધ્યાય"}
          aria-label={isHindi ? "18 अध्याय" : "18 અધ્યાય"}
        >
          <Flower2
            size={26}
            strokeWidth={1.8}
            className="logo-icon"
          />
          {isHindi ? "भगवद् गीता" : "ભગવદ્ ગીતા"}
        </Link>


        {/* =================================================
            RIGHT SIDE
            PAGE NAME + HAMBURGER
        ================================================= */}

        <div className="navbar-right">

          {/* LANGUAGE TOGGLE BUTTON */}
          <button
            type="button"
            className="nav-lang-toggle-btn"
            onClick={toggleLanguage}
            title={isHindi ? "ગુજરાતી ભાષા પસંદ કરો" : "हिन्दी भाषा चुनें"}
            aria-label="ભાષા બદલો / भाषा बदलें"
          >
            <Globe size={15} className="nav-lang-icon" />
            <span className="nav-lang-text">{isHindi ? "हिन्दी" : "ગુજરાતી"}</span>
          </button>

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
                ? (isHindi ? "मेनू बंद करें" : "મેનુ બંધ કરો")
                : (isHindi ? "मेनू खोलें" : "મેનુ ખોલો")
            }
            aria-expanded={menuOpen}
            title={
              menuOpen
                ? (isHindi ? "मेनू बंद करें" : "મેનુ બંધ કરો")
                : (isHindi ? "मेनू खोलें" : "મેનુ ખોલો")
            }
          >
            {menuOpen
              ? <X size={20} strokeWidth={2.2} />
              : <Menu size={20} strokeWidth={2.2} />
            }
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
              <Flower2
                size={26}
                strokeWidth={1.6}
              />
            </div>

            <div>

              <h2>
                {isHindi ? "भगवद् गीता" : "ભગવદ્ ગીતા"}
              </h2>

              <span>
                {user
                  ? `${user.name} • ${
                      user.role === "admin"
                        ? (isHindi ? "प्रशासक (Admin)" : "Administrator")
                        : (isHindi ? "लॉग-इन सदस्य" : "Logged in user")
                    }`
                  : (isHindi ? "नेविगेशन मेनू" : "Navigation Menu")}
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
            aria-label={isHindi ? "मेनू बंद करें" : "મેનુ બંધ કરો"}
            title={isHindi ? "बंद करें" : "બંધ કરો"}
          >
            <X size={20} strokeWidth={2.2} />
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
              <Home size={20} strokeWidth={1.8} />
            </span>

            <span className="side-menu-text">
              <strong>
                {isHindi ? "होम" : "હોમ"}
              </strong>
            </span>

            <span className="side-menu-arrow">
              <ChevronRight size={18} strokeWidth={2} />
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
              <BookOpen size={20} strokeWidth={1.8} />
            </span>

            <span className="side-menu-text">
              <strong>
                {isHindi ? "18 अध्याय" : "18 અધ્યાય"}
              </strong>
            </span>

            <span className="side-menu-arrow">
              <ChevronRight size={18} strokeWidth={2} />
            </span>

          </Link>


          {/* =================================================
              LIFE GUIDANCE
          ================================================= */}

          <button
            type="button"
            className="side-menu-item side-menu-button"
            onClick={handleGuidanceNavigation}
          >
            <span className="side-menu-icon">
              <Compass size={20} strokeWidth={1.8} />
            </span>

            <span className="side-menu-text">
              <strong>
                {isHindi ? "जीवन मार्गदर्शन" : "જીવન માર્ગદર્શન"}
              </strong>
            </span>

            <span className="side-menu-arrow">
              <ChevronRight size={18} strokeWidth={2} />
            </span>
          </button>



          {/* =================================================
              FAVOURITES
          ================================================= */}

          <button
            type="button"
            className="side-menu-item side-menu-button"
            onClick={() =>
              handleProtectedNavigation(
                "/favorites",
                isHindi
                  ? "पसंदीदा श्लोक देखने के लिए Login करना आवश्यक है।"
                  : "મનપસંદ શ્લોક જોવા માટે Login કરવું જરૂરી છે."
              )
            }
          >
            <span className="side-menu-icon">
              <Heart size={20} strokeWidth={1.8} />
            </span>

            <span className="side-menu-text">
              <strong>
                {isHindi ? "पसंदीदा श्लोक" : "મનપસંદ શ્લોક"}
              </strong>
            </span>

            <span className="side-menu-arrow">
              <ChevronRight size={18} strokeWidth={2} />
            </span>
          </button>


          {/* =================================================
              QUIZ
          ================================================= */}

          <button
            type="button"
            className="side-menu-item side-menu-button"
            onClick={() =>
              handleProtectedNavigation(
                "/quiz-category",
                isHindi
                  ? "Quiz खेलने के लिए Login करना आवश्यक है।"
                  : "Quiz રમવા માટે Login કરવું જરૂરી છે."
              )
            }
          >
            <span className="side-menu-icon">
              <Brain size={20} strokeWidth={1.8} />
            </span>

            <span className="side-menu-text">
              <strong>
                {isHindi ? "क्विज़ (Quiz)" : "Quiz"}
              </strong>
            </span>

            <span className="side-menu-arrow">
              <ChevronRight size={18} strokeWidth={2} />
            </span>
          </button>


          {/* =================================================
              HISTORY
          ================================================= */}

          <button
            type="button"
            className="side-menu-item side-menu-button"
            onClick={() =>
              handleProtectedNavigation(
                "/history",
                isHindi
                  ? "अपनी History देखने के लिए Login करना आवश्यक है।"
                  : "તમારી History જોવા માટે Login કરવું જરૂરી છે."
              )
            }
          >
            <span className="side-menu-icon">
              <Clock size={20} strokeWidth={1.8} />
            </span>

            <span className="side-menu-text">
              <strong>
                {isHindi ? "इतिहास (History)" : "History"}
              </strong>
            </span>

            <span className="side-menu-arrow">
              <ChevronRight size={18} strokeWidth={2} />
            </span>
          </button>


          {/* =================================================
              PROFILE
          ================================================= */}

          <button
            type="button"
            className="side-menu-item side-menu-button"
            onClick={() =>
              handleProtectedNavigation(
                "/profile",
                isHindi
                  ? "अपनी Profile देखने के लिए Login करना आवश्यक है।"
                  : "તમારી Profile જોવા માટે Login કરવું જરૂરી છે."
              )
            }
          >
            <span className="side-menu-icon">
              <CircleUser size={20} strokeWidth={1.8} />
            </span>

            <span className="side-menu-text">
              <strong>
                {isHindi ? "प्रोफ़ाइल (Profile)" : "Profile"}
              </strong>
            </span>

            <span className="side-menu-arrow">
              <ChevronRight size={18} strokeWidth={2} />
            </span>
          </button>


          {/* =================================================
              FEEDBACK & RATING
          ================================================= */}

          <button
            type="button"
            className="side-menu-item side-menu-button"
            onClick={() => {
              setMenuOpen(false);
              window.dispatchEvent(new CustomEvent("open-feedback-modal"));
            }}
          >
            <span className="side-menu-icon" style={{ color: "#f59e0b" }}>
              <Star size={20} strokeWidth={1.8} fill="#f59e0b" />
            </span>

            <span className="side-menu-text">
              <strong>
                {isHindi ? "प्रतिक्रिया और रेटिंग" : "પ્રતિસાદ અને રેટિંગ"}
              </strong>
            </span>

            <span className="side-menu-arrow">
              <ChevronRight size={18} strokeWidth={2} />
            </span>
          </button>


          {/* =================================================
              ABOUT US (અમારા વિશે)
          ================================================= */}

          <Link
            to="/about"
            className="side-menu-item"
            onClick={handleNormalNavigation}
          >
            <span className="side-menu-icon" style={{ color: "#0284c7" }}>
              <Info size={20} strokeWidth={1.8} />
            </span>

            <span className="side-menu-text">
              <strong>
                {isHindi ? "हमारे बारे में (About Us)" : "અમારા વિશે (About Us)"}
              </strong>
            </span>

            <span className="side-menu-arrow">
              <ChevronRight size={18} strokeWidth={2} />
            </span>
          </Link>


          {/* =================================================
              INSTALL APP (PWA) - Show in any browser outside standalone app
          ================================================= */}

          {!isStandaloneApp && (
            <button
              type="button"
              className="side-menu-item side-menu-button install-app-menu-btn"
              onClick={async () => {
                setMenuOpen(false);
                const res = await promptInstallApp();
                if (res.alreadyInstalled) {
                  alert(res.message);
                  return;
                }
                if (!res.success) {
                  // If not native prompt or iOS, open the install banner/guide modal
                  window.dispatchEvent(new CustomEvent("open-pwa-install-banner"));
                }
              }}
            >
              <span className="side-menu-icon" style={{ color: "#10b981" }}>
                <Download size={20} strokeWidth={1.8} />
              </span>

              <span className="side-menu-text">
                <strong>
                  {isHindi ? "ऐप इंस्टॉल करें (Install App)" : "એપ ઇન્સ્ટોલ કરો (Install App)"}
                </strong>
              </span>

              <span className="side-menu-arrow">
                <ChevronRight size={18} strokeWidth={2} />
              </span>
            </button>
          )}

          {/* =================================================
              NOTIFICATION TOGGLE (Inside App Only)
          ================================================= */}

          {isStandaloneApp && (
            <button
              type="button"
              className="side-menu-theme side-menu-notif-btn"
              onClick={handleToggleNotification}
              disabled={notifLoading}
              aria-label="Toggle App Notifications"
            >
              <span className="theme-left">
                <span
                  className="theme-icon"
                  style={{
                    background: notifEnabled
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(148, 163, 184, 0.15)",
                    color: notifEnabled ? "#10b981" : "#64748b",
                  }}
                >
                  <Bell size={18} strokeWidth={1.8} />
                </span>

                <span className="side-menu-text">
                  <strong>
                    {notifEnabled
                      ? (isHindi ? "सूचना (चालू)" : "નોટિફિકેશન (ચાલુ)")
                      : (isHindi ? "सूचना (बंद)" : "નોટિફિકેશન (બંધ)")}
                  </strong>
                </span>
              </span>

              <span className={`theme-switch ${notifEnabled ? "active-notif" : ""}`}>
                <span
                  className={`theme-switch-dot ${notifEnabled ? "active-notif" : ""}`}
                />
              </span>
            </button>
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
                <ShieldCheck size={20} strokeWidth={1.8} />
              </span>

              <span className="side-menu-text">
                <strong>
                  {isHindi ? "व्यवस्थापक (Admin)" : "Admin"}
                </strong>
              </span>

              <span className="side-menu-arrow">
                <ChevronRight size={18} strokeWidth={2} />
              </span>
            </Link>
          )}


          {/* =================================================
              LOGIN
          ================================================= */}

          {!user && (
            <button
              type="button"
              className="side-menu-item side-menu-button"
              onClick={handleDirectLogin}
            >
              <span className="side-menu-icon">
                <LogIn size={20} strokeWidth={1.8} />
              </span>

              <span className="side-menu-text">
                <strong>
                  {isHindi ? "लॉगिन" : "લોગિન"}
                </strong>
              </span>

              <span className="side-menu-arrow">
                <ChevronRight size={18} strokeWidth={2} />
              </span>
            </button>
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
                <UserPlus size={20} strokeWidth={1.8} />
              </span>

              <span className="side-menu-text">
                <strong>
                  {isHindi ? "रजिस्टर" : "રજીસ્ટર"}
                </strong>
              </span>

              <span className="side-menu-arrow">
                <ChevronRight size={18} strokeWidth={2} />
              </span>

            </Link>
          )}


          {/* =================================================
              LANGUAGE SWITCH
          ================================================= */}

          <button
            type="button"
            className="side-menu-theme side-menu-lang"
            onClick={toggleLanguage}
            title={isHindi ? "भाषा बदलें / ભાષા બદલો" : "ભાષા બદલો / भाषा बदलें"}
          >
            <span className="theme-left">
              <span className="theme-icon">
                <Globe size={20} strokeWidth={1.8} />
              </span>

              <span className="side-menu-text">
                <strong>
                  {isHindi ? "भाषा: हिन्दी (Hindi)" : "ભાષા: ગુજરાતી (Gujarati)"}
                </strong>
              </span>
            </span>

            <span className="side-lang-pill">
              {isHindi ? "🇬🇯 ગુજરાતી" : "🇮🇳 हिन्दी"}
            </span>
          </button>


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
                  ? <Moon size={20} strokeWidth={1.8} />
                  : <Sun size={20} strokeWidth={1.8} />}
              </span>

              <span className="side-menu-text">
                <strong>
                  {theme === "light"
                    ? (isHindi ? "डार्क थीम (Dark Theme)" : "Dark Theme")
                    : (isHindi ? "लाइट थीम (Light Theme)" : "Light Theme")}
                </strong>
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
                <LogOut size={18} strokeWidth={2} />
              </span>

              <span>
                {isHindi ? "लॉगआउट (Logout)" : "Logout"}
              </span>

            </button>
          )}

        </div>


        {/* =================================================
            MENU FOOTER
        ================================================= */}

        <div className="side-menu-footer">

          <span className="side-menu-footer-icon-wrap">
            <Flower2 size={22} strokeWidth={1.8} className="side-menu-footer-icon" />
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