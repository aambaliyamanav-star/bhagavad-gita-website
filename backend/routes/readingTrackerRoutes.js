const express = require("express");
const {
  getProgress,
  markShlokaRead,
  syncProgress,
} = require("../controllers/readingTrackerController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get reading progress, streak, and badges
router.get("/progress", protect, getProgress);

// Mark a shloka as read
router.post("/mark-read", protect, markShlokaRead);

// Sync local reading progress from guest session
router.post("/sync", protect, syncProgress);

module.exports = router;

