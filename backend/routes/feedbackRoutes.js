const express = require("express");
const router = express.Router();

const {
  getMyRating,
  submitFeedback,
  getFeedbackStats,
  getAdminFeedbacks,
  deleteFeedback,
} = require("../controllers/feedbackController");

const {
  protect,
  optionalAuth,
  adminOnly,
} = require("../middleware/authMiddleware");

// Public / User routes
router.post("/", optionalAuth, submitFeedback);
router.get("/stats", getFeedbackStats);
router.get("/my-rating", optionalAuth, getMyRating);

// Admin routes
router.get("/admin", protect, adminOnly, getAdminFeedbacks);
router.delete("/:id", protect, adminOnly, deleteFeedback);

module.exports = router;
