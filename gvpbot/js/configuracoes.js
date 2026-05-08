/* ================================================
   GVP BOT — CONFIGURAÇÕES ENGINE
   ================================================ */

let isDirty = false;

// ── INIT ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildScheduleGrid();
  buildRespostas();
  buildSessions();
  buildIntegrations();
  gen2FAQR();
  animateScrollSpy();
});

// ── DIRTY STATE ────────────────────────────────
function markDirty() {
  isDirty = true;
}

// ── SCROLL SPY ─────────────────────────────────
function scrollToSection(id, el) {
  document.querySelectorAll('.csn-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  const sec = document.getElementById('sec-' + id);
  if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function animateScrollSpy() {
  const sections = document.querySelectorAll('.cfg-section');
  const navItems = document.querySelectorAll('.csn-item:not(.danger)');
  const content  = document.getElementById('cfgContent');
  if (!content) return;

  content.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (sec.offsetTop - content.scrollTop <= 120) current = sec.id.replace('sec-','');
    });
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.querySelector('span:last-child')?.textContent.toLowerCase().includes(current) ||
          item.onclick?.toString().includes(current)) item.classList.add('active');
    });
  });
}

// ── SAVE ALL ───────────────────────────────────
function saveAll() {
  const text   = document.getElementById('saveAllText');
  const loader = document.getElementById('saveAllLoader');
  text.style.display   = 'none';
  loader.style.display = 'block';

  setTimeout(() => {
    text.style.display   = '';
    loader.style.display = 'none';
    text.textContent     = '✅ Salvo!';
    showToast('✅ Todas as configurações salvas!', 'success');
    showSavedBadge();
    isDirty = false;
    setTimeout(() => text.textContent = '💾 Salvar tudo', 2000);
  }, 1500);
}

function saveSection(name) {
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = '<div class="btn-loader" style="display:inline-block"></div>';
  btn.style.pointerEvents = 'none';

  setTimeout(() => {
    btn.innerHTML = '✅ Salvo!';
    btn.style.background = 'linear-gradient(135deg,#22C55E,#16A34A)';
    showToast('✅ ' + sectionName(name) + ' salvo!', 'success');
    showSavedBadge();
    isDirty = false;
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.style.pointerEvents = '';
    }, 2000);
  }, 1200);
}

function sectionName(s) {
  const map = { empresa:'Dados da empresa', horario:'Horário de atendimento', respostas:'Respostas rápidas', notificacoes:'Notificações', preferencias:'Preferências', integracao:'Integrações' };
  return map[s] || 'Configuração';
}

function showSavedBadge() {
  const b = document.getElementById('cfgSavedBadge');
  b.style.display = '';
  setTimeout(() => b.style.display = 'none', 3000);
}

// ── LOGO UPLOAD ────────────────────────────────
function triggerLogoUpload() {
  document.getElementById('logoInput').click();
}

function previewLogo(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('⚠️ Arquivo muito grande (máx 2MB)', 'error'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    const curr = document.getElementById('luaCurrent');
    curr.innerHTML = `<img src="${ev.target.result}" alt="Logo" />`;
    showToast('✅ Logo atualizada!', 'success');
    markDirty();
  };
  reader.readAsDataURL(file);
}

function removeLogoPreview() {
  const curr = document.getElementById('luaCurrent');
  curr.innerHTML = '<div class="lua-initials">GV</div>';
  showToast('🗑 Logo removida', 'info');
  markDirty();
}

// ── SWITCH ─────────────────────────────────────
function toggleSwitch(el) {
  el.classList.toggle('active');
  markDirty();
}

// ── COLOR PICKER ───────────────────────────────
function selectColor(type, el) {
  const parent = document.getElementById('swatch' + type.charAt(0).toUpperCase() + type.slice(1));
  parent.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  markDirty();
  showToast('🎨 Cor ' + (type === 'primary' ? 'primária' : 'de acento') + ' atualizada!', 'success');
}

function customColor(type, input) {
  selectColor(type, input);
  markDirty();
}

