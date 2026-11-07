const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Get VAPID public key
router.get("/public-key", notificationController.getPublicKey);

// Subscribe to push notifications (Called from App & Web when enabled)
router.post("/subscribe", notificationController.subscribe);

// Unsubscribe
router.post("/unsubscribe", notificationController.unsubscribe);

// Record open
router.post("/record-open", notificationController.recordOpen);

// Record action (shlok_read, quiz_played)
router.post("/record-action", notificationController.recordAction);

// Trigger 2-hour reminder (Called by cron jobs or GitHub Actions)
router.get("/trigger-daily-reminder", async (req, res) => {
  try {
    const force = req.query.force === "true" || req.query.force === "1";
    const result = await notificationController.sendEvery2HoursReminder(null, force);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Alias for 2-hour reminder
router.get("/trigger-2hr-reminder", async (req, res) => {
  try {
    const force = req.query.force === "true" || req.query.force === "1";
    const result = await notificationController.sendEvery2HoursReminder(null, force);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin-Only Push Testing & Broadcasts
router.post("/test-daily-reminder", protect, adminOnly, async (req, res) => {
  const result = await notificationController.sendEvery2HoursReminder(req.body?.customMsg || null, true);
  res.json(result);
});

router.post("/send-test-to-endpoint", protect, adminOnly, notificationController.sendTestToEndpoint);

module.exports = router;
