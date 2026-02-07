require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/auth");
const assessmentRoutes = require("./routes/assessments");
const recommendationRoutes = require("./routes/recommendations");
const exportRoutes = require("./routes/export");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/export", exportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Learning Path API is running",
    timestamp: new Date().toISOString(),
  });
});

// API documentation
app.get("/api", (req, res) => {
  res.json({
    name: "Personalized Learning Path API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "Login user",
        "GET /api/auth/me": "Get current user profile",
      },
      assessments: {
        "GET /api/assessments/subjects": "Get available subjects",
        "GET /api/assessments/quiz/:subject": "Get quiz questions",
        "POST /api/assessments/submit": "Submit quiz answers",
        "GET /api/assessments/history": "Get assessment history",
      },
      recommendations: {
        "POST /api/recommendations/generate": "Generate learning path",
        "GET /api/recommendations/path": "Get current learning path",
        "PUT /api/recommendations/progress/:index": "Update topic progress",
        "GET /api/recommendations/next": "Get next recommendations",
      },
      export: {
        "GET /api/export/pdf": "Export learning path as PDF",
        "GET /api/export/json": "Export learning path as JSON",
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📚 API Documentation: http://localhost:${PORT}/api
❤️  Health Check: http://localhost:${PORT}/api/health
    `);
});

module.exports = app;
