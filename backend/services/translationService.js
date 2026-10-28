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

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
  ];

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
          const jsonStr = rawText
            .replace(/^```json/i, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();

          const parsed = JSON.parse(jsonStr);

          const originalList = wordMeanings || [];
          const translatedMap = new Map();
          (parsed.wordMeanings || []).forEach((item) => {
            if (item && item.word) {
              translatedMap.set(String(item.word).trim(), item.meaningEn || "");
            }
          });

          const mergedWordMeanings = originalList.map((orig, idx) => {
            const translatedMeaning =
              translatedMap.get(String(orig.word).trim()) ||
              parsed.wordMeanings?.[idx]?.meaningEn ||
              orig.meaningEn ||
              "";
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

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-flash-lite-latest",
  ];

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

module.exports = {
  translateShlokToHindi,
  translateShlokToEnglish,
  translateQuizToHindi,
  translateQuizToEnglish,
  SPEAKER_MAP_HI,
  SPEAKER_MAP_EN,
  CHAPTER_MAP_HI,
  CHAPTER_MAP_EN,
};

