const express = require("express");
const router = express.Router();
const {
  getSubjects,
  getQuiz,
  submitAssessment,
  getAssessmentHistory,
  getAssessment,
} = require("../controllers/assessmentController");
const { protect } = require("../middleware/auth");

// Public routes
router.get("/subjects", getSubjects);

// Protected routes
router.get("/quiz/:subject", protect, getQuiz);
router.post("/submit", protect, submitAssessment);
router.get("/history", protect, getAssessmentHistory);
router.get("/:id", protect, getAssessment);

module.exports = router;
