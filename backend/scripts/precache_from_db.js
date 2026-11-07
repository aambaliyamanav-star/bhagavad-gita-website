const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");
const Shlok = require("../models/Shlok");

const MONGO_URI =
  "mongodb+srv://aambaliyamanav_db_user:Kishna2007@cluster0.atg2ikc.mongodb.net/bhagavad_gita?appName=Cluster0";

const CACHE_DIR = path.join(__dirname, "../audio_cache");
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const VOICE_MAP = {
  gu: { male: "gu-IN-NiranjanNeural" },
  sa: { male: "hi-IN-MadhurNeural" },
};

function removeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|blockquote|h[1-6]|tr)>/gi, "\n")
    .replace(/<(div|p|li|blockquote|h[1-6]|tr)[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

function extractCleanTextForSpeech(htmlString) {
  if (!htmlString) return "";
  try {
    let preprocessed = String(htmlString)
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(p|div|li|h[1-6])>/gi, " . ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&");
    let text = preprocessed.replace(/<[^>]*>/g, "");
    text = text.replace(/\s*[:：]\s*/g, " . ... ");
    text = text.replace(/[•\-\*]/g, " ");
    text = text.replace(/\s+/g, " ").trim();
    text = text.replace(/(\.\s*\.\.\.\s*)+/g, ". ... ");
    return text;
  } catch (e) {
    return String(htmlString).replace(/<[^>]*>/g, " ").trim();
  }
}

function formatSanskritForSpeech(shlokObj) {
  if (!shlokObj) return "";
  let plain = removeHtml(shlokObj.sanskrit || "");
  if (!plain && (shlokObj.sanskritLine1 || shlokObj.sanskritLine2)) {
    plain = [shlokObj.sanskritLine1, shlokObj.sanskritLine2].filter(Boolean).join("\n");
  }
  plain = plain.replace(/[॥\|]\s*[\d\.\-०-९]+\s*[॥\|]/g, "।");
  const rawLines = plain
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const rhythmLines = rawLines
    .map((line) => {
      let cleanLine = line.replace(/[|।॥]+$/g, "").trim();
      const words = cleanLine.split(/\s+/).filter((w) => !/^[|।॥\d\.\-०-९]+$/.test(w));
      if (words.length >= 4) {
        const half = Math.ceil(words.length / 2);
        const pada1 = words.slice(0, half).join(" ");
        const pada2 = words.slice(half).join(" ");
        return `${pada1}, ${pada2} ।`;
      } else if (words.length > 0) {
        return `${words.join(" ")} ।`;
      }
      return "";
    })
    .filter(Boolean);

  return rhythmLines.join("\n\n");
}

function getCleanTtsText(text) {
  let cleanText = String(text || "").trim();
  cleanText = cleanText.replace(/<[^>]*>/g, " ");
  cleanText = cleanText.replace(/&nbsp;/gi, " ");
  cleanText = cleanText.replace(/&amp;/gi, " and ");
  cleanText = cleanText.replace(/[&<>]/g, " ");
  cleanText = cleanText.replace(/\s*[:：]\s*/g, ". ... ");
  cleanText = cleanText.replace(/(\.\s*\.\.\.\s*)+/g, ". ... ");
  return cleanText.replace(/\s+/g, " ").trim();
}

function computeCacheKey(cleanText, lang, customRate = null) {
  const voiceLang = VOICE_MAP[lang] ? lang : "gu";
  const selectedVoice = VOICE_MAP[voiceLang].male;
  const rate = customRate !== null ? customRate : lang === "sa" ? "-22%" : "-2%";
  const pitch = lang === "sa" ? "-2Hz" : "+0Hz";
  return crypto
    .createHash("md5")
    .update(`${selectedVoice}:${rate}:${pitch}:${cleanText}`)
    .digest("hex");
}

async function synthesizeToFile(cleanText, lang, customRate, filePath) {
  if (fs.existsSync(filePath)) {
    return true; // Already cached
  }
  const voiceLang = VOICE_MAP[lang] ? lang : "gu";
  const selectedVoice = VOICE_MAP[voiceLang].male;
  const prosodyOptions = {
    rate: customRate !== null ? customRate : lang === "sa" ? "-22%" : "-2%",
    pitch: lang === "sa" ? "-2Hz" : "+0Hz",
  };

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
      const buffer = Buffer.concat(chunks);
      if (buffer.length > 0) {
        fs.writeFileSync(filePath, buffer);
        return true;
      }
    } catch (err) {
      if (attempt < 3) await new Promise((r) => setTimeout(r, 600));
    }
  }
  return false;
}

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB successfully!");

  const chapters = [1, 2];
  const allTasks = [];

  for (const ch of chapters) {
    const shlokas = await Shlok.find({ chapterNumber: ch }).sort({ shlokNumber: 1 });
    console.log(`Chapter ${ch}: Found ${shlokas.length} full shlokas in MongoDB.`);

    for (const s of shlokas) {
      // 1. Sanskrit
      const rawSa = formatSanskritForSpeech(s);
      const cleanSa = getCleanTtsText(rawSa);
      if (cleanSa) {
        const saKey = computeCacheKey(cleanSa, "sa", "-22%");
        allTasks.push({
          label: `Ch ${ch} Sh ${s.shlokNumber} [Sanskrit]`,
          text: cleanSa,
          lang: "sa",
          rate: "-22%",
          filePath: path.join(CACHE_DIR, `${saKey}.mp3`),
        });
      }

      // 2. Translation (gu)
      const rawTr = extractCleanTextForSpeech(s.translation);
      const cleanTr = getCleanTtsText(rawTr);
      if (cleanTr) {
        const trKey = computeCacheKey(cleanTr, "gu", "-2%");
        allTasks.push({
          label: `Ch ${ch} Sh ${s.shlokNumber} [Translation]`,
          text: cleanTr,
          lang: "gu",
          rate: "-2%",
          filePath: path.join(CACHE_DIR, `${trKey}.mp3`),
        });
      }

      // 3. Message (gu)
      const rawMsg = extractCleanTextForSpeech(s.message);
      const cleanMsg = getCleanTtsText(rawMsg);
      if (cleanMsg) {
        const msgKey = computeCacheKey(cleanMsg, "gu", "-2%");
        allTasks.push({
          label: `Ch ${ch} Sh ${s.shlokNumber} [Message]`,
          text: cleanMsg,
          lang: "gu",
          rate: "-2%",
          filePath: path.join(CACHE_DIR, `${msgKey}.mp3`),
        });
      }
    }
  }

  console.log(`Total audio clips to verify/generate: ${allTasks.length}`);

  let completed = 0;
  let alreadyCached = 0;
  let newlyGenerated = 0;
  let taskIndex = 0;
  const CONCURRENCY = 4;

  async function worker(id) {
    while (taskIndex < allTasks.length) {
      const task = allTasks[taskIndex++];
      if (!task) break;

      if (fs.existsSync(task.filePath)) {
        alreadyCached++;
      } else {
        const ok = await synthesizeToFile(task.text, task.lang, task.rate, task.filePath);
        if (ok) newlyGenerated++;
      }
      completed++;

      if (completed % 10 === 0 || completed === allTasks.length) {
        console.log(
          `Progress: ${completed}/${allTasks.length} (${Math.round(
            (completed / allTasks.length) * 100
          )}%) [Already: ${alreadyCached}, New: ${newlyGenerated}]`
        );
      }
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(i));
  }

  await Promise.all(workers);
  console.log("\nALL CHAPTER 1 & 2 AUDIOS PRE-CACHED SUCCESSFULLY!");
  console.log(`Total in audio_cache: ${alreadyCached + newlyGenerated}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
