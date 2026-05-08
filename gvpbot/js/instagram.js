// ========================
// GVP BOT — INSTAGRAM JS
// ========================

let igConnected = true;

document.addEventListener('DOMContentLoaded', () => {
  animateIGStats();
  populateIGLog();
  startIGLiveCounters();
  animateEngagementBars();
  if (igConnected) {
    document.getElementById('igStatusBar').classList.add('ig-connected');
  }
});

// ── ANIMATE STATS ──
function animateIGStats() {
  animateCounter('igFollowers', 12400, 'K');
  animateCounter('igDMs', 47);
  animateCounter('igComments', 163);
}

function animateCounter(id, target, suffix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0, duration = 1600;
  const step = (ts) => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const val = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    if (suffix === 'K') {
      el.textContent = (val / 1000).toFixed(1) + 'K';
    } else {
      el.textContent = val.toLocaleString('pt-BR');
    }
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── ENGAGEMENT BARS ──
function animateEngagementBars() {
  setTimeout(() => {
    document.querySelectorAll('.eng-fill').forEach(bar => {
      const target = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => { bar.style.width = target; }, 100);
    });
  }, 300);
}

// ── CONNECT IG ──
function connectIG() {
  const btn = document.querySelector('.btn-ig-connect');
  const text = document.getElementById('igConnectText');
  const loader = document.getElementById('igConnectLoader');

  if (text) text.style.display = 'none';
  if (loader) loader.style.display = 'block';
  if (btn) btn.style.pointerEvents = 'none';

  // Simulate OAuth flow
  setTimeout(() => {
    igConnected = true;

    document.getElementById('igDisconnectedState').style.display = 'none';
    document.getElementById('igConnectedState').style.display = 'block';
    document.getElementById('igBadge').textContent = 'Ativa';
    document.getElementById('igBadge').className = 'card-badge connected';
    document.getElementById('igStatusLabel').textContent = '● Conectado';
    document.getElementById('igStatusLabel').className = 'csb-status connected';
    document.getElementById('igStatusBar').classList.add('ig-connected');
    document.getElementById('igDisconnectBtn').style.display = '';

    if (text) text.style.display = '';
    if (loader) loader.style.display = 'none';
    if (btn) btn.style.pointerEvents = '';

    addIGLogItem('✅', '<strong>Instagram conectado</strong> via OAuth Meta Business', 'agora', 'sys');
    animateIGStats();
  }, 2500);
}

// ── DISCONNECT IG ──
function disconnectIG() {
  if (!confirm('Tem certeza que deseja desconectar o Instagram?')) return;
  igConnected = false;

  document.getElementById('igStatusBar').style.opacity = '0.5';
  setTimeout(() => {
    document.getElementById('igConnectedState').style.display = 'none';
    document.getElementById('igDisconnectedState').style.display = 'block';
    document.getElementById('igBadge').textContent = 'Desconectado';
    document.getElementById('igBadge').className = 'card-badge disconnected';
    document.getElementById('igStatusLabel').textContent = '● Desconectado';
    document.getElementById('igStatusLabel').className = 'csb-status disconnected';
    document.getElementById('igStatusBar').classList.remove('ig-connected');
    document.getElementById('igStatusBar').style.opacity = '1';

    addIGLogItem('⚠️', '<strong>Instagram desconectado</strong> pelo usuário', 'agora', 'sys');
  }, 600);
}

// ── SYNC ──
function syncIG() {
  const text = document.getElementById('syncText');
  const loader = document.getElementById('syncLoader');
  if (text) text.style.display = 'none';
  if (loader) loader.style.display = 'block';

  setTimeout(() => {
    if (text) text.style.display = '';
    if (loader) loader.style.display = 'none';
    text.textContent = '✅ Sincronizado!';
    text.style.color = '#22C55E';
    setTimeout(() => { text.textContent = '🔄 Sincronizar dados'; text.style.color = ''; }, 2000);
    addIGLogItem('🔄', 'Dados sincronizados com a <strong>API do Instagram</strong>', 'agora', 'sys');
  }, 2000);
}

// ── REQUEST PERMISSION ──
function requestPerm(el) {
  el.classList.add('loading');
  el.querySelector('.perm-icon').textContent = '⏳';

  setTimeout(() => {
    el.classList.remove('loading', 'pending');
    el.classList.add('granted');
    el.querySelector('.perm-icon').textContent = '✅';
    el.querySelector('.perm-desc').textContent = 'Autorizado';
    el.style.cursor = 'default';
    el.onclick = null;
    addIGLogItem('🔐', `Nova permissão autorizada: <strong>${el.querySelector('.perm-name').textContent}</strong>`, 'agora', 'sys');
  }, 1800);
}

