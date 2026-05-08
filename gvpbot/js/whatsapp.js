// ========================
// GVP BOT — WHATSAPP JS
// ========================

let waConnected = true;
let qrTimer = null;
let qrSeconds = 60;

document.addEventListener('DOMContentLoaded', () => {
  animateStats();
  generateQRCode();
  populateLog();
  startLiveCounters();
  updateStatusBar();
});

// ── STATUS BAR ──
function updateStatusBar() {
  const bar = document.getElementById('statusBar');
  if (!bar) return;
  if (waConnected) {
    bar.classList.add('wa-connected');
  } else {
    bar.classList.remove('wa-connected');
  }
}

// ── ANIMATE STATS ──
function animateStats() {
  animateCounter('statMsgs', 1247);
  animateCounter('statLeads', 89);
  animateCounter('lsMsgs', 1247);
  animateCounter('lsRead', 1189);
  animateCounter('lsLeads', 89);
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0, duration = 1500;
  const step = (ts) => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const val = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    el.textContent = val.toLocaleString('pt-BR');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── QR CODE GENERATOR ──
function generateQRCode() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 200;
  const cell = 8;
  const cols = Math.floor(size / cell);

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  // Generate realistic QR pattern
  ctx.fillStyle = '#000000';

  // Random data modules
  const seed = Date.now();
  function rand(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.001) * 43758.5453;
    return n - Math.floor(n);
  }

  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      // Skip finder pattern areas
      if ((r < 8 && c < 8) || (r < 8 && c > cols - 9) || (r > cols - 9 && c < 8)) continue;
      if (rand(r, c) > 0.5) {
        ctx.fillRect(c * cell, r * cell, cell - 1, cell - 1);
      }
    }
  }

  // Finder patterns (top-left, top-right, bottom-left)
  drawFinder(ctx, 0, 0, cell);
  drawFinder(ctx, (cols - 7) * cell, 0, cell);
  drawFinder(ctx, 0, (cols - 7) * cell, cell);

  // Timing patterns
  ctx.fillStyle = '#000000';
  for (let i = 8; i < cols - 8; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(i * cell, 6 * cell, cell - 1, cell - 1);
      ctx.fillRect(6 * cell, i * cell, cell - 1, cell - 1);
    }
  }
}

function drawFinder(ctx, x, y, cell) {
  // Outer square (7x7 black)
  ctx.fillStyle = '#000000';
  ctx.fillRect(x, y, 7 * cell, 7 * cell);
  // Inner white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + cell, y + cell, 5 * cell, 5 * cell);
  // Inner black (3x3)
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell);
}

// ── QR TIMER ──
function startQRTimer() {
  qrSeconds = 60;
  const timerEl = document.getElementById('timerCount');
  const circle = document.getElementById('timerCircle');
  const total = 113; // 2π*18

  clearInterval(qrTimer);
  qrTimer = setInterval(() => {
    qrSeconds--;
    if (timerEl) timerEl.textContent = qrSeconds;
    if (circle) circle.style.strokeDashoffset = total - (total * qrSeconds / 60);
    if (qrSeconds <= 0) {
      clearInterval(qrTimer);
      refreshQR();
    }
  }, 1000);
}

// ── SHOW QR ──
function showQRCode() {
  document.getElementById('connectedState').style.display = 'none';
  document.getElementById('disconnectedState').style.display = 'none';
  document.getElementById('qrState').style.display = 'block';
  document.getElementById('qrBadge').textContent = 'Aguardando scan';
  document.getElementById('qrBadge').className = 'card-badge disconnected';
  generateQRCode();
  startQRTimer();
}

// ── REFRESH QR ──
function refreshQR() {
  const wrapper = document.getElementById('qrWrapper');
  wrapper.style.opacity = '0.3';
  wrapper.style.transform = 'scale(0.95)';
  setTimeout(() => {
    generateQRCode();
    wrapper.style.opacity = '1';
    wrapper.style.transform = 'scale(1)';
    wrapper.style.transition = 'all .4s ease';
    startQRTimer();
  }, 600);
}

