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

// Test routes (useful for verification)
router.post("/test-daily-reminder", async (req, res) => {
  await notificationController.sendDailyReminder();
  res.json({ success: true, message: "Daily reminder test triggered" });
});

router.post("/test-admin-alert", async (req, res) => {
  await notificationController.notifyAdminNewUser({
    name: "ટેસ્ટ ભક્ત",
    email: "test@example.com",
  });
  res.json({ success: true, message: "Admin alert test triggered" });
});

module.exports = router;
