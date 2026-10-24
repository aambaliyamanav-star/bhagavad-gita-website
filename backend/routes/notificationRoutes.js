const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Get VAPID public key
router.get("/public-key", notificationController.getPublicKey);

// Subscribe to push notifications (Called ONLY from App)
router.post("/subscribe", notificationController.subscribe);

// Unsubscribe
router.post("/unsubscribe", notificationController.unsubscribe);

// Record open
router.post("/record-open", notificationController.recordOpen);

// Record action
router.post("/record-action", notificationController.recordAction);

// Trigger daily reminder (Called by cron-job or GitHub Actions 5x a day)
router.get("/trigger-daily-reminder", async (req, res) => {
  try {
    const force = req.query.force === "true" || req.query.force === "1";
    // If force is requested, check if caller has CRON_SECRET or is admin
    const cronSecret = req.headers["x-cron-secret"] || req.query.cronSecret;
    const isCronAuthorized = process.env.CRON_SECRET ? cronSecret === process.env.CRON_SECRET : true;
    const effectiveForce = force && isCronAuthorized;
    const result = await notificationController.sendDailyReminder(null, effectiveForce);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin-Only Push Testing & Custom Broadcasts
router.post("/test-daily-reminder", protect, adminOnly, async (req, res) => {
  const result = await notificationController.sendDailyReminder(req.body?.customMsg || null, true);
  res.json(result);
});

router.post("/send-test-to-endpoint", protect, adminOnly, notificationController.sendTestToEndpoint);

module.exports = router;
