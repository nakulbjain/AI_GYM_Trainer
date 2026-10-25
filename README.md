# ⚡ AI Gym Trainer

> **Real-Time Computer Vision Posture Analytics, Biomechanical Feedback, and Workout Injury Prevention Platform**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10--3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10.21-007FFF?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![OpenCV](https://img.shields.io/badge/OpenCV-Headless-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org)
[![WebSocket](https://img.shields.io/badge/WebSocket-Full_Duplex-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 📌 Overview

### The Problem
Improper exercise execution and biomechanical alignment limit training progression and significantly elevate acute and chronic injury risks—including lumbar spinal shear, patellar tendonitis, and rotator cuff impingement. Traditional personal coaching provides human guidance but can be cost-prohibitive, inaccessible during solo sessions, and lacks continuous frame-by-frame quantitative telemetry.

### The Solution
**AI Gym Trainer** is an autonomous full-stack exercise intelligence platform. By leveraging client-side browser video capture and backend computer vision, the platform processes full-body kinematics in real time. It calculates exact joint angles, Range of Motion (ROM %), rep cadences, and anatomical planar deviations, delivering instant visual cues and voice coaching without requiring dedicated wearable sensors or specialized depth cameras.

### System Pipeline
```
Webcam Capture (Client)
  │
  ▼
React Video Element & Hidden HTML5 Canvas
  │
  ▼ (~7.5 FPS Base64 JPEG Stream)
WebSocket Connection (/ws/track/{userId})
  │
  ▼
FastAPI Gateway & Asynchronous Session Manager
  │
  ▼
OpenCV Decoding (NumPy Buffer) ──▶ MediaPipe Pose (33 3D Landmarks)
  │
  ▼
Biomechanical Motion Profiler (Joint Flexion, ROM %, Stage Machine, Fatigue Estimator)
  │
  ▼
WebSocket JSON Telemetry Response
  │
  ▼
React Live HUD Telemetry & Synchronized AR SVG Skeleton
  │
  ▼
SQLAlchemy Relational Database ──▶ Analytics Dashboard & Automated PDF Reports
```

---

## ✨ Key Features

### 1. Real-Time Pose Tracking & AR Visualization
- **Webcam-Native Vision:** Operates directly inside modern browsers via standard WebRTC `navigator.mediaDevices.getUserMedia`.
- **33 Cartesian Landmarks:** Tracks anatomical keypoints (head, shoulders, elbows, wrists, hips, knees, ankles) across 3D coordinates.
- **Synchronized SVG Skeleton:** Mirrors the athlete's camera feed (`scale-x-[-1]`) with an overlay of reactive SVG vector bones and joints aligned using percentage coordinates.

### 2. Biomechanical Movement Analysis
- **Dynamic Joint Angles:** Calculates exact interior angles across focal joints (elbow flexion for bicep curls/tricep extensions, knee angles for squats/leg presses, hip hinge for deadlifts).
- **Stage Detection & Rep Counting:** Finite-state movement machines track exercise phases (`UP`, `DOWN`, `LOCKED`), ensuring reps are credited only when valid range of motion thresholds are met.
- **Form Verification:** Detects planar cheats, compensatory movement, and invalid positions, applying real-time posture error warnings.
- **Tremor & Fatigue Index:** Estimates physical muscle fatigue based on velocity degradation and joint tremor frequency.

### 3. Live AI Workout HUD
- **Real-Time Telemetry Bar:** Displays real-time metrics including live rep counter, current movement stage, instant ROM %, form accuracy score, and active joint angles.
- **Auditory Coach:** Synthesized voice feedback announces rep completions, posture warnings, rest period reminders, and hydration intervals.
- **Custom Rest Inter-Set Timers:** Configurable rest countdowns automatically triggered after each completed set.

### 4. Comprehensive Workout Library
- **6 Primary Muscle Groups:** Multi-exercise protocols across **Chest**, **Back**, **Shoulders**, **Arms & Forearms**, **Core**, and **Legs**.
- **Biomechanical Metadata:** Outlines target joint pivots, base posture (standing, seated, floor, hanging, bent-over), and ROM tolerances for every exercise.

### 5. Athlete Performance Dashboard
- **Nutritional Strategy:** Macro and calorie monitoring aligned with body metrics and fitness goals.
- **Daily Intake Tracking:** Fast one-tap quick-add logging for water (+250ml), protein (+15g), and calories (+100 kcal).
- **Kinetic Readiness Audit:** Multi-factor fatigue questionnaire evaluating nocturnal rest, DOMS muscle soreness, and neural drive to recommend training intensity.
- **Weekly Workout Splits:** Automated multi-day routines customized based on user goal, availability, and joint clearance.

### 6. Performance Analytics & PDF Export
- **Longitudinal Trend Charts:** Interactive Recharts visualizing strength endurance, volume, workout duration, and form accuracy over time.
- **ReportLab PDF Generator:** Instant binary export (`/api/workout/report/{userId}/{sessionId}`) generating downloadable workout diagnostic sheets.

### 7. Morphological Progress Photos
- **Dual-Slot Comparison:** Side-by-side photo comparison (baseline vs. current).
- **Orthogonal Alignment Grid:** 12-cell inspection grid for observing physical posture, symmetry, and postural changes.

### 8. Athlete Profile & Biometrics
- Calculates BMI index, estimated body fat percentage, target water volume, daily protein goals, and projected timeline weeks.

### 9. AI Kinematic Consultant
- Specialized chat interface for clarifying exercise substitutions, injury adjustments, and macronutrient calculations.

---

## 🎨 Design System & Interface

The application interface is styled with a tactical, high-performance athletic visual system:

- **Palette:** Ultra-dark base background (`#050505`), card containers (`#101012`), and high-contrast electric lime accents (`#B7F52A`).
- **Safety Accents:** Warning gold (`#FFB020`) and danger/posture fault crimson (`#FF4D4F`).
- **Typography:** **Chivo** for display headings, session numbers, and telemetry metrics; **Manrope** for legible data labels, forms, and instructions.
- **HUD Geometry:** Technical cards with sharp borders (`4px`–`8px`), dark semi-translucent scrims, and backdrop blurs.
- **Viewport Fluidity:** Reflows across mobile (375px), tablet (768px), laptop (1024px), and desktop (1440px) with responsive navigation rails and camera layouts.

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 19.2, Vite 8.1 | Single-page reactive application framework and build system |
| **Styling** | Tailwind CSS 3.4, Vanilla CSS | Utility styling, tactical color tokens, and layout animations |
| **Data Viz** | Recharts 3.9 | Interactive biomechanics telemetry charts |
| **Icons** | Lucide React | Tactical UI symbols and badges |
| **Backend API** | FastAPI 0.109, Uvicorn | High-throughput async REST API and WebSocket server |
| **WebSockets** | WebSockets (Python standard ASGI) | Full-duplex frame streaming and telemetry messaging |
| **Computer Vision** | MediaPipe Pose 0.10.21, OpenCV Headless | 33-point body landmark detection and image manipulation |
| **Numeric Computing**| NumPy (<2.0) | Multi-dimensional matrix and coordinate trigonometric operations |
| **Database** | SQLAlchemy, SQLite | Relational ORM models, daily intake logs, and workout history |
| **Reports** | ReportLab | Programmatic vector PDF summary generation |

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Browser (React 19 + Vite)"]
        A[User Webcam Stream] --> B[HTML5 Video Element]
        B --> C[Hidden Canvas Frame Capture]
        C -->|Base64 JPEG @ ~7.5 FPS| D[WebSocket Client]
        M[Live Workout HUD] <---|JSON Biometric Telemetry| D
        N[Reactive SVG Skeleton Overlay] <---|33 Landmark Coordinates| D
    end

    subgraph Server ["Backend Server (FastAPI + Python 3.12)"]
        D <--->|ws:// / wss://| E[ASGI WebSocket Endpoint: /ws/track/{userId}]
        E --> F[WorkoutSocketSession Manager]
        F --> G[OpenCV Buffer Decoder]
        G --> H[MediaPipe Pose Estimator]
        H -->|33 Body Landmarks| I[Core Biomechanics Engine]
        
        subgraph Logic ["Analysis Engines"]
            I --> J[ExerciseVerifier: Posture Rules]
            I --> K[MotionProfiler: Angles & Rep State]
            I --> L[FatigueTracker: Tremor & Speed]
        end

        J & K & L -->|State, Reps, ROM%, Warnings| E
    end

    subgraph Data ["Data & Storage Layer"]
        O[FastAPI REST Router] --> P[(SQLAlchemy SQLite DB)]
        P --> Q[Daily Intake & Metrics]
        P --> R[Workout History Records]
        R --> S[ReportLab PDF Engine]
        S -->|Downloadable Binary| T[Workout PDF Report]
    end
```

---

## 📂 Repository Structure

```
AI_GYM_Trainer/
├── backend/
│   ├── ai_logic/
│   │   ├── chatbot.py            # AI fitness conversational assistant logic
│   │   ├── fatigue.py            # Micro-tremor and repetition velocity tracker
│   │   ├── planner.py            # Adaptive workout split & diet schedule generator
│   │   ├── readiness.py          # CNS & physical readiness score calculator
│   │   ├── report_generator.py   # ReportLab programmatic PDF workout generator
│   │   └── socket_manager.py     # Asynchronous WebSocket session & MediaPipe pipe
│   ├── core/
│   │   ├── exercise_verifier.py  # Geometric rules verifying category posture
│   │   ├── injury_detection.py   # Joint shear & mechanical risk analyzer
│   │   └── pose_detector.py      # MediaPipe solutions pose detection wrapper
│   ├── exercises/
│   │   ├── exercise_dict.py      # Exercise configuration, joints, and angles
│   │   └── motion_profiler.py    # Angle calculation and UP/DOWN state machine
│   ├── database.py               # SQLAlchemy database session & engine init
│   ├── main.py                   # FastAPI application routes & WS endpoint
│   ├── models.py                 # SQLAlchemy relational schema models
│   ├── schemas.py                # Pydantic validation request/response schemas
│   └── requirements.txt          # Production Python dependencies
├── frontend/
│   ├── public/                   # Static icons and vector favicon assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Analytics.jsx         # Performance charts & history reports
│   │   │   ├── ChatAssistant.jsx     # AI posture & kinematics chat assistant
│   │   │   ├── Dashboard.jsx         # Athlete stats, splits, and quick logs
│   │   │   ├── Onboarding.jsx        # Authentication and 4-step biometric setup
│   │   │   ├── ProfileView.jsx       # Athlete dossier, body metrics, and readiness
│   │   │   ├── ProgressPhotos.jsx    # Photo timeline and comparison canvas
│   │   │   ├── WorkoutArea.jsx       # Camera HUD, WebSocket loop, and SVG overlay
│   │   │   └── WorkoutSelection.jsx  # Protocol catalog and muscle filter
│   │   ├── App.jsx                   # Master state container & tactical shell
│   │   ├── index.css                 # Custom tactical utility classes & variables
│   │   └── main.jsx                  # React application DOM entry point
│   ├── index.html                    # HTML entry point with Chivo/Manrope fonts
│   ├── package.json                  # Node.js dependencies and scripts
│   ├── tailwind.config.js            # Design system tokens and styling rules
│   └── vite.config.js                # Vite build and plugin configuration
├── .gitignore
└── README.md
```

---

## 🔬 How Real-Time Pose Tracking Works

1. **Camera Feed Acquisition:** When tracking begins, `navigator.mediaDevices.getUserMedia` acquires a 640×480 video stream at optimal frame rates.
2. **Synchronized Video Confirmation:** Frame grabbing initializes only after confirming that the video element has satisfied `HTMLMediaElement.HAVE_CURRENT_DATA` (`readyState >= 2`) with non-zero dimensions.
3. **Canvas Frame Serialization:** A background canvas draws the current frame and compresses it into a lightweight base64 JPEG (`image/jpeg` at 50% quality).
4. **WebSocket Transmission:** Frames are dispatched over a single persistent WebSocket connection at approximately **7.5 FPS**. WebSockets eliminate HTTP connection overhead, enabling sub-second bidirectional streaming.
5. **OpenCV & MediaPipe Inference:** The FastAPI backend decodes the incoming frame using OpenCV (`imdecode`) and processes it through MediaPipe Pose:
   - Evaluates 33 body landmarks in normalized $[0.0, 1.0]$ coordinates and calculates spatial $Z$-depth.
6. **Biomechanical Calculation:**
   - Vector trigonometry computes interior planar angles:
     $$\theta = \arccos\left(\frac{\vec{BA} \cdot \vec{BC}}{\|\vec{BA}\| \|\vec{BC}\|}\right)$$
   - Evaluates whether the angle crosses the exercise's predefined inflection thresholds (`UP` threshold vs `DOWN` threshold).
   - Verifies torso tilt and lateral deviation to prevent cheating or excessive strain.
7. **Telemetry Dispatch:** The server sends back a JSON packet with `landmarks`, `reps`, `stage`, `active_angle`, `rom_pct`, `form_accuracy`, and any active `warning`.
8. **Reactive SVG Overlay:** The frontend updates state variables and dynamically plots an SVG skeleton directly on top of the mirrored video, rendering lime bone lines and white joint nodes aligned with the user's body.

---

## 📡 API Reference

### REST Endpoints

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Create a new athlete account |
| `POST` | `/api/login` | Authenticate using email/phone and password |
| `POST` | `/api/profile` | Save onboarding biometric data and training goals |
| `GET` | `/api/profile/{user_id}` | Retrieve complete user profile and calculated metrics |
| `GET` | `/api/dashboard/{user_id}` | Fetch daily dashboard data, workout split, and meal schedule |
| `POST` | `/api/intake/{user_id}` | Log water, protein, or calorie consumption |
| `POST` | `/api/readiness/{user_id}` | Submit daily recovery check and compute readiness score |
| `GET` | `/api/workout/exercises` | Retrieve all supported exercises organized by muscle group |
| `POST` | `/api/workout/start_local/{user_id}` | Initialize a local tracking session |
| `POST` | `/api/workout/finish/{user_id}` | Submit completed workout telemetry and save history |
| `GET` | `/api/workout/history/{user_id}` | Retrieve list of completed workout sessions |
| `GET` | `/api/workout/analytics/{user_id}` | Fetch aggregated performance data for charting |
| `GET` | `/api/workout/report/{user_id}/{session_id}` | Download a structured PDF summary report |
| `POST` | `/api/chat` | Send a query to the AI exercise and nutrition assistant |
| `POST` | `/api/photos/upload/{user_id}` | Upload a progress photo (multipart/form-data) |
| `GET` | `/api/photos/{user_id}` | Retrieve all progress photos for an athlete |
| `DELETE` | `/api/photos/{photo_id}` | Delete a progress photo |

### WebSocket Protocol

- **Endpoint:** `/ws/track/{userId}`
- **Initial Configuration Message:**
  ```json
  { "event": "config", "exercise": "bicep_curl" }
  ```
- **Frame Stream Dispatches:**
  ```json
  { "event": "frame", "image": "data:image/jpeg;base64,...", "exercise": "bicep_curl" }
  ```
- **Backend Telemetry Payloads:**
  ```json
  {
    "verified": true,
    "landmarks": [ { "id": 11, "x": 48.2, "y": 32.1, "z": -0.15 } ],
    "reps": 8,
    "stage": "UP",
    "active_angle": 52,
    "rom_pct": 96,
    "form_accuracy": 98,
    "warning": ""
  }
  ```

---

## 🚀 Local Development Setup

### Prerequisites
- **Python:** Version 3.10 to 3.12 (*Python 3.12 is recommended for optimal MediaPipe binary support*)
- **Node.js:** Version 18.0 or higher
- **Git**

### 1. Clone the Repository
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
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
*Backend is accessible at `http://127.0.0.1:8000` (Interactive Swagger documentation available at `http://127.0.0.1:8000/docs`).*

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
*Frontend is accessible at `http://localhost:5173`.*

---

## ⚙️ Environment Variables

### Frontend Configuration (`frontend/.env`)
```ini
# Base URL for the FastAPI REST API
VITE_API_URL=http://localhost:8000

# Base URL for the WebSocket telemetry pipeline
VITE_WS_URL=ws://localhost:8000
```

### Production Examples
```ini
VITE_API_URL=https://ai-gym-trainer-at66.onrender.com
VITE_WS_URL=wss://ai-gym-trainer-at66.onrender.com
```

---

## 🌐 Production Deployments

The application is deployed across cloud environments:

- **Frontend:** Deployed on **Vercel** ([https://ai-gym-trainer-amber.vercel.app](https://ai-gym-trainer-amber.vercel.app/))
- **Backend:** Deployed on **Render** as a web service running Python with Uvicorn ([https://ai-gym-trainer-at66.onrender.com](https://ai-gym-trainer-at66.onrender.com))

*Note: In production environments, client connections to the backend use secure protocols (`https://` for REST requests and `wss://` for WebSocket data streams).*

---

## 📊 Evaluation & Empirical Results

Evaluated across internal testing datasets and experimental movement trials:

- **Form Accuracy Assessment:** Achieved approximately **94% average posture classification accuracy** across standard bilateral compound and isolation lifts.
- **Inference Throughput:** Realized consistent processing speeds of approximately **25 FPS** during backend landmark calculation.
- **End-to-End Latency:** Round-trip transmission from camera frame capture to AR overlay feedback measured under **1 second** over broadband connections.

*(Note: Stated metrics represent internal testing results under uniform lighting and optimal webcam framing; individual performance may vary based on client hardware and network latency).*

---

## 📄 Academic Research & Publication

This platform is based on the research presented in the following publication:

> **"AI-Based Real-Time Body Posture Correction and Injury Risk Detection System"**  
> *International Research Journal of Engineering and Technology (IRJET)*  
> Volume 13, Issue 10, October 2026.

---

## 📸 Interface Preview

<!-- Placeholders for application screenshots -->
| Screen | Preview |
| :--- | :--- |
| **Athletic Dashboard** | *(Screenshot placeholder: High-contrast athletic dashboard featuring calorie targets, readiness metrics, and splits)* |
| **Workout Library** | *(Screenshot placeholder: Tactical catalog cards with target angles and movement classifications)* |
| **Live AI Posture Detection** | *(Screenshot placeholder: Mirrored webcam stream showing real-time SVG skeletal overlay and HUD telemetry bar)* |
| **Performance Analytics** | *(Screenshot placeholder: Recharts data visualization tracking volume, accuracy, and PDF downloads)* |
| **Mobile Interface** | *(Screenshot placeholder: Compact mobile layout reflowed at 375px with bottom navigation)* |

---

## 🔒 Security & Privacy

- **On-Demand Optical Ingestion:** Webcam frames are streamed exclusively during an active exercise session and processed in memory for immediate pose estimation; raw camera video is not permanently stored.
- **Transport Security:** Production configurations enforce TLS encryption over HTTPS and WSS connections.
- **Client Decoupling:** Environment-specific endpoints are cleanly managed through `VITE_API_URL` and `VITE_WS_URL`.

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **Multi-Camera 3D Triangulation:** Multi-angle tracking for enhanced transverse plane rotational detection.
- [ ] **Barbell Trajectory Tracing:** Barbell bar path vector tracking for Olympic weightlifting.
- [ ] **Edge ML Inference:** In-browser WebAssembly/WebGPU MediaPipe execution to eliminate frame streaming network latency.
- [ ] **Wearable Health Sync:** Integration with Apple Health and Google Health Connect for recovery synchronization.

---

## 🤝 Contributing

Contributions to improve kinematics algorithms, add exercise configurations, or enhance interface usability are welcome:

1. Fork the repository.
2. Create a dedicated feature branch (`git checkout -b feature/biomechanics-update`).
3. Commit verified code changes (`git commit -m 'feat: add romanian deadlift lumbar curve threshold'`).
4. Push to your branch (`git push origin feature/biomechanics-update`).
5. Open a Pull Request.

---

## 👥 Authors & Acknowledgments

- **Lead Developer & Researcher:** Nakul B Jain ([@nakulbjain](https://github.com/nakulbjain))
- Dedicated to advancing accessible, computer vision-driven physical rehabilitation and safe strength training.

---

## 📜 License

This project is currently distributed as an open portfolio and research repository. Please review with the author prior to commercial redistribution.
