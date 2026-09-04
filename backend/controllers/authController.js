const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// =====================================================
// TEMPORARY OTP STORAGE
// =====================================================

const otpStore = new Map();

// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// =====================================================
// GENERATE 6 DIGIT OTP
// =====================================================

const generateOTP = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

// =====================================================
// SEND PROFILE EMAIL OTP
// =====================================================

const sendProfileEmailOTP = async (
  user,
  otp,
  type
) => {
  await transporter.sendMail({
    from:
      `"Bhagavad Gita" <${process.env.EMAIL_USER}>`,

    to: user.email,

    subject:
      "Bhagavad Gita - Profile Update OTP",

    html: `
      <!DOCTYPE html>

      <html>

      <head>
        <meta charset="UTF-8" />
        <title>Profile Update OTP</title>
      </head>

      <body style="
        margin:0;
        padding:0;
        background:#f5efe6;
        font-family:Arial,sans-serif;
      ">

        <div style="
          max-width:600px;
          margin:30px auto;
          background:#ffffff;
          border-radius:16px;
          overflow:hidden;
          box-shadow:0 5px 20px rgba(0,0,0,0.12);
        ">

          <div style="
            background:linear-gradient(
              135deg,
              #8b4513,
              #d35400
            );
            padding:30px;
            text-align:center;
            color:white;
          ">

            <div style="font-size:45px;">
              ॐ
            </div>

            <h1 style="margin:10px 0;">
              Bhagavad Gita
            </h1>

            <p>
              Profile Update Verification
            </p>

          </div>

          <div style="
            padding:30px;
            text-align:center;
          ">

            <h2>
              Namaste ${user.name} 🙏
            </h2>

            <p>
              તમારા Profile માં
              ${
                type === "email"
                  ? "Email"
                  : "Mobile Number"
              }
              બદલવા માટે OTP:
            </p>

            <div style="
              display:inline-block;
              margin:20px 0;
              padding:18px 30px;
              background:#fff3e0;
              border:2px dashed #d35400;
              border-radius:12px;
            ">

              <span style="
                font-size:34px;
                font-weight:bold;
                letter-spacing:8px;
                color:#d35400;
              ">
                ${otp}
              </span>

            </div>

            <p>
              આ OTP
              <strong>10 મિનિટ</strong>
              માટે valid છે.
            </p>

            <p style="
              color:#777;
              font-size:14px;
            ">
              જો તમે Profile update
              request કરી નથી,
              તો આ emailને ignore કરો.
            </p>

            <hr style="
              border:none;
              border-top:1px solid #eee;
              margin:25px 0;
            " />

            <p style="
              color:#8b4513;
              font-size:18px;
            ">
              ॥ श्रीमद्भगवद्गीता ॥
            </p>

          </div>

        </div>

      </body>

      </html>
    `,
  });
};

// =====================================================
// GENERIC PROFILE OTP KEY
// =====================================================

const getProfileOTPKey = (
  userId,
  type
) => {
  return `profile_${userId.toString()}_${type}`;
};

// =====================================================
// FORGOT PASSWORD OTP KEY
// =====================================================

const getForgotPasswordOTPKey = (
  email
) => {
  return `forgot_password_${email}`;
};

// =====================================================
// SEND EMAIL OTP
// POST /api/auth/send-otp
// =====================================================

