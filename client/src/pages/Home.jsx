import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Target,
  TrendingUp,
  Brain,
  CheckCircle,
  FileDown,
} from "lucide-react";

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          Your Personalized
          <br />
          <span className="text-gradient">Learning Journey Starts Here</span>
        </h1>
        <p className="hero-subtitle">
          Take skill assessments, get AI-powered recommendations, and follow a
          customized learning roadmap tailored just for you.
        </p>
        <div className="hero-buttons">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                <Sparkles size={20} />
                Go to Dashboard
              </Link>
              <Link to="/learning-path" className="btn btn-secondary btn-lg">
                View Learning Path
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                <Sparkles size={20} />
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Why Choose LearnPath AI?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Target size={32} />
            </div>
            <h3 className="feature-title">Skill Assessments</h3>
            <p className="feature-desc">
              Take quizzes on JavaScript, Databases, React, and more to
              understand your current skill level.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Brain size={32} />
            </div>
            <h3 className="feature-title">AI Recommendations</h3>
            <p className="feature-desc">
              Our AI analyzes your results and creates a personalized learning
              path with curated resources.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <TrendingUp size={32} />
            </div>
            <h3 className="feature-title">Visual Roadmap</h3>
            <p className="feature-desc">
              View your learning journey as an interactive roadmap with topics
              and dependencies visualized.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <CheckCircle size={32} />
            </div>
            <h3 className="feature-title">Track Progress</h3>
            <p className="feature-desc">
              Mark topics as complete and track your overall progress as you
              learn new skills.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FileDown size={32} />
            </div>
            <h3 className="feature-title">Export to PDF</h3>
            <p className="feature-desc">
              Download your personalized learning roadmap as a PDF to reference
              anytime, anywhere.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Sparkles size={32} />
            </div>
            <h3 className="feature-title">Free Resources</h3>
            <p className="feature-desc">
              Get recommended free courses, articles, and videos from trusted
              platforms like MDN, freeCodeCamp, and more.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))",
        }}
      >
        <h2
          style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "1rem" }}
        >
          Ready to Start Learning?
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "2rem",
            maxWidth: "500px",
            margin: "0 auto 2rem",
          }}
        >
          Join thousands of learners who are already on their personalized
          learning journey.
        </p>
        <Link
          to={user ? "/dashboard" : "/register"}
          className="btn btn-primary btn-lg"
        >
          {user ? "Continue Learning" : "Start Now — It's Free"}
        </Link>
      </section>
    </div>
  );
};

export default Home;
