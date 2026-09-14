# 🌟 CareerSadhana — Full-Stack Application

> **Empowering careers with smart AI-driven tools, automated proctoring, resume optimization, and curated opportunities.**

CareerSadhana is a complete, turnkey full-stack web application featuring an interactive frontend, a RESTful API backend, a built-in relational database, real-time proctored AI interview simulations, Versant communication tests, and a secured administrative control dashboard.

---

## ⚡ Quick Start (1-Click Run)

### Option A: Windows 1-Click Launcher (Recommended)
1. **Double-click `run.bat`** (or right-click `run.ps1` → *Run with PowerShell*).
2. The server will start automatically, initialize the database, seed sample data, and open `http://localhost:5000` in your default browser.

### Option B: Command Line (Python)
```bash
# 1. Install dependencies (Flask, CORS, Requests)
python -m pip install -r requirements.txt

# 2. Start the full-stack server
python app.py
```
Open **`http://localhost:5000`** in your browser.

### Option C: Node.js (Alternative)
```bash
npm start
```

---

## 🔐 Default Administrator Account

On initial launch, the system automatically initializes the database and creates a pre-configured administrator account:

| Field | Value |
|---|---|
| **Admin Login URL** | [http://localhost:5000/admin-login.html](http://localhost:5000/admin-login.html) |
| **Email** | `admin@careersadhana.com` |
| **Password** | `Admin@12345` |

---

## 🚀 Key Features

### 1. 🤖 AI Mock Interview with Live Proctoring (`/ai-interview.html`)
- **Real-Time Video & Audio Meter**: Visual audio level monitor and camera feed.
- **Anti-Cheat & Proctoring Tracker**: Detects tab switches, focus loss, camera/mic state changes, and logs violation events.
- **Dynamic AI Question Generation**: Contextually tailored to the candidate's chosen track (Technical vs. HR), Job Description, and Resume.
- **Instant Spoken Answer Feedback**: Constructive evaluation and score for each answer.
- **Comprehensive Evaluation Report**: Overall readiness score, communication rating, technical depth rating, strengths, and actionable improvement areas.
- **Dual AI Engine**: Seamlessly connects to **Anthropic Claude API** when an API key is provided, or uses the built-in intelligent contextual offline AI engine if no key is supplied.

### 2. 🛡️ Secured Admin Dashboard (`/admin.html`)
- **Overview Metrics**: Total registered users, completed interviews, and system activity.
- **User Management**: View candidate profiles, join dates, and login frequencies.
- **Security & Login Audit History**: Timestamped logs of every login attempt with IP address, browser user-agent, and status.
- **Interview Inspector**: Deep-dive into any candidate's full session transcript, Q&A answers, AI feedback, and proctoring violation timeline.
- **Job Management (CRUD)**: Create, edit, and delete Government & Private job postings stored in the database.

### 3. 📄 ATS Resume Analyzer (`/ats.html`)
- Match resume keyword alignment against real job descriptions.
- Receive compatibility scores, missing keyword alerts, and layout formatting recommendations.

### 4. 🎙️ Versant Communication Test (`/versant.html`)
- Complete practice tool for English communication assessments (Reading, Repeats, Questions, Sentence Builds, Story Retellings, and Open Questions).

### 5. 💼 Curated Job Portal (`/jobs.html`)
- Real-time job search with Government and Private sector filtering, deadline trackers, and direct application links.

---

## ⚙️ Environment Configuration (`.env`)

```ini
# Server Port (Default: 5000)
PORT=5000

# Secret key for signing secure session cookies and tokens
JWT_SECRET=careersadhana_jwt_super_secret_key_2026_x89f2a4

# Secret key for bootstrapping additional admin accounts
ADMIN_SETUP_KEY=careersadhana_admin_secret_setup_key_2026

# Database Connection:
# Leave empty for built-in zero-config SQLite (careersadhana.db)
# Or configure PostgreSQL: postgres://user:password@host:5432/dbname
DATABASE_URL=

# Real Anthropic Claude API Key (Optional)
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

---

## 🗄️ Database Architecture

The relational schema includes:
- **`users`**: User profiles, roles (`user`, `admin`), password hashes.
- **`login_history`**: Audit trail of every sign-in attempt with client IP and browser headers.
- **`jobs`**: Job postings (Government & Private) managed by admins.
- **`interview_sessions`**: Candidate interview sessions, track modes, status, and violation tallies.
- **`interview_qa`**: Transcript of questions, candidate answers, and AI feedback.
- **`interview_events`**: Proctoring event stream (camera/mic toggles, tab switches, face tracking).
- **`interview_reports`**: Final evaluations, overall scores, strengths, and weaknesses.

---

## 🧪 Automated Testing

Execute the automated test suite to verify all frontend routes, API endpoints, database operations, and interview flows:

```bash
python test_fullstack.py
```

---

## 📁 Project Structure

```
careersadhana/
├── app.py                 # Full-Stack Python/Flask server & unified API
├── server.js              # Full-Stack Node.js/Express server
├── test_fullstack.py      # Automated test suite
├── requirements.txt       # Python dependencies
├── package.json           # Node configuration & scripts
├── run.bat                # Windows 1-click launcher
├── run.ps1                # PowerShell launcher
├── start.sh               # Linux/macOS launcher
├── .env                   # Local configuration & secrets
├── careersadhana.db       # SQLite database (auto-generated)
├── index.html             # Landing page
├── ats.html               # ATS Score Checker
├── jobs.html              # Job portal
├── versant.html           # Versant communication test
├── ai-interview.html      # Proctored AI interview system
├── admin.html             # Administrative Dashboard
├── admin-login.html       # Admin authentication portal
├── about.html             # About & contact page
├── terms.html             # Terms of service
├── privacy.html           # Privacy policy
├── api/                   # Serverless handlers & database schema
└── static/
    ├── css/               # Styling sheets
    ├── images/            # Brand assets & logos
    └── js/                # Client-side scripts & question banks
```

---

© 2025–2026 **CareerSadhana**. All rights reserved.
