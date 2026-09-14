// api/_lib/db.js
// Shared Postgres connection pool. Works with any standard Postgres
// provider (Neon, Supabase, Vercel Postgres, RDS, etc.) — just set
// DATABASE_URL in your environment variables.
'use strict';

const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not set. Add it in your Vercel project ' +
        'Environment Variables (Settings → Environment Variables).'
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Most managed Postgres providers require SSL. Disable via
      // PGSSL=disable if you're running a local/self-hosted DB without SSL.
      ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

async function query(text, params) {
  const client = getPool();
  return client.query(text, params);
}

module.exports = { getPool, query };
