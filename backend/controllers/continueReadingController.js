const User = require("../models/User");

// =====================================================
// GET CONTINUE READING
// =====================================================

const getContinueReading = async (req, res) => {
  try {
    // Find Logged-in User
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User મળ્યો નથી.",
      });
    }

    // No Continue Reading Yet
    if (
      !user.continueReading ||
      !user.continueReading.chapterNumber ||
      !user.continueReading.shlokNumber
    ) {
      return res.status(200).json({
        success: true,
        continueReading: null,
      });
    }

    // Return Continue Reading
    res.status(200).json({
      success: true,
      continueReading: {
        chapterNumber:
          user.continueReading.chapterNumber,

        shlokNumber:
          user.continueReading.shlokNumber,

        updatedAt:
          user.continueReading.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Get Continue Reading Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Continue Reading load કરવામાં error આવ્યો.",
      error: error.message,
    });
  }
};

// =====================================================
// SAVE / UPDATE CONTINUE READING
// =====================================================

const saveContinueReading = async (req, res) => {
  try {
    const {
      chapterNumber,
      shlokNumber,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !chapterNumber ||
      !shlokNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Chapter number અને Shlok number જરૂરી છે.",
      });
    }

    // =================================================
    // VALIDATE CHAPTER
    // =================================================

    const chapter = Number(
      chapterNumber
    );

    const shlok = Number(
      shlokNumber
    );

    if (
      !Number.isInteger(chapter) ||
      chapter < 1 ||
      chapter > 18
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid chapter number.",
      });
    }

    if (
      !Number.isInteger(shlok) ||
      shlok < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid shlok number.",
      });
    }

    // =================================================
    // FIND LOGGED-IN USER
    // =================================================

    const user = await User.findById(
      req.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User મળ્યો નથી.",
      });
    }

    // =================================================
    // SAVE CONTINUE READING
    // =================================================

    user.continueReading = {
      chapterNumber: chapter,
      shlokNumber: shlok,
      updatedAt: new Date(),
    };

    await user.save();

    // =================================================
    // RESPONSE
    // =================================================

    res.status(200).json({
      success: true,
      message:
        "Continue Reading save થયું. 📖",
      continueReading:
        user.continueReading,
    });
  } catch (error) {
    console.error(
      "Save Continue Reading Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Continue Reading save કરવામાં error આવ્યો.",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  getContinueReading,
  saveContinueReading,
};