const express = require("express");

const {
  addShlok,
  getAllShlokas,
  getChapterShlokas,
  getShlokOfTheDay,
  updateShlok,
  deleteShlok,
} = require("../controllers/shlokController");

const {
  protect,
  optionalAuth,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// SHLOK ROUTES
// =====================================================

// -----------------------------------------------------
// ADD NEW SHLOK (ADMIN ONLY)
// POST /api/shloks
// -----------------------------------------------------

router.post(
  "/",
  protect,
  adminOnly,
  addShlok
);

// -----------------------------------------------------
// GET ALL SHLOKAS (OPTIONAL AUTH: 1-5 PUBLIC, 6+ METADATA FOR GUESTS)
// GET /api/shloks
// -----------------------------------------------------

router.get(
  "/",
  optionalAuth,
  getAllShlokas
);

// -----------------------------------------------------
// ⭐ GET SHLOK OF THE DAY
// GET /api/shloks/today
// -----------------------------------------------------

router.get(
  "/today",
  getShlokOfTheDay
);

// -----------------------------------------------------
// GET SHLOKAS OF SPECIFIC CHAPTER
// GET /api/shloks/chapter/:chapterNumber
// -----------------------------------------------------

router.get(
  "/chapter/:chapterNumber",
  optionalAuth,
  getChapterShlokas
);

// -----------------------------------------------------
// UPDATE SHLOK (ADMIN ONLY)
// PUT /api/shloks/:id
// -----------------------------------------------------

router.put(
  "/:id",
  protect,
  adminOnly,
  updateShlok
);

// -----------------------------------------------------
// DELETE SHLOK (ADMIN ONLY)
// DELETE /api/shloks/:id
// -----------------------------------------------------

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteShlok
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;