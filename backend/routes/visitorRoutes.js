const express = require("express");
const {
  recordVisit,
  getVisitorStats,
} = require("../controllers/visitorController");
const {
  protect,
  adminOnly,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public endpoint: records page visit
router.post("/track", recordVisit);

// Protected endpoint: get visitor analytics for Admin Dashboard (requires view_analytics)
router.get("/stats", protect, requirePermission("view_analytics"), getVisitorStats);

module.exports = router;

