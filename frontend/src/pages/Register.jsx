import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Eye, 
  EyeOff,
  User,
  Phone,
  Mail,
  Calendar,
  Lock,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle,
  UserPlus,
  RefreshCw,
  Hash,
  ArrowLeft,
  MapPin,
  Landmark
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getLocalizedStates, getCitiesForState } from "../utils/indiaLocations.js";
import SearchableLocationSelect from "../components/SearchableLocationSelect.jsx";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isHindi, isEnglish, isGujarati, txt } = useLanguage();

  const currentLang = isEnglish ? "en" : isHindi ? "hi" : "gu";
  const stateList = getLocalizedStates(currentLang);

  // If user is already logged in, redirect away from /register
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

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
    state: "Gujarat",
    customState: "",
    city: "",
    customCity: "",
    password: "",
    confirmPassword: "",
  });

  const cityList = getCitiesForState(formData.state, currentLang);

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
  // GET RESOLVED FINAL LOCATION FOR SUBMISSION
  // =====================================================

  const getResolvedLocation = () => {
    const finalState =
      formData.state === "OTHER"
        ? (formData.customState || "").trim()
        : (stateList.find((s) => s.id === formData.state)?.name || formData.state || "").trim();

    const finalCity =
      formData.city === "OTHER" || formData.state === "OTHER"
        ? (formData.customCity || "").trim()
        : (formData.city || "").trim();

    return { finalState, finalCity };
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
        txt("કૃપા કરીને તમારું નામ લખો.", "कृपया अपना नाम लिखें।", "Please enter your name.")
      );

      setMessageType("error");

      return false;
    }

    // MOBILE
    if (!/^[0-9]{10}$/.test(mobile)) {
      setMessage(
        txt("કૃપા કરીને 10 અંકનો યોગ્ય Mobile Number નાખો.", "कृपया 10 अंकों का मान्य Mobile Number दर्ज करें।", "Please enter a valid 10-digit mobile number.")
      );

      setMessageType("error");

      return false;
    }

    // EMAIL
    if (!email.trim()) {
      setMessage(
        txt("કૃપા કરીને Email ID નાખો.", "कृपया Email ID दर्ज करें।", "Please enter your Email ID.")
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
        txt("કૃપા કરીને યોગ્ય Email ID નાખો.", "कृपया मान्य Email ID दर्ज करें।", "Please enter a valid Email ID.")
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
        txt("Birth Date DD-MM-YYYY formatમાં નાખો.", "जन्म तिथि DD-MM-YYYY प्रारूप में दर्ज करें।", "Enter birth date in DD-MM-YYYY format.")
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
        txt("કૃપા કરીને યોગ્ય Birth Date નાખો.", "कृपया मान्य जन्म तिथि दर्ज करें।", "Please enter a valid birth date.")
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
        txt("Birth Date futureની હોઈ શકતી નથી.", "जन्म तिथि भविष्य की नहीं हो सकती।", "Birth date cannot be in the future.")
      );

      setMessageType("error");

      return false;
    }

    const { finalState, finalCity } = getResolvedLocation();

    // STATE
    if (!finalState) {
      setMessage(
        formData.state === "OTHER"
          ? txt("કૃપા કરીને તમારું રાજ્ય અથવા દેશ દાખલ કરો.", "कृपया अपना राज्य या देश दर्ज करें।", "Please enter your state or country.")
          : txt("કૃપા કરીને તમારું રાજ્ય પસંદ કરો.", "कृपया अपना राज्य चुनें।", "Please select your state.")
      );

      setMessageType("error");

      return false;
    }

    // CITY
    if (!finalCity) {
      setMessage(
        formData.city === "OTHER" || formData.state === "OTHER"
          ? txt("કૃપા કરીને તમારું શહેર અથવા ગામ દાખલ કરો.", "कृपया अपना शहर या गांव दर्ज करें।", "Please enter your city or village.")
          : txt("કૃપા કરીને તમારું શહેર અથવા ગામ પસંદ કરો.", "कृपया अपना शहर या गांव चुनें।", "Please select your city or village.")
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

    const { finalState, finalCity } = getResolvedLocation();

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

            state: finalState,

            city: finalCity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            txt("OTP મોકલી શકાયો નથી.", "OTP नहीं भेजा जा सका।", "Could not send OTP.")
        );
      }

      setOtpSent(true);

      setStep(2);

      setMessage(
        txt("તમારા Email પર OTP મોકલવામાં આવ્યો છે.", "आपके Email पर OTP भेजा गया है।", "OTP has been sent to your email.")
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "Send OTP Error:",
        error
      );

      setMessage(
        error.message ||
          txt("OTP મોકલવામાં સમસ્યા આવી.", "OTP भेजने में समस्या आई।", "Error occurred while sending OTP.")
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
        txt("કૃપા કરીને OTP નાખો.", "कृपया OTP दर्ज करें।", "Please enter the OTP.")
      );

      setMessageType("error");

      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      setMessage(
        txt("કૃપા કરીને 6 અંકનો યોગ્ય OTP નાખો.", "कृपया 6 अंकों का मान्य OTP दर्ज करें।", "Please enter a valid 6-digit OTP.")
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
            txt("OTP verify થઈ શક્યો નથી.", "OTP verify नहीं हो सका।", "Could not verify OTP.")
        );
      }

      setMessage(
        txt("OTP successfully verify થઈ ગયો છે. હવે Password બનાવો.", "OTP सफलतापूर्वक verify हो गया है। अब Password बनाएं।", "OTP verified successfully. Now create your password.")
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
          txt("OTP verificationમાં સમસ્યા આવી.", "OTP verification में समस्या आई।", "Error verifying OTP.")
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
        txt("કૃપા કરીને Password નાખો.", "कृपया Password दर्ज करें।", "Please enter your password.")
      );

      setMessageType("error");

      return;
    }

    // PASSWORD LENGTH
    if (password.length < 6) {
      setMessage(
        txt("Password ઓછામાં ઓછો 6 charactersનો હોવો જોઈએ.", "Password कम से कम 6 अक्षरों का होना चाहिए।", "Password must be at least 6 characters.")
      );

      setMessageType("error");

      return;
    }

    // CONFIRM PASSWORD
    if (password !== confirmPassword) {
      setMessage(
        txt("Password અને Confirm Password અલગ છે.", "Password और Confirm Password अलग हैं।", "Password and Confirm Password do not match.")
      );

      setMessageType("error");

      return;
    }

    // OTP CHECK
    if (!otpSent || !otp) {
      setMessage(
        txt("કૃપા કરીને પહેલા Email OTP verify કરો.", "कृपया पहले Email OTP verify करें।", "Please verify your email OTP first.")
      );

      setMessageType("error");

      return;
    }

    const { finalState, finalCity } = getResolvedLocation();

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

            state: finalState,

            city: finalCity,

            password,

            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            txt("Account create થઈ શક્યું નથી.", "Account नहीं बन सका।", "Could not create account.")
        );
      }

      setMessage(
        txt("🎉 તમારું account successfully બની ગયું છે!", "🎉 आपका account सफलतापूर्वक बन गया है!", "🎉 Your account was created successfully!")
      );

      setMessageType("success");

      // RESET FORM
      setFormData({
        name: "",
        mobile: "",
        email: "",
        birthDate: "",
        state: "Gujarat",
        customState: "",
        city: "",
        customCity: "",
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
          txt("Account create કરવામાં સમસ્યા આવી.", "Account बनाने में समस्या आई।", "Error occurred while creating account.")
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
            <Sparkles size={32} color="#f59e0b" />
          </div>

          <h1>
            {txt("રજીસ્ટર કરો", "रजिस्टर करें", "Register")}
          </h1>

          <p>
            {txt("ભગવદ્ ગીતા વેબસાઇટમાં તમારું account બનાવો", "भगवद् गीता वेबसाइट में अपना account बनाएं", "Create your Bhagavad Gita account")}
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
              {txt("માહિતી", "जानकारी", "Details")}
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
            {messageType === "success" ? (
              <CheckCircle size={18} className="btn-icon" />
            ) : (
              <AlertCircle size={18} className="btn-icon" />
            )}
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
                  <User size={16} />
                </span>

                <span>
                  {txt("નામ", "नाम", "Name")}
                </span>

              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder={txt("તમારું પૂરું નામ", "आपका पूरा नाम", "Your Full Name")}
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />

            </div>

            {/* MOBILE */}

            <div className="register-field">

              <label htmlFor="mobile">

                <span className="field-icon orange">
                  <Phone size={16} />
                </span>

                <span>
                  {txt("મોબાઇલ નંબર", "मोबाइल नंबर", "Mobile Number")}
                </span>

              </label>

              <input
                id="mobile"
                type="tel"
                name="mobile"
                placeholder={txt("10 અંકનો Mobile Number", "10 अंकों का Mobile Number", "10-digit Mobile Number")}
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
                  <Mail size={16} />
                </span>

                <span>
                  {txt("Email ID", "Email ID", "Email ID")}
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

            {/* BIRTH DATE */}

            <div className="register-field">

              <label htmlFor="birthDate">

                <span className="field-icon pink">
                  <Calendar size={16} />
                </span>

                <span>
                  {txt("જન્મ તારીખ", "जन्म तिथि", "Date of Birth")}
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
                  aria-label={txt("જન્મ તારીખ કેલેન્ડર", "जन्म तिथि कैलेंडर", "Birth Date Calendar")}
                  title={txt("Birth Date પસંદ કરો", "जन्म तिथि चुनें", "Select Date of Birth")}
                >
                  <Calendar size={18} />
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

            {/* STATE (રાજ્ય) */}
            <div className="register-field">
              <label htmlFor="state">
                <span className="field-icon teal">
                  <Landmark size={16} />
                </span>
                <span>
                  {txt("રાજ્ય", "राज्य", "State")}
                </span>
              </label>

              <SearchableLocationSelect
                id="state"
                name="state"
                value={formData.state}
                items={stateList}
                language={currentLang}
                placeholder={txt("રાજ્ય પસંદ કરો અથવા શોધો...", "राज्य चुनें या खोजें...", "Select or search state...")}
                emptyText={txt("કોઈ રાજ્ય મળ્યું નથી", "कोई राज्य नहीं मिला", "No state found")}
                addCustomText={txt("+ આ રાજ્ય દાખલ કરો:", "+ यह राज्य दर्ज करें:", "+ Add this state:")}
                onChange={(selectedId) => {
                  setFormData((previous) => ({
                    ...previous,
                    state: selectedId,
                    customState: selectedId === "OTHER" ? previous.customState : "",
                    city: selectedId === "OTHER" ? "OTHER" : "",
                    customCity: "",
                  }));
                  setMessage("");
                  setMessageType("");
                }}
                onCustomEnter={(customVal) => {
                  setFormData((previous) => ({
                    ...previous,
                    state: "OTHER",
                    customState: customVal,
                    city: "OTHER",
                    customCity: "",
                  }));
                }}
              />

              {/* CUSTOM STATE INPUT IF "OTHER" SELECTED */}
              {formData.state === "OTHER" && (
                <div className="register-custom-input-box" style={{ marginTop: "10px" }}>
                  <input
                    type="text"
                    name="customState"
                    placeholder={txt("તમારું રાજ્ય અથવા દેશ દાખલ કરો...", "अपना राज्य या देश दर्ज करें...", "Enter your state or country...")}
                    value={formData.customState}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* CITY / VILLAGE (શહેર / ગામ) */}
            <div className="register-field">
              <label htmlFor="city">
                <span className="field-icon green">
                  <MapPin size={16} />
                </span>
                <span>
                  {txt("શહેર / ગામ", "शहर / गांव", "City / Village")}
                </span>
              </label>

              {formData.state !== "OTHER" && (
                <SearchableLocationSelect
                  id="city"
                  name="city"
                  value={formData.city}
                  items={cityList}
                  language={currentLang}
                  placeholder={txt("શહેર અથવા ગામ પસંદ કરો / શોધો...", "शहर या गांव चुनें / खोजें...", "Select or search city / village...")}
                  emptyText={txt("કોઈ શહેર/ગામ મળ્યું નથી", "कोई शहर/गांव नहीं मिला", "No city/village found")}
                  addCustomText={txt("+ આ શહેર/ગામ દાખલ કરો:", "+ यह शहर/गांव दर्ज करें:", "+ Add this city/village:")}
                  onChange={(selectedId, selectedObj) => {
                    const finalVal = selectedId === "OTHER" ? "OTHER" : (selectedObj?.name || selectedId);
                    setFormData((previous) => ({
                      ...previous,
                      city: finalVal,
                      customCity: selectedId === "OTHER" ? previous.customCity : "",
                    }));
                    setMessage("");
                    setMessageType("");
                  }}
                  onCustomEnter={(customVal) => {
                    setFormData((previous) => ({
                      ...previous,
                      city: "OTHER",
                      customCity: customVal,
                    }));
                  }}
                />
              )}

              {/* CUSTOM CITY INPUT IF "OTHER" SELECTED OR STATE IS "OTHER" */}
              {(formData.city === "OTHER" || formData.state === "OTHER") && (
                <div className="register-custom-input-box" style={{ marginTop: "10px" }}>
                  <input
                    type="text"
                    name="customCity"
                    placeholder={txt("તમારું શહેર અથવા ગામ દાખલ કરો...", "अपना शहर या गांव दर्ज करें...", "Enter your city or village...")}
                    value={formData.customCity}
                    onChange={handleChange}
                    autoFocus={formData.state !== "OTHER"}
                  />
                </div>
              )}
            </div>

            {/* SEND OTP */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="spinner btn-icon" size={18} />
                  {txt("Email પર OTP મોકલાઈ રહ્યો છે...", "Email पर OTP भेजा जा रहा है...", "Sending OTP to Email...")}
                </>
              ) : (
                <>
                  <Mail className="btn-icon" size={18} />
                  {txt("Email પર OTP મોકલો", "Email पर OTP भेजें", "Send OTP to Email")}
                </>
              )}
            </button>

          </form>
        )}

        {/* =================================================
            STEP 2 - OTP
        ================================================= */}

        {step === 2 && (
          <div className="otp-section">

            <div className="otp-icon">
              <Lock size={32} color="#10b981" />
            </div>

            <h2>
              OTP Verification
            </h2>

            <p>
              {txt("તમારા Email પર મોકલાયેલ OTP નાખો.", "आपके Email पर भेजा गया OTP दर्ज करें।", "Enter the OTP sent to your Email.")}
            </p>

            {/* OTP INPUT */}

            <div className="register-field">

              <label htmlFor="otp">

                <span className="field-icon purple">
                  <Hash size={16} />
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
                placeholder={txt("6 અંકનો OTP નાખો", "6 अंकों का OTP दर्ज करें", "Enter 6-digit OTP")}
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
              {loading ? (
                <>
                  <Loader2 className="spinner btn-icon" size={18} />
                  {txt("Verify થઈ રહ્યું છે...", "Verify हो रहा है...", "Verifying...")}
                </>
              ) : (
                <>
                  <CheckCircle className="btn-icon" size={18} />
                  {txt("OTP Verify કરો", "OTP Verify करें", "Verify OTP")}
                </>
              )}
            </button>

            {/* RESEND */}

            <button
              type="button"
              className="register-secondary"
              onClick={resendOTP}
              disabled={loading}
            >
              <RefreshCw className="btn-icon" size={16} />
              {txt("Email પર OTP ફરી મોકલો", "Email पर OTP पुनः भेजें", "Resend OTP to Email")}
            </button>

            {/* BACK */}

            <button
              type="button"
              className="register-back"
              onClick={
                backToPersonalInformation
              }
            >
              <ArrowLeft className="btn-icon" size={16} />
              {txt("માહિતી સુધારો", "जानकारी सुधारें", "Edit Information")}
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
              <CheckCircle className="btn-icon" size={18} /> Email OTP Successfully Verified
            </div>

            {/* PASSWORD */}

            <div className="register-field">

              <label htmlFor="password">

                <span className="field-icon purple">
                  <Lock size={16} />
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
    placeholder={txt("Password બનાવો", "Password बनाएं", "Create Password")}
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
      ? txt("Password સંતાડો", "Password छिपाएं", "Hide Password")
      : txt("Password બતાવો", "Password दिखाएं", "Show Password")
  }
  title={
    showPassword
      ? txt("Password સંતાડો", "Password छिपाएं", "Hide Password")
      : txt("Password બતાવો", "Password दिखाएं", "Show Password")
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
                  <Lock size={16} />
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
    placeholder={txt("Password ફરીથી નાખો", "Password पुनः दर्ज करें", "Re-enter Password")}
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
      ? txt("Confirm Password સંતાડો", "Confirm Password छिपाएं", "Hide Confirm Password")
      : txt("Confirm Password બતાવો", "Confirm Password दिखाएं", "Show Confirm Password")
  }
  title={
    showConfirmPassword
      ? txt("Confirm Password સંતાડો", "Confirm Password छिपाएं", "Hide Confirm Password")
      : txt("Confirm Password બતાવો", "Confirm Password दिखाएं", "Show Confirm Password")
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
              {txt("Password ઓછામાં ઓછો 6 charactersનો રાખો.", "Password कम से कम 6 अक्षरों का रखें।", "Password must be at least 6 characters.")}
            </p>

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="spinner btn-icon" size={18} />
                  {txt("Account બની રહ્યું છે...", "Account बन रहा है...", "Creating Account...")}
                </>
              ) : (
                <>
                  <UserPlus className="btn-icon" size={18} />
                  {txt("Create Account", "Create Account", "Create Account")}
                </>
              )}
            </button>

          </form>
        )}

        {/* =================================================
            LOGIN LINK
        ================================================= */}

        <div className="register-login">

          <span>
            {txt("પહેલેથી registration કર્યું છે?", "पहले से पंजीकृत हैं?", "Already registered?")}
          </span>

          <Link to="/login">
            {txt("Login કરો", "Login करें", "Login")}
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

