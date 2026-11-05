const express = require("express");

const {
  getQuizQuestions,
  getQuizQuestionsCount,
  getQuizQuestionsSummary,
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
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// USER QUIZ ROUTES
// =====================================================

// GET QUIZ QUESTIONS COUNT (FOR CATEGORY SETUP)
router.get(
  "/questions/count",
  getQuizQuestionsCount
);

// GET QUIZ QUESTIONS SUMMARY (AVAILABLE CHAPTERS & SHLOKAS)
router.get(
  "/questions/summary",
  getQuizQuestionsSummary
);

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
  requirePermission("manage_quiz"),
  getAllQuizQuestionsAdmin
);


// ADD QUESTION

router.post(
  "/admin/question",
  protect,
  requirePermission("manage_quiz"),
  addQuizQuestion
);


// UPDATE QUESTION

router.put(
  "/admin/question/:id",
  protect,
  requirePermission("manage_quiz"),
  updateQuizQuestion
);


// DELETE QUESTION

router.delete(
  "/admin/question/:id",
  protect,
  requirePermission("delete_quiz"),
  deleteQuizQuestion
);


// BULK DELETE QUESTIONS (FILTERED / SELECTED)

router.delete(
  "/admin/questions/bulk",
  protect,
  requirePermission("delete_quiz"),
  deleteQuizQuestionsBulk
);

router.post(
  "/admin/questions/delete-bulk",
  protect,
  requirePermission("delete_quiz"),
  deleteQuizQuestionsBulk
);


// AUTO TRANSLATE QUIZ QUESTION (GUJARATI -> HINDI)

router.post(
  "/admin/auto-translate",
  protect,
  requirePermission("manage_quiz"),
  autoTranslateQuizQuestion
);

router.post(
  "/auto-translate",
  protect,
  requirePermission("manage_quiz"),
  autoTranslateQuizQuestion
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;