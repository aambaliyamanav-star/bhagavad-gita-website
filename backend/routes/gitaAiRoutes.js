const express = require("express");
const router = express.Router();
const { askGitaAI } = require("../controllers/gitaAiController");

// POST /api/gita-ai/ask
router.post("/ask", askGitaAI);

module.exports = router;

