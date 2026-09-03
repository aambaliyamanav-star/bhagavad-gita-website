const express = require("express");

const {
  getContinueReading,
  saveContinueReading,
} = require("../controllers/continueReadingController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET CONTINUE READING
// =====================================================

router.get(
  "/",
  protect,
  getContinueReading
);

// =====================================================
// SAVE / UPDATE CONTINUE READING
// =====================================================

router.post(
  "/",
  protect,
  saveContinueReading
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;