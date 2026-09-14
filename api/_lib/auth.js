// api/_lib/auth.js
// Real server-side authentication: bcrypt password hashing + JWT stored
// in an httpOnly, Secure, SameSite cookie. Replaces the old client-side
// "ADMIN_PASS === 'admin123'" checks that shipped in plain JS.
'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'cs_token';
const TOKEN_TTL = '12h';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'JWT_SECRET is not set (or too short). Set a long random string in ' +
      'your Vercel Environment Variables. Generate one with: ' +
      'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
  }
  return secret;
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signSession(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_TTL });
}

function verifySession(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch (e) {
    return null;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function setSessionCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${12 * 60 * 60}`,
  ];
  if (isProd) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

function getSessionUser(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  const decoded = verifySession(token);
  if (!decoded) return null;
  return decoded; // { id, email, name, role }
}

// Wrap an API handler so it 401s unless a valid session cookie is present.
function requireAuth(handler) {
  return async (req, res) => {
    const user = getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    req.user = user;
    return handler(req, res);
  };
}

// Wrap an API handler so it 403s unless the session belongs to an admin.
// This is the server-side gate for the Admin Dashboard — it cannot be
// bypassed by reading client-side JavaScript, unlike the old design.
function requireAdmin(handler) {
  return async (req, res) => {
    const user = getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }
    req.user = user;
    return handler(req, res);
  };
}

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.socket && req.socket.remoteAddress;
}

module.exports = {
  hashPassword,
  verifyPassword,
  signSession,
  verifySession,
  setSessionCookie,
  clearSessionCookie,
  getSessionUser,
  requireAuth,
  requireAdmin,
  getClientIp,
};
