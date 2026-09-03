const express = require("express");

// =====================================================
// AUTH CONTROLLER
// =====================================================

const {
  sendOTP,
  verifyOTP,
  registerUser,
  loginUser,
  getProfile,

  // Profile OTP
  sendProfileUpdateOTP,
  verifyProfileUpdateOTP,

  // Update Profile
  updateProfile,

  // Forgot Password
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetForgotPassword,
} = require("../controllers/authController");

// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const {
  protect,
} = require("../middleware/authMiddleware");

// =====================================================
// ROUTER
// =====================================================

const router = express.Router();

// =====================================================
// SEND REGISTRATION EMAIL OTP
// POST /api/auth/send-otp
// =====================================================

router.post(
  "/send-otp",
  sendOTP
);

// =====================================================
// VERIFY REGISTRATION EMAIL OTP
// POST /api/auth/verify-otp
// =====================================================

router.post(
  "/verify-otp",
  verifyOTP
);

// =====================================================
// REGISTER USER
// POST /api/auth/register
// =====================================================

router.post(
  "/register",
  registerUser
);

// =====================================================
// LOGIN USER
// POST /api/auth/login
// =====================================================

router.post(
  "/login",
  loginUser
);

// =====================================================
// GET USER PROFILE
// GET /api/auth/profile
// LOGIN REQUIRED
// =====================================================

router.get(
  "/profile",
  protect,
  getProfile
);

// =====================================================
// SEND PROFILE UPDATE OTP
//
// EMAIL CHANGE:
// OTP -> CURRENT REGISTERED EMAIL
//
// MOBILE CHANGE:
// OTP -> CURRENT REGISTERED EMAIL
//
// POST /api/auth/profile/send-otp
// LOGIN REQUIRED
// =====================================================

router.post(
  "/profile/send-otp",
  protect,
  sendProfileUpdateOTP
);

// =====================================================
// VERIFY PROFILE UPDATE OTP
//
// EMAIL CHANGE:
// Verify OTP sent to current registered email
//
// MOBILE CHANGE:
// Verify OTP sent to current registered email
//
// POST /api/auth/profile/verify-otp
// LOGIN REQUIRED
// =====================================================

router.post(
  "/profile/verify-otp",
  protect,
  verifyProfileUpdateOTP
);

// =====================================================
// UPDATE USER PROFILE
// PUT /api/auth/profile
// LOGIN REQUIRED
// =====================================================

router.put(
  "/profile",
  protect,
  updateProfile
);

// =====================================================
// FORGOT PASSWORD
// SEND OTP
//
// User forgot old password
// OTP will be sent to registered email
//
// POST /api/auth/forgot-password
// LOGIN NOT REQUIRED
// =====================================================

router.post(
  "/forgot-password/send-otp",
  sendForgotPasswordOTP
);

// =====================================================
// VERIFY FORGOT PASSWORD OTP
//
// POST /api/auth/forgot-password/verify-otp
// LOGIN NOT REQUIRED
// =====================================================

router.post(
  "/forgot-password/verify-otp",
  verifyForgotPasswordOTP
);


// =====================================================
// RESET PASSWORD
//
// New password set after OTP verification
//
// POST /api/auth/forgot-password/reset-password
// LOGIN NOT REQUIRED
// =====================================================

router.post(
  "/forgot-password/reset-password",
  resetForgotPassword
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;