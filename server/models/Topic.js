const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["video", "article", "course", "documentation", "practice"],
    required: true,
  },
  duration: String, // e.g., "2 hours", "30 min read"
  isFree: {
    type: Boolean,
    default: true,
  },
});

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
    enum: [
      "javascript",
      "databases",
      "react",
      "nodejs",
      "python",
      "html-css",
      "general",
    ],
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  prerequisites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
    },
  ],
  resources: [resourceSchema],
  estimatedTime: {
    type: String, // e.g., "2 weeks", "5 hours"
    default: "1 week",
  },
  order: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Topic", topicSchema);
