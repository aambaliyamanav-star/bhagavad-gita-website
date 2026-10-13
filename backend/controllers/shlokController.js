const Shlok = require("../models/Shlok");
const { translateShlokToHindi } = require("../services/translationService");

// =====================================================
// CLEAN WORD
// =====================================================

const normalizeWord = (word) => {
  return String(word || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(
      /[।॥,:;!?()[\]{}"“”‘’'`|/\\]/g,
      ""
    )
    .trim();
};

// =====================================================
// REMOVE HTML
// =====================================================

const removeHtml = (html) => {
  if (!html) {
    return "";
  }

  return String(html)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<\/div>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// =====================================================
// EXTRACT SANSKRIT WORDS
// =====================================================

const extractWordsFromSanskrit = (sanskrit) => {
  const plainText = removeHtml(sanskrit);

  if (!plainText) {
    return [];
  }

  return plainText
    .split(/\s+/)
    .map((word) => normalizeWord(word))
    .filter(Boolean);
};

// =====================================================
// CLEAN WORD MEANING LIST
// =====================================================

const cleanWordMeanings = (wordMeanings) => {
  if (!Array.isArray(wordMeanings)) {
    return [];
  }

  return wordMeanings
    .map((item) => {
      if (!item) {
        return null;
      }

      return {
        word: String(item.word || "").trim(),
        meaning: String(
          item.meaning || ""
        ).trim(),
        meaningHi: String(
          item.meaningHi || ""
        ).trim(),
      };
    })
    .filter((item) => item && item.word);
};

// =====================================================
// PREPARE WORD MEANINGS
// =====================================================

const prepareWordMeanings = (
  sanskrit,
  oldWordMeanings = [],
  submittedWordMeanings = []
) => {
  const detectedWords =
    extractWordsFromSanskrit(
      sanskrit
    );

  const oldList =
    cleanWordMeanings(
      oldWordMeanings
    );

  const submittedList =
    cleanWordMeanings(
      submittedWordMeanings
    );

  const result = [];

  detectedWords.forEach(
    (detectedWord, index) => {
      const normalizedDetected =
        normalizeWord(
          detectedWord
        );

      // -----------------------------------------------
      // SUBMITTED DATA BY SAME INDEX
      // -----------------------------------------------

      const submittedByIndex =
        submittedList[index];

      if (submittedByIndex) {
        const submittedWord =
          submittedByIndex.word.trim();

        const submittedMeaning =
          submittedByIndex.meaning.trim();

        const submittedMeaningHi =
          submittedByIndex.meaningHi ? submittedByIndex.meaningHi.trim() : "";

        if (submittedWord) {
          result.push({
            word: submittedWord,
            meaning:
              submittedMeaning,
            meaningHi:
              submittedMeaningHi,
          });

          return;
        }
      }

      // -----------------------------------------------
      // FIND OLD MEANING USING ORIGINAL WORD
      // -----------------------------------------------

      const oldByOriginalWord =
        oldList.find(
          (item) =>
            normalizeWord(
              item.word
            ) ===
            normalizedDetected
        );

      if (oldByOriginalWord) {
        result.push({
          word: detectedWord,
          meaning:
            oldByOriginalWord.meaning ||
            "",
          meaningHi:
            oldByOriginalWord.meaningHi ||
            "",
        });

        return;
      }

      // -----------------------------------------------
      // FIND OLD DATA BY INDEX
      // -----------------------------------------------

      const oldByIndex =
        oldList[index];

      if (oldByIndex) {
        result.push({
          word:
            oldByIndex.word ||
            detectedWord,

          meaning:
            oldByIndex.meaning ||
            "",

          meaningHi:
            oldByIndex.meaningHi ||
            "",
        });

        return;
      }

      // -----------------------------------------------
      // NEW WORD
      // -----------------------------------------------

      result.push({
        word: detectedWord,
        meaning: "",
        meaningHi: "",
      });
    }
  );

  // ===================================================
  // ADD MANUALLY ADDED WORDS
  // ===================================================

  submittedList.forEach(
    (submittedItem) => {
      const submittedWord =
        submittedItem.word.trim();

      if (!submittedWord) {
        return;
      }

      const alreadyExists =
        result.some(
          (item) =>
            normalizeWord(
              item.word
            ) ===
            normalizeWord(
              submittedWord
            )
        );

      if (!alreadyExists) {
        result.push({
          word: submittedWord,
          meaning:
            submittedItem.meaning.trim(),
          meaningHi:
            String(submittedItem.meaningHi || "").trim(),
        });
      }
    }
  );

  return result;
};

// =====================================================
// ADD NEW SHLOK
// =====================================================

const addShlok = async (req, res) => {
  try {
    let {
      chapterNumber,
      chapterName,
      chapterNameHi,
      shlokNumber,
      speaker,
      speakerHi,
      sanskrit,
      wordMeanings,
      translation,
      translationHi,
      message,
      messageHi,
    } = req.body;

    if (
      !chapterNumber ||
      !chapterName ||
      !shlokNumber ||
      !speaker ||
      !sanskrit ||
      !translation ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message:
          "બધી માહિતી ભરવી જરૂરી છે.",
      });
    }

    const existingShlok =
      await Shlok.findOne({
        chapterNumber:
          Number(chapterNumber),

        shlokNumber:
          Number(shlokNumber),
      });

    if (existingShlok) {
      return res.status(400).json({
        success: false,
        message:
          `અધ્યાય ${chapterNumber} માં શ્લોક ${shlokNumber} પહેલેથી જ છે.`,
      });
    }

    let preparedWordMeanings =
      prepareWordMeanings(
        sanskrit,
        [],
        wordMeanings
      );

    // If Hindi translation is missing, auto-translate automatically using Gemini AI
    if (!translationHi || !messageHi) {
      try {
        const auto = await translateShlokToHindi({
          chapterNumber,
          chapterName,
          speaker,
          sanskrit,
          translation,
          message,
          wordMeanings: preparedWordMeanings,
        });

        if (!chapterNameHi) chapterNameHi = auto.chapterNameHi;
        if (!speakerHi) speakerHi = auto.speakerHi;
        if (!translationHi) translationHi = auto.translationHi;
        if (!messageHi) messageHi = auto.messageHi;
        preparedWordMeanings = auto.wordMeanings;
      } catch (err) {
        console.warn("Auto-translate in addShlok failed:", err.message);
      }
    }

    const shlok =
      new Shlok({
        chapterNumber:
          Number(chapterNumber),

        chapterName:
          String(
            chapterName
          ).trim(),

        chapterNameHi:
          String(
            chapterNameHi || ""
          ).trim(),

        shlokNumber:
          Number(shlokNumber),

        speaker:
          String(
            speaker
          ).trim(),

        speakerHi:
          String(
            speakerHi || ""
          ).trim(),

        sanskrit:
          String(
            sanskrit
          ).trim(),

        wordMeanings:
          preparedWordMeanings,

        translation:
          String(
            translation
          ).trim(),

        translationHi:
          String(
            translationHi || ""
          ).trim(),

        message:
          String(
            message
          ).trim(),

        messageHi:
          String(
            messageHi || ""
          ).trim(),
      });

    const savedShlok =
      await shlok.save();

    res.status(201).json({
      success: true,

      message:
        "Shlok successfully added ✅",

      shlok:
        savedShlok,
    });
  } catch (error) {
    console.error(
      "Add Shlok Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Error adding shlok",

      error:
        error.message,
    });
  }
};

