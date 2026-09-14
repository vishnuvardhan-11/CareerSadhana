# CareerSadhana — Setup Guide

This project was a **static site** (plain HTML/CSS/JS, no server). To meet
the requirements below, it now also has a small **Vercel serverless
backend** under `/api`. You need to provision a few things before these
features work in production. Nothing here can be tested from my side —
I don't have network access to your Vercel account, a live database, or
your Anthropic API key — so please follow these steps and tell me if
anything errors out.

## What changed, and why

| Requirement | What was there before | What's there now |
|---|---|---|
| "Take Versant Test" hidden | Not actually `display:none` — the button's text/border color matched the navy hero background, making it invisible | Fixed with a CSS override (`static/css/main.css`) |
| Jobs page issues | Unescaped job data injected via `innerHTML` (XSS risk); admin-added jobs only ever saved to the admin's own browser's `localStorage`, so nobody else could see them; stale demo deadlines | Escaped rendering, jobs now stored in a real database via `/api/jobs`, deadlines refreshed |
| Admin Dashboard open to everyone | The "admin password" was a plain string (`admin123`, or `Admin@123`) sitting in readable JavaScript in `jobs.html`, `versant.js`, and `ai-interview.js` — anyone could view-source and log in | All three hardcoded bypasses removed. There is a single real Admin Dashboard at `admin.html`, gated by `admin-login.html`, backed by a server-side session cookie that client-side JS cannot forge |
| AI Interview mock | Questions came from a large static local file (`static/js/ai-questions.js`) | Questions, per-answer feedback, and the final report now come from the real **Anthropic Claude API**, called server-side (`api/interview.js`, routed via `?action=question|answer|complete`). The static bank is kept only as an offline fallback if the API call fails |
| Camera/mic/voice/session tracking | Camera preview, a basic audio meter, and a brightness-based "face check" existed, but nothing left the browser tab | Every state change (camera/mic on/off, voice activity/silence, face detected/not detected, tab blur/focus, violations) is now POSTed to `/api/interview?action=event` and stored per session |
| Save interview results/reports | Only saved to the current browser's `localStorage` | Full transcript + AI report saved to a real database; viewable per-candidate in the Admin Dashboard |
| Login history | Didn't exist | Every login attempt — success or failure, for every user and the admin — is logged with timestamp, IP, and browser user-agent, viewable in the Admin Dashboard |

## A note on Vercel's Hobby plan function limit

Vercel's free "Hobby" plan caps a deployment at **12 serverless
functions**. The backend originally shipped as 16 separate files under
`/api` (one per action), which hit that limit. It's now consolidated
into just **4 functions**:

- `api/auth.js` — routes by `?action=signup|login|logout|me|bootstrap-admin`
- `api/admin.js` — routes by `?resource=users|login-history|interviews|interview-detail|jobs`
- `api/interview.js` — routes by `?action=start|question|answer|event|complete`
- `api/jobs.js` — the public jobs listing endpoint (unchanged)

All frontend code (`admin.html`, `admin-login.html`, `static/js/ai-interview.js`,
`static/js/versant.js`) already calls these consolidated URLs — you don't
need to change anything, just redeploy.

## 1. Provision a Postgres database

Any standard Postgres works — pick one:
- [Neon](https://neon.tech) (free tier, easiest with Vercel)
- [Supabase](https://supabase.com)
- Vercel Postgres (from your Vercel project → Storage tab)

Copy the connection string (starts with `postgres://...`).

Then run the schema once against that database:

```bash
psql "postgres://user:pass@host/db" -f api/_lib/schema.sql
```

(Or paste the contents of `api/_lib/schema.sql` into your provider's SQL
editor/console.)

## 2. Get a real Anthropic API key

Sign up / log in at [console.anthropic.com](https://console.anthropic.com)
and create an API key. This is what powers the real AI Interview
questions, feedback, and report generation — without it, the interview
falls back to the static local question bank and a generic report.

## 3. Set environment variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add
everything from `.env.example`:

- `DATABASE_URL` — from step 1
- `JWT_SECRET` — a long random string. Generate one locally with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `ANTHROPIC_API_KEY` — from step 2
- `ANTHROPIC_MODEL` — optional, defaults to a current Claude model
- `ADMIN_SETUP_KEY` — another long random string, used **once** to create
  your first admin account (see below)

Redeploy after adding these (Vercel only picks up new env vars on a new
deployment).

## 4. Create your first admin account

There is **no hardcoded admin password anywhere in this codebase**. You
create the first admin securely, once, using the setup key from step 3:

```bash
curl -X POST "https://YOUR-SITE.vercel.app/api/auth?action=bootstrap-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "setupKey": "the ADMIN_SETUP_KEY value you set in Vercel",
    "name": "Your Name",
    "email": "admin@yourcompany.com",
    "password": "a strong password, 10+ characters"
  }'
```

This endpoint refuses to run a second time once any admin account
exists, so it can't be used to hijack the dashboard later. After
you've used it, you can rotate/delete `ADMIN_SETUP_KEY` in Vercel to
close that door entirely (the endpoint will just 500 with a clear
message if it's missing).

## How to log in to the Admin Dashboard

1. Go to `https://YOUR-SITE.vercel.app/admin-login.html`
2. Enter the email/password you set in step 4
3. On success you're redirected to `admin.html`, which shows:
   - **Overview** — counts of users, login attempts, interview sessions
   - **Users** — every registered account, join date, login count, last login
   - **Login History** — every login attempt (success or failure), with
     timestamp, IP address, and browser user-agent
   - **AI Interviews** — every interview session, its status, AI score,
     violation count, and a "View" button showing the full transcript
     plus the camera/mic/voice/focus tracking timeline
   - **Jobs** — add or delete job listings (these show up for every
     visitor on the public Jobs page, not just your browser)

Access control is enforced **server-side**: every `/api/admin` request
(routed via `?resource=`) checks the session cookie's JWT and its `role` claim
(`api/_lib/auth.js` → `requireAdmin`). A non-admin (or logged-out)
request gets a 401/403 no matter what the browser's JavaScript says —
this is the fix for the old client-side-only password check.

## Known limitations / what to test after deploying

I don't have the ability to actually deploy this, connect to a live
database, or call the real Anthropic API from this environment, so
please sanity-check after you deploy:

- Signup/login on `ai-interview.html` and `versant.html` now depend on
  the backend being live — if `DATABASE_URL`/`JWT_SECRET` aren't set,
  those forms will show a "could not reach the server" style error.
- The AI Interview's question generation, per-answer feedback, and
  final report all depend on `ANTHROPIC_API_KEY` being valid and
  funded. If it's missing/invalid, questions fall back to the static
  bank and the report shows a generic fallback summary — the session
  still gets recorded either way.
- Rate limiting, email verification, and CAPTCHA are **not** implemented
  on `/api/auth` — for a production launch you'll likely want to add
  those (e.g. via Vercel's Web Application Firewall / rate limiting, or
  a service like Cloudflare Turnstile for bot protection).
- The Versant practice test (`versant.html`) still stores its own
  practice-session data (scores, attempts) in `localStorage`, as before
  — only its authentication was hardened (the hardcoded admin bypass
  was removed, and sign-ins/sign-ups are now also mirrored to the real
  backend so they appear in Login History). Migrating the rest of its
  data to the database was out of scope for this pass; let me know if
  you'd like that done too.
