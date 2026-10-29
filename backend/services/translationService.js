/* =========================================================
   BHAGAVAD GITA - AUTO TRANSLATION SERVICE (GUJARATI -> HINDI)
   Powered by Google Gemini AI with Devotional Spiritual Accuracy
   ========================================================= */

const SPEAKER_MAP_HI = {
  "શ્રીભગવાનુવાચ": "श्रीभगवानुवाच",
  "શ્રી ભગવાન ઉવાચ": "श्रीभगवानुवाच",
  "શ્રીકૃષ્ણ ઉવાચ": "श्रीभगवानुवाच",
  "અર્જુન ઉવાચ": "अर्जुन उवाच",
  "અર્જુનઉવાચ": "अर्जुन उवाच",
  "સંજય ઉવાચ": "संजय उवाच",
  "સંજયઉવાચ": "संजय उवाच",
  "ધૃતરાષ્ટ્ર ઉવાચ": "धृतराष्ट्र उवाच",
  "ધૃતરાષ્ટ્રઉવાચ": "धृतराष्ट्र उवाच",
};

const CHAPTER_MAP_HI = {
  1: "अर्जुनविषादयोग",
  2: "सांख्ययोग",
  3: "कर्मयोग",
  4: "ज्ञानकर्मसंन्यासयोग",
  5: "कर्मसंन्यासयोग",
  6: "आत्मसंयमयोग",
  7: "ज्ञानविज्ञानयोग",
  8: "अक्षरब्रह्मयोग",
  9: "राजविद्याराजगुह्ययोग",
  10: "विभूतियोग",
  11: "विश्वरूपदर्शनयोग",
  12: "भक्तियोग",
  13: "क्षेत्र-क्षेत्रज्ञविभागयोग",
  14: "गुणत्रयविभागयोग",
  15: "पुरुषोत्तमयोग",
  16: "दैवासुरसम्पद्विभागयोग",
  17: "श्रद्धात्रयविभागयोग",
  18: "मोक्षसंन्यासयोग",
};

const SPEAKER_MAP_EN = {
  "શ્રીભગવાનુવાચ": "The Blessed Lord said",
  "શ્રી ભગવાન ઉવાચ": "The Blessed Lord said",
  "શ્રીકૃષ્ણ ઉવાચ": "Lord Krishna said",
  "અર્જુન ઉવાચ": "Arjuna said",
  "અર્જુનઉવાચ": "Arjuna said",
  "સંજય ઉવાચ": "Sanjaya said",
  "સંજયઉવાચ": "Sanjaya said",
  "ધૃતરાષ્ટ્ર ઉવાચ": "Dhritarashtra said",
  "ધૃતરાષ્ટ્રઉવાચ": "Dhritarashtra said",
};

const CHAPTER_MAP_EN = {
  1: "Arjuna Vishada Yoga",
  2: "Sankhya Yoga",
  3: "Karma Yoga",
  4: "Jnana Karma Sanyasa Yoga",
  5: "Karma Sanyasa Yoga",
  6: "Atma Samyama Yoga",
  7: "Jnana Vijnana Yoga",
  8: "Akshara Brahma Yoga",
  9: "Raja Vidya Raja Guhya Yoga",
  10: "Vibhuti Yoga",
  11: "Vishwarupa Darshana Yoga",
  12: "Bhakti Yoga",
  13: "Kshetra Kshetrajna Vibhaga Yoga",
  14: "Gunatraya Vibhaga Yoga",
  15: "Purushottama Yoga",
  16: "Daivasura Sampad Vibhaga Yoga",
  17: "Shraddhatraya Vibhaga Yoga",
  18: "Moksha Sanyasa Yoga",
};

// Current ultra-fast, live Gemini models prioritized by latency and reliability
const TRANSLATION_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
];

/**
 * Fetch wrapper with timeout to prevent hanging calls
 */
