// /api/interview.js — consolidated AI Interview endpoint.
// Routes by ?action= so this counts as ONE serverless function instead
// of five (Vercel's Hobby plan caps a deployment at 12 functions total).
// Every request requires a logged-in user (requireAuth).
//
// Usage:
//   POST /api/interview?action=start     { mode, jdText, resumeText }
//   POST /api/interview?action=question  { sessionId, qIndex, totalQuestions, mode, jdText, resumeText, history }
//   POST /api/interview?action=answer    { sessionId, qIndex, question, answer }
//   POST /api/interview?action=event     { sessionId, eventType, detail }
//   POST /api/interview?action=complete  { sessionId, terminated }
'use strict';

const crypto = require('crypto');
const { query } = require('./_lib/db');
const { requireAuth, getClientIp } = require('./_lib/auth');
const { callClaudeJSON } = require('./_lib/anthropic');

async function handleStart(req, res) {
  const { mode, jdText, resumeText } = req.body || {};
  const id = crypto.randomUUID();
  await query(
    `INSERT INTO interview_sessions (id, user_id, email, name, mode, jd_text, resume_text, ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, req.user.id, req.user.email, req.user.name, mode || 'technical', jdText || '', resumeText || '',
      getClientIp(req), req.headers['user-agent'] || null]
  );
  res.status(201).json({ sessionId: id });
}

async function handleQuestion(req, res) {
  const { sessionId, qIndex = 0, totalQuestions = 12, mode = 'technical', jdText = '', resumeText = '', history = [] } = req.body || {};
  if (!sessionId) { res.status(400).json({ error: 'sessionId is required' }); return; }

  const system = `You are an experienced ${mode === 'hr' ? 'HR' : 'technical'} interviewer conducting a live mock interview.
Ask exactly one focused, natural interview question at a time. Use the candidate's job description and resume to make it relevant.
Do not repeat topics already covered in the conversation history. Vary difficulty appropriately as the interview progresses (question ${qIndex + 1} of ${totalQuestions}).
Respond ONLY with strict JSON: {"question": "...", "hint": "short interviewer tip, 1 sentence"}. No markdown, no extra text.`;

  const historyText = history.length
    ? history.map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer || '(no answer given)'}`).join('\n\n')
    : '(none yet — this is the first question)';
  const userMsg = `Job description:\n${jdText || '(not provided)'}\n\nCandidate resume summary:\n${resumeText || '(not provided)'}\n\nConversation so far:\n${historyText}\n\nGenerate question ${qIndex + 1} of ${totalQuestions}.`;

  try {
    const result = await callClaudeJSON({ system, messages: [{ role: 'user', content: userMsg }], maxTokens: 300 });
    await query(`INSERT INTO interview_qa (session_id, q_index, question) VALUES ($1,$2,$3)`, [sessionId, qIndex, result.question]);
    res.status(200).json({ question: result.question, hint: result.hint || '' });
  } catch (err) {
    console.error('interview question error', err);
    res.status(502).json({ error: err.message || 'AI question generation failed.', fallback: true });
  }
}

async function handleAnswer(req, res) {
  const { sessionId, qIndex, question, answer } = req.body || {};
  if (!sessionId || qIndex === undefined || !question) {
    res.status(400).json({ error: 'sessionId, qIndex and question are required' }); return;
  }
  let feedback = '';
  try {
    const result = await callClaudeJSON({
      system: `You are a strict but fair interview coach. Given one interview question and the candidate's spoken answer, ` +
        `return JSON only: {"feedback": "1-2 sentence constructive feedback", "score": <0-10 integer>}. No markdown.`,
      messages: [{ role: 'user', content: `Question: ${question}\n\nCandidate's answer: ${answer || '(no answer given)'}` }],
      maxTokens: 200,
    });
    feedback = JSON.stringify(result);
  } catch (e) { feedback = ''; }

  await query(`UPDATE interview_qa SET answer = $1, ai_feedback = $2 WHERE session_id = $3 AND q_index = $4`,
    [answer || '', feedback, sessionId, qIndex]);
  res.status(200).json({ ok: true, feedback });
}

async function handleEvent(req, res) {
  const { sessionId, eventType, detail } = req.body || {};
  if (!sessionId || !eventType) { res.status(400).json({ error: 'sessionId and eventType are required' }); return; }
  await query(`INSERT INTO interview_events (session_id, event_type, detail) VALUES ($1,$2,$3)`,
    [sessionId, eventType, detail ? JSON.stringify(detail) : null]);
  if (eventType === 'violation') {
    await query(`UPDATE interview_sessions SET violation_count = violation_count + 1 WHERE id = $1`, [sessionId]);
  }
  res.status(201).json({ ok: true });
}

async function handleComplete(req, res) {
  const { sessionId, terminated } = req.body || {};
  if (!sessionId) { res.status(400).json({ error: 'sessionId is required' }); return; }

  const qaRes = await query('SELECT q_index, question, answer FROM interview_qa WHERE session_id = $1 ORDER BY q_index', [sessionId]);
  const sessionRes = await query('SELECT * FROM interview_sessions WHERE id = $1', [sessionId]);
  const session = sessionRes.rows[0];
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }

  const transcript = qaRes.rows
    .map((r) => `Q${r.q_index + 1}: ${r.question}\nA${r.q_index + 1}: ${r.answer || '(no answer given)'}`)
    .join('\n\n');

  let report;
  try {
    report = await callClaudeJSON({
      system: `You are an expert interview evaluator. Given a full interview transcript, return STRICT JSON only:
{"overall_score": <0-100 integer>, "summary": "2-3 sentence overall summary",
 "strengths": ["...", "..."], "weaknesses": ["...", "..."],
 "communication_score": <0-100>, "technical_score": <0-100>}
No markdown, no extra commentary.`,
      messages: [{ role: 'user', content: `Mode: ${session.mode}\n\nTranscript:\n${transcript || '(no answers recorded)'}` }],
      maxTokens: 700,
    });
  } catch (e) {
    report = {
      overall_score: null,
      summary: 'Automated evaluation unavailable (AI service error). Transcript saved for manual review.',
      strengths: [], weaknesses: [], communication_score: null, technical_score: null,
    };
  }

  await query(
    `INSERT INTO interview_reports (session_id, overall_score, summary, strengths, weaknesses, full_report)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (session_id) DO UPDATE SET
       overall_score = EXCLUDED.overall_score, summary = EXCLUDED.summary,
       strengths = EXCLUDED.strengths, weaknesses = EXCLUDED.weaknesses, full_report = EXCLUDED.full_report`,
    [sessionId, report.overall_score, report.summary, JSON.stringify(report.strengths || []),
      JSON.stringify(report.weaknesses || []), JSON.stringify(report)]
  );
  await query(`UPDATE interview_sessions SET status = $1, ended_at = now() WHERE id = $2`,
    [terminated ? 'terminated' : 'completed', sessionId]);

  res.status(200).json({ ok: true, report });
}

module.exports = requireAuth(async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const action = (req.query && req.query.action) || '';
    switch (action) {
      case 'start':     return await handleStart(req, res);
      case 'question':  return await handleQuestion(req, res);
      case 'answer':    return await handleAnswer(req, res);
      case 'event':     return await handleEvent(req, res);
      case 'complete':  return await handleComplete(req, res);
      default:
        res.status(400).json({ error: 'Unknown or missing ?action= parameter.' });
    }
  } catch (err) {
    console.error('interview error', err);
    res.status(500).json({ error: err.message || 'Request failed.' });
  }
});
