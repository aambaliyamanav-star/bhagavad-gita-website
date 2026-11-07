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

const generateSpeech = async (req, res) => {
  try {
    const { text, lang = "gu", voice = "male", rate, pitch } = req.body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required for speech synthesis.",
      });
    }

    let cleanText = text.trim();
    // Strip HTML tags if any were passed
    cleanText = cleanText.replace(/<[^>]*>/g, " ");
    // Replace non-XML entities and characters that break Microsoft Edge TTS SSML
    cleanText = cleanText.replace(/&nbsp;/gi, " ");
    cleanText = cleanText.replace(/&amp;/gi, " and ");
    cleanText = cleanText.replace(/[&<>]/g, " ");
    // Ensure 1-second natural pause after speaker names / colons / point titles
    cleanText = cleanText.replace(/\s*[:：]\s*/g, ". ... ");
    cleanText = cleanText.replace(/(\.\s*\.\.\.\s*)+/g, ". ... ");
    cleanText = cleanText.replace(/\s+/g, " ").trim();
    const voiceLang = VOICE_MAP[lang] ? lang : "gu";
    const selectedVoice = VOICE_MAP[voiceLang][voice] || VOICE_MAP[voiceLang].male;

    // Prosody settings:
    // For Sanskrit ('sa'), use a measured devotional cadence (-22% speed, -2Hz pitch)
    // so every sacred word is clearly audible and recited with traditional shloka rag/meter.
    const prosodyOptions = {
      rate: rate !== undefined ? rate : (lang === "sa" ? "-22%" : "-2%"),
      pitch: pitch !== undefined ? pitch : (lang === "sa" ? "-2Hz" : "+0Hz"),
    };

    // Check memory cache first
    const cacheKey = crypto
      .createHash("md5")
      .update(`${selectedVoice}:${prosodyOptions.rate}:${prosodyOptions.pitch}:${cleanText}`)
      .digest("hex");

    if (audioCache.has(cacheKey)) {
      const cachedBuffer = audioCache.get(cacheKey);
      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": cachedBuffer.length,
        "Cache-Control": "public, max-age=86400",
        "Accept-Ranges": "bytes",
      });
      return res.send(cachedBuffer);
    }

    // Check persistent disk cache (zero network latency)
    const diskPath = path.join(CACHE_DIR, `${cacheKey}.mp3`);
    if (fs.existsSync(diskPath)) {
      try {
        const diskBuffer = fs.readFileSync(diskPath);
        if (diskBuffer && diskBuffer.length > 0) {
          audioCache.set(cacheKey, diskBuffer);
          res.set({
            "Content-Type": "audio/mpeg",
            "Content-Length": diskBuffer.length,
            "Cache-Control": "public, max-age=86400",
            "Accept-Ranges": "bytes",
          });
          return res.send(diskBuffer);
        }
      } catch (e) {}
    }

    // Resilient generation with retry (up to 3 attempts with fresh MsEdgeTTS instances)
    let audioBuffer = null;
    let lastError = null;

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

        audioBuffer = Buffer.concat(chunks);
        if (audioBuffer && audioBuffer.length > 0) {
          break; // Success!
        }
      } catch (err) {
        lastError = err;
        console.warn(`[TTS] Attempt ${attempt} failed (${err.message}). Retrying...`);
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 600 * attempt));
        }
      }
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      console.error("TTS Failed after 3 attempts:", lastError);
      return res.status(500).json({
        success: false,
        message: "Failed to generate speech after retries.",
      });
    }

    // Save to memory cache
    if (audioCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = audioCache.keys().next().value;
      audioCache.delete(oldestKey);
    }
    audioCache.set(cacheKey, audioBuffer);

    // Save to disk cache
    try {
      fs.writeFileSync(diskPath, audioBuffer);
    } catch (e) {
      console.warn("Could not write audio to disk cache:", e);
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

module.exports = {
  generateSpeech,
};
