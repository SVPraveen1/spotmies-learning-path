require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const User = require("../models/User");
const Assessment = require("../models/Assessment");
const LearningPath = require("../models/LearningPath");

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_DB);
    console.log("✅ Connected to MongoDB");

    // Check if demo user exists
    const existingUser = await User.findOne({ email: "demo@learningpath.com" });

    if (existingUser) {
      console.log("⚠️  Demo user already exists. Deleting and recreating...");
      await Assessment.deleteMany({ userId: existingUser._id });
      await LearningPath.deleteMany({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // Create demo user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("demo123", salt);

    const demoUser = await User.create({
      name: "Demo User",
      email: "demo@learningpath.com",
      password: hashedPassword,
    });
    console.log("✅ Demo user created");

    // Create sample assessments
    const jsAssessment = await Assessment.create({
      userId: demoUser._id,
      subject: "javascript",
      answers: [
        { questionId: "js-1", selectedOption: 2, isCorrect: true },
        { questionId: "js-2", selectedOption: 1, isCorrect: true },
        { questionId: "js-3", selectedOption: 1, isCorrect: true },
        { questionId: "js-4", selectedOption: 2, isCorrect: true },
        { questionId: "js-5", selectedOption: 1, isCorrect: true },
        { questionId: "js-6", selectedOption: 0, isCorrect: false },
        { questionId: "js-7", selectedOption: 1, isCorrect: true },
        { questionId: "js-8", selectedOption: 1, isCorrect: true },
        { questionId: "js-9", selectedOption: 0, isCorrect: false },
        { questionId: "js-10", selectedOption: 1, isCorrect: true },
      ],
      score: 80,
      totalQuestions: 10,
      correctAnswers: 8,
      timeTaken: 420,
      skillLevel: "advanced",
    });

    const dbAssessment = await Assessment.create({
      userId: demoUser._id,
      subject: "databases",
      answers: [
        { questionId: "db-1", selectedOption: 0, isCorrect: true },
        { questionId: "db-2", selectedOption: 2, isCorrect: true },
        { questionId: "db-3", selectedOption: 1, isCorrect: true },
        { questionId: "db-4", selectedOption: 1, isCorrect: true },
        { questionId: "db-5", selectedOption: 0, isCorrect: false },
        { questionId: "db-6", selectedOption: 1, isCorrect: true },
        { questionId: "db-7", selectedOption: 0, isCorrect: false },
        { questionId: "db-8", selectedOption: 1, isCorrect: true },
        { questionId: "db-9", selectedOption: 1, isCorrect: true },
        { questionId: "db-10", selectedOption: 0, isCorrect: false },
      ],
      score: 70,
      totalQuestions: 10,
      correctAnswers: 7,
      timeTaken: 380,
      skillLevel: "intermediate",
    });

    // Update user with assessments
    await User.findByIdAndUpdate(demoUser._id, {
      $push: { assessments: { $each: [jsAssessment._id, dbAssessment._id] } },
    });
    console.log("✅ Sample assessments created");

    // Create sample learning path
    const learningPath = await LearningPath.create({
      userId: demoUser._id,
      topics: [
        {
          title: "JavaScript Deep Dive",
          description:
            "Master advanced JavaScript concepts including closures, prototypes, and the event loop",
          difficulty: "advanced",
          status: "completed",
          completedAt: new Date(),
          order: 1,
          resources: [
            {
              title: "JavaScript: Understanding the Weird Parts",
              url: "https://www.youtube.com/watch?v=Bv_5Zv5c-Ts",
              type: "video",
            },
            {
              title: "MDN JavaScript Guide",
              url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
              type: "documentation",
            },
          ],
        },
        {
          title: "ES6+ Modern Features",
          description:
            "Learn destructuring, spread operator, modules, and other modern JavaScript features",
          difficulty: "intermediate",
          status: "completed",
          completedAt: new Date(),
          order: 2,
          resources: [
            {
              title: "ES6 for Everyone",
              url: "https://es6.io/",
              type: "course",
            },
            {
              title: "JavaScript.info Modern JavaScript",
              url: "https://javascript.info/",
              type: "article",
            },
          ],
        },
        {
          title: "Async JavaScript Mastery",
          description:
            "Deep dive into Promises, async/await, and handling asynchronous operations",
          difficulty: "advanced",
          status: "in_progress",
          order: 3,
          resources: [
            {
              title: "Async Await Tutorial",
              url: "https://www.youtube.com/watch?v=vn3tm0quoqE",
              type: "video",
            },
            {
              title: "MDN Async/Await",
              url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous",
              type: "documentation",
            },
          ],
        },
        {
          title: "MongoDB Fundamentals",
          description:
            "Understand document databases, CRUD operations, and data modeling",
          difficulty: "beginner",
          status: "not_started",
          order: 4,
          resources: [
            {
              title: "MongoDB University M001",
              url: "https://university.mongodb.com/courses/M001",
              type: "course",
            },
            {
              title: "MongoDB Documentation",
              url: "https://docs.mongodb.com/",
              type: "documentation",
            },
          ],
        },
        {
          title: "MongoDB Indexing & Performance",
          description:
            "Learn about indexes, query optimization, and database performance tuning",
          difficulty: "intermediate",
          status: "not_started",
          order: 5,
          resources: [
            {
              title: "MongoDB Performance M201",
              url: "https://university.mongodb.com/courses/M201",
              type: "course",
            },
          ],
        },
        {
          title: "Mongoose ODM",
          description:
            "Master Mongoose schemas, middleware, and integration with Node.js",
          difficulty: "intermediate",
          status: "not_started",
          order: 6,
          resources: [
            {
              title: "Mongoose Documentation",
              url: "https://mongoosejs.com/docs/",
              type: "documentation",
            },
            {
              title: "Mongoose Crash Course",
              url: "https://www.youtube.com/watch?v=DZBGEVgL2eE",
              type: "video",
            },
          ],
        },
        {
          title: "React Fundamentals",
          description:
            "Learn React components, JSX, props, and state management",
          difficulty: "beginner",
          status: "not_started",
          order: 7,
          resources: [
            {
              title: "React Documentation",
              url: "https://react.dev/learn",
              type: "documentation",
            },
            {
              title: "React Full Course 2024",
              url: "https://www.youtube.com/watch?v=CgkZ7MvWUAA",
              type: "video",
            },
          ],
        },
        {
          title: "React Hooks Deep Dive",
          description:
            "Master useState, useEffect, useContext, and custom hooks",
          difficulty: "intermediate",
          status: "not_started",
          order: 8,
          resources: [
            {
              title: "React Hooks Guide",
              url: "https://react.dev/reference/react/hooks",
              type: "documentation",
            },
          ],
        },
      ],
      totalTopics: 8,
      completedTopics: 2,
      progressPercentage: 25,
      generatedAt: new Date(),
    });

    // Link learning path to user
    await User.findByIdAndUpdate(demoUser._id, {
      learningPath: learningPath._id,
    });
    console.log("✅ Sample learning path created");

    console.log("\n🎉 Seed data created successfully!");
    console.log("\n📋 Demo Account Credentials:");
    console.log("   Email: demo@learningpath.com");
    console.log("   Password: demo123\n");

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
