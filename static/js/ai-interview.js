/**
 * ai-interview.js
 * CareerSadhana AI Interview Engine
 * Voice-based interview: TTS speaks, SpeechRecognition listens
 */
'use strict';

/* ─── CONFIG ─────────────────────────────────────────────── */
const EJS_KEY      = 'YOUR_EMAILJS_PUBLIC_KEY';
const EJS_SERVICE  = 'YOUR_SERVICE_ID';
const EJS_OTP_TPL  = 'YOUR_OTP_TEMPLATE_ID';
// The hardcoded admin email/password that used to live here has been
// removed — it was readable by anyone viewing this file's source and
// granted admin access to anyone who typed it in. Admin access is now
// only possible through /admin-login.html + a real server-side session
// (api/auth/login.js), which this file's sign-in form can never satisfy.

try { emailjs.init({ publicKey: EJS_KEY }); } catch(e) {}

/* ─── STATE ──────────────────────────────────────────────── */
const ST = {
  // user
  user: null, name: '',
  // setup
  mode: 'technical', jd: '', resumeTxt: '',
  // interview runtime
  questions: [], answers: [], curQ: 0,
  violations: 0, running: false,
  // streams & media
  camStream: null, scrStream: null,
  audioCtx: null, analyser: null, animFrame: null,
  faceTimer: null,
  // speech
  synth: window.speechSynthesis,
  recog: null,
  transcriptFinal: '', transcriptInterim: '',
  // timer
  timerID: null, secsLeft: 0, secsTotal: 0,
};

// OTP forgot password
let otpCode = '', otpEmail = '';

/* ─── STORAGE ────────────────────────────────────────────── */
function getUsers() {
  try { return JSON.parse(localStorage.getItem('cs_users')) || {}; } catch(e) { return {}; }
}
function saveUsers(u) { localStorage.setItem('cs_users', JSON.stringify(u)); }
function sessGet() { return sessionStorage.getItem('cs_vsess'); }
function sessSet(v) { sessionStorage.setItem('cs_vsess', v); }
function sessRm()  { sessionStorage.removeItem('cs_vsess'); }

/* ─── DOM HELPERS ────────────────────────────────────────── */
const g = id => document.getElementById(id);

function toast(msg, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast t-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3400);
}

function setProc(id, cls, txt) {
  const el = g(id);
  if (!el) return;
  el.className = `pc-row ${cls}`;
  el.textContent = txt;
}

/* ─── PANEL SYSTEM ───────────────────────────────────────── */
// All panels have display:none !important in CSS
// We override inline to show them
const ALL_PANELS = ['pnl-auth','pnl-setup','pnl-permissions','pnl-interview','pnl-report'];

function showPanel(name) {
  ALL_PANELS.forEach(id => {
    const el = g(id);
    if (!el) return;
    el.style.cssText = 'display:none !important';
    el.classList.remove('active');
  });
  const target = g(`pnl-${name}`);
  if (!target) return;
  // Use block-level override — interview needs flex column
  target.style.cssText = 'display:flex !important';
  target.classList.add('active');
}

/* ─── INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/auth?action=me', { credentials: 'include' });
    const data = await res.json();
    if (data.user && data.user.role !== 'admin') {
      ST.user = data.user.email;
      ST.name = data.user.name;
      sessSet(data.user.email);
      g('welcome-name').textContent = ST.name.split(' ')[0];
      showPanel('setup');
    } else {
      showPanel('auth');
    }
  } catch (e) {
    showPanel('auth');
  }
  setupAntiCheat();
});

/* ─── AUTH TABS ──────────────────────────────────────────── */
function switchTab(name, btn) {
  document.querySelectorAll('.tb').forEach(b => b.classList.remove('sel'));
  document.querySelectorAll('.tab-content').forEach(p => p.classList.remove('sel'));
  btn.classList.add('sel');
  const tc = g(`tc-${name}`);
  if (tc) tc.classList.add('sel');
}

