# Personalized Learning Path Generator

A full-stack platform that generates custom learning paths based on skill assessments and AI recommendations.

![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?style=for-the-badge&logo=d3dotjs&logoColor=black)

## 🌟 Features

- **Skill Assessments**: Take quizzes on JavaScript, Databases, React, and Node.js
- **AI-Powered Recommendations**: Gemini AI analyzes your results and creates personalized learning paths
- **Interactive Roadmap**: View your learning journey as a visual DAG (Directed Acyclic Graph)
- **Progress Tracking**: Mark topics as complete and track your overall progress
- **PDF Export**: Download your personalized learning roadmap as a PDF

## 📁 Project Structure

```
spotmies-assignment/
├── .env                    # Environment variables
├── .gitignore             # Git ignore file
├── server/                # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── assessmentController.js
│   │   ├── recommendationController.js
│   │   └── exportController.js
│   ├── data/
│   │   └── quizQuestions.js
│   ├── middleware/
│   │   └── auth.js        # JWT authentication
│   ├── models/
│   │   ├── User.js
│   │   ├── Assessment.js
│   │   ├── Topic.js
│   │   └── LearningPath.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── assessments.js
│   │   ├── recommendations.js
│   │   └── export.js
│   ├── services/
│   │   └── geminiService.js
│   ├── seed/
│   │   └── seedData.js    # Demo data seeder
│   ├── index.js           # Server entry point
│   └── package.json
│
└── client/                # Frontend (React + Vite)
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   ├── Dashboard/
    │   │   │   └── Dashboard.jsx
    │   │   └── common/
    │   │       └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Assessment.jsx
    │   │   └── LearningPath.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   └── index.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- Gemini API key

### 1. Clone and Setup Environment

```bash
# Navigate to project directory
cd spotmies-assignment

# Create .env file with your credentials (if not already present)
# MONGO_DB=your_mongodb_connection_string
# GEMINI_API_KEY=your_gemini_api_key
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Seed Demo Data (Optional)

```bash
cd server
npm run seed
```

This creates a demo account with sample assessments and learning path.

### 4. Run the Application

**Terminal 1 - Backend Server:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend Dev Server:**

```bash
cd client
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api

## 👤 Demo Account

After running the seed script:

- **Email**: `test@gmaill.com`
- **Password**: `123456`

The demo account includes:

- Sample JavaScript and Databases assessments
- Pre-generated learning path with 8 topics
- 25% progress (2 topics completed)

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| POST   | `/api/auth/register` | Register new user        |
| POST   | `/api/auth/login`    | Login user               |
| GET    | `/api/auth/me`       | Get current user profile |

### Assessments

| Method | Endpoint                         | Description            |
| ------ | -------------------------------- | ---------------------- |
| GET    | `/api/assessments/subjects`      | Get available subjects |
| GET    | `/api/assessments/quiz/:subject` | Get quiz questions     |
| POST   | `/api/assessments/submit`        | Submit quiz answers    |
| GET    | `/api/assessments/history`       | Get assessment history |

### Recommendations

| Method | Endpoint                               | Description               |
| ------ | -------------------------------------- | ------------------------- |
| POST   | `/api/recommendations/generate`        | Generate learning path    |
| GET    | `/api/recommendations/path`            | Get current learning path |
| PUT    | `/api/recommendations/progress/:index` | Update topic progress     |

### Export

| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| GET    | `/api/export/pdf`  | Export learning path as PDF  |
| GET    | `/api/export/json` | Export learning path as JSON |

## 🛠️ Technologies Used

### Frontend

- React.js 18
- React Router v6
- D3.js for DAG visualization
- Axios for API calls
- Lucide React for icons
- Vite for build tooling

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- PDFKit for PDF generation
- @google/generative-ai for Gemini integration

## 📸 Screenshots

### Home Page

Modern landing page with feature highlights and call-to-action.

### Dashboard

View your stats, take assessments, and generate learning paths.

### Assessment Quiz

Interactive quiz interface with timer and progress tracking.

### Learning Path Visualization

D3.js powered DAG visualization of your personalized learning roadmap.

## 🔒 Environment Variables

| Variable         | Description                                   |
| ---------------- | --------------------------------------------- |
| `MONGO_DB`       | MongoDB connection string                     |
| `GEMINI_API_KEY` | Google Gemini API key                         |
| `JWT_SECRET`     | Secret for JWT tokens (optional, has default) |
| `PORT`           | Server port (default: 5000)                   |

## 📝 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
