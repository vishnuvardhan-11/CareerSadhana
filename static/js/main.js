// ================================================================
// CareerSadhana – main.js  (shared utilities)
// ================================================================

// Mobile nav toggle
function toggleMobileMenu() {
  document.getElementById('nav-links').classList.toggle('open');
}

// Close nav on outside click
document.addEventListener('click', function(e) {
  const nav = document.getElementById('nav-links');
  const ham = document.querySelector('.hamburger');
  if (nav && ham && !nav.contains(e.target) && !ham.contains(e.target)) {
    nav.classList.remove('open');
  }
});

// Smooth reveal on scroll
const observerOpts = { threshold: 0.12 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOpts);

document.querySelectorAll('.feat-card, .step-card, .card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

// Add visible class handler via CSS
const style = document.createElement('style');
style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);

// ── AUTH (localStorage-based for static site) ─────────────────
const AUTH_KEY = 'cs_user';

function getUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); }
  catch(e) { return null; }
}

function saveUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function isLoggedIn() {
  return !!getUser();
}

function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'index.html';
}
