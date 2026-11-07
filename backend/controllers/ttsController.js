const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Map language and preferred voice to Microsoft Neural voices
const VOICE_MAP = {
  gu: {
    male: "gu-IN-NiranjanNeural",
    female: "gu-IN-DhwaniNeural",
  },
  hi: {
    male: "hi-IN-MadhurNeural",
    female: "hi-IN-SwaraNeural",
  },
  en: {
    male: "en-IN-PrabhatNeural",
    female: "en-IN-NeerjaNeural",
  },
  sa: {
    male: "hi-IN-MadhurNeural",
    female: "hi-IN-SwaraNeural",
  },
};

const CACHE_DIR = path.join(__dirname, "../audio_cache");
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (e) {
  console.warn("Could not create audio_cache dir:", e);
}

// In-memory audio buffer cache (stores up to 2000 shloka audio clips for zero latency and zero repeated timeouts)
const audioCache = new Map();
const MAX_CACHE_SIZE = 2000;

/**
 * Core synthesis helper with dual-layer caching (Memory + Disk)
 */
const synthesizeBuffer = async (text, lang = "gu", customRate = null) => {
  if (!text || typeof text !== "string" || !text.trim()) return null;

  let cleanText = text.trim();
  cleanText = cleanText.replace(/<[^>]*>/g, " ");
  cleanText = cleanText.replace(/&nbsp;/gi, " ");
  cleanText = cleanText.replace(/&amp;/gi, " and ");
  cleanText = cleanText.replace(/[&<>]/g, " ");
  cleanText = cleanText.replace(/\s*[:：]\s*/g, ". ... ");
  cleanText = cleanText.replace(/(\.\s*\.\.\.\s*)+/g, ". ... ");
  cleanText = cleanText.replace(/\s+/g, " ").trim();

  const voiceLang = VOICE_MAP[lang] ? lang : "gu";
  const selectedVoice = VOICE_MAP[voiceLang].male;
  const prosodyOptions = {
    rate: customRate !== null ? customRate : (lang === "sa" ? "-22%" : "-2%"),
    pitch: lang === "sa" ? "-2Hz" : "+0Hz",
  };

  const cacheKey = crypto
    .createHash("md5")
    .update(`${selectedVoice}:${prosodyOptions.rate}:${prosodyOptions.pitch}:${cleanText}`)
    .digest("hex");

  // 1. Check in-memory RAM cache (instant)
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }

  // 2. Check disk cache (5ms)
  const diskPath = path.join(CACHE_DIR, `${cacheKey}.mp3`);
  if (fs.existsSync(diskPath)) {
    try {
      const diskBuffer = fs.readFileSync(diskPath);
      if (diskBuffer && diskBuffer.length > 0) {
        audioCache.set(cacheKey, diskBuffer);
        return diskBuffer;
      }
    } catch (e) {}
  }

  // 3. Synthesize via MsEdgeTTS
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const tts = new MsEdgeTTS({ connectionTimeoutMs: 25000, synthesisTimeoutMs: 60000 });
      await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(cleanText, prosodyOptions);

      const chunks = [];
      await new Promise((resolve, reject) => {
        audioStream.on("data", (chunk) => chunks.push(chunk));
        audioStream.on("end", resolve);
        audioStream.on("error", (err) => reject(err));
      });

      const audioBuffer = Buffer.concat(chunks);
      if (audioBuffer && audioBuffer.length > 0) {
        if (audioCache.size >= MAX_CACHE_SIZE) {
          const oldestKey = audioCache.keys().next().value;
          audioCache.delete(oldestKey);
        }
        audioCache.set(cacheKey, audioBuffer);
        try {
          fs.writeFileSync(diskPath, audioBuffer);
        } catch (e) {}
        return audioBuffer;
      }
    } catch (err) {
      if (attempt < 3) await new Promise((r) => setTimeout(r, 600 * attempt));
    }
  }
  return null;
};

const generateSpeech = async (req, res) => {
  try {
    const { text, lang = "gu", rate } = req.body || {};
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required for speech synthesis.",
      });
    }

    const audioBuffer = await synthesizeBuffer(text, lang, rate);
    if (!audioBuffer) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate speech after retries.",
      });
    }

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length,
      "Cache-Control": "public, max-age=86400",
      "Accept-Ranges": "bytes",
    });
    return res.send(audioBuffer);
  } catch (error) {
    console.error("TTS Controller Fatal Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to generate speech." });
    }
  }
};

/**
 * Automatically pre-caches audio when Admin adds or updates a shloka!
 * Runs completely non-blocking in background so Admin panel stays instantaneous.
 */
const precacheSingleShlokAudio = (shloka) => {
  if (!shloka) return;
  setImmediate(async () => {
    try {
      // 1. Sanskrit
      let plainSa = String(shloka.sanskrit || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/[॥\|]\s*[\d\.\-०-९]+\s*[॥\|]/g, "।")
        .trim();
      if (!plainSa && (shloka.sanskritLine1 || shloka.sanskritLine2)) {
        plainSa = [shloka.sanskritLine1, shloka.sanskritLine2].filter(Boolean).join("\n");
      }
      if (plainSa) await synthesizeBuffer(plainSa, "sa", "-22%");

      // 2. Translation (gu)
      let plainTr = String(shloka.translation || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .trim();
      if (plainTr) await synthesizeBuffer(plainTr, "gu", "-2%");

      // 3. Message (gu)
      let plainMsg = String(shloka.message || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .trim();
      if (plainMsg) await synthesizeBuffer(plainMsg, "gu", "-2%");
    } catch (e) {
      console.warn("[TTS] Automatic shloka precache error:", e.message);
    }
  });
};

module.exports = {
  generateSpeech,
  precacheSingleShlokAudio,
};
