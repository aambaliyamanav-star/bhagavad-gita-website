const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

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
    const result = await notificationController.sendDailyReminder(null, force);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/test-daily-reminder", async (req, res) => {
  const result = await notificationController.sendDailyReminder(req.body?.customMsg || null, true);
  res.json(result);
});

router.post("/send-test-to-endpoint", notificationController.sendTestToEndpoint);

module.exports = router;