const sendOTP = async (
  req,
  res
) => {
  try {

    const {
      name,
      mobile,
      email,
      birthDate,
    } = req.body;

    // =================================================
    // REQUIRED FIELDS
    // =================================================

    if (
      !name ||
      !mobile ||
      !email ||
      !birthDate
    ) {
      return res.status(400).json({
        message:
          "બધી માહિતી ભરવી જરૂરી છે.",
      });
    }

    // =================================================
    // CLEAN DATA
    // =================================================

    const cleanName =
      name.trim();

    const cleanMobile =
      mobile.trim();

    const cleanEmail =
      email
        .toLowerCase()
        .trim();

    // =================================================
    // VALIDATE MOBILE
    // =================================================

    if (
      !/^[0-9]{10}$/.test(
        cleanMobile
      )
    ) {
      return res.status(400).json({
        message:
          "યોગ્ય 10 અંકનો Mobile Number નાખો.",
      });
    }

    // =================================================
    // VALIDATE EMAIL
    // =================================================

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      return res.status(400).json({
        message:
          "યોગ્ય Email ID નાખો.",
      });
    }

    // =================================================
    // VALIDATE BIRTH DATE
    // =================================================

    const parsedBirthDate =
      new Date(birthDate);

    if (
      Number.isNaN(
        parsedBirthDate.getTime()
      )
    ) {
      return res.status(400).json({
        message:
          "યોગ્ય Birth Date નાખો.",
      });
    }

    // =================================================
    // CHECK EXISTING EMAIL
    // =================================================

    const existingEmail =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingEmail) {
      return res.status(400).json({
        message:
          "આ Email પહેલેથી register થયેલ છે.",
      });
    }

    // =================================================
    // CHECK EXISTING MOBILE
    // =================================================

    const existingMobile =
      await User.findOne({
        mobile: cleanMobile,
      });

    if (existingMobile) {
      return res.status(400).json({
        message:
          "આ Mobile Number પહેલેથી register થયેલ છે.",
      });
    }

    // =================================================
    // GENERATE OTP
    // =================================================

    const otp =
      generateOTP();

    // =================================================
    // OTP EXPIRY
    // =================================================

    const expiresAt =
      Date.now() +
      10 * 60 * 1000;

    // =================================================
    // STORE OTP
    // =================================================

    otpStore.set(
      cleanEmail,
      {
        otp,
        expiresAt,
        verified: false,
        name: cleanName,
        mobile: cleanMobile,
        birthDate:
          parsedBirthDate,
      }
    );

    // =================================================
    // SEND REGISTRATION OTP
    // =================================================

    await transporter.sendMail({
      from:
        `"Bhagavad Gita" <${process.env.EMAIL_USER}>`,

      to:
        cleanEmail,

      subject:
        "Bhagavad Gita - Email Verification OTP",

      html: `
        <!DOCTYPE html>

        <html>

        <head>
          <meta charset="UTF-8" />
          <title>Bhagavad Gita OTP</title>
        </head>

        <body style="
          margin:0;
          padding:0;
          background:#f5efe6;
          font-family:Arial,sans-serif;
        ">

          <div style="
            max-width:600px;
            margin:30px auto;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 5px 20px rgba(0,0,0,0.12);
          ">

            <div style="
              background:linear-gradient(
                135deg,
                #8b4513,
                #d35400
              );
              padding:30px;
              text-align:center;
              color:white;
            ">

              <div style="font-size:45px;">
                ॐ
              </div>

              <h1>
                Bhagavad Gita
              </h1>

              <p>
                Email Verification
              </p>

            </div>

            <div style="
              padding:30px;
              text-align:center;
            ">

              <h2>
                Namaste ${cleanName} 🙏
              </h2>

              <p>
                તમારા Bhagavad Gita account
                માટે Email verification OTP છે:
              </p>

              <div style="
                display:inline-block;
                margin:20px 0;
                padding:18px 30px;
                background:#fff3e0;
                border:2px dashed #d35400;
                border-radius:12px;
              ">

                <span style="
                  font-size:34px;
                  font-weight:bold;
                  letter-spacing:8px;
                  color:#d35400;
                ">
                  ${otp}
                </span>

              </div>

              <p>
                આ OTP
                <strong>10 મિનિટ</strong>
                માટે valid છે.
              </p>

              <p style="
                color:#777;
                font-size:14px;
              ">
                જો તમે registration કર્યું નથી,
                તો આ emailને ignore કરો.
              </p>

              <hr style="
                border:none;
                border-top:1px solid #eee;
                margin:25px 0;
              " />

              <p style="
                color:#8b4513;
                font-size:18px;
              ">
                ॥ श्रीमद्भगवद्गीता ॥
              </p>

            </div>

          </div>

        </body>

        </html>
      `,
    });

    return res.status(200).json({
      message:
        "તમારા Email પર OTP મોકલવામાં આવ્યો છે.",
    });

  } catch (error) {

    console.error(
      "❌ Send OTP Error:",
      error
    );

    return res.status(500).json({
      message:
        "OTP મોકલવામાં સમસ્યા આવી.",
      error:
        error.message,
    });
  }
};

// =====================================================
// VERIFY REGISTRATION OTP
// POST /api/auth/verify-otp
// =====================================================

const verifyOTP = async (
  req,
  res
) => {
  try {

    const {
      email,
      otp,
    } = req.body;

    if (
      !email ||
      !otp
    ) {
      return res.status(400).json({
        message:
          "Email અને OTP જરૂરી છે.",
      });
    }

    const cleanEmail =
      email
        .toLowerCase()
        .trim();

    const cleanOTP =
      otp
        .toString()
        .trim();

    if (
      !/^[0-9]{6}$/.test(
        cleanOTP
      )
    ) {
      return res.status(400).json({
        message:
          "6 અંકનો યોગ્ય OTP નાખો.",
      });
    }

    const storedOTP =
      otpStore.get(
        cleanEmail
      );

    if (!storedOTP) {
      return res.status(400).json({
        message:
          "OTP મળ્યો નથી. ફરીથી OTP મોકલો.",
      });
    }

    if (
      Date.now() >
      storedOTP.expiresAt
    ) {

      otpStore.delete(
        cleanEmail
      );

      return res.status(400).json({
        message:
          "OTP expire થઈ ગયો છે. ફરીથી OTP મોકલો.",
      });
    }

    if (
      storedOTP.otp !==
      cleanOTP
    ) {
      return res.status(400).json({
        message:
          "OTP ખોટો છે. કૃપા કરીને ફરી તપાસો.",
      });
    }

    otpStore.set(
      cleanEmail,
      {
        ...storedOTP,
        verified: true,
      }
    );

    return res.status(200).json({
      message:
        "OTP successfully verify થઈ ગયો છે.",
    });

  } catch (error) {

    console.error(
      "❌ Verify OTP Error:",
      error
    );

    return res.status(500).json({
      message:
        "OTP verificationમાં સમસ્યા આવી.",
      error:
        error.message,
    });
  }
};

