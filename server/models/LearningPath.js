const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: String,
    url: String,
    type: String,
  },
  { _id: false },
);

const topicProgressSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
  },
  title: String,
  description: String,
  difficulty: String,
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed"],
    default: "not_started",
  },
  completedAt: Date,
  order: {
    type: Number,
    default: 0,
  },
  resources: [resourceSchema],
});

const learningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  topics: [topicProgressSchema],
  totalTopics: {
    type: Number,
    default: 0,
  },
  completedTopics: {
    type: Number,
    default: 0,
  },
  progressPercentage: {
    type: Number,
    default: 0,
  },
  aiRecommendations: {
    type: String, // Raw AI response stored for reference
    default: "",
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Update progress percentage
learningPathSchema.methods.updateProgress = function () {
  const completed = this.topics.filter((t) => t.status === "completed").length;
  this.completedTopics = completed;
  this.totalTopics = this.topics.length;
  this.progressPercentage =
    this.totalTopics > 0 ? Math.round((completed / this.totalTopics) * 100) : 0;
  this.lastUpdated = new Date();
};

module.exports = mongoose.model("LearningPath", learningPathSchema);