// =====================================================
// GET ALL SHLOKAS
// =====================================================

const getAllShlokas = async (
  req,
  res
) => {
  try {
    const shlokas =
      await Shlok.find()
        .sort({
          chapterNumber: 1,
          shlokNumber: 1,
        })
        .lean();

    // =====================================================
    // LOGGED-OUT USER: RESTRICT CONTENT FOR SHLOKAS 6+
    // =====================================================

    if (!req.user) {
      // Calculate today's index in IST so Aaj no shlok is NEVER stripped
      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

      const dateNumber = Number(today.replace(/-/g, ""));
      const todayIndex = shlokas.length > 0 ? dateNumber % shlokas.length : -1;

      const publicShlokas = shlokas.map((shloka, index) => {
        // Shlok 1–5 OR Today's Shlok → Full content
        if (Number(shloka.shlokNumber) <= 5 || index === todayIndex) {
          return shloka;
        }

        // Shlok 6+ → Only metadata (safe for chapter counts / shlok selectors)
        return {
          _id: shloka._id,
          chapterNumber: shloka.chapterNumber,
          chapterName: shloka.chapterName,
          shlokNumber: shloka.shlokNumber,
        };
      });

      return res.status(200).json({
        success: true,
        shlokas: publicShlokas,
      });
    }

    // =====================================================
    // LOGGED-IN USER: FULL ACCESS
    // =====================================================

    res.status(200).json({
      success: true,
      shlokas,
    });
  } catch (error) {
    console.error(
      "Get All Shlokas Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Error fetching shlokas",

      error:
        error.message,
    });
  }
};

