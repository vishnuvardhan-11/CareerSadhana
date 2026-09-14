// /api/admin.js — consolidated admin endpoint (all admin-only reads/writes).
// Routes by ?resource= so this counts as ONE serverless function instead
// of five (Vercel's Hobby plan caps a deployment at 12 functions total).
// Every request here is gated by requireAdmin (server-side session check).
//
// Usage (all require an admin session cookie):
//   GET    /api/admin?resource=users
//   DELETE /api/admin?resource=users&id=<userId>
//   GET    /api/admin?resource=login-history&page=1&pageSize=50
//   GET    /api/admin?resource=interviews
//   GET    /api/admin?resource=interview-detail&id=<sessionId>
//   GET    /api/admin?resource=jobs
//   POST   /api/admin?resource=jobs        { type, title, company, location, deadline, url, tags }
//   DELETE /api/admin?resource=jobs&id=<jobId>
//   GET    /api/admin?resource=blogs
//   POST   /api/admin?resource=blogs       { title, category, content, excerpt, tags, status, cover_emoji }
//   PUT    /api/admin?resource=blogs&id=<blogId>
//   DELETE /api/admin?resource=blogs&id=<blogId>
'use strict';

const { query } = require('./_lib/db');
const { requireAdmin } = require('./_lib/auth');

function slugId(type) {
  return `${type[0]}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .slice(0, 120);
}

async function handleUsers(req, res) {
  if (req.method === 'GET') {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              (SELECT count(*) FROM login_history lh WHERE lh.user_id = u.id AND lh.success) AS login_count,
              (SELECT max(lh.created_at) FROM login_history lh WHERE lh.user_id = u.id AND lh.success) AS last_login
       FROM users u ORDER BY u.created_at DESC`
    );
    res.status(200).json({ users: result.rows });
    return;
  }
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) { res.status(400).json({ error: 'id is required' }); return; }
    if (String(req.user.id) === String(id)) {
      res.status(400).json({ error: 'You cannot delete your own admin account.' }); return;
    }
    const existing = await query('SELECT id FROM users WHERE id = $1', [id]);
    if (!existing.rows.length) { res.status(404).json({ error: 'User not found' }); return; }
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.status(200).json({ ok: true, deleted: id });
    return;
  }
  res.status(405).json({ error: 'Method not allowed' });
}

async function handleLoginHistory(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const pageSize = Math.min(200, Math.max(1, parseInt(req.query.pageSize || '50', 10)));
  const offset = (page - 1) * pageSize;
  const [rows, count] = await Promise.all([
    query(
      `SELECT id, user_id, email, role, success, reason, ip_address, user_agent, created_at
       FROM login_history ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [pageSize, offset]
    ),
    query('SELECT count(*)::int AS n FROM login_history'),
  ]);
  res.status(200).json({ entries: rows.rows, page, pageSize, total: count.rows[0].n });
}

async function handleInterviews(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }
  const result = await query(
    `SELECT s.id, s.name, s.email, s.mode, s.status, s.violation_count, s.started_at, s.ended_at,
            r.overall_score,
            (SELECT count(*) FROM interview_events e WHERE e.session_id = s.id) AS event_count
     FROM interview_sessions s
     LEFT JOIN interview_reports r ON r.session_id = s.id
     ORDER BY s.started_at DESC LIMIT 500`
  );
  res.status(200).json({ sessions: result.rows });
}

async function handleInterviewDetail(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }
  const id = req.query.id;
  if (!id) { res.status(400).json({ error: 'id is required' }); return; }
  const [session, qa, events, report] = await Promise.all([
    query('SELECT * FROM interview_sessions WHERE id = $1', [id]),
    query('SELECT q_index, question, answer, ai_feedback, created_at FROM interview_qa WHERE session_id = $1 ORDER BY q_index', [id]),
    query('SELECT event_type, detail, created_at FROM interview_events WHERE session_id = $1 ORDER BY created_at', [id]),
    query('SELECT * FROM interview_reports WHERE session_id = $1', [id]),
  ]);
  if (!session.rows.length) { res.status(404).json({ error: 'Session not found' }); return; }
  res.status(200).json({ session: session.rows[0], qa: qa.rows, events: events.rows, report: report.rows[0] || null });
}

async function handleJobs(req, res) {
  if (req.method === 'GET') {
    const result = await query('SELECT * FROM jobs ORDER BY created_at DESC');
    res.status(200).json({ jobs: result.rows });
    return;
  }
  if (req.method === 'POST') {
    const { type, title, company, location, deadline, url, tags } = req.body || {};
    if (!type || !['gov', 'pvt'].includes(type) || !title || !company || !location) {
      res.status(400).json({ error: 'type, title, company and location are required.' }); return;
    }
    const id = slugId(type);
    const tagArr = Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map((t) => t.trim()).filter(Boolean) : []);
    await query(
      `INSERT INTO jobs (id, type, title, company, location, deadline, url, tags, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, type, title, company, location, deadline || null, url || null, tagArr, req.user.id]
    );
    res.status(201).json({ ok: true, id });
    return;
  }
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) { res.status(400).json({ error: 'id is required' }); return; }
    await query('DELETE FROM jobs WHERE id = $1', [id]);
    res.status(200).json({ ok: true });
    return;
  }
  res.status(405).json({ error: 'Method not allowed' });
}

async function handleBlogs(req, res) {
  if (req.method === 'GET') {
    const result = await query(
      `SELECT id, title, slug, category, excerpt, cover_emoji, status, author_name, views, read_time, created_at, published_at
       FROM blogs ORDER BY created_at DESC`
    );
    res.status(200).json({ blogs: result.rows });
    return;
  }
  if (req.method === 'POST') {
    const { title, category, content, excerpt, tags, status, cover_emoji, read_time } = req.body || {};
    if (!title || !content) { res.status(400).json({ error: 'title and content are required' }); return; }
    const tagArr = Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()).filter(Boolean) : []);
    const st = status === 'published' ? 'published' : 'draft';
    const slug_base = slugify(title);
    let slug = slug_base, suffix = 1;
    while (true) {
      const exists = await query('SELECT id FROM blogs WHERE slug = $1', [slug]);
      if (!exists.rows.length) break;
      slug = `${slug_base}-${suffix++}`;
    }
    const blogId = `blog-${Date.now()}`;
    const pub_at = st === 'published' ? new Date().toISOString() : null;
    await query(
      `INSERT INTO blogs (id, title, slug, category, excerpt, content, tags, cover_emoji, status, author_name, author_id, read_time, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [blogId, title, slug, category || 'General', (excerpt || content.slice(0,200)).trim(),
       content, JSON.stringify(tagArr), cover_emoji || '📝', st,
       req.user.name || 'Admin', req.user.id, parseInt(read_time) || Math.max(1, Math.floor(content.split(' ').length / 200)), pub_at]
    );
    res.status(201).json({ ok: true, id: blogId, slug });
    return;
  }
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const id = req.query.id;
    if (!id) { res.status(400).json({ error: 'id is required' }); return; }
    const existing = await query('SELECT * FROM blogs WHERE id = $1', [id]);
    if (!existing.rows.length) { res.status(404).json({ error: 'Blog not found' }); return; }
    const old = existing.rows[0];
    const body = req.body || {};
    const title = (body.title || old.title).trim();
    const content = (body.content || old.content).trim();
    const category = (body.category || old.category).trim();
    const excerpt = (body.excerpt || old.excerpt || content.slice(0,200)).trim();
    const tagArr = Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(',').map(t=>t.trim()).filter(Boolean) : (old.tags || []));
    const cover_emoji = (body.cover_emoji || old.cover_emoji || '📝').trim();
    const st = (body.status || old.status);
    const read_time = parseInt(body.read_time) || old.read_time || 5;
    let pub_at = old.published_at;
    if (st === 'published' && !pub_at) pub_at = new Date().toISOString();
    await query(
      `UPDATE blogs SET title=$1, category=$2, excerpt=$3, content=$4, tags=$5, cover_emoji=$6,
       status=$7, read_time=$8, published_at=$9, updated_at=NOW() WHERE id=$10`,
      [title, category, excerpt, content, JSON.stringify(tagArr), cover_emoji, st, read_time, pub_at, id]
    );
    res.status(200).json({ ok: true });
    return;
  }
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) { res.status(400).json({ error: 'id is required' }); return; }
    await query('DELETE FROM blogs WHERE id = $1', [id]);
    res.status(200).json({ ok: true });
    return;
  }
  res.status(405).json({ error: 'Method not allowed' });
}

module.exports = requireAdmin(async (req, res) => {
  try {
    const resource = (req.query && req.query.resource) || '';
    switch (resource) {
      case 'users':             return await handleUsers(req, res);
      case 'login-history':     return await handleLoginHistory(req, res);
      case 'interviews':        return await handleInterviews(req, res);
      case 'interview-detail':  return await handleInterviewDetail(req, res);
      case 'jobs':               return await handleJobs(req, res);
      case 'blogs':              return await handleBlogs(req, res);
      default:
        res.status(400).json({ error: 'Unknown or missing ?resource= parameter.' });
    }
  } catch (err) {
    console.error('admin error', err);
    res.status(500).json({ error: err.message || 'Request failed.' });
  }
});
