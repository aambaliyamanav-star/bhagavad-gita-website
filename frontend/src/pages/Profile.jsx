import { getValidToken, handleAuth401, clearAuthSession } from "../utils/authHelper.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  EyeOff,
  User,
  Shield,
  Edit2,
  LogOut,
  Phone,
  Mail,
  Calendar,
  Key,
  Lock,
  Unlock,
  Save,
  X,
  CheckCircle,
  Smartphone,
  ShieldCheck,
  Loader2,
  MapPin,
  Landmark
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { getLocalizedStates, getCitiesForState } from "../utils/indiaLocations.js";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isHindi, isEnglish, isGujarati, txt } = useLanguage();

  const currentLang = isEnglish ? "en" : isHindi ? "hi" : "gu";
  const stateList = getLocalizedStates(currentLang);

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(null);

  // =====================================================
  // MESSAGE
  // =====================================================

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =====================================================
  // EDIT MODE
  // =====================================================

  const [editing, setEditing] = useState(false);

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
    currentPassword: "",
    newPassword: "",
  });

  const cityList = getCitiesForState(formData.state, currentLang);

  // =====================================================
  // EMAIL OTP
  // =====================================================

  const [emailOTP, setEmailOTP] = useState("");
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [emailOTPVerified, setEmailOTPVerified] = useState(false);
  const [emailOTPLoading, setEmailOTPLoading] = useState(false);

  // =====================================================
  // MOBILE OTP
  // =====================================================

  const [mobileOTP, setMobileOTP] = useState("");
  const [mobileOTPSent, setMobileOTPSent] = useState(false);
  const [mobileOTPVerified, setMobileOTPVerified] = useState(false);
  const [mobileOTPLoading, setMobileOTPLoading] = useState(false);

  // =====================================================
  // GENERAL LOADING
  // =====================================================

  const [loading, setLoading] = useState(false);

  // =====================================================
// PASSWORD SHOW / HIDE
// =====================================================

const [showCurrentPassword, setShowCurrentPassword] =
  useState(false);

