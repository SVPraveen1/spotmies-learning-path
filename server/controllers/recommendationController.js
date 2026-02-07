const LearningPath = require("../models/LearningPath");
const Assessment = require("../models/Assessment");
const User = require("../models/User");
const {
  generateLearningPath,
  getNextRecommendations,
} = require("../services/geminiService");

// @desc    Generate learning path based on assessments
// @route   POST /api/recommendations/generate
// @access  Private
const generatePath = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's assessments
    const assessments = await Assessment.find({ userId }).sort({
      completedAt: -1,
    });

    if (assessments.length === 0) {
      return res.status(400).json({
        message:
          "Please complete at least one assessment before generating a learning path",
      });
    }

    // Check if user already has a learning path
    let existingPath = await LearningPath.findOne({ userId });

    // Generate new learning path using Gemini AI
    const aiResult = await generateLearningPath(assessments);

    if (!aiResult.success && !aiResult.data) {
      return res.status(500).json({
        message: "Failed to generate learning path",
        error: aiResult.error,
      });
    }

    const pathData = aiResult.data;

    // Format topics for storage
    const topics = pathData.topics.map((topic, index) => ({
      topicId: null, // Can be linked to Topic model if needed
      title: topic.title,
      description: topic.description,
      difficulty: topic.difficulty,
      status: "not_started",
      order: topic.order || index + 1,
      resources: topic.resources || [],
    }));

    if (existingPath) {
      // Update existing path
      existingPath.topics = topics;
      existingPath.totalTopics = topics.length;
      existingPath.completedTopics = 0;
      existingPath.progressPercentage = 0;
      existingPath.aiRecommendations = JSON.stringify(pathData);
      existingPath.generatedAt = new Date();
      existingPath.lastUpdated = new Date();
      await existingPath.save();
    } else {
      // Create new learning path
      existingPath = await LearningPath.create({
        userId,
        topics,
        totalTopics: topics.length,
        aiRecommendations: JSON.stringify(pathData),
      });

      // Link to user profile
      await User.findByIdAndUpdate(userId, { learningPath: existingPath._id });
    }

    res.status(201).json({
      message: "Learning path generated successfully",
      overview: pathData.overview,
      estimatedDuration: pathData.estimatedDuration,
      learningPath: existingPath,
    });
  } catch (error) {
    console.error("Generate path error:", error);
    res
      .status(500)
      .json({ message: "Server error while generating learning path" });
  }
};

// @desc    Get user's learning path
// @route   GET /api/recommendations/path
// @access  Private
const getLearningPath = async (req, res) => {
  try {
    const learningPath = await LearningPath.findOne({ userId: req.user._id });

    if (!learningPath) {
      return res.status(404).json({
        message:
          "No learning path found. Complete an assessment to generate one.",
      });
    }

    res.json(learningPath);
  } catch (error) {
    console.error("Get path error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update topic progress
// @route   PUT /api/recommendations/progress/:topicIndex
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { topicIndex } = req.params;
    const { status } = req.body; // 'not_started', 'in_progress', 'completed'
    const userId = req.user._id;

    const learningPath = await LearningPath.findOne({ userId });

    if (!learningPath) {
      return res.status(404).json({ message: "Learning path not found" });
    }

    if (topicIndex < 0 || topicIndex >= learningPath.topics.length) {
      return res.status(400).json({ message: "Invalid topic index" });
    }

    // Update topic status
    learningPath.topics[topicIndex].status = status;
    if (status === "completed") {
      learningPath.topics[topicIndex].completedAt = new Date();
    }

    // Recalculate progress
    learningPath.updateProgress();
    await learningPath.save();

    res.json({
      message: "Progress updated successfully",
      topic: learningPath.topics[topicIndex],
      overallProgress: {
        completed: learningPath.completedTopics,
        total: learningPath.totalTopics,
        percentage: learningPath.progressPercentage,
      },
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get next recommendations based on progress
// @route   GET /api/recommendations/next
// @access  Private
const getNextSteps = async (req, res) => {
  try {
    const learningPath = await LearningPath.findOne({ userId: req.user._id });

    if (!learningPath) {
      return res.status(404).json({ message: "No learning path found" });
    }

    const completedTopics = learningPath.topics
      .filter((t) => t.status === "completed")
      .map((t) => t.title);

    const recommendations = await getNextRecommendations(completedTopics, {
      topics: learningPath.topics,
    });

    res.json({
      progress: learningPath.progressPercentage,
      completedCount: learningPath.completedTopics,
      totalCount: learningPath.totalTopics,
      ...recommendations,
    });
  } catch (error) {
    console.error("Get next steps error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reset learning path
// @route   DELETE /api/recommendations/reset
// @access  Private
const resetPath = async (req, res) => {
  try {
    await LearningPath.findOneAndDelete({ userId: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { learningPath: null });

    res.json({ message: "Learning path reset successfully" });
  } catch (error) {
    console.error("Reset path error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  generatePath,
  getLearningPath,
  updateProgress,
  getNextSteps,
  resetPath,
};
