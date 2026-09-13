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

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

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