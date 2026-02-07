import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  BookOpen,
  Clock,
  HelpCircle,
  Trophy,
  Map,
  Sparkles,
  ChevronRight,
  RefreshCw,
  History,
  FileCode,
  Database,
  Atom,
  Server,
  Layers,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, historyRes, pathRes] = await Promise.all([
        api.get("/assessments/subjects"),
        api.get("/assessments/history"),
        api.get("/recommendations/path").catch(() => ({ data: null })),
      ]);
      setSubjects(subjectsRes.data);
      setAssessments(historyRes.data);
      setLearningPath(pathRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateLearningPath = async () => {
    setGenerating(true);
    try {
      await api.post("/recommendations/generate");
      const pathRes = await api.get("/recommendations/path");
      setLearningPath(pathRes.data);
      navigate("/learning-path");
    } catch (error) {
      console.error("Error generating path:", error);
      alert(
        error.response?.data?.message || "Failed to generate learning path",
      );
    } finally {
      setGenerating(false);
    }
  };

  const getSubjectIcon = (subjectId) => {
    switch (subjectId) {
      case "javascript":
        return <FileCode size={32} />;
      case "databases":
        return <Database size={32} />;
      case "react":
        return <Atom size={32} />;
      case "nodejs":
        return <Server size={32} />;
      default:
        return <Layers size={32} />;
    }
  };

  const getAverageScore = () => {
    if (assessments.length === 0) return 0;
    const total = assessments.reduce((sum, a) => sum + a.score, 0);
    return Math.round(total / assessments.length);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user?.name}! 👋</h1>
        <p className="dashboard-subtitle">
          Continue your learning journey or take a new assessment
        </p>
      </div>

      {/* Stats */}
      <div className="dashboard-grid" style={{ marginBottom: "2rem" }}>
        <div className="stats-card">
          <p className="stats-title">Assessments Completed</p>
          <p className="stats-value">{assessments.length}</p>
        </div>
        <div className="stats-card">
          <p className="stats-title">Average Score</p>
          <p className="stats-value" style={{ color: "var(--success)" }}>
            {getAverageScore()}%
          </p>
        </div>
        <div className="stats-card">
          <p className="stats-title">Progress</p>
          <p className="stats-value" style={{ color: "var(--warning)" }}>
            {learningPath?.progressPercentage || 0}%
          </p>
        </div>
      </div>

      {/* Learning Path CTA */}
      <div
        className="card"
        style={{
          marginBottom: "2rem",
          background: "var(--surface)",
          padding: "2rem",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                background:
                  "linear-gradient(135deg, var(--primary), var(--secondary))",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <Map size={32} color="white" />
            </div>
            <div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  marginBottom: "0.5rem",
                }}
              >
                {learningPath
                  ? "Your Learning Path"
                  : "Generate Your Learning Path"}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
                {learningPath
                  ? `${learningPath.completedTopics} of ${learningPath.totalTopics} topics completed`
                  : "Complete assessments and get AI-powered recommendations"}
              </p>
            </div>
          </div>
          {learningPath ? (
            <Link to="/learning-path" className="btn btn-primary btn-lg">
              View Roadmap
              <ChevronRight size={20} />
            </Link>
          ) : (
            <button
              onClick={generateLearningPath}
              className="btn btn-primary btn-lg"
              disabled={generating || assessments.length === 0}
            >
              {generating ? (
                <>
                  <RefreshCw size={20} className="spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Path
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Available Assessments */}
      <h2
        className="section-title"
        style={{
          textAlign: "left",
          fontSize: "1.75rem",
          marginBottom: "1.5rem",
        }}
      >
        Take an Assessment
      </h2>

      <div className="dashboard-grid" style={{ marginBottom: "3rem" }}>
        {subjects.map((subject) => {
          const completed = assessments.find((a) => a.subject === subject.id);
          return (
            <div
              key={subject.id}
              className="subject-card"
              onClick={() => navigate(`/assessment/${subject.id}`)}
            >
              <div className="subject-icon">{getSubjectIcon(subject.id)}</div>

              <h3
                className="subject-title"
                style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}
              >
                {subject.title}
              </h3>

              <p
                className="subject-desc"
                style={{ marginBottom: "1.5rem", fontSize: "0.95rem" }}
              >
                {subject.description}
              </p>

              <div
                className="subject-meta"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <HelpCircle size={14} />
                  {subject.questionCount} questions
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Clock size={14} />
                  {Math.floor(subject.timeLimit / 60)} min
                </span>
                {completed && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      color: "var(--success)",
                      background: "rgba(16, 185, 129, 0.1)",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontWeight: "600",
                    }}
                  >
                    <Trophy size={14} />
                    {completed.score}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Assessments */}
      {assessments.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <h2
              className="section-title"
              style={{
                textAlign: "left",
                fontSize: "1.75rem",
                marginBottom: 0,
              }}
            >
              Recent Activity
            </h2>
            <Link to="/quiz-history" className="btn btn-secondary">
              <History size={18} />
              View All History
            </Link>
          </div>

          <div className="topics-list">
            {assessments.slice(0, 5).map((assessment, index) => (
              <div key={index} className="topic-card">
                <div className={`topic-status completed`}>
                  {getSubjectIcon(assessment.subject)}
                </div>
                <div className="topic-content">
                  <h4
                    className="topic-title"
                    style={{ textTransform: "capitalize" }}
                  >
                    {assessment.subject.replace("-", " ")} Assessment
                  </h4>
                  <div className="topic-meta">
                    <span
                      style={{ fontWeight: "600", color: "var(--primary)" }}
                    >
                      Score: {assessment.score}%
                    </span>
                    <span className={`badge badge-${assessment.skillLevel}`}>
                      {assessment.skillLevel}
                    </span>
                    <span>
                      {new Date(assessment.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
