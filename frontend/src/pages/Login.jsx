import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, LogIn, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, login } = useAuth();

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
        return `અધ્યાય ${chapter} ના શ્લોક ${shlok} વાંચવા માટે Login કરવું જરૂરી છે.`;
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
        "કૃપા કરીને Email ID નાખો."
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
        "કૃપા કરીને યોગ્ય Email ID નાખો."
      );

      setMessageType("error");

      return;
    }

    // ---------------------------------------------------
    // PASSWORD VALIDATION
    // ---------------------------------------------------

    if (!formData.password) {
      setMessage(
        "કૃપા કરીને Password નાખો."
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
          "Login સફળ થયું"
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
  sessionStorage.removeItem("authRedirect");
  localStorage.removeItem("pendingChapter");
  localStorage.removeItem("pendingShloka");

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
            "Email અથવા Password ખોટો છે."
        );

        setMessageType("error");
      }
    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      setMessage(
        "Server સાથે connection થઈ શક્યું નથી."
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
            લોગિન કરો
          </h1>

          <p>
            તમારા Bhagavad Gita
            accountમાં પ્રવેશ કરો
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
              placeholder="તમારું Email ID"
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
    placeholder="તમારો Password"
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
        ? "Password hide કરો"
        : "Password show કરો"
    }
    title={
      showPassword
        ? "Password hide કરો"
        : "Password show કરો"
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
              Password ભૂલી ગયા?
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
                Login થઈ રહ્યું છે...
              </>
            ) : (
              <>
                <LogIn className="btn-icon" size={18} />
                Login કરો
              </>
            )}
          </button>

        </form>


        {/* =================================================
            REGISTER LINK
        ================================================= */}

        <div className="auth-register">

          <span>
            હજુ સુધી account
            બનાવ્યું નથી?
          </span>

          <Link to="/register">
            Register કરો
          </Link>

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