async function fetchWithTimeout(url, options, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Strips HTML tags for translation if needed
 */
function cleanHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

/**
 * Preserves Sanskrit sub-words when meanings contain '=' breakdowns (e.g. "विराटः = રાજા વિરાટ , च = અને")
 * Ensures the left side before '=' stays exactly as original Sanskrit, while translated meaning stays on right.
 */
function preserveSanskritSubWords(origMeaning, translatedMeaning) {
  if (!origMeaning || !translatedMeaning || typeof origMeaning !== "string" || typeof translatedMeaning !== "string") {
    return translatedMeaning || "";
  }

  // If original does not contain '=', nothing to preserve
  if (!origMeaning.includes("=")) {
    return translatedMeaning;
  }

  // Extract all sub-words from original: e.g. "विराटः = રાજા વિરાટ , च = અને"
  const origParts = origMeaning.split(/[,;\n]/).map((p) => p.trim()).filter(Boolean);
  if (origParts.length === 0 || !origParts.every((p) => p.includes("="))) {
    return translatedMeaning;
  }

  // Extract the original Sanskrit left sides: ["विराटः", "च"]
  const origLeftSides = origParts.map((p) => p.split("=")[0].trim());

  // Check if translatedMeaning contains '='
  if (translatedMeaning.includes("=")) {
    const transParts = translatedMeaning.split(/[,;\n]/).map((p) => p.trim()).filter(Boolean);

    if (transParts.length === origLeftSides.length && transParts.every((p) => p.includes("="))) {
      const fixed = transParts.map((transPart, idx) => {
        const transSplit = transPart.split("=");
        const transRight = transSplit.slice(1).join("=").trim().replace(/[.]+$/, "");
        return `${origLeftSides[idx]} = ${transRight}`;
      });
      return fixed.join(", ");
    }

    // Fallback: match by regex "left = right"
    const regex = /([^=,;]+)\s*=\s*([^=,;]+)/g;
    const matches = [...translatedMeaning.matchAll(regex)];
    if (matches.length === origLeftSides.length) {
      const fixed = matches.map((m, idx) => {
        const transRight = m[2].trim().replace(/[.]+$/, "");
        return `${origLeftSides[idx]} = ${transRight}`;
      });
      return fixed.join(", ");
    }
  }

  return translatedMeaning;
}

/**
 * Translates Gujarati Shlok content into devotional Hindi via Gemini AI
 */
async function translateShlokToHindi({
  chapterNumber,
  chapterName,
  speaker,
  sanskrit,
  translation,
  message,
  wordMeanings = [],
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback defaults if Gemini is offline
  const fallbackSpeakerHi =
    SPEAKER_MAP_HI[String(speaker || "").trim()] ||
    String(speaker || "").trim();

  const fallbackChapterNameHi =
    CHAPTER_MAP_HI[Number(chapterNumber)] ||
    String(chapterName || "").trim();

  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing. Returning fallback Hindi translations.");
    return {
      chapterNameHi: fallbackChapterNameHi,
      speakerHi: fallbackSpeakerHi,
      translationHi: cleanHtml(translation),
      messageHi: cleanHtml(message),
      wordMeanings: (wordMeanings || []).map((w) => ({
        word: w.word,
        meaningHi: w.meaning,
      })),
    };
  }

  const prompt = `You are a revered Sanskrit and Vedic scholar of Srimad Bhagavad Gita.
Translate the following Bhagavad Gita shloka explanation from Gujarati into pure, authentic, devotional Hindi (Devanagari script).

STRICT RULES:
1. SANSKRIT INTEGRITY: The Sanskrit verse and Sanskrit words MUST NOT be modified or translated. Keep them 100% untouched.
2. TRANSLATE TO HINDI:
   - Translate the Gujarati translation (અનુવાદ) into sacred, fluid Hindi (अनुवाद).
   - Translate the Gujarati message/sandesh (સંદેશ) into deep, inspiring Hindi (गीता संदेश).
   - Speaker: "${speaker}" -> Hindi speaker (e.g., श्रीभगवानुवाચ -> श्रीभगवानुवाच, अर्जुन उवाच, etc.).
   - Chapter Name: "${chapterName}" -> Hindi chapter name (e.g. अर्जुनविषादयोग).
   - Word Meanings: For each Sanskrit word, keep 'word' exactly as the Sanskrit word, and translate the Gujarati 'meaning' into clear Hindi 'meaningHi'.
3. OUTPUT FORMAT: Return ONLY a valid JSON object without markdown fences, comments, or extra text:
{
  "chapterNameHi": "...",
  "speakerHi": "...",
  "translationHi": "...",
  "messageHi": "...",
  "wordMeanings": [
    { "word": "Sanskrit word", "meaningHi": "Hindi meaning" }
  ]
}

IMPORTANT FOR WORD MEANINGS:
The user has intentionally split compound Sanskrit words into smaller individual root words (पदच्छेद), or has written Sanskrit sub-words inside the meaning (e.g. "विराटः = રાજા વિરાટ , च = અને").
CRITICAL RULES FOR WORD MEANINGS:
1. DO NOT re-join, merge, or re-segment them. Return exactly one entry per 'id' in 'wordMeanings'.
2. If a meaning contains Sanskrit sub-words broken down with '=' (e.g. "विराटः = રાજા વિરાટ , च = અને"):
   - The Sanskrit words before '=' (like "विराटः", "च") MUST REMAIN EXACTLY IN SANSKRIT (Devanagari script). NEVER translate or alter them!
   - Translate ONLY the Gujarati explanation after '=':
     Example: "विराटः = રાજા વિરાટ , च = અને" -> "विराटः = राजा विराट, च = और"
     Example: "पाण्डवाः = પાંડુપુત્રો , च = અને , एव = જ" -> "पाण्डवाः = पाण्डुपुत्र, च = और, एव = ही"

DATA TO TRANSLATE:
Chapter Number: ${chapterNumber || 1}
Chapter Name (Gujarati): ${chapterName || ""}
Speaker (Gujarati): ${speaker || ""}
Sanskrit Shloka: ${cleanHtml(sanskrit)}
Gujarati Translation: ${cleanHtml(translation)}
Gujarati Message: ${cleanHtml(message)}
Word Meanings (Keep exact IDs and translate meaning into Hindi): ${JSON.stringify(
    (wordMeanings || []).map((w, idx) => ({ id: idx, sanskritWord: String(w.word || '').trim(), gujaratiMeaning: cleanHtml(w.meaning || '') }))
  )}`;

  const cleanKey = String(apiKey).trim();

  for (const modelName of TRANSLATION_MODELS) {
    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
          cleanKey
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": cleanKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.0,
              topK: 1,
              topP: 0.95,
              response_mime_type: "application/json",
            },
          }),
        },
        10000
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (rawText) {
          // Parse JSON, strip any accidental markdown fences if present
          const jsonStr = rawText
            .replace(/^```json/i, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();

          const parsed = JSON.parse(jsonStr);

          // Merge wordMeanings safely so no original Sanskrit word is lost, preserving user's split words
          const originalList = wordMeanings || [];
          const hiMap = new Map();
          (parsed.wordMeanings || []).forEach((item, idx) => {
            if (item) {
              const key = item.id !== undefined ? Number(item.id) : idx;
              hiMap.set(key, item.meaningHi || "");
              if (item.word) hiMap.set(String(item.word).trim(), item.meaningHi || "");
            }
          });

          const mergedWordMeanings = originalList.map((orig, idx) => {
            const rawMeaning =
              hiMap.get(idx) ||
              hiMap.get(String(orig.word).trim()) ||
              parsed.wordMeanings?.[idx]?.meaningHi ||
              orig.meaning;
            const translatedMeaning = preserveSanskritSubWords(orig.meaning, rawMeaning);
            return {
              word: orig.word,
              meaning: orig.meaning,
              meaningHi: translatedMeaning,
            };
          });

          return {
            chapterNameHi: parsed.chapterNameHi || fallbackChapterNameHi,
            speakerHi: parsed.speakerHi || fallbackSpeakerHi,
            translationHi: parsed.translationHi || cleanHtml(translation),
            messageHi: parsed.messageHi || cleanHtml(message),
            wordMeanings: mergedWordMeanings,
          };
        }
      } else {
        const err = await response.text();
        console.warn(`Translation API warning (${modelName}):`, err);
      }
    } catch (err) {
      console.warn(`Translation attempt failed with ${modelName}:`, err.message);
    }
  }

  // Fallback
  return {
    chapterNameHi: fallbackChapterNameHi,
    speakerHi: fallbackSpeakerHi,
    translationHi: cleanHtml(translation),
    messageHi: cleanHtml(message),
    wordMeanings: (wordMeanings || []).map((w) => ({
      word: w.word,
      meaning: w.meaning,
      meaningHi: w.meaning,
    })),
  };
}

/**
 * Translates Gujarati Quiz Question into devotional Hindi via Gemini AI
 */
async function translateQuizToHindi({
  question,
  options = [],
  correctAnswer,
  explanation = "",
  category = "all",
  chapterNumber = null,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const cleanKey = String(apiKey || "").trim();

  const fallback = {
    questionHi: cleanHtml(question),
    optionsHi: (options || []).map((o) => cleanHtml(o)),
    correctAnswerHi: cleanHtml(correctAnswer),
    explanationHi: cleanHtml(explanation),
  };

  if (!cleanKey) {
    console.warn("GEMINI_API_KEY missing. Returning fallback Hindi quiz translation.");
    return fallback;
  }

  const prompt = `You are a revered Vedic and Bhagavad Gita scholar.
Translate the following Bhagavad Gita / Mahabharata Quiz Question, its 4 options, the correct answer, and explanation from Gujarati into authentic, clear, and devotional Hindi (Devanagari script).

STRICT RULES:
1. SANSKRIT / HOLY NAMES INTEGRITY: Keep divine names, characters, Sanskrit terms, and places authentic and dignified (e.g., શ્રીકૃષ્ણ -> श्रीकृष्ण, અર્જુન -> अर्जुन, ભીષ્મ -> भीष्म, કુરુક્ષેત્ર -> कुरुक्षेत्र, ધર્મક્ષેત્રે -> धर्मक्षेत्रे).
2. ACCURATE TRANSLATION:
   - Question: Translate the Gujarati question into clear, natural, grammatically pure Hindi.
   - Options: Translate each of the 4 options accurately in the EXACT SAME ORDER (indexes 0 to 3).
   - Correct Answer: Translate the correct answer to MATCH EXACTLY the text of the translated correct option in optionsHi.
   - Explanation: If provided, translate the Gujarati explanation into inspiring, clear Hindi.
3. OUTPUT FORMAT: Return ONLY a valid JSON object without markdown fences, comments, or extra text:
{
  "questionHi": "...",
  "optionsHi": ["...", "...", "...", "..."],
  "correctAnswerHi": "...",
  "explanationHi": "..."
}

DATA TO TRANSLATE:
Category: ${category || "all"}
Chapter Number: ${chapterNumber || ""}
Gujarati Question: ${cleanHtml(question)}
Gujarati Options: ${JSON.stringify((options || []).map((o) => cleanHtml(o)))}
Gujarati Correct Answer: ${cleanHtml(correctAnswer)}
Gujarati Explanation: ${cleanHtml(explanation)}`;

  for (const modelName of TRANSLATION_MODELS) {
    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
          cleanKey
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": cleanKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.0,
              topK: 1,
              topP: 0.95,
              response_mime_type: "application/json",
            },
          }),
        },
        10000
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (rawText) {
          const jsonStr = rawText
            .replace(/^```json/i, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();

          const parsed = JSON.parse(jsonStr);

          // Find the index of original correct answer to ensure correctAnswerHi perfectly matches optionsHi
          const origIdx = (options || []).findIndex(
            (opt) =>
              String(opt || "").trim().toLowerCase() ===
              String(correctAnswer || "").trim().toLowerCase()
          );

          let finalCorrectAnswerHi = parsed.correctAnswerHi || "";
          const finalOptionsHi = Array.isArray(parsed.optionsHi)
            ? parsed.optionsHi
            : [];

          if (origIdx !== -1 && finalOptionsHi[origIdx]) {
            finalCorrectAnswerHi = finalOptionsHi[origIdx];
          }

          return {
            questionHi: parsed.questionHi || cleanHtml(question),
            optionsHi:
              finalOptionsHi.length === 4
                ? finalOptionsHi
                : fallback.optionsHi,
            correctAnswerHi:
              finalCorrectAnswerHi || cleanHtml(correctAnswer),
            explanationHi:
              parsed.explanationHi || cleanHtml(explanation),
          };
        }
      } else {
        const err = await response.text();
        console.warn(`Quiz Translation API warning (${modelName}):`, err);
      }
    } catch (err) {
      console.warn(`Quiz Translation attempt failed with ${modelName}:`, err.message);
    }
  }

  return fallback;
}

