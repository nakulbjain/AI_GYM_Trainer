# ⚡ AI Gym Trainer - Real-Time Posture Analytics & Biomechanics Coaching

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-gym-trainer-amber.vercel.app/)
[![Backend Status](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ai-gym-trainer-at66.onrender.com)
[![Python](https://img.shields.io/badge/Python-3.10--3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

An end-to-end, AI-powered computer vision fitness application that monitors exercise form, tracks repetitions, calculates active joint angles and Range of Motion (ROM) in real time, and helps prevent workout injuries using biomechanics analysis and instant voice coaching.

---

## 🚀 Live Deployments

- **Frontend App**: [https://ai-gym-trainer-amber.vercel.app](https://ai-gym-trainer-amber.vercel.app/)
- **Backend API**: [https://ai-gym-trainer-at66.onrender.com](https://ai-gym-trainer-at66.onrender.com)

---

## ✨ Key Features

- 🏋️ **Real-Time Full-Body Skeleton Overlay**: Neon AR skeletal overlay rendered over live webcam feed with joint dots and bone connectors scaled to your body.
- 📐 **Live Joint Angle & ROM Tracking**: Calculates exact joint flexions (elbows, knees, hips, shoulders) and Range of Motion (ROM %) frame-by-frame.
- 🚫 **Posture Verification & Rep Locking**: Category-based posture detection ensures you only get credited for reps executed with proper form.
- 🗣️ **Intelligent Voice Coaching**: Throttled speech synthesizer provides actionable form corrections, set completion alerts, and hydration reminders.
- 📊 **Interactive Dashboard & Readiness Analytics**: Tracks daily nutrition, water intake, workout streaks, fatigue levels, and joint stress indicators.
- 📄 **Automated PDF Workout Reports**: Generates detailed PDF summaries of workout performance, accuracy, and biomechanics risk scores.
- 📱 **Responsive Desktop & Full-Screen Layout**: Full-screen AR workout mode tailored for both desktop and mobile webcams.

---

## 🛠️ Architecture & Pipeline

### Real-Time Computer Vision Pipeline
1. **Frontend Frame Capture**: The React application captures webcam frames at ~7.5 FPS via an HTML5 canvas and streams compressed base64 JPEG payloads over a dedicated WebSocket connection (`/ws/track/{userId}`).
2. **Backend Pose Inference**: FastAPI routes incoming frames to a `WorkoutSocketSession`:
   - Base64 payload decoding and NumPy buffer conversion
   - Frame decoding with `opencv-python-headless`
   - BGR → RGB color conversion
   - 33-point body landmark detection via MediaPipe Pose (`mediapipe==0.10.21`, `numpy<2`)
3. **Biomechanics Analysis**:
   - Computes target joint angles (e.g. elbow for Bicep Curl / Tricep Pushdown, knee for Squat, hip for Deadlift)
   - Evaluates posture constraints via `ExerciseVerifier`
   - Tracks rep cycles (UP / DOWN / LOCKED) and ROM % via `MotionProfiler`
   - Monitors physical tremor and rep speed decay via `FatigueTracker`
4. **SVG AR Rendering**: Landmark coordinates are returned as screen-independent percentage values (`0-100%`) and overlaid onto the video stream using reactive SVG paths.

---

## 💻 Local Installation & Setup

### Prerequisites
- Python 3.10 – 3.12 (Python 3.12 recommended for MediaPipe compatibility)
- Node.js 18 or higher
- Git

### 1. Clone Repository
```bash
git clone https://github.com/nakulbjain/AI_GYM_Trainer.git
cd AI_GYM_Trainer
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (cmd/PowerShell):
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8000
```
Backend will be live at: `http://localhost:8000` (Swagger docs at: `http://localhost:8000/docs`)

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables (.env)
# VITE_API_URL=http://localhost:8000
# VITE_WS_URL=ws://localhost:8000

# Run development server
npm run dev
```
Frontend will be live at: `http://localhost:5173`

---

## 📁 Repository Structure

```
AI_GYM_Trainer/
├── backend/
│   ├── ai_logic/
│   │   ├── chatbot.py            # AI fitness assistant response engine
│   │   ├── fatigue.py            # Physical fatigue and tremor estimator
│   │   ├── planner.py            # Custom workout & diet plan generator
│   │   ├── readiness.py          # Daily training readiness score calculator
│   │   ├── report_generator.py   # ReportLab PDF summary generator
│   │   └── socket_manager.py     # Real-time WebSocket frame & pose engine
│   ├── assets/videos/            # Reference exercise demo videos
│   ├── core/
│   │   ├── exercise_verifier.py  # Category-based posture rules & verifiers
│   │   ├── injury_detection.py   # Joint mechanics safety analyzer
│   │   └── pose_detector.py      # MediaPipe pose wrapper
│   ├── exercises/
│   │   ├── exercise_dict.py      # Target angle thresholds and joint mapping
│   │   └── motion_profiler.py    # Angle state machines & rep counters
│   ├── database.py               # SQLite / PostgreSQL session configuration
│   ├── main.py                   # FastAPI REST routes & WebSocket endpoint
│   ├── models.py                 # SQLAlchemy relational ORM models
│   ├── schemas.py                # Pydantic request & response schemas
│   └── requirements.txt          # Production-pinned Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Analytics.jsx         # Performance analytics and charts
│   │   │   ├── ChatAssistant.jsx     # AI workout coach assistant
│   │   │   ├── Dashboard.jsx         # User stats, intake, and workouts
│   │   │   ├── Onboarding.jsx        # Profile setup and goals questionnaire
│   │   │   ├── ProfileView.jsx       # User profile and settings
│   │   │   ├── ProgressPhotos.jsx    # Photo logging and timeline
│   │   │   ├── WorkoutArea.jsx       # Real-time camera, HUD, and SVG AR overlay
│   │   │   └── WorkoutSelection.jsx  # Muscle group & exercise regime selector
│   │   ├── App.jsx                   # Master application router & state
│   │   └── main.jsx                  # React entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
