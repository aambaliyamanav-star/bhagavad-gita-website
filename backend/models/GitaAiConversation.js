const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sender: { type: String, enum: ["user", "ai"], required: true },
  text: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
});

const GitaAiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    convId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    messages: [MessageSchema],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

GitaAiConversationSchema.index({ userId: 1, convId: 1 }, { unique: true });

module.exports = mongoose.model(
  "GitaAiConversation",
  GitaAiConversationSchema
);

