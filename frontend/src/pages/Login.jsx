import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, LogIn, Loader2, CheckCircle, AlertCircle, Sparkles, ChevronRight } from "lucide-react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, login } = useAuth();
  const { isHindi, isEnglish, isGujarati, txt } = useLanguage();

  const handleSkip = () => {
    sessionStorage.setItem("gita_login_prompt_skipped_session", "true");
    sessionStorage.removeItem("authRedirect");
    localStorage.removeItem("pendingChapter");
    localStorage.removeItem("pendingShloka");

    // Signal next step in startup sequence (Rating popup)
    try {
      window.dispatchEvent(new CustomEvent("gita-login-prompt-done"));
    } catch (e) {}

    navigate("/", { replace: true });
  };

  // If user is already logged in, redirect away from /login
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // =====================================================
  // MESSAGE
  // =====================================================

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] =
    useState("");

  // =====================================================
  // LOGIN REQUIRED NOTICE BANNER
  // =====================================================

  const [authNotice] = useState(() => {
    // If state is explicitly null (e.g. user clicked Login from Navbar), NEVER show banner!
    if (location.state === null) {
      return "";
    }

    // 1. From navigation state (e.g. from ProtectedRoute or Navbar protected click)
    if (location.state?.message) {
      return location.state.message;
    }

    // 2. Check sessionStorage if location.state was undefined (e.g. page refresh)
    if (location.state === undefined) {
      try {
        const saved = sessionStorage.getItem("authRedirect");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.message) return parsed.message;
        }
      } catch (e) {}

      // Fallback for pending chapter
      const chapter = localStorage.getItem("pendingChapter");
      const shlok = localStorage.getItem("pendingShloka");
      if (chapter && shlok) {
        return txt(
          `અધ્યાય ${chapter} ના શ્લોક ${shlok} વાંચવા માટે Login કરવું જરૂરી છે.`,
          `अध्याय ${chapter} के श्लोक ${shlok} पढ़ने के लिए Login करना आवश्यक है।`,
          `Login is required to read Chapter ${chapter}, Verse ${shlok}.`
        );
      }
    }

    return "";
  });

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // PASSWORD VISIBILITY
  // =====================================================

  const [showPassword, setShowPassword] =
    useState(false);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---------------------------------------------------
    // EMAIL VALIDATION
    // ---------------------------------------------------

    if (!formData.email.trim()) {
      setMessage(
        txt("કૃપા કરીને Email ID નાખો.", "कृपया Email ID दर्ज करें।", "Please enter your Email ID.")
      );

      setMessageType("error");

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      setMessage(
        txt("કૃપા કરીને યોગ્ય Email ID નાખો.", "कृपया मान्य Email ID दर्ज करें।", "Please enter a valid Email ID.")
      );

      setMessageType("error");

      return;
    }

    // ---------------------------------------------------
    // PASSWORD VALIDATION
    // ---------------------------------------------------

    if (!formData.password) {
      setMessage(
        txt("કૃપા કરીને Password નાખો.", "कृपया Password दर्ज करें।", "Please enter your Password.")
      );

      setMessageType("error");

      return;
    }

    // ===================================================
    // API LOGIN
    // ===================================================

    try {
      setLoading(true);

      setMessage("");
      setMessageType("");

      const response = await fetch(
        "https://bhagavad-gita-website.onrender.com/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              formData.email.trim(),

            password:
              formData.password,
          }),
        }
      );

      const data =
        await response.json();

      // =================================================
      // SUCCESS
      // =================================================

      if (response.ok) {
        // AuthContext login()
        // user + token update કરશે

        login(
          data.user,
          data.token
        );

        setMessage(
          txt("Login સફળ થયું", "Login सफल हुआ", "Login successful")
        );

        setMessageType("success");

        // -----------------------------------------------
        // GO TO HOME
        // -----------------------------------------------

setTimeout(() => {
  let destination = "";

  // 1. From location.state
  if (location.state?.from) {
    destination = location.state.from;
  }

  // 2. From sessionStorage
  if (!destination) {
    try {
      const saved = sessionStorage.getItem("authRedirect");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.from) {
          destination = parsed.from;
        }
      }
    } catch (e) {}
  }

  // 3. From pendingChapter / pendingShloka
  if (!destination) {
    const pendingChapter =
      localStorage.getItem("pendingChapter");
    const pendingShloka =
      localStorage.getItem("pendingShloka");

    if (pendingChapter && pendingShloka) {
      destination = `/chapter/${pendingChapter}?shloka=${pendingShloka}`;
    }
  }

  // Clean up all pending storage artifacts
  sessionStorage.setItem("gita_login_prompt_skipped_session", "true");
  sessionStorage.removeItem("authRedirect");
  localStorage.removeItem("pendingChapter");
  localStorage.removeItem("pendingShloka");

  // Signal that login is done so rating popup can trigger if eligible
  try {
    window.dispatchEvent(new CustomEvent("gita-login-prompt-done"));
  } catch (e) {}

  if (destination) {
    navigate(destination, { replace: true });
  } else {
    navigate("/", { replace: true });
  }
}, 1000);

      }

      // =================================================
      // ERROR
      // =================================================

  else {
        setMessage(
          data.message ||
            txt("Email અથવા Password ખોટો છે.", "Email या Password गलत है।", "Invalid Email or Password.")
        );

        setMessageType("error");
      }
    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      setMessage(
        txt("Server સાથે connection થઈ શક્યું નથી.", "Server से connection नहीं हो सका।", "Could not connect to the server.")
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="auth-page">

      <div className="auth-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="auth-header">

          <div className="auth-om">
            ॐ
          </div>

          <div className="auth-lotus">
            <Sparkles size={32} color="#f59e0b" />
          </div>

          <h1>
            {txt("લોગિન કરો", "लॉगिन करें", "Login")}
          </h1>

          <p>
            {txt("તમારા Bhagavad Gita accountમાં પ્રવેશ કરો", "अपने Bhagavad Gita खाते में प्रवेश करें", "Sign in to your Bhagavad Gita account")}
          </p>

        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {authNotice && (
          <div className="auth-message info">
            <Lock size={16} className="btn-icon" /> {authNotice}
          </div>
        )}
        
        
        {message && (
          <div
            className={
              messageType === "success"
                ? "auth-message success"
                : "auth-message error"
            }
          >
            {messageType === "success" ? (
              <CheckCircle size={18} className="btn-icon" />
            ) : (
              <AlertCircle size={18} className="btn-icon" />
            )}
            {message}
          </div>
        )}


        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="auth-field">

            <label htmlFor="email">

              <span className="auth-field-icon">
                <Mail size={16} />
              </span>

              <span>
                Email ID
              </span>

            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder={txt("તમારું Email ID", "आपका Email ID", "Your Email ID")}
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

          </div>


          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="auth-field">

            <label htmlFor="password">

              <span className="auth-field-icon">
                <Lock size={16} />
              </span>

              <span>
                Password
              </span>

            </label>

<div className="password-input-container">

  <input
    id="password"
    type={
      showPassword
        ? "text"
        : "password"
    }
    name="password"
    placeholder={txt("તમારો Password", "आपका Password", "Your Password")}
    value={formData.password}
    onChange={handleChange}
    autoComplete="current-password"
  />

  <button
    type="button"
    className="password-toggle-button"
    onClick={() =>
      setShowPassword(
        (previous) => !previous
      )
    }
    aria-label={
      showPassword
        ? txt("Password hide કરો", "Password छिपाएं", "Hide password")
        : txt("Password show કરો", "Password दिखाएं", "Show password")
    }
    title={
      showPassword
        ? txt("Password hide કરો", "Password छिपाएं", "Hide password")
        : txt("Password show કરો", "Password दिखाएं", "Show password")
    }
  >
    {showPassword ? (
      <EyeOff
        size={20}
        strokeWidth={2}
      />
    ) : (
      <Eye
        size={20}
        strokeWidth={2}
      />
    )}
  </button>

</div>

          </div>


          {/* =================================================
              FORGOT PASSWORD
          ================================================= */}

          <div className="forgot-password-link">

            <Link to="/forgot-password">
              {txt("Password ભૂલી ગયા?", "Password भूल गए?", "Forgot Password?")}
            </Link>

          </div>


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spinner btn-icon" size={18} />
                {txt("Login થઈ રહ્યું છે...", "Login हो रहा है...", "Logging in...")}
              </>
            ) : (
              <>
                <LogIn className="btn-icon" size={18} />
                {txt("Login કરો", "Login करें", "Login")}
              </>
            )}
          </button>

        </form>


        {/* =================================================
            REGISTER LINK
        ================================================= */}

        <div className="auth-register">

          <span>
            {txt("હજુ સુધી account બનાવ્યું નથી?", "अभी तक account नहीं बनाया?", "Don't have an account yet?")}
          </span>

          <Link to="/register">
            {txt("Register કરો", "Register करें", "Register")}
          </Link>

        </div>


        {/* =================================================
            SKIP FOR NOW ACTION
        ================================================= */}

        <div className="auth-skip-action">
          <button
            type="button"
            className="auth-skip-btn"
            onClick={handleSkip}
          >
            <span>{txt("પછીથી લૉગિન કરો (Skip)", "बाद में लॉगिन करें (Skip)", "Skip for now")}</span>
            <ChevronRight size={16} />
          </button>
        </div>


        {/* =================================================
            BOTTOM OM
        ================================================= */}

        <div className="auth-bottom">

          <span></span>

          <b>
            ॐ
          </b>

          <span></span>

        </div>

      </div>

    </main>
  );
}

export default Login;