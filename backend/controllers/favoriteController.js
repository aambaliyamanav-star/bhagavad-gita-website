const User = require("../models/User");
const Shlok = require("../models/Shlok");

// =====================================================
// GET USER FAVOURITE SHLOKAS
// =====================================================

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "favorites"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User મળ્યો નથી.",
      });
    }

    res.status(200).json({
      success: true,
      favorites: user.favorites || [],
    });
  } catch (error) {
    console.error(
      "Get Favorites Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Favourite shlokas load કરવામાં error આવ્યો.",
      error: error.message,
    });
  }
};

// =====================================================
// ADD SHLOK TO FAVOURITES
// =====================================================

const addFavorite = async (req, res) => {
  try {
    const { shlokId } = req.params;

    // Check Shlok
    const shlok = await Shlok.findById(shlokId);

    if (!shlok) {
      return res.status(404).json({
        success: false,
        message: "Shlok મળ્યો નથી.",
      });
    }

    // Find User
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User મળ્યો નથી.",
      });
    }

    // Already Favourite
    const alreadyFavorite =
      user.favorites.some(
        (favoriteId) =>
          favoriteId.toString() === shlokId
      );

    if (alreadyFavorite) {
      return res.status(200).json({
        success: true,
        message: "Shlok પહેલેથી જ favourite છે.",
        favorites: user.favorites,
      });
    }

    // Add Favourite
    user.favorites.push(shlokId);

    await user.save();

    // Return Updated Favorites
    const updatedUser = await User.findById(
      req.user._id
    ).populate("favorites");

    res.status(200).json({
      success: true,
      message: "Shlok favourite માં add થયો. ❤️",
      favorites: updatedUser.favorites,
    });
  } catch (error) {
    console.error(
      "Add Favorite Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Favourite add કરવામાં error આવ્યો.",
      error: error.message,
    });
  }
};

// =====================================================
// REMOVE SHLOK FROM FAVOURITES
// =====================================================

const removeFavorite = async (req, res) => {
  try {
    const { shlokId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User મળ્યો નથી.",
      });
    }

    // Remove Favourite
    user.favorites =
      user.favorites.filter(
        (favoriteId) =>
          favoriteId.toString() !== shlokId
      );

    await user.save();

    // Return Updated Favorites
    const updatedUser = await User.findById(
      req.user._id
    ).populate("favorites");

    res.status(200).json({
      success: true,
      message: "Shlok favourite માંથી remove થયો. 💔",
      favorites: updatedUser.favorites,
    });
  } catch (error) {
    console.error(
      "Remove Favorite Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Favourite remove કરવામાં error આવ્યો.",
      error: error.message,
    });
  }
};

// =====================================================
// CLEAR ALL FAVOURITES
// =====================================================

const clearFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User મળ્યો નથી.",
      });
    }

    // Clear All
    user.favorites = [];

    await user.save();

    res.status(200).json({
      success: true,
      message: "બધા favourite shlokas remove થઈ ગયા.",
      favorites: [],
    });
  } catch (error) {
    console.error(
      "Clear Favorites Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Favourite shlokas clear કરવામાં error આવ્યો.",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  clearFavorites,
};