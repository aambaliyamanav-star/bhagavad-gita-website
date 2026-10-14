const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema(
  {
    // =====================================================
    // QUIZ CATEGORY
    // =====================================================
    // gita = Bhagavad Gita chapter questions
    // mahabharata = Mahabharata questions
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // CHAPTER NUMBER
    // =====================================================
    // Bhagavad Gita questions માટે 1 થી 18
    // Mahabharata questions માટે null રહી શકે
    chapterNumber: {
      type: Number,
      min: 1,
      max: 18,
      default: null,
    },

    // =====================================================
    // QUESTION (GUJARATI)
    // =====================================================
    question: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // QUESTION (HINDI)
    // =====================================================
    questionHi: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // FOUR OPTIONS (GUJARATI)
    // =====================================================
    options: {
      type: [
        {
          type: String,
          required: true,
          trim: true,
        },
      ],
      validate: {
        validator: function (value) {
          return value.length === 4;
        },
        message:
          "Quiz question must have exactly 4 options.",
      },
    },

    // =====================================================
    // FOUR OPTIONS (HINDI)
    // =====================================================
    optionsHi: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },

    // =====================================================
    // CORRECT ANSWER (GUJARATI)
    // =====================================================
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // CORRECT ANSWER (HINDI)
    // =====================================================
    correctAnswerHi: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // OPTIONAL EXPLANATION (GUJARATI)
    // =====================================================
    explanation: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // OPTIONAL EXPLANATION (HINDI)
    // =====================================================
    explanationHi: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // DIFFICULTY
    // =====================================================
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    // =====================================================
    // QUESTION ACTIVE / INACTIVE
    // =====================================================
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "QuizQuestion",
  quizQuestionSchema
);