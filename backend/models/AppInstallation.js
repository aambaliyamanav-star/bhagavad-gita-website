const mongoose = require("mongoose");

const AppInstallationSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userName: { type: String, default: null },
    userEmail: { type: String, default: null },
    device: { type: String, default: "Mobile" },
    platform: { type: String, default: "Android" },
    browser: { type: String, default: "Chrome" },
    installedAt: { type: Date, default: Date.now },
    lastOpenedAt: { type: Date, default: Date.now },
    openCount: { type: Number, default: 1 },
    hasNotificationEnabled: { type: Boolean, default: false },
    notificationEndpoint: { type: String, default: null },
    ip: { type: String, default: "Unknown" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppInstallation", AppInstallationSchema);