// ── CONFIG TOGGLE ──
function toggleConfig(el) {
  el.classList.toggle('active');
  if (el.classList.contains('active')) {
    el.style.background = 'linear-gradient(135deg, #D6249F, #285AEB)';
  } else {
    el.style.background = '';
  }
}

// ── ACTIVITY LOG ──
const igLogs = [
  { icon: '💬', text: '<strong>@marcela_costa</strong> enviou uma DM: "Oi! Vi no stories..."', time: '22:08', tag: 'dm' },
  { icon: '💬', text: 'Bot respondeu DM de <strong>@rafael.s</strong> automaticamente', time: '22:05', tag: 'dm' },
  { icon: '💭', text: '<strong>@ana.paula</strong> comentou na sua última publicação', time: '21:50', tag: 'comment' },
  { icon: '📸', text: '<strong>@joao.ferreira</strong> mencionou sua conta em um story', time: '21:35', tag: 'story' },
  { icon: '💬', text: 'Novo lead via DM: <strong>@luana_m</strong> — interesse em produto', time: '21:20', tag: 'dm' },
  { icon: '💭', text: 'Bot respondeu 12 comentários automaticamente', time: '21:00', tag: 'comment' },
  { icon: '📸', text: '<strong>@carlos.e</strong> reagiu ao seu story com ❤️', time: '20:45', tag: 'story' },
  { icon: '💬', text: '<strong>@fernanda.lima</strong> enviou DM após ver stories', time: '20:30', tag: 'dm' },
  { icon: '💭', text: 'Comentário moderado: spam removido automaticamente', time: '20:15', tag: 'comment' },
  { icon: '📸', text: '8 pessoas responderam ao story "Promoção do Dia"', time: '20:00', tag: 'story' },
];

function populateIGLog() {
  const container = document.getElementById('igActivityLog');
  if (!container) return;
  renderIGLog(container, igLogs, 'all');
}

function renderIGLog(container, data, filter) {
  container.innerHTML = '';
  const tagMap = { dm: 'DM', comment: 'Comentário', story: 'Story', sys: 'Sistema' };
  data
    .filter(l => filter === 'all' || l.tag === filter)
    .forEach(l => {
      const div = document.createElement('div');
      div.className = 'log-item';
      div.innerHTML = `
        <span class="log-icon">${l.icon}</span>
        <span class="log-text">${l.text}</span>
        <span class="log-time">${l.time}</span>
        <span class="log-tag tag-${l.tag}">${tagMap[l.tag] || l.tag}</span>
      `;
      container.appendChild(div);
    });
}

function addIGLogItem(icon, text, time, tag) {
  const container = document.getElementById('igActivityLog');
  if (!container) return;
  const tagMap = { dm: 'DM', comment: 'Comentário', story: 'Story', sys: 'Sistema' };
  const div = document.createElement('div');
  div.className = 'log-item';
  div.innerHTML = `
    <span class="log-icon">${icon}</span>
    <span class="log-text">${text}</span>
    <span class="log-time">${time}</span>
    <span class="log-tag tag-${tag}">${tagMap[tag] || tag}</span>
  `;
  container.insertBefore(div, container.firstChild);
}

function filterIGLog(btn, filter) {
  document.querySelectorAll('.cf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const container = document.getElementById('igActivityLog');
  renderIGLog(container, igLogs, filter);
}

// ── LIVE COUNTERS ──
function startIGLiveCounters() {
  let dms = 47, comments = 163, followers = 12400;

  setInterval(() => {
    if (Math.random() < 0.35) {
      dms++;
      const el = document.getElementById('igDMs');
      if (el) { el.textContent = dms; igFlash(el); }

      const names = ['@julia.a', '@pedro.c', '@bianca.s', '@thiago.m', '@larissa.o'];
      const n = names[Math.floor(Math.random() * names.length)];
      const time = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
      addIGLogItem('💬', `<strong>${n}</strong> enviou uma nova DM`, time, 'dm');
    }
  }, 5000);

  setInterval(() => {
    if (Math.random() < 0.4) {
      comments += Math.floor(Math.random() * 3) + 1;
      const el = document.getElementById('igComments');
      if (el) { el.textContent = comments; igFlash(el); }
    }
  }, 6000);

  setInterval(() => {
    if (Math.random() < 0.2) {
      followers += Math.floor(Math.random() * 5) + 1;
      const el = document.getElementById('igFollowers');
      if (el) { el.textContent = (followers / 1000).toFixed(1) + 'K'; igFlash(el); }
    }
  }, 10000);
}

function igFlash(el) {
  el.style.color = '#D6249F';
  el.style.transform = 'scale(1.15)';
  el.style.transition = 'all .3s ease';
  setTimeout(() => { el.style.color = ''; el.style.transform = ''; }, 700);
}
