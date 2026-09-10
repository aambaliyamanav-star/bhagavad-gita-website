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

    // ===================================================
    // READING TRACKER & GAMIFICATION
    // ===================================================

    readingProgress: {
      readShlokas: [
        {
          chapterNumber: {
            type: Number,
            required: true,
          },
          shlokNumber: {
            type: Number,
            required: true,
          },
          readAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      lastReadDate: {
        type: String,
        default: null,
      },
      unlockedBadges: [
        {
          badgeId: {
            type: String,
            required: true,
          },
          unlockedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
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