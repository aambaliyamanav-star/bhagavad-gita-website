const express = require("express");
const router = express.Router();
const {
  recordAppInstall,
  recordAppUninstall,
  deleteAppInstallation,
  getAppStats,
} = require("../controllers/appAnalyticsController");
const {
  protect,
  adminOnly,
  requirePermission,
} = require("../middleware/authMiddleware");

// POST /api/app-analytics/record-install (Public: saves app install or open event)
router.post("/record-install", recordAppInstall);

// POST /api/app-analytics/record-uninstall (Public: marks device uninstalled)
router.post("/record-uninstall", recordAppUninstall);

// DELETE /api/app-analytics/installation/:id (Protected: requires view_analytics)
router.delete("/installation/:id", protect, requirePermission("view_analytics"), deleteAppInstallation);

// GET /api/app-analytics/stats (Protected: requires view_analytics)
router.get("/stats", protect, requirePermission("view_analytics"), getAppStats);

module.exports = router;
