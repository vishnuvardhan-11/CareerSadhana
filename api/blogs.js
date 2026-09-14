// /api/blogs.js — Public blog articles endpoint (no auth required).
// Returns published articles only. Admin CRUD is in /api/admin?resource=blogs.
//
// GET /api/blogs                      → list published blogs
// GET /api/blogs?category=X           → filter by category
// GET /api/blogs?search=keyword       → full-text search in title/excerpt/tags
// GET /api/blogs?id=<blogId>          → single article (also increments view count)
// GET /api/blogs?slug=<slug>          → single article by slug
'use strict';

const { query } = require('./_lib/db');

module.exports = async (req, res) => {
  // CORS for Vercel preview deployments
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { id, slug, category, search } = req.query || {};

    // Single article by id or slug → increment view count
    if (id || slug) {
      let row;
      if (id) {
        const r = await query("SELECT * FROM blogs WHERE id = $1 AND status = 'published'", [id]);
        row = r.rows[0];
      } else {
        const r = await query("SELECT * FROM blogs WHERE slug = $1 AND status = 'published'", [slug]);
        row = r.rows[0];
      }
      if (!row) { res.status(404).json({ error: 'Blog not found' }); return; }
      // Fire-and-forget view count increment
      query('UPDATE blogs SET views = views + 1 WHERE id = $1', [row.id]).catch(() => {});
      res.status(200).json({ blog: row });
      return;
    }

    // Build list query
    const conditions = ["status = 'published'"];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (search) {
      const s = `%${search}%`;
      params.push(s, s, s);
      const n = params.length;
      conditions.push(`(title ILIKE $${n-2} OR excerpt ILIKE $${n-1} OR tags::text ILIKE $${n})`);
    }

    const where = conditions.join(' AND ');
    const result = await query(
      `SELECT id, title, slug, category, excerpt, cover_emoji, tags, author_name, views, read_time, published_at
       FROM blogs WHERE ${where} ORDER BY published_at DESC NULLS LAST LIMIT 100`,
      params
    );

    // Distinct categories for filters
    const cats = await query("SELECT DISTINCT category FROM blogs WHERE status = 'published' ORDER BY category");

    res.status(200).json({
      blogs: result.rows,
      categories: cats.rows.map(r => r.category),
      total: result.rows.length
    });

  } catch (err) {
    console.error('blogs error', err);
    res.status(500).json({ error: err.message || 'Failed to load blogs.' });
  }
};
