
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  // =====================================================
  // STEP
  // 1 = Personal Information
  // 2 = OTP Verification
  // 3 = Password
  // =====================================================

  const [step, setStep] = useState(1);

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });

  // =====================================================
  // OTP
  // =====================================================

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // =====================================================
  // MESSAGE
  // =====================================================

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(false);

  // =====================================================
// PASSWORD VISIBILITY
// =====================================================

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] =
  useState(false);

  // =====================================================
  // BIRTH DATE REF
  // =====================================================

  const birthDateInputRef = useRef(null);

  // =====================================================
  // TODAY DATE
  // =====================================================

  const today = new Date().toISOString().split("T")[0];

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
  // OPEN CALENDAR
  // =====================================================

  const openBirthDatePicker = () => {
    if (birthDateInputRef.current) {
      if (
        typeof birthDateInputRef.current.showPicker ===
        "function"
      ) {
        birthDateInputRef.current.showPicker();
      } else {
        birthDateInputRef.current.focus();
      }
    }
  };

  // =====================================================
  // BIRTH DATE - TEXT INPUT
  // DD-MM-YYYY
  // =====================================================

  const handleBirthDateTextChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    value = value.substring(0, 8);

    if (value.length > 4) {
      value =
        value.substring(0, 2) +
        "-" +
        value.substring(2, 4) +
        "-" +
        value.substring(4);
    } else if (value.length > 2) {
      value =
        value.substring(0, 2) +
        "-" +
        value.substring(2);
    }

    setFormData((previous) => ({
      ...previous,
      birthDate: value,
    }));

    setMessage("");
    setMessageType("");
  };

  // =====================================================
  // BIRTH DATE - CALENDAR CHANGE
  // YYYY-MM-DD → DD-MM-YYYY
  // =====================================================

  const handleBirthDateChange = (e) => {
    const value = e.target.value;

    if (!value) {
      setFormData((previous) => ({
        ...previous,
        birthDate: "",
      }));

      setMessage("");
      setMessageType("");

      return;
    }

    const [year, month, day] = value.split("-");

    const formattedDate =
      `${day}-${month}-${year}`;

    setFormData((previous) => ({
      ...previous,
      birthDate: formattedDate,
    }));

    setMessage("");
    setMessageType("");
  };

  // =====================================================
  // CONVERT DD-MM-YYYY
  // TO YYYY-MM-DD
  // =====================================================

  const convertBirthDateForServer = (date) => {
    if (!date) {
      return "";
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
      return "";
    }

    const [day, month, year] = parts;

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // VALIDATE PERSONAL INFORMATION
  // =====================================================

  const validatePersonalInformation = () => {
    const {
      name,
      mobile,
      email,
      birthDate,
    } = formData;

    // NAME
    if (!name.trim()) {
      setMessage(
        "કૃપા કરીને તમારું નામ લખો."
      );

      setMessageType("error");

      return false;
    }

    // MOBILE
    if (!/^[0-9]{10}$/.test(mobile)) {
      setMessage(
        "કૃપા કરીને 10 અંકનો યોગ્ય Mobile Number નાખો."
      );

      setMessageType("error");

      return false;
    }

    // EMAIL
    if (!email.trim()) {
      setMessage(
        "કૃપા કરીને Email ID નાખો."
      );

      setMessageType("error");

      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      setMessage(
        "કૃપા કરીને યોગ્ય Email ID નાખો."
      );

      setMessageType("error");

      return false;
    }

    // BIRTH DATE
    if (
      !/^\d{2}-\d{2}-\d{4}$/.test(
        birthDate
      )
    ) {
      setMessage(
        "Birth Date DD-MM-YYYY formatમાં નાખો."
      );

      setMessageType("error");

      return false;
    }

    // CHECK VALID DATE
    const [day, month, year] =
      birthDate.split("-").map(Number);

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      setMessage(
        "કૃપા કરીને યોગ્ય Birth Date નાખો."
      );

      setMessageType("error");

      return false;
    }

    // FUTURE DATE CHECK
    const selectedDate = new Date(
      year,
      month - 1,
      day
    );

    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);

    if (selectedDate > currentDate) {
      setMessage(
        "Birth Date futureની હોઈ શકતી નથી."
      );

      setMessageType("error");

      return false;
    }

    return true;
  };

  // =====================================================
  // SEND OTP
  // =====================================================

  const sendOTP = async () => {
    if (!validatePersonalInformation()) {
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        "https://bhagavad-gita-website.onrender.com/api/auth/send-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: formData.name.trim(),

            mobile: formData.mobile.trim(),

            email: formData.email
              .trim()
              .toLowerCase(),

            birthDate:
              convertBirthDateForServer(
                formData.birthDate
              ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "OTP મોકલી શકાયો નથી."
        );
      }

      setOtpSent(true);

      setStep(2);

      setMessage(
        "તમારા Email પર OTP મોકલવામાં આવ્યો છે."
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "Send OTP Error:",
        error
      );

      setMessage(
        error.message ||
          "OTP મોકલવામાં સમસ્યા આવી."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const verifyOTP = async () => {
    if (!otp.trim()) {
      setMessage(
        "કૃપા કરીને OTP નાખો."
      );

      setMessageType("error");

      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      setMessage(
        "કૃપા કરીને 6 અંકનો યોગ્ય OTP નાખો."
      );

      setMessageType("error");

      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        "https://bhagavad-gita-website.onrender.com/api/auth/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: formData.email
              .trim()
              .toLowerCase(),

            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "OTP verify થઈ શક્યો નથી."
        );
      }

      setMessage(
        "OTP successfully verify થઈ ગયો છે. હવે Password બનાવો."
      );

      setMessageType("success");

      setStep(3);
    } catch (error) {
      console.error(
        "Verify OTP Error:",
        error
      );

      setMessage(
        error.message ||
          "OTP verificationમાં સમસ્યા આવી."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CREATE ACCOUNT
  // =====================================================

  const createAccount = async (e) => {
    e.preventDefault();

    const {
      name,
      mobile,
      email,
      birthDate,
      password,
      confirmPassword,
    } = formData;

    // PASSWORD REQUIRED
    if (!password) {
      setMessage(
        "કૃપા કરીને Password નાખો."
      );

      setMessageType("error");

      return;
    }

    // PASSWORD LENGTH
    if (password.length < 6) {
      setMessage(
        "Password ઓછામાં ઓછો 6 charactersનો હોવો જોઈએ."
      );

      setMessageType("error");

      return;
    }

    // CONFIRM PASSWORD
    if (password !== confirmPassword) {
      setMessage(
        "Password અને Confirm Password અલગ છે."
      );

      setMessageType("error");

      return;
    }

    // OTP CHECK
    if (!otpSent || !otp) {
      setMessage(
        "કૃપા કરીને પહેલા Email OTP verify કરો."
      );

      setMessageType("error");

      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        "https://bhagavad-gita-website.onrender.com/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),

            mobile: mobile.trim(),

            email: email
              .trim()
              .toLowerCase(),

            birthDate:
              convertBirthDateForServer(
                birthDate
              ),

            password,

            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Account create થઈ શક્યું નથી."
        );
      }

      setMessage(
        "🎉 તમારું account successfully બની ગયું છે!"
      );

      setMessageType("success");

      // RESET FORM
      setFormData({
        name: "",
        mobile: "",
        email: "",
        birthDate: "",
        password: "",
        confirmPassword: "",
      });

      setOtp("");

      setOtpSent(false);

      // GO TO LOGIN
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(
        "Register Error:",
        error
      );

      setMessage(
        error.message ||
          "Account create કરવામાં સમસ્યા આવી."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // BACK TO STEP 1
  // =====================================================

  const backToPersonalInformation = () => {
    setStep(1);

    setOtp("");

    setMessage("");

    setMessageType("");
  };

  // =====================================================
  // RESEND OTP
  // =====================================================

  const resendOTP = async () => {
    setOtp("");

    await sendOTP();
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="register-page">

      <div className="register-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="register-header">

          <div className="register-om">
            ॐ
          </div>

          <div className="register-lotus">
            🪷
          </div>

          <h1>
            રજીસ્ટર કરો
          </h1>

          <p>
            ભગવદ્ ગીતા વેબસાઇટમાં તમારું
            account બનાવો 🙏
          </p>

        </div>

        {/* =================================================
            PROGRESS STEPS
        ================================================= */}

        <div className="register-progress">

          {/* STEP 1 */}

          <div
            className={
              step >= 1
                ? "register-step active"
                : "register-step"
            }
          >
            <span>1</span>

            <small>
              માહિતી
            </small>
          </div>

          {/* LINE */}

          <div
            className={
              step >= 2
                ? "register-progress-line active"
                : "register-progress-line"
            }
          />

          {/* STEP 2 */}

          <div
            className={
              step >= 2
                ? "register-step active"
                : "register-step"
            }
          >
            <span>2</span>

            <small>
              OTP
            </small>
          </div>

          {/* LINE */}

          <div
            className={
              step >= 3
                ? "register-progress-line active"
                : "register-progress-line"
            }
          />

          {/* STEP 3 */}

          <div
            className={
              step >= 3
                ? "register-step active"
                : "register-step"
            }
          >
            <span>3</span>

            <small>
              Password
            </small>
          </div>

        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div
            className={
              messageType === "success"
                ? "register-message success"
                : "register-message error"
            }
          >
            {message}
          </div>
        )}

        {/* =================================================
            STEP 1
        ================================================= */}

        {step === 1 && (
          <form
            className="register-form"
            onSubmit={(e) => {
              e.preventDefault();
              sendOTP();
            }}
          >

            {/* NAME */}

            <div className="register-field">

              <label htmlFor="name">

                <span className="field-icon purple">
                  👤
                </span>

                <span>
                  નામ
                </span>

              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="તમારું પૂરું નામ"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />

            </div>

            {/* MOBILE */}

            <div className="register-field">

              <label htmlFor="mobile">

                <span className="field-icon orange">
                  📞
                </span>

                <span>
                  Mobile Number
                </span>

              </label>

              <input
                id="mobile"
                type="tel"
                name="mobile"
                placeholder="10 અંકનો Mobile Number"
                value={formData.mobile}
                onChange={(e) => {
                  const value =
                    e.target.value.replace(
                      /\D/g,
                      ""
                    );

                  setFormData((previous) => ({
                    ...previous,
                    mobile:
                      value.substring(
                        0,
                        10
                      ),
                  }));

                  setMessage("");
                  setMessageType("");
                }}
                maxLength="10"
                inputMode="numeric"
                autoComplete="tel"
              />

            </div>

            {/* EMAIL */}

            <div className="register-field">

              <label htmlFor="email">

                <span className="field-icon blue">
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

            {/* BIRTH DATE */}

            <div className="register-field">

              <label htmlFor="birthDate">

                <span className="field-icon pink">
                  🎂
                </span>

                <span>
                  Birth Date
                </span>

              </label>

              <div className="birth-date-container">

                {/* TEXT INPUT */}

                <input
                  id="birthDate"
                  type="text"
                  name="birthDate"
                  value={formData.birthDate}
                  placeholder="DD-MM-YYYY"
                  className="birth-date-display"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="bday"
                  onChange={
                    handleBirthDateTextChange
                  }
                />

                {/* CALENDAR BUTTON */}

                <button
                  type="button"
                  className="calendar-button"
                  onClick={
                    openBirthDatePicker
                  }
                  aria-label="Birth Date Calendar"
                  title="Birth Date પસંદ કરો"
                >
                  📅
                </button>

                {/* HIDDEN DATE PICKER */}

                <input
                  ref={birthDateInputRef}
                  type="date"
                  className="hidden-date-picker"
                  max={today}
                  onChange={
                    handleBirthDateChange
                  }
                  tabIndex="-1"
                  aria-hidden="true"
                />

              </div>

            </div>

            {/* SEND OTP */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading
                ? "Email પર OTP મોકલાઈ રહ્યો છે..."
                : "✉️ Email પર OTP મોકલો"}
            </button>

          </form>
        )}

        {/* =================================================
            STEP 2 - OTP
        ================================================= */}

        {step === 2 && (
          <div className="otp-section">

            <div className="otp-icon">
              🔐
            </div>

            <h2>
              OTP Verification
            </h2>

            <p>
              તમારા Email પર મોકલાયેલ OTP નાખો.
            </p>

            {/* OTP INPUT */}

            <div className="register-field">

              <label htmlFor="otp">

                <span className="field-icon purple">
                  🔢
                </span>

                <span>
                  Email OTP
                </span>

              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength="6"
                placeholder="6 અંકનો OTP નાખો"
                value={otp}
                onChange={(e) => {
                  const value =
                    e.target.value.replace(
                      /\D/g,
                      ""
                    );

                  setOtp(
                    value.substring(
                      0,
                      6
                    )
                  );

                  setMessage("");
                  setMessageType("");
                }}
              />

            </div>

            {/* VERIFY OTP */}

            <button
              type="button"
              className="register-submit"
              onClick={verifyOTP}
              disabled={loading}
            >
              {loading
                ? "Verify થઈ રહ્યું છે..."
                : "✓ OTP Verify કરો"}
            </button>

            {/* RESEND */}

            <button
              type="button"
              className="register-secondary"
              onClick={resendOTP}
              disabled={loading}
            >
              🔄 Email પર OTP ફરી મોકલો
            </button>

            {/* BACK */}

            <button
              type="button"
              className="register-back"
              onClick={
                backToPersonalInformation
              }
            >
              ← માહિતી સુધારો
            </button>

          </div>
        )}

        {/* =================================================
            STEP 3 - PASSWORD
        ================================================= */}

        {step === 3 && (
          <form
            className="register-form"
            onSubmit={createAccount}
          >

            {/* VERIFIED */}

            <div className="verified-box">
              ✓ Email OTP Successfully Verified
            </div>

            {/* PASSWORD */}

            <div className="register-field">

              <label htmlFor="password">

                <span className="field-icon purple">
                  🔒
                </span>

                <span>
                  Password
                </span>

              </label>

              <div className="password-input-container">

  <input
    id="password"
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Password બનાવો"
    value={formData.password}
    onChange={handleChange}
    autoComplete="new-password"
  />

<button
  type="button"
  className="password-toggle-button"
  onClick={() =>
    setShowPassword((previous) => !previous)
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
    <EyeOff size={20} strokeWidth={2} />
  ) : (
    <Eye size={20} strokeWidth={2} />
  )}
</button>

</div>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="register-field">

              <label htmlFor="confirmPassword">

                <span className="field-icon purple">
                  🔐
                </span>

                <span>
                  Confirm Password
                </span>

              </label>

<div className="password-input-container">

  <input
    id="confirmPassword"
    type={
      showConfirmPassword
        ? "text"
        : "password"
    }
    name="confirmPassword"
    placeholder="Password ફરીથી નાખો"
    value={formData.confirmPassword}
    onChange={handleChange}
    autoComplete="new-password"
  />

<button
  type="button"
  className="password-toggle-button"
  onClick={() =>
    setShowConfirmPassword(
      (previous) => !previous
    )
  }
  aria-label={
    showConfirmPassword
      ? "Confirm Password hide કરો"
      : "Confirm Password show કરો"
  }
  title={
    showConfirmPassword
      ? "Password hide કરો"
      : "Password show કરો"
  }
>
  {showConfirmPassword ? (
    <EyeOff size={20} strokeWidth={2} />
  ) : (
    <Eye size={20} strokeWidth={2} />
  )}
</button>

</div>

            </div>

            {/* PASSWORD HINT */}

            <p className="password-hint">
              Password ઓછામાં ઓછો 6
              charactersનો રાખો.
            </p>

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading
                ? "Account બની રહ્યું છે..."
                : "✓ Create Account"}
            </button>

          </form>
        )}

        {/* =================================================
            LOGIN LINK
        ================================================= */}

        <div className="register-login">

          <span>
            પહેલેથી registration કર્યું છે?
          </span>

          <Link to="/login">
            Login કરો
          </Link>

        </div>

        {/* =================================================
            BOTTOM OM
        ================================================= */}

        <div className="register-bottom">

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

export default Register;

