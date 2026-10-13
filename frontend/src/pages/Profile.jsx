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
  Loader2
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isHindi } = useLanguage();

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
    currentPassword: "",
    newPassword: "",
  });

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
            data.message || (isHindi ? "प्रोफ़ाइल नहीं मिली।" : "Profile મળ્યું નથી.")
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
            isHindi ? "Profile प्राप्त करने में समस्या आई।" : "Profile મેળવવામાં સમસ્યા આવી."
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

    setFormData({
      name: user.name || "",
      mobile: user.mobile || "",
      email: user.email || "",
      birthDate: user.birthDate
        ? new Date(user.birthDate)
            .toISOString()
            .split("T")[0]
        : "",
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
          ? (isHindi ? "Email ID दर्ज करें।" : "Email ID નાખો.")
          : (isHindi ? "Mobile Number दर्ज करें।" : "Mobile Number નાખો.")
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
      setMessage(isHindi ? "मान्य Email ID दर्ज करें।" : "યોગ્ય Email ID નાખો.");
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
        isHindi ? "मान्य 10 अंकों का Mobile Number दर्ज करें।" : "યોગ્ય 10 અંકનો Mobile Number નાખો."
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
            isHindi ? "OTP नहीं भेजा जा सका।" : "OTP મોકલી શકાયો નથી."
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
          isHindi ? `Email बदलने के लिए OTP आपके वर्तमान पंजीकृत Email (${user.email}) पर भेजा गया है। ✉️` : `Email change માટે OTP તમારા હાલના registered Email (${user.email}) પર મોકલવામાં આવ્યો છે. ✉️`
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
          isHindi ? `Mobile Number बदलने के लिए OTP आपके वर्तमान पंजीकृत Email (${user.email}) पर भेजा गया है। ✉️` : `Mobile Number change માટે OTP તમારા હાલના registered Email (${user.email}) પર મોકલવામાં આવ્યો છે. ✉️`
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
          isHindi ? "OTP भेजने में समस्या आई।" : "OTP મોકલવામાં સમસ્યા આવી."
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
        isHindi ? "कृपया Email OTP दर्ज करें।" : "કૃપા કરીને Email OTP નાખો."
      );

      setMessageType("error");
      return;
    }

    if (!/^[0-9]{6}$/.test(cleanOTP)) {
      setMessage(
        isHindi ? "6 अंकों का मान्य Email OTP दर्ज करें।" : "6 અંકનો યોગ્ય Email OTP નાખો."
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
        isHindi ? "Email ID आवश्यक है।" : "Email ID જરૂરી છે."
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
            isHindi ? "Email OTP verify नहीं हो सका।" : "Email OTP verify થઈ શક્યો નથી."
        );
      }

      if (data.verified !== true) {
        throw new Error(
          isHindi ? "OTP verify नहीं हुआ।" : isHindi ? "OTP verify नहीं हुआ।" : "OTP verify થયું નથી."
        );
      }

      setEmailOTP(cleanOTP);
      setEmailOTPVerified(true);

      setMessage(
        isHindi ? "Email OTP सफलतापूर्वक verify हो गया है। ✅" : "Email OTP successfully verify થઈ ગયો છે. ✅"
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
          isHindi ? "Email OTP verification में समस्या आई।" : "Email OTP verificationમાં સમસ્યા આવી."
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
        isHindi ? "कृपया Mobile OTP दर्ज करें।" : "કૃપા કરીને Mobile OTP નાખો."
      );

      setMessageType("error");
      return;
    }

    if (!/^[0-9]{6}$/.test(cleanOTP)) {
      setMessage(
        isHindi ? "6 अंकों का मान्य Mobile OTP दर्ज करें।" : "6 અંકનો યોગ્ય Mobile OTP નાખો."
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
        isHindi ? "Mobile Number आवश्यक है।" : "Mobile Number જરૂરી છે."
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
            isHindi ? "Mobile OTP verify नहीं हो सका।" : "Mobile OTP verify થઈ શક્યો નથી."
        );
      }

      if (data.verified !== true) {
        throw new Error(
          isHindi ? "OTP verify नहीं हुआ।" : "OTP verify થયું નથી."
        );
      }

      setMobileOTP(cleanOTP);
      setMobileOTPVerified(true);

      setMessage(
        isHindi ? "Mobile बदलने के लिए Email OTP सफलतापूर्वक verify हो गया है। ✅" : "Mobile change માટે Email OTP successfully verify થઈ ગયો છે. ✅"
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
          isHindi ? "Mobile OTP verification में समस्या आई।" : "Mobile OTP verificationમાં સમસ્યા આવી."
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
        isHindi ? "Email बदलने के लिए पहले अपने वर्तमान पंजीकृत Email पर आया OTP verify करें।" : "Email બદલવા માટે પહેલા તમારા હાલના registered Email પર આવેલ OTP verify કરો."
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
        isHindi ? "Mobile Number बदलने के लिए पहले अपने वर्तमान पंजीकृत Email पर आया OTP verify करें।" : "Mobile Number બદલવા માટે પહેલા તમારા હાલના registered Email પર આવેલ OTP verify કરો."
      );

      setMessageType("error");
      return;
    }

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
            isHindi ? "Profile update नहीं हो सकी।" : "Profile update થઈ શક્યું નથી."
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
        isHindi ? "Profile सफलतापूर्वक update हो गई है। ✅" : "Profile સફળતાપૂર્વક update થઈ ગઈ છે. ✅"
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "❌ Update Profile Error:",
        error
      );

      setMessage(
        error.message ||
          isHindi ? "Profile update करने में समस्या आई।" : "Profile update કરવામાં સમસ્યા આવી."
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
      isHindi ? "क्या आप वाकई Logout करना चाहते हैं?" : "શું તમે ખરેખર Logout કરવા માંગો છો?"
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
            {message || (isHindi ? "लोड हो रहा है..." : "લોડ થઈ રહ્યું છે...")}
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
          {isHindi ? "मेरी Profile" : "મારું Profile"}
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
                <span>{isHindi ? "नाम" : "નામ"}</span>

                <strong>
                  {user.name}
                </strong>
              </div>

              {/* MOBILE */}

              <div className="profile-row">
                <span>Mobile</span>

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
                  Birth Date
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
                  {isHindi ? "Account बनाया" : "Account બનાવ્યું"}
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
              <Edit2 className="btn-icon" size={18} /> Edit Profile
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
                <User size={16} className="btn-icon" /> {isHindi ? "नाम" : "નામ"}
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
                <Phone size={16} className="btn-icon" /> Mobile Number
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
                    ? <><Loader2 className="spinner btn-icon" size={16} /> {isHindi ? "Email पर OTP भेजा जा रहा है..." : "Email પર OTP મોકલાઈ રહ્યો છે..."}</>
                    : <><Smartphone className="btn-icon" size={16} /> {isHindi ? "Mobile Change के लिए Email OTP भेजें" : "Mobile Change માટે Email OTP મોકલો"}</>}
                </button>
              )}

              {/* MOBILE OTP VERIFIED */}

              {mobileOTPVerified && (
                <div className="otp-success-text">
                  <CheckCircle className="btn-icon" size={16} /> Mobile change OTP verified
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
                      {isHindi ? "आपके वर्तमान पंजीकृत Email (" : "તમારા હાલના registered Email ("}
                      <strong>
                        {user.email}
                      </strong>
                      {isHindi ? ") पर आया 6 अंकों का OTP दर्ज करें।" : ") પર આવેલ 6 અંકનો OTP નાખો."}
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      placeholder={isHindi ? "6 अंकों का OTP" : "6 અંકનો OTP"}
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
                        ? <><Loader2 className="spinner btn-icon" size={16} /> {isHindi ? "Verify हो रहा है..." : "Verify થઈ રહ્યું છે..."}</>
                        : <><CheckCircle className="btn-icon" size={16} /> {isHindi ? "Mobile OTP Verify करें" : "Mobile OTP Verify કરો"}</>}
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
                    ? <><Loader2 className="spinner btn-icon" size={16} /> {isHindi ? "Registered Email पर OTP भेजा जा रहा है..." : "Registered Email પર OTP મોકલાઈ રહ્યો છે..."}</>
                    : <><Mail className="btn-icon" size={16} /> {isHindi ? "Email Change के लिए OTP भेजें" : "Email Change માટે OTP મોકલો"}</>}
                </button>
              )}

              {/* EMAIL OTP VERIFIED */}

              {emailOTPVerified && (
                <div className="otp-success-text">
                  <CheckCircle className="btn-icon" size={16} /> Email change OTP verified
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
                      {isHindi ? "आपके वर्तमान पंजीकृत Email (" : "તમારા હાલના registered Email ("}
                      <strong>
                        {user.email}
                      </strong>
                      {isHindi ? ") पर आया 6 अंकों का OTP दर्ज करें।" : ") પર આવેલ 6 અંકનો OTP નાખો."}
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      placeholder={isHindi ? "6 अंकों का OTP" : "6 અંકનો OTP"}
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
                        ? <><Loader2 className="spinner btn-icon" size={16} /> {isHindi ? "Verify हो रहा है..." : "Verify થઈ રહ્યું છે..."}</>
                        : <><CheckCircle className="btn-icon" size={16} /> {isHindi ? "Email OTP Verify करें" : "Email OTP Verify કરો"}</>}
                    </button>
                  </div>
                )}
            </div>

            {/* =================================================
                BIRTH DATE
            ================================================= */}

            <div className="profile-edit-field">
              <label>
                <Calendar size={16} className="btn-icon" /> Birth Date
              </label>

              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
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
    placeholder={isHindi ? "Password बदलना हो तो" : "Password બદલવો હોય તો"}
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
        ? (isHindi ? "Current Password छिपाएं" : "Current Password hide કરો")
        : (isHindi ? "Current Password दिखाएं" : "Current Password show કરો")
    }
    title={
      showCurrentPassword
        ? (isHindi ? "Current Password छिपाएं" : "Current Password hide કરો")
        : (isHindi ? "Current Password दिखाएं" : "Current Password show કરો")
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
    placeholder={isHindi ? "नया Password" : "નવો Password"}
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
        ? (isHindi ? "New Password छिपाएं" : "New Password hide કરો")
        : (isHindi ? "New Password दिखाएं" : "New Password show કરો")
    }
    title={
      showNewPassword
        ? (isHindi ? "New Password छिपाएं" : "New Password hide કરો")
        : (isHindi ? "New Password दिखाएं" : "New Password show કરો")
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
                <Unlock className="btn-icon" size={16} /> {isHindi ? "Password भूल गए हैं?" : "Password ભૂલી ગયા છો?"}
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
                  ? <><Loader2 className="spinner btn-icon" size={18} /> {isHindi ? "सहेजा जा रहा है..." : "સેવ થઈ રહ્યું છે..."}</>
                  : <><Save className="btn-icon" size={18} /> {isHindi ? "बदलाव सहेजें" : "Save Changes"}</>}
              </button>

              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="btn-icon" size={18} /> Cancel
              </button>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Profile;