// =====================================================
// REGISTER USER
// POST /api/auth/register
// =====================================================

const registerUser = async (
  req,
  res
) => {
  try {

    const {
      name,
      mobile,
      email,
      birthDate,
      password,
      otp,
    } = req.body;

    if (
      !name ||
      !mobile ||
      !email ||
      !birthDate ||
      !password ||
      !otp
    ) {
      return res.status(400).json({
        message:
          "બધી માહિતી ભરવી જરૂરી છે.",
      });
    }

    const cleanName =
      name.trim();

    const cleanMobile =
      mobile.trim();

    const cleanEmail =
      email
        .toLowerCase()
        .trim();

    const cleanOTP =
      otp
        .toString()
        .trim();

    const storedOTP =
      otpStore.get(
        cleanEmail
      );

    if (!storedOTP) {
      return res.status(400).json({
        message:
          "OTP verification જરૂરી છે.",
      });
    }

    if (
      storedOTP.verified !==
      true
    ) {
      return res.status(400).json({
        message:
          "પહેલા OTP verify કરો.",
      });
    }

    if (
      Date.now() >
      storedOTP.expiresAt
    ) {

      otpStore.delete(
        cleanEmail
      );

      return res.status(400).json({
        message:
          "OTP expire થઈ ગયો છે. ફરીથી OTP મોકલો.",
      });
    }

    if (
      storedOTP.otp !==
      cleanOTP
    ) {
      return res.status(400).json({
        message:
          "OTP ખોટો છે.",
      });
    }

    const existingEmail =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingEmail) {
      return res.status(400).json({
        message:
          "આ Email પહેલેથી register થયેલ છે.",
      });
    }

    const existingMobile =
      await User.findOne({
        mobile: cleanMobile,
      });

    if (existingMobile) {
      return res.status(400).json({
        message:
          "આ Mobile Number પહેલેથી register થયેલ છે.",
      });
    }

    if (
      password.length < 6
    ) {
      return res.status(400).json({
        message:
          "Password ઓછામાં ઓછો 6 charactersનો હોવો જોઈએ.",
      });
    }

    const parsedBirthDate =
      new Date(
        birthDate
      );

    if (
      Number.isNaN(
        parsedBirthDate.getTime()
      )
    ) {
      return res.status(400).json({
        message:
          "યોગ્ય Birth Date જરૂરી છે.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name:
          cleanName,

        mobile:
          cleanMobile,

        email:
          cleanEmail,

        birthDate:
          parsedBirthDate,

        password:
          hashedPassword,

        role:
          "user",
      });

    otpStore.delete(
      cleanEmail
    );

    return res.status(201).json({
      message:
        "Registration સફળ થયું ✅",

      user: {
        id:
          user._id,

        name:
          user.name,

        mobile:
          user.mobile,

        email:
          user.email,

        birthDate:
          user.birthDate,

        role:
          user.role,
      },
    });

  } catch (error) {

    console.error(
      "❌ Register Error:",
      error
    );

    return res.status(500).json({
      message:
        "Registration દરમિયાન error આવ્યો.",

      error:
        error.message,
    });
  }
};

// =====================================================
// LOGIN USER
// POST /api/auth/login
// =====================================================

const loginUser = async (
  req,
  res
) => {
  try {

    const {
      email,
      password,
    } = req.body;

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Email અને password જરૂરી છે.",
      });
    }

    const cleanEmail =
      email
        .toLowerCase()
        .trim();

    const user =
      await User.findOne({
        email:
          cleanEmail,
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Email અથવા password ખોટો છે.",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (
      !isPasswordCorrect
    ) {
      return res.status(401).json({
        message:
          "Email અથવા password ખોટો છે.",
      });
    }

    const token =
      jwt.sign(
        {
          userId:
            user._id,

          role:
            user.role,
        },

        process.env.JWT_SECRET,

        {
          expiresIn:
            "7d",
        }
      );

    return res.status(200).json({
      message:
        "Login સફળ થયું ✅",

      token,

      user: {
        id:
          user._id,

        name:
          user.name,

        mobile:
          user.mobile,

        email:
          user.email,

        birthDate:
          user.birthDate,

        role:
          user.role,
      },
    });

  } catch (error) {

    console.error(
      "❌ Login Error:",
      error
    );

    return res.status(500).json({
      message:
        "Login દરમિયાન error આવ્યો.",

      error:
        error.message,
    });
  }
};

