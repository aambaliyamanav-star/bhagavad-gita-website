const express = require("express");
const router = express.Router();
const { recordAppInstall, getAppStats } = require("../controllers/appAnalyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// POST /api/app-analytics/record-install (Public: saves app install or open event)
router.post("/record-install", recordAppInstall);

// GET /api/app-analytics/stats (Protected: Admin only)
router.get("/stats", protect, adminOnly, getAppStats);

module.exports = router;