// =====================================================
// GET CHAPTER SHLOKAS
// =====================================================

const getChapterShlokas = async (
  req,
  res
) => {
  try {
    const chapterNumber =
      Number(
        req.params.chapterNumber
      );

    if (
      !chapterNumber ||
      chapterNumber < 1 ||
      chapterNumber > 18
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid chapter number.",
      });
    }

    const shlokas =
      await Shlok.find({
        chapterNumber:
          chapterNumber,
      })
        .sort({
          shlokNumber: 1,
        })
        .lean();

    // =====================================================
    // LOGGED-OUT USER
    // =====================================================

    if (!req.user) {
      const publicShlokas =
        shlokas.map((shloka) => {
          // Shlok 1–5 → Full content
          if (
            Number(
              shloka.shlokNumber
            ) <= 5
          ) {
            return shloka;
          }

          // Shlok 6+ → Only button information
          return {
            _id: shloka._id,
            chapterNumber:
              shloka.chapterNumber,
            chapterName:
              shloka.chapterName,
            shlokNumber:
              shloka.shlokNumber,
          };
        });

      return res.status(200).json({
        success: true,
        shlokas:
          publicShlokas,
      });
    }

    // =====================================================
    // LOGGED-IN USER
    // =====================================================

    return res.status(200).json({
      success: true,
      shlokas,
    });

  } catch (error) {

    console.error(
      "Get Chapter Shlokas Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Error fetching chapter shlokas",
      error:
        error.message,
    });
  }
};

// =====================================================
// ⭐ GET SHLOK OF THE DAY
// =====================================================
//
// Date-based automatic system.
//
// Example:
//
// 28 August → one shlok
// 29 August → next shlok
// 30 August → next shlok
//
// Same date = same shlok for everyone.
//
// Login required નથી.
//

const getShlokOfTheDay = async (
  req,
  res
) => {
  try {
    // =================================================
    // GET ALL SHLOKAS
    // =================================================

    const shlokas =
      await Shlok.find()
        .sort({
          chapterNumber: 1,
          shlokNumber: 1,
        });

    // =================================================
    // NO SHLOK AVAILABLE
    // =================================================

    if (
      !shlokas ||
      shlokas.length === 0
    ) {
      return res.status(404).json({
        success: false,

        message:
          "હાલમાં કોઈ શ્લોક ઉપલબ્ધ નથી.",
      });
    }

    // =================================================
    // TODAY'S DATE - INDIA
    // =================================================

    const today =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "Asia/Kolkata",

          year: "numeric",

          month: "2-digit",

          day: "2-digit",
        }
      ).format(
        new Date()
      );

    // =================================================
    // DATE → NUMBER
    // =================================================
    //
    // Example:
    //
    // 2026-08-28
    //
    // becomes:
    //
    // 20260828
    //
    // =================================================

    const dateNumber =
      Number(
        today.replace(
          /-/g,
          ""
        )
      );

    // =================================================
    // SELECT SHLOK
    // =================================================

    const shlokIndex =
      dateNumber %
      shlokas.length;

    const todayShlok =
      shlokas[
        shlokIndex
      ];

    // =================================================
    // RESPONSE
    // =================================================

    res.status(200).json({
      success: true,

      date: today,

      shlok:
        todayShlok,
    });
  } catch (error) {
    console.error(
      "Get Shlok Of The Day Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "આજનો શ્લોક load કરવામાં error આવ્યો.",

      error:
        error.message,
    });
  }
};

// =====================================================
// UPDATE SHLOK
// =====================================================

const updateShlok = async (
  req,
  res
) => {
  try {
    let {
      chapterNumber,
      chapterName,
      chapterNameHi,
      shlokNumber,
      speaker,
      speakerHi,
      sanskrit,
      wordMeanings,
      translation,
      translationHi,
      message,
      messageHi,
    } = req.body;

    if (
      !chapterNumber ||
      !chapterName ||
      !shlokNumber ||
      !speaker ||
      !sanskrit ||
      !translation ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message:
          "બધી માહિતી ભરવી જરૂરી છે.",
      });
    }

    const oldShlok =
      await Shlok.findById(
        req.params.id
      );

    if (!oldShlok) {
      return res.status(404).json({
        success: false,
        message:
          "Shlok not found",
      });
    }

    const duplicateShlok =
      await Shlok.findOne({
        _id: {
          $ne:
            req.params.id,
        },

        chapterNumber:
          Number(chapterNumber),

        shlokNumber:
          Number(shlokNumber),
      });

    if (duplicateShlok) {
      return res.status(400).json({
        success: false,
        message:
          `અધ્યાય ${chapterNumber} માં શ્લોક ${shlokNumber} પહેલેથી જ છે.`,
      });
    }

    let preparedWordMeanings =
      prepareWordMeanings(
        sanskrit,
        oldShlok.wordMeanings ||
          [],
        wordMeanings
      );

    // Auto-translate if Hindi translation or message is missing
    if (!translationHi || !messageHi) {
      try {
        const auto = await translateShlokToHindi({
          chapterNumber,
          chapterName,
          speaker,
          sanskrit,
          translation,
          message,
          wordMeanings: preparedWordMeanings,
        });

        if (!chapterNameHi) chapterNameHi = auto.chapterNameHi;
        if (!speakerHi) speakerHi = auto.speakerHi;
        if (!translationHi) translationHi = auto.translationHi;
        if (!messageHi) messageHi = auto.messageHi;
        preparedWordMeanings = auto.wordMeanings;
      } catch (err) {
        console.warn("Auto-translate in updateShlok failed:", err.message);
      }
    }

    const updatedShlok =
      await Shlok.findByIdAndUpdate(
        req.params.id,

        {
          $set: {
            chapterNumber:
              Number(
                chapterNumber
              ),

            chapterName:
              String(
                chapterName
              ).trim(),

            chapterNameHi:
              String(
                chapterNameHi || ""
              ).trim(),

            shlokNumber:
              Number(
                shlokNumber
              ),

            speaker:
              String(
                speaker
              ).trim(),

            speakerHi:
              String(
                speakerHi || ""
              ).trim(),

            sanskrit:
              String(
                sanskrit
              ).trim(),

            wordMeanings:
              preparedWordMeanings,

            translation:
              String(
                translation
              ).trim(),

            translationHi:
              String(
                translationHi || ""
              ).trim(),

            message:
              String(
                message
              ).trim(),

            messageHi:
              String(
                messageHi || ""
              ).trim(),
          },
        },

        {
          new: true,
          runValidators: true,
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Shlok successfully updated ✅",
      shlok:
        updatedShlok,
    });
  } catch (error) {
    console.error(
      "Update Shlok Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Error updating shlok",
      error:
        error.message,
    });
  }
};

// =====================================================
// AUTO TRANSLATE SHLOK CONTENT (AI GEMINI)
// =====================================================

const autoTranslateShlok = async (req, res) => {
  try {
    const {
      chapterNumber,
      chapterName,
      speaker,
      sanskrit,
      wordMeanings,
      translation,
      message,
    } = req.body;

    if (!translation || !sanskrit) {
      return res.status(400).json({
        success: false,
        message: "સંસ્કૃત શ્લોક અને ગુજરાતી અનુવાદ જરૂરી છે.",
      });
    }

    const translated = await translateShlokToHindi({
      chapterNumber,
      chapterName,
      speaker,
      sanskrit,
      translation,
      message,
      wordMeanings: wordMeanings || [],
    });

    res.status(200).json({
      success: true,
      translated,
    });
  } catch (error) {
    console.error("Auto Translate Shlok Error:", error);
    res.status(500).json({
      success: false,
      message: "Translation error",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE SHLOK
// =====================================================

const deleteShlok = async (
  req,
  res
) => {
  try {
    const deletedShlok =
      await Shlok.findByIdAndDelete(
        req.params.id
      );

    if (!deletedShlok) {
      return res.status(404).json({
        success: false,
        message:
          "Shlok not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Shlok successfully deleted 🗑️",
    });
  } catch (error) {
    console.error(
      "Delete Shlok Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Error deleting shlok",
      error:
        error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  addShlok,
  getAllShlokas,
  getChapterShlokas,
  getShlokOfTheDay,
  updateShlok,
  autoTranslateShlok,
  deleteShlok,
};