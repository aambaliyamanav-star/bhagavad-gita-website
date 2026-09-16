const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    lastOpenedDate: { type: Date, default: null },
    reminderCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
