const express = require("express");
const router = express.Router();
const {
  askGitaAI,
  getHistory,
  saveHistory,
  deleteHistory,
  clearAllHistory,
} = require("../controllers/gitaAiController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/gita-ai/ask (LOGIN REQUIRED)
router.post("/ask", protect, askGitaAI);

// GET /api/gita-ai/history - Get all synced conversations for the logged in user
router.get("/history", protect, getHistory);

// POST /api/gita-ai/history - Save/update a conversation for the logged in user
router.post("/history", protect, saveHistory);

// DELETE /api/gita-ai/history/:convId - Delete one conversation
router.delete("/history/:convId", protect, deleteHistory);

// DELETE /api/gita-ai/history - Clear all conversations for the user
router.delete("/history", protect, clearAllHistory);

module.exports = router;