/* ─── SIGN IN ────────────────────────────────────────────── */
async function doSignIn() {
  const email = (g('si-email').value || '').trim().toLowerCase();
  const pass  = (g('si-pass').value  || '');
  const err   = g('si-err');
  err.textContent = '';
  if (!email || !pass) { err.textContent = 'Please fill in all fields.'; return; }
  try {
    const res = await fetch('/api/auth?action=login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.error || 'Incorrect email or password.'; return; }
    if (data.user.role === 'admin') { err.textContent = 'Admin accounts cannot take interviews. Use the Admin Dashboard instead.'; return; }
    ST.user = data.user.email;
    ST.name = data.user.name;
    sessSet(data.user.email);
    g('welcome-name').textContent = ST.name.split(' ')[0];
    g('si-email').value = '';
    g('si-pass').value  = '';
    showPanel('setup');
  } catch (e) {
    err.textContent = 'Could not reach the server. Please try again.';
  }
}

/* ─── SIGN UP ────────────────────────────────────────────── */
async function doSignUp() {
  const name  = (g('su-name').value  || '').trim();
  const email = (g('su-email').value || '').trim().toLowerCase();
  const pass  = (g('su-pass').value  || '');
  const err   = g('su-err');
  err.textContent = '';
  if (!name || !email || !pass)            { err.textContent = 'All fields required.'; return; }
  if (!/\S+@\S+\.\S+/.test(email))         { err.textContent = 'Invalid email address.'; return; }
  if (pass.length < 8)                     { err.textContent = 'Password: minimum 8 characters.'; return; }
  try {
    const res = await fetch('/api/auth?action=signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name, email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) { err.textContent = data.error || 'Could not create account.'; return; }
    ST.user = data.user.email;
    ST.name = data.user.name;
    sessSet(data.user.email);
    g('welcome-name').textContent = name.split(' ')[0];
    showPanel('setup');
  } catch (e) {
    err.textContent = 'Could not reach the server. Please try again.';
  }
}

/* ─── LOGOUT ─────────────────────────────────────────────── */
async function doLogout() {
  stopInterview();
  ST.user = null; ST.name = '';
  sessRm();
  try { await fetch('/api/auth?action=logout', { method: 'POST', credentials: 'include' }); } catch (e) {}
  showPanel('auth');
}

/* ─── SETUP ──────────────────────────────────────────────── */
function selectMode(m) {
  ST.mode = m;
  g('mb-tech').classList.toggle('sel', m === 'technical');
  g('mb-hr').classList.toggle('sel',   m === 'hr');
}

function handleResume(e) {
  const file = e.target.files[0];
  if (!file) return;
  g('resume-name').textContent = '✅ ' + file.name;
  const reader = new FileReader();
  reader.onload = ev => { ST.resumeTxt = (ev.target.result || '').substring(0, 3000); };
  reader.readAsText(file);
}

function analyzeJD() {
  const jd = (g('jd-text').value || '').trim();
  const preview = g('jd-preview');
  const tagsEl  = g('jd-tags');
  if (jd.length < 50) { preview.classList.remove('show'); return; }

  const { tags, level } = getJDTags(jd, ST.resumeTxt || '');
  if (!tags.length) { preview.classList.remove('show'); return; }

  const colors = {
    react:'#61dafb', node:'#68a063', python:'#3572a5', java:'#b07219',
    aws:'#ff9900', docker:'#2496ed', kubernetes:'#326ce5', sql:'#336791',
    typescript:'#2b7489', frontend:'#e44d26', backend:'#339933', ml:'#ff6b6b',
    devops:'#f7931e', mongodb:'#4db33d', redis:'#dc382d', security:'#e53935',
  };

  const levelColors = { junior:'#10b981', mid:'#6366f1', senior:'#f59e0b' };

  tagsEl.innerHTML = [
    `<span class="jd-tag" style="background:${levelColors[level]}20;color:${levelColors[level]};border:1px solid ${levelColors[level]}40">${level} level</span>`,
    ...tags.map(t => {
      const c = colors[t] || '#94a3b8';
      return `<span class="jd-tag" style="background:${c}18;color:${c};border:1px solid ${c}30">${t}</span>`;
    })
  ].join('');
  preview.classList.add('show');
}

function goToPermissions() {
  ST.jd = (g('jd-text').value || '').trim();
  g('perm-msg').textContent = 'Click below to grant camera, microphone, and screen share access';
  g('btn-grant').disabled = false;
  g('btn-grant').textContent = '📷 Grant Access & Begin';
  showPanel('permissions');
}

/* ─── PERMISSIONS ────────────────────────────────────────── */
async function grantPermissions() {
  const btn    = g('btn-grant');
  const status = g('perm-msg');
  btn.disabled = true;
  btn.textContent = 'Requesting…';

  // Step 1: Camera + mic
  status.textContent = '📷 Requesting camera and microphone…';
  try {
    ST.camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch(e) {
    status.innerHTML = '❌ Camera/microphone denied.<br>Allow access in browser settings and retry.';
    btn.disabled = false; btn.textContent = '🔄 Retry'; return;
  }

  // Step 2: Screen share
  status.innerHTML = '✅ Camera ready!<br>🖥️ Please select <strong>Entire Screen</strong> in the next dialog…';
  try {
    ST.scrStream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: 'monitor' }, audio: false
    });

    // Warn if not entire screen
    const track   = ST.scrStream.getVideoTracks()[0];
    const cfg     = track.getSettings && track.getSettings();
    if (cfg && cfg.displaySurface && cfg.displaySurface !== 'monitor') {
      toast('⚠️ Please share your ENTIRE SCREEN — not a window or tab.', 'warn');
      ST.scrStream.getTracks().forEach(t => t.stop()); ST.scrStream = null;
      status.innerHTML = '⚠️ You must share your entire screen. Please retry.';
      btn.disabled = false; btn.textContent = '🔄 Retry'; return;
    }

    track.addEventListener('ended', () => {
      if (ST.running) recordViolation('Screen sharing was stopped during the interview');
    });

  } catch(e) {
    status.innerHTML = '❌ Screen share cancelled.<br>Screen sharing is required to proceed.';
    btn.disabled = false; btn.textContent = '🔄 Retry'; return;
  }

  status.innerHTML = '✅ All permissions granted! Launching interview…';
  setTimeout(launchInterview, 900);
}

/* ─── LAUNCH INTERVIEW ───────────────────────────────────── */
async function launchInterview() {
  ST.running     = true;
  ST.violations  = 0;
  ST.curQ        = 0;
  ST.transcriptFinal    = '';
  ST.transcriptInterim  = '';
  ST.sessionId   = null;
  ST.history     = [];

  // Generate the local fallback question bank up front (used only if the
  // real AI API call for a given question fails — e.g. missing key,
  // network hiccup — so the interview never gets stuck).
  const count       = ST.mode === 'technical' ? 18 : 12;
  ST.totalQuestions = count;
  ST.fallbackQuestions = selectQuestions(ST.mode, ST.jd, ST.resumeTxt, count);
  ST.questions      = new Array(count).fill(null);
  ST.answers        = new Array(count).fill('');

  ST.secsTotal    = ST.mode === 'technical' ? 45 * 60 : 35 * 60;
  ST.secsLeft     = ST.secsTotal;

  // Attach camera
  if (ST.camStream) g('iv-cam').srcObject = ST.camStream;

  // Mode pill
  const pill = g('mode-pill');
  if (ST.mode === 'technical') {
    pill.textContent = '💻 Technical'; pill.className = 'iv-pill pill-tech';
  } else {
    pill.textContent = '🤝 HR Interview'; pill.className = 'iv-pill pill-hr';
  }

  // Reset proctoring
  setProc('pc-cam',   'ok',   '📷 Camera: Active');
  setProc('pc-scr',   'ok',   '🖥️ Screen: Shared');
  setProc('pc-mic',   'ok',   '🎙️ Mic: Ready');
  setProc('pc-focus', 'ok',   '👁 Focus: Active');
  setProc('pc-viol',  'warn', '⚠️ Violations: 0');

  showPanel('interview');
  document.documentElement.requestFullscreen().catch(() => {});

  // Create a real, server-tracked interview session (requires the user
  // to be logged in — enforced server-side by api/_lib/auth.js).
  try {
    const res = await fetch('/api/interview?action=start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ mode: ST.mode, jdText: ST.jd || '', resumeText: ST.resumeTxt || '' }),
    });
    const data = await res.json();
    ST.sessionId = res.ok ? data.sessionId : null;
  } catch (e) { ST.sessionId = null; }

  logEvent('camera_on');
  logEvent('mic_on');
  if (ST.scrStream) logEvent('screen_share_on');

  startAudioMeter();
  startFaceCheck();
  startTimer();
  await loadQuestion(0);
  renderQList();
}

/* ─── TRACKING: camera / mic / voice / focus / violations ───
   Every call is fire-and-forget and safe if the backend is not yet
   configured — the interview still runs locally either way. This is
   what populates the Admin Dashboard's per-session event timeline. */
function logEvent(eventType, detail) {
  if (!ST.sessionId) return;
  fetch('/api/interview?action=event', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
    body: JSON.stringify({ sessionId: ST.sessionId, eventType, detail: detail || null }),
  }).catch(() => {});
}

function logAnswer(qIndex, question, answer) {
  if (!ST.sessionId) return;
  fetch('/api/interview?action=answer', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
    body: JSON.stringify({ sessionId: ST.sessionId, qIndex, question, answer }),
  }).catch(() => {});
}

/* ─── REAL AI QUESTION GENERATION (Anthropic Claude, server-side) ───
   Falls back to the local static question bank (ai-questions.js) only
   if the live API call fails, so the interview experience is never
   blocked by a backend/API-key issue. */
async function loadQuestion(idx) {
  let q = null;
  if (ST.sessionId) {
    try {
      const res = await fetch('/api/interview?action=question', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          sessionId: ST.sessionId, qIndex: idx, totalQuestions: ST.totalQuestions,
          mode: ST.mode, jdText: ST.jd || '', resumeText: ST.resumeTxt || '', history: ST.history,
        }),
      });
      const data = await res.json();
      if (res.ok && data.question) q = { q: data.question, hint: data.hint || '', score: 0 };
    } catch (e) { /* fall through to local bank */ }
  }
  if (!q) q = ST.fallbackQuestions[idx];
  ST.questions[idx] = q;
  renderQ();
}

/* ─── AUDIO LEVEL METER ──────────────────────────────────── */
function startAudioMeter() {
  if (!ST.camStream) return;
  try {
    ST.audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    ST.analyser  = ST.audioCtx.createAnalyser();
    ST.analyser.fftSize = 256;
    const src = ST.audioCtx.createMediaStreamSource(ST.camStream);
    src.connect(ST.analyser);
    const buf  = new Uint8Array(ST.analyser.frequencyBinCount);
    const bars = g('waveform')?.querySelectorAll('.wb');
    const fill = g('audio-fill');
    const lvl  = g('mic-level-txt');
    let lastVoiceLog = 0;
    let lastSpeakingState = null;

    function tick() {
      if (!ST.running) return;
      ST.analyser.getByteFrequencyData(buf);
      const avg = buf.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
      const pct = Math.min(100, (avg / 128) * 100);
      if (fill) fill.style.width = pct + '%';
      if (lvl) lvl.textContent = pct > 5 ? Math.round(pct) + '%' : 'Silent';
      if (bars) {
        bars.forEach((b, i) => {
          const h = 3 + Math.round((buf[i * 4] || 0) / 255 * 22);
          b.style.height = h + 'px';
          b.style.background = avg > 15 ? 'var(--green)' : 'var(--mu2)';
        });
      }
      // Log voice-activity transitions to the backend, throttled to at
      // most once every 4 seconds so this doesn't flood the database.
      const speaking = avg > 15;
      const now = Date.now();
      if (speaking !== lastSpeakingState && now - lastVoiceLog > 4000) {
        logEvent(speaking ? 'voice_activity' : 'silence', { level: Math.round(pct) });
        lastSpeakingState = speaking;
        lastVoiceLog = now;
      }
      ST.animFrame = requestAnimationFrame(tick);
    }
    tick();
  } catch(e) { /* audio meter optional */ }
}

/* ─── FACE DETECTION (canvas brightness) ─────────────────── */
function startFaceCheck() {
  const video  = g('iv-cam');
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');
  let lastWarn = false;

  ST.faceTimer = setInterval(() => {
    if (!ST.running || !video.videoWidth) return;
    canvas.width  = video.videoWidth  / 4;
    canvas.height = video.videoHeight / 4;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data   = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) brightness += data[i];
    brightness /= (data.length / 4);

    const faceOk   = brightness > 25;
    const alertEl  = g('face-alert');
    const statusEl = g('cam-status-txt');
    if (alertEl) alertEl.classList.toggle('show', !faceOk);
    if (statusEl) statusEl.textContent = faceOk ? '📷 Camera Active' : '⚠️ Look at camera';

    if (!faceOk) {
      setProc('pc-cam', 'warn', '📷 Camera: Face not detected');
      if (!lastWarn) logEvent('face_not_detected');
    } else if (!lastWarn) {
      setProc('pc-cam', 'ok', '📷 Camera: Active');
    } else {
      logEvent('face_detected');
    }
    lastWarn = !faceOk;
  }, 2500);
}

/* ─── RENDER QUESTION ────────────────────────────────────── */
function renderQ() {
  const q   = ST.questions[ST.curQ];
  const num = ST.curQ + 1;
  const tot = ST.questions.length;
  const pct = Math.round(((num - 1) / tot) * 100);

  g('q-num-badge').textContent = `Question ${num} of ${tot}`;
  g('q-text').textContent      = q.q;

  const tipEl = g('q-tip');
  if (q.hint) { tipEl.textContent = '💡 ' + q.hint; tipEl.style.display = 'block'; }
  else tipEl.style.display = 'none';

  // Relevance indicator
  const relEl  = g('q-relevance');
  const dotsEl = g('rel-dots');
  if (q.score && q.score > 0 && ST.jd) {
    dotsEl.innerHTML = [1,2,3,4,5].map(i =>
      `<div class="rdot ${i <= q.score ? 'on' : ''}"></div>`
    ).join('');
    relEl.style.display = 'flex';
  } else {
    relEl.style.display = 'none';
  }

  g('q-count-txt').textContent = `Q ${num} / ${tot}`;
  g('iv-prog').style.width     = pct + '%';
  g('iv-prog-txt').textContent = `Progress: ${pct}%`;

  // Reset transcript
  ST.transcriptFinal   = '';
  ST.transcriptInterim = '';
  const tEl = g('transcript');
  if (tEl) { tEl.textContent = 'Your spoken answer will appear here…'; tEl.className = 'transcript-ph'; }
  g('btn-next-q').disabled = true;

  renderQList();
  speakQuestion(q.q);
}

/* ─── TTS: AI SPEAKS QUESTION ────────────────────────────── */
function speakQuestion(text) {
  if (!ST.synth) { startListening(); return; }
  ST.synth.cancel();
  stopListening();

  setAIState('speaking');
  setMicUI('🔊', 'AI is asking the question…', 'Listen carefully, then speak your answer');

  const utt   = new SpeechSynthesisUtterance(text);
  utt.rate    = 0.87;
  utt.pitch   = 1.0;
  utt.volume  = 1;
  utt.lang    = 'en-US';

  // Pick best available voice
  const voices = ST.synth.getVoices();
  const pref   = ['Google UK English Male','Microsoft David Desktop','Alex','Google US English'];
  const voice  = voices.find(v => pref.includes(v.name))
              || voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('google') && v.localService)
              || voices.find(v => v.lang.startsWith('en'))
              || null;
  if (voice) utt.voice = voice;

  utt.onend = utt.onerror = () => {
    setAIState('listening');
    setMicUI('🎙️', 'Listening — speak your answer now', 'Speak naturally and clearly. Click "Submit & Next" when done.');
    startListening();
  };

  // Voices may not be loaded yet
  if (voices.length === 0) {
    ST.synth.onvoiceschanged = () => {
      ST.synth.onvoiceschanged = null;
      ST.synth.speak(utt);
    };
    // Fallback timeout
    setTimeout(() => { if (!ST.synth.speaking) ST.synth.speak(utt); }, 300);
  } else {
    ST.synth.speak(utt);
  }
}

/* ─── SPEECH RECOGNITION ─────────────────────────────────── */
function startListening() {
  const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechAPI) {
    // Fallback for unsupported browsers
    setMicUI('⚠️', 'Voice recognition not available', 'Your browser does not support speech recognition. Use Chrome or Edge.');
    g('btn-next-q').disabled = false;
    return;
  }

  if (ST.recog) { try { ST.recog.stop(); } catch(e) {} }

  ST.recog = new SpeechAPI();
  ST.recog.continuous      = true;
  ST.recog.interimResults  = true;
  ST.recog.lang            = 'en-US';
  ST.recog.maxAlternatives = 1;

  let silenceTimeout = null;

  ST.recog.onresult = e => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    if (final) ST.transcriptFinal += (ST.transcriptFinal ? ' ' : '') + final.trim();
    ST.transcriptInterim = interim;

    const display = [ST.transcriptFinal, interim].filter(Boolean).join(' ');
    const tEl = g('transcript');
    if (tEl) {
      tEl.textContent = display || 'Listening…';
      tEl.className   = display ? '' : 'transcript-ph';
    }

    if ((ST.transcriptFinal || interim).trim()) g('btn-next-q').disabled = false;

    // Auto-stop listening hint after 5s of silence (don't auto-advance)
    clearTimeout(silenceTimeout);
    if (ST.transcriptFinal.trim()) {
      silenceTimeout = setTimeout(() => {
        const btn = g('btn-next-q');
        if (btn && !btn.disabled) {
          btn.style.boxShadow = '0 0 0 4px rgba(255,106,0,.35)';
          setTimeout(() => { if(btn) btn.style.boxShadow = ''; }, 2000);
        }
      }, 6000);
    }
  };

  ST.recog.onerror = e => {
    if (e.error === 'no-speech') return; // normal
    if (e.error === 'not-allowed') {
      setMicUI('❌', 'Microphone access denied', 'Allow microphone in browser settings and reload');
    }
    // Other errors: restart silently
  };

  ST.recog.onend = () => {
    // Auto-restart if still in interview
    if (ST.running && !document.hidden) {
      try { ST.recog.start(); } catch(e) {}
    }
  };

  try { ST.recog.start(); } catch(e) {
    setMicUI('⚠️', 'Mic unavailable', 'Click Submit when ready');
    g('btn-next-q').disabled = false;
  }
}

function stopListening() {
  if (ST.recog) {
    try { ST.recog.stop(); } catch(e) {}
    ST.recog.onresult = null;
    ST.recog.onerror  = null;
    ST.recog.onend    = null;
    ST.recog = null;
  }
}

/* ─── AI STATE UI ────────────────────────────────────────── */
function setAIState(state) {
  const dot = g('ai-dot'), lbl = g('ai-state-lbl');
  if (!dot || !lbl) return;
  const MAP = {
    speaking:  { dot: 'ad-speaking', lbl: 'asl-speaking', text: '🔊 AI is speaking…' },
    listening: { dot: 'ad-listening', lbl: 'asl-listening', text: '🎤 Your turn — speak your answer' },
    thinking:  { dot: 'ad-thinking', lbl: 'asl-thinking', text: '⚙️ Processing…' },
    idle:      { dot: 'ad-idle',     lbl: 'asl-idle',     text: 'Ready' },
  };
  const s = MAP[state] || MAP.idle;
  dot.className       = `ai-dot ${s.dot}`;
  lbl.className       = `ai-state-label ${s.lbl}`;
  lbl.textContent     = s.text;
}

function setMicUI(icon, bold, sub) {
  const i = g('mic-icon'), b = g('mic-b'), s = g('mic-s');
  if (i) i.textContent = icon;
  if (b) b.textContent = bold;
  if (s) s.textContent = sub;
}

/* ─── QUESTION NAV ───────────────────────────────────────── */
function nextQ() {
  const ans = ST.transcriptFinal.trim();
  ST.answers[ST.curQ] = ans || '[No answer recorded]';
  advance();
}

function skipQ() {
  ST.answers[ST.curQ] = '[Skipped]';
  advance();
}

function advance() {
  stopListening();
  if (ST.synth) ST.synth.cancel();
  setAIState('thinking');
  setMicUI('⚙️', 'Loading next question…', 'Please wait');
  g('btn-next-q').disabled = true;

  // Save this Q&A to the backend (Admin Dashboard transcript) and to
  // the short conversation history sent to the AI for the next question.
  const q = ST.questions[ST.curQ];
  const answer = ST.answers[ST.curQ];
  logAnswer(ST.curQ, q ? q.q : '', answer);
  ST.history.push({ question: q ? q.q : '', answer });

  if (ST.curQ < ST.questions.length - 1) {
    ST.curQ++;
    // Brief pause between questions
    setTimeout(async () => {
      ST.transcriptFinal   = '';
      ST.transcriptInterim = '';
      await loadQuestion(ST.curQ);
    }, 1000);
  } else {
    setTimeout(() => endInterview(), 600);
  }
}

/* ─── QUESTION LIST ──────────────────────────────────────── */
function renderQList() {
  const html = ST.questions.map((q, i) => {
    let cls = 'todo', icon = '○';
    if (i < ST.curQ)       { cls = 'done';    icon = '✅'; }
    else if (i === ST.curQ) { cls = 'current'; icon = '▶'; }
    const label = q ? q.q.substring(0, 30) + '…' : 'Not generated yet';
    return `<div class="ql-item ${cls}" title="${q ? q.q : ''}">${icon} Q${i+1}: ${label}</div>`;
  }).join('');
  const el = g('ql-items');
  if (el) el.innerHTML = html;
}

/* ─── TIMER ──────────────────────────────────────────────── */
function startTimer() {
  clearInterval(ST.timerID);
  const el = g('iv-timer');

  ST.timerID = setInterval(() => {
    if (!ST.running) { clearInterval(ST.timerID); return; }
    ST.secsLeft = Math.max(0, ST.secsLeft - 1);
    const m = String(Math.floor(ST.secsLeft / 60)).padStart(2, '0');
    const s = String(ST.secsLeft % 60).padStart(2, '0');
    if (el) {
      el.textContent = `${m}:${s}`;
      if      (ST.secsLeft <= 60)  el.className = 'iv-timer danger';
      else if (ST.secsLeft <= 300) el.className = 'iv-timer warn';
      else                          el.className = 'iv-timer';
    }
    if (ST.secsLeft <= 0) {
      clearInterval(ST.timerID);
      toast('⏰ Time up! Submitting your interview.', 'warn');
      endInterview();
    }
  }, 1000);
}

/* ─── STOP / END ─────────────────────────────────────────── */
function stopInterview() {
  if (ST.running) { logEvent('camera_off'); logEvent('mic_off'); }
  ST.running = false;
  clearInterval(ST.timerID);
  clearInterval(ST.faceTimer);
  cancelAnimationFrame(ST.animFrame);
  if (ST.synth)   ST.synth.cancel();
  stopListening();
  try { ST.audioCtx?.close(); } catch(e) {}
  if (ST.camStream) { ST.camStream.getTracks().forEach(t => t.stop()); ST.camStream = null; }
  if (ST.scrStream) { ST.scrStream.getTracks().forEach(t => t.stop()); ST.scrStream = null; }
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

function endInterview() {
  stopInterview();
  buildReport(false);
}

/* ─── ANTI-CHEAT ─────────────────────────────────────────── */
function setupAntiCheat() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && ST.running) {
      logEvent('tab_blur');
      recordViolation('You switched tabs or minimised the window');
    } else if (!document.hidden && ST.running) {
      logEvent('tab_focus');
    }
  });
  document.addEventListener('paste', e => {
    if (ST.running) { e.preventDefault(); toast('❌ Paste disabled during interview.', 'err'); }
  }, true);
  document.addEventListener('copy', e => { if (ST.running) e.preventDefault(); }, true);
  document.addEventListener('keydown', e => {
    if (!ST.running) return;
    if ((e.ctrlKey || e.metaKey) && ['c','v','x','u','p','s'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      toast('❌ Keyboard shortcuts disabled.', 'err');
    }
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i','j'].includes(e.key.toLowerCase()))) {
      e.preventDefault();
    }
  }, true);
  document.addEventListener('contextmenu', e => { if (ST.running) e.preventDefault(); }, true);
}

function recordViolation(reason) {
  ST.violations++;
  logEvent('violation', { reason, count: ST.violations });
  setProc('pc-focus', 'warn', '👁 Focus: ⚠️ Lost');
  setProc('pc-viol', ST.violations >= 2 ? 'err' : 'warn', `⚠️ Violations: ${ST.violations}`);

  const banner = g('cheat-screen');
  if (!banner) return;
  g('viol-msg').textContent = reason + '.';
  const rem = 3 - ST.violations;
  g('viol-sub').textContent = rem > 0
    ? `This violation has been recorded. ${rem} more will terminate the interview.`
    : 'Interview is being terminated now.';
  banner.classList.add('show');

  if (ST.violations >= 3) {
    setTimeout(() => { banner.classList.remove('show'); terminate(); }, 2500);
  }
}

function dismissViol() {
  g('cheat-screen').classList.remove('show');
  setProc('pc-focus', 'ok', '👁 Focus: Active');
}

function terminate() {
  stopInterview();
  alert('🚫 Interview terminated: too many violations recorded.');
  buildReport(true);
}

/* ─── REPORT ─────────────────────────────────────────────── */
async function buildReport(terminated) {
  const users    = getUsers();
  const u        = users[ST.user] || { name: ST.name || ST.user };
  const answered = ST.answers.filter(a => a && !a.startsWith('[No') && a !== '[Skipped]').length;
  const skipped  = ST.answers.filter(a => a === '[Skipped]').length;
  const total    = ST.questions.length;
  const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;
  const elapsed  = Math.round((ST.secsTotal - ST.secsLeft) / 60);
  const label    = ST.mode === 'technical' ? '💻 Technical Interview' : '🤝 HR Interview';
  const color    = ST.mode === 'technical' ? '#6366f1' : '#f43f5e';
  const dateStr  = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  g('rep-title').textContent = `${label} Report`;
  g('rep-sub').textContent   = `${dateStr} · ${elapsed} min · ${u.name}`;

  g('rep-stats').innerHTML = [
    { v: `${answered}/${total}`, l: 'Answered',  c: color },
    { v: `${pct}%`,              l: 'Completion', c: '#10b981' },
    { v: `${skipped}`,           l: 'Skipped',    c: '#f59e0b' },
    { v: `${ST.violations}`,     l: 'Violations', c: '#f43f5e' },
    { v: `${elapsed}m`,          l: 'Duration',   c: '#94a3b8' },
  ].map(s => `<div class="rep-stat"><div class="rs-val" style="color:${s.c}">${s.v}</div><div class="rs-lbl">${s.l}</div></div>`).join('');

  g('rep-qa').innerHTML = ST.questions.map((q, i) => {
    const ans      = ST.answers[i] || '[Not answered]';
    const isBlank  = ans.startsWith('[No') || ans === '[Not answered]';
    const isSkipped= ans === '[Skipped]';
    const badge    = isSkipped  ? `<span style="color:#f59e0b">(Skipped)</span>`
                   : isBlank    ? `<span style="color:#f43f5e">(Not answered)</span>`
                   : `<span style="color:#10b981">(Answered)</span>`;
    return `<div class="qa-card">
      <div class="qc-badge">Q${i+1} ${badge}</div>
      <div class="qc-q">${q.q}</div>
      <div class="qc-ans-label">Your Response</div>
      <div class="qc-ans" style="font-style:${isBlank||isSkipped?'italic':'normal'};color:${isBlank||isSkipped?'#64748b':'#cbd5e1'}">${ans}</div>
    </div>`;
  }).join('');

  const summary = terminated
    ? `⚠️ Interview terminated after ${ST.violations} malpractice violations. ${answered}/${total} questions answered.`
    : pct >= 80
      ? `✅ Excellent — ${pct}% completion. ${answered}/${total} questions answered in ${elapsed} minutes.${ST.violations ? ` ${ST.violations} violation(s) noted.` : ' No violations — clean session.'}`
      : pct >= 50
        ? `📊 ${pct}% completion. ${answered}/${total} answered. Focus on time management and fuller answers next time.`
        : `📉 ${pct}% completion. Only ${answered}/${total} answered. Practice speaking confidently and concisely to improve your score.`;

  g('rep-summary').textContent = summary;

  // Finalize the session server-side: this asks the real Claude API to
  // generate a structured evaluation of the full transcript and stores
  // it (with the tracking timeline) for the Admin Dashboard.
  if (ST.sessionId) {
    try {
      const res = await fetch('/api/interview?action=complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ sessionId: ST.sessionId, terminated: !!terminated }),
      });
      const data = await res.json();
      if (res.ok && data.report && data.report.summary) {
        const scoreTxt = data.report.overall_score != null ? ` (AI score: ${data.report.overall_score}/100)` : '';
        g('rep-summary').textContent = data.report.summary + scoreTxt;
      }
    } catch (e) { /* local report above still stands */ }
  }

  // Persist result locally too, for the "My Reports" view on this device
  try {
    const res = JSON.parse(localStorage.getItem('cs_ai_results') || '[]');
    res.push({ user: ST.user, name: u.name, mode: ST.mode, answered, total, pct, violations: ST.violations, elapsed, terminated, date: new Date().toISOString() });
    localStorage.setItem('cs_ai_results', JSON.stringify(res));
  } catch(e) {}

  showPanel('report');
}

/* ─── DOWNLOAD PDF ───────────────────────────────────────── */
function downloadPDF() {
  const users   = getUsers();
  const u       = users[ST.user] || { name: ST.name || ST.user };
  const answered= ST.answers.filter(a => a && !a.startsWith('[No') && a !== '[Skipped]').length;
  const total   = ST.questions.length;
  const pct     = Math.round((answered / total) * 100);
  const elapsed = Math.round((ST.secsTotal - ST.secsLeft) / 60);
  const label   = ST.mode === 'technical' ? 'Technical Interview' : 'HR Interview';
  const color   = ST.mode === 'technical' ? '#6366f1' : '#f43f5e';
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const rID     = 'AI-' + Date.now().toString(36).toUpperCase();

  const qaHTML = ST.questions.map((q, i) => {
    const ans     = ST.answers[i] || '[No answer]';
    const isBlank = ans.startsWith('[No') || ans === '[Skipped]';
    return `<div style="margin-bottom:16px;padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0">
      <div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">QUESTION ${i+1} / ${total}</div>
      <div style="font-family:'Sora',sans-serif;font-weight:700;font-size:14px;color:#0f172a;margin-bottom:9px;line-height:1.5">${q.q}</div>
      <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">CANDIDATE RESPONSE</div>
      <div style="font-size:13px;color:${isBlank?'#94a3b8':'#334155'};padding:9px 13px;background:#fff;border-radius:7px;border:1px solid #e2e8f0;line-height:1.7;font-style:${isBlank?'italic':''}">${ans}</div>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>${label} Report – ${u.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#f8fafc;color:#0f172a;padding:24px}.w{max-width:800px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}.hdr{background:linear-gradient(135deg,#0B3D91,#1565C0);padding:28px 34px;color:#fff}.hdr h1{font-family:'Sora',sans-serif;font-size:20px;font-weight:800}.hdr p{opacity:.75;font-size:12px;margin-top:4px}.tag{display:inline-block;background:${color};color:#fff;padding:3px 14px;border-radius:99px;font-weight:800;font-size:12px;margin-top:8px;font-family:'Sora',sans-serif}.stats{display:grid;grid-template-columns:repeat(5,1fr);border-bottom:1px solid #e2e8f0}.sc{padding:14px;text-align:center;border-right:1px solid #e2e8f0}.sc:last-child{border-right:none}.sv{font-family:'Sora',sans-serif;font-weight:800;font-size:20px;color:${color}}.sl{font-size:10px;color:#94a3b8;margin-top:2px}.sec{padding:22px 34px;border-bottom:1px solid #e2e8f0}.sec h3{font-family:'Sora',sans-serif;font-weight:700;font-size:12px;color:#0B3D91;margin-bottom:12px;text-transform:uppercase;letter-spacing:.5px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:9px}.mi{background:#f8fafc;border-radius:7px;padding:10px 13px;border:1px solid #e2e8f0}.mi label{font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;font-weight:700}.mi span{display:block;font-weight:700;font-size:13px;margin-top:2px}.ftr{padding:16px 34px;background:#f8fafc;text-align:center;font-size:11px;color:#94a3b8}@media print{body{padding:0}.w{box-shadow:none;border-radius:0}}</style>
  </head><body><div class="w">
  <div class="hdr"><h1>CareerSadhana — AI Interview Report</h1><p>Voice-Based Mock Interview · ${dateStr}</p><span class="tag">${label}</span></div>
  <div class="stats">
    <div class="sc"><div class="sv">${answered}/${total}</div><div class="sl">Answered</div></div>
    <div class="sc"><div class="sv">${pct}%</div><div class="sl">Completion</div></div>
    <div class="sc"><div class="sv">${ST.answers.filter(a=>a==='[Skipped]').length}</div><div class="sl">Skipped</div></div>
    <div class="sc"><div class="sv">${ST.violations}</div><div class="sl">Violations</div></div>
    <div class="sc"><div class="sv">${elapsed}m</div><div class="sl">Duration</div></div>
  </div>
  <div class="sec"><h3>Candidate</h3><div class="meta">
    <div class="mi"><label>Name</label><span>${u.name}</span></div>
    <div class="mi"><label>Email</label><span>${ST.user}</span></div>
    <div class="mi"><label>Interview Type</label><span>${label}</span></div>
    <div class="mi"><label>Date</label><span>${dateStr}</span></div>
    <div class="mi"><label>Duration</label><span>${elapsed} minutes</span></div>
    <div class="mi"><label>Report ID</label><span>${rID}</span></div>
    <div class="mi"><label>Proctoring</label><span>${ST.violations === 0 ? '✅ Clean' : '⚠️ ' + ST.violations + ' violation(s)'}</span></div>
    <div class="mi"><label>Completion</label><span>${pct}%</span></div>
  </div></div>
  <div class="sec"><h3>Question & Answer Transcript</h3>${qaHTML}</div>
  <div class="ftr"><p><strong>CareerSadhana</strong> — AI Interview Simulator · Generated on ${new Date().toLocaleString('en-IN')}</p><p style="margin-top:3px">All responses captured via voice recognition during live mock interview session.</p></div>
  </div><script>window.onload=()=>setTimeout(()=>window.print(),600);<\/script></body></html>`;

  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); }
  else toast('⚠️ Allow pop-ups for this site.', 'warn');
}

function newInterview() {
  ST.questions = []; ST.answers = []; ST.curQ = 0; ST.violations = 0;
  showPanel('setup');
}

/* ─── FORGOT PASSWORD / OTP ──────────────────────────────── */
function openForgot() {
  otpCode = ''; otpEmail = '';
  ['fp-e1','fp-e2','fp-e3'].forEach(id => { const el = g(id); if(el) el.textContent = ''; });
  g('fp-email').value = '';
  const np = g('fp-np'), cp = g('fp-cp');
  if (np) np.value = ''; if (cp) cp.value = '';
  g('fp-step1').style.display = 'block';
  g('fp-step2').style.display = 'none';
  g('fp-step3').style.display = 'none';
  g('modal-forgot').classList.add('open');
  setTimeout(() => g('fp-email')?.focus(), 100);
}

function closeForgot() {
  g('modal-forgot').classList.remove('open');
}

function sendOTP() {
  const email = (g('fp-email').value || '').trim().toLowerCase();
  g('fp-e1').textContent = '';
  if (!email) { g('fp-e1').textContent = 'Enter your email address.'; return; }
  const users = getUsers();
  if (!users[email]) { g('fp-e1').textContent = '❌ User not found. Check your email address.'; return; }

  otpEmail = email;
  otpCode  = String(Math.floor(100000 + Math.random() * 900000));

  emailjs.send(EJS_SERVICE, EJS_OTP_TPL, {
    to_email: email,
    to_name:  users[email].name || email,
    otp_code: otpCode,
    from_name:'CareerSadhana',
  }).then(() => toast('✅ OTP sent to ' + email, 'ok'))
    .catch(() => {
      console.info('[DEV] OTP for', email, ':', otpCode);
      toast('OTP generated — check browser console in dev mode.', 'warn');
    });

  g('fp-sent').textContent = email;
  g('fp-step1').style.display = 'none';
  g('fp-step2').style.display = 'block';
  [0,1,2,3,4,5].forEach(i => { const d = g(`od${i}`); if(d) d.value = ''; });
  setTimeout(() => g('od0')?.focus(), 100);
}

function otpFwd(idx, inp) {
  inp.value = inp.value.replace(/\D/g, '');
  if (inp.value && idx < 5) g(`od${idx + 1}`)?.focus();
}

function otpBk(idx, e) {
  if (e.key === 'Backspace' && !g(`od${idx}`)?.value && idx > 0) g(`od${idx - 1}`)?.focus();
}

function verifyOTP() {
  const entered = [0,1,2,3,4,5].map(i => g(`od${i}`)?.value || '').join('');
  g('fp-e2').textContent = '';
  if (entered.length < 6)   { g('fp-e2').textContent = 'Enter all 6 digits.'; return; }
  if (entered !== otpCode)  { g('fp-e2').textContent = '❌ Incorrect OTP. Try again.'; return; }
  g('fp-step2').style.display = 'none';
  g('fp-step3').style.display = 'block';
  setTimeout(() => g('fp-np')?.focus(), 100);
}

function doReset() {
  const np = g('fp-np')?.value || '';
  const cp = g('fp-cp')?.value || '';
  g('fp-e3').textContent = '';
  if (np.length < 6) { g('fp-e3').textContent = 'Minimum 6 characters.'; return; }
  if (np !== cp)     { g('fp-e3').textContent = 'Passwords do not match.'; return; }
  const users = getUsers();
  users[otpEmail].passHash = btoa(np);
  saveUsers(users);
  toast('✅ Password reset! You can now sign in.', 'ok');
  closeForgot();
}
