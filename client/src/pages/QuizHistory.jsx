import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Clock,
  Brain,
  Trophy,
  Target,
  ChevronRight,
  Calendar,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const QuizHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get("/assessments/history");
      const assessments = response.data;
      setHistory(assessments);

      // Calculate stats
      if (assessments.length > 0) {
        const totalAttempts = assessments.length;
        const avgScore = Math.round(
          assessments.reduce((acc, a) => acc + a.score, 0) / totalAttempts,
        );
        const bestScore = Math.max(...assessments.map((a) => a.score));
        const subjectCounts = assessments.reduce((acc, a) => {
          acc[a.subject] = (acc[a.subject] || 0) + 1;
          return acc;
        }, {});
        const mostPracticed = Object.entries(subjectCounts).sort(
          (a, b) => b[1] - a[1],
        )[0];

        setStats({
          totalAttempts,
          avgScore,
          bestScore,
          mostPracticed: mostPracticed ? mostPracticed[0] : null,
        });
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getSkillBadge = (level) => {
    const colors = {
      beginner: { bg: "rgba(239, 68, 68, 0.1)", color: "#ef4444" },
      intermediate: { bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" },
      advanced: { bg: "rgba(16, 185, 129, 0.1)", color: "#10b981" },
    };
    const style = colors[level] || colors.beginner;
    return (
      <span
        style={{
          padding: "0.25rem 0.75rem",
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: "600",
          background: style.bg,
          color: style.color,
          textTransform: "capitalize",
          border: `1px solid ${style.color}30`,
        }}
      >
        {level}
      </span>
    );
  };

  const subjectIcons = {
    javascript: "🟨",
    databases: "🗄️",
    react: "⚛️",
    nodejs: "🟢",
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your quiz history...</p>
      </div>
    );
  }

  return (
    <div className="quiz-history-container">
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          className="path-title"
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            marginBottom: "0.5rem",
          }}
        >
          Quiz History
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Track your learning progress and see how you've improved over time
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          <div
            className="card"
            style={{ textAlign: "center", padding: "2rem" }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(99, 71, 235, 0.1)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <BarChart3 size={24} style={{ color: "var(--primary)" }} />
            </div>
            <p className="progress-stat-value">{stats.totalAttempts}</p>
            <p className="progress-stat-label">Total Attempts</p>
          </div>
          <div
            className="card"
            style={{ textAlign: "center", padding: "2rem" }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(245, 158, 11, 0.1)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <Target size={24} style={{ color: "#f59e0b" }} />
            </div>
            <p className="progress-stat-value" style={{ color: "#f59e0b" }}>
              {stats.avgScore}%
            </p>
            <p className="progress-stat-label">Average Score</p>
          </div>
          <div
            className="card"
            style={{ textAlign: "center", padding: "2rem" }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(16, 185, 129, 0.1)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <Trophy size={24} style={{ color: "#10b981" }} />
            </div>
            <p className="progress-stat-value" style={{ color: "#10b981" }}>
              {stats.bestScore}%
            </p>
            <p className="progress-stat-label">Best Score</p>
          </div>
          <div
            className="card"
            style={{ textAlign: "center", padding: "2rem" }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "rgba(139, 92, 246, 0.1)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
              }}
            >
              <Brain size={24} style={{ color: "#8b5cf6" }} />
            </div>
            <p
              className="progress-stat-value"
              style={{
                textTransform: "capitalize",
                fontSize: "1.5rem",
                color: "#8b5cf6",
              }}
            >
              {stats.mostPracticed || "N/A"}
            </p>
            <p className="progress-stat-label">Most Practiced</p>
          </div>
        </div>
      )}

      {/* History List */}
      <h2
        className="section-title"
        style={{
          textAlign: "left",
          fontSize: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        Recent Attempts
      </h2>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Clock size={40} />
          </div>
          <h2 className="empty-title">No Quiz History Yet</h2>
          <p className="empty-desc">
            Complete your first assessment to see your history here
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary btn-lg"
          >
            Take a Quiz
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {history.map((attempt, index) => (
            <div key={attempt._id || index} className="history-card">
              {/* Subject Icon */}
              <div className="history-icon">
                {subjectIcons[attempt.subject] || "📝"}
              </div>

              {/* Main Info */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      textTransform: "capitalize",
                    }}
                  >
                    {attempt.subject}
                  </h3>
                  {getSkillBadge(attempt.skillLevel)}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Calendar size={15} />
                    {formatDate(attempt.completedAt)}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Clock size={15} />
                    {formatTime(attempt.timeTaken)}
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="score-display">
                <p
                  className="score-value"
                  style={{ color: getScoreColor(attempt.score) }}
                >
                  {attempt.score}%
                </p>
                <p className="score-label">
                  {attempt.correctAnswers}/{attempt.totalQuestions} correct
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight size={20} style={{ color: "var(--text-muted)" }} />
            </div>
          ))}
        </div>
      )}

      {/* Progress Chart */}
      {history.length > 1 && (
        <div className="card" style={{ marginTop: "3rem", padding: "2rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <TrendingUp size={20} style={{ color: "var(--primary)" }} />
            Score Progression
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "0.75rem",
              height: "200px",
              padding: "1rem 0",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            {history
              .slice()
              .reverse()
              .slice(0, 10)
              .map((attempt, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "40px",
                      height: `${attempt.score}%`,
                      background: `linear-gradient(to top, ${getScoreColor(attempt.score)}, ${getScoreColor(attempt.score)}44)`,
                      borderRadius: "6px 6px 0 0",
                      minHeight: "4px",
                      transition: "height 0.5s ease",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      fontWeight: "500",
                    }}
                  >
                    {index + 1}
                  </span>
                </div>
              ))}
          </div>
          <p
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              marginTop: "1rem",
            }}
          >
            Last {Math.min(history.length, 10)} attempts
          </p>
        </div>
      )}

      {/* Back Button */}
      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-secondary btn-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuizHistory;