/**
 * Translates Gujarati/Sanskrit Shlok content into devotional English via Gemini AI
 */
async function translateShlokToEnglish({
  chapterNumber,
  chapterName,
  speaker,
  sanskrit,
  translation,
  message,
  wordMeanings = [],
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  const fallbackSpeakerEn =
    SPEAKER_MAP_EN[String(speaker || "").trim()] ||
    String(speaker || "").trim();

  const fallbackChapterNameEn =
    CHAPTER_MAP_EN[Number(chapterNumber)] ||
    String(chapterName || "").trim();

  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing. Returning fallback English translations.");
    return {
      chapterNameEn: fallbackChapterNameEn,
      speakerEn: fallbackSpeakerEn,
      translationEn: cleanHtml(translation),
      messageEn: cleanHtml(message),
      wordMeanings: (wordMeanings || []).map((w) => ({
        word: w.word,
        meaningEn: w.meaningEn || "",
      })),
    };
  }

  const prompt = `You are a revered Vedic and Sanskrit scholar of Srimad Bhagavad Gita.
Translate the following Bhagavad Gita shloka explanation from Gujarati into authentic, devotional, and clear English.

STRICT RULES:
1. SANSKRIT INTEGRITY: The Sanskrit verse and individual Sanskrit words MUST NOT be altered or transliterated. Keep them 100% pure Sanskrit.
2. TRANSLATE TO ENGLISH:
   - Translate the Gujarati translation into dignified, poetic, and spiritual English.
   - Translate the Gujarati message/sandesh into inspiring, practical English commentary.
   - Speaker: "${speaker}" -> English speaker (e.g. "The Blessed Lord said", "Arjuna said", "Sanjaya said", "Dhritarashtra said").
   - Chapter Name: "${chapterName}" -> English chapter name (e.g. "${fallbackChapterNameEn}").
   - Word Meanings: For each Sanskrit word, keep 'word' exactly as the original Sanskrit word, and translate the Gujarati 'meaning' into an accurate English 'meaningEn'.
3. OUTPUT FORMAT: Return ONLY a valid JSON object without markdown formatting:
{
  "chapterNameEn": "...",
  "speakerEn": "...",
  "translationEn": "...",
  "messageEn": "...",
  "wordMeanings": [
    { "word": "Sanskrit word", "meaningEn": "English meaning" }
  ]
}

DATA TO TRANSLATE:
Chapter Number: ${chapterNumber || 1}
Chapter Name: ${chapterName || ""}
Speaker: ${speaker || ""}
Sanskrit Shloka: ${cleanHtml(sanskrit)}
Gujarati Translation: ${cleanHtml(translation)}
Gujarati Message: ${cleanHtml(message)}
Word Meanings: ${JSON.stringify(
    (wordMeanings || []).map((w) => ({ word: w.word, meaning: cleanHtml(w.meaning) }))
  )}`;

  const cleanKey = String(apiKey).trim();

  for (const modelName of TRANSLATION_MODELS) {
    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
          cleanKey
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": cleanKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.0,
              topK: 1,
              topP: 0.95,
              response_mime_type: "application/json",
            },
          }),
        },
        10000
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (rawText) {
          const jsonStr = rawText
            .replace(/^```json/i, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();

          const parsed = JSON.parse(jsonStr);

          const originalList = wordMeanings || [];
          const enMap = new Map();
          (parsed.wordMeanings || []).forEach((item, idx) => {
            if (item) {
              const key = item.id !== undefined ? Number(item.id) : idx;
              enMap.set(key, item.meaningEn || "");
              if (item.word) enMap.set(String(item.word).trim(), item.meaningEn || "");
            }
          });

          const mergedWordMeanings = originalList.map((orig, idx) => {
            const rawMeaning =
              enMap.get(idx) ||
              enMap.get(String(orig.word).trim()) ||
              parsed.wordMeanings?.[idx]?.meaningEn ||
              orig.meaningEn ||
              "";
            const translatedMeaning = preserveSanskritSubWords(orig.meaning, rawMeaning);
            return {
              word: orig.word,
              meaning: orig.meaning,
              meaningHi: orig.meaningHi || "",
              meaningEn: translatedMeaning,
            };
          });

          return {
            chapterNameEn: parsed.chapterNameEn || fallbackChapterNameEn,
            speakerEn: parsed.speakerEn || fallbackSpeakerEn,
            translationEn: parsed.translationEn || cleanHtml(translation),
            messageEn: parsed.messageEn || cleanHtml(message),
            wordMeanings: mergedWordMeanings,
          };
        }
      }
    } catch (err) {
      console.warn(`English Translation attempt failed with ${modelName}:`, err.message);
    }
  }

  return {
    chapterNameEn: fallbackChapterNameEn,
    speakerEn: fallbackSpeakerEn,
    translationEn: cleanHtml(translation),
    messageEn: cleanHtml(message),
    wordMeanings: (wordMeanings || []).map((w) => ({
      word: w.word,
      meaning: w.meaning,
      meaningHi: w.meaningHi || "",
      meaningEn: w.meaningEn || "",
    })),
  };
}

/**
 * Translates Gujarati Quiz Question into devotional English via Gemini AI
 */
async function translateQuizToEnglish({
  question,
  options = [],
  correctAnswer,
  explanation = "",
  category = "all",
  chapterNumber = null,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const cleanKey = String(apiKey || "").trim();

  const fallback = {
    questionEn: cleanHtml(question),
    optionsEn: (options || []).map((o) => cleanHtml(o)),
    correctAnswerEn: cleanHtml(correctAnswer),
    explanationEn: cleanHtml(explanation),
  };

  if (!cleanKey) {
    console.warn("GEMINI_API_KEY missing. Returning fallback English quiz translation.");
    return fallback;
  }

  const prompt = `You are a revered Vedic and Bhagavad Gita scholar.
Translate the following Bhagavad Gita / Mahabharata Quiz Question, its 4 options, the correct answer, and explanation from Gujarati into clear, accurate, and devotional English.

STRICT RULES:
1. HOLY NAMES & SANSKRIT INTEGRITY: Preserve sacred names with standard transliteration (e.g. Lord Krishna, Arjuna, Bhishma, Kurukshetra, Dharma).
2. ACCURACY: Ensure the correct answer maps exactly to one of the 4 translated options.
3. OUTPUT FORMAT: Return ONLY a valid JSON object without markdown:
{
  "questionEn": "...",
  "optionsEn": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswerEn": "Exact matching option text",
  "explanationEn": "..."
}

DATA TO TRANSLATE:
Category: ${category}
Chapter: ${chapterNumber || "General"}
Question: ${cleanHtml(question)}
Options: ${JSON.stringify((options || []).map((o) => cleanHtml(o)))}
Correct Answer: ${cleanHtml(correctAnswer)}
Explanation: ${cleanHtml(explanation)}`;

  for (const modelName of TRANSLATION_MODELS) {
    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
          cleanKey
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": cleanKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.0,
              topK: 1,
              topP: 0.95,
              response_mime_type: "application/json",
            },
          }),
        },
        10000
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (rawText) {
          const jsonStr = rawText
            .replace(/^```json/i, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();

          const parsed = JSON.parse(jsonStr);

          const origIdx = (options || []).findIndex(
            (o) => String(o).trim() === String(correctAnswer).trim()
          );

          let finalCorrectAnswerEn = parsed.correctAnswerEn || "";
          const finalOptionsEn = Array.isArray(parsed.optionsEn)
            ? parsed.optionsEn
            : [];

          if (origIdx !== -1 && finalOptionsEn[origIdx]) {
            finalCorrectAnswerEn = finalOptionsEn[origIdx];
          }

          return {
            questionEn: parsed.questionEn || cleanHtml(question),
            optionsEn:
              finalOptionsEn.length === 4
                ? finalOptionsEn
                : fallback.optionsEn,
            correctAnswerEn:
              finalCorrectAnswerEn || cleanHtml(correctAnswer),
            explanationEn:
              parsed.explanationEn || cleanHtml(explanation),
          };
        }
      }
    } catch (err) {
      console.warn(`Quiz English Translation attempt failed with ${modelName}:`, err.message);
    }
  }

  return fallback;
}

