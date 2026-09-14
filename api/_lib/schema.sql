-- CareerSadhana database schema
-- Run this once against your Postgres database (Neon / Supabase / Vercel
-- Postgres / any provider) before using the app. See SETUP.md for
-- step-by-step instructions.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every login attempt (success AND failure), for every user and admin.
CREATE TABLE IF NOT EXISTS login_history (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email      TEXT NOT NULL,
  role       TEXT,
  success    BOOLEAN NOT NULL,
  reason     TEXT,                 -- e.g. 'invalid_password', 'ok'
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_login_history_created ON login_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_email ON login_history (email);

CREATE TABLE IF NOT EXISTS jobs (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL CHECK (type IN ('gov','pvt')),
  title      TEXT NOT NULL,
  company    TEXT NOT NULL,
  location   TEXT NOT NULL,
  deadline   DATE,
  url        TEXT,
  tags       TEXT[] DEFAULT '{}',
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id              TEXT PRIMARY KEY,           -- crypto.randomUUID()
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email           TEXT,
  name            TEXT,
  mode            TEXT,                       -- technical | hr
  jd_text         TEXT,
  resume_text     TEXT,
  status          TEXT NOT NULL DEFAULT 'in_progress', -- in_progress|completed|terminated
  violation_count INTEGER NOT NULL DEFAULT 0,
  ip_address      TEXT,
  user_agent      TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON interview_sessions (user_id);

CREATE TABLE IF NOT EXISTS interview_qa (
  id          SERIAL PRIMARY KEY,
  session_id  TEXT REFERENCES interview_sessions(id) ON DELETE CASCADE,
  q_index     INTEGER,
  question    TEXT,
  answer      TEXT,
  ai_feedback TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_interview_qa_session ON interview_qa (session_id);

-- Camera / mic / voice-activity / focus / proctoring events, timestamped.
CREATE TABLE IF NOT EXISTS interview_events (
  id         SERIAL PRIMARY KEY,
  session_id TEXT REFERENCES interview_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  detail     JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_interview_events_session ON interview_events (session_id);

CREATE TABLE IF NOT EXISTS interview_reports (
  session_id    TEXT PRIMARY KEY REFERENCES interview_sessions(id) ON DELETE CASCADE,
  overall_score INTEGER,
  summary       TEXT,
  strengths     JSONB,
  weaknesses    JSONB,
  full_report   JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blogs (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  category    TEXT NOT NULL DEFAULT 'General',
  excerpt     TEXT,
  content     TEXT NOT NULL,
  tags        JSONB DEFAULT '[]',
  cover_emoji TEXT DEFAULT '📝',
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  author_name TEXT DEFAULT 'CareerSadhana Team',
  author_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  views       INTEGER NOT NULL DEFAULT 0,
  read_time   INTEGER DEFAULT 5,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs (status, published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs (category);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs (slug);
