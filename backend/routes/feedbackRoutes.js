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
  requirePermission,
} = require("../middleware/authMiddleware");

// Public / User routes
router.post("/", optionalAuth, submitFeedback);
router.get("/stats", getFeedbackStats);
router.get("/my-rating", optionalAuth, getMyRating);

// Admin routes (Protected: requires manage_feedbacks / delete_feedbacks)
router.get("/admin", protect, requirePermission("manage_feedbacks"), getAdminFeedbacks);
router.delete("/:id", protect, requirePermission("delete_feedbacks"), deleteFeedback);

module.exports = router;
