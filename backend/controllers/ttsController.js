const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");
const crypto = require("crypto");

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
};

// In-memory audio buffer cache (stores up to 300 shloka audio clips for zero latency and zero repeated timeouts)
const audioCache = new Map();
const MAX_CACHE_SIZE = 300;

const generateSpeech = async (req, res) => {
  try {
    const { text, lang = "gu", voice = "male" } = req.body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required for speech synthesis.",
      });
    }

    let cleanText = text.trim();
    // Ensure 1-second natural pause after speaker names / colons / point titles
    cleanText = cleanText.replace(/\s*[:：]\s*/g, ". ... ");
    cleanText = cleanText.replace(/(\.\s*\.\.\.\s*)+/g, ". ... ");
    const voiceLang = VOICE_MAP[lang] ? lang : "gu";
    const selectedVoice = VOICE_MAP[voiceLang][voice] || VOICE_MAP[voiceLang].male;

    // Check memory cache first
    const cacheKey = crypto
      .createHash("md5")
      .update(`${selectedVoice}:${cleanText}`)
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

    // Resilient generation with retry (up to 3 attempts with fresh MsEdgeTTS instances)
    let audioBuffer = null;
    let lastError = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const tts = new MsEdgeTTS({ connectionTimeoutMs: 25000, synthesisTimeoutMs: 60000 });
        await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const { audioStream } = tts.toStream(cleanText);

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

    // Save to cache
    if (audioCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = audioCache.keys().next().value;
      audioCache.delete(oldestKey);
    }
    audioCache.set(cacheKey, audioBuffer);

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
