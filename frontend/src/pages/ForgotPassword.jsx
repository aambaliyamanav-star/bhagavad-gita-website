import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // SEND OTP
  // =====================================================

  const handleSendOTP = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("કૃપા કરીને Email ID નાખો.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://bhagavad-gita-website.onrender.com/api/auth/forgot-password/send-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "OTP મોકલવામાં સમસ્યા આવી."
        );
      }

      setMessage(
        data.message ||
          "તમારા Email પર OTP મોકલવામાં આવ્યો છે. ✅"
      );

      setStep(2);
    } catch (err) {
      console.error(
        "❌ Send Forgot Password OTP Error:",
        err
      );

      setError(
        err.message ||
          "OTP મોકલવામાં સમસ્યા આવી."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!otp.trim()) {
      setError(
        "કૃપા કરીને 6 અંકનો OTP નાખો."
      );
      return;
    }

    if (!/^[0-9]{6}$/.test(otp.trim())) {
      setError(
        "યોગ્ય 6 અંકનો OTP નાખો."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://bhagavad-gita-website.onrender.com/api/auth/forgot-password/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email:
              email.trim().toLowerCase(),

            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "OTP verification failed."
        );
      }

      setMessage(
        data.message ||
          "OTP successfully verify થઈ ગયો છે. ✅"
      );

      setStep(3);
    } catch (err) {
      console.error(
        "❌ Verify Forgot Password OTP Error:",
        err
      );

      setError(
        err.message ||
          "OTP verificationમાં સમસ્યા આવી."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!newPassword) {
      setError(
        "કૃપા કરીને New Password નાખો."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New Password ઓછામાં ઓછો 6 charactersનો હોવો જોઈએ."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "New Password અને Confirm Password સરખા નથી."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://bhagavad-gita-website.onrender.com/api/auth/forgot-password/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email:
              email.trim().toLowerCase(),

            newPassword,

            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Password reset કરવામાં સમસ્યા આવી."
        );
      }

      setMessage(
        data.message ||
          "Password successfully reset થઈ ગયો છે. ✅"
      );

      // =================================================
      // CLEAR PASSWORD FIELDS
      // =================================================

      setNewPassword("");
      setConfirmPassword("");

      // =================================================
      // GO TO LOGIN
      // =================================================

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(
        "❌ Reset Password Error:",
        err
      );

      setError(
        err.message ||
          "Password reset કરવામાં સમસ્યા આવી."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // BACK TO LOGIN
  // =====================================================

  const handleBackToLogin = () => {
    navigate("/login");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="forgot-password-page">

      <div className="forgot-password-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="forgot-password-header">

          <div className="forgot-password-om">
            ॐ
          </div>

          <h1>
            Forgot Password
          </h1>

          <p>
            તમારો Password ફરીથી set કરો
          </p>

        </div>


        {/* =================================================
            STEP INDICATOR
        ================================================= */}

        <div className="forgot-password-steps">

          <div
            className={
              step >= 1
                ? "forgot-step active"
                : "forgot-step"
            }
          >
            <span>1</span>
            <small>Email</small>
          </div>

          <div className="forgot-step-line"></div>

          <div
            className={
              step >= 2
                ? "forgot-step active"
                : "forgot-step"
            }
          >
            <span>2</span>
            <small>OTP</small>
          </div>

          <div className="forgot-step-line"></div>

          <div
            className={
              step >= 3
                ? "forgot-step active"
                : "forgot-step"
            }
          >
            <span>3</span>
            <small>Password</small>
          </div>

        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div className="forgot-success">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="forgot-error">
            ❌ {error}
          </div>
        )}


        {/* =================================================
            STEP 1
            EMAIL
        ================================================= */}

        {step === 1 && (

          <form
            className="forgot-password-form"
            onSubmit={handleSendOTP}
          >

            <div className="forgot-form-icon">
              📧
            </div>

            <h2>
              Email Verification
            </h2>

            <p>
              તમારા registered Email ID પર
              OTP મોકલવામાં આવશે.
            </p>


            <label>
              Registered Email
            </label>

            <input
              type="email"
              placeholder="તમારું Email નાખો"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              disabled={loading}
            />


            <button
              type="submit"
              className="forgot-primary-button"
              disabled={loading}
            >
              {loading
                ? "OTP મોકલાઈ રહ્યો છે..."
                : "📨 Send OTP"}
            </button>

          </form>
        )}


        {/* =================================================
            STEP 2
            OTP
        ================================================= */}

        {step === 2 && (

          <form
            className="forgot-password-form"
            onSubmit={handleVerifyOTP}
          >

            <div className="forgot-form-icon">
              🔐
            </div>

            <h2>
              Enter OTP
            </h2>

            <p>
              <strong>
                {email}
              </strong>

              <br />

              પર મોકલવામાં આવેલ 6 અંકનો OTP
              નાખો.
            </p>


            <label>
              OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6 અંકનો OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              autoComplete="one-time-code"
              disabled={loading}
            />


            <button
              type="submit"
              className="forgot-primary-button"
              disabled={loading}
            >
              {loading
                ? "Verify થઈ રહ્યું છે..."
                : "✅ Verify OTP"}
            </button>


            <button
              type="button"
              className="forgot-secondary-button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setMessage("");
                setError("");
              }}
              disabled={loading}
            >
              ← Email ફરી નાખો
            </button>

          </form>
        )}


        {/* =================================================
            STEP 3
            RESET PASSWORD
        ================================================= */}

        {step === 3 && (

          <form
            className="forgot-password-form"
            onSubmit={handleResetPassword}
          >

            <div className="forgot-form-icon">
              🔑
            </div>

            <h2>
              Create New Password
            </h2>

            <p>
              હવે તમારા account માટે
              નવો Password બનાવો.
            </p>


            <label>
              New Password
            </label>

            <input
              type="password"
              placeholder="નવો Password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              autoComplete="new-password"
              disabled={loading}
            />


            <label>
              Confirm New Password
            </label>

            <input
              type="password"
              placeholder="Password ફરી નાખો"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              autoComplete="new-password"
              disabled={loading}
            />


            <button
              type="submit"
              className="forgot-primary-button"
              disabled={loading}
            >
              {loading
                ? "Password reset થઈ રહ્યો છે..."
                : "🔒 Reset Password"}
            </button>

          </form>
        )}


        {/* =================================================
            BACK TO LOGIN
        ================================================= */}

        <div className="forgot-login-link">

          <button
            type="button"
            onClick={handleBackToLogin}
            disabled={loading}
          >
            ← Login Page પર પાછા જાઓ
          </button>

        </div>

      </div>

    </main>
  );
}

export default ForgotPassword;