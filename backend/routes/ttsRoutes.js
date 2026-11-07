const express = require("express");
const router = express.Router();
const { generateSpeech, warmupChapterAudios } = require("../controllers/ttsController");

// POST /api/tts/speak
router.post("/speak", generateSpeech);

// GET & POST /api/tts/warmup/:chapterNumber
router.get("/warmup/:chapterNumber", warmupChapterAudios);
router.post("/warmup/:chapterNumber", warmupChapterAudios);

module.exports = router;

