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

DATA TO TRANSLATE:
Chapter Number: ${chapterNumber || 1}
Chapter Name (Gujarati): ${chapterName || ""}
Speaker (Gujarati): ${speaker || ""}
Sanskrit Shloka: ${cleanHtml(sanskrit)}
Gujarati Translation: ${cleanHtml(translation)}
Gujarati Message: ${cleanHtml(message)}
Word Meanings: ${JSON.stringify(
    (wordMeanings || []).map((w) => ({ word: w.word, meaning: cleanHtml(w.meaning) }))
  )}`;

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
  ];

  const cleanKey = String(apiKey).trim();

  for (const modelName of modelsToTry) {
    try {
      const response = await fetch(
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
              temperature: 0.2,
              response_mime_type: "application/json",
            },
          }),
        }
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

          // Merge wordMeanings safely so no original Sanskrit word is lost
          const originalList = wordMeanings || [];
          const translatedMap = new Map();
          (parsed.wordMeanings || []).forEach((item) => {
            if (item && item.word) {
              translatedMap.set(String(item.word).trim(), item.meaningHi || "");
            }
          });

          const mergedWordMeanings = originalList.map((orig, idx) => {
            const translatedMeaning =
              translatedMap.get(String(orig.word).trim()) ||
              parsed.wordMeanings?.[idx]?.meaningHi ||
              orig.meaning;
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

module.exports = {
  translateShlokToHindi,
  SPEAKER_MAP_HI,
  CHAPTER_MAP_HI,
};

