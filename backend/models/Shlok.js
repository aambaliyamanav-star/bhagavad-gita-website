const mongoose = require("mongoose");

// =====================================================
// WORD MEANING SCHEMA
// =====================================================

const wordMeaningSchema = new mongoose.Schema(
  {
    // Sanskrit word
    // Admin અહીં word edit પણ કરી શકશે.
    word: {
      type: String,
      required: true,
      trim: true,
    },

    // Gujarati meaning
    // Admin અહીં Gujarati meaning લખી / edit કરી શકશે.
    meaning: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

// =====================================================
// SHLOK SCHEMA
// =====================================================

const shlokSchema = new mongoose.Schema(
  {
    // =================================================
    // CHAPTER
    // =================================================

    chapterNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 18,
    },

    chapterName: {
      type: String,
      required: true,
      trim: true,
    },

    // =================================================
    // SHLOK NUMBER
    // =================================================

    shlokNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    // =================================================
    // SPEAKER
    // =================================================

    speaker: {
      type: String,
      required: true,
      trim: true,
    },

    // =================================================
    // SANSKRIT SHLOK
    // =================================================
    //
    // Admin Sanskrit box માં આખો shlok લખશે.
    //
    // Example:
    //
    // धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः
    //

    sanskrit: {
      type: String,
      required: true,
      trim: true,
    },

    // =================================================
    // WORD-WISE GUJARATI MEANING
    // =================================================
    //
    // Sanskrit shlok ના દરેક word માટે:
    //
    // {
    //   word: "धर्मक्षेत्रे",
    //   meaning: "ધર્મક્ષેત્રમાં"
    // }
    //
    // Frontend Sanskrit shlok માંથી word detect કરીને
    // આ list બનાવી શકે છે.
    //
    // Admin:
    // 1. Word edit કરી શકે
    // 2. Gujarati meaning લખી શકે
    // 3. Word delete કરી શકે
    // 4. New word add કરી શકે
    //

    wordMeanings: {
      type: [wordMeaningSchema],
      default: [],
    },

    // =================================================
    // FULL GUJARATI TRANSLATION
    // =================================================

    translation: {
      type: String,
      required: true,
      trim: true,
    },

    // =================================================
    // MESSAGE / EXPLANATION
    // =================================================

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);

// =====================================================
// PREVENT DUPLICATE SHLOK
// =====================================================
//
// એક જ chapter માં એક જ shlok number
// બે વખત save ન થઈ શકે.
//

shlokSchema.index(
  {
    chapterNumber: 1,
    shlokNumber: 1,
  },
  {
    unique: true,
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = mongoose.model(
  "Shlok",
  shlokSchema
);