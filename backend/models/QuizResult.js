const mongoose = require("mongoose");

// =====================================================
// ANSWER SUB-SCHEMA
// =====================================================

const quizAnswerSchema =
  new mongoose.Schema(
    {
      // ===============================================
      // QUESTION ID
      // ===============================================

      questionId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "QuizQuestion",

        required: true,
      },

      // ===============================================
      // USER SELECTED ANSWER
      // ===============================================

      selectedAnswer: {
        type: String,

        default: "",

        trim: true,
      },

      // ===============================================
      // CORRECT ANSWER
      // ===============================================

      correctAnswer: {
        type: String,

        default: "",

        trim: true,
      },

      // ===============================================
      // CORRECT / WRONG
      // ===============================================

      isCorrect: {
        type: Boolean,

        default: false,
      },
    },

    {
      _id: false,
    }
  );


// =====================================================
// QUIZ RESULT SCHEMA
// =====================================================

const quizResultSchema =
  new mongoose.Schema(
    {
      // =================================================
      // USER
      // =================================================

      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },


      // =================================================
      // QUIZ CATEGORY
      // =================================================
      //
      // chapter-1
      // chapter-2
      // ...
      // chapter-18
      // mahabharata
      // all
      //
      // =================================================

      category: {
        type: String,

        required: true,

        trim: true,
      },


      // =================================================
      // CHAPTER NUMBER
      // =================================================

      chapterNumber: {
        type: Number,

        min: 1,

        max: 18,

        default: null,
      },


      // =================================================
      // TOTAL QUESTIONS
      // =================================================

      totalQuestions: {
        type: Number,

        required: true,

        min: 0,
      },


      // =================================================
      // CORRECT ANSWERS
      // =================================================

      correctAnswers: {
        type: Number,

        required: true,

        min: 0,
      },


      // =================================================
      // WRONG ANSWERS
      // =================================================

      wrongAnswers: {
        type: Number,

        required: true,

        min: 0,
      },


      // =================================================
      // SKIPPED QUESTIONS
      // =================================================

      skippedQuestions: {
        type: Number,

        default: 0,

        min: 0,
      },


      // =================================================
      // SCORE
      // =================================================

      score: {
        type: Number,

        required: true,

        min: 0,
      },


      // =================================================
      // PERCENTAGE
      // =================================================

      percentage: {
        type: Number,

        required: true,

        min: 0,

        max: 100,
      },


      // =================================================
      // TIME TAKEN
      // =================================================

      timeTaken: {
        type: Number,

        default: 0,

        min: 0,
      },


      // =================================================
      // ALL ANSWERS
      // =================================================

      answers: {
        type: [
          quizAnswerSchema,
        ],

        default: [],
      },


      // =================================================
      // QUIZ COMPLETED
      // =================================================

      completed: {
        type: Boolean,

        default: true,
      },
    },

    {
      timestamps: true,
    }
  );


// =====================================================
// EXPORT MODEL
// =====================================================

module.exports =
  mongoose.model(
    "QuizResult",
    quizResultSchema
  );