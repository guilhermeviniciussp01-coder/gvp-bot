// ========================
// GVP BOT — MAIN JS
// ========================

// NAVBAR scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// Mobile menu
function toggleMobileMenu() {
  const m = document.getElementById('mobileMenu');
  if (m) m.classList.toggle('open');
}

// FAQ
function toggleFaq(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

// Pricing toggle
let isAnnual = false;
function togglePricing() {
  isAnnual = !isAnnual;
  const knob = document.getElementById('toggleKnob');
  const ml = document.getElementById('toggleMonthly');
  const al = document.getElementById('toggleAnnual');
  if (knob) knob.classList.toggle('annual', isAnnual);
  if (ml) ml.classList.toggle('active', !isAnnual);
  if (al) al.classList.toggle('active', isAnnual);
  document.querySelectorAll('.price-amount').forEach(el => {
    const v = isAnnual ? el.dataset.annual : el.dataset.monthly;
    if (v) {
      el.style.transform = 'scale(0.8)';
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = v;
        el.style.transform = 'scale(1)';
        el.style.opacity = '1';
        el.style.transition = 'all .3s cubic-bezier(.4,0,.2,1)';
      }, 150);
    }
  });
}

// Demo modal
function openDemo() {
  const m = document.getElementById('demoModal');
  if (m) m.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDemo() {
  const m = document.getElementById('demoModal');
  if (m) m.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDemo(); });

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const m = document.getElementById('mobileMenu');
      if (m) m.classList.remove('open');
    }
  });
});

// Scroll animations
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.benefit-card, .testimonial-card, .pricing-card, .step').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  obs.observe(el);
});

// Channel connect
function connectChannel(ch) {
  const btn = event.target;
  btn.textContent = 'Conectando...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✓ Conectado';
    btn.style.background = 'linear-gradient(135deg,#22C55E,#16A34A)';
    const pill = btn.closest('.channel-pill');
    if (pill) {
      pill.classList.add('online');
      const status = pill.querySelector('.pill-status');
      if (status) { status.textContent = '● Conectado'; status.style.color = '#22C55E'; }
    }
  }, 1500);
}

// Open message
function openMessage(el) {
  el.style.background = 'rgba(59,130,246,.08)';
  el.style.borderColor = 'rgba(59,130,246,.3)';
  setTimeout(() => { el.style.background = ''; el.style.borderColor = ''; }, 400);
}

// User dropdown close on outside click
document.addEventListener('click', e => {
  const dd = document.getElementById('userDropdown');
  if (dd && !e.target.closest('.topbar-user')) dd.classList.remove('open');
});

// ── AUTH HELPERS ─────────────────────────────────────────────
// Redireciona para dashboard se já logado (usado na landing/login)
async function redirectIfLoggedIn() {
  try {
    const { data: { session } } = await _sb.auth.getSession();
    if (session) window.location.href = 'dashboard.html';
  } catch(err) {
    console.error('Erro ao verificar sessão:', err);
  }
}

// Logout global
async function logout() {
  await _sb.auth.signOut();
  window.location.href = 'login.html';
}