// =====================================================
// GET PROFILE
// GET /api/auth/profile
// =====================================================

const getProfile = async (
  req,
  res
) => {
  try {

    const user =
      await User.findById(
        req.userId
      ).select(
        "-password"
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User મળ્યો નથી.",
      });
    }

    return res.status(200).json({
      user,
    });

  } catch (error) {

    console.error(
      "❌ Profile Error:",
      error
    );

    return res.status(500).json({
      message:
        "Profile મેળવવામાં error આવ્યો.",
    });
  }
};

// =====================================================
// SEND PROFILE UPDATE OTP
// POST /api/auth/profile/send-otp
// LOGIN REQUIRED
// =====================================================

const sendProfileOTP = async (
  req,
  res
) => {
  try {

    const {
      type,
      value,
    } = req.body;

    if (
      !type ||
      !value
    ) {
      return res.status(400).json({
        message:
          "OTP type અને value જરૂરી છે.",
      });
    }

    if (
      type !== "email" &&
      type !== "mobile"
    ) {
      return res.status(400).json({
        message:
          "Invalid OTP type.",
      });
    }

    const user =
      await User.findById(
        req.userId
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User મળ્યો નથી.",
      });
    }

    let cleanValue =
      value
        .toString()
        .trim();

    if (
      type === "email"
    ) {
      cleanValue =
        cleanValue
          .toLowerCase();
    }

    if (
      type === "email"
    ) {

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          cleanValue
        )
      ) {
        return res.status(400).json({
          message:
            "યોગ્ય Email ID નાખો.",
        });
      }

      const existingEmail =
        await User.findOne({
          email:
            cleanValue,

          _id: {
            $ne:
              req.userId,
          },
        });

      if (existingEmail) {
        return res.status(400).json({
          message:
            "આ Email બીજા accountમાં ઉપયોગમાં છે.",
        });
      }
    }

    if (
      type === "mobile"
    ) {

      if (
        !/^[0-9]{10}$/.test(
          cleanValue
        )
      ) {
        return res.status(400).json({
          message:
            "યોગ્ય 10 અંકનો Mobile Number નાખો.",
        });
      }

      const existingMobile =
        await User.findOne({
          mobile:
            cleanValue,

          _id: {
            $ne:
              req.userId,
          },
        });

      if (existingMobile) {
        return res.status(400).json({
          message:
            "આ Mobile Number બીજા accountમાં ઉપયોગમાં છે.",
        });
      }
    }

    const otp =
      generateOTP();

    const expiresAt =
      Date.now() +
      10 * 60 * 1000;

    const otpKey =
      getProfileOTPKey(
        req.userId,
        type
      );

    otpStore.set(
      otpKey,
      {
        otp,
        expiresAt,
        verified: false,

        userId:
          req.userId.toString(),

        type,

        value:
          cleanValue,
      }
    );

    await sendProfileEmailOTP(
      user,
      otp,
      type
    );

    return res.status(200).json({
      message:
        type === "email"
          ? "તમારા હાલના registered Email પર Email change OTP મોકલવામાં આવ્યો છે."
          : "તમારા હાલના registered Email પર Mobile change OTP મોકલવામાં આવ્યો છે.",

      otpSent:
        true,
    });

  } catch (error) {

    console.error(
      "❌ Profile OTP Error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Profile update OTP મોકલવામાં સમસ્યા આવી.",
    });
  }
};

// =====================================================
// VERIFY PROFILE OTP
// POST /api/auth/profile/verify-otp
// LOGIN REQUIRED
// =====================================================

