const mongoose = require("mongoose");

// =====================================================
// USER SCHEMA
// =====================================================

const userSchema = new mongoose.Schema(
  {
    // ===================================================
    // NAME
    // ===================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ===================================================
    // MOBILE NUMBER
    // ===================================================

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ===================================================
    // EMAIL
    // ===================================================

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ===================================================
    // BIRTH DATE
    // ===================================================

    birthDate: {
      type: Date,
      required: true,
    },

    // ===================================================
    // PASSWORD
    // ===================================================

    password: {
      type: String,
      required: true,
    },

    // ===================================================
    // ROLE
    // ===================================================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ===================================================
    // FAVOURITE SHLOKAS
    // ===================================================

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shlok",
      },
    ],

    // ===================================================
    // CONTINUE READING
    // ===================================================

    continueReading: {
      chapterNumber: {
        type: Number,
        default: null,
      },

      shlokNumber: {
        type: Number,
        default: null,
      },

      updatedAt: {
        type: Date,
        default: null,
      },
    },
  },

  // =====================================================
  // TIMESTAMPS
  // =====================================================

  {
    timestamps: true,
  }
);

// =====================================================
// EXPORT USER MODEL
// =====================================================

module.exports = mongoose.model("User", userSchema);