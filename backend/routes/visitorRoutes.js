const express = require("express");
const {
  recordVisit,
  getVisitorStats,
} = require("../controllers/visitorController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public endpoint: records page visit
router.post("/track", recordVisit);

// Protected endpoint: get visitor analytics for Admin Dashboard
router.get("/stats", protect, adminOnly, getVisitorStats);

module.exports = router;
