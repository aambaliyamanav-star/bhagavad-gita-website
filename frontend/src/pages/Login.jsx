import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

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
  // LOADING
  // =====================================================

  const [loading, setLoading] =
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
        "http://localhost:5000/api/auth/login",
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
          "Login સફળ થયું ✅"
        );

        setMessageType("success");

        // -----------------------------------------------
        // GO TO HOME
        // -----------------------------------------------

        setTimeout(() => {
          navigate("/");
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
            🪷
          </div>

          <h1>
            લોગિન કરો
          </h1>

          <p>
            તમારા Bhagavad Gita
            accountમાં પ્રવેશ કરો 🙏
          </p>

        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div
            className={
              messageType === "success"
                ? "auth-message success"
                : "auth-message error"
            }
          >
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
                ✉️
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
                🔒
              </span>

              <span>
                Password
              </span>

            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="તમારો Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />

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
            {loading
              ? "Login થઈ રહ્યું છે..."
              : "✓ Login કરો"}
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