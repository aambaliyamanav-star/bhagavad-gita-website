const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Login જરૂરી છે."
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // =====================================================
    // USER ID
    // =====================================================

    req.userId = decoded.userId;

    // =====================================================
    // GET USER
    // =====================================================

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User મળ્યો નથી."
      });
    }

    // =====================================================
    // SET USER
    // =====================================================

    req.user = user;

    next();

  } catch (error) {
    console.error("Protect Error:", error);

    return res.status(401).json({
      message: "Invalid અથવા expired token."
    });
  }
};


const optionalAuth = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    // Login નથી → Anonymous user તરીકે ચાલુ રાખો
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      req.user = null;
      req.userId = null;

      return next();
    }

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId =
      decoded.userId;

    const user =
      await User.findById(
        req.userId
      );

    // User મળ્યો નહીં → Anonymous
    if (!user) {
      req.user = null;
      req.userId = null;

      return next();
    }

    // Logged-in user
    req.user = user;

    next();

  } catch (error) {
    console.error(
      "Optional Auth Error:",
      error
    );

    // Invalid/expired token હોય તો પણ
    // public Shlok 1–5 access બંધ ન થાય
    req.user = null;
    req.userId = null;

    next();
  }
};


const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    console.log("Admin Check:", {
      userId: req.userId,
      role: user ? user.role : "USER NOT FOUND"
    });

    if (!user) {
      return res.status(404).json({
        message: "User મળ્યો નથી."
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required."
      });
    }

    next();

  } catch (error) {
    console.error("Admin Error:", error);

    return res.status(500).json({
      message: "Authorization error."
    });
  }
};


module.exports = {
  protect,
  optionalAuth,
  adminOnly
};