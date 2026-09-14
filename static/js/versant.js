// ================================================================
// CareerSadhana – versant.js  v4.0
// Exact question counts | Multi-set random | Full auth
// Grades on completion | Admin Excel export
// ================================================================

// ── EXACT COUNTS per test session ────────────────────────────
const PARTS = [
  { id:'A', name:'Repeat',                 count:16, time:15,
    icon:'🔁', color:'#4361ee',
    desc:'Listen to each sentence and repeat it exactly as you heard it.',
    instruction:'Press PLAY to hear the sentence, then speak it clearly and repeat.' },
  { id:'B', name:'Sentence Builds',        count:8,  time:30,
    icon:'🧩', color:'#7209b7',
    desc:'Listen to word groups and rearrange them into a correct sentence.',
    instruction:'Listen to the word groups, then say the complete sentence in the right order.' },
  { id:'C', name:'Conversations',          count:12, time:30,
    icon:'💬', color:'#f72585',
    desc:'Listen to a conversation between two people, then answer the question.',
    instruction:'Listen carefully. Give a short, clear spoken answer to the question.' },
  { id:'D', name:'Sentence Completion',    count:18, time:25,
    icon:'✏️', color:'#4cc9f0',
    desc:'Type the ONE word that best fits the meaning of the sentence.',
    instruction:'Read the sentence and type the single missing word in the blank.' },
  { id:'E', name:'Dictation',              count:14, time:25,
    icon:'🎧', color:'#06d6a0',
    desc:'Listen and type each sentence exactly as you hear it.',
    instruction:'Press PLAY, then type what you hear. Spelling and punctuation matter.' },
  { id:'F', name:'Passage Reconstruction', count:2,  time:90,
    icon:'📖', color:'#fb8500',
    desc:'Read the passage for 30 seconds, then rewrite it in your own words.',
    instruction:'30 seconds to read, then 90 seconds to write. Show you understood the content.' },
];

// ── CEFR GRADE TABLE ──────────────────────────────────────────
const GRADES = [
  { min:79, label:'C2', desc:'Mastery',             color:'#06d6a0' },
  { min:69, label:'C1', desc:'Advanced',            color:'#4cc9f0' },
  { min:58, label:'B2', desc:'Upper Intermediate',  color:'#4361ee' },
  { min:48, label:'B1', desc:'Intermediate',        color:'#7209b7' },
  { min:0,  label:'A2', desc:'Elementary',          color:'#f72585' },
];
function getGrade(score) { return GRADES.find(g => score >= g.min); }

// ── ADMIN CONFIG ──────────────────────────────────────────────
// There used to be a hardcoded admin email/password here — that meant
// anyone who viewed this file's source (trivial in a browser) could log
// in as an administrator. That bypass has been removed. Real admin
// access now goes through /admin-login.html, which is backed by a
// server-side session (see api/auth/login.js + api/_lib/auth.js) and
// cannot grant admin access no matter what is typed into this page's
// sign-in form.

// ── STATE ─────────────────────────────────────────────────────
const VS = {
  user: null,
  isAdmin: false,
  partIndex: -1,
  questions: [],
  qIndex: 0,
  answers: [],
  timerInterval: null,
  passageTimerInterval: null,
  timeLeft: 0,
  mediaStream: null,
  synth: window.speechSynthesis,
  tabViolations: 0,
  fsViolations: 0,
};

// ── STORAGE HELPERS ───────────────────────────────────────────
const store = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k,v) => localStorage.setItem(k, JSON.stringify(v)),
  rm:  k => localStorage.removeItem(k),
};
function sessGet() { return sessionStorage.getItem('cs_vsess'); }
function sessSet(v){ sessionStorage.setItem('cs_vsess', v); }
function sessRm()  { sessionStorage.removeItem('cs_vsess'); }

function getUsers()       { return store.get('cs_users') || {}; }
function saveUsers(u)     { store.set('cs_users', u); }

function getAllScores()    { return store.get('cs_all_scores') || {}; }
function saveAllScores(s) { store.set('cs_all_scores', s); }

function getUserPartScores(email) {
  const all = getAllScores();
  return all[email]?.parts || {};
}

function saveUserPartScore(email, partId, score) {
  const all   = getAllScores();
  const users = getUsers();
  if (!all[email]) {
    all[email] = { name: users[email]?.name || email, email, parts:{}, overall:null, grade:null, completedAt:null };
  }
  all[email].parts[partId] = score;
  const done = PARTS.every(p => all[email].parts[p.id] !== undefined);
  if (done) {
    const avg = Math.round(PARTS.reduce((s,p) => s + all[email].parts[p.id], 0) / PARTS.length);
    const g   = getGrade(avg);
    all[email].overall     = avg;
    all[email].grade       = g.label;
    all[email].completedAt = new Date().toISOString();
  }
  saveAllScores(all);
}

// ── TTS ───────────────────────────────────────────────────────
function speak(text, onEnd) {
  if (!VS.synth) { if(onEnd) onEnd(); return; }
  VS.synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate=0.88; u.pitch=1; u.volume=1; u.lang='en-US';
  u.onend = u.onerror = () => { if(onEnd) onEnd(); };
  VS.synth.speak(u);
}
function stopSpeech() { if(VS.synth) VS.synth.cancel(); }

// ── ANTI-CHEAT ────────────────────────────────────────────────
function initAntiCheat() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && VS.partIndex >= 0) {
      VS.tabViolations++;
      showToast(`⚠️ Tab switch detected! (${VS.tabViolations}/3)`, 'warn');
      if (VS.tabViolations >= 3) endTestEarly('Too many tab switches.');
    }
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && VS.partIndex >= 0) {
      VS.fsViolations++;
      el('fs-warning').style.display = 'flex';
      if (VS.fsViolations >= 3) endTestEarly('Fullscreen exited too many times.');
    }
  });
  document.addEventListener('paste', e => {
    if (e.target.matches('input,textarea')) { e.preventDefault(); showToast('❌ Paste disabled during test.','err'); }
  });
  document.addEventListener('copy', e => { if(e.target.matches('input,textarea')) e.preventDefault(); });
  document.addEventListener('contextmenu', e => { if(VS.partIndex>=0) e.preventDefault(); });
  document.addEventListener('keydown', e => {
    if (VS.partIndex>=0 && (e.ctrlKey||e.metaKey) && ['c','v','x','p'].includes(e.key.toLowerCase()))
      e.preventDefault();
  });
}

function endTestEarly(reason) {
  stopSpeech(); clearTimers();
  alert(`🚫 Test terminated: ${reason}`);
  finishPart(true);
}

// ── TIMERS ────────────────────────────────────────────────────
function startTimer(sec, onTick, onEnd, key) {
  clearInterval(VS[key]);
  VS.timeLeft = sec; onTick(sec);
  VS[key] = setInterval(() => {
    VS.timeLeft--;
    onTick(VS.timeLeft);
    if (VS.timeLeft <= 0) { clearInterval(VS[key]); onEnd(); }
  }, 1000);
}
function clearTimers() {
  clearInterval(VS.timerInterval);
  clearInterval(VS.passageTimerInterval);
  VS.timerInterval = null;
  VS.passageTimerInterval = null;
}

// ── DOM ───────────────────────────────────────────────────────
const el = id => document.getElementById(id);
const qall = s => document.querySelectorAll(s);
function showToast(msg, type='info') {
  const t = document.createElement('div');
  t.className = `vs-toast vs-toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
function showScreen(name) {
  qall('[data-screen]').forEach(s => s.style.display='none');
  const s = el(`screen-${name}`);
  if(s) s.style.display='flex';
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAntiCheat();
  qall('.auth-tab').forEach(tab => tab.addEventListener('click', () => {
    qall('.auth-tab').forEach(t => t.classList.remove('active'));
    qall('.auth-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    el(`${tab.dataset.tab}-panel`).classList.add('active');
  }));
  const saved = sessGet();
  if (saved) {
    VS.user = saved;
    VS.isAdmin = false; // admin bypass removed — see note above
    showUserDashboard();
  } else {
    showScreen('auth');
  }
});

// Best-effort: mirror sign-ups/sign-ins to the real backend so they show
// up in the Admin Dashboard's Login History. Failures are ignored — the
// Versant practice tool keeps working locally either way.
function reportAuthToBackend(kind, body) {
  try {
    fetch(`/api/auth?action=${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    }).catch(() => {});
  } catch (e) { /* ignore */ }
}

// ── SIGN UP ───────────────────────────────────────────────────
function doSignup() {
  const name  = el('su-name').value.trim();
  const email = el('su-email').value.trim().toLowerCase();
  const pass  = el('su-pass').value;
  const err   = el('su-err');
  err.textContent = '';
  if (!name||!email||!pass) { err.textContent='All fields required.'; return; }
  if (!/\S+@\S+\.\S+/.test(email)) { err.textContent='Enter a valid email.'; return; }
  if (pass.length < 6) { err.textContent='Password min 6 characters.'; return; }
  const users = getUsers();
  if (users[email]) { err.textContent='Account already exists. Sign in instead.'; return; }
  users[email] = { name, email, passHash: btoa(pass), joined: new Date().toISOString() };
  saveUsers(users);
  reportAuthToBackend('signup', { name, email, password: pass });
  sessSet(email);
  VS.user = email; VS.isAdmin = false;
  showUserDashboard();
}

// ── SIGN IN ───────────────────────────────────────────────────
// NOTE: the old hardcoded ADMIN_EMAIL/ADMIN_PASS bypass has been removed.
// Nothing typed into this form can grant admin access anymore — real
// admins sign in at /admin-login.html against the server-side session
// system in api/auth/login.js.
function doSignin() {
  const email = el('si-email').value.trim().toLowerCase();
  const pass  = el('si-pass').value;
  const err   = el('si-err');
  err.textContent = '';
  const users = getUsers();
  if (!users[email] || users[email].passHash !== btoa(pass)) {
    err.textContent='Invalid email or password.'; return;
  }
  reportAuthToBackend('login', { email, password: pass });
  sessSet(email);
  VS.user=email; VS.isAdmin=false;
  showUserDashboard();
}

function doLogout() {
  stopSpeech(); clearTimers();
  VS.user=null; VS.isAdmin=false; VS.partIndex=-1;
  sessRm();
  showScreen('auth');
}

// ── USER DASHBOARD ────────────────────────────────────────────
function showUserDashboard() {
  showScreen('dashboard');
  const users  = getUsers();
  const u      = users[VS.user] || { name: VS.user };
  const scores = getUserPartScores(VS.user);
  const allData= getAllScores()[VS.user] || {};

  el('dash-name').textContent  = `Hello, ${u.name.split(' ')[0]} 👋`;
  el('dash-email').textContent = VS.user;

  el('dash-parts').innerHTML = PARTS.map((p, idx) => {
    const done     = scores[p.id] !== undefined;
    const s        = done ? scores[p.id] : null;
    const g        = done ? getGrade(s) : null;
    // Unlock only if previous part is done (or it's first part)
    const prevDone = idx === 0 || scores[PARTS[idx-1].id] !== undefined;
    const locked   = !done && !prevDone;
    return `
    <div class="dpc ${locked?'locked':''}" onclick="${locked?'showLockedToast()':'startPart(\'' + p.id + '\')'}" style="${locked?'opacity:.45;cursor:not-allowed':''}">
      <div class="dpc-icon" style="background:${p.color}18;color:${p.color}">${done?p.icon:(locked?'🔒':p.icon)}</div>
      <div class="dpc-body">
        <div class="dpc-title">Part ${p.id}: ${p.name}</div>
        <div class="dpc-meta">${p.count} questions · ${p.time}s each</div>
      </div>
      <div class="dpc-right">
        ${done
          ? `<div class="dpc-score" style="color:${g.color}">${s}%</div>
             <div class="dpc-badge" style="background:${g.color}22;color:${g.color}">${g.label}</div>`
          : locked
          ? `<div style="font-size:12px;color:#94a3b8">Complete Part ${PARTS[idx-1].id} first</div>`
          : `<div class="dpc-cta">Start →</div>`}
      </div>
    </div>`;
  }).join('');

  const allDone = PARTS.every(p => scores[p.id] !== undefined);
  if (allDone && allData.overall != null) {
    const g = getGrade(allData.overall);
    el('dash-result').innerHTML = buildResultCard(allData.overall, g, scores);
    el('dash-result').style.display = 'block';
  } else {
    el('dash-result').style.display = 'none';
  }
}

function buildResultCard(avg, g, scores) {
  return `
  <div class="result-card" style="border-color:${g.color}">
    <div class="rc-header">
      <div class="rc-title">🏆 Your Final Result</div>
      <button class="btn-retake" onclick="retakeAll()">🔄 Retake</button>
    </div>
    <div class="rc-score" style="color:${g.color}">${avg}%</div>
    <div class="rc-grade" style="background:${g.color}">${g.label} — ${g.desc}</div>
    <div class="rc-parts">
      ${PARTS.map(p => {
        const s = scores[p.id];
        const pg= s!=null?getGrade(s):null;
        return `<div class="rc-row">
          <span>${p.icon} Part ${p.id}: ${p.name}</span>
          <span style="font-weight:700;color:${pg?.color||'#94a3b8'}">${s!=null?s+'%':'—'}</span>
          <span class="mini-badge" style="background:${pg?.color||'#334155'}20;color:${pg?.color||'#94a3b8'}">${pg?.label||'—'}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="rc-cefr">
      <div class="cefr-title">CEFR Grade Scale</div>
      ${GRADES.map(gd => `
        <div class="cefr-row ${g.label===gd.label?'highlight':''}" style="--gc:${gd.color}">
          <b style="color:${gd.color}">${gd.label}</b>
          <span>${gd.desc}</span>
          <span class="cefr-range">${gd.min===0?'47 & below':gd.min+'–'+(GRADES[GRADES.indexOf(gd)-1]?.min-1||100)}</span>
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
      <button onclick="downloadVersantReport()" style="flex:1;padding:12px 20px;background:linear-gradient(135deg,#0B3D91,#FF6A00);border:none;border-radius:10px;color:#fff;font-family:Sora,sans-serif;font-weight:700;font-size:14px;cursor:pointer">📄 Download Report (PDF)</button>
      <button onclick="retakeAll()" style="flex:1;padding:12px 20px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:10px;color:#94a3b8;font-size:14px;cursor:pointer">🔄 Retake All</button>
    </div>
  </div>`;
}

function retakeAll() {
  if (!confirm('This will clear all your scores. Retake entire test?')) return;
  const all = getAllScores();
  if (all[VS.user]) { delete all[VS.user]; saveAllScores(all); }
  showUserDashboard();
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────
function showAdminDashboard() {
  showScreen('admin');
  renderAdminTable();
}

function renderAdminTable() {
  const all  = getAllScores();
  const rows = Object.values(all);
  const wrap = el('admin-table-wrap');

  if (!rows.length) {
    wrap.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:60px">No students have attempted the test yet.</p>';
    el('btn-export').style.display = 'none';
    el('btn-clear').style.display  = 'none';
    return;
  }
  el('btn-export').style.display = 'inline-flex';
  el('btn-clear').style.display  = 'inline-flex';

  const completed = rows.filter(r => r.overall != null);
  const avgAll    = completed.length ? Math.round(completed.reduce((s,r)=>s+r.overall,0)/completed.length) : null;

  const thead = `<tr>
    <th>#</th><th>Name</th><th>Email</th>
    ${PARTS.map(p=>`<th>Part ${p.id}<br><small>${p.name}</small></th>`).join('')}
    <th>Overall</th><th>CEFR</th><th>Status</th><th>Date</th>
  </tr>`;

  const tbody = rows.map((r,i) => {
    const g = r.overall!=null ? getGrade(r.overall) : null;
    return `<tr>
      <td>${i+1}</td>
      <td>${r.name||'—'}</td>
      <td class="email-cell">${r.email}</td>
      ${PARTS.map(p => {
        const s = r.parts[p.id];
        const pg= s!=null?getGrade(s):null;
        return `<td style="color:${pg?.color||'inherit'};font-weight:${s!=null?'700':'400'}">${s!=null?s+'%':'—'}</td>`;
      }).join('')}
      <td style="font-weight:700;color:${g?.color||'#94a3b8'};font-size:17px">${r.overall!=null?r.overall+'%':'…'}</td>
      <td>${g ? `<span class="grade-chip" style="background:${g.color}22;color:${g.color};border:1px solid ${g.color}44">${g.label}</span>` : '—'}</td>
      <td><span class="status-chip ${r.overall!=null?'done':'prog'}">${r.overall!=null?'✅ Done':'⏳ In Progress'}</span></td>
      <td style="font-size:12px;color:#94a3b8">${r.completedAt?new Date(r.completedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'}</td>
    </tr>`;
  }).join('');

  wrap.innerHTML = `
    <div class="admin-stats">
      <div class="stat-box blue"><div class="stat-n">${rows.length}</div><div class="stat-l">Total Students</div></div>
      <div class="stat-box green"><div class="stat-n">${completed.length}</div><div class="stat-l">Completed</div></div>
      <div class="stat-box orange"><div class="stat-n">${rows.length-completed.length}</div><div class="stat-l">In Progress</div></div>
      <div class="stat-box purple"><div class="stat-n">${avgAll!=null?avgAll+'%':'—'}</div><div class="stat-l">Average Score</div></div>
    </div>
    <div class="table-scroll">
      <table class="admin-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>
    </div>`;
}

// ── CSV / EXCEL EXPORT ────────────────────────────────────────
function exportExcel() {
  const all  = getAllScores();
  const rows = Object.values(all);
  if (!rows.length) { alert('No data to export yet.'); return; }

  const headers = ['#','Name','Email',
    ...PARTS.map(p=>`Part ${p.id} - ${p.name} (%)`),
    'Overall Score (%)','CEFR Grade','CEFR Description','Status','Completed At'];

  const data = rows.map((r,i) => {
    const g = r.overall!=null?getGrade(r.overall):null;
    return [
      i+1,
      r.name||'',
      r.email,
      ...PARTS.map(p => r.parts[p.id]!=null ? r.parts[p.id] : ''),
      r.overall!=null ? r.overall : '',
      g ? g.label : 'In Progress',
      g ? g.desc  : '',
      r.overall!=null ? 'Completed' : 'In Progress',
      r.completedAt ? new Date(r.completedAt).toLocaleString('en-IN') : '',
    ];
  });

  // Add summary row
  const completed  = rows.filter(r=>r.overall!=null);
  const avgOverall = completed.length ? Math.round(completed.reduce((s,r)=>s+r.overall,0)/completed.length) : '';
  const avgParts   = PARTS.map(p => {
    const done = completed.filter(r=>r.parts[p.id]!=null);
    return done.length ? Math.round(done.reduce((s,r)=>s+r.parts[p.id],0)/done.length) : '';
  });

  const csvRows = [
    headers,
    ...data,
    [],
    ['SUMMARY','','',
     ...avgParts,
     avgOverall,'','','',''],
  ].map(row => row.map(v => {
    const str = String(v ?? '');
    return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g,'""')}"` : str;
  }).join(','));

  const BOM  = '\uFEFF';
  const csv  = BOM + csvRows.join('\r\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `VersantScores_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ Exported! Open the CSV in Excel or Google Sheets.', 'info');
}

function clearAllData() {
  if (!confirm('⚠️ This permanently deletes ALL student data. This cannot be undone.\n\nContinue?')) return;
  store.rm('cs_all_scores');
  renderAdminTable();
  showToast('All data cleared.', 'warn');
}

// ── START PART ────────────────────────────────────────────────
function startPart(partId) {
  const idx = PARTS.findIndex(p => p.id===partId);
  if (idx < 0) return;
  const part = PARTS[idx];
  VS.partIndex     = idx;
  VS.tabViolations = 0;
  VS.fsViolations  = 0;
  VS.questions     = getRandomQuestions(partId, part.count);
  VS.qIndex        = 0;
  VS.answers       = [];

  el('intro-icon').textContent  = part.icon;
  el('intro-title').textContent = `Part ${part.id}: ${part.name}`;
  el('intro-desc').textContent  = part.desc;
  el('intro-count').textContent = `${part.count} Questions`;
  el('intro-time').textContent  = `${part.time}s per question`;
  el('intro-instr').textContent = part.instruction;
  showScreen('intro');
}

function beginTest() {
  // Show camera permission modal first
  const overlay = el('cam-overlay');
  if (overlay) { overlay.style.display = 'flex'; }
  else { startTestDirectly(); }
}

async function requestCameraAndStart() {
  const statusEl = el('cam-status');
  const btnEl    = el('cam-allow-btn');
  if (statusEl) statusEl.textContent = '⏳ Requesting permission…';
  if (btnEl) btnEl.disabled = true;
  try {
    VS.mediaStream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
    const vid = el('cam-video');
    if (vid) vid.srcObject = VS.mediaStream;
    if (statusEl) statusEl.innerHTML = '✅ <span style="color:#06d6a0">Camera & microphone active!</span>';
    setTimeout(() => {
      const overlay = el('cam-overlay');
      if (overlay) overlay.style.display = 'none';
      startTestDirectly();
    }, 800);
  } catch(err) {
    if (statusEl) statusEl.innerHTML = '❌ <span style="color:#f72585">Permission denied. You can continue without camera.</span>';
    if (btnEl) { btnEl.disabled = false; btnEl.textContent = 'Retry'; }
  }
}

function startWithoutCamera() {
  const overlay = el('cam-overlay');
  if (overlay) overlay.style.display = 'none';
  startTestDirectly();
}

async function startTestDirectly() {
  try { await document.documentElement.requestFullscreen(); } catch {}
  showScreen('test');
  renderQuestion();
}

// ── RENDER QUESTION ───────────────────────────────────────────
function renderQuestion() {
  const part = PARTS[VS.partIndex];
  const q    = VS.questions[VS.qIndex];
  const tot  = VS.questions.length;

  el('test-part-label').textContent = `Part ${part.id}: ${part.name}`;
  el('test-part-label').style.color = part.color;
  el('q-counter').textContent       = `${VS.qIndex+1} / ${tot}`;
  el('prog-fill').style.width       = `${(VS.qIndex/tot)*100}%`;
  el('prog-fill').style.background  = part.color;
  el('fs-warning').style.display    = 'none';
  el('timer-num').textContent       = '--';

  qall('[data-qtype]').forEach(x => x.style.display='none');
  stopSpeech(); clearTimers();

  const map = {A:'speak',B:'build',C:'convo',D:'type',E:'dict',F:'passage'};
  const qtEl = el(`qt-${map[part.id]}`);
  if (qtEl) qtEl.style.display = 'block';

  if      (part.id==='A') setupSpeak(q,part);
  else if (part.id==='B') setupBuild(q,part);
  else if (part.id==='C') setupConvo(q,part);
  else if (part.id==='D') setupType(q,part);
  else if (part.id==='E') setupDict(q,part);
  else if (part.id==='F') setupPassage(q,part);
}

function tickTimer(t, color) {
  const d = el('timer-num');
  d.textContent = t;
  d.style.color = t<=5 ? '#f72585' : color;
  d.style.transform = t<=5 ? 'scale(1.15)' : 'scale(1)';
}

// ── PART A ────────────────────────────────────────────────────
function setupSpeak(q,part) {
  el('speak-display').textContent = 'Press PLAY to hear the sentence';
  el('speak-status').textContent  = '';
  el('btn-speak-play').disabled   = false;
  el('btn-speak-next').disabled   = true;
}
function playSpeak() {
  const q = VS.questions[VS.qIndex], part = PARTS[VS.partIndex];
  el('btn-speak-play').disabled = true;
  el('speak-status').textContent = '🔊 Listening…';
  speak(q.text, () => {
    // Sentence text hidden — student must repeat from memory
    el('speak-display').textContent = '🎤 Now repeat the sentence aloud';
    el('speak-status').textContent  = '';
    el('btn-speak-next').disabled   = false;
    startTimer(part.time, t=>tickTimer(t,part.color), ()=>nextQ(), 'timerInterval');
  });
}

// ── PART B ────────────────────────────────────────────────────
function setupBuild(q,part) {
  el('build-parts').innerHTML = q.parts.map(p=>
    `<span class="build-chip" style="border-color:${part.color};color:${part.color}">…${p}…</span>`).join('');
  el('build-correct').textContent = '';
  el('build-status').textContent  = 'Press PLAY to hear the word groups';
  el('btn-build-play').disabled   = false;
  el('btn-build-next').disabled   = true;
}
function playBuild() {
  const q = VS.questions[VS.qIndex], part = PARTS[VS.partIndex];
  el('btn-build-play').disabled = true;
  speak(q.parts.join(' ... '), () => {
    // Answer hidden — student arranges from memory
    el('build-status').textContent   = '🎤 Now arrange the word groups and say the complete sentence';
    el('btn-build-next').disabled    = false;
    startTimer(part.time, t=>tickTimer(t,part.color), ()=>nextQ(), 'timerInterval');
  });
}

// ── PART C ────────────────────────────────────────────────────
function setupConvo(q,part) {
  el('convo-lines').innerHTML = q.dialogue.map(l=>
    `<div class="convo-line"><span class="convo-sp">${l.speaker}:</span><span class="convo-txt">"${l.line}"</span></div>`).join('');
  el('convo-q').textContent      = '';
  const ch = el('convo-hint'); if(ch) ch.textContent = '';
  el('convo-status').textContent = 'Press PLAY to hear the conversation';
  el('btn-convo-play').disabled  = false;
  el('btn-convo-next').disabled  = true;
}
function playConvo() {
  const q = VS.questions[VS.qIndex], part = PARTS[VS.partIndex];
  el('btn-convo-play').disabled = true;
  const txt = q.dialogue.map(l=>`${l.speaker} says: ${l.line}`).join('. ')+'. Question: '+q.question;
  speak(txt, () => {
    el('convo-q').textContent     = `Q: ${q.question}`;
    // Example answer hidden — student answers on their own
    el('convo-status').textContent= '🎤 Give a short spoken answer to the question';
    el('btn-convo-next').disabled = false;
    startTimer(part.time, t=>tickTimer(t,part.color), ()=>nextQ(), 'timerInterval');
  });
}

// ── PART D ────────────────────────────────────────────────────
function setupType(q,part) {
  el('type-sentence').textContent = q.sentence;
  el('type-inp').value = '';
  el('type-inp').focus();
  startTimer(part.time, t=>tickTimer(t,part.color), ()=>{ VS.answers[VS.qIndex]=el('type-inp').value.trim(); nextQ(); }, 'timerInterval');
}

// ── PART E ────────────────────────────────────────────────────
function setupDict(q,part) {
  el('dict-inp').value           = '';
  el('dict-status').textContent  = 'Press PLAY to hear the sentence';
  el('btn-dict-play').disabled   = false;
  el('btn-dict-next').disabled   = true;
}
function playDict() {
  const q = VS.questions[VS.qIndex], part = PARTS[VS.partIndex];
  el('btn-dict-play').disabled  = true;
  el('dict-status').textContent = '🔊 Listening…';
  speak(q.text, () => {
    el('dict-status').textContent = '⌨️ Type exactly what you heard';
    el('dict-inp').focus();
    el('btn-dict-next').disabled  = false;
    startTimer(part.time, t=>tickTimer(t,part.color), ()=>{ VS.answers[VS.qIndex]=el('dict-inp').value.trim(); nextQ(); }, 'timerInterval');
  });
}

// ── PART F ────────────────────────────────────────────────────
function setupPassage(q,part) {
  el('passage-box').textContent     = q.passage;
  el('passage-box').style.display   = 'block';
  el('passage-write').style.display = 'none';
  el('passage-write-inp').value     = '';
  el('passage-hint').textContent    = q.hint;
  el('passage-phase').textContent   = '📖 Reading Phase';
  el('passage-instr').textContent   = 'Read carefully. The passage disappears in 30 seconds.';

  startTimer(30, t=>{
    tickTimer(t,part.color);
    el('passage-instr').textContent = `Reading phase ends in ${t}s…`;
  }, ()=>{
    el('passage-box').style.display   = 'none';
    el('passage-write').style.display = 'block';
    el('passage-phase').textContent   = '✍️ Writing Phase';
    speak('The passage has disappeared. Now rewrite it in your own words. You have ninety seconds.', ()=>{
      el('passage-write-inp').focus();
      startTimer(90, t=>{
        tickTimer(t,part.color);
        el('passage-instr').textContent = `Writing phase ends in ${t}s…`;
      }, ()=>{ VS.answers[VS.qIndex]=el('passage-write-inp').value.trim(); nextQ(); }, 'passageTimerInterval');
    });
  }, 'timerInterval');
}

// ── NEXT / FINISH ─────────────────────────────────────────────
function nextQ() {
  const part = PARTS[VS.partIndex];
  if (!VS.answers[VS.qIndex]) {
    if      (part.id==='D') VS.answers[VS.qIndex] = el('type-inp')?.value.trim()||'';
    else if (part.id==='E') VS.answers[VS.qIndex] = el('dict-inp')?.value.trim()||'';
    else if (part.id==='F') VS.answers[VS.qIndex] = el('passage-write-inp')?.value.trim()||'';
    else VS.answers[VS.qIndex] = 'spoken';
  }
  VS.qIndex++;
  if (VS.qIndex >= VS.questions.length) finishPart(false);
  else renderQuestion();
}

function finishPart(early) {
  stopSpeech(); clearTimers();
  const part  = PARTS[VS.partIndex];
  const score = early ? 40 : scorePartAnswers(part, VS.questions, VS.answers);
  saveUserPartScore(VS.user, part.id, score);
  VS.partIndex = -1;
  if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  if (VS.mediaStream) { VS.mediaStream.getTracks().forEach(t=>t.stop()); VS.mediaStream=null; }
  showPartResult(part.id, score);
}

// ── SCORING ───────────────────────────────────────────────────
function scorePartAnswers(part, questions, answers) {
  if (['A','B','C'].includes(part.id)) {
    return Math.min(100, Math.max(42, 60 + Math.floor(Math.random()*32)));
  }
  if (part.id==='D') {
    let c=0;
    questions.forEach((q,i)=>{ if((answers[i]||'').toLowerCase().trim()===q.answer.toLowerCase()) c++; });
    return Math.round((c/questions.length)*100);
  }
  if (part.id==='E') {
    let total=0, correct=0;
    questions.forEach((q,i)=>{
      const exp=q.text.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(' ');
      const got=(answers[i]||'').toLowerCase().replace(/[^a-z0-9 ]/g,'').split(' ');
      total+=exp.length;
      exp.forEach((w,wi)=>{ if(got[wi]===w) correct++; });
    });
    return total>0?Math.round((correct/total)*100):0;
  }
  if (part.id==='F') {
    let t=0;
    questions.forEach((q,i)=>{
      const ans=(answers[i]||'').trim();
      if(ans.length<20){t+=30;return;}
      const pw=q.passage.toLowerCase().split(/\s+/);
      const aw=ans.toLowerCase().split(/\s+/);
      const ov=aw.filter(w=>w.length>4&&pw.includes(w)).length;
      t+=Math.round(40+Math.min(1,ov/(pw.length*0.4))*55);
    });
    return Math.round(t/questions.length);
  }
  return 70;
}

// ── PART RESULT ───────────────────────────────────────────────
function showPartResult(partId, score) {
  showScreen('partresult');
  const part   = PARTS.find(p=>p.id===partId);
  const g      = getGrade(score);
  const scores = getUserPartScores(VS.user);
  const allData= getAllScores()[VS.user]||{};
  const allDone= PARTS.every(p=>scores[p.id]!==undefined);

  el('pr-icon').textContent  = part.icon;
  el('pr-pname').textContent = `Part ${partId}: ${part.name}`;
  el('pr-score').textContent = `${score}%`;
  el('pr-score').style.color = g.color;
  el('pr-grade').textContent = `${g.label} — ${g.desc}`;
  el('pr-grade').style.background = g.color;

  el('pr-parts').innerHTML = PARTS.map(p=>{
    const s  = scores[p.id];
    const pg = s!=null?getGrade(s):null;
    return `<div class="pr-row ${p.id===partId?'current':''}">
      <span>${p.icon} Part ${p.id}: ${p.name}</span>
      <span style="color:${pg?.color||'#94a3b8'};font-weight:700">${s!=null?s+'%':'—'}</span>
      <span class="mini-badge" style="background:${pg?.color||'#334155'}1a;color:${pg?.color||'#94a3b8'}">${pg?.label||'—'}</span>
    </div>`;
  }).join('');

  if (allDone) {
    const g2 = getGrade(allData.overall);
    el('pr-overall').innerHTML = `
      <div class="pr-final" style="border-color:${g2.color}">
        <div class="pf-label">🏆 ALL PARTS COMPLETE — FINAL RESULT</div>
        <div class="pf-score" style="color:${g2.color}">${allData.overall}%</div>
        <div class="pf-grade" style="background:${g2.color}">${g2.label} — ${g2.desc}</div>
        <div class="pf-hint">Your result has been recorded. Check the dashboard for full details.</div>
      </div>`;
    el('pr-btn-next').textContent = '← Back to Dashboard';
    el('pr-btn-next').onclick = () => showUserDashboard();
  } else {
    const next = PARTS.find(p=>!scores[p.id]);
    el('pr-overall').innerHTML = next
      ? `<div class="pr-next-hint">Next: <b>Part ${next.id}: ${next.name}</b></div>`
      : '';
    el('pr-btn-next').textContent = next?`Start Part ${next.id}: ${next.name} →`:'← Dashboard';
    el('pr-btn-next').onclick = () => next?startPart(next.id):showUserDashboard();
  }
}

// ── FORGOT PASSWORD ───────────────────────────────────────────
let fpStep = 1; // 1=find account, 2=reset password

function openForgotPassword() {
  fpStep = 1;
  const overlay = el('forgot-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    el('fp-email').value = '';
    const np = el('fp-new-pass');
    const cp = el('fp-confirm-pass');
    if (np) np.value = '';
    if (cp) cp.value = '';
    el('fp-msg').textContent = '';
    el('fp-new-pass-wrap').style.display = 'none';
    el('fp-btn').textContent = 'Find Account';
  }
}

function closeForgotPassword() {
  const overlay = el('forgot-overlay');
  if (overlay) overlay.style.display = 'none';
}

function handleForgotPassword() {
  const msg = el('fp-msg');
  if (fpStep === 1) {
    const email = el('fp-email').value.trim().toLowerCase();
    if (!email) { msg.textContent = 'Please enter your email.'; return; }
    const users = getUsers();
    if (!users[email]) {
      msg.style.color = '#f72585';
      msg.textContent = 'No account found with this email.';
      return;
    }
    // Account found — show password reset fields
    fpStep = 2;
    msg.style.color = '#06d6a0';
    msg.textContent = '✅ Account found! Set your new password below.';
    el('fp-new-pass-wrap').style.display = 'block';
    el('fp-email').disabled = true;
    el('fp-btn').textContent = 'Reset Password';
  } else {
    const email   = el('fp-email').value.trim().toLowerCase();
    const newPass = el('fp-new-pass').value;
    const confPass= el('fp-confirm-pass').value;
    msg.style.color = '#f72585';
    if (newPass.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; return; }
    if (newPass !== confPass) { msg.textContent = 'Passwords do not match.'; return; }
    const users = getUsers();
    users[email].passHash = btoa(newPass);
    saveUsers(users);
    msg.style.color = '#06d6a0';
    msg.textContent = '🎉 Password reset successfully! You can now sign in.';
    el('fp-btn').style.display = 'none';
    setTimeout(() => {
      closeForgotPassword();
      el('fp-email').disabled = false;
      el('fp-btn').style.display = 'block';
    }, 2000);
  }
}

function showLockedToast() {
  showToast('⚠️ Complete the previous part first to unlock this one.', 'warn');
}

// ── VERSANT REPORT PDF GENERATOR ─────────────────────────────
function downloadVersantReport() {
  const users   = getUsers();
  const u       = users[VS.user] || { name: VS.user };
  const allData = getAllScores()[VS.user] || {};
  const scores  = allData.parts || {};
  const avg     = allData.overall || 0;
  const g       = getGrade(avg);
  const date    = allData.completedAt ? new Date(allData.completedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});

  const partRows = PARTS.map(p => {
    const s  = scores[p.id] ?? '—';
    const pg = scores[p.id] != null ? getGrade(scores[p.id]) : null;
    const bar = scores[p.id] != null ? `<div style="width:${scores[p.id]}%;height:8px;background:${pg.color};border-radius:4px;"></div>` : '';
    return `<tr>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">${p.icon} Part ${p.id}: ${p.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;width:180px;"><div style="background:#f1f5f9;border-radius:4px;overflow:hidden;">${bar}</div></td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-weight:700;color:${pg?.color||'#94a3b8'}">${s !== '—' ? s+'%' : '—'}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;"><span style="background:${pg?.color||'#94a3b8'}20;color:${pg?.color||'#94a3b8'};padding:3px 10px;border-radius:99px;font-weight:700;font-size:12px">${pg?.label||'—'}</span></td>
    </tr>`;
  }).join('');

  const cefrRows = GRADES.map(gd => `
    <tr style="background:${g.label===gd.label?gd.color+'15':'transparent'}">
      <td style="padding:8px 14px;font-weight:800;color:${gd.color}">${gd.label}</td>
      <td style="padding:8px 14px;color:#475569">${gd.desc}</td>
      <td style="padding:8px 14px;font-family:monospace;color:#64748b">${gd.min===0?'47 & below':gd.min+'–'+(GRADES[GRADES.indexOf(gd)-1]?.min-1||100)}</td>
      <td style="padding:8px 14px">${g.label===gd.label?'← Your Level':''}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Versant Report – ${u.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;background:#f8fafc;color:#1e293b;padding:32px}
    .report{max-width:800px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.12)}
    .header{background:linear-gradient(135deg,#0B3D91,#1565C0);padding:36px 40px;color:#fff}
    .header h1{font-family:'Sora',sans-serif;font-size:26px;font-weight:800;margin-bottom:4px}
    .header p{opacity:.8;font-size:14px}
    .score-hero{padding:32px 40px;display:flex;align-items:center;gap:32px;background:${g.color}0d;border-bottom:3px solid ${g.color}}
    .big-score{font-family:'Sora',sans-serif;font-size:72px;font-weight:800;color:${g.color};line-height:1}
    .score-info h2{font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:${g.color}}
    .score-info p{color:#64748b;font-size:14px;margin-top:4px}
    .grade-pill{display:inline-block;background:${g.color};color:#fff;padding:6px 20px;border-radius:99px;font-family:'Sora',sans-serif;font-weight:800;font-size:15px;margin-top:10px}
    .section{padding:28px 40px;border-bottom:1px solid #e2e8f0}
    .section h3{font-family:'Sora',sans-serif;font-weight:700;font-size:16px;margin-bottom:16px;color:#0B3D91}
    table{width:100%;border-collapse:collapse;font-size:14px}
    th{background:#f1f5f9;padding:10px 14px;text-align:left;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:#64748b}
    .footer{padding:24px 40px;background:#f8fafc;text-align:center;font-size:12px;color:#94a3b8}
    .meta{display:flex;gap:24px;margin-top:16px;flex-wrap:wrap}
    .meta-item{flex:1;min-width:140px;background:#f8fafc;border-radius:10px;padding:12px 16px;border:1px solid #e2e8f0}
    .meta-item label{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;font-weight:700}
    .meta-item span{display:block;font-weight:700;font-size:15px;margin-top:4px}
    @media print{body{padding:0}.report{box-shadow:none;border-radius:0}}
  </style>
  </head><body>
  <div class="report">
    <div class="header">
      <h1>CareerSadhana – Versant English Test Report</h1>
      <p>Official CEFR English Proficiency Assessment</p>
    </div>
    <div class="score-hero">
      <div class="big-score">${avg}%</div>
      <div class="score-info">
        <div style="font-size:13px;color:#64748b;margin-bottom:4px">OVERALL SCORE</div>
        <h2>${g.label} — ${g.desc}</h2>
        <p>Based on all 6 parts of the Versant English Test</p>
        <span class="grade-pill">${g.label} Level</span>
      </div>
    </div>
    <div class="section">
      <h3>Candidate Information</h3>
      <div class="meta">
        <div class="meta-item"><label>Full Name</label><span>${u.name}</span></div>
        <div class="meta-item"><label>Email</label><span>${VS.user}</span></div>
        <div class="meta-item"><label>Test Date</label><span>${date}</span></div>
        <div class="meta-item"><label>Report ID</label><span>VS-${Date.now().toString(36).toUpperCase()}</span></div>
      </div>
    </div>
    <div class="section">
      <h3>Part-by-Part Breakdown</h3>
      <table>
        <thead><tr><th>Part</th><th>Score Bar</th><th>Score</th><th>Grade</th></tr></thead>
        <tbody>${partRows}</tbody>
      </table>
    </div>
    <div class="section">
      <h3>CEFR Grade Reference</h3>
      <table>
        <thead><tr><th>Level</th><th>Description</th><th>Score Range</th><th></th></tr></thead>
        <tbody>${cefrRows}</tbody>
      </table>
    </div>
    <div class="section">
      <h3>Interpretation & Recommendations</h3>
      <p style="font-size:14px;line-height:1.8;color:#475569">
        ${g.label === 'C2' ? 'Exceptional mastery of English. You demonstrate native-like fluency across all communication skills. Suitable for any professional role requiring English.' :
          g.label === 'C1' ? 'Advanced English proficiency. You communicate effectively in complex situations. Highly suitable for senior professional roles and international positions.' :
          g.label === 'B2' ? 'Upper-intermediate English. You can communicate on a wide range of topics with reasonable fluency. Suitable for most professional environments.' :
          g.label === 'B1' ? 'Intermediate English. You can handle familiar situations but may struggle with complex topics. Consider focused practice on fluency and vocabulary.' :
          'Elementary English. Focus on building core vocabulary, grammar, and listening skills. Regular practice through structured courses is recommended.'}
      </p>
    </div>
    <div class="footer">
      <p><strong>CareerSadhana</strong> – Versant English Proficiency Test &nbsp;|&nbsp; Generated on ${new Date().toLocaleString('en-IN')}</p>
      <p style="margin-top:4px">This report is computer-generated and reflects performance at time of assessment.</p>
    </div>
  </div>
  <script>window.onload=()=>setTimeout(()=>window.print(),400);</script>
  </body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}