/**
 * Generic caller for Gemini models returning parsed JSON
 */
async function callGeminiJson(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const cleanKey = String(apiKey).trim();

  for (const modelName of TRANSLATION_MODELS) {
    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
          cleanKey
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": cleanKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.0,
              topK: 1,
              topP: 0.95,
              response_mime_type: "application/json",
            },
          }),
        },
        10000
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (rawText) {
          const jsonStr = rawText
            .replace(/^```json/i, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();
          return JSON.parse(jsonStr);
        }
      } else {
        const err = await response.text();
        console.warn(`Gemini call warning (${modelName}):`, err.slice(0, 150));
      }
    } catch (err) {
      console.warn(`Gemini call failed with ${modelName}:`, err.message);
    }
  }
  return null;
}

/**
 * Translates only a specific field (words, translation, or message) into Hindi
 */
async function translateSingleFieldToHindi({
  field,
  sanskrit,
  translation,
  message,
  wordMeanings = [],
}) {
  const cleanSanskrit = cleanHtml(sanskrit || "");
  const cleanTranslation = cleanHtml(translation || "");

  if (field === "words") {
    const itemsToSend = (wordMeanings || []).map((w, idx) => ({
      id: idx,
      sanskritWord: String(w.word || "").trim(),
      gujaratiMeaning: cleanHtml(w.meaning || ""),
    }));

    const prompt = `You are a revered Vedic and Sanskrit scholar of Srimad Bhagavad Gita, adhering strictly to the sacred, devotional standard of Gita Press Gorakhpur (श्रीमद्भगवद्गीता - गीताप्रेस गोरखपुर शैली).
Translate the following Sanskrit word meanings (પદચ્છેદ અને શબ્દાર્થ) from Gujarati into pure, authentic, grammatically precise Hindi (Devanagari script).

CONTEXT OF THE SACRED VERSE:
${cleanSanskrit ? `Sanskrit Shloka: ${cleanSanskrit}` : ""}
${cleanTranslation ? `Full Gujarati Translation of Shloka: ${cleanTranslation}` : ""}

STRICT SCHOLARLY RULES:
1. CONTEXTUAL ACCURACY ON FIRST TRY: Use the full Sanskrit Shloka and Gujarati translation context above to translate each word's Gujarati meaning into its exact, classical Hindi devotional equivalent. Produce a definitive, high-precision translation.
2. 1:1 DIRECT MAPPING: Return exactly one entry for EVERY 'id' from 0 to ${itemsToSend.length - 1} in the exact same sequence.
3. SANSKRIT WORD INTEGRITY: The Sanskrit words in 'sanskritWord' must never be changed.
4. CRITICAL RULE FOR EQUAL SIGN ('='):
   When 'gujaratiMeaning' contains Sanskrit sub-words broken down with '=' (e.g. "विराटः = રાજા વિરાટ , च = અને"):
   - The Sanskrit words BEFORE '=' (such as "विराटः", "च") MUST REMAIN 100% PURE SANSKRIT IN DEVANAGARI SCRIPT. NEVER translate, transliterate, or alter them!
   - Translate ONLY the Gujarati explanation AFTER '=':
     Example: "विराटः = રાજા વિરાટ , च = અને" -> "विराटः = राजा विराट, च = और"
     Example: "पाण्डवाः = પાંડુપુત્રો , च = અને , एव = જ" -> "पाण्डवाः = पाण्डुपुत्र, च = और, एव = ही"
5. OUTPUT FORMAT: Return ONLY a valid JSON object:
{
  "wordMeanings": [
    { "id": 0, "meaningHi": "Hindi meaning" }
  ]
}

ITEMS TO TRANSLATE:
${JSON.stringify(itemsToSend)}`;

    const parsed = await callGeminiJson(prompt);
    if (!parsed || !Array.isArray(parsed.wordMeanings) || parsed.wordMeanings.length === 0) {
      throw new Error("AI દ્વારા શબ્દાર્થનો હિન્દી અનુવાદ પ્રાપ્ત થઈ શક્યો નથી. કૃપા કરીને થોડી વાર પછી ફરી પ્રયાસ કરો.");
    }

    const hiMap = new Map();
    parsed.wordMeanings.forEach((item, idx) => {
      if (item) {
        const key = item.id !== undefined ? Number(item.id) : idx;
        hiMap.set(key, item.meaningHi || "");
        if (item.sanskritWord) hiMap.set(String(item.sanskritWord).trim(), item.meaningHi || "");
        if (item.word) hiMap.set(String(item.word).trim(), item.meaningHi || "");
      }
    });

    return {
      wordMeanings: (wordMeanings || []).map((orig, idx) => {
        const rawMeaning =
          hiMap.get(idx) ||
          hiMap.get(String(orig.word).trim()) ||
          orig.meaningHi ||
          "";
        return {
          ...orig,
          word: orig.word, // 100% Guaranteed: The user's exact small Sanskrit word is preserved untouched!
          meaningHi: preserveSanskritSubWords(orig.meaning, rawMeaning),
        };
      }),
    };
  }

  if (field === "translation") {
    const wordContext = (wordMeanings || [])
      .filter((w) => w.word && w.meaning)
      .map((w) => `${w.word} = ${cleanHtml(w.meaning)}`)
      .join(", ");

    const prompt = `You are a revered Vedic and Sanskrit scholar of Srimad Bhagavad Gita, adhering to the devotional standard of Gita Press Gorakhpur (गीताप्रेस गोरखपुर).
Translate the following Bhagavad Gita verse translation (શ્લોકાર્થ / અનુવાદ) from Gujarati into pure, sacred, fluid, and grammatically impeccable Hindi (अनुवाद).

CONTEXT OF THE SHLOKA:
${cleanSanskrit ? `Sanskrit Verse: ${cleanSanskrit}` : ""}
${wordContext ? `Word-by-word Breakdown (शब्दार्थ): ${wordContext}` : ""}

INPUT TO TRANSLATE:
Gujarati Translation: ${translation}

STRICT INSTRUCTIONS:
- Faithfully reflect the sacred meaning of the Shloka in dignified, reverent Hindi (गीताप्रेस गोरखपुर शैली).
- Preserve any HTML formatting (e.g. <b>, <i>, <p>, <br>) exactly as provided.
- Deliver an authoritative, definitive, and accurate translation on the first try.

Return ONLY valid JSON:
{
  "translationHi": "Hindi translation..."
}`;

    const parsed = await callGeminiJson(prompt);
    if (!parsed || !parsed.translationHi || !parsed.translationHi.trim()) {
      throw new Error("AI દ્વારા શ્લોકાર્થનો હિન્દી અનુવાદ પ્રાપ્ત થઈ શક્યો નથી. કૃપા કરીને થોડી વાર પછી ફરી પ્રયાસ કરો.");
    }
    return {
      translationHi: parsed.translationHi.trim(),
    };
  }

  if (field === "message") {
    const prompt = `You are a revered spiritual master and scholar of Srimad Bhagavad Gita.
Translate the following Bhagavad Gita divine message / spiritual commentary (ગીતા સંદેશ) from Gujarati into profound, inspiring, philosophically accurate, and practical Hindi (गीता संदेश).

CONTEXT OF THE SHLOKA:
${cleanSanskrit ? `Sanskrit Verse: ${cleanSanskrit}` : ""}
${cleanTranslation ? `Verse Translation: ${cleanTranslation}` : ""}

INPUT TO TRANSLATE:
Gujarati Message: ${message}

STRICT INSTRUCTIONS:
- Translate into deep, uplifting, devotional Hindi that provides spiritual wisdom and practical life clarity.
- Preserve any HTML formatting (e.g. <ul>, <li>, <b>, <i>, <p>, <br>) exactly as provided.
- Ensure the translation is authoritative and complete on the first try.

Return ONLY valid JSON:
{
  "messageHi": "Hindi message..."
}`;

    const parsed = await callGeminiJson(prompt);
    if (!parsed || !parsed.messageHi || !parsed.messageHi.trim()) {
      throw new Error("AI દ્વારા સંદેશનો હિન્દી અનુવાદ પ્રાપ્ત થઈ શક્યો નથી. કૃપા કરીને થોડી વાર પછી ફરી પ્રયાસ કરો.");
    }
    return {
      messageHi: parsed.messageHi.trim(),
    };
  }

  return {};
}

/**
 * Translates only a specific field (words, translation, or message) into English
 */
async function translateSingleFieldToEnglish({
  field,
  sanskrit,
  translation,
  message,
  wordMeanings = [],
}) {
  const cleanSanskrit = cleanHtml(sanskrit || "");
  const cleanTranslation = cleanHtml(translation || "");

  if (field === "words") {
    const itemsToSend = (wordMeanings || []).map((w, idx) => ({
      id: idx,
      sanskritWord: String(w.word || "").trim(),
      gujaratiMeaning: cleanHtml(w.meaning || ""),
    }));

    const prompt = `You are a revered Vedic and Sanskrit scholar of Srimad Bhagavad Gita (standard of Swami Sivananda / Eknath Easwaran).
Translate the following Sanskrit word meanings (પદચ્છેદ અને શબ્દાર્થ) from Gujarati into authentic, precise, and clear English.

CONTEXT OF THE SACRED VERSE:
${cleanSanskrit ? `Sanskrit Shloka: ${cleanSanskrit}` : ""}
${cleanTranslation ? `Full Gujarati Translation of Shloka: ${cleanTranslation}` : ""}

STRICT SCHOLARLY RULES:
1. CONTEXTUAL ACCURACY ON FIRST TRY: Use the full Sanskrit Shloka and Gujarati translation context above to translate each word's Gujarati meaning into its exact, classical English equivalent.
2. 1:1 DIRECT MAPPING: Return exactly one entry for EVERY 'id' from 0 to ${itemsToSend.length - 1} in the exact same sequence.
3. SANSKRIT WORD INTEGRITY: Never translate or alter the Sanskrit words in 'sanskritWord'.
   When 'gujaratiMeaning' contains Sanskrit sub-words broken down with '=' (e.g. "विराटः = રાજા વિરાટ , च = અને"):
   - The Sanskrit words before '=' (like "विराटः", "च") MUST REMAIN EXACTLY IN SANSKRIT (Devanagari script). NEVER translate or transliterate them into English! (DO NOT write "Virata = King Virata, and = and", IT MUST BE "विराटः = King Virata, च = and").
   - Translate ONLY the Gujarati explanation after '=':
     Example: "विराटः = રાજા વિરાટ , च = અને" -> "विराटः = King Virata, च = and"
     Example: "पाण्डवाः = પાંડુપુત્રો , च = અને , एव = જ" -> "पाण्डवाः = sons of Pandu, च = and, एव = only/indeed"
4. Output format: Return ONLY a valid JSON object:
{
  "wordMeanings": [
    { "id": 0, "meaningEn": "English meaning" },
    { "id": 1, "meaningEn": "English meaning" }
  ]
}

ITEMS TO TRANSLATE:
${JSON.stringify(itemsToSend)}`;

    const parsed = await callGeminiJson(prompt);
    if (!parsed || !Array.isArray(parsed.wordMeanings) || parsed.wordMeanings.length === 0) {
      throw new Error("AI દ્વારા શબ્દાર્થનો અંગ્રેજી અનુવાદ પ્રાપ્ત થઈ શક્યો નથી. કૃપા કરીને ફરી પ્રયાસ કરો.");
    }

    const enMap = new Map();
    parsed.wordMeanings.forEach((item, idx) => {
      if (item) {
        const key = item.id !== undefined ? Number(item.id) : idx;
        enMap.set(key, item.meaningEn || "");
        if (item.sanskritWord) enMap.set(String(item.sanskritWord).trim(), item.meaningEn || "");
        if (item.word) enMap.set(String(item.word).trim(), item.meaningEn || "");
      }
    });

    return {
      wordMeanings: (wordMeanings || []).map((orig, idx) => {
        const rawMeaning =
          enMap.get(idx) ||
          enMap.get(String(orig.word).trim()) ||
          orig.meaningEn ||
          "";
        return {
          ...orig,
          word: orig.word, // 100% Guaranteed: The user's exact small Sanskrit word is preserved untouched!
          meaningEn: preserveSanskritSubWords(orig.meaning, rawMeaning),
        };
      }),
    };
  }

  if (field === "translation") {
    const wordContext = (wordMeanings || [])
      .filter((w) => w.word && w.meaning)
      .map((w) => `${w.word} = ${cleanHtml(w.meaning)}`)
      .join(", ");

    const prompt = `You are a revered Vedic scholar of Srimad Bhagavad Gita (standard of Swami Sivananda / Eknath Easwaran).
Translate the following Bhagavad Gita verse translation from Gujarati into dignified, poetic, devotional, and clear English.

CONTEXT OF THE SHLOKA:
${cleanSanskrit ? `Sanskrit Verse: ${cleanSanskrit}` : ""}
${wordContext ? `Word-by-word Breakdown (शब्दार्थ): ${wordContext}` : ""}

INPUT TO TRANSLATE:
Gujarati Translation: ${translation}

STRICT INSTRUCTIONS:
- Deliver an authoritative, devotional, and authentic English translation of the holy verse on the first try.
- Preserve any HTML formatting (e.g. <b>, <i>, <p>, <br>) exactly as provided.

Return ONLY valid JSON:
{
  "translationEn": "English translation..."
}`;

    const parsed = await callGeminiJson(prompt);
    if (!parsed || !parsed.translationEn || !parsed.translationEn.trim()) {
      throw new Error("AI દ્વારા શ્લોકાર્થનો અંગ્રેજી અનુવાદ પ્રાપ્ત થઈ શક્યો નથી. કૃપા કરીને ફરી પ્રયાસ કરો.");
    }
    return {
      translationEn: parsed.translationEn.trim(),
    };
  }

  if (field === "message") {
    const prompt = `You are a revered spiritual teacher and scholar of Srimad Bhagavad Gita.
Translate the following Bhagavad Gita divine message / spiritual commentary (ગીતા સંદેશ) from Gujarati into inspiring, practical, and profound English commentary.

CONTEXT OF THE SHLOKA:
${cleanSanskrit ? `Sanskrit Verse: ${cleanSanskrit}` : ""}
${cleanTranslation ? `Verse Translation: ${cleanTranslation}` : ""}

INPUT TO TRANSLATE:
Gujarati Message: ${message}

STRICT INSTRUCTIONS:
- Deliver an insightful, uplifting English spiritual commentary providing practical life guidance and eternal wisdom on the first try.
- Preserve any HTML formatting (e.g. <ul>, <li>, <b>, <i>, <p>, <br>) exactly as provided.

Return ONLY valid JSON:
{
  "messageEn": "English message commentary..."
}`;

    const parsed = await callGeminiJson(prompt);
    if (!parsed || !parsed.messageEn || !parsed.messageEn.trim()) {
      throw new Error("AI દ્વારા સંદેશનો અંગ્રેજી અનુવાદ પ્રાપ્ત થઈ શક્યો નથી. કૃપા કરીને ફરી પ્રયાસ કરો.");
    }
    return {
      messageEn: parsed.messageEn.trim(),
    };
  }

  return {};
}

module.exports = {
  translateShlokToHindi,
  translateShlokToEnglish,
  translateSingleFieldToHindi,
  translateSingleFieldToEnglish,
  translateQuizToHindi,
  translateQuizToEnglish,
  SPEAKER_MAP_HI,
  SPEAKER_MAP_EN,
  CHAPTER_MAP_HI,
  CHAPTER_MAP_EN,
};

