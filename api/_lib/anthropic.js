// api/_lib/anthropic.js
// Server-side only. Calls the real Anthropic Messages API. The API key
// lives in an environment variable and is never sent to the browser.
'use strict';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';

async function callClaude({ system, messages, maxTokens = 1024 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Add a real key from ' +
      'https://console.anthropic.com in your Vercel Environment Variables.'
    );
  }

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Anthropic API error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const textBlock = (data.content || []).find((b) => b.type === 'text');
  return textBlock ? textBlock.text : '';
}

// Ask Claude for strict JSON. Strips markdown fences defensively.
async function callClaudeJSON(opts) {
  const raw = await callClaude(opts);
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Model did not return valid JSON: ' + cleaned.slice(0, 200));
  }
}

module.exports = { callClaude, callClaudeJSON };
