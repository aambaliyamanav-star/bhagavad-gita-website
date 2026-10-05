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
const notificationRoutes = require("./routes/notificationRoutes");
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
app.use("/api/notifications", notificationRoutes);

// =====================================================
// PUSH NOTIFICATION CRON JOBS
// Send 5 times a day (IST): 8:00 AM, 12:00 PM, 4:00 PM, 8:00 PM, 10:00 PM
// Automatically skips users who completed their daily goals (shlok + quiz)!
// =====================================================
const reminderTimes = [
  "0 8 * * *",   // 08:00 AM IST
  "0 12 * * *",  // 12:00 PM IST
  "0 16 * * *",  // 04:00 PM IST
  "0 20 * * *",  // 08:00 PM IST
  "0 22 * * *",  // 10:00 PM IST
];

reminderTimes.forEach((scheduleTime) => {
  cron.schedule(
    scheduleTime,
    async () => {
      console.log(`⏰ [Cron ${scheduleTime}] Running daily shloka reminder check...`);
      await notificationController.sendDailyReminder();
    },
    { timezone: "Asia/Kolkata" }
  );
});

// Midnight reset (00:00)
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