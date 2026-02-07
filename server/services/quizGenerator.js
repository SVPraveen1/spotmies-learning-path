const { GoogleGenerativeAI } = require("@google/generative-ai");
const quizData = require("../data/quizQuestions");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate fresh quiz questions using Gemini AI
 * @param {string} subject - The subject for the quiz
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Object} - Generated quiz with questions
 */
const generateFreshQuiz = async (subject, numQuestions = 10) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const subjectInfo = {
      javascript: {
        title: "JavaScript",
        topics:
          "variables, functions, closures, prototypes, ES6+, async/await, DOM, event loop, promises, arrays, objects",
      },
      databases: {
        title: "Databases",
        topics:
          "SQL, NoSQL, MongoDB, indexing, normalization, ACID, transactions, queries, joins, aggregation, schemas",
      },
      react: {
        title: "React.js",
        topics:
          "components, hooks, state, props, JSX, virtual DOM, lifecycle, context, Redux basics, React Router, performance",
      },
      nodejs: {
        title: "Node.js",
        topics:
          "event loop, modules, npm, Express, middleware, REST APIs, streams, buffers, file system, authentication",
      },
    };

    const info = subjectInfo[subject] || {
      title: subject,
      topics: "general programming concepts",
    };

    const prompt = `You are an expert quiz generator. Create ${numQuestions} unique multiple-choice questions for a ${info.title} skill assessment.

Topics to cover: ${info.topics}
Random Seed: ${Date.now()}-${Math.random()} (Use this to generate a completely new set of questions)

Requirements:
1. Questions should vary in difficulty (3 easy, 4 medium, 3 hard)
2. Each question must have exactly 4 options
3. Questions should test practical knowledge, not just definitions
4. Include some code-based questions where appropriate
5. Make questions unique and DIFFERENT from previous generations
6. Do NOT reuse common questions. Be creative!

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "questions": [
    {
      "id": "q1",
      "question": "The question text goes here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this answer is correct",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Important:
- correctAnswer is the index (0-3) of the correct option
- Each question must be unique and different from standard/common questions
- Test real understanding, not memorization
- Include practical scenarios when possible`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code blocks if present
    text = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const generated = JSON.parse(text);

    // Validate and format questions
    const questions = generated.questions.map((q, index) => ({
      id: `${subject}-ai-${Date.now()}-${index}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "Review the topic for more details.",
      difficulty: q.difficulty || "medium",
    }));

    return {
      success: true,
      subject,
      title: `${info.title} Assessment`,
      description: `AI-generated assessment to test your ${info.title} knowledge`,
      timeLimit: 600, // 10 minutes
      questions,
    };
  } catch (error) {
    console.error("Quiz generation error:", error);

    // Fallback to static questions if AI fails
    const fallbackQuiz = quizData[subject];
    if (fallbackQuiz) {
      // Shuffle the fallback questions
      const shuffled = [...fallbackQuiz.questions].sort(
        () => Math.random() - 0.5,
      );
      return {
        success: false,
        subject,
        title: fallbackQuiz.title,
        description: fallbackQuiz.description,
        timeLimit: fallbackQuiz.timeLimit,
        questions: shuffled.map((q, index) => ({
          ...q,
          id: `${subject}-fallback-${Date.now()}-${index}`,
        })),
        fallback: true,
      };
    }

    throw new Error(`Failed to generate quiz for ${subject}`);
  }
};

module.exports = {
  generateFreshQuiz,
};
