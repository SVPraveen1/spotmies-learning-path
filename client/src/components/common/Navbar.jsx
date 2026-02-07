import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BookOpen,
  LogOut,
  User,
  LayoutDashboard,
  Map as MapIcon,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar glass">
      <Link to="/" className="navbar-brand">
        <div
          style={{
            width: "40px",
            height: "40px",
            background:
              "linear-gradient(135deg, var(--primary), var(--secondary))",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(99, 71, 235, 0.3)",
          }}
        >
          <BookOpen size={24} color="white" />
        </div>
        <span style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
          LearnPath AI
        </span>
      </Link>

      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link to="/learning-path" className="nav-link">
              <MapIcon size={20} />
              Learning Path
            </Link>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                paddingLeft: "1rem",
                borderLeft: "2px solid var(--border-color)",
                marginLeft: "0.5rem",
              }}
            >
              <span
                style={{
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontWeight: 500,
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--background)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <User size={16} />
                </div>
                {user.name}
              </span>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" style={{ fontSize: "1rem" }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get Started Free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
