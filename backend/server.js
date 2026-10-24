require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

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

const {
  securityHeaders,
  noSqlSanitizer,
  generalApiLimiter,
  corsOptions,
  secureErrorHandler,
} = require("./middleware/securityMiddleware");

const app = express();

// Trust reverse proxy (Render, Vercel, Cloudflare) for accurate client IP in rate limiting
app.set("trust proxy", 1);

// Connect MongoDB Database
connectDB();

// =====================================================
// SECURITY SUITE
// =====================================================

// 1. Disable server fingerprinting (Hides Express signature)
app.disable("x-powered-by");

// 2. Set strict HTTP security headers (HSTS, Anti-Clickjacking, Anti-XSS, MIME-sniffing protection)
app.use(securityHeaders);

// 3. Strict CORS Whitelist
app.use(cors(corsOptions));

// 4. Request Body Size Limiting (Prevents buffer overflow & DoS memory exhaustion)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.text({ type: ["text/plain", "application/json"], limit: "1mb" }));

// 5. NoSQL Injection Sanitizer (Strips any malicious $ and . keys from body, query, and params)
app.use(noSqlSanitizer);

// 6. Global API Rate Limiter (Protects against DDoS, brute force, and scraping bots)
app.use("/api", generalApiLimiter);

// =====================================================
// ROUTES
// =====================================================

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/shloks", shlokRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/continue-reading", continueReadingRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/reading-tracker", readingTrackerRoutes);
app.use("/api/gita-ai", gitaAiRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/app-analytics", appAnalyticsRoutes);

// Root health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bhagavad Gita Backend API is running securely 🚀",
  });
});

// Centralized Secure Error Handler (Never leaks internal stack traces or DB errors to clients)
app.use(secureErrorHandler);

// =====================================================
// PUSH NOTIFICATION CRON JOBS (EVERY 3 HOURS THROUGHOUT THE DAY)
// 06:00 AM, 09:00 AM, 12:00 PM, 03:00 PM, 06:00 PM, 09:00 PM IST
// Sends to App subscribers only!
// =====================================================
const reminderTimes = [
  "0 6 * * *",   // 06:00 AM IST - પ્રભાત
  "0 9 * * *",   // 09:00 AM IST - સવાર
  "0 12 * * *",  // 12:00 PM IST - બપોર
  "0 15 * * *",  // 03:00 PM IST - બપોર પછી
  "0 18 * * *",  // 06:00 PM IST - સાંજ
  "0 21 * * *",  // 09:00 PM IST - રાત્રિ
];

reminderTimes.forEach((scheduleTime) => {
  cron.schedule(
    scheduleTime,
    async () => {
      console.log(`⏰ [Cron ${scheduleTime}] Running 3-hour Gita reminder...`);
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running securely on http://localhost:${PORT}`);
});
