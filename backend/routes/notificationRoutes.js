const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Get VAPID public key
router.get("/public-key", notificationController.getPublicKey);

// Subscribe to push notifications
router.post("/subscribe", notificationController.subscribe);

// Unsubscribe
router.post("/unsubscribe", notificationController.unsubscribe);

// Record site opened (called on any page load or notification click)
router.post("/record-open", notificationController.recordOpen);

// Trigger daily reminder (Can be called by cron-job, GitHub Actions, or Admin)
router.get("/trigger-daily-reminder", async (req, res) => {
  try {
    const result = await notificationController.sendDailyReminder();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test routes (useful for verification)
router.post("/test-daily-reminder", async (req, res) => {
  const result = await notificationController.sendDailyReminder(req.body?.customMsg || null);
  res.json(result);
});

router.post("/send-custom", async (req, res) => {
  const { title, body, url } = req.body || {};
  if (!title || !body) {
    return res.status(400).json({ error: "Title અને Body જરૂરી છે" });
  }
  const result = await notificationController.sendDailyReminder({ title, body, url });
  res.json(result);
});

router.post("/test-admin-alert", async (req, res) => {
  await notificationController.notifyAdminNewUser({
    name: "ટેસ્ટ ભક્ત",
    email: "test@example.com",
  });
  res.json({ success: true, message: "Admin alert test triggered" });
});

module.exports = router;

