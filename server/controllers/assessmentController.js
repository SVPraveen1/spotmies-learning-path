const Assessment = require("../models/Assessment");
const User = require("../models/User");
const quizData = require("../data/quizQuestions");
const { generateFreshQuiz } = require("../services/quizGenerator");

// @desc    Get available subjects for assessment
// @route   GET /api/assessments/subjects
// @access  Public
const getSubjects = async (req, res) => {
  try {
    const subjects = Object.keys(quizData).map((key) => ({
      id: key,
      title: quizData[key].title,
      description: quizData[key].description,
      questionCount: 10, // AI generates 10 questions
      timeLimit: quizData[key].timeLimit,
    }));

    res.json(subjects);
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get quiz questions for a subject (AI-generated fresh questions each time)
// @route   GET /api/assessments/quiz/:subject
// @access  Private
const getQuiz = async (req, res) => {
  try {
    const { subject } = req.params;

    if (!quizData[subject]) {
      return res.status(404).json({ message: "Subject not found" });
    }

    console.log(`Generating fresh quiz for ${subject}...`);

    // Generate fresh questions using Gemini AI
    const quiz = await generateFreshQuiz(subject, 10);

    // Generate unique quiz instance ID for this attempt
    const quizInstanceId = `${subject}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store the quiz instance mapping in memory (for grading)
    if (!global.quizInstances) {
      global.quizInstances = new Map();
    }

    // Store mapping for grading later (includes correct answers)
    global.quizInstances.set(quizInstanceId, {
      subject,
      questions: quiz.questions.map((q, index) => ({
        instanceId: `${quizInstanceId}-q${index}`,
        originalId: q.id,
        correctIndex: q.correctAnswer,
        question: q.question,
        options: q.options,
        explanation: q.explanation,
      })),
      createdAt: Date.now(),
    });

    // Clean up old quiz instances (older than 2 hours)
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    for (const [key, value] of global.quizInstances.entries()) {
      if (value.createdAt < twoHoursAgo) {
        global.quizInstances.delete(key);
      }
    }

    // Return questions without correct answers
    const clientQuestions = quiz.questions.map((q, index) => ({
      id: `${quizInstanceId}-q${index}`,
      question: q.question,
      options: q.options,
    }));

    res.json({
      subject,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      quizInstanceId,
      isAIGenerated: quiz.success !== false,
      questions: clientQuestions,
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    res
      .status(500)
      .json({ message: "Failed to generate quiz. Please try again." });
  }
};

// @desc    Submit quiz answers and get results
// @route   POST /api/assessments/submit
// @access  Private
const submitAssessment = async (req, res) => {
  try {
    const { subject, answers, timeTaken, quizInstanceId } = req.body;
    const userId = req.user._id;

    if (!quizData[subject]) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const quiz = quizData[subject];
    let correctAnswersCount = 0;
    const gradedAnswers = [];

    // Get quiz instance mapping if available
    const quizInstance =
      quizInstanceId && global.quizInstances
        ? global.quizInstances.get(quizInstanceId)
        : null;

    // Grade each answer
    answers.forEach((answer) => {
      let isCorrect = false;
      let originalQuestionId = answer.questionId;

      if (quizInstance) {
        // Find the question mapping from the quiz instance
        const questionMapping = quizInstance.questions.find(
          (q) => q.instanceId === answer.questionId,
        );

        if (questionMapping) {
          isCorrect = questionMapping.correctIndex === answer.selectedOption;
          originalQuestionId = questionMapping.originalId;
        }
      } else {
        // Fallback to old method (for backwards compatibility)
        const question = quiz.questions.find((q) => q.id === answer.questionId);
        if (question) {
          isCorrect = question.correctAnswer === answer.selectedOption;
        }
      }

      if (isCorrect) correctAnswersCount++;

      gradedAnswers.push({
        questionId: originalQuestionId,
        selectedOption: answer.selectedOption,
        isCorrect,
      });
    });

    // Calculate score based on total questions in the quiz
    const totalQuestions = quizInstance
      ? quizInstance.questions.length
      : quiz.questions.length;
    const score = Math.round((correctAnswersCount / totalQuestions) * 100);

    // Determine skill level
    let skillLevel = "beginner";
    if (score >= 75) skillLevel = "advanced";
    else if (score >= 40) skillLevel = "intermediate";

    // Create assessment record
    const assessment = await Assessment.create({
      userId,
      subject,
      answers: gradedAnswers,
      score,
      totalQuestions,
      correctAnswers: correctAnswersCount,
      timeTaken: timeTaken || 0,
      skillLevel,
    });

    // Add assessment to user's profile
    await User.findByIdAndUpdate(userId, {
      $push: { assessments: assessment._id },
    });

    // Clean up used quiz instance
    if (quizInstanceId && global.quizInstances) {
      global.quizInstances.delete(quizInstanceId);
    }

    // Build results with explanations
    // Map back to original questions for explanations
    const results = [];

    if (quizInstance) {
      // For AI-generated quizzes, use the stored question data
      quizInstance.questions.forEach((qMap) => {
        const userAnswer = answers.find(
          (a) => a.questionId === qMap.instanceId,
        );

        results.push({
          questionId: qMap.instanceId,
          question: qMap.question,
          options: qMap.options,
          correctAnswer: qMap.correctIndex,
          selectedAnswer: userAnswer ? userAnswer.selectedOption : null,
          isCorrect: userAnswer
            ? qMap.correctIndex === userAnswer.selectedOption
            : false,
          explanation: qMap.explanation || "Review the topic for more details.",
        });
      });
    } else {
      // Fallback for old quiz format
      quiz.questions.forEach((q) => {
        const userAnswer = answers.find((a) => a.questionId === q.id);
        results.push({
          questionId: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          selectedAnswer: userAnswer ? userAnswer.selectedOption : null,
          isCorrect: userAnswer
            ? q.correctAnswer === userAnswer.selectedOption
            : false,
          explanation: q.explanation,
        });
      });
    }

    res.status(201).json({
      assessmentId: assessment._id,
      subject,
      score,
      skillLevel,
      correctAnswers: correctAnswersCount,
      totalQuestions,
      timeTaken,
      results,
    });
  } catch (error) {
    console.error("Submit assessment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user's assessment history
// @route   GET /api/assessments/history
// @access  Private
const getAssessmentHistory = async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id }).sort({
      completedAt: -1,
    });

    res.json(assessments);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get specific assessment details
// @route   GET /api/assessments/:id
// @access  Private
const getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.json(assessment);
  } catch (error) {
    console.error("Get assessment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getSubjects,
  getQuiz,
  submitAssessment,
  getAssessmentHistory,
  getAssessment,
};
