const express = require("express");
const router = express.Router();
const {
  generatePath,
  getLearningPath,
  updateProgress,
  getNextSteps,
  resetPath,
} = require("../controllers/recommendationController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.post("/generate", generatePath);
router.get("/path", getLearningPath);
router.put("/progress/:topicIndex", updateProgress);
router.get("/next", getNextSteps);
router.delete("/reset", resetPath);

module.exports = router;
