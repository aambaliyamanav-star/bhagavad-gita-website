const express = require("express");
const router = express.Router();
const {
  recordAppInstall,
  recordAppUninstall,
  deleteAppInstallation,
  getAppStats,
} = require("../controllers/appAnalyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// POST /api/app-analytics/record-install (Public: saves app install or open event)
router.post("/record-install", recordAppInstall);

// POST /api/app-analytics/record-uninstall (Public: marks device uninstalled)
router.post("/record-uninstall", recordAppUninstall);

// DELETE /api/app-analytics/installation/:id (Protected: Admin only - deletes device record)
router.delete("/installation/:id", protect, adminOnly, deleteAppInstallation);

// GET /api/app-analytics/stats (Protected: Admin only)
router.get("/stats", protect, adminOnly, getAppStats);

module.exports = router;
