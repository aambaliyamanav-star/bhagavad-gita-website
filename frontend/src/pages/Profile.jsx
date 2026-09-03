import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
  // API URL
  // =====================================================

  const API_URL = "http://localhost:5000/api/auth";

  // =====================================================
  // GET PROFILE
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
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
          throw new Error(
            data.message || "Profile મળ્યું નથી."
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
            "Profile મેળવવામાં સમસ્યા આવી."
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
          ? "Email ID નાખો."
          : "Mobile Number નાખો."
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
      setMessage("યોગ્ય Email ID નાખો.");
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
        "યોગ્ય 10 અંકનો Mobile Number નાખો."
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
            "OTP મોકલી શકાયો નથી."
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
          `Email change માટે OTP તમારા હાલના registered Email (${user.email}) પર મોકલવામાં આવ્યો છે. ✉️`
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
          `Mobile Number change માટે OTP તમારા હાલના registered Email (${user.email}) પર મોકલવામાં આવ્યો છે. ✉️`
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
          "OTP મોકલવામાં સમસ્યા આવી."
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
        "કૃપા કરીને Email OTP નાખો."
      );

      setMessageType("error");
      return;
    }

    if (!/^[0-9]{6}$/.test(cleanOTP)) {
      setMessage(
        "6 અંકનો યોગ્ય Email OTP નાખો."
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
        "Email ID જરૂરી છે."
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
            "Email OTP verify થઈ શક્યો નથી."
        );
      }

      if (data.verified !== true) {
        throw new Error(
          "OTP verify થયું નથી."
        );
      }

      setEmailOTP(cleanOTP);
      setEmailOTPVerified(true);

      setMessage(
        "Email OTP successfully verify થઈ ગયો છે. ✅"
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
          "Email OTP verificationમાં સમસ્યા આવી."
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
        "કૃપા કરીને Mobile OTP નાખો."
      );

      setMessageType("error");
      return;
    }

    if (!/^[0-9]{6}$/.test(cleanOTP)) {
      setMessage(
        "6 અંકનો યોગ્ય Mobile OTP નાખો."
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
        "Mobile Number જરૂરી છે."
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
            "Mobile OTP verify થઈ શક્યો નથી."
        );
      }

      if (data.verified !== true) {
        throw new Error(
          "OTP verify થયું નથી."
        );
      }

      setMobileOTP(cleanOTP);
      setMobileOTPVerified(true);

      setMessage(
        "Mobile change માટે Email OTP successfully verify થઈ ગયો છે. ✅"
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
          "Mobile OTP verificationમાં સમસ્યા આવી."
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
        "Email બદલવા માટે પહેલા તમારા હાલના registered Email પર આવેલ OTP verify કરો."
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
        "Mobile Number બદલવા માટે પહેલા તમારા હાલના registered Email પર આવેલ OTP verify કરો."
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
            "Profile update થઈ શક્યું નથી."
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
        "Profile સફળતાપૂર્વક update થઈ ગઈ છે. ✅"
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "❌ Update Profile Error:",
        error
      );

      setMessage(
        error.message ||
          "Profile update કરવામાં સમસ્યા આવી."
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
      "શું તમે ખરેખર Logout કરવા માંગો છો?"
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
            {message || "Loading..."}
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
          👤
        </div>

        <h1>
          મારું Profile 🙏
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
                <span>નામ</span>

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
                    ? "🛡️ Admin"
                    : "👤 User"}
                </span>
              </div>

              {/* CREATED DATE */}

              <div className="profile-row">
                <span>
                  Account બનાવ્યું
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
              ✏️ Edit Profile
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
                🛡️ Admin Panel
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
              🚪 Logout
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
                👤 નામ
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
                📞 Mobile Number
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
                    ? "Email પર OTP મોકલાઈ રહ્યો છે..."
                    : "📱 Mobile Change માટે Email OTP મોકલો"}
                </button>
              )}

              {/* MOBILE OTP VERIFIED */}

              {mobileOTPVerified && (
                <div className="otp-success-text">
                  ✅ Mobile change OTP verified
                </div>
              )}

              {/* MOBILE OTP BOX */}

              {mobileOTPSent &&
                !mobileOTPVerified && (
                  <div className="profile-otp-box">

                    <h3>
                      🔐 Mobile Change OTP
                    </h3>

                    <p>
                      તમારા હાલના registered
                      Email (
                      <strong>
                        {user.email}
                      </strong>
                      ) પર આવેલ 6 અંકનો OTP નાખો.
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      placeholder="6 અંકનો OTP"
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
                        ? "Verify થઈ રહ્યું છે..."
                        : "✓ Mobile OTP Verify કરો"}
                    </button>
                  </div>
                )}
            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="profile-edit-field">
              <label>
                ✉️ Email
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
                    ? "Registered Email પર OTP મોકલાઈ રહ્યો છે..."
                    : "✉️ Email Change માટે OTP મોકલો"}
                </button>
              )}

              {/* EMAIL OTP VERIFIED */}

              {emailOTPVerified && (
                <div className="otp-success-text">
                  ✅ Email change OTP verified
                </div>
              )}

              {/* EMAIL OTP BOX */}

              {emailOTPSent &&
                !emailOTPVerified && (
                  <div className="profile-otp-box">

                    <h3>
                      🔐 Email Change OTP
                    </h3>

                    <p>
                      તમારા હાલના registered
                      Email (
                      <strong>
                        {user.email}
                      </strong>
                      ) પર આવેલ 6 અંકનો OTP નાખો.
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      placeholder="6 અંકનો OTP"
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
                        ? "Verify થઈ રહ્યું છે..."
                        : "✓ Email OTP Verify કરો"}
                    </button>
                  </div>
                )}
            </div>

            {/* =================================================
                BIRTH DATE
            ================================================= */}

            <div className="profile-edit-field">
              <label>
                🎂 Birth Date
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
                🔑 Current Password
              </label>

              <input
                type="password"
                name="currentPassword"
                placeholder="Password બદલવો હોય તો"
                value={
                  formData.currentPassword
                }
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            {/* =================================================
                NEW PASSWORD
            ================================================= */}

            <div className="profile-edit-field">
              <label>
                🔒 New Password
              </label>

              <input
                type="password"
                name="newPassword"
                placeholder="નવો Password"
                value={
                  formData.newPassword
                }
                onChange={handleChange}
                autoComplete="new-password"
              />

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
                🔐 Password ભૂલી ગયા છો?
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
                  ? "Saving..."
                  : "💾 Save Changes"}
              </button>

              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                ✕ Cancel
              </button>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Profile;