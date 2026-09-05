const Shlok = require("../models/Shlok");

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

        if (submittedWord) {
          result.push({
            word: submittedWord,
            meaning:
              submittedMeaning,
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
        });

        return;
      }

      // -----------------------------------------------
      // NEW WORD
      // -----------------------------------------------

      result.push({
        word: detectedWord,
        meaning: "",
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
    const {
      chapterNumber,
      chapterName,
      shlokNumber,
      speaker,
      sanskrit,
      wordMeanings,
      translation,
      message,
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

    const preparedWordMeanings =
      prepareWordMeanings(
        sanskrit,
        [],
        wordMeanings
      );

    const shlok =
      new Shlok({
        chapterNumber:
          Number(chapterNumber),

        chapterName:
          String(
            chapterName
          ).trim(),

        shlokNumber:
          Number(shlokNumber),

        speaker:
          String(
            speaker
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

        message:
          String(
            message
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
        });

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

    // =================================================
    // VALIDATE CHAPTER
    // =================================================

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

    // =================================================
    // BACKEND ACCESS RESTRICTION
    // =================================================
    //
    // Anonymous user:
    // Shlok 1–5 only
    //
    // Logged-in user:
    // All shlokas
    // =================================================

    let query = {
      chapterNumber:
        chapterNumber,
    };

    if (!req.user) {
      query.shlokNumber = {
        $lte: 5,
      };
    }

    // =================================================
    // GET SHLOKAS
    // =================================================

    const shlokas =
      await Shlok.find(
        query
      ).sort({
        shlokNumber: 1,
      });

    // =================================================
    // RESPONSE
    // =================================================

    res.status(200).json({
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
    const {
      chapterNumber,
      chapterName,
      shlokNumber,
      speaker,
      sanskrit,
      wordMeanings,
      translation,
      message,
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

    const preparedWordMeanings =
      prepareWordMeanings(
        sanskrit,
        oldShlok.wordMeanings ||
          [],
        wordMeanings
      );

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

            shlokNumber:
              Number(
                shlokNumber
              ),

            speaker:
              String(
                speaker
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

            message:
              String(
                message
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
  deleteShlok,
};