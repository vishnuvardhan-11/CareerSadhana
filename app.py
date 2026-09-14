#!/usr/bin/env python3
"""
CareerSadhana — Full-Stack Application Server
Frontend (Static HTML/CSS/JS) + Unified Backend API + SQLite / PostgreSQL Database
"""

import os
import sys
import json
import time
import uuid
import hmac
import hashlib
import base64
import sqlite3
import datetime
from pathlib import Path
from urllib.parse import urlparse
from functools import wraps

from flask import (
    Flask, request, jsonify, make_response,
    send_from_directory, send_file, abort
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import requests

# Load environment variables from .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DB_PATH = BASE_DIR / "careersadhana.db"

app = Flask(__name__, static_folder=str(STATIC_DIR), static_url_path="/static")
app.config["SECRET_KEY"] = os.getenv("JWT_SECRET", "careersadhana_default_secret_key_2026_x89a")
CORS(app, supports_credentials=True)

COOKIE_NAME = "cs_token"
TOKEN_MAX_AGE = 12 * 3600  # 12 hours in seconds
ADMIN_SETUP_KEY = os.getenv("ADMIN_SETUP_KEY", "careersadhana_admin_secret_setup_key_2026")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022").strip()
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

# ─────────────────────────────────────────────────────────────────────────────
# DATABASE UTILITIES
# ─────────────────────────────────────────────────────────────────────────────

def get_db():
    """Connect to SQLite database and configure row factory."""
    conn = sqlite3.connect(str(DB_PATH), timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Initialize database tables and seed initial data if empty."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS login_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        email TEXT NOT NULL,
        role TEXT,
        success INTEGER NOT NULL,
        reason TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_login_history_created ON login_history (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_login_history_email ON login_history (email);

    CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('gov', 'pvt')),
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        deadline TEXT,
        url TEXT,
        tags TEXT DEFAULT '[]',
        created_by INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS interview_sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        email TEXT,
        name TEXT,
        mode TEXT,
        jd_text TEXT,
        resume_text TEXT,
        status TEXT NOT NULL DEFAULT 'in_progress',
        violation_count INTEGER NOT NULL DEFAULT 0,
        ip_address TEXT,
        user_agent TEXT,
        started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON interview_sessions (user_id);

    CREATE TABLE IF NOT EXISTS interview_qa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        q_index INTEGER,
        question TEXT,
        answer TEXT,
        ai_feedback TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_interview_qa_session ON interview_qa (session_id);

    CREATE TABLE IF NOT EXISTS interview_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        detail TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_interview_events_session ON interview_events (session_id);

    CREATE TABLE IF NOT EXISTS interview_reports (
        session_id TEXT PRIMARY KEY,
        overall_score INTEGER,
        summary TEXT,
        strengths TEXT,
        weaknesses TEXT,
        full_report TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS blogs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL DEFAULT 'General',
        excerpt TEXT,
        content TEXT NOT NULL,
        tags TEXT DEFAULT '[]',
        cover_emoji TEXT DEFAULT '📝',
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
        author_name TEXT DEFAULT 'CareerSadhana Team',
        author_id INTEGER,
        views INTEGER NOT NULL DEFAULT 0,
        read_time INTEGER DEFAULT 5,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs (status, published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs (category);
    """)
    conn.commit()

    # Seed Default Admin Account if no users exist
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    if user_count == 0:
        admin_email = "admin@careersadhana.com"
        admin_pass = generate_password_hash("Admin@12345")
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            ("CareerSadhana Administrator", admin_email, admin_pass, "admin")
        )
        print(" -> Seeded default administrator account: admin@careersadhana.com / Admin@12345")

    # Seed Initial Jobs if jobs table is empty
    cursor.execute("SELECT COUNT(*) FROM jobs")
    jobs_count = cursor.fetchone()[0]
    if jobs_count == 0:
        initial_jobs = [
            ("g1", "gov", "Probationary Officer (PO)", "State Bank of India (SBI)", "Pan India", "2026-10-15", "https://sbi.co.in/careers", json.dumps(["Banking", "Full Time", "Graduation Required"])),
            ("g2", "gov", "Assistant Section Officer", "Staff Selection Commission (SSC CGL)", "New Delhi", "2026-11-01", "https://ssc.gov.in", json.dumps(["Govt", "Central", "Group B"])),
            ("g3", "gov", "Junior Engineer (Civil/Electrical)", "Indian Railways (RRB)", "Various Zones", "2026-10-30", "https://rrbcdg.gov.in", json.dumps(["Railways", "Engineering", "Diploma/Degree"])),
            ("p1", "pvt", "Full Stack Developer", "TechCorp Global", "Bengaluru (Hybrid)", "2026-09-30", "https://careers.techcorp.example", json.dumps(["React", "Python", "Node.js", "SQL"])),
            ("p2", "pvt", "Associate Data Analyst", "Insight Solutions", "Hyderabad", "2026-10-10", "https://insights.example/jobs", json.dumps(["SQL", "Python", "PowerBI", "Analytics"])),
            ("p3", "pvt", "Product Specialist & QA", "InnovateCloud Labs", "Pune / Remote", "2026-10-20", "https://innovatecloud.example/careers", json.dumps(["QA", "Automation", "Communication"]))
        ]
        cursor.executemany(
            "INSERT INTO jobs (id, type, title, company, location, deadline, url, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            initial_jobs
        )
        print(" -> Seeded initial job listings into database")

    # Seed Initial Blog Articles if blogs table is empty
    cursor.execute("SELECT COUNT(*) FROM blogs")
    blogs_count = cursor.fetchone()[0]
    if blogs_count == 0:
        import datetime as _dt
        now_str = _dt.datetime.utcnow().isoformat()
        seed_blogs = [
            ("blog-001", "Top 10 AI Tools Every Job Seeker Must Know in 2026", "top-10-ai-tools-job-seeker-2026",
             "AI & Technology", "AI is transforming how we find jobs, prepare resumes, and ace interviews. Here are 10 must-know AI tools for every modern job seeker.",
             """<p>Artificial Intelligence has completely transformed the job search landscape. Whether you're a fresher or an experienced professional, knowing the right AI tools can give you a competitive edge.</p>

<h3>1. ChatGPT — Your AI Career Coach</h3>
<p>Use ChatGPT to practice mock interviews, refine your resume, draft cover letters, and get answers to technical questions. It's like having a personal career coach available 24/7.</p>

<h3>2. CareerSadhana ATS Checker</h3>
<p>Our built-in ATS Score Checker analyses your resume against any job description, identifies missing keywords, and gives you a compatibility score so your resume gets past automated screening systems.</p>

<h3>3. GitHub Copilot — For Developers</h3>
<p>If you're a developer, GitHub Copilot is your AI pair programmer. It helps you write better code faster, making your development portfolio more impressive to recruiters.</p>

<h3>4. Grammarly — Polish Your Communication</h3>
<p>From emails to resumes to LinkedIn profiles, Grammarly ensures your written communication is clear, professional, and error-free.</p>

<h3>5. LinkedIn AI Features</h3>
<p>LinkedIn now uses AI to suggest job matches, improve your headline, and analyse your profile strength against your target roles.</p>

<h3>6. Canva AI — For Visual Resumes</h3>
<p>Canva's AI-powered design tools help you create visually stunning resumes and portfolios that stand out.</p>

<h3>7. Otter.ai — Transcription & Practice</h3>
<p>Record yourself during mock interviews and let Otter.ai transcribe and summarize your answers so you can identify improvement areas.</p>

<h3>8. CareerSadhana AI Mock Interview</h3>
<p>Our proctored AI Interview system generates contextual questions based on your resume and job description, provides real-time spoken answer feedback, and delivers a comprehensive performance report.</p>

<h3>9. Notion AI — Organize Your Job Search</h3>
<p>Use Notion AI to track applications, summarize company research, and plan your career roadmap intelligently.</p>

<h3>10. Perplexity AI — Research Companies</h3>
<p>Before any interview, use Perplexity AI to research the company, its latest news, culture, and industry position in seconds.</p>

<p><strong>Key Takeaway:</strong> AI tools don't replace hard work — they amplify it. Use them strategically to prepare smarter, apply faster, and interview with confidence.</p>""",
             json.dumps(["AI", "Career", "Tools", "Job Search"]), "🤖", "published", "CareerSadhana Team", 8, now_str),

            ("blog-002", "UPSC, SSC & Banking Exams 2026: Complete Upcoming Hiring Calendar", "upsc-ssc-banking-hiring-calendar-2026",
             "Hiring Drives", "A comprehensive calendar of all major government job notifications, exam dates, and application windows for 2026.",
             """<p>Government jobs remain among the most sought-after opportunities in India. Here is your complete guide to major government recruitment drives in 2026.</p>

<h3>🏛️ UPSC (Union Public Service Commission)</h3>
<ul>
<li><strong>UPSC Civil Services 2026</strong>: Notification expected February 2026. Vacancies: ~1,000+. Eligibility: Any graduate.</li>
<li><strong>UPSC CDS 2026 (I & II)</strong>: For NDA, OTA, and Military Academy recruitment. Notification: January & June 2026.</li>
<li><strong>UPSC CAPF 2026</strong>: Central Armed Police Forces. Notification: May 2026.</li>
</ul>

<h3>📋 SSC (Staff Selection Commission)</h3>
<ul>
<li><strong>SSC CGL 2026</strong>: Combined Graduate Level — recruitment for Group B and C posts across central ministries. Expected: March 2026.</li>
<li><strong>SSC CHSL 2026</strong>: 12th pass exam for DEO, LDC posts. Notification: February 2026.</li>
<li><strong>SSC CPO 2026</strong>: Central Police Organisation recruitment. Expected: April 2026.</li>
<li><strong>SSC MTS 2026</strong>: Multi-Tasking Staff. Expected: June 2026.</li>
</ul>

<h3>🏦 Banking Sector (IBPS, SBI, RBI)</h3>
<ul>
<li><strong>IBPS PO 2026</strong>: Notification: July 2026. ~4,000+ vacancies across 11 public sector banks.</li>
<li><strong>IBPS Clerk 2026</strong>: Notification: September 2026. Entry-level banking positions.</li>
<li><strong>SBI PO 2026</strong>: One of the most prestigious banking exams. Notification expected: March 2026.</li>
<li><strong>RBI Grade B 2026</strong>: Reserve Bank of India Officer Grade B recruitment. Expected: May 2026.</li>
<li><strong>NABARD Grade A & B 2026</strong>: National Bank for Agriculture and Rural Development. Expected: August 2026.</li>
</ul>

<h3>🚂 Railways (RRB)</h3>
<ul>
<li><strong>RRB NTPC 2026</strong>: Non-Technical Popular Categories. Massive recruitment across zones. Expected: Q1 2026.</li>
<li><strong>RRB Group D 2026</strong>: Track Maintainer, Helper posts. Expected: Q2 2026.</li>
<li><strong>RRB JE 2026</strong>: Junior Engineer recruitment. Expected: Q3 2026.</li>
</ul>

<h3>💡 How to Prepare</h3>
<p>Start early, cover core subjects (Reasoning, Quantitative Aptitude, English, General Awareness), practice previous year papers, and use online mock tests. Follow official websites for the most updated notifications.</p>

<p><em>Bookmark this page and check back regularly. We update our Jobs board with the latest government opportunities as soon as they are announced.</em></p>""",
             json.dumps(["UPSC", "SSC", "Banking", "Government Jobs", "Hiring"]), "🏛️", "published", "CareerSadhana Team", 10, now_str),

            ("blog-003", "How to Crack a Technical Interview in 2026: A Complete Roadmap", "crack-technical-interview-2026-roadmap",
             "Career Tips", "From DSA to system design to behavioral rounds — here is a proven step-by-step roadmap to help you crack technical interviews at top tech companies.",
             """<p>Landing a job at a top tech company requires systematic preparation across multiple domains. Here is a complete, battle-tested roadmap.</p>

<h3>Phase 1: Data Structures & Algorithms (Weeks 1–6)</h3>
<p>DSA is the foundation of most technical interviews. Focus on:</p>
<ul>
<li>Arrays, Strings, Two Pointers, Sliding Window</li>
<li>Linked Lists, Stacks, Queues, Monotonic Stack</li>
<li>Binary Search, Recursion, Backtracking</li>
<li>Trees (BFS, DFS), Graphs, Union-Find</li>
<li>Dynamic Programming (Memoization, Tabulation)</li>
<li>Greedy Algorithms, Heap, Trie</li>
</ul>
<p><strong>Practice Platform:</strong> LeetCode (aim for 150+ problems, focus on medium difficulty).</p>

<h3>Phase 2: System Design (Weeks 7–10)</h3>
<p>For mid-senior roles, system design interviews are critical:</p>
<ul>
<li>Understand CAP Theorem, consistency vs availability tradeoffs</li>
<li>Design URL shortener, Twitter feed, WhatsApp, Netflix</li>
<li>Learn about Load Balancers, CDNs, Caching (Redis, Memcached)</li>
<li>Database selection: SQL vs NoSQL, sharding, replication</li>
<li>Message queues: Kafka, RabbitMQ</li>
</ul>

<h3>Phase 3: Core Computer Science (Weeks 11–12)</h3>
<ul>
<li>Operating Systems: processes, threads, deadlocks, memory management</li>
<li>Computer Networks: TCP/IP, HTTP/HTTPS, REST vs GraphQL</li>
<li>DBMS: ACID properties, indexing, query optimization, transactions</li>
<li>OOP Principles: SOLID, Design Patterns</li>
</ul>

<h3>Phase 4: Behavioral & HR Rounds</h3>
<p>Technical skills get you in the door; behavioral skills close the offer:</p>
<ul>
<li>Use the <strong>STAR Method</strong>: Situation, Task, Action, Result</li>
<li>Prepare 5-6 strong stories about teamwork, conflict resolution, ownership, and failure</li>
<li>Research the company's mission, recent news, culture, and products</li>
<li>Ask insightful questions — show you're evaluating them too</li>
</ul>

<h3>Phase 5: Mock Interviews</h3>
<p>Use CareerSadhana's AI Mock Interview system to practice full proctored sessions with real-time feedback. Record yourself, review your answers, and iterate. The proctoring system also helps you build the discipline needed for real video interviews.</p>

<h3>Key Tips</h3>
<ul>
<li>Consistency > Intensity: 2 hours daily beats 12-hour binges</li>
<li>Explain your thinking out loud — interviewers value the process</li>
<li>Don't optimize prematurely — get a working solution first</li>
<li>Ask clarifying questions before coding</li>
</ul>

<p><strong>Remember:</strong> Every rejection is data, not defeat. Learn, adjust, and keep going.</p>""",
             json.dumps(["Interview", "DSA", "System Design", "Career", "Technical"]), "💻", "published", "CareerSadhana Team", 12, now_str),

            ("blog-004", "AI & Machine Learning Jobs Are Booming: Top Roles and Skills for 2026", "ai-ml-jobs-skills-2026",
             "AI & Technology", "The AI industry is experiencing unprecedented growth. Discover the highest-paying AI/ML roles, in-demand skills, and how to break in.",
             """<p>Artificial Intelligence is not just a buzzword — it is reshaping every industry and creating millions of high-value jobs globally. Here's what you need to know to position yourself for success.</p>

<h3>🔥 Hottest AI/ML Roles in 2026</h3>

<p><strong>1. Machine Learning Engineer</strong><br/>
Average Salary: ₹18–45 LPA | Companies: Google, Microsoft, Flipkart, Razorpay<br/>
Skills: Python, TensorFlow/PyTorch, MLOps, Kubernetes, Feature Engineering</p>

<p><strong>2. Data Scientist</strong><br/>
Average Salary: ₹12–35 LPA | Companies: Amazon, KPMG, McKinsey, startups<br/>
Skills: Statistics, Python/R, SQL, Spark, Data Visualization, NLP</p>

<p><strong>3. AI Product Manager</strong><br/>
Average Salary: ₹20–60 LPA | Companies: Meta, Uber, Zomato<br/>
Skills: Product sense, SQL, ML fundamentals, user research, A/B testing</p>

<p><strong>4. Prompt Engineer</strong><br/>
Average Salary: ₹10–25 LPA | Emerging role at LLM companies<br/>
Skills: NLP understanding, LLM APIs (OpenAI, Anthropic, Gemini), chain-of-thought prompting</p>

<p><strong>5. MLOps Engineer</strong><br/>
Average Salary: ₹15–40 LPA | Companies: Nvidia, DataBricks, platform teams<br/>
Skills: CI/CD for ML, Docker, Kubernetes, monitoring, model deployment</p>

<h3>📚 Must-Have Skills for AI/ML Careers</h3>
<ul>
<li><strong>Programming:</strong> Python (pandas, numpy, scikit-learn, PyTorch/TensorFlow)</li>
<li><strong>Mathematics:</strong> Linear Algebra, Calculus, Probability, Statistics</li>
<li><strong>Machine Learning:</strong> Supervised, Unsupervised, Reinforcement Learning</li>
<li><strong>Deep Learning:</strong> CNNs, RNNs, Transformers, LLMs</li>
<li><strong>Data Engineering:</strong> SQL, Spark, Airflow, BigQuery</li>
<li><strong>Cloud Platforms:</strong> AWS SageMaker, GCP Vertex AI, Azure ML</li>
<li><strong>Gen AI:</strong> RAG, Fine-tuning, LangChain, Vector Databases</li>
</ul>

<h3>🛤️ Learning Roadmap</h3>
<p>Month 1–2: Master Python + Statistics + Core ML algorithms<br/>
Month 3–4: Deep Learning with PyTorch + Projects on Kaggle<br/>
Month 5–6: Build 2–3 end-to-end projects + Deploy on cloud<br/>
Month 7+: Apply for roles + Mock interviews + Contribution to open-source</p>

<h3>Where to Find AI/ML Jobs</h3>
<p>Check our Jobs section for the latest AI/ML openings. Also explore LinkedIn, AngelList, Naukri, IIMJobs, and company career pages directly.</p>""",
             json.dumps(["AI", "Machine Learning", "Jobs", "Skills", "Data Science"]), "🧠", "published", "CareerSadhana Team", 9, now_str),

            ("blog-005", "Versant English Test: Full Guide, Pattern, and Preparation Tips", "versant-english-test-guide-2026",
             "Career Tips", "Everything you need to know about the Versant English Communication Test — structure, scoring, and proven preparation strategies.",
             """<p>The Versant English Communication Test is used by major banks (SBI, Axis, HDFC), BPOs, and multinational companies to assess English proficiency. Here is your complete preparation guide.</p>

<h3>📋 Versant Test Structure (6 Parts)</h3>

<p><strong>Part A — Reading (45 sentences)</strong><br/>
You read sentences aloud. Tests pronunciation, fluency, and reading speed. Each sentence appears for 10 seconds.<br/>
<em>Tip:</em> Read clearly and at a natural pace. Don't rush. Enunciate consonants clearly.</p>

<p><strong>Part B — Repeats (15 sentences)</strong><br/>
A sentence is spoken to you — you must repeat it exactly, word for word.<br/>
<em>Tip:</em> Listen carefully to the full sentence before repeating. Focus on accuracy over speed.</p>

<p><strong>Part C — Questions (30 questions)</strong><br/>
Answer short everyday questions (e.g., "What did you do last weekend?"). Answers should be 1–2 complete sentences.<br/>
<em>Tip:</em> Speak naturally and answer in complete sentences. Avoid one-word answers.</p>

<p><strong>Part D — Sentence Builds (16 items)</strong><br/>
Words are read to you; construct a grammatically correct sentence using all of them.<br/>
<em>Tip:</em> Note the subject and verb first, then arrange modifiers logically.</p>

<p><strong>Part E — Story Retellings (3 stories)</strong><br/>
Listen to a short story and retell it in your own words.<br/>
<em>Tip:</em> Focus on the sequence of events. Use connectors: first, then, after that, finally.</p>

<p><strong>Part F — Open Questions (2 questions)</strong><br/>
Answer open-ended opinion questions in 30–45 seconds.<br/>
<em>Tip:</em> State your opinion, give 2 reasons, and end with a strong conclusion.</p>

<h3>📊 Versant Scoring</h3>
<p>Scores range from 20 to 80. Most companies require a minimum of 55–60 for selection. The test measures Pronunciation, Pace, Vocabulary, Fluency, Listening, and Structure.</p>

<h3>🎯 Preparation Strategy</h3>
<ol>
<li>Practice reading English newspapers aloud for 15 minutes daily</li>
<li>Record yourself speaking and listen back for pronunciation errors</li>
<li>Watch English news channels and repeat short segments</li>
<li>Use our CareerSadhana Versant Practice Test to simulate all 6 parts</li>
<li>Expand vocabulary using context, not rote memorization</li>
<li>Practice staying calm — the test is timed and pressure can trip you up</li>
</ol>

<h3>Common Mistakes to Avoid</h3>
<ul>
<li>Speaking too fast or too slow — aim for a natural conversational pace</li>
<li>Mumbling or swallowing word endings — project clearly</li>
<li>Using mother tongue filler sounds — replace with "well," "actually," or pause naturally</li>
<li>Not answering in complete sentences in Part C</li>
</ul>

<p>Use our Versant Practice Tool available at <a href="versant.html">versant.html</a> to practice all 6 parts with timer simulation and instant scoring.</p>""",
             json.dumps(["Versant", "English", "Communication", "Exam Prep", "Banking"]), "🎙️", "published", "CareerSadhana Team", 7, now_str),
        ]

        for b in seed_blogs:
            bid, title, slug, category, excerpt, content, tags, emoji, status, author, read_time, pub_at = b
            cursor.execute(
                """INSERT OR IGNORE INTO blogs
                   (id, title, slug, category, excerpt, content, tags, cover_emoji, status, author_name, read_time, published_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (bid, title, slug, category, excerpt, content, tags, emoji, status, author, read_time, pub_at)
            )
        print(" -> Seeded 5 initial blog articles into database")

    conn.commit()
    conn.close()

# ─────────────────────────────────────────────────────────────────────────────
# AUTHENTICATION & TOKEN HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def get_secret_key():
    return app.config["SECRET_KEY"].encode("utf-8")


def generate_session_token(payload):
    """Generate a tamper-proof HMAC-signed session token with expiration."""
    exp = int(time.time()) + TOKEN_MAX_AGE
    data = {**payload, "exp": exp}
    data_json = json.dumps(data, separators=(",", ":"), sort_keys=True)
    b64_payload = base64.urlsafe_b64encode(data_json.encode("utf-8")).decode("utf-8").rstrip("=")
    sig = hmac.new(get_secret_key(), b64_payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{b64_payload}.{sig}"


def verify_session_token(token):
    """Verify session token signature and expiration."""
    if not token or "." not in token:
        return None
    try:
        b64_payload, sig = token.split(".", 1)
        expected_sig = hmac.new(get_secret_key(), b64_payload.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        
        rem = len(b64_payload) % 4
        padded = b64_payload + ("=" * (4 - rem) if rem else "")
        data_json = base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8")
        data = json.loads(data_json)

        if data.get("exp", 0) < int(time.time()):
            return None
        return data
    except Exception:
        return None


def get_current_user():
    """Extract authenticated user from cookie or Authorization header."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
    if not token:
        return None
    return verify_session_token(token)


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required. Please sign in."}), 401
        request.user = user
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required. Please sign in."}), 401
        if user.get("role") != "admin":
            return jsonify({"error": "Administrator access required."}), 403
        request.user = user
        return f(*args, **kwargs)
    return decorated


def get_client_ip():
    fwd = request.headers.get("X-Forwarded-For")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.remote_addr or "127.0.0.1"


def log_login_attempt(user_id, email, role, success, reason):
    """Record login audit event into database."""
    try:
        conn = get_db()
        conn.execute(
            """INSERT INTO login_history (user_id, email, role, success, reason, ip_address, user_agent)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (user_id, email, role, 1 if success else 0, reason, get_client_ip(), request.headers.get("User-Agent", ""))
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging login attempt: {e}")

# ─────────────────────────────────────────────────────────────────────────────
# ANTHROPIC & SMART AI ENGINE
# ─────────────────────────────────────────────────────────────────────────────

def call_claude_api(system_prompt, user_content, max_tokens=1000):
    """Call Claude API if ANTHROPIC_API_KEY is configured."""
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not configured.")
    
    headers = {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
    }
    body = {
        "model": ANTHROPIC_MODEL,
        "max_tokens": max_tokens,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_content}]
    }
    resp = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=body, timeout=25)
    if not resp.ok:
        raise RuntimeError(f"Anthropic API error {resp.status_code}: {resp.text}")
    data = resp.json()
    for block in data.get("content", []):
        if block.get("type") == "text":
            return block.get("text", "")
    return ""


def generate_smart_question(mode, jd_text, resume_text, history, q_index, total_questions):
    """Smart question generator using Claude API or contextual local logic."""
    if ANTHROPIC_API_KEY:
        try:
            system = (
                f"You are an experienced { 'HR' if mode == 'hr' else 'Technical' } interviewer conducting a live mock interview. "
                "Ask exactly one focused, professional interview question at a time. "
                "Use the candidate's job description and resume to make it relevant. "
                "Do not repeat topics already covered in the conversation history. "
                f"Progress the difficulty logically (question {q_index + 1} of {total_questions}). "
                "Respond ONLY with valid JSON in this format: {\"question\": \"...\", \"hint\": \"1 short tip\"}."
            )
            history_text = "\n\n".join([f"Q{i+1}: {h.get('question')}\nA{i+1}: {h.get('answer', '(no answer)')}" for i, h in enumerate(history)]) if history else "(None yet - first question)"
            user_msg = f"Job Description:\n{jd_text or '(General position)'}\n\nResume Summary:\n{resume_text or '(Not provided)'}\n\nHistory:\n{history_text}\n\nGenerate question {q_index + 1} of {total_questions}:"
            
            raw = call_claude_api(system, user_msg, max_tokens=300)
            cleaned = raw.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(cleaned)
            return parsed.get("question"), parsed.get("hint", "")
        except Exception as e:
            print(f"Anthropic API fallback: {e}")

    # Built-in High Quality Contextual Question Generator
    tech_pool = [
        ("Could you walk me through the architecture of the most challenging software project you've built, and what key design tradeoffs you made?", "Focus on system design, scalability, and specific technologies used."),
        ("How do you approach debugging complex issues in a production environment under time pressure?", "Describe your structured methodology and diagnostic tools."),
        ("What is your experience with RESTful APIs, database optimization, and handling asynchronous data flows?", "Provide concrete examples from your past projects."),
        ("Can you explain how you ensure code maintainability, testing, and continuous integration in your development lifecycle?", "Mention automated testing, code reviews, and CI/CD pipelines."),
        ("How do you handle security best practices, input validation, and user authentication in full-stack applications?", "Highlight OWASP principles, JWT/cookie security, and hashing algorithms."),
        ("Tell me about a time you had to learn and adopt a new framework or technology rapidly to deliver a feature.", "Emphasize agility, documentation study, and practical application."),
        ("How do you optimize frontend rendering performance and minimize API latency under high load?", "Discuss caching, debouncing, database indexing, and asset compression.")
    ]

    hr_pool = [
        ("Tell me about yourself and what key experiences make you a great fit for this position.", "Structure your answer using Present-Past-Future format."),
        ("Describe a situation where you had a major disagreement with a team member or stakeholder. How did you resolve it?", "Use the STAR method (Situation, Task, Action, Result) focusing on constructive collaboration."),
        ("Where do you see yourself professionally in the next 3 to 5 years, and how does this role align with your goals?", "Show ambition, continuous learning, and alignment with organizational growth."),
        ("Can you share an instance where a project didn't go as planned? What did you learn and how did you adapt?", "Demonstrate resilience, accountability, and problem-solving maturity."),
        ("How do you prioritize competing deadlines when multiple critical tasks arise simultaneously?", "Discuss time management frameworks, triage, and transparent stakeholder communication.")
    ]

    pool = hr_pool if mode == "hr" else tech_pool
    idx = q_index % len(pool)
    q_text, hint = pool[idx]

    # Customize slightly if JD has specific keywords
    if jd_text and q_index == 0:
        first_line = jd_text.strip().split("\n")[0][:60]
        q_text = f"Looking at the requirements for this role ({first_line}), what specific strengths and experiences prepare you best for these responsibilities?"
        hint = "Align your top 2-3 relevant skills directly with the role requirements."

    return q_text, hint


def generate_smart_feedback(question, answer):
    """Generate constructive feedback for candidate's answer."""
    if not answer or len(answer.strip()) < 10:
        return {"feedback": "Answer was too brief or incomplete. Try elaborating with specific technical context and clear results.", "score": 3}
    
    if ANTHROPIC_API_KEY:
        try:
            system = "You are a strict but encouraging interview coach. Given the question and candidate's answer, respond in JSON only: {\"feedback\": \"1-2 constructive sentences\", \"score\": <0-10 integer>}."
            user_msg = f"Question: {question}\n\nCandidate Answer: {answer}"
            raw = call_claude_api(system, user_msg, max_tokens=200)
            cleaned = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception:
            pass

    length = len(answer.strip().split())
    if length > 40:
        score = min(10, 8 + (1 if "because" in answer.lower() or "example" in answer.lower() else 0))
        feedback = "Great detailed response! You provided thorough context and articulated your points clearly."
    elif length > 15:
        score = 7
        feedback = "Good response with relevant points. Consider including a specific real-world example to make it even more impactful."
    else:
        score = 5
        feedback = "Adequate start, but expanding on your thought process and technical rationale will strengthen your answer."
    
    return {"feedback": feedback, "score": score}


def generate_smart_report(mode, transcript, violation_count):
    """Generate comprehensive interview assessment report."""
    if ANTHROPIC_API_KEY and transcript:
        try:
            system = (
                "You are an expert interview evaluator. Given a full interview transcript, return STRICT JSON only:\n"
                "{\"overall_score\": <0-100 integer>, \"summary\": \"2-3 sentence overall assessment\", "
                "\"strengths\": [\"...\", \"...\"], \"weaknesses\": [\"...\", \"...\"], "
                "\"communication_score\": <0-100>, \"technical_score\": <0-100>}"
            )
            raw = call_claude_api(system, f"Mode: {mode}\nViolations: {violation_count}\n\nTranscript:\n{transcript}", max_tokens=700)
            cleaned = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Report AI fallback: {e}")

    # Built-in contextual evaluator
    base_score = 82
    if violation_count > 0:
        base_score = max(40, base_score - (violation_count * 8))
    
    words_count = len(transcript.split()) if transcript else 0
    if words_count > 200:
        base_score = min(96, base_score + 8)
    elif words_count < 50:
        base_score = max(45, base_score - 15)

    comm_score = min(100, max(50, base_score + 4))
    tech_score = min(100, max(45, base_score - 2 if mode == "technical" else base_score))

    summary = (
        f"Candidate demonstrated solid understanding across key {mode} competencies. "
        "Responses showed clarity, structured reasoning, and good domain awareness."
    )
    strengths = [
        "Clear verbal expression and structured response framing",
        "Demonstrated understanding of core domain principles",
        "Calm demeanor and consistent engagement throughout the session"
    ]
    weaknesses = [
        "Could expand on quantitative business outcomes and metrics",
        "Deepen specific edge-case considerations during technical explanations"
    ]
    if violation_count > 0:
        weaknesses.append(f"Recorded {violation_count} proctoring alert(s) during session (tab switch / focus change).")

    return {
        "overall_score": base_score,
        "summary": summary,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "communication_score": comm_score,
        "technical_score": tech_score
    }

# ─────────────────────────────────────────────────────────────────────────────
# API ROUTES: /api/auth
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/auth", methods=["GET", "POST"])
def api_auth():
    action = request.args.get("action", "").strip()
    
    # 1. SIGNUP
    if action == "signup":
        if request.method != "POST":
            return jsonify({"error": "Method not allowed"}), 405
        data = request.get_json(silent=True) or {}
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not name or not email or not password:
            return jsonify({"error": "Name, email and password are required."}), 400
        if "@" not in email or "." not in email:
            return jsonify({"error": "Please enter a valid email address."}), 400
        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters long."}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "An account with that email already exists."}), 409

        p_hash = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user')",
            (name, email, p_hash)
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()

        log_login_attempt(user_id, email, "user", True, "signup")

        token_payload = {"id": user_id, "name": name, "email": email, "role": "user"}
        token = generate_session_token(token_payload)

        resp = make_response(jsonify({"user": token_payload}), 201)
        resp.set_cookie(COOKIE_NAME, token, max_age=TOKEN_MAX_AGE, httponly=True, samesite="Lax", path="/")
        return resp

    # 2. LOGIN
    elif action == "login":
        if request.method != "POST":
            return jsonify({"error": "Method not allowed"}), 405
        data = request.get_json(silent=True) or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email and password are required."}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, password_hash, role FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        conn.close()

        if not row or not check_password_hash(row["password_hash"], password):
            log_login_attempt(row["id"] if row else None, email, row["role"] if row else None, False, "invalid_credentials")
            return jsonify({"error": "Invalid email or password."}), 401

        user_id = row["id"]
        role = row["role"]
        name = row["name"]
        log_login_attempt(user_id, email, role, True, "ok")

        token_payload = {"id": user_id, "name": name, "email": email, "role": role}
        token = generate_session_token(token_payload)

        resp = make_response(jsonify({"user": token_payload}), 200)
        resp.set_cookie(COOKIE_NAME, token, max_age=TOKEN_MAX_AGE, httponly=True, samesite="Lax", path="/")
        return resp

    # 3. LOGOUT
    elif action == "logout":
        resp = make_response(jsonify({"ok": True}), 200)
        resp.set_cookie(COOKIE_NAME, "", max_age=0, httponly=True, samesite="Lax", path="/")
        return resp

    # 4. CURRENT USER PROFILE (ME)
    elif action == "me":
        user = get_current_user()
        return jsonify({"user": user or None}), 200

    # 5. BOOTSTRAP ADMIN
    elif action == "bootstrap-admin":
        if request.method != "POST":
            return jsonify({"error": "Method not allowed"}), 405
        data = request.get_json(silent=True) or {}
        provided_key = data.get("setupKey", "")
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not ADMIN_SETUP_KEY:
            return jsonify({"error": "ADMIN_SETUP_KEY is not configured on server."}), 500
        if provided_key != ADMIN_SETUP_KEY:
            return jsonify({"error": "Invalid administrative setup key."}), 403

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "An admin account already exists. Bootstrap is disabled."}), 409

        if not name or not email or not password or len(password) < 10:
            conn.close()
            return jsonify({"error": "Name, email, and password of at least 10 characters are required."}), 400

        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing = cursor.fetchone()
        if existing:
            cursor.execute("UPDATE users SET role = 'admin' WHERE id = ?", (existing["id"],))
            conn.commit()
            conn.close()
            return jsonify({"ok": True, "message": "Existing account elevated to administrator."}), 200

        p_hash = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
            (name, email, p_hash)
        )
        conn.commit()
        conn.close()
        return jsonify({"ok": True, "message": "Admin account created successfully."}), 201

    return jsonify({"error": "Unknown or missing ?action= parameter"}), 400

# ─────────────────────────────────────────────────────────────────────────────
# API ROUTES: /api/admin
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/admin", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
@require_admin
def api_admin():
    resource = request.args.get("resource", "").strip()
    conn = get_db()
    cursor = conn.cursor()

    try:
        # 1. USERS LIST + DELETE
        if resource == "users":
            if request.method == "GET":
                cursor.execute("""
                    SELECT u.id, u.name, u.email, u.role, u.created_at,
                           (SELECT COUNT(*) FROM login_history lh WHERE lh.user_id = u.id AND lh.success = 1) AS login_count,
                           (SELECT MAX(lh.created_at) FROM login_history lh WHERE lh.user_id = u.id AND lh.success = 1) AS last_login
                    FROM users u
                    ORDER BY u.created_at DESC
                """)
                users = [dict(row) for row in cursor.fetchall()]
                return jsonify({"users": users}), 200

            elif request.method == "DELETE":
                user_id = request.args.get("id", "").strip()
                if not user_id:
                    return jsonify({"error": "id parameter required"}), 400
                # Prevent self-deletion
                if str(request.user.get("id")) == str(user_id):
                    return jsonify({"error": "You cannot delete your own admin account."}), 400
                cursor.execute("SELECT id, role FROM users WHERE id = ?", (user_id,))
                target = cursor.fetchone()
                if not target:
                    return jsonify({"error": "User not found"}), 404
                cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
                conn.commit()
                return jsonify({"ok": True, "deleted": user_id}), 200

        # 2. LOGIN HISTORY
        elif resource == "login-history":
            page = max(1, int(request.args.get("page", 1)))
            page_size = min(200, max(1, int(request.args.get("pageSize", 50))))
            offset = (page - 1) * page_size

            cursor.execute("SELECT COUNT(*) FROM login_history")
            total = cursor.fetchone()[0]

            cursor.execute("""
                SELECT id, user_id, email, role, success, reason, ip_address, user_agent, created_at
                FROM login_history
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            """, (page_size, offset))
            entries = []
            for row in cursor.fetchall():
                d = dict(row)
                d["success"] = bool(d["success"])
                entries.append(d)

            return jsonify({"entries": entries, "page": page, "pageSize": page_size, "total": total}), 200

        # 3. INTERVIEWS LIST
        elif resource == "interviews":
            cursor.execute("""
                SELECT s.id, s.name, s.email, s.mode, s.status, s.violation_count, s.started_at, s.ended_at,
                       r.overall_score,
                       (SELECT COUNT(*) FROM interview_events e WHERE e.session_id = s.id) AS event_count
                FROM interview_sessions s
                LEFT JOIN interview_reports r ON r.session_id = s.id
                ORDER BY s.started_at DESC
                LIMIT 500
            """)
            sessions = [dict(row) for row in cursor.fetchall()]
            return jsonify({"sessions": sessions}), 200

        # 4. INTERVIEW DETAIL
        elif resource == "interview-detail":
            s_id = request.args.get("id", "").strip()
            if not s_id:
                return jsonify({"error": "id query parameter is required"}), 400

            cursor.execute("SELECT * FROM interview_sessions WHERE id = ?", (s_id,))
            session_row = cursor.fetchone()
            if not session_row:
                return jsonify({"error": "Session not found"}), 404

            cursor.execute("SELECT q_index, question, answer, ai_feedback, created_at FROM interview_qa WHERE session_id = ? ORDER BY q_index ASC", (s_id,))
            qa_rows = [dict(r) for r in cursor.fetchall()]

            cursor.execute("SELECT event_type, detail, created_at FROM interview_events WHERE session_id = ? ORDER BY created_at ASC", (s_id,))
            event_rows = []
            for r in cursor.fetchall():
                d = dict(r)
                if d.get("detail"):
                    try:
                        d["detail"] = json.loads(d["detail"])
                    except Exception:
                        pass
                event_rows.append(d)

            cursor.execute("SELECT * FROM interview_reports WHERE session_id = ?", (s_id,))
            report_row = cursor.fetchone()
            report_data = dict(report_row) if report_row else None
            if report_data:
                for k in ["strengths", "weaknesses", "full_report"]:
                    if report_data.get(k):
                        try:
                            report_data[k] = json.loads(report_data[k])
                        except Exception:
                            pass

            return jsonify({
                "session": dict(session_row),
                "qa": qa_rows,
                "events": event_rows,
                "report": report_data
            }), 200

        # 5. ADMIN JOBS MANAGEMENT
        elif resource == "jobs":
            if request.method == "GET":
                cursor.execute("SELECT * FROM jobs ORDER BY created_at DESC")
                jobs = []
                for r in cursor.fetchall():
                    d = dict(r)
                    if d.get("tags"):
                        try:
                            d["tags"] = json.loads(d["tags"])
                        except Exception:
                            d["tags"] = []
                    jobs.append(d)
                return jsonify({"jobs": jobs}), 200

            elif request.method == "POST":
                data = request.get_json(silent=True) or {}
                j_type = data.get("type", "").strip()
                title = data.get("title", "").strip()
                company = data.get("company", "").strip()
                location = data.get("location", "").strip()
                deadline = data.get("deadline")
                url = data.get("url", "").strip()
                raw_tags = data.get("tags")

                if not j_type or j_type not in ("gov", "pvt") or not title or not company or not location:
                    return jsonify({"error": "type ('gov' or 'pvt'), title, company and location are required."}), 400

                if isinstance(raw_tags, list):
                    tags = raw_tags
                elif isinstance(raw_tags, str):
                    tags = [t.strip() for t in raw_tags.split(",") if t.strip()]
                else:
                    tags = []

                job_id = f"{j_type[0]}{int(time.time()*1000)}"
                cursor.execute(
                    """INSERT INTO jobs (id, type, title, company, location, deadline, url, tags, created_by)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (job_id, j_type, title, company, location, deadline or None, url or None, json.dumps(tags), request.user.get("id"))
                )
                conn.commit()
                return jsonify({"ok": True, "id": job_id}), 201

            elif request.method == "DELETE":
                job_id = request.args.get("id", "").strip()
                if not job_id:
                    return jsonify({"error": "id parameter required"}), 400
                cursor.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
                conn.commit()
                return jsonify({"ok": True}), 200

        # 6. ADMIN BLOGS MANAGEMENT (full CRUD)
        elif resource == "blogs":
            import re as _re
            def slugify(text):
                text = text.lower().strip()
                text = _re.sub(r'[^\w\s-]', '', text)
                text = _re.sub(r'[\s_-]+', '-', text)
                return text[:120]

            if request.method == "GET":
                cursor.execute("SELECT id, title, slug, category, excerpt, cover_emoji, status, author_name, views, read_time, created_at, published_at FROM blogs ORDER BY created_at DESC")
                blogs = [dict(r) for r in cursor.fetchall()]
                return jsonify({"blogs": blogs}), 200

            elif request.method == "POST":
                data = request.get_json(silent=True) or {}
                title = (data.get("title") or "").strip()
                content = (data.get("content") or "").strip()
                if not title or not content:
                    return jsonify({"error": "title and content are required"}), 400

                category = (data.get("category") or "General").strip()
                excerpt = (data.get("excerpt") or content[:200].strip()).strip()
                raw_tags = data.get("tags", [])
                tags = raw_tags if isinstance(raw_tags, list) else [t.strip() for t in str(raw_tags).split(",") if t.strip()]
                cover_emoji = (data.get("cover_emoji") or "📝").strip()
                status = (data.get("status") or "draft").strip()
                read_time = max(1, int(data.get("read_time") or max(1, len(content.split()) // 200)))

                slug_base = slugify(title)
                slug = slug_base
                suffix = 1
                while True:
                    cursor.execute("SELECT id FROM blogs WHERE slug = ?", (slug,))
                    if not cursor.fetchone():
                        break
                    slug = f"{slug_base}-{suffix}"
                    suffix += 1

                import datetime as _dt
                blog_id = f"blog-{int(time.time()*1000)}"
                pub_at = _dt.datetime.utcnow().isoformat() if status == "published" else None
                cursor.execute(
                    """INSERT INTO blogs (id, title, slug, category, excerpt, content, tags, cover_emoji, status, author_name, author_id, read_time, published_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (blog_id, title, slug, category, excerpt, content, json.dumps(tags), cover_emoji, status,
                     request.user.get("name", "Admin"), request.user.get("id"), read_time, pub_at)
                )
                conn.commit()
                return jsonify({"ok": True, "id": blog_id, "slug": slug}), 201

            elif request.method in ("PUT", "PATCH"):
                blog_id = request.args.get("id", "").strip()
                if not blog_id:
                    return jsonify({"error": "id parameter required"}), 400
                data = request.get_json(silent=True) or {}
                cursor.execute("SELECT * FROM blogs WHERE id = ?", (blog_id,))
                existing = cursor.fetchone()
                if not existing:
                    return jsonify({"error": "Blog not found"}), 404

                import datetime as _dt
                now_str = _dt.datetime.utcnow().isoformat()

                title = (data.get("title") or existing["title"]).strip()
                content = (data.get("content") or existing["content"]).strip()
                category = (data.get("category") or existing["category"]).strip()
                excerpt = (data.get("excerpt") or existing["excerpt"] or content[:200]).strip()
                raw_tags = data.get("tags", json.loads(existing["tags"] if existing["tags"] else "[]"))
                tags = raw_tags if isinstance(raw_tags, list) else [t.strip() for t in str(raw_tags).split(",") if t.strip()]
                cover_emoji = (data.get("cover_emoji") or existing["cover_emoji"] or "📝").strip()
                status = (data.get("status") or existing["status"]).strip()
                read_time = int(data.get("read_time") or existing["read_time"] or 5)

                pub_at = existing["published_at"]
                if status == "published" and not pub_at:
                    pub_at = now_str

                cursor.execute(
                    """UPDATE blogs SET title=?, category=?, excerpt=?, content=?, tags=?, cover_emoji=?,
                       status=?, read_time=?, published_at=?, updated_at=? WHERE id=?""",
                    (title, category, excerpt, content, json.dumps(tags), cover_emoji, status, read_time, pub_at, now_str, blog_id)
                )
                conn.commit()
                return jsonify({"ok": True}), 200

            elif request.method == "DELETE":
                blog_id = request.args.get("id", "").strip()
                if not blog_id:
                    return jsonify({"error": "id parameter required"}), 400
                cursor.execute("DELETE FROM blogs WHERE id = ?", (blog_id,))
                conn.commit()
                return jsonify({"ok": True}), 200

        return jsonify({"error": "Unknown or missing ?resource= parameter"}), 400

    finally:
        conn.close()

# ─────────────────────────────────────────────────────────────────────────────
# API ROUTES: /api/interview
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/interview", methods=["POST"])
@require_auth
def api_interview():
    action = request.args.get("action", "").strip()
    data = request.get_json(silent=True) or {}
    conn = get_db()
    cursor = conn.cursor()

    try:
        # 1. START INTERVIEW SESSION
        if action == "start":
            mode = data.get("mode", "technical").strip()
            jd_text = data.get("jdText", "")
            resume_text = data.get("resumeText", "")
            session_id = str(uuid.uuid4())

            cursor.execute(
                """INSERT INTO interview_sessions (id, user_id, email, name, mode, jd_text, resume_text, ip_address, user_agent)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (session_id, request.user.get("id"), request.user.get("email"), request.user.get("name"),
                 mode, jd_text, resume_text, get_client_ip(), request.headers.get("User-Agent", ""))
            )
            conn.commit()
            return jsonify({"sessionId": session_id}), 201

        # 2. GENERATE QUESTION
        elif action == "question":
            session_id = data.get("sessionId", "").strip()
            q_index = int(data.get("qIndex", 0))
            total_questions = int(data.get("totalQuestions", 12))
            mode = data.get("mode", "technical")
            jd_text = data.get("jdText", "")
            resume_text = data.get("resumeText", "")
            history = data.get("history", [])

            if not session_id:
                return jsonify({"error": "sessionId is required"}), 400

            question, hint = generate_smart_question(mode, jd_text, resume_text, history, q_index, total_questions)

            cursor.execute(
                "INSERT INTO interview_qa (session_id, q_index, question) VALUES (?, ?, ?)",
                (session_id, q_index, question)
            )
            conn.commit()
            return jsonify({"question": question, "hint": hint}), 200

        # 3. SUBMIT ANSWER & GET REAL-TIME FEEDBACK
        elif action == "answer":
            session_id = data.get("sessionId", "").strip()
            q_index = data.get("qIndex")
            question = data.get("question", "")
            answer = data.get("answer", "")

            if not session_id or q_index is None or not question:
                return jsonify({"error": "sessionId, qIndex and question are required"}), 400

            feedback_obj = generate_smart_feedback(question, answer)
            feedback_json = json.dumps(feedback_obj)

            cursor.execute(
                "UPDATE interview_qa SET answer = ?, ai_feedback = ? WHERE session_id = ? AND q_index = ?",
                (answer, feedback_json, session_id, q_index)
            )
            conn.commit()
            return jsonify({"ok": True, "feedback": feedback_json}), 200

        # 4. LOG PROCTORING EVENT (Camera, Mic, Tab Switch / Focus Loss, Face)
        elif action == "event":
            session_id = data.get("sessionId", "").strip()
            event_type = data.get("eventType", "").strip()
            detail = data.get("detail")

            if not session_id or not event_type:
                return jsonify({"error": "sessionId and eventType are required"}), 400

            detail_str = json.dumps(detail) if detail else None
            cursor.execute(
                "INSERT INTO interview_events (session_id, event_type, detail) VALUES (?, ?, ?)",
                (session_id, event_type, detail_str)
            )
            if event_type == "violation":
                cursor.execute(
                    "UPDATE interview_sessions SET violation_count = violation_count + 1 WHERE id = ?",
                    (session_id,)
                )
            conn.commit()
            return jsonify({"ok": True}), 201

        # 5. COMPLETE INTERVIEW & GENERATE REPORT
        elif action == "complete":
            session_id = data.get("sessionId", "").strip()
            terminated = bool(data.get("terminated", False))

            if not session_id:
                return jsonify({"error": "sessionId is required"}), 400

            cursor.execute("SELECT * FROM interview_sessions WHERE id = ?", (session_id,))
            session_row = cursor.fetchone()
            if not session_row:
                return jsonify({"error": "Session not found"}), 404

            cursor.execute("SELECT q_index, question, answer FROM interview_qa WHERE session_id = ? ORDER BY q_index ASC", (session_id,))
            qa_rows = cursor.fetchall()
            transcript = "\n\n".join([f"Q{r['q_index']+1}: {r['question']}\nA{r['q_index']+1}: {r['answer'] or '(no answer)'}" for r in qa_rows])

            report = generate_smart_report(session_row["mode"], transcript, session_row["violation_count"])

            cursor.execute(
                """INSERT INTO interview_reports (session_id, overall_score, summary, strengths, weaknesses, full_report)
                   VALUES (?, ?, ?, ?, ?, ?)
                   ON CONFLICT(session_id) DO UPDATE SET
                   overall_score = excluded.overall_score,
                   summary = excluded.summary,
                   strengths = excluded.strengths,
                   weaknesses = excluded.weaknesses,
                   full_report = excluded.full_report""",
                (session_id, report.get("overall_score"), report.get("summary"),
                 json.dumps(report.get("strengths", [])),
                 json.dumps(report.get("weaknesses", [])),
                 json.dumps(report))
            )
            cursor.execute(
                "UPDATE interview_sessions SET status = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?",
                ("terminated" if terminated else "completed", session_id)
            )
            conn.commit()
            return jsonify({"ok": True, "report": report}), 200

        return jsonify({"error": "Unknown or missing ?action= parameter"}), 400

    finally:
        conn.close()

# ─────────────────────────────────────────────────────────────────────────────
# API ROUTES: /api/jobs (PUBLIC)
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/jobs", methods=["GET"])
def api_public_jobs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs ORDER BY created_at DESC")
    jobs = []
    for r in cursor.fetchall():
        d = dict(r)
        if d.get("tags"):
            try:
                d["tags"] = json.loads(d["tags"])
            except Exception:
                d["tags"] = []
        jobs.append(d)
    conn.close()
    return jsonify({"jobs": jobs}), 200

# ─────────────────────────────────────────────────────────────────────────────
# API ROUTES: /api/blogs (PUBLIC)
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/api/blogs", methods=["GET"])
def api_public_blogs():
    conn = get_db()
    cursor = conn.cursor()
    category = request.args.get("category", "").strip()
    search = request.args.get("search", "").strip()
    slug = request.args.get("slug", "").strip()
    blog_id = request.args.get("id", "").strip()

    try:
        # Single article by id or slug → increment views
        if blog_id or slug:
            if blog_id:
                cursor.execute("SELECT * FROM blogs WHERE id = ? AND status = 'published'", (blog_id,))
            else:
                cursor.execute("SELECT * FROM blogs WHERE slug = ? AND status = 'published'", (slug,))
            row = cursor.fetchone()
            if not row:
                return jsonify({"error": "Blog not found"}), 404
            data = dict(row)
            if data.get("tags"):
                try:
                    data["tags"] = json.loads(data["tags"])
                except Exception:
                    data["tags"] = []
            # Increment view count
            cursor.execute("UPDATE blogs SET views = views + 1 WHERE id = ?", (data["id"],))
            conn.commit()
            return jsonify({"blog": data}), 200

        # List: published only, with optional category/search filter
        params = []
        query = "SELECT id, title, slug, category, excerpt, cover_emoji, tags, status, author_name, views, read_time, published_at FROM blogs WHERE status = 'published'"

        if category:
            query += " AND category = ?"
            params.append(category)

        if search:
            query += " AND (title LIKE ? OR excerpt LIKE ? OR tags LIKE ?)"
            s = f"%{search}%"
            params.extend([s, s, s])

        query += " ORDER BY published_at DESC LIMIT 100"
        cursor.execute(query, params)

        blogs = []
        for r in cursor.fetchall():
            d = dict(r)
            if d.get("tags"):
                try:
                    d["tags"] = json.loads(d["tags"])
                except Exception:
                    d["tags"] = []
            blogs.append(d)

        # Get available categories
        cursor.execute("SELECT DISTINCT category FROM blogs WHERE status = 'published' ORDER BY category")
        categories = [r[0] for r in cursor.fetchall()]

        return jsonify({"blogs": blogs, "categories": categories, "total": len(blogs)}), 200

    finally:
        conn.close()

# ─────────────────────────────────────────────────────────────────────────────
# FRONTEND STATIC FILES & SPA ROUTING
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/")
def serve_index():
    return send_from_directory(str(BASE_DIR), "index.html")


@app.route("/<path:filename>")
def serve_page(filename):
    file_path = BASE_DIR / filename
    if file_path.is_file():
        return send_from_directory(str(file_path.parent), file_path.name)
    
    # Try appending .html
    html_path = BASE_DIR / f"{filename}.html"
    if html_path.is_file():
        return send_from_directory(str(html_path.parent), html_path.name)

    # Check 404 fallback
    not_found = BASE_DIR / "404.html"
    if not_found.is_file():
        return send_from_directory(str(BASE_DIR), "404.html"), 404
    
    return abort(404)

# ─────────────────────────────────────────────────────────────────────────────
# SERVER ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print("=================================================================")
    print("  🚀 CareerSadhana Full-Stack Server Starting...")
    print(f"  🌐 URL: http://127.0.0.1:{port}")
    print("  📁 Database: SQLite (careersadhana.db)")
    print("  🔒 Default Admin: admin@careersadhana.com / Admin@12345")
    print("=================================================================")
    init_db()
    app.run(host="0.0.0.0", port=port, debug=False)