const verifyProfileOTP = async (
  req,
  res
) => {
  try {

    const {
      type,
      value,
      otp,
    } = req.body;

    if (
      !type ||
      !otp
    ) {
      return res.status(400).json({
        message:
          "OTP verification માટે Type અને OTP જરૂરી છે.",
      });
    }

    if (
      type !== "email" &&
      type !== "mobile"
    ) {
      return res.status(400).json({
        message:
          "Invalid OTP type.",
      });
    }

    const userId =
      req.userId.toString();

    const otpKey =
      getProfileOTPKey(
        userId,
        type
      );

    const storedOTP =
      otpStore.get(
        otpKey
      );

    if (!storedOTP) {

      console.log(
        "❌ Profile OTP Not Found:",
        otpKey
      );

      return res.status(400).json({
        message:
          "OTP મળ્યો નથી. પહેલા OTP મોકલો.",
      });
    }

    if (
      Date.now() >
      storedOTP.expiresAt
    ) {

      otpStore.delete(
        otpKey
      );

      return res.status(400).json({
        message:
          "OTP expire થઈ ગયો છે. ફરીથી OTP મોકલો.",
      });
    }

    const cleanOTP =
      otp
        .toString()
        .trim();

    if (
      !/^[0-9]{6}$/.test(
        cleanOTP
      )
    ) {
      return res.status(400).json({
        message:
          "6 અંકનો યોગ્ય OTP નાખો.",
      });
    }

    if (
      storedOTP.otp !==
      cleanOTP
    ) {

      return res.status(400).json({
        message:
          "OTP ખોટો છે. કૃપા કરીને ફરી તપાસો.",
      });
    }

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {

      let cleanValue =
        value
          .toString()
          .trim();

      if (
        type === "email"
      ) {
        cleanValue =
          cleanValue
            .toLowerCase();
      }

      if (
        storedOTP.value !==
        cleanValue
      ) {
        return res.status(400).json({
          message:
            type === "email"
              ? "આ OTP આ Email માટે નથી."
              : "આ OTP આ Mobile Number માટે નથી.",
        });
      }
    }

    const verifiedOTP = {
      ...storedOTP,

      verified:
        true,

      verifiedAt:
        Date.now(),
    };

    otpStore.set(
      otpKey,
      verifiedOTP
    );

    console.log(
      "✅ Profile OTP Verified:",
      {
        userId,
        type,
      }
    );

    return res.status(200).json({
      message:
        type === "email"
          ? "Email OTP successfully verify થઈ ગયો છે. ✅"
          : "Mobile OTP successfully verify થઈ ગયો છે. ✅",

      verified:
        true,

      type,

      value:
        storedOTP.value,
    });

  } catch (error) {

    console.error(
      "❌ Verify Profile OTP Error:",
      error
    );

    return res.status(500).json({
      message:
        "OTP verificationમાં સમસ્યા આવી.",
      error:
        error.message,
    });
  }
};

// =====================================================
// UPDATE PROFILE
// PUT /api/auth/profile
// =====================================================

const updateProfile = async (
  req,
  res
) => {
  try {

    const userId =
      req.userId;

    const {
      name,
      mobile,
      email,
      birthDate,
      currentPassword,
      newPassword,
      emailOTP,
      mobileOTP,
    } = req.body;

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User મળ્યો નથી.",
      });
    }

    // =================================================
    // CHECK EMAIL CHANGE
    // =================================================

    let emailChanged =
      false;

    if (
      email !== undefined &&
      email
        .toString()
        .toLowerCase()
        .trim() !==
        user.email
          .toLowerCase()
    ) {
      emailChanged =
        true;
    }

    // =================================================
    // CHECK MOBILE CHANGE
    // =================================================

    let mobileChanged =
      false;

    if (
      mobile !== undefined &&
      mobile
        .toString()
        .trim() !==
        user.mobile
    ) {
      mobileChanged =
        true;
    }

    // =================================================
    // EMAIL OTP REQUIRED
    // =================================================

    if (
      emailChanged
    ) {

      if (!emailOTP) {
        return res.status(400).json({
          message:
            "Email બદલવા માટે OTP verification જરૂરી છે.",
        });
      }

      const cleanEmail =
        email
          .toString()
          .toLowerCase()
          .trim();

      const otpKey =
        getProfileOTPKey(
          userId,
          "email"
        );

      const storedOTP =
        otpStore.get(
          otpKey
        );

      if (!storedOTP) {
        return res.status(400).json({
          message:
            "Email OTP મળ્યો નથી. પહેલા OTP મોકલો.",
        });
      }

      if (
        Date.now() >
        storedOTP.expiresAt
      ) {

        otpStore.delete(
          otpKey
        );

        return res.status(400).json({
          message:
            "Email OTP expire થઈ ગયો છે. ફરીથી OTP મોકલો.",
        });
      }

      if (
        storedOTP.otp !==
        emailOTP
          .toString()
          .trim()
      ) {
        return res.status(400).json({
          message:
            "Email OTP ખોટો છે.",
        });
      }

      if (
        storedOTP.value !==
        cleanEmail
      ) {
        return res.status(400).json({
          message:
            "Email OTP આ Email માટે નથી.",
        });
      }

      if (
        storedOTP.verified !==
        true
      ) {
        return res.status(400).json({
          message:
            "પહેલા Email OTP verify કરો.",
        });
      }

      const existingEmail =
        await User.findOne({
          email:
            cleanEmail,

          _id: {
            $ne:
              userId,
          },
        });

      if (existingEmail) {
        return res.status(400).json({
          message:
            "આ Email બીજા accountમાં ઉપયોગમાં છે.",
        });
      }

      user.email =
        cleanEmail;

      otpStore.delete(
        otpKey
      );
    }

    // =================================================
    // MOBILE OTP REQUIRED
    // =================================================

    if (
      mobileChanged
    ) {

      if (!mobileOTP) {
        return res.status(400).json({
          message:
            "Mobile Number બદલવા માટે OTP verification જરૂરી છે.",
        });
      }

      const cleanMobile =
        mobile
          .toString()
          .trim();

      const otpKey =
        getProfileOTPKey(
          userId,
          "mobile"
        );

      const storedOTP =
        otpStore.get(
          otpKey
        );

      if (!storedOTP) {
        return res.status(400).json({
          message:
            "Mobile OTP મળ્યો નથી. પહેલા OTP મોકલો.",
        });
      }

      if (
        Date.now() >
        storedOTP.expiresAt
      ) {

        otpStore.delete(
          otpKey
        );

        return res.status(400).json({
          message:
            "Mobile OTP expire થઈ ગયો છે. ફરીથી OTP મોકલો.",
        });
      }

      if (
        storedOTP.otp !==
        mobileOTP
          .toString()
          .trim()
      ) {
        return res.status(400).json({
          message:
            "Mobile OTP ખોટો છે.",
        });
      }

      if (
        storedOTP.value !==
        cleanMobile
      ) {
        return res.status(400).json({
          message:
            "Mobile OTP આ Mobile Number માટે નથી.",
        });
      }

      if (
        storedOTP.verified !==
        true
      ) {
        return res.status(400).json({
          message:
            "પહેલા Mobile OTP verify કરો.",
        });
      }

      const existingMobile =
        await User.findOne({
          mobile:
            cleanMobile,

          _id: {
            $ne:
              userId,
          },
        });

      if (existingMobile) {
        return res.status(400).json({
          message:
            "આ Mobile Number બીજા accountમાં ઉપયોગમાં છે.",
        });
      }

      user.mobile =
        cleanMobile;

      otpStore.delete(
        otpKey
      );
    }

    // =================================================
    // NAME UPDATE
    // =================================================

    if (
      name !== undefined
    ) {

      const cleanName =
        name
          .toString()
          .trim();

      if (!cleanName) {
        return res.status(400).json({
          message:
            "Name ખાલી રાખી શકાતું નથી.",
        });
      }

      user.name =
        cleanName;
    }

    // =================================================
    // BIRTH DATE UPDATE
    // =================================================

    if (
      birthDate !== undefined
    ) {

      const parsedBirthDate =
        new Date(
          birthDate
        );

      if (
        Number.isNaN(
          parsedBirthDate.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "યોગ્ય Birth Date નાખો.",
        });
      }

      user.birthDate =
        parsedBirthDate;
    }

    // =================================================
    // PASSWORD UPDATE
    // =================================================

    if (
      newPassword !== undefined &&
      newPassword !== ""
    ) {

      if (
        !currentPassword
      ) {
        return res.status(400).json({
          message:
            "Password બદલવા માટે Current Password જરૂરી છે.",
        });
      }

      const isCurrentPasswordCorrect =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (
        !isCurrentPasswordCorrect
      ) {
        return res.status(400).json({
          message:
            "Current Password ખોટો છે.",
        });
      }

      if (
        newPassword.length <
        6
      ) {
        return res.status(400).json({
          message:
            "New Password ઓછામાં ઓછો 6 charactersનો હોવો જોઈએ.",
        });
      }

      user.password =
        await bcrypt.hash(
          newPassword,
          10
        );
    }

    await user.save();

    const updatedUser =
      await User.findById(
        userId
      ).select(
        "-password"
      );

    return res.status(200).json({
      message:
        "Profile સફળતાપૂર્વક update થઈ ગઈ છે. ✅",

      user:
        updatedUser,
    });

  } catch (error) {

    console.error(
      "❌ Update Profile Error:",
      error
    );

    return res.status(500).json({
      message:
        "Profile update કરવામાં error આવ્યો.",
    });
  }
};

// =====================================================
// =====================================================
// FORGOT PASSWORD SYSTEM
// =====================================================
// =====================================================


// =====================================================
// SEND FORGOT PASSWORD OTP
// POST /api/auth/forgot-password/send-otp
// =====================================================