// ── THEME ──────────────────────────────────────
function selectTheme(el, theme) {
  document.querySelectorAll('.theme-opt').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  markDirty();
  showToast(`🎨 Tema "${theme}" selecionado!`, 'success');
}

// ── SCHEDULE GRID ──────────────────────────────
const DIAS = [
  { key:'seg', name:'Seg', on:true,  start:'09:00', end:'18:00' },
  { key:'ter', name:'Ter', on:true,  start:'09:00', end:'18:00' },
  { key:'qua', name:'Qua', on:true,  start:'09:00', end:'18:00' },
  { key:'qui', name:'Qui', on:true,  start:'09:00', end:'18:00' },
  { key:'sex', name:'Sex', on:true,  start:'09:00', end:'18:00' },
  { key:'sab', name:'Sáb', on:true,  start:'10:00', end:'15:00' },
  { key:'dom', name:'Dom', on:false, start:'10:00', end:'14:00' },
];

function buildScheduleGrid() {
  const grid = document.getElementById('scheduleGrid');
  if (!grid) return;
  grid.innerHTML = DIAS.map(d => `
    <div class="sg-row">
      <div class="sg-day">
        <div class="cfg-switch ${d.on ? 'active' : ''}" onclick="toggleDiaSwitch(this,'times-${d.key}')"></div>
        <span class="sg-day-name">${d.name}</span>
      </div>
      <div class="sg-times ${d.on ? '' : 'disabled'}" id="times-${d.key}">
        <input type="time" class="sg-time-input" value="${d.start}" oninput="markDirty()" />
        <span class="sg-sep">até</span>
        <input type="time" class="sg-time-input" value="${d.end}" oninput="markDirty()" />
      </div>
      <div style="font-size:.7rem;color:var(--text-muted)">${d.on ? '✅ Ativo' : '—'}</div>
    </div>
  `).join('');
}

function toggleDiaSwitch(sw, timesId) {
  sw.classList.toggle('active');
  const times = document.getElementById(timesId);
  if (times) times.classList.toggle('disabled', !sw.classList.contains('active'));
  markDirty();
}

// ── RESPOSTAS RÁPIDAS ──────────────────────────
let RESPOSTAS = [
  { id:1, shortcut:'/saudacao',  title:'Saudação inicial',    content:'Olá! Seja bem-vindo(a) à {{nome_empresa}}! 😊 Como posso te ajudar?',        cat:'Geral' },
  { id:2, shortcut:'/preco',     title:'Consulta de preços',  content:'Nossos preços partem de R$49. Acesso ao catálogo completo: {{link_catalogo}}', cat:'Vendas' },
  { id:3, shortcut:'/horario',   title:'Horário de funcio.',  content:'Funcionamos de Seg-Sex das 9h às 18h e Sábado das 10h às 15h. 🕐',            cat:'Geral' },
  { id:4, shortcut:'/entrega',   title:'Info de entrega',     content:'Entregamos para todo o Brasil! SP capital: 2 dias úteis. 🚚 Frete grátis acima de R$199.', cat:'Vendas' },
  { id:5, shortcut:'/obrigado',  title:'Agradecimento',       content:'Obrigado pelo contato, {{nome_cliente}}! Foi um prazer atendê-lo(a). Até logo! 😊', cat:'Geral' },
  { id:6, shortcut:'/transferir',title:'Transferir atendente', content:'Perfeito! Vou transferir você para um de nossos especialistas. Um momento! 👨‍💼', cat:'Suporte' },
];
let editingRRId = null;

function buildRespostas(filter = '') {
  const list = document.getElementById('rrList');
  if (!list) return;
  const items = filter
    ? RESPOSTAS.filter(r => r.shortcut.includes(filter) || r.title.toLowerCase().includes(filter))
    : RESPOSTAS;

  if (items.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);font-size:.85rem">Nenhuma resposta encontrada</div>';
    return;
  }
  list.innerHTML = items.map(r => `
    <div class="rr-item" id="rr-${r.id}">
      <div class="rri-shortcut">${r.shortcut}</div>
      <div class="rri-body">
        <div class="rri-title">${r.title}</div>
        <div class="rri-content">${r.content}</div>
        <div class="rri-meta"><span class="rri-cat">📁 ${r.cat}</span></div>
      </div>
      <div class="rri-actions">
        <button class="rri-btn" onclick="editResposta(${r.id})" title="Editar">✏️</button>
        <button class="rri-btn" onclick="duplicateResposta(${r.id})" title="Duplicar">⎘</button>
        <button class="rri-btn del" onclick="deleteResposta(${r.id})" title="Deletar">🗑</button>
      </div>
    </div>
  `).join('');
}

function filterRespostas(v) { buildRespostas(v.toLowerCase()); }

function addResposta() {
  editingRRId = null;
  document.getElementById('rrModalTitle').textContent = 'Nova Resposta Rápida';
  ['fRRAtualho','fRRTitulo','fRRConteudo'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fRRCategoria').value = 'geral';
  openModal('addResposta');
}

function editResposta(id) {
  const r = RESPOSTAS.find(x => x.id === id);
  if (!r) return;
  editingRRId = id;
  document.getElementById('rrModalTitle').textContent = 'Editar Resposta Rápida';
  document.getElementById('fRRAtualho').value    = r.shortcut.replace('/', '');
  document.getElementById('fRRTitulo').value     = r.title;
  document.getElementById('fRRConteudo').value   = r.content;
  document.getElementById('fRRCategoria').value  = r.cat.toLowerCase();
  openModal('addResposta');
}

function duplicateResposta(id) {
  const r = RESPOSTAS.find(x => x.id === id);
  if (!r) return;
  const newR = { ...r, id: Date.now(), shortcut: r.shortcut + '_copia', title: r.title + ' (cópia)' };
  RESPOSTAS.push(newR);
  buildRespostas();
  showToast('⎘ Resposta duplicada!', 'success');
}

function deleteResposta(id) {
  const el = document.getElementById('rr-' + id);
  if (el) { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = 'all .3s ease'; }
  setTimeout(() => {
    RESPOSTAS = RESPOSTAS.filter(r => r.id !== id);
    buildRespostas();
    showToast('🗑 Resposta removida', 'info');
  }, 300);
}

function saveResposta() {
  const shortcut = '/' + document.getElementById('fRRAtualho').value.trim().replace(/^\//, '');
  const title    = document.getElementById('fRRTitulo').value.trim();
  const content  = document.getElementById('fRRConteudo').value.trim();
  const cat      = document.getElementById('fRRCategoria').value;
  const catMap   = { geral:'Geral', vendas:'Vendas', suporte:'Suporte', cobranca:'Cobrança' };

  if (!shortcut || shortcut === '/') { showToast('⚠️ Informe um atalho', 'error'); return; }
  if (!title)   { showToast('⚠️ Informe um título', 'error'); return; }
  if (!content) { showToast('⚠️ Informe o conteúdo', 'error'); return; }

  if (editingRRId) {
    const idx = RESPOSTAS.findIndex(r => r.id === editingRRId);
    if (idx >= 0) RESPOSTAS[idx] = { ...RESPOSTAS[idx], shortcut, title, content, cat: catMap[cat] };
    showToast('✅ Resposta atualizada!', 'success');
  } else {
    RESPOSTAS.push({ id: Date.now(), shortcut, title, content, cat: catMap[cat] });
    showToast('✅ Resposta criada!', 'success');
  }
  buildRespostas();
  closeModal('addResposta');
}

// ── PASSWORD ───────────────────────────────────
function togglePwd(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.textContent = isHidden ? '🙈' : '👁';
}

function checkPwdStrength(val) {
  const fill  = document.getElementById('pwdStrengthFill');
  const label = document.getElementById('pwdStrengthLabel');
  if (!fill) return;

  let score = 0;
  if (val.length >= 8)        score++;
  if (/[A-Z]/.test(val))      score++;
  if (/[0-9]/.test(val))      score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const configs = [
    { pct:'0%',   color:'transparent', text:'',                          cls:'' },
    { pct:'25%',  color:'#EF4444',     text:'Muito fraca',               cls:'color:#EF4444' },
    { pct:'50%',  color:'#F59E0B',     text:'Fraca',                     cls:'color:#F59E0B' },
    { pct:'75%',  color:'#3B82F6',     text:'Boa',                       cls:'color:#3B82F6' },
    { pct:'100%', color:'#22C55E',     text:'Excelente ✓',               cls:'color:#22C55E' },
  ];
  const cfg = configs[score];
  fill.style.width      = cfg.pct;
  fill.style.background = cfg.color;
  label.textContent     = cfg.text;
  label.style.cssText   = cfg.cls;
}

function checkPwdMatch() {
  const nova  = document.getElementById('fSenhaNova')?.value;
  const conf  = document.getElementById('fSenhaConf')?.value;
  const label = document.getElementById('pwdMatchLabel');
  if (!label || !conf) return;
  if (conf === '') { label.textContent = ''; return; }
  if (nova === conf) {
    label.textContent = '✓ Senhas coincidem';
    label.style.color = '#22C55E';
  } else {
    label.textContent = '✕ Senhas não coincidem';
    label.style.color = '#EF4444';
  }
}

function savePassword() {
  const atual = document.getElementById('fSenhaAtual')?.value;
  const nova  = document.getElementById('fSenhaNova')?.value;
  const conf  = document.getElementById('fSenhaConf')?.value;
  if (!atual) { showToast('⚠️ Informe a senha atual', 'error'); return; }
  if (!nova || nova.length < 8) { showToast('⚠️ Nova senha deve ter pelo menos 8 caracteres', 'error'); return; }
  if (nova !== conf) { showToast('⚠️ As senhas não coincidem', 'error'); return; }

  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = '<div class="btn-loader" style="display:inline-block"></div>';
  btn.style.pointerEvents = 'none';

  setTimeout(() => {
    btn.innerHTML = '✅ Senha alterada!';
    btn.style.background = 'linear-gradient(135deg,#22C55E,#16A34A)';
    ['fSenhaAtual','fSenhaNova','fSenhaConf'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    document.getElementById('pwdStrengthFill').style.width = '0';
    document.getElementById('pwdStrengthLabel').textContent = '';
    document.getElementById('pwdMatchLabel').textContent = '';
    showToast('🔒 Senha alterada com sucesso!', 'success');
    setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.pointerEvents = ''; }, 2500);
  }, 1400);
}

// ── 2FA ───────────────────────────────────────
function gen2FAQR() {
  const canvas = document.getElementById('tfa2QRCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 160, cell = 6, cols = Math.floor(size/cell);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0,0,size,size);
  ctx.fillStyle = '#111111';

  function rand(x,y) { const n = Math.sin(x*127.1+y*311.7+99)*43758.5453; return n-Math.floor(n); }
  for(let r=0;r<cols;r++) for(let c=0;c<cols;c++) {
    if((r<8&&c<8)||(r<8&&c>cols-9)||(r>cols-9&&c<8)) continue;
    if(rand(r,c)>.5) ctx.fillRect(c*cell,r*cell,cell-1,cell-1);
  }
  [[0,0],[((cols-7)*cell),0],[0,((cols-7)*cell)]].forEach(([x,y]) => {
    ctx.fillStyle='#111'; ctx.fillRect(x,y,7*cell,7*cell);
    ctx.fillStyle='#fff'; ctx.fillRect(x+cell,y+cell,5*cell,5*cell);
    ctx.fillStyle='#111'; ctx.fillRect(x+2*cell,y+2*cell,3*cell,3*cell);
  });
}

function tfaInputNext(input, idx) {
  const digits = document.querySelectorAll('.tfa-digit');
  input.value = input.value.replace(/\D/g,'');
  if (input.value && idx < 5) digits[idx+1].focus();
  if (idx === 5 && input.value) checkTFACode();
}

function checkTFACode() {
  const code = [...document.querySelectorAll('.tfa-digit')].map(d => d.value).join('');
  if (code.length === 6) {
    setTimeout(() => {
      activate2FA();
    }, 300);
  }
}

function activate2FA() {
  const code = [...document.querySelectorAll('.tfa-digit')].map(d => d.value).join('');
  if (code.length < 6) { showToast('⚠️ Digite os 6 dígitos', 'error'); return; }

  const btn = event?.currentTarget;
  if (btn) { btn.textContent = '⏳ Verificando...'; btn.style.pointerEvents = 'none'; }

  setTimeout(() => {
    document.getElementById('tfaStatus').className = 'tfa-status on';
    document.getElementById('tfaStatus').innerHTML = `
      <div class="tfa-icon">🔐</div>
      <div class="tfa-info">
        <span class="tfa-state">Ativado</span>
        <span class="tfa-desc">2FA está protegendo sua conta com sucesso</span>
      </div>
      <button class="cfg-btn-danger-sm" onclick="deactivate2FA()">Desativar</button>
    `;
    closeModal('tfa');
    showToast('🔐 2FA ativado com sucesso!', 'success');
  }, 1500);
}

function deactivate2FA() {
  if (!confirm('Tem certeza que deseja desativar o 2FA?')) return;
  document.getElementById('tfaStatus').className = 'tfa-status off';
  document.getElementById('tfaStatus').innerHTML = `
    <div class="tfa-icon">🔐</div>
    <div class="tfa-info">
      <span class="tfa-state">Desativado</span>
      <span class="tfa-desc">Adicione uma camada extra de segurança à sua conta</span>
    </div>
    <button class="cfg-btn-save" onclick="openModal('tfa')">Ativar 2FA</button>
  `;
  showToast('⚠️ 2FA desativado', 'info');
}

// ── SESSIONS ───────────────────────────────────
const SESSIONS = [
  { device:'💻', name:'Chrome — Windows 11', meta:'São Paulo, SP · IP 177.12.45.231',  current:true,  time:'Agora' },
  { device:'📱', name:'Safari — iPhone 15',  meta:'São Paulo, SP · IP 177.12.45.231',  current:false, time:'há 2 horas' },
  { device:'🖥️', name:'Firefox — macOS',     meta:'São Paulo, SP · IP 192.168.1.10',   current:false, time:'há 1 dia' },
  { device:'📱', name:'Chrome — Android',    meta:'Rio de Janeiro, RJ · IP 201.55.12.8', current:false, time:'há 3 dias' },
];

function buildSessions() {
  const list = document.getElementById('sessionsList');
  if (!list) return;
  list.innerHTML = SESSIONS.map((s, i) => `
    <div class="session-item ${s.current ? 'current' : ''}" id="sess-${i}">
      <div class="si-device">${s.device}</div>
      <div class="si-info">
        <div class="si-name">${s.name} ${s.current ? '<span class="si-current-badge">✓ Esta sessão</span>' : ''}</div>
        <div class="si-meta">${s.meta} · ${s.time}</div>
      </div>
      ${!s.current ? `<button class="si-revoke" onclick="revokeSession(${i},this)">Encerrar</button>` : ''}
    </div>
  `).join('');
}

function revokeSession(idx, btn) {
  btn.textContent = '⏳';
  btn.style.pointerEvents = 'none';
  setTimeout(() => {
    const el = document.getElementById('sess-' + idx);
    if (el) { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = 'all .3s'; }
    setTimeout(() => { if (el) el.remove(); showToast('🔒 Sessão encerrada', 'info'); }, 300);
  }, 800);
}

function revokeAllSessions() {
  if (!confirm('Encerrar todas as outras sessões?')) return;
  document.querySelectorAll('.session-item:not(.current) .si-revoke').forEach((btn, i) => {
    setTimeout(() => btn.click(), i * 200);
  });
  showToast('🔒 Todas as sessões encerradas!', 'success');
}

// ── INTEGRATIONS ──────────────────────────────
const INTEGRATIONS = [
  { name:'Google Sheets',    icon:'📊', color:'rgba(52,168,83,.15)',  connected:true },
  { name:'Zapier',           icon:'⚡', color:'rgba(255,77,0,.15)',    connected:false },
  { name:'HubSpot CRM',      icon:'🟠', color:'rgba(255,122,0,.15)',   connected:true },
  { name:'Slack',            icon:'💬', color:'rgba(74,21,75,.2)',      connected:false },
  { name:'RD Station',       icon:'📈', color:'rgba(0,163,173,.15)',    connected:false },
  { name:'Shopify',          icon:'🛍️', color:'rgba(150,191,71,.15)',   connected:false },
];

function buildIntegrations() {
  const grid = document.getElementById('integrationsGrid');
  if (!grid) return;
  grid.innerHTML = INTEGRATIONS.map((int, i) => `
    <div class="ig-item">
      <div class="ig-logo" style="background:${int.color}">${int.icon}</div>
      <div style="flex:1">
        <div class="ig-name">${int.name}</div>
        <div class="ig-status ${int.connected ? 'connected' : 'disconnected'}" id="igStatus-${i}">
          ${int.connected ? '● Conectado' : '○ Desconectado'}
        </div>
      </div>
      <button class="ig-connect-btn ${int.connected ? 'on' : 'off'}" id="igBtn-${i}" onclick="toggleIntegration(${i},this)">
        ${int.connected ? 'Desconectar' : 'Conectar'}
      </button>
    </div>
  `).join('');
}

function toggleIntegration(idx, btn) {
  const status = document.getElementById('igStatus-' + idx);
  const isOn   = btn.classList.contains('on');
  btn.textContent = '⏳';
  btn.style.pointerEvents = 'none';

  setTimeout(() => {
    if (isOn) {
      btn.classList.replace('on','off');
      btn.textContent = 'Conectar';
      status.className = 'ig-status disconnected';
      status.textContent = '○ Desconectado';
      showToast('🔌 Integração desconectada', 'info');
    } else {
      btn.classList.replace('off','on');
      btn.textContent = 'Desconectar';
      status.className = 'ig-status connected';
      status.textContent = '● Conectado';
      showToast('✅ Integração conectada!', 'success');
    }
    btn.style.pointerEvents = '';
    INTEGRATIONS[idx].connected = !isOn;
  }, 1200);
}

function copyAPIKey() {
  const val = document.getElementById('apiKeyInput').value;
  navigator.clipboard?.writeText(val).catch(()=>{});
  showToast('📋 Chave de API copiada!', 'success');
}

function regenAPIKey() {
  if (!confirm('Gerar nova chave de API? A chave atual será invalidada.')) return;
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const newKey = 'gvp_live_sk_' + Array.from({length:40}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
  const inp = document.getElementById('apiKeyInput');
  inp.value = newKey;
  inp.type  = 'text';
  showToast('🔄 Nova chave de API gerada!', 'success');
  setTimeout(() => inp.type = 'password', 3000);
}

// ── MODALS ─────────────────────────────────────
function openModal(name) {
  document.getElementById(name + 'Modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  if (name === 'tfa') gen2FAQR();
}

function closeModal(name) {
  document.getElementById(name + 'Modal').classList.remove('open');
  document.body.style.overflow = '';
}

// ── DELETE ACCOUNT ─────────────────────────────
function checkDeleteReady() {
  const c1  = document.getElementById('dck1').checked;
  const c2  = document.getElementById('dck2').checked;
  const c3  = document.getElementById('dck3').checked;
  const val = document.getElementById('deleteConfirmInput').value;
  document.getElementById('deleteConfirmBtn').disabled = !(c1 && c2 && c3 && val === 'EXCLUIR CONTA');
}

function confirmDeleteAccount() {
  const btn = document.getElementById('deleteConfirmBtn');
  btn.innerHTML = '⏳ Excluindo...';
  btn.style.pointerEvents = 'none';
  setTimeout(() => {
    showToast('🗑️ Conta excluída. Redirecionando...', 'info');
    setTimeout(() => window.location.href = 'login.html', 2000);
  }, 2000);
}

// ── TOAST ──────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => { t.style.animation = 'toastOut .3s ease forwards'; setTimeout(() => t.remove(), 300); }, 2600);
}
