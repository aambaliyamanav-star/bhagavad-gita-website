const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      index: true,
    },
    ip: {
      type: String,
      default: "",
    },
    path: {
      type: String,
      default: "/",
      index: true,
    },
    referrer: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    device: {
      type: String,
      enum: ["Desktop", "Mobile", "Tablet", "Unknown"],
      default: "Unknown",
    },
    browser: {
      type: String,
      default: "Other",
    },
    os: {
      type: String,
      default: "Other",
    },
    visitedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

visitorSchema.index({ visitedAt: -1, visitorId: 1 });

module.exports = mongoose.model("Visitor", visitorSchema);
