const express = require("express");

const {
  addShlok,
  getAllShlokas,
  getChapterShlokas,
  getShlokOfTheDay,
  updateShlok,
  deleteShlok,
} = require("../controllers/shlokController");

const router = express.Router();

// =====================================================
// SHLOK ROUTES
// =====================================================

// -----------------------------------------------------
// ADD NEW SHLOK
// POST /api/shloks
// -----------------------------------------------------

router.post(
  "/",
  addShlok
);

// -----------------------------------------------------
// GET ALL SHLOKAS
// GET /api/shloks
// -----------------------------------------------------

router.get(
  "/",
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
  getChapterShlokas
);

// -----------------------------------------------------
// UPDATE SHLOK
// PUT /api/shloks/:id
// -----------------------------------------------------

router.put(
  "/:id",
  updateShlok
);

// -----------------------------------------------------
// DELETE SHLOK
// DELETE /api/shloks/:id
// -----------------------------------------------------

router.delete(
  "/:id",
  deleteShlok
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;