// ========================
// GVP BOT — DASHBOARD JS
// ========================

document.addEventListener('DOMContentLoaded', () => {
  animateKPIs();
  initCharts();
  populateLeadsTable();
  startLiveUpdates();
});

// KPI Counter animation
function animateKPIs() {
  const targets = {
    kConversas: { end: 347, suffix: '', decimals: 0 },
    kLeads: { end: 127, suffix: '', decimals: 0 },
    kConversao: { end: 34.7, suffix: '%', decimals: 1 },
    kTempo: { end: 0.3, suffix: 's', decimals: 1 }
  };

  Object.entries(targets).forEach(([id, cfg]) => {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const duration = 1800;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * cfg.end;
      el.textContent = current.toFixed(cfg.decimals) + cfg.suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// Charts
function initCharts() {
  Chart.defaults.color = '#64748B';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';

  // Line chart
  const ctx1 = document.getElementById('conversasChart');
  if (ctx1) {
    window.conversasChart = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
        datasets: [
          {
            label: 'WhatsApp',
            data: [120, 185, 160, 240, 198, 310, 347],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59,130,246,0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#0A0F1E',
            pointBorderWidth: 2,
          },
          {
            label: 'Instagram',
            data: [45, 78, 62, 95, 87, 130, 127],
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139,92,246,0.06)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#8B5CF6',
            pointBorderColor: '#0A0F1E',
            pointBorderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, padding: 20, font: { size: 12, family: 'Inter' } }
          },
          tooltip: {
            backgroundColor: 'rgba(10,15,30,0.95)',
            borderColor: 'rgba(59,130,246,0.3)',
            borderWidth: 1,
            titleFont: { size: 13, family: 'Inter' },
            bodyFont: { size: 12, family: 'Inter' },
            padding: 12,
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { font: { size: 11 } },
            beginAtZero: true
          }
        }
      }
    });
  }

  // Donut chart
  const ctx2 = document.getElementById('channelDonut');
  if (ctx2) {
    new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['WhatsApp', 'Instagram'],
        datasets: [{
          data: [68, 32],
          backgroundColor: [
            'rgba(59,130,246,0.85)',
            'rgba(139,92,246,0.85)'
          ],
          borderColor: ['#3B82F6','#8B5CF6'],
          borderWidth: 2,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10,15,30,0.95)',
            borderColor: 'rgba(59,130,246,0.3)',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`
            }
          }
        }
      }
    });
  }
}

// Leads table
const leadsData = [
  { nome: 'Marcela Costa', canal: '🟢 WhatsApp', status: 'quente', data: 'hoje, 22:10' },
  { nome: 'Rafael Santos', canal: '📸 Instagram', status: 'novo', data: 'hoje, 21:45' },
  { nome: 'Ana Paula Silva', canal: '🟢 WhatsApp', status: 'convertido', data: 'hoje, 20:30' },
  { nome: 'João Ferreira', canal: '🟢 WhatsApp', status: 'quente', data: 'hoje, 19:55' },
  { nome: 'Luana Martins', canal: '📸 Instagram', status: 'frio', data: 'hoje, 18:20' },
  { nome: 'Carlos Eduardo', canal: '🟢 WhatsApp', status: 'novo', data: 'hoje, 17:10' },
  { nome: 'Fernanda Lima', canal: '📸 Instagram', status: 'convertido', data: 'ontem' },
];

function populateLeadsTable() {
  const tbody = document.getElementById('leadsTableBody');
  if (!tbody) return;
  tbody.innerHTML = leadsData.map(l => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:.6rem">
          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#8B5CF6);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;flex-shrink:0">
            ${l.nome.split(' ').map(n=>n[0]).join('').slice(0,2)}
          </div>
          <span style="font-weight:500;font-size:.88rem">${l.nome}</span>
        </div>
      </td>
      <td style="font-size:.82rem;color:var(--text-soft)">${l.canal}</td>
      <td><span class="status-badge status-${l.status}">${l.status.charAt(0).toUpperCase()+l.status.slice(1)}</span></td>
      <td style="font-size:.8rem;color:var(--text-muted)">${l.data}</td>
      <td><button class="action-btn" onclick="viewLead(this, '${l.nome}')">Ver →</button></td>
    </tr>
  `).join('');
}

function viewLead(btn, nome) {
  btn.textContent = '✓';
  btn.style.color = '#22C55E';
  btn.style.borderColor = '#22C55E';
  setTimeout(() => { btn.textContent = 'Ver →'; btn.style.color = ''; btn.style.borderColor = ''; }, 1500);
}

// Live updates simulation
function startLiveUpdates() {
  // Simulate new messages
  let conversas = 347;
  let leads = 127;

  setInterval(() => {
    if (Math.random() < 0.3) {
      conversas += Math.floor(Math.random() * 3) + 1;
      const el = document.getElementById('kConversas');
      if (el) {
        el.textContent = conversas;
        el.style.color = '#22C55E';
        setTimeout(() => el.style.color = '', 600);
      }
    }
  }, 5000);

  setInterval(() => {
    if (Math.random() < 0.2) {
      leads += 1;
      const el = document.getElementById('kLeads');
      if (el) {
        el.textContent = leads;
        el.style.color = '#22C55E';
        setTimeout(() => el.style.color = '', 600);
        el.style.transition = 'color .3s ease';
      }
    }
  }, 8000);
}
