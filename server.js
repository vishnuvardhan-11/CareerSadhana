/**
 * CareerSadhana — Node.js Full-Stack Application Server
 * Serves static frontend files and routes /api endpoints.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const BASE_DIR = __dirname;
const STATIC_DIR = path.join(BASE_DIR, 'static');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

// Lazy load API handlers
let authHandler, adminHandler, interviewHandler, jobsHandler;
try {
  authHandler = require('./api/auth.js');
  adminHandler = require('./api/admin.js');
  interviewHandler = require('./api/interview.js');
  jobsHandler = require('./api/jobs.js');
} catch (e) {
  // Handlers will be loaded on demand
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
  });
}

function augmentResponse(res) {
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return res;
  };
}

const server = http.createServer(async (req, res) => {
  augmentResponse(res);
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  req.query = parsedUrl.query || {};

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API ROUTES
  if (pathname.startsWith('/api/')) {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      req.body = await parseJsonBody(req);
    } else {
      req.body = {};
    }

    try {
      if (pathname === '/api/auth') {
        if (!authHandler) authHandler = require('./api/auth.js');
        return await authHandler(req, res);
      }
      if (pathname === '/api/admin') {
        if (!adminHandler) adminHandler = require('./api/admin.js');
        return await adminHandler(req, res);
      }
      if (pathname === '/api/interview') {
        if (!interviewHandler) interviewHandler = require('./api/interview.js');
        return await interviewHandler(req, res);
      }
      if (pathname === '/api/jobs') {
        if (!jobsHandler) jobsHandler = require('./api/jobs.js');
        return await jobsHandler(req, res);
      }
      res.status(404).json({ error: 'Endpoint not found' });
      return;
    } catch (err) {
      console.error('API Error:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
      return;
    }
  }

  // 2. STATIC FILES SERVING
  let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  let filePath = path.join(BASE_DIR, relativePath);

  // If path has no extension and is not found, try appending .html
  if (!path.extname(filePath) && !fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }
  }

  // Security check: ensure path stays within BASE_DIR
  if (!filePath.startsWith(BASE_DIR)) {
    res.status(403).end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 fallback
      const notFoundPath = path.join(BASE_DIR, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        fs.createReadStream(notFoundPath).pipe(res);
      } else {
        res.status(404).end('404 Not Found');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log('=================================================================');
    console.log('  🚀 CareerSadhana Node.js Server Running');
    console.log(`  🌐 URL: http://localhost:${PORT}`);
    console.log('=================================================================');
  });
}

module.exports = server;
