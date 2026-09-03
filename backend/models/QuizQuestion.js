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
    // QUESTION
    // =====================================================
    question: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // FOUR OPTIONS
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
    // CORRECT ANSWER
    // =====================================================
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // OPTIONAL EXPLANATION
    // =====================================================
    explanation: {
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