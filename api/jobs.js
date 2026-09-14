// GET /api/jobs — public. Returns jobs that admins have added via the
// Admin Dashboard, stored in the database (so every visitor sees them,
// not just the admin's own browser like the old localStorage version).
'use strict';

const { query } = require('./_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const result = await query('SELECT * FROM jobs ORDER BY created_at DESC');
    res.status(200).json({ jobs: result.rows });
  } catch (err) {
    console.error('public jobs error', err);
    // Fail soft — the front-end still has its built-in JOBS_DATA to fall back on.
    res.status(200).json({ jobs: [], error: 'db_unavailable' });
  }
};
