import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const Assessment = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    fetchQuiz();
  }, [subject]);

  useEffect(() => {
    if (!quiz || results) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, results]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/assessments/quiz/${subject}`);
      setQuiz(response.data);
      setTimeLeft(response.data.timeLimit);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      alert("Failed to load quiz");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    const formattedAnswers = Object.entries(answers).map(
      ([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }),
    );

    try {
      const response = await api.post("/assessments/submit", {
        subject,
        answers: formattedAnswers,
        timeTaken,
        quizInstanceId: quiz.quizInstanceId,
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  // Results Screen
  if (results) {
    const getMessage = () => {
      if (results.score >= 75) return "Excellent work! 🎉";
      if (results.score >= 50) return "Good job! Keep learning! 💪";
      return "Keep practicing! You'll get better! 📚";
    };

    return (
      <div className="quiz-container">
        <div
          className="card"
          style={{ textAlign: "center", padding: "3rem", marginBottom: "2rem" }}
        >
          <Trophy
            size={64}
            style={{ color: "var(--warning)", marginBottom: "1rem" }}
          />
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            Assessment Complete!
          </h1>
          <p
            style={{
              fontSize: "3rem",
              fontWeight: "800",
              color: "var(--primary)",
              margin: "1rem 0",
            }}
          >
            {results.score}%
          </p>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              marginBottom: "1.5rem",
            }}
          >
            {getMessage()}
          </p>
          <span
            className={`badge badge-${results.skillLevel}`}
            style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}
          >
            {results.skillLevel.charAt(0).toUpperCase() +
              results.skillLevel.slice(1)}{" "}
            Level
          </span>

          <div
            style={{
              display: "flex",
              gap: "3rem",
              justifyContent: "center",
              marginTop: "2.5rem",
              marginBottom: "2.5rem",
              borderTop: "1px solid var(--border-color)",
              paddingTop: "2rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "800",
                  color: "var(--success)",
                }}
              >
                {results.correctAnswers}
              </p>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Correct
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "800",
                  color: "var(--error)",
                }}
              >
                {results.totalQuestions - results.correctAnswers}
              </p>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Incorrect
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                }}
              >
                {results.timeTaken < 60
                  ? `${results.timeTaken}s`
                  : `${Math.floor(results.timeTaken / 60)}m`}
              </p>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Time Taken
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-secondary btn-lg"
            >
              <RotateCcw size={20} />
              Return to Dashboard
            </button>
            <button
              onClick={async () => {
                await api.post("/recommendations/generate");
                navigate("/learning-path");
              }}
              className="btn btn-primary btn-lg"
            >
              <Sparkles size={20} />
              Generate Learning Path
            </button>
          </div>
        </div>

        {/* Review Answers */}
        <h2 className="section-title">Review Your Answers</h2>
        <div className="review-list">
          {results.results.map((result, index) => (
            <div
              key={result.questionId}
              className="card"
              style={{ marginBottom: "1.5rem", padding: "1.5rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                <div style={{ marginTop: "0.25rem" }}>
                  {result.isCorrect ? (
                    <CheckCircle size={24} color="var(--success)" />
                  ) : (
                    <XCircle size={24} color="var(--error)" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontWeight: "600",
                      marginBottom: "1rem",
                      fontSize: "1.1rem",
                    }}
                  >
                    {index + 1}. {result.question}
                  </p>
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {result.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        style={{
                          padding: "0.75rem 1rem",
                          borderRadius: "var(--radius)",
                          fontSize: "0.95rem",
                          background:
                            optIndex === result.correctAnswer
                              ? "rgba(16, 185, 129, 0.1)"
                              : optIndex === result.selectedAnswer &&
                                  !result.isCorrect
                                ? "rgba(239, 68, 68, 0.1)"
                                : "transparent",
                          border:
                            optIndex === result.correctAnswer
                              ? "1px solid var(--success)"
                              : optIndex === result.selectedAnswer &&
                                  !result.isCorrect
                                ? "1px solid var(--error)"
                                : "1px solid var(--border-color)",
                          color:
                            optIndex === result.correctAnswer
                              ? "var(--success)"
                              : optIndex === result.selectedAnswer &&
                                  !result.isCorrect
                                ? "var(--error)"
                                : "var(--text-secondary)",
                          fontWeight:
                            optIndex === result.correctAnswer ||
                            optIndex === result.selectedAnswer
                              ? "600"
                              : "400",
                        }}
                      >
                        {option}
                        {optIndex === result.correctAnswer && (
                          <span
                            style={{
                              float: "right",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                            }}
                          >
                            Correct Answer
                          </span>
                        )}
                        {optIndex === result.selectedAnswer &&
                          !result.isCorrect && (
                            <span
                              style={{
                                float: "right",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                              }}
                            >
                              Your Answer
                            </span>
                          )}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "1rem",
                      background: "rgba(99, 71, 235, 0.05)",
                      borderRadius: "var(--radius)",
                      fontSize: "0.9rem",
                      borderLeft: "4px solid var(--primary)",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "600",
                        color: "var(--primary)",
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Explanation:
                    </span>
                    {result.explanation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Quiz Screen
  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1 className="quiz-title">{quiz.title}</h1>
        <p style={{ color: "var(--text-secondary)" }}>{quiz.description}</p>
      </div>

      <div className="quiz-progress">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "var(--text-secondary)",
            }}
          >
            <span>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span>{Math.round(progress)}% Completed</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="timer">
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="question-card">
        <p className="question-number">Question {currentQuestion + 1}</p>
        <h2 className="question-text">{question.question}</h2>

        <div className="options">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`option ${answers[question.id] === index ? "selected" : ""}`}
              onClick={() => handleAnswer(question.id, index)}
            >
              <span className="option-marker">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="quiz-nav">
        <button
          className="btn btn-secondary btn-lg"
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={
              submitting || Object.keys(answers).length < quiz.questions.length
            }
          >
            {submitting ? "Submitting..." : "Submit Assessment"}
            <CheckCircle size={20} />
          </button>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
          >
            Next Question
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginTop: "3rem",
          justifyContent: "center",
          paddingTop: "2rem",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        {quiz.questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestion(index)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.2s",
              background:
                currentQuestion === index
                  ? "var(--primary)"
                  : answers[q.id] !== undefined
                    ? "var(--success)"
                    : "var(--surface)",
              color:
                currentQuestion === index || answers[q.id] !== undefined
                  ? "white"
                  : "var(--text-secondary)",
              boxShadow:
                currentQuestion === index ? "var(--shadow-md)" : "none",
              border:
                currentQuestion === index
                  ? "none"
                  : "1px solid var(--border-color)",
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Assessment;
