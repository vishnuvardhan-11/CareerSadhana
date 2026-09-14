// /api/auth.js  — consolidated auth endpoint.
// Routes by ?action= so this counts as ONE serverless function instead
// of five (Vercel's Hobby plan caps a deployment at 12 functions total).
//
// Usage:
//   POST /api/auth?action=signup           { name, email, password }
//   POST /api/auth?action=login            { email, password }
//   POST /api/auth?action=logout
//   GET  /api/auth?action=me
//   POST /api/auth?action=bootstrap-admin   { setupKey, name, email, password }
'use strict';

const { query } = require('./_lib/db');
const {
  hashPassword, verifyPassword, signSession, setSessionCookie,
  clearSessionCookie, getSessionUser, getClientIp,
} = require('./_lib/auth');

async function recordAttempt({ userId, email, role, success, reason, req }) {
  await query(
    `INSERT INTO login_history (user_id, email, role, success, reason, ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [userId || null, email, role || null, success, reason, getClientIp(req), req.headers['user-agent'] || null]
  );
}

async function handleSignup(req, res) {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email and password are required.' }); return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) { res.status(400).json({ error: 'Enter a valid email address.' }); return; }
  if (password.length < 8) { res.status(400).json({ error: 'Password must be at least 8 characters.' }); return; }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length) { res.status(409).json({ error: 'An account with that email already exists.' }); return; }

  const hash = await hashPassword(password);
  const inserted = await query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'user') RETURNING id, name, email, role`,
    [name.trim(), email.toLowerCase(), hash]
  );
  const user = inserted.rows[0];
  await recordAttempt({ userId: user.id, email: user.email, role: user.role, success: true, reason: 'signup', req });

  const token = signSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  setSessionCookie(res, token);
  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

async function handleLogin(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) { res.status(400).json({ error: 'Email and password are required.' }); return; }

  const lookup = await query('SELECT id, name, email, password_hash, role FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = lookup.rows[0];

  if (!user) {
    await recordAttempt({ email: email.toLowerCase(), success: false, reason: 'no_such_user', req });
    res.status(401).json({ error: 'Invalid email or password.' }); return;
  }
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    await recordAttempt({ userId: user.id, email: user.email, role: user.role, success: false, reason: 'bad_password', req });
    res.status(401).json({ error: 'Invalid email or password.' }); return;
  }
  await recordAttempt({ userId: user.id, email: user.email, role: user.role, success: true, reason: 'ok', req });

  const token = signSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  setSessionCookie(res, token);
  res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

async function handleLogout(req, res) {
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}

async function handleMe(req, res) {
  const user = getSessionUser(req);
  res.status(200).json({ user: user || null });
}

async function handleBootstrapAdmin(req, res) {
  const setupKey = process.env.ADMIN_SETUP_KEY;
  if (!setupKey) { res.status(500).json({ error: 'ADMIN_SETUP_KEY is not configured on the server.' }); return; }
  const { setupKey: provided, name, email, password } = req.body || {};
  if (provided !== setupKey) { res.status(403).json({ error: 'Invalid setup key.' }); return; }

  const existingAdmin = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (existingAdmin.rows.length) { res.status(409).json({ error: 'An admin account already exists. Bootstrap is disabled.' }); return; }
  if (!name || !email || !password || password.length < 10) {
    res.status(400).json({ error: 'Name, email, and a password of at least 10 characters are required.' }); return;
  }

  const dup = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (dup.rows.length) {
    await query("UPDATE users SET role = 'admin' WHERE id = $1", [dup.rows[0].id]);
    res.status(200).json({ ok: true, message: 'Existing user promoted to admin.' }); return;
  }
  const hash = await hashPassword(password);
  await query(`INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'admin')`, [name.trim(), email.toLowerCase(), hash]);
  res.status(201).json({ ok: true, message: 'Admin account created.' });
}

module.exports = async (req, res) => {
  try {
    const action = (req.query && req.query.action) || '';
    switch (action) {
      case 'signup':           if (req.method !== 'POST') break; return await handleSignup(req, res);
      case 'login':             if (req.method !== 'POST') break; return await handleLogin(req, res);
      case 'logout':            return await handleLogout(req, res);
      case 'me':                return await handleMe(req, res);
      case 'bootstrap-admin':   if (req.method !== 'POST') break; return await handleBootstrapAdmin(req, res);
      default:
        res.status(400).json({ error: 'Unknown or missing ?action= parameter.' });
        return;
    }
    res.status(405).json({ error: 'Method not allowed for this action.' });
  } catch (err) {
    console.error('auth error', err);
    res.status(500).json({ error: err.message || 'Request failed.' });
  }
};
