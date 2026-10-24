const mongoose = require("mongoose");

// =====================================================
// QUIZ USER PROGRESS SCHEMA
// =====================================================
// Keeps track of questions seen/answered by a user in
// the current cycle so that questions do NOT repeat
// until all questions in the chapter/shloka pool have
// been played at least once.
// =====================================================

const quizUserProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // scopeKey format:
    // - "chapter-1:all"
    // - "chapter-1:1-5"
    // - "chapter-2:1-10"
    // - "mahabharata:all"
    // - "all:all"
    scopeKey: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    // Array of Question IDs already served to user in this cycle
    seenQuestionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuizQuestion",
      },
    ],

    // Cycle counter (increments each time all questions in the pool are exhausted)
    cycleCount: {
      type: Number,
      default: 1,
    },

    lastPlayedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index for fast O(1) lookup per user + scope
quizUserProgressSchema.index({ user: 1, scopeKey: 1 }, { unique: true });

module.exports = mongoose.model("QuizUserProgress", quizUserProgressSchema);

