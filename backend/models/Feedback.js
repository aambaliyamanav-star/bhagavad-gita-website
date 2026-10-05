const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    previousRating: {
      type: Number,
      default: null,
      min: 1,
      max: 5,
    },
    isUpdatedRating: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["suggestion", "feedback", "bug", "appreciation"],
      default: "feedback",
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    device: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
