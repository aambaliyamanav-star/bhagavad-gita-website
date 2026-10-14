const express = require("express");

const {
  getQuizQuestions,
  getQuizQuestionById,
  submitQuiz,
  getMyQuizResults,
  getQuizResultById,

  // Admin
  getAllQuizQuestionsAdmin,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  deleteQuizQuestionsBulk,
  autoTranslateQuizQuestion,
} = require("../controllers/quizController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// USER QUIZ ROUTES
// =====================================================

// GET QUIZ QUESTIONS

router.get(
  "/questions",
  protect,
  getQuizQuestions
);


// GET SINGLE QUIZ QUESTION

router.get(
  "/question/:id",
  protect,
  getQuizQuestionById
);


// SUBMIT QUIZ

router.post(
  "/submit",
  protect,
  submitQuiz
);


// GET MY QUIZ RESULTS

router.get(
  "/results",
  protect,
  getMyQuizResults
);


// GET SINGLE QUIZ RESULT

router.get(
  "/result/:id",
  protect,
  getQuizResultById
);


// =====================================================
// ADMIN QUIZ ROUTES
// =====================================================

// GET ALL QUESTIONS

router.get(
  "/admin/questions",
  protect,
  adminOnly,
  getAllQuizQuestionsAdmin
);


// ADD QUESTION

router.post(
  "/admin/question",
  protect,
  adminOnly,
  addQuizQuestion
);


// UPDATE QUESTION

router.put(
  "/admin/question/:id",
  protect,
  adminOnly,
  updateQuizQuestion
);


// DELETE QUESTION

router.delete(
  "/admin/question/:id",
  protect,
  adminOnly,
  deleteQuizQuestion
);


// BULK DELETE QUESTIONS (FILTERED / SELECTED)

router.delete(
  "/admin/questions/bulk",
  protect,
  adminOnly,
  deleteQuizQuestionsBulk
);

router.post(
  "/admin/questions/delete-bulk",
  protect,
  adminOnly,
  deleteQuizQuestionsBulk
);


// AUTO TRANSLATE QUIZ QUESTION (GUJARATI -> HINDI)

router.post(
  "/admin/auto-translate",
  protect,
  adminOnly,
  autoTranslateQuizQuestion
);

router.post(
  "/auto-translate",
  protect,
  adminOnly,
  autoTranslateQuizQuestion
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;