// ── SIMULATE CONNECT ──
function simulateConnect() {
  const btn = document.querySelector('#qrState .btn-wa-primary');
  const text = document.getElementById('connectBtnText');
  const loader = document.getElementById('connectLoader');
  if (text) text.style.display = 'none';
  if (loader) loader.style.display = 'block';
  btn.style.pointerEvents = 'none';

  clearInterval(qrTimer);

  setTimeout(() => {
    waConnected = true;
    document.getElementById('qrState').style.display = 'none';
    document.getElementById('disconnectedState').style.display = 'none';
    document.getElementById('connectedState').style.display = 'flex';
    document.getElementById('qrBadge').textContent = 'Conectado';
    document.getElementById('qrBadge').className = 'card-badge connected';
    document.getElementById('statusLabel').textContent = '● Conectado';
    document.getElementById('statusLabel').className = 'csb-status connected';
    document.getElementById('statusBar').classList.add('wa-connected');

    if (text) text.style.display = 'block';
    if (loader) loader.style.display = 'none';
    btn.style.pointerEvents = '';

    addLogItem('✅', '<strong>WhatsApp conectado</strong> com sucesso via QR Code', 'agora', 'sys');
  }, 2500);
}

// ── DISCONNECT ──
function disconnectWA() {
  if (!confirm('Tem certeza que deseja desconectar o WhatsApp?')) return;
  waConnected = false;

  // Animate out
  document.getElementById('statusBar').style.opacity = '0.5';
  setTimeout(() => {
    document.getElementById('connectedState').style.display = 'none';
    document.getElementById('qrState').style.display = 'none';
    document.getElementById('disconnectedState').style.display = 'flex';
    document.getElementById('qrBadge').textContent = 'Desconectado';
    document.getElementById('qrBadge').className = 'card-badge disconnected';
    document.getElementById('statusLabel').textContent = '● Desconectado';
    document.getElementById('statusLabel').className = 'csb-status disconnected';
    document.getElementById('statusBar').classList.remove('wa-connected');
    document.getElementById('statusBar').style.opacity = '1';
    document.getElementById('pulseLabel').textContent = 'Bot inativo — reconecte para continuar';

    // Change pulse dot color
    const dot = document.querySelector('.pulse-dot');
    if (dot) dot.style.background = '#EF4444';

    addLogItem('⚠️', '<strong>WhatsApp desconectado</strong> pelo usuário', 'agora', 'sys');
  }, 600);
}

// ── CONFIG TOGGLE ──
function toggleConfig(el) {
  el.classList.toggle('active');
  // Change WA green or ig purple
  if (!el.classList.contains('active')) {
    el.style.background = '';
  }
}

// ── ADD NUMBER ──
function addNumber() {
  const modal = document.getElementById('addModal');
  if (modal) { modal.style.display = 'flex'; modal.style.opacity = '0'; setTimeout(() => modal.style.opacity = '1', 10); }
}
function closeAddModal() {
  const modal = document.getElementById('addModal');
  if (modal) { modal.style.opacity = '0'; setTimeout(() => modal.style.display = 'none', 300); }
}

// ── ACTIVITY LOG ──
const waLogs = [
  { icon: '💬', text: '<strong>Marcela Costa</strong> iniciou uma conversa', time: '22:10', tag: 'msg' },
  { icon: '👥', text: 'Novo lead capturado: <strong>Rafael Santos</strong>', time: '21:45', tag: 'lead' },
  { icon: '💬', text: '<strong>Ana Paula</strong> enviou 3 mensagens', time: '21:30', tag: 'msg' },
  { icon: '✅', text: 'Bot respondeu 45 mensagens automaticamente', time: '21:00', tag: 'sys' },
  { icon: '👥', text: 'Novo lead capturado: <strong>João Ferreira</strong>', time: '20:45', tag: 'lead' },
  { icon: '💬', text: '<strong>Luana Martins</strong> solicitou catálogo', time: '20:30', tag: 'msg' },
  { icon: '⚙️', text: 'Fluxo "Boas-vindas" disparado 12 vezes', time: '20:00', tag: 'sys' },
  { icon: '👥', text: 'Novo lead capturado: <strong>Carlos Eduardo</strong>', time: '19:55', tag: 'lead' },
  { icon: '💬', text: '<strong>Fernanda Lima</strong> agendou uma visita', time: '19:30', tag: 'msg' },
  { icon: '⚙️', text: 'Sessão WhatsApp renovada automaticamente', time: '19:00', tag: 'sys' },
];

function populateLog() {
  const container = document.getElementById('activityLog');
  if (!container) return;
  renderLog(container, waLogs, 'all');
}

function renderLog(container, data, filter) {
  container.innerHTML = '';
  data
    .filter(l => filter === 'all' || l.tag === filter)
    .forEach(l => {
      const div = document.createElement('div');
      div.className = 'log-item';
      div.innerHTML = `
        <span class="log-icon">${l.icon}</span>
        <span class="log-text">${l.text}</span>
        <span class="log-time">${l.time}</span>
        <span class="log-tag tag-${l.tag}">${l.tag === 'msg' ? 'Mensagem' : l.tag === 'lead' ? 'Lead' : 'Sistema'}</span>
      `;
      container.appendChild(div);
    });
}

function addLogItem(icon, text, time, tag) {
  const container = document.getElementById('activityLog');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'log-item';
  div.innerHTML = `
    <span class="log-icon">${icon}</span>
    <span class="log-text">${text}</span>
    <span class="log-time">${time}</span>
    <span class="log-tag tag-${tag}">${tag === 'msg' ? 'Mensagem' : tag === 'lead' ? 'Lead' : 'Sistema'}</span>
  `;
  container.insertBefore(div, container.firstChild);
}

function filterLog(btn, filter) {
  document.querySelectorAll('.cf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const container = document.getElementById('activityLog');
  renderLog(container, waLogs, filter);
}

// ── LIVE COUNTERS ──
function startLiveCounters() {
  let msgs = 1247, leads = 89;
  setInterval(() => {
    if (Math.random() < 0.4) {
      msgs += Math.floor(Math.random() * 3) + 1;
      const el1 = document.getElementById('statMsgs');
      const el2 = document.getElementById('lsMsgs');
      if (el1) { el1.textContent = msgs.toLocaleString('pt-BR'); flash(el1); }
      if (el2) { el2.textContent = msgs.toLocaleString('pt-BR'); flash(el2); }

      // Add to log randomly
      if (Math.random() < 0.3) {
        const names = ['Maria Silva', 'Pedro Costa', 'Julia Alves', 'Lucas Pereira', 'Camila Santos'];
        const name = names[Math.floor(Math.random() * names.length)];
        const time = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
        addLogItem('💬', `<strong>${name}</strong> iniciou uma conversa`, time, 'msg');
      }
    }
  }, 4000);

  setInterval(() => {
    if (Math.random() < 0.25) {
      leads += 1;
      const el1 = document.getElementById('statLeads');
      const el2 = document.getElementById('lsLeads');
      if (el1) { el1.textContent = leads; flash(el1); }
      if (el2) { el2.textContent = leads; flash(el2); }
      const time = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
      addLogItem('👥', `Novo lead capturado automaticamente`, time, 'lead');
    }
  }, 7000);
}

function flash(el) {
  el.style.color = '#25D366';
  el.style.transform = 'scale(1.1)';
  el.style.transition = 'all .3s ease';
  setTimeout(() => { el.style.color = ''; el.style.transform = ''; }, 800);
}