const sendForgotPasswordOTP = async (
  req,
  res
) => {
  try {

    const {
      email,
    } = req.body;

    // =================================================
    // REQUIRED EMAIL
    // =================================================

    if (!email) {
      return res.status(400).json({
        message:
          "Email ID જરૂરી છે.",
      });
    }

    // =================================================
    // CLEAN EMAIL
    // =================================================

    const cleanEmail =
      email
        .toString()
        .toLowerCase()
        .trim();

    // =================================================
    // EMAIL VALIDATION
    // =================================================

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      return res.status(400).json({
        message:
          "યોગ્ય Email ID નાખો.",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findOne({
        email:
          cleanEmail,
      });

    // =================================================
    // USER NOT FOUND
    // =================================================

    if (!user) {
      return res.status(404).json({
        message:
          "આ Email સાથે કોઈ account મળ્યું નથી.",
      });
    }

    // =================================================
    // GENERATE OTP
    // =================================================

    const otp =
      generateOTP();

    // =================================================
    // EXPIRY
    // 10 MINUTES
    // =================================================

    const expiresAt =
      Date.now() +
      10 * 60 * 1000;

    // =================================================
    // OTP KEY
    // =================================================

    const otpKey =
      getForgotPasswordOTPKey(
        cleanEmail
      );

    // =================================================
    // STORE OTP
    // =================================================

    otpStore.set(
      otpKey,
      {
        otp,

        expiresAt,

        verified:
          false,

        email:
          cleanEmail,

        userId:
          user._id.toString(),
      }
    );

    // =================================================
    // SEND EMAIL
    // =================================================

    await transporter.sendMail({

      from:
        `"Bhagavad Gita" <${process.env.EMAIL_USER}>`,

      to:
        cleanEmail,

      subject:
        "Bhagavad Gita - Password Reset OTP",

      html: `
        <!DOCTYPE html>

        <html>

        <head>

          <meta charset="UTF-8" />

          <title>
            Password Reset OTP
          </title>

        </head>

        <body style="
          margin:0;
          padding:0;
          background:#f5efe6;
          font-family:Arial,sans-serif;
        ">

          <div style="
            max-width:600px;
            margin:30px auto;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 5px 20px rgba(0,0,0,0.12);
          ">

            <!-- HEADER -->

            <div style="
              background:linear-gradient(
                135deg,
                #8b4513,
                #d35400
              );
              padding:30px;
              text-align:center;
              color:white;
            ">

              <div style="
                font-size:45px;
              ">
                ॐ
              </div>

              <h1 style="
                margin:10px 0;
              ">
                Bhagavad Gita
              </h1>

              <p>
                Password Reset
              </p>

            </div>


            <!-- CONTENT -->

            <div style="
              padding:30px;
              text-align:center;
            ">

              <h2>
                Namaste ${user.name} 🙏
              </h2>

              <p>
                તમારા Bhagavad Gita account
                નો password reset કરવા માટે
                નીચેનો OTP ઉપયોગ કરો:
              </p>


              <!-- OTP -->

              <div style="
                display:inline-block;
                margin:20px 0;
                padding:18px 30px;
                background:#fff3e0;
                border:2px dashed #d35400;
                border-radius:12px;
              ">

                <span style="
                  font-size:34px;
                  font-weight:bold;
                  letter-spacing:8px;
                  color:#d35400;
                ">
                  ${otp}
                </span>

              </div>


              <p>
                આ OTP
                <strong>
                  10 મિનિટ
                </strong>
                માટે valid છે.
              </p>


              <p style="
                color:#777;
                font-size:14px;
              ">
                જો તમે password reset request
                કરી નથી, તો આ emailને ignore કરો.
              </p>


              <hr style="
                border:none;
                border-top:1px solid #eee;
                margin:25px 0;
              " />


              <p style="
                color:#8b4513;
                font-size:18px;
              ">
                ॥ श्रीमद्भगवद्गीता ॥
              </p>

            </div>

          </div>

        </body>

        </html>
      `,
    });

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({

      message:
        "Password reset માટે તમારા Email પર OTP મોકલવામાં આવ્યો છે.",

      otpSent:
        true,
    });

  } catch (error) {

    console.error(
      "❌ Forgot Password OTP Error:",
      error
    );

    return res.status(500).json({

      message:
        "Password reset OTP મોકલવામાં સમસ્યા આવી.",

      error:
        error.message,
    });
  }
};


// =====================================================
// VERIFY FORGOT PASSWORD OTP
// POST /api/auth/forgot-password/verify-otp
// =====================================================

const verifyForgotPasswordOTP = async (
  req,
  res
) => {
  try {

    const {
      email,
      otp,
    } = req.body;

    // =================================================
    // REQUIRED
    // =================================================

    if (
      !email ||
      !otp
    ) {
      return res.status(400).json({
        message:
          "Email અને OTP જરૂરી છે.",
      });
    }

    // =================================================
    // CLEAN DATA
    // =================================================

    const cleanEmail =
      email
        .toString()
        .toLowerCase()
        .trim();

    const cleanOTP =
      otp
        .toString()
        .trim();

    // =================================================
    // OTP FORMAT
    // =================================================

    if (
      !/^[0-9]{6}$/.test(
        cleanOTP
      )
    ) {
      return res.status(400).json({
        message:
          "6 અંકનો યોગ્ય OTP નાખો.",
      });
    }

    // =================================================
    // OTP KEY
    // =================================================

    const otpKey =
      getForgotPasswordOTPKey(
        cleanEmail
      );

    // =================================================
    // GET OTP
    // =================================================

    const storedOTP =
      otpStore.get(
        otpKey
      );

    if (!storedOTP) {
      return res.status(400).json({
        message:
          "OTP મળ્યો નથી. પહેલા OTP મોકલો.",
      });
    }

    // =================================================
    // EXPIRY
    // =================================================

    if (
      Date.now() >
      storedOTP.expiresAt
    ) {

      otpStore.delete(
        otpKey
      );

      return res.status(400).json({
        message:
          "OTP expire થઈ ગયો છે. ફરીથી OTP મોકલો.",
      });
    }

    // =================================================
    // CHECK OTP
    // =================================================

    if (
      storedOTP.otp !==
      cleanOTP
    ) {
      return res.status(400).json({
        message:
          "OTP ખોટો છે. કૃપા કરીને ફરી તપાસો.",
      });
    }

    // =================================================
    // MARK VERIFIED
    // =================================================

    otpStore.set(
      otpKey,
      {
        ...storedOTP,

        verified:
          true,

        verifiedAt:
          Date.now(),
      }
    );

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({

      message:
        "OTP successfully verify થઈ ગયો છે. ✅",

      verified:
        true,
    });

  } catch (error) {

    console.error(
      "❌ Verify Forgot Password OTP Error:",
      error
    );

    return res.status(500).json({

      message:
        "OTP verificationમાં સમસ્યા આવી.",

      error:
        error.message,
    });
  }
};


// =====================================================
// RESET PASSWORD
// POST /api/auth/forgot-password/reset
// =====================================================

const resetPassword = async (
  req,
  res
) => {
  try {

    const {
      email,
      newPassword,
      confirmPassword,
    } = req.body;

    // =================================================
    // REQUIRED
    // =================================================

    if (
      !email ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message:
          "Email, New Password અને Confirm Password જરૂરી છે.",
      });
    }

    // =================================================
    // CLEAN EMAIL
    // =================================================

    const cleanEmail =
      email
        .toString()
        .toLowerCase()
        .trim();

    // =================================================
    // PASSWORD LENGTH
    // =================================================

    if (
      newPassword.length <
      6
    ) {
      return res.status(400).json({
        message:
          "New Password ઓછામાં ઓછો 6 charactersનો હોવો જોઈએ.",
      });
    }

    // =================================================
    // PASSWORD MATCH
    // =================================================

    if (
      newPassword !==
      confirmPassword
    ) {
      return res.status(400).json({
        message:
          "New Password અને Confirm Password match થતા નથી.",
      });
    }

    // =================================================
    // OTP KEY
    // =================================================

    const otpKey =
      getForgotPasswordOTPKey(
        cleanEmail
      );

    // =================================================
    // GET VERIFIED OTP
    // =================================================

    const storedOTP =
      otpStore.get(
        otpKey
      );

    if (!storedOTP) {
      return res.status(400).json({
        message:
          "Password reset OTP મળ્યો નથી. ફરીથી OTP process કરો.",
      });
    }

    // =================================================
    // CHECK OTP EXPIRY
    // =================================================

    if (
      Date.now() >
      storedOTP.expiresAt
    ) {

      otpStore.delete(
        otpKey
      );

      return res.status(400).json({
        message:
          "OTP expire થઈ ગયો છે. ફરીથી OTP મોકલો.",
      });
    }

    // =================================================
    // CHECK VERIFIED
    // =================================================

    if (
      storedOTP.verified !==
      true
    ) {
      return res.status(400).json({
        message:
          "પહેલા OTP verify કરો.",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findOne({
        email:
          cleanEmail,
      });

    if (!user) {
      return res.status(404).json({
        message:
          "User મળ્યો નથી.",
      });
    }

    // =================================================
    // HASH NEW PASSWORD
    // =================================================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    // =================================================
    // UPDATE PASSWORD
    // =================================================

    user.password =
      hashedPassword;

    await user.save();

    // =================================================
    // DELETE OTP
    // =================================================

    otpStore.delete(
      otpKey
    );

    // =================================================
    // SUCCESS
    // =================================================

    return res.status(200).json({

      message:
        "Password સફળતાપૂર્વક reset થઈ ગયો છે. ✅",

      passwordReset:
        true,
    });

  } catch (error) {

    console.error(
      "❌ Reset Password Error:",
      error
    );

    return res.status(500).json({

      message:
        "Password reset કરવામાં સમસ્યા આવી.",

      error:
        error.message,
    });
  }
};


// =====================================================
// PROFILE OTP FUNCTION ALIASES
// =====================================================

const sendProfileUpdateOTP =
  sendProfileOTP;

const verifyProfileUpdateOTP =
  verifyProfileOTP;

  const resetForgotPassword =
  resetPassword;


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  // =====================================================
  // REGISTRATION OTP
  // =====================================================

  sendOTP,
  verifyOTP,

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  registerUser,
  loginUser,

  // =====================================================
  // PROFILE
  // =====================================================

  getProfile,
  updateProfile,

  // =====================================================
  // PROFILE OTP
  // =====================================================

  sendProfileOTP,
  verifyProfileOTP,

  // Names used by authRoutes.js
  sendProfileUpdateOTP,
  verifyProfileUpdateOTP,

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetForgotPassword,
};