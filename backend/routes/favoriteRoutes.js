const express = require("express");

const {
  getFavorites,
  addFavorite,
  removeFavorite,
  clearFavorites,
} = require("../controllers/favoriteController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET USER FAVOURITE SHLOKAS
// =====================================================

router.get("/", protect, getFavorites);

// =====================================================
// ADD SHLOK TO FAVOURITES
// =====================================================

router.post("/:shlokId", protect, addFavorite);

// =====================================================
// REMOVE SHLOK FROM FAVOURITES
// =====================================================

router.delete("/:shlokId", protect, removeFavorite);

// =====================================================
// CLEAR ALL FAVOURITE SHLOKAS
// =====================================================

router.delete("/", protect, clearFavorites);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;