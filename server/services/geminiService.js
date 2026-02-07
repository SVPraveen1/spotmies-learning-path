const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate personalized learning path recommendations based on assessment results
 * @param {Array} assessments - Array of user's assessment results
 * @returns {Object} - AI-generated learning path with topics and resources
 */
const generateLearningPath = async (assessments) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format assessment data for the prompt
    const assessmentSummary = assessments.map((a) => ({
      subject: a.subject,
      score: a.score,
      skillLevel: a.skillLevel,
      correctAnswers: a.correctAnswers,
      totalQuestions: a.totalQuestions,
    }));

    const prompt = `You are an expert learning path generator. Based on the following assessment results, create a personalized learning roadmap.

Assessment Results:
${JSON.stringify(assessmentSummary, null, 2)}

Generate a learning path with 8-12 topics that the user should learn. For each topic, consider:
1. The user's weak areas (low scores) should have more foundational topics
2. The user's strong areas (high scores) should have advanced topics
3. Include prerequisites relationships between topics
4. Provide real learning resources (free online resources preferred)

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "overview": "Brief personalized message about the learning path",
  "estimatedDuration": "Total estimated time to complete",
  "topics": [
    {
      "id": "topic-1",
      "title": "Topic Title",
      "description": "What this topic covers and why it's important",
      "subject": "javascript|databases|react|nodejs|general",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedTime": "Time to complete this topic",
      "order": 1,
      "prerequisites": [],
      "resources": [
        {
          "title": "Resource Title",
          "url": "https://actual-url.com",
          "type": "video|article|course|documentation|practice",
          "duration": "Duration or read time",
          "isFree": true
        }
      ]
    }
  ]
}

Important: 
- Use real URLs from MDN, freeCodeCamp, YouTube (specific videos), official docs, etc.
- Order topics from foundational to advanced
- Include prerequisites array with IDs of topics that should be completed first
- Make the path achievable but comprehensive`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code blocks if present
    text = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse the JSON response
    const learningPath = JSON.parse(text);

    return {
      success: true,
      data: learningPath,
    };
  } catch (error) {
    console.error("Gemini AI Error:", error);

    // Return a fallback learning path if AI fails
    return {
      success: false,
      error: error.message,
      data: generateFallbackPath(assessments),
    };
  }
};

/**
 * Generate a fallback learning path if AI fails
 */
const generateFallbackPath = (assessments) => {
  const topics = [];
  let order = 1;

  // Find the weakest subject
  const sortedAssessments = [...assessments].sort((a, b) => a.score - b.score);

  sortedAssessments.forEach((assessment) => {
    const isWeak = assessment.score < 50;
    const isStrong = assessment.score >= 75;

    const subjectTopics = getFallbackTopics(
      assessment.subject,
      isWeak,
      isStrong,
      order,
    );
    topics.push(...subjectTopics);
    order += subjectTopics.length;
  });

  return {
    overview:
      "Based on your assessment results, we've created a personalized learning path to help you improve your skills.",
    estimatedDuration: "4-6 weeks",
    topics: topics.slice(0, 12),
  };
};

/**
 * Get fallback topics for a subject
 */
const getFallbackTopics = (subject, isWeak, isStrong, startOrder) => {
  const topicsBySubject = {
    javascript: [
      {
        title: "JavaScript Fundamentals",
        description:
          "Core JavaScript concepts including variables, functions, and control flow",
        difficulty: "beginner",
        resources: [
          {
            title: "JavaScript Basics - MDN",
            url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps",
            type: "documentation",
          },
          {
            title: "JavaScript Course - freeCodeCamp",
            url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
            type: "course",
          },
        ],
      },
      {
        title: "ES6+ Features",
        description:
          "Modern JavaScript features including arrow functions, destructuring, and modules",
        difficulty: "intermediate",
        resources: [
          {
            title: "ES6 Features Overview",
            url: "https://www.freecodecamp.org/news/write-less-do-more-with-javascript-es6-5fd4a8e50ee2/",
            type: "article",
          },
        ],
      },
      {
        title: "Asynchronous JavaScript",
        description:
          "Promises, async/await, and handling asynchronous operations",
        difficulty: "advanced",
        resources: [
          {
            title: "Async JavaScript - MDN",
            url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous",
            type: "documentation",
          },
        ],
      },
    ],
    databases: [
      {
        title: "Database Fundamentals",
        description: "Understanding relational and non-relational databases",
        difficulty: "beginner",
        resources: [
          {
            title: "Database Design Course",
            url: "https://www.freecodecamp.org/news/database-design-course/",
            type: "course",
          },
        ],
      },
      {
        title: "MongoDB Essentials",
        description: "Working with MongoDB, documents, and queries",
        difficulty: "intermediate",
        resources: [
          {
            title: "MongoDB University",
            url: "https://university.mongodb.com/",
            type: "course",
          },
        ],
      },
    ],
    react: [
      {
        title: "React Basics",
        description: "Components, JSX, and React fundamentals",
        difficulty: "beginner",
        resources: [
          {
            title: "React Documentation",
            url: "https://react.dev/learn",
            type: "documentation",
          },
        ],
      },
      {
        title: "React Hooks",
        description: "useState, useEffect, and custom hooks",
        difficulty: "intermediate",
        resources: [
          {
            title: "React Hooks Guide",
            url: "https://react.dev/reference/react/hooks",
            type: "documentation",
          },
        ],
      },
    ],
    nodejs: [
      {
        title: "Node.js Basics",
        description: "Understanding Node.js runtime and core modules",
        difficulty: "beginner",
        resources: [
          {
            title: "Node.js Tutorial",
            url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
            type: "documentation",
          },
        ],
      },
      {
        title: "Express.js Framework",
        description: "Building REST APIs with Express",
        difficulty: "intermediate",
        resources: [
          {
            title: "Express.js Guide",
            url: "https://expressjs.com/en/starter/installing.html",
            type: "documentation",
          },
        ],
      },
    ],
  };

  const topics = topicsBySubject[subject] || [];

  return topics.map((topic, index) => ({
    id: `${subject}-${index + 1}`,
    title: topic.title,
    description: topic.description,
    subject: subject,
    difficulty: topic.difficulty,
    estimatedTime: isWeak ? "1-2 weeks" : "3-5 days",
    order: startOrder + index,
    prerequisites: index > 0 ? [`${subject}-${index}`] : [],
    resources: topic.resources.map((r) => ({
      ...r,
      duration: "Self-paced",
      isFree: true,
    })),
  }));
};

/**
 * Get topic recommendations based on progress
 */
const getNextRecommendations = async (completedTopics, learningPath) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Based on the user's progress, suggest what they should focus on next.

Completed Topics: ${completedTopics.join(", ")}
Remaining Topics: ${learningPath.topics
      .filter((t) => !completedTopics.includes(t.id))
      .map((t) => t.title)
      .join(", ")}

Provide a brief motivational message and 2-3 specific next steps. Return as JSON:
{
  "message": "Encouraging message about progress",
  "nextSteps": ["Step 1", "Step 2", "Step 3"],
  "focusTopic": "The most important topic to focus on next"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Recommendation error:", error);
    return {
      message: "Great progress! Keep going!",
      nextSteps: ["Continue with the next topic in your path"],
      focusTopic: null,
    };
  }
};

module.exports = {
  generateLearningPath,
  getNextRecommendations,
};