const [showNewPassword, setShowNewPassword] =
  useState(false);

  // =====================================================
  // API URL
  // =====================================================

  const API_URL = "https://bhagavad-gita-website.onrender.com/api/auth";

  // =====================================================
  // GET PROFILE
  // =====================================================

  useEffect(() => {
    const token = getValidToken();

    if (!token) {
      handleAuth401(navigate, "/profile");
      return;
    }

    const getProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 || (data.message && data.message.toLowerCase().includes("token"))) {
            handleAuth401(navigate, "/profile");
            return;
          }
          throw new Error(
            data.message || txt("Profile મળ્યું નથી.", "प्रोफ़ाइल नहीं मिली।", "Profile not found.")
          );
        }

        if (data.user) {
          setUser(data.user);

          localStorage.setItem(
            "user",
            JSON.stringify(data.user)
          );
        }
      } catch (error) {
        console.error(
          "❌ Get Profile Error:",
          error
        );

        setMessage(
          error.message ||
            txt("Profile મેળવવામાં સમસ્યા આવી.", "Profile प्राप्त करने में समस्या आई।", "Error loading profile.")
        );

        setMessageType("error");
      }
    };

    getProfile();
  }, [navigate]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");

    // =================================================
    // EMAIL CHANGED
    // =================================================

    if (name === "email") {
      setEmailOTP("");
      setEmailOTPSent(false);
      setEmailOTPVerified(false);
    }

    // =================================================
    // MOBILE CHANGED
    // =================================================

    if (name === "mobile") {
      setMobileOTP("");
      setMobileOTPSent(false);
      setMobileOTPVerified(false);
    }
  };

  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const handleEdit = () => {
    if (!user) return;

    const userState = user.state || "Gujarat";
    const isKnownState = stateList.some((s) => s.id === userState || s.name === userState);

    const initialCityList = getCitiesForState(isKnownState ? userState : "OTHER", currentLang);
    const userCity = user.city || "";
    const isKnownCity = initialCityList.some((c) => c.name === userCity);

    setFormData({
      name: user.name || "",
      mobile: user.mobile || "",
      email: user.email || "",
      birthDate: user.birthDate
        ? new Date(user.birthDate)
            .toISOString()
            .split("T")[0]
        : "",
      state: isKnownState ? userState : "OTHER",
      customState: isKnownState ? "" : userState,
      city: isKnownCity ? userCity : (userCity ? "OTHER" : ""),
      customCity: isKnownCity ? "" : userCity,
      currentPassword: "",
      newPassword: "",
    });

    // Reset Email OTP
    setEmailOTP("");
    setEmailOTPSent(false);
    setEmailOTPVerified(false);

    // Reset Mobile OTP
    setMobileOTP("");
    setMobileOTPSent(false);
    setMobileOTPVerified(false);

    setMessage("");
    setMessageType("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);

    setEditing(true);
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = () => {
    setEditing(false);

    setEmailOTP("");
    setEmailOTPSent(false);
    setEmailOTPVerified(false);

    setMobileOTP("");
    setMobileOTPSent(false);
    setMobileOTPVerified(false);

    setMessage("");
    setMessageType("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
  };

  // =====================================================
  // EMAIL CHANGED
  // =====================================================

  const emailChanged =
    user &&
    formData.email
      .toLowerCase()
      .trim() !==
      user.email
        .toLowerCase()
        .trim();

  // =====================================================
  // MOBILE CHANGED
  // =====================================================

  const mobileChanged =
    user &&
    formData.mobile.trim() !==
      user.mobile;

  // =====================================================
  // SEND PROFILE OTP
  // =====================================================

  const sendProfileOTP = async (type) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // =================================================
    // TARGET VALUE
    // =================================================

    const target =
      type === "email"
        ? formData.email
            .trim()
            .toLowerCase()
        : formData.mobile.trim();

    // =================================================
    // EMPTY CHECK
    // =================================================

    if (!target) {
      setMessage(
        type === "email"
          ? txt("Email ID નાખો.", "Email ID दर्ज करें।", "Please enter Email ID.")
          : txt("Mobile Number નાખો.", "Mobile Number दर्ज करें।", "Please enter Mobile Number.")
      );

      setMessageType("error");
      return;
    }

    // =================================================
    // EMAIL VALIDATION
    // =================================================

    if (
      type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        target
      )
    ) {
      setMessage(txt("યોગ્ય Email ID નાખો.", "मान्य Email ID दर्ज करें।", "Please enter a valid Email ID."));
      setMessageType("error");
      return;
    }

    // =================================================
    // MOBILE VALIDATION
    // =================================================

    if (
      type === "mobile" &&
      !/^[0-9]{10}$/.test(target)
    ) {
      setMessage(
        txt("યોગ્ય 10 અંકનો Mobile Number નાખો.", "मान्य 10 अंकों का Mobile Number दर्ज करें।", "Please enter a valid 10-digit Mobile Number.")
      );

      setMessageType("error");
      return;
    }

    // =================================================
    // LOADING
    // =================================================

    if (type === "email") {
      setEmailOTPLoading(true);
    } else {
      setMobileOTPLoading(true);
    }

    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        `${API_URL}/profile/send-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            type,
            value: target,
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

      // =================================================
      // EMAIL OTP SUCCESS
      // =================================================

      if (type === "email") {
        setEmailOTPSent(true);
        setEmailOTPVerified(false);
        setEmailOTP("");

        setMessage(
          txt(
            `Email change માટે OTP તમારા હાલના registered Email (${user.email}) પર મોકલવામાં આવ્યો છે. ✉️`,
            `Email बदलने के लिए OTP आपके वर्तमान पंजीकृत Email (${user.email}) पर भेजा गया है। ✉️`,
            `OTP to change email has been sent to your current registered Email (${user.email}). ✉️`
          )
        );
      }

      // =================================================
      // MOBILE OTP SUCCESS
      // =================================================

      if (type === "mobile") {
        setMobileOTPSent(true);
        setMobileOTPVerified(false);
        setMobileOTP("");

        setMessage(
          txt(
            `Mobile Number change માટે OTP તમારા હાલના registered Email (${user.email}) પર મોકલવામાં આવ્યો છે. ✉️`,
            `Mobile Number बदलने के लिए OTP आपके वर्तमान पंजीकृत Email (${user.email}) पर भेजा गया है। ✉️`,
            `OTP to change mobile number has been sent to your current registered Email (${user.email}). ✉️`
          )
        );
      }

      setMessageType("success");
    } catch (error) {
      console.error(
        "❌ Send Profile OTP Error:",
        error
      );

      setMessage(
        error.message ||
          txt("OTP મોકલવામાં સમસ્યા આવી.", "OTP भेजने में समस्या आई।", "Failed to send OTP.")
      );

      setMessageType("error");
    } finally {
      if (type === "email") {
        setEmailOTPLoading(false);
      } else {
        setMobileOTPLoading(false);
      }
    }
  };

  // =====================================================
  // VERIFY EMAIL OTP
  // =====================================================

  const verifyEmailOTP = async () => {
    const cleanOTP = emailOTP
      .toString()
      .trim();

    if (!cleanOTP) {
      setMessage(
        txt("કૃપા કરીને Email OTP નાખો.", "कृपया Email OTP दर्ज करें।", "Please enter Email OTP.")
      );

      setMessageType("error");
      return;
    }

    if (!/^[0-9]{6}$/.test(cleanOTP)) {
      setMessage(
        txt("6 અંકનો યોગ્ય Email OTP નાખો.", "6 अंकों का मान्य Email OTP दर्ज करें।", "Please enter a valid 6-digit Email OTP.")
      );

      setMessageType("error");
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const value = formData.email
      .toString()
      .trim()
      .toLowerCase();

    if (!value) {
      setMessage(
        txt("Email ID જરૂરી છે.", "Email ID आवश्यक है।", "Email ID is required.")
      );

      setMessageType("error");
      return;
    }

    try {
      setEmailOTPLoading(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_URL}/profile/verify-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            type: "email",
            value,
            otp: cleanOTP,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            txt("Email OTP verify થઈ શક્યો નથી.", "Email OTP verify नहीं हो सका।", "Could not verify Email OTP.")
        );
      }

      if (data.verified !== true) {
        throw new Error(
          txt("OTP verify થયું નથી.", "OTP verify नहीं हुआ।", "OTP was not verified.")
        );
      }

      setEmailOTP(cleanOTP);
      setEmailOTPVerified(true);

      setMessage(
        txt("Email OTP successfully verify થઈ ગયો છે. ✅", "Email OTP सफलतापूर्वक verify हो गया है। ✅", "Email OTP verified successfully. ✅")
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "❌ Verify Email OTP Error:",
        error
      );

      setEmailOTPVerified(false);

      setMessage(
        error.message ||
          txt("Email OTP verificationમાં સમસ્યા આવી.", "Email OTP verification में समस्या आई।", "Error during Email OTP verification.")
      );

      setMessageType("error");
    } finally {
      setEmailOTPLoading(false);
    }
  };

  // =====================================================
  // VERIFY MOBILE OTP
  // =====================================================

  const verifyMobileOTP = async () => {
    const cleanOTP = mobileOTP
      .toString()
      .trim();

    if (!cleanOTP) {
      setMessage(
        txt("કૃપા કરીને Mobile OTP નાખો.", "कृपया Mobile OTP दर्ज करें।", "Please enter Mobile OTP.")
      );

      setMessageType("error");
      return;
    }

    if (!/^[0-9]{6}$/.test(cleanOTP)) {
      setMessage(
        txt("6 અંકનો યોગ્ય Mobile OTP નાખો.", "6 अंकों का मान्य Mobile OTP दर्ज करें।", "Please enter a valid 6-digit Mobile OTP.")
      );

      setMessageType("error");
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const value = formData.mobile
      .toString()
      .trim();

    if (!value) {
      setMessage(
        txt("Mobile Number જરૂરી છે.", "Mobile Number आवश्यक है।", "Mobile number is required.")
      );

      setMessageType("error");
      return;
    }

    try {
      setMobileOTPLoading(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_URL}/profile/verify-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            type: "mobile",
            value,
            otp: cleanOTP,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            txt("Mobile OTP verify થઈ શક્યો નથી.", "Mobile OTP verify नहीं हो सका।", "Could not verify Mobile OTP.")
        );
      }

      if (data.verified !== true) {
        throw new Error(
          txt("OTP verify થયું નથી.", "OTP verify नहीं हुआ।", "OTP was not verified.")
        );
      }

      setMobileOTP(cleanOTP);
      setMobileOTPVerified(true);

      setMessage(
        txt(
          "Mobile change માટે Email OTP successfully verify થઈ ગયો છે. ✅",
          "Mobile बदलने के लिए Email OTP सफलतापूर्वक verify हो गया है। ✅",
          "Email OTP for mobile change verified successfully. ✅"
        )
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "❌ Verify Mobile OTP Error:",
        error
      );

      setMobileOTPVerified(false);

      setMessage(
        error.message ||
          txt("Mobile OTP verificationમાં સમસ્યા આવી.", "Mobile OTP verification में समस्या आई।", "Error during Mobile OTP verification.")
      );

      setMessageType("error");
    } finally {
      setMobileOTPLoading(false);
    }
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // =================================================
    // EMAIL CHANGE OTP CHECK
    // =================================================

    if (
      emailChanged &&
      !emailOTPVerified
    ) {
      setMessage(
        txt(
          "Email બદલવા માટે પહેલા તમારા હાલના registered Email પર આવેલ OTP verify કરો.",
          "Email बदलने के लिए पहले अपने वर्तमान पंजीकृत Email पर आया OTP verify करें।",
          "Please verify the OTP sent to your current registered email before changing email."
        )
      );

      setMessageType("error");
      return;
    }

    // =================================================
    // MOBILE CHANGE OTP CHECK
    // =================================================

    if (
      mobileChanged &&
      !mobileOTPVerified
    ) {
      setMessage(
        txt(
          "Mobile Number બદલવા માટે પહેલા તમારા હાલના registered Email પર આવેલ OTP verify કરો.",
          "Mobile Number बदलने के लिए पहले अपने वर्तमान पंजीकृत Email पर आया OTP verify करें।",
          "Please verify the OTP sent to your current registered email before changing mobile number."
        )
      );

      setMessageType("error");
      return;
    }

    const finalState =
      formData.state === "OTHER"
        ? (formData.customState || "").trim()
        : (stateList.find((s) => s.id === formData.state)?.name || formData.state || "").trim();

    const finalCity =
      formData.city === "OTHER" || formData.state === "OTHER"
        ? (formData.customCity || "").trim()
        : (formData.city || "").trim();

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_URL}/profile`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name: formData.name,
            mobile: formData.mobile,
            email: formData.email,
            birthDate: formData.birthDate,
            state: finalState,
            city: finalCity,

            currentPassword:
              formData.currentPassword,

            newPassword:
              formData.newPassword,

            emailOTP: emailChanged
              ? emailOTP
              : undefined,

            mobileOTP: mobileChanged
              ? mobileOTP
              : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            txt("Profile update થઈ શક્યું નથી.", "Profile update नहीं हो सकी।", "Could not update profile.")
        );
      }

      // =================================================
      // UPDATE USER STATE
      // =================================================

      setUser(data.user);

      // =================================================
      // UPDATE LOCAL STORAGE
      // =================================================

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // =================================================
      // CLOSE EDIT
      // =================================================

      setEditing(false);

      // =================================================
      // RESET OTP
      // =================================================

      setEmailOTP("");
      setEmailOTPSent(false);
      setEmailOTPVerified(false);

      setMobileOTP("");
      setMobileOTPSent(false);
      setMobileOTPVerified(false);

      // =================================================
      // RESET PASSWORD FIELDS
      // =================================================

      setFormData((previous) => ({
        ...previous,
        currentPassword: "",
        newPassword: "",
      }));

      // =================================================
      // SUCCESS
      // =================================================

      setMessage(
        txt("Profile સફળતાપૂર્વક update થઈ ગઈ છે. ✅", "Profile सफलतापूर्वक update हो गई है। ✅", "Profile updated successfully. ✅")
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "❌ Update Profile Error:",
        error
      );

      setMessage(
        error.message ||
          txt("Profile update કરવામાં સમસ્યા આવી.", "Profile update करने में समस्या आई।", "Error updating profile.")
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmed = window.confirm(
      txt("શું તમે ખરેખર Logout કરવા માંગો છો?", "क्या आप वाकई Logout करना चाहते हैं?", "Are you sure you want to Logout?")
    );

    if (!confirmed) {
      return;
    }

    logout();
    navigate("/login");
  };

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-card">
          <p>
            {message || txt("લોડ થઈ રહ્યું છે...", "लोड हो रहा है...", "Loading...")}
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // PROFILE VIEW
  // =====================================================

  return (
    <main className="profile-page">
      <div className="profile-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="profile-avatar">
          <User size={48} className="profile-avatar-icon" />
        </div>

        <h1>
          {txt("મારું Profile", "मेरी Profile", "My Profile")}
        </h1>

        <p className="profile-subtitle">
          Bhagavad Gita Account
        </p>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div
            className={
              messageType === "success"
                ? "profile-message success"
                : "profile-message error"
            }
          >
            {message}
          </div>
        )}

        {/* =================================================
            VIEW MODE
        ================================================= */}

        {!editing && (
          <>
            <div className="profile-info">

              {/* NAME */}

              <div className="profile-row">
                <span>{txt("નામ", "नाम", "Name")}</span>

                <strong>
                  {user.name}
                </strong>
              </div>

              {/* MOBILE */}

              <div className="profile-row">
                <span>{txt("મોબાઇલ", "मोबाइल", "Mobile")}</span>

                <strong>
                  {user.mobile}
                </strong>
              </div>

              {/* EMAIL */}

              <div className="profile-row">
                <span>Email</span>

                <strong>
                  {user.email}
                </strong>
              </div>

              {/* BIRTH DATE */}

              <div className="profile-row">
                <span>
                  {txt("જન્મ તારીખ", "जन्म तिथि", "Date of Birth")}
                </span>

                <strong>
                  {user.birthDate
                    ? new Date(
                        user.birthDate
                      ).toLocaleDateString(
                        "en-IN"
                      )
                    : "-"}
                </strong>
              </div>

              {/* STATE & CITY */}
              <div className="profile-row">
                <span>
                  {txt("રાજ્ય / શહેર", "राज्य / शहर", "Location")}
                </span>

                <strong>
                  {user.city ? `${user.city}, ` : ""}{user.state || ""}
                </strong>
              </div>

              {/* ROLE */}

              <div className="profile-row">
                <span>Role</span>

                <span
                  className={
                    user.role === "admin"
                      ? "profile-role admin-profile-role"
                      : "profile-role user-profile-role"
                  }
                >
                  {user.role === "admin"
                    ? <><Shield className="btn-icon" size={16} /> Admin</>
                    : <><User className="btn-icon" size={16} /> User</>}
                </span>
              </div>

              {/* CREATED DATE */}

              <div className="profile-row">
                <span>
                  {txt("Account બનાવ્યું", "Account बनाया", "Account Created")}
                </span>

                <strong>
                  {user.createdAt
                    ? new Date(
                        user.createdAt
                      ).toLocaleDateString(
                        "en-IN"
                      )
                    : "-"}
                </strong>
              </div>
            </div>

            {/* =================================================
                EDIT BUTTON
            ================================================= */}

            <button
              type="button"
              className="profile-edit-btn"
              onClick={handleEdit}
            >
              <Edit2 className="btn-icon" size={18} /> {txt("Profile સુધારો", "Profile एडिट करें", "Edit Profile")}
            </button>

            {/* =================================================
                ADMIN BUTTON
            ================================================= */}

            {user.role === "admin" && (
              <button
                type="button"
                className="profile-admin-btn"
                onClick={() =>
                  navigate("/admin")
                }
              >
                <ShieldCheck className="btn-icon" size={18} /> Admin Panel
              </button>
            )}

            {/* =================================================
                LOGOUT
            ================================================= */}

            <button
              type="button"
              className="profile-logout-btn"
              onClick={handleLogout}
            >
              <LogOut className="btn-icon" size={18} /> Logout
            </button>
          </>
        )}

        {/* =================================================
            EDIT MODE
        ================================================= */}

        {editing && (
          <div className="profile-edit-form">

            {/* =================================================
                NAME
            ================================================= */}

            <div className="profile-edit-field">
              <label>
                <User size={16} className="btn-icon" /> {txt("નામ", "नाम", "Name")}
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* =================================================
                MOBILE
            ================================================= */}

            <div className="profile-edit-field">
              <label>
                <Phone size={16} className="btn-icon" /> {txt("મોબાઇલ નંબર", "मोबाइल नंबर", "Mobile Number")}
              </label>

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                maxLength="10"
                inputMode="numeric"
                onChange={(e) => {
                  const value =
                    e.target.value.replace(
                      /\D/g,
                      ""
                    );

                  handleChange({
                    target: {
                      name: "mobile",
                      value:
                        value.substring(
                          0,
                          10
                        ),
                    },
                  });
                }}
              />

              {/* MOBILE OTP BUTTON */}

              {mobileChanged && (
                <button
                  type="button"
                  className="profile-otp-btn"
                  onClick={() =>
                    sendProfileOTP(
                      "mobile"
                    )
                  }
                  disabled={
                    mobileOTPLoading
                  }
                >
                  {mobileOTPLoading
                    ? <><Loader2 className="spinner btn-icon" size={16} /> {txt("Email પર OTP મોકલાઈ રહ્યો છે...", "Email પર OTP भेजा जा रहा है...", "Sending OTP to Email...")}</>
                    : <><Smartphone className="btn-icon" size={16} /> {txt("Mobile Change માટે Email OTP મોકલો", "Mobile Change के लिए Email OTP भेजें", "Send Email OTP for Mobile Change")}</>}
                </button>
              )}

              {/* MOBILE OTP VERIFIED */}

              {mobileOTPVerified && (
                <div className="otp-success-text">
                  <CheckCircle className="btn-icon" size={16} /> {txt("Mobile change OTP verified", "Mobile change OTP verified", "Mobile change OTP verified")}
                </div>
              )}

              {/* MOBILE OTP BOX */}

              {mobileOTPSent &&
                !mobileOTPVerified && (
                  <div className="profile-otp-box">

                    <h3>
                      <Lock className="btn-icon" size={20} /> Mobile Change OTP
                    </h3>

                    <p>
                      {txt("તમારા હાલના registered Email (", "आपके वर्तमान पंजीकृत Email (", "Enter 6-digit OTP sent to your registered Email (")}
                      <strong>
                        {user.email}
                      </strong>
                      {txt(") પર આવેલ 6 અંકનો OTP નાખો.", ") पर आया 6 अंकों का OTP दर्ज करें।", ").")}
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      placeholder={txt("6 અંકનો OTP", "6 अंकों का OTP", "6-digit OTP")}
                      value={mobileOTP}
                      onChange={(e) => {
                        const value =
                          e.target.value.replace(
                            /\D/g,
                            ""
                          );

                        setMobileOTP(
                          value.substring(
                            0,
                            6
                          )
                        );

                        setMobileOTPVerified(
                          false
                        );

                        setMessage("");
                        setMessageType("");
                      }}
                    />

                    <button
                      type="button"
                      className="profile-verify-btn"
                      onClick={
                        verifyMobileOTP
                      }
                      disabled={
                        mobileOTPLoading ||
                        mobileOTP.length !== 6
                      }
                    >
                      {mobileOTPLoading
                        ? <><Loader2 className="spinner btn-icon" size={16} /> {txt("Verify થઈ રહ્યું છે...", "Verify हो रहा है...", "Verifying...")}</>
                        : <><CheckCircle className="btn-icon" size={16} /> {txt("Mobile OTP Verify કરો", "Mobile OTP Verify करें", "Verify Mobile OTP")}</>}
                    </button>
                  </div>
                )}
            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="profile-edit-field">
              <label>
                <Mail size={16} className="btn-icon" /> Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />

              {/* EMAIL OTP BUTTON */}

              {emailChanged && (
                <button
                  type="button"
                  className="profile-otp-btn"
                  onClick={() =>
                    sendProfileOTP(
                      "email"
                    )
                  }
                  disabled={
                    emailOTPLoading
                  }
                >
                  {emailOTPLoading
                    ? <><Loader2 className="spinner btn-icon" size={16} /> {txt("Registered Email પર OTP મોકલાઈ રહ્યો છે...", "Registered Email पर OTP भेजा जा रहा है...", "Sending OTP to registered Email...")}</>
                    : <><Mail className="btn-icon" size={16} /> {txt("Email Change માટે OTP મોકલો", "Email Change के लिए OTP भेजें", "Send OTP for Email Change")}</>}
                </button>
              )}

              {/* EMAIL OTP VERIFIED */}

              {emailOTPVerified && (
                <div className="otp-success-text">
                  <CheckCircle className="btn-icon" size={16} /> {txt("Email change OTP verified", "Email change OTP verified", "Email change OTP verified")}
                </div>
              )}

              {/* EMAIL OTP BOX */}

              {emailOTPSent &&
                !emailOTPVerified && (
                  <div className="profile-otp-box">

                    <h3>
                      <Lock className="btn-icon" size={20} /> Email Change OTP
                    </h3>

                    <p>
                      {txt("તમારા હાલના registered Email (", "आपके वर्तमान पंजीकृत Email (", "Enter 6-digit OTP sent to your registered Email (")}
                      <strong>
                        {user.email}
                      </strong>
                      {txt(") પર આવેલ 6 અંકનો OTP નાખો.", ") पर आया 6 अंकों का OTP दर्ज करें।", ").")}
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      placeholder={txt("6 અંકનો OTP", "6 अंकों का OTP", "6-digit OTP")}
                      value={emailOTP}
                      onChange={(e) => {
                        const value =
                          e.target.value.replace(
                            /\D/g,
                            ""
                          );

                        setEmailOTP(
                          value.substring(
                            0,
                            6
                          )
                        );

                        setEmailOTPVerified(
                          false
                        );

                        setMessage("");
                        setMessageType("");
                      }}
                    />

                    <button
                      type="button"
                      className="profile-verify-btn"
                      onClick={
                        verifyEmailOTP
                      }
                      disabled={
                        emailOTPLoading ||
                        emailOTP.length !== 6
                      }
                    >
                      {emailOTPLoading
                        ? <><Loader2 className="spinner btn-icon" size={16} /> {txt("Verify થઈ રહ્યું છે...", "Verify हो रहा है...", "Verifying...")}</>
                        : <><CheckCircle className="btn-icon" size={16} /> {txt("Email OTP Verify કરો", "Email OTP Verify करें", "Verify Email OTP")}</>}
                    </button>
                  </div>
                )}
            </div>

            {/* =================================================
                BIRTH DATE
            ================================================= */}

            <div className="profile-edit-field">
              <label>
                <Calendar size={16} className="btn-icon" /> {txt("જન્મ તારીખ", "जन्म तिथि", "Date of Birth")}
              </label>

              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>

            {/* =================================================
                STATE
            ================================================= */}

            <div className="profile-edit-field">
              <label>
                <Landmark size={16} className="btn-icon" /> {txt("રાજ્ય", "राज्य", "State")}
              </label>

              <select
                name="state"
                value={formData.state}
                onChange={(e) => {
                  const newState = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    state: newState,
                    customState: "",
                    city: newState === "OTHER" ? "OTHER" : "",
                    customCity: "",
                  }));
                }}
              >
                {stateList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>

              {formData.state === "OTHER" && (
                <div className="profile-custom-input-box">
                  <input
                    type="text"
                    name="customState"
                    placeholder={txt("તમારું રાજ્ય અથવા દેશ દાખલ કરો...", "अपना राज्य या देश दर्ज करें...", "Enter your state or country...")}
                    value={formData.customState}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            {/* =================================================
                CITY
            ================================================= */}

            <div className="profile-edit-field">
              <label>
                <MapPin size={16} className="btn-icon" /> {txt("શહેર / ગામ", "शहर / गांव", "City / Village")}
              </label>

              {formData.state !== "OTHER" && (
                <select
                  name="city"
                  value={formData.city}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      city: val,
                      customCity: val === "OTHER" ? prev.customCity : "",
                    }));
                  }}
                >
                  <option value="" disabled>
                    {txt("-- શહેર / ગામ પસંદ કરો --", "-- शहर / गांव चुनें --", "-- Select City / Village --")}
                  </option>
                  {cityList.map((c) => (
                    <option key={c.id} value={c.id === "OTHER" ? "OTHER" : c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}

              {(formData.city === "OTHER" || formData.state === "OTHER") && (
                <div className="profile-custom-input-box">
                  <input
                    type="text"
                    name="customCity"
                    placeholder={txt("તમારું શહેર અથવા ગામ દાખલ કરો...", "अपना शहर या गांव दर्ज करें...", "Enter your city or village...")}
                    value={formData.customCity}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            {/* =================================================
                CURRENT PASSWORD
            ================================================= */}

            <div className="profile-edit-field">
              <label>
                <Key size={16} className="btn-icon" /> Current Password
              </label>

<div className="password-input-container">

  <input
    type={
      showCurrentPassword
        ? "text"
        : "password"
    }
    name="currentPassword"
    placeholder={txt("Password બદલવો હોય તો", "Password बदलना हो तो", "To change password")}
    value={
      formData.currentPassword
    }
    onChange={handleChange}
    autoComplete="current-password"
  />

  <button
    type="button"
    className="password-toggle-button"
    onClick={() =>
      setShowCurrentPassword(
        (previous) => !previous
      )
    }
    aria-label={
      showCurrentPassword
        ? txt("Current Password સંતાડો", "Current Password छिपाएं", "Hide Current Password")
        : txt("Current Password બતાવો", "Current Password दिखाएं", "Show Current Password")
    }
    title={
      showCurrentPassword
        ? txt("Current Password સંતાડો", "Current Password छिपाएं", "Hide Current Password")
        : txt("Current Password બતાવો", "Current Password दिखाएं", "Show Current Password")
    }
  >
    {showCurrentPassword ? (
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
                NEW PASSWORD
            ================================================= */}

            <div className="profile-edit-field">
              <label>
                <Lock size={16} className="btn-icon" /> New Password
              </label>

<div className="password-input-container">

  <input
    type={
      showNewPassword
        ? "text"
        : "password"
    }
    name="newPassword"
    placeholder={txt("નવો Password", "नया Password", "New Password")}
    value={
      formData.newPassword
    }
    onChange={handleChange}
    autoComplete="new-password"
  />

  <button
    type="button"
    className="password-toggle-button"
    onClick={() =>
      setShowNewPassword(
        (previous) => !previous
      )
    }
    aria-label={
      showNewPassword
        ? txt("New Password સંતાડો", "New Password छिपाएं", "Hide New Password")
        : txt("New Password બતાવો", "New Password दिखाएं", "Show New Password")
    }
    title={
      showNewPassword
        ? txt("New Password સંતાડો", "New Password छिपाएं", "Hide New Password")
        : txt("New Password બતાવો", "New Password दिखाएं", "Show New Password")
    }
  >
    {showNewPassword ? (
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

              {/* =================================================
                  FORGOT PASSWORD LINK
              ================================================= */}

              <button
                type="button"
                className="profile-forgot-password-link"
                onClick={
                  handleForgotPassword
                }
              >
                <Unlock className="btn-icon" size={16} /> {txt("Password ભૂલી ગયા છો?", "Password भूल गए हैं?", "Forgot Password?")}
              </button>
            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="profile-edit-actions">

              <button
                type="button"
                className="profile-save-btn"
                onClick={handleSave}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="spinner btn-icon" size={18} /> {txt("સેવ થઈ રહ્યું છે...", "सहेजा जा रहा है...", "Saving...")}</>
                  : <><Save className="btn-icon" size={18} /> {txt("Save Changes", "बदलाव सहेजें", "Save Changes")}</>}
              </button>

              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="btn-icon" size={18} /> {txt("Cancel", "रद्द करें", "Cancel")}
              </button>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Profile;