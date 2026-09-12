const express = require("express");
const router = express.Router();
const { askGitaAI } = require("../controllers/gitaAiController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/gita-ai/ask (LOGIN REQUIRED)
router.post("/ask", protect, askGitaAI);

module.exports = router;

