const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  selectedOption: {
    type: Number,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subject: {
    type: String,
    required: true,
    enum: ["javascript", "databases", "react", "nodejs", "python", "html-css"],
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0,
  },
  skillLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate skill level based on score
assessmentSchema.pre("save", function (next) {
  if (this.score < 40) {
    this.skillLevel = "beginner";
  } else if (this.score < 75) {
    this.skillLevel = "intermediate";
  } else {
    this.skillLevel = "advanced";
  }
  next();
});

module.exports = mongoose.model("Assessment", assessmentSchema);
