const express = require("express");
const router = express.Router();
const { generateSpeech } = require("../controllers/ttsController");

// POST /api/tts/speak
router.post("/speak", generateSpeech);

module.exports = router;

