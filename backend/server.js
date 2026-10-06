require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const shlokRoutes = require("./routes/shlokRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const continueReadingRoutes = require("./routes/continueReadingRoutes");
const quizRoutes = require("./routes/quizRoutes");
const readingTrackerRoutes = require("./routes/readingTrackerRoutes");
const gitaAiRoutes = require("./routes/gitaAiRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const appAnalyticsRoutes = require("./routes/appAnalyticsRoutes");
const notificationController = require("./controllers/notificationController");
const cron = require("node-cron");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: ["text/plain", "application/json"] }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/shloks", shlokRoutes);
app.use("/api/favorites", favoriteRoutes);

app.use(
  "/api/continue-reading",
  continueReadingRoutes
);

app.use("/api/quiz", quizRoutes);
app.use("/api/reading-tracker", readingTrackerRoutes);
app.use("/api/gita-ai", gitaAiRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/app-analytics", appAnalyticsRoutes);

// =====================================================
// PUSH NOTIFICATION CRON JOBS (5 TIMES A DAY)
// 08:00 AM, 12:00 PM, 04:00 PM, 07:00 PM, 10:00 PM IST
// Sends to App subscribers only!
// =====================================================
const reminderTimes = [
  "0 8 * * *",   // 08:00 AM IST - પ્રભાત
  "0 12 * * *",  // 12:00 PM IST - બપોર
  "0 16 * * *",  // 04:00 PM IST - સાંજ
  "0 19 * * *",  // 07:00 PM IST - સંધ્યા
  "0 22 * * *",  // 10:00 PM IST - રાત્રિ
];

reminderTimes.forEach((scheduleTime) => {
  cron.schedule(
    scheduleTime,
    async () => {
      console.log(`⏰ [Cron ${scheduleTime}] Running 5x daily Gita reminder...`);
      await notificationController.sendDailyReminder();
    },
    { timezone: "Asia/Kolkata" }
  );
});

// Midnight reset (00:00 IST)
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("🌙 [Cron Midnight] Resetting daily notification counters...");
    await notificationController.resetDailyCounters();
  },
  { timezone: "Asia/Kolkata" }
);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Bhagavad Gita Backend API is running 🚀",
  });
});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});