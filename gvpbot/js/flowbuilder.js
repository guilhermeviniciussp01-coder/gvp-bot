/* ================================================
   GVP BOT — FLOW BUILDER ENGINE
   ================================================ */

// ── STATE ──────────────────────────────────────
const FB = {
  nodes: [],
  connections: [],
  selected: null,
  zoom: 1,
  pan: { x: 100, y: 60 },
  dragging: null,
  connecting: null,
  history: [],
  future: [],
  idCounter: 1,
  previewStep: 0,
  previewNodes: [],
  isDraggingCanvas: false,
  lastMouse: { x: 0, y: 0 },
};

// ── BLOCK DEFINITIONS ──────────────────────────
const BLOCK_DEFS = {
  start:     { label: 'Mensagem inicial', icon: '▶', color: 'linear-gradient(135deg,#22C55E,#16A34A)', headerBg: 'rgba(34,197,94,.08)' },
  text:      { label: 'Texto', icon: '💬', color: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', headerBg: 'rgba(59,130,246,.08)' },
  image:     { label: 'Imagem', icon: '🖼', color: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', headerBg: 'rgba(139,92,246,.08)' },
  audio:     { label: 'Áudio', icon: '🎵', color: 'linear-gradient(135deg,#EC4899,#BE185D)', headerBg: 'rgba(236,72,153,.08)' },
  menu:      { label: 'Menu', icon: '📋', color: 'linear-gradient(135deg,#F59E0B,#D97706)', headerBg: 'rgba(245,158,11,.08)' },
  input:     { label: 'Capturar Resposta', icon: '✏️', color: 'linear-gradient(135deg,#14B8A6,#0D9488)', headerBg: 'rgba(20,184,166,.08)' },
  condition: { label: 'Condição', icon: '⚡', color: 'linear-gradient(135deg,#F97316,#EA580C)', headerBg: 'rgba(249,115,22,.08)' },
  lead:      { label: 'Capturar Lead', icon: '👤', color: 'linear-gradient(135deg,#06B6D4,#0284C7)', headerBg: 'rgba(6,182,212,.08)' },
  agent:     { label: 'Encaminhar Atendente', icon: '👨‍💼', color: 'linear-gradient(135deg,#10B981,#059669)', headerBg: 'rgba(16,185,129,.08)' },
  redirect:  { label: 'Redirecionar', icon: '🔀', color: 'linear-gradient(135deg,#6366F1,#4338CA)', headerBg: 'rgba(99,102,241,.08)' },
  webhook:   { label: 'Webhook', icon: '🔗', color: 'linear-gradient(135deg,#EF4444,#DC2626)', headerBg: 'rgba(239,68,68,.08)' },
  end:       { label: 'Encerrar', icon: '⏹', color: 'linear-gradient(135deg,#64748B,#475569)', headerBg: 'rgba(100,116,139,.08)' },
};

// ── INIT ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadDefaultFlow();
  initCanvas();
  renderAll();
  renderMinimap();
  updateStatusBar();
  populateBlockPicker();
  populateFlowList();
});

function loadDefaultFlow() {
  FB.nodes = [
    { id: 'n1', type: 'start', x: 120, y: 160, data: { message: 'Olá! Bem-vindo ao nosso atendimento 👋\nComo posso te ajudar hoje?' } },
    { id: 'n2', type: 'menu', x: 460, y: 80, data: { message: 'Escolha uma opção:', options: ['🛍️ Ver produtos', '💰 Preços e planos', '📞 Falar com atendente', '❓ Dúvidas frequentes'] } },
    { id: 'n3', type: 'lead', x: 800, y: 30, data: { fields: ['Nome', 'Telefone', 'Email'], message: 'Para continuar, preciso de alguns dados:' } },
    { id: 'n4', type: 'text', x: 460, y: 340, data: { message: 'Nossos preços são super acessíveis! 💰\n\n✅ Starter: R$ 47/mês\n✅ Pro: R$ 97/mês\n✅ Enterprise: R$ 247/mês' } },
    { id: 'n5', type: 'agent', x: 800, y: 290, data: { message: 'Encaminhando para um de nossos atendentes... Aguarde um momento! 😊', agentName: 'Equipe de Vendas' } },
    { id: 'n6', type: 'condition', x: 1140, y: 30, data: { condition: 'lead_capturado', operator: '==', value: 'true' } },
    { id: 'n7', type: 'text', x: 1480, y: -60, data: { message: 'Perfeito! Seus dados foram salvos ✅\nEm breve nossa equipe entrará em contato!' } },
    { id: 'n8', type: 'end', x: 1480, y: 200, data: { message: 'Obrigado pelo contato! Até mais 👋' } },
  ];

  FB.connections = [
    { id: 'c1', from: 'n1', to: 'n2' },
    { id: 'c2', from: 'n2', to: 'n3', label: '🛍️ Ver produtos' },
    { id: 'c3', from: 'n2', to: 'n4', label: '💰 Preços' },
    { id: 'c4', from: 'n2', to: 'n5', label: '📞 Atendente' },
    { id: 'c5', from: 'n3', to: 'n6' },
    { id: 'c6', from: 'n6', to: 'n7', type: 'yes' },
    { id: 'c7', from: 'n6', to: 'n8', type: 'no' },
    { id: 'c8', from: 'n5', to: 'n8' },
  ];
  FB.idCounter = 9;
}

// ── CANVAS INIT ────────────────────────────────
function initCanvas() {
  const wrap = document.getElementById('canvasWrap');
  const grid = document.getElementById('canvasGrid');

  // Pan with mouse drag on canvas background
  wrap.addEventListener('mousedown', (e) => {
    if (e.target === wrap || e.target === grid || e.target.classList.contains('connections-svg')) {
      FB.isDraggingCanvas = true;
      FB.lastMouse = { x: e.clientX, y: e.clientY };
      wrap.style.cursor = 'grabbing';
      selectNode(null);
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (FB.isDraggingCanvas) {
      const dx = e.clientX - FB.lastMouse.x;
      const dy = e.clientY - FB.lastMouse.y;
      FB.pan.x += dx / FB.zoom;
      FB.pan.y += dy / FB.zoom;
      FB.lastMouse = { x: e.clientX, y: e.clientY };
      applyTransform();
      renderMinimap();
    }
    if (FB.dragging) {
      const dx = (e.clientX - FB.dragging.startMX) / FB.zoom;
      const dy = (e.clientY - FB.dragging.startMY) / FB.zoom;
      FB.dragging.node.x = FB.dragging.startX + dx;
      FB.dragging.node.y = FB.dragging.startY + dy;
      const el = document.getElementById('node-' + FB.dragging.node.id);
      if (el) {
        el.style.left = FB.dragging.node.x + 'px';
        el.style.top = FB.dragging.node.y + 'px';
      }
      renderConnections();
      renderMinimap();
    }
  });

  document.addEventListener('mouseup', () => {
    if (FB.isDraggingCanvas) { FB.isDraggingCanvas = false; wrap.style.cursor = 'default'; }
    if (FB.dragging) { FB.dragging = null; saveHistory(); }
  });

  // Zoom with wheel
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(2, Math.max(0.3, FB.zoom * delta));
    FB.zoom = newZoom;
    applyTransform();
    updateZoomDisplay();
    renderMinimap();
  }, { passive: false });
}

function applyTransform() {
  const grid = document.getElementById('canvasGrid');
  grid.style.transform = `translate(${FB.pan.x * FB.zoom}px, ${FB.pan.y * FB.zoom}px) scale(${FB.zoom})`;
}

// ── RENDER ALL ─────────────────────────────────
function renderAll() {
  renderNodes();
  renderConnections();
  updateInfo();
}

// ── RENDER NODES ───────────────────────────────
function renderNodes() {
  const container = document.getElementById('canvasNodes');
  container.innerHTML = '';
  FB.nodes.forEach(node => {
    container.appendChild(createNodeEl(node));
  });
}

function createNodeEl(node) {
  const def = BLOCK_DEFS[node.type] || BLOCK_DEFS.text;
  const div = document.createElement('div');
  div.className = 'flow-node' + (FB.selected === node.id ? ' selected' : '');
  div.id = 'node-' + node.id;
  div.style.left = node.x + 'px';
  div.style.top = node.y + 'px';

  div.innerHTML = `
    <div class="port-in" data-node="${node.id}" onmouseup="endConnection(event,'${node.id}')"></div>
    <div class="node-header" style="background:${def.headerBg}" onmousedown="startNodeDrag(event,'${node.id}')">
      <div class="node-icon-sm" style="background:${def.color}">${def.icon}</div>
      <span class="node-title">${def.label}</span>
      <div class="node-actions">
        <button class="na-btn dup" onclick="event.stopPropagation();duplicateNodeById('${node.id}')" title="Duplicar">⎘</button>
        <button class="na-btn" onclick="event.stopPropagation();deleteNodeById('${node.id}')" title="Deletar">🗑</button>
      </div>
    </div>
    <div class="node-body" onclick="selectNode('${node.id}')">
      ${renderNodePreview(node)}
    </div>
    <div class="node-footer">
      <span class="nf-id">#${node.id}</span>
      <div class="nf-status ${getNodeStatus(node)}"></div>
    </div>
    <div class="node-ports">
      ${renderOutputPorts(node)}
    </div>
  `;

  return div;
}

function renderNodePreview(node) {
  const d = node.data || {};
  switch(node.type) {
    case 'start':
    case 'text':
    case 'agent':
    case 'end':
      return `<div class="node-preview">
        <div class="node-preview-text">${d.message || '<em style="color:var(--text-muted)">Clique para editar...</em>'}</div>
      </div>`;
    case 'image':
      return `<div class="node-preview">
        ${d.url ? `<div style="background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.2);border-radius:8px;padding:.75rem;text-align:center;font-size:1.5rem;">🖼<br><span style="font-size:.7rem;color:var(--text-muted)">${d.url.length > 30 ? d.url.slice(0,27)+'...' : d.url}</span></div>` : `<div style="background:rgba(255,255,255,.04);border:1px dashed rgba(255,255,255,.1);border-radius:8px;padding:1rem;text-align:center;color:var(--text-muted);font-size:.78rem;">📎 Nenhuma imagem selecionada</div>`}
        ${d.caption ? `<div class="node-preview-text" style="margin-top:.4rem">${d.caption}</div>` : ''}
      </div>`;
    case 'audio':
      return `<div class="node-preview">
        <div style="background:rgba(236,72,153,.1);border:1px solid rgba(236,72,153,.2);border-radius:8px;padding:.6rem .75rem;display:flex;align-items:center;gap:.5rem">
          <span>🎵</span><span style="font-size:.75rem;color:var(--text-soft)">${d.filename || 'Nenhum áudio selecionado'}</span>
        </div>
      </div>`;
    case 'menu':
      const opts = d.options || ['Opção 1', 'Opção 2'];
      return `<div class="node-preview">
        ${d.message ? `<div class="node-preview-text">${d.message}</div>` : ''}
        <div class="node-menu-items">${opts.slice(0,4).map(o => `<div class="nmi-item"><div class="nmi-dot"></div>${o}</div>`).join('')}${opts.length > 4 ? `<div style="font-size:.7rem;color:var(--text-muted);text-align:center">+${opts.length-4} opções</div>` : ''}</div>
      </div>`;
    case 'input':
      return `<div class="node-preview">
        <div style="background:rgba(20,184,166,.08);border:1px solid rgba(20,184,166,.2);border-radius:8px;padding:.6rem .75rem">
          <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:.25rem">Variável</div>
          <div style="font-size:.82rem;font-weight:600;color:#14B8A6">${d.variable ? '{{' + d.variable + '}}' : '{{resposta}}'}</div>
        </div>
      </div>`;
    case 'condition':
      return `<div class="node-preview">
        <div style="font-size:.75rem;color:var(--text-soft);background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.2);border-radius:8px;padding:.5rem .75rem">
          <span style="color:#F97316">SE</span> <strong>${d.condition || 'variável'}</strong> <span style="color:var(--text-muted)">${d.operator || '=='}</span> <strong>${d.value || 'valor'}</strong>
        </div>
        <div class="node-branches">
          <div class="nb-branch nb-yes">✓ SIM</div>
          <div class="nb-branch nb-no">✗ NÃO</div>
        </div>
      </div>`;
    case 'lead':
      const fields = d.fields || ['Nome', 'Telefone'];
      return `<div class="node-preview">
        ${d.message ? `<div class="node-preview-text">${d.message}</div>` : ''}
        <div class="node-lead-fields">${fields.map(f => `<span class="nlf-tag">📌 ${f}</span>`).join('')}</div>
      </div>`;
    case 'redirect':
      return `<div class="node-preview">
        <div style="background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:8px;padding:.6rem .75rem;font-size:.8rem">
          <div style="color:var(--text-muted);font-size:.7rem">Destino</div>
          <div style="color:#6366F1;font-weight:600">${d.target || 'Selecionar fluxo...'}</div>
        </div>
      </div>`;
    case 'webhook':
      return `<div class="node-preview">
        <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:.6rem .75rem">
          <div style="font-size:.68rem;color:var(--text-muted);margin-bottom:.2rem">POST →</div>
          <div style="font-size:.75rem;color:#EF4444;word-break:break-all">${d.url || 'https://...'}</div>
        </div>
      </div>`;
    default: return '<div class="node-preview">—</div>';
  }
}

function renderOutputPorts(node) {
  if (node.type === 'condition') {
    return `
      <div class="port-out port-yes" data-node="${node.id}" data-type="yes" title="SIM" onmousedown="startConnection(event,'${node.id}','yes')"></div>
      <div class="port-out port-no" data-node="${node.id}" data-type="no" title="NÃO" onmousedown="startConnection(event,'${node.id}','no')"></div>
    `;
  }
  if (node.type === 'end') return '';
  if (node.type === 'menu') {
    const opts = (node.data && node.data.options) || ['Opção 1'];
    return opts.slice(0,4).map((o,i) =>
      `<div class="port-out" data-node="${node.id}" data-opt="${i}" title="${o}" onmousedown="startConnection(event,'${node.id}','opt${i}')"></div>`
    ).join('') + `<div class="port-out" data-node="${node.id}" onmousedown="startConnection(event,'${node.id}')"></div>`;
  }
  return `<div class="port-out" data-node="${node.id}" onmousedown="startConnection(event,'${node.id}')" title="Conectar"></div>`;
}

function getNodeStatus(node) {
  const d = node.data || {};
  if (node.type === 'text' && !d.message) return 'warn';
  if (node.type === 'menu' && (!d.options || d.options.length === 0)) return 'warn';
  return 'ok';
}

// ── RENDER CONNECTIONS ─────────────────────────
function renderConnections() {
  const svg = document.getElementById('connectionsSvg');
  svg.innerHTML = '';

  FB.connections.forEach(conn => {
    const fromNode = FB.nodes.find(n => n.id === conn.from);
    const toNode = FB.nodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return;

    const fromEl = document.getElementById('node-' + conn.from);
    const toEl = document.getElementById('node-' + conn.to);
    if (!fromEl || !toEl) return;

    const fx = fromNode.x + fromEl.offsetWidth + 2;
    const fy = fromNode.y + fromEl.offsetHeight / 2;
    const tx = toNode.x - 2;
    const ty = toNode.y + toEl.offsetHeight / 2;

    const cp1x = fx + Math.max(60, Math.abs(tx - fx) * 0.5);
    const cp1y = fy;
    const cp2x = tx - Math.max(60, Math.abs(tx - fx) * 0.5);
    const cp2y = ty;

    const cls = conn.type === 'yes' ? 'conn-path yes-path' : conn.type === 'no' ? 'conn-path no-path' : 'conn-path';

    // Arrow marker
    const markerId = 'arr-' + conn.id;
    const markerColor = conn.type === 'yes' ? 'rgba(34,197,94,.8)' : conn.type === 'no' ? 'rgba(239,68,68,.8)' : 'rgba(59,130,246,.8)';
    svg.innerHTML += `
      <defs>
        <marker id="${markerId}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="${markerColor}" />
        </marker>
      </defs>
      <path class="${cls}" d="M${fx},${fy} C${cp1x},${cp1y} ${cp2x},${cp2y} ${tx},${ty}"
        marker-end="url(#${markerId})"
        onclick="handleConnectionClick(event,'${conn.id}')" style="pointer-events:stroke;cursor:pointer" />
    `;

    // Label
    if (conn.label) {
      const mx = (fx + tx) / 2;
      const my = (fy + ty) / 2;
      svg.innerHTML += `
        <rect x="${mx - 40}" y="${my - 11}" width="80" height="20" rx="10" fill="rgba(10,15,30,.95)" stroke="rgba(255,255,255,.1)" stroke-width="1"/>
        <text x="${mx}" y="${my + 4}" text-anchor="middle" font-size="9" fill="rgba(255,255,255,.6)" font-family="Inter">${conn.label.length > 12 ? conn.label.slice(0,11)+'…' : conn.label}</text>
      `;
    }
  });
}

// ── NODE DRAG ──────────────────────────────────
function startNodeDrag(e, nodeId) {
  e.stopPropagation();
  selectNode(nodeId);
  const node = FB.nodes.find(n => n.id === nodeId);
  if (!node) return;
  FB.dragging = {
    node, startX: node.x, startY: node.y,
    startMX: e.clientX, startMY: e.clientY
  };
  const el = document.getElementById('node-' + nodeId);
  if (el) el.classList.add('dragging');
  document.addEventListener('mouseup', () => {
    if (FB.dragging && FB.dragging.node.id === nodeId) {
      const el = document.getElementById('node-' + nodeId);
      if (el) el.classList.remove('dragging');
    }
  }, { once: true });
}

// ── NODE SELECTION ─────────────────────────────
function selectNode(nodeId) {
  FB.selected = nodeId;
  document.querySelectorAll('.flow-node').forEach(el => el.classList.remove('selected'));
  if (nodeId) {
    const el = document.getElementById('node-' + nodeId);
    if (el) el.classList.add('selected');
    openInspector(nodeId);
  } else {
    closeInspector();
  }
}

// ── CONNECTIONS ────────────────────────────────
function startConnection(e, fromId, type) {
  e.stopPropagation();
  FB.connecting = { from: fromId, type: type || null };
}

function endConnection(e, toId) {
  e.stopPropagation();
  if (!FB.connecting || FB.connecting.from === toId) { FB.connecting = null; return; }
  const conn = {
    id: 'c' + Date.now(),
    from: FB.connecting.from,
    to: toId,
    type: FB.connecting.type
  };
  // Avoid duplicate
  const exists = FB.connections.find(c => c.from === conn.from && c.to === conn.to);
  if (!exists) {
    FB.connections.push(conn);
    saveHistory();
    renderConnections();
    updateInfo();
    showToast('✅ Blocos conectados!', 'success');
  }
  FB.connecting = null;
}

function handleConnectionClick(e, connId) {
  if (confirm('Remover esta conexão?')) {
    FB.connections = FB.connections.filter(c => c.id !== connId);
    renderConnections();
    updateInfo();
    showToast('🗑️ Conexão removida', 'info');
  }
}

// ── ADD BLOCK ──────────────────────────────────
function addBlock(type) {
  const id = 'n' + FB.idCounter++;
  const cx = (-FB.pan.x + 400 / FB.zoom) + (Math.random() * 100 - 50);
  const cy = (-FB.pan.y + 200 / FB.zoom) + (Math.random() * 80 - 40);

  const defaults = {
    start: { message: 'Olá! Como posso te ajudar hoje? 👋' },
    text: { message: '' },
    image: { url: '', caption: '' },
    audio: { filename: '', duration: '' },
    menu: { message: 'Escolha uma opção:', options: ['Opção 1', 'Opção 2', 'Opção 3'] },
    input: { variable: 'resposta', prompt: 'Por favor, responda:' },
    condition: { condition: 'variavel', operator: '==', value: '' },
    lead: { fields: ['Nome', 'Telefone', 'Email'], message: 'Preencha seus dados:' },
    agent: { message: 'Encaminhando para um atendente... 👨‍💼', agentName: 'Atendimento' },
    redirect: { target: '', flowId: '' },
    webhook: { url: 'https://', method: 'POST', body: '' },
    end: { message: 'Obrigado pelo contato! Até mais 👋' },
  };

  const node = { id, type, x: cx, y: cy, data: defaults[type] || {} };
  saveHistory();
  FB.nodes.push(node);

  const container = document.getElementById('canvasNodes');
  container.appendChild(createNodeEl(node));
  renderConnections();
  updateInfo();
  renderMinimap();
  selectNode(id);

  // Scroll to new node
  FB.pan.x = -cx + 300 / FB.zoom;
  FB.pan.y = -cy + 150 / FB.zoom;
  applyTransform();

  showToast(`✅ Bloco "${BLOCK_DEFS[type].label}" adicionado!`, 'success');
  closeBlockPicker();
  setFlowDraft();
}

// ── DELETE ─────────────────────────────────────
function deleteSelectedBlock() {
  if (!FB.selected) { showToast('⚠️ Nenhum bloco selecionado', 'error'); return; }
  if (FB.selected === 'n1') { showToast('⚠️ O bloco inicial não pode ser deletado', 'error'); return; }
  deleteNodeById(FB.selected);
}

function deleteNodeById(nodeId) {
  if (!confirm('Deletar este bloco e suas conexões?')) return;
  saveHistory();
  FB.nodes = FB.nodes.filter(n => n.id !== nodeId);
  FB.connections = FB.connections.filter(c => c.from !== nodeId && c.to !== nodeId);
  const el = document.getElementById('node-' + nodeId);
  if (el) el.remove();
  if (FB.selected === nodeId) { FB.selected = null; closeInspector(); }
  renderConnections();
  updateInfo();
  renderMinimap();
  showToast('🗑️ Bloco removido', 'info');
  setFlowDraft();
}

// ── DUPLICATE ──────────────────────────────────
function duplicateBlock() {
  if (!FB.selected) { showToast('⚠️ Nenhum bloco selecionado', 'error'); return; }
  duplicateNodeById(FB.selected);
}

function duplicateNodeById(nodeId) {
  const node = FB.nodes.find(n => n.id === nodeId);
  if (!node) return;
  const id = 'n' + FB.idCounter++;
  const copy = { ...node, id, x: node.x + 40, y: node.y + 40, data: JSON.parse(JSON.stringify(node.data)) };
  saveHistory();
  FB.nodes.push(copy);
  const container = document.getElementById('canvasNodes');
  container.appendChild(createNodeEl(copy));
  renderConnections();
  updateInfo();
  renderMinimap();
  selectNode(id);
  showToast('⎘ Bloco duplicado!', 'success');
  setFlowDraft();
}

// ── INSPECTOR ──────────────────────────────────
function openInspector(nodeId) {
  const node = FB.nodes.find(n => n.id === nodeId);
  if (!node) return;
  const def = BLOCK_DEFS[node.type];

  document.getElementById('ipEmpty').style.display = 'none';
  document.getElementById('ipContent').style.display = 'flex';
  document.getElementById('ipBlockIcon').style.background = def.color;
  document.getElementById('ipBlockIcon').textContent = def.icon;
  document.getElementById('ipBlockType').textContent = def.label;
  document.getElementById('ipBlockId').textContent = '#' + node.id;

  const body = document.getElementById('ipBody');
  body.innerHTML = buildInspectorFields(node);
}

function closeInspector() {
  document.getElementById('ipEmpty').style.display = '';
  document.getElementById('ipContent').style.display = 'none';
}

function buildInspectorFields(node) {
  const d = node.data || {};
  const colorOpts = ['#3B82F6','#8B5CF6','#22C55E','#F59E0B','#EC4899','#EF4444','#14B8A6'];

  let html = '';
  // Title field
  html += `<div class="ip-field">
    <label class="ip-label">Título do bloco</label>
    <input class="ip-input" type="text" value="${d.title || BLOCK_DEFS[node.type].label}" oninput="updateField('${node.id}','title',this.value)" placeholder="Nome do bloco" />
  </div>`;

  switch(node.type) {
    case 'start':
    case 'text':
    case 'end':
      html += field('Mensagem', `<textarea class="ip-input" rows="4" oninput="updateField('${node.id}','message',this.value)">${d.message||''}</textarea>`);
      break;
    case 'image':
      html += field('URL da Imagem', `<input class="ip-input" type="url" value="${d.url||''}" oninput="updateField('${node.id}','url',this.value)" placeholder="https://..." />`);
      html += field('Legenda', `<input class="ip-input" type="text" value="${d.caption||''}" oninput="updateField('${node.id}','caption',this.value)" placeholder="Texto opcional..." />`);
      break;
    case 'audio':
      html += field('Arquivo de Áudio', `<input class="ip-input" type="text" value="${d.filename||''}" oninput="updateField('${node.id}','filename',this.value)" placeholder="audio.ogg" />`);
      html += `<div class="ip-field"><label class="ip-label">Upload</label>
        <button class="btn-add-option" onclick="showToast('📎 Upload de áudio em breve!','info')">📎 Selecionar arquivo</button>
      </div>`;
      break;
    case 'menu':
      html += field('Mensagem do menu', `<textarea class="ip-input" rows="2" oninput="updateField('${node.id}','message',this.value)">${d.message||''}</textarea>`);
      html += `<div class="ip-field">
        <label class="ip-label">Opções do menu</label>
        <div class="menu-builder" id="menuBuilder-${node.id}">
          ${(d.options||[]).map((o,i) => menuOptionRow(node.id, o, i)).join('')}
        </div>
        <button class="btn-add-option" style="margin-top:.4rem" onclick="addMenuOption('${node.id}')">+ Adicionar opção</button>
      </div>`;
      break;
    case 'input':
      html += field('Variável de destino', `<input class="ip-input" type="text" value="${d.variable||'resposta'}" oninput="updateField('${node.id}','variable',this.value)" placeholder="nome_variavel" />`);
      html += field('Mensagem (prompt)', `<textarea class="ip-input" rows="2" oninput="updateField('${node.id}','prompt',this.value)">${d.prompt||''}</textarea>`);
      html += field('Tipo de dado', `<select class="ip-input ip-select" onchange="updateField('${node.id}','dataType',this.value)">
        <option value="text" ${d.dataType==='text'?'selected':''}>Texto livre</option>
        <option value="number" ${d.dataType==='number'?'selected':''}>Número</option>
        <option value="email" ${d.dataType==='email'?'selected':''}>E-mail</option>
        <option value="phone" ${d.dataType==='phone'?'selected':''}>Telefone</option>
        <option value="cpf" ${d.dataType==='cpf'?'selected':''}>CPF</option>
      </select>`);
      break;
    case 'condition':
      html += `<div class="ip-field"><label class="ip-label">Condição</label>
        <div class="condition-row">
          <input class="ip-input" type="text" value="${d.condition||''}" oninput="updateField('${node.id}','condition',this.value)" placeholder="variavel" />
          <select class="ip-input ip-select" style="min-width:60px" onchange="updateField('${node.id}','operator',this.value)">
            <option value="==" ${d.operator==='=='?'selected':''}>==</option>
            <option value="!=" ${d.operator==='!='?'selected':''}>!=</option>
            <option value=">" ${d.operator==='>'?'selected':''}>></option>
            <option value="<" ${d.operator==='<'?'selected':''}>&#60;</option>
            <option value="contains" ${d.operator==='contains'?'selected':''}>contém</option>
          </select>
          <input class="ip-input" type="text" value="${d.value||''}" oninput="updateField('${node.id}','value',this.value)" placeholder="valor" />
        </div>
      </div>`;
      break;
    case 'lead':
      html += field('Mensagem inicial', `<textarea class="ip-input" rows="2" oninput="updateField('${node.id}','message',this.value)">${d.message||''}</textarea>`);
      html += `<div class="ip-field">
        <label class="ip-label">Campos a capturar</label>
        <div class="lead-fields-builder" id="leadBuilder-${node.id}">
          ${(d.fields||[]).map((f,i) => leadFieldRow(node.id, f, i)).join('')}
        </div>
        <button class="btn-add-option" style="margin-top:.4rem" onclick="addLeadField('${node.id}')">+ Adicionar campo</button>
      </div>`;
      break;
    case 'agent':
      html += field('Mensagem de transição', `<textarea class="ip-input" rows="2" oninput="updateField('${node.id}','message',this.value)">${d.message||''}</textarea>`);
      html += field('Nome do atendente/fila', `<input class="ip-input" type="text" value="${d.agentName||''}" oninput="updateField('${node.id}','agentName',this.value)" placeholder="Atendimento Geral" />`);
      break;
    case 'redirect':
      html += field('Fluxo de destino', `<select class="ip-input ip-select" onchange="updateField('${node.id}','target',this.value)">
        <option value="">Selecionar fluxo...</option>
        <option value="Fluxo de Vendas">Fluxo de Vendas</option>
        <option value="Fluxo de Suporte">Fluxo de Suporte</option>
        <option value="Fluxo de Agendamento">Fluxo de Agendamento</option>
      </select>`);
      break;
    case 'webhook':
      html += field('URL do Webhook', `<input class="ip-input" type="url" value="${d.url||'https://'}" oninput="updateField('${node.id}','url',this.value)" placeholder="https://api.exemplo.com/webhook" />`);
      html += field('Método HTTP', `<select class="ip-input ip-select" onchange="updateField('${node.id}','method',this.value)">
        <option value="POST" ${d.method==='POST'?'selected':''}>POST</option>
        <option value="GET" ${d.method==='GET'?'selected':''}>GET</option>
        <option value="PUT" ${d.method==='PUT'?'selected':''}>PUT</option>
      </select>`);
      html += field('Body (JSON)', `<textarea class="ip-input" rows="3" oninput="updateField('${node.id}','body',this.value)" placeholder='{"chave":"valor"}'>${d.body||''}</textarea>`);
      break;
  }

  // Delay setting
  html += `<div class="ip-section-title">⏱ Configurações</div>`;
  html += field('Delay antes de enviar', `<select class="ip-input ip-select" onchange="updateField('${node.id}','delay',this.value)">
    <option value="0" ${d.delay==='0'?'selected':''}>Sem delay</option>
    <option value="1" ${d.delay==='1'?'selected':''}>1 segundo</option>
    <option value="3" ${d.delay==='3'?'selected':''}>3 segundos</option>
    <option value="5" ${d.delay==='5'?'selected':''}>5 segundos</option>
  </select>`);

  return html;
}

function field(label, inputHtml) {
  return `<div class="ip-field"><label class="ip-label">${label}</label>${inputHtml}</div>`;
}

function menuOptionRow(nodeId, value, idx) {
  return `<div class="menu-option-row" id="mo-${nodeId}-${idx}">
    <span class="mo-drag">⋮⋮</span>
    <input class="mo-input" type="text" value="${value}" oninput="updateMenuOption('${nodeId}',${idx},this.value)" placeholder="Opção ${idx+1}" />
    <button class="mo-del" onclick="removeMenuOption('${nodeId}',${idx})">✕</button>
  </div>`;
}

function leadFieldRow(nodeId, value, idx) {
  const icons = ['👤','📱','✉️','🏢','🏠','📅'];
  return `<div class="lf-row" id="lf-${nodeId}-${idx}">
    <span class="lf-icon">${icons[idx] || '📌'}</span>
    <input class="lf-input" type="text" value="${value}" oninput="updateLeadField('${nodeId}',${idx},this.value)" placeholder="Campo ${idx+1}" />
    <div class="lf-toggle on" onclick="this.classList.toggle('on')" title="Obrigatório"></div>
  </div>`;
}

// ── FIELD UPDATES ──────────────────────────────
function updateField(nodeId, field, value) {
  const node = FB.nodes.find(n => n.id === nodeId);
  if (!node) return;
  node.data = node.data || {};
  node.data[field] = value;
  // Re-render preview inline
  const body = document.querySelector(`#node-${nodeId} .node-body`);
  if (body) body.innerHTML = renderNodePreview(node);
  renderConnections();
  setFlowDraft();
}

function updateMenuOption(nodeId, idx, value) {
  const node = FB.nodes.find(n => n.id === nodeId);
  if (!node || !node.data.options) return;
  node.data.options[idx] = value;
  updateField(nodeId, '_noop', '');
}

function addMenuOption(nodeId) {
  const node = FB.nodes.find(n => n.id === nodeId);
  if (!node) return;
  node.data.options = node.data.options || [];
  const idx = node.data.options.length;
  node.data.options.push('Nova opção');
  const builder = document.getElementById('menuBuilder-' + nodeId);
  if (builder) builder.insertAdjacentHTML('beforeend', menuOptionRow(nodeId, 'Nova opção', idx));
  setFlowDraft();
}

function removeMenuOption(nodeId, idx) {
  const node = FB.nodes.find(n => n.id === nodeId);
  if (!node || !node.data.options) return;
  node.data.options.splice(idx, 1);
  openInspector(nodeId);
  updateField(nodeId, '_noop', '');
}

function updateLeadField(nodeId, idx, value) {
  const node = FB.nodes.find(n => n.id === nodeId);
  if (!node || !node.data.fields) return;
  node.data.fields[idx] = value;
  updateField(nodeId, '_noop', '');
}

function addLeadField(nodeId) {
  const node = FB.nodes.find(n => n.id === nodeId);
  if (!node) return;
  node.data.fields = node.data.fields || [];
  const idx = node.data.fields.length;
  node.data.fields.push('Novo campo');
  const builder = document.getElementById('leadBuilder-' + nodeId);
  if (builder) builder.insertAdjacentHTML('beforeend', leadFieldRow(nodeId, 'Novo campo', idx));
  setFlowDraft();
}

// ── SAVE & PUBLISH ─────────────────────────────
function saveFlow() {
  const btn = document.getElementById('saveBtn');
  const loader = document.getElementById('saveLoader');
  btn.querySelector('.save-text').style.display = 'none';
  loader.style.display = 'block';
  btn.style.pointerEvents = 'none';

  setTimeout(() => {
    btn.querySelector('.save-text').style.display = '';
    loader.style.display = 'none';
    btn.style.pointerEvents = '';
    showToast('💾 Fluxo salvo com sucesso!', 'success');
    setFlowStatus('draft');
  }, 1200);
}

function publishFlow() {
  const btn = document.getElementById('publishBtn');
  const loader = document.getElementById('pubLoader');
  btn.querySelector('.pub-text').style.display = 'none';
  loader.style.display = 'block';
  btn.style.pointerEvents = 'none';

  setTimeout(() => {
    btn.querySelector('.pub-text').style.display = '';
    loader.style.display = 'none';
    btn.style.pointerEvents = '';
    showToast('🚀 Fluxo publicado! Bot atualizado ao vivo.', 'success');
    setFlowStatus('published');
  }, 2000);
}

function setFlowDraft() {
  setFlowStatus('draft');
}

function setFlowStatus(status) {
  const pill = document.getElementById('flowStatusPill');
  const text = document.getElementById('flowStatusText');
  pill.className = 'flow-status-pill ' + status;
  text.textContent = status === 'published' ? 'Publicado' : status === 'draft' ? 'Rascunho' : 'Salvando...';
}

// ── ZOOM ───────────────────────────────────────
function zoomIn() { FB.zoom = Math.min(2, FB.zoom * 1.2); applyTransform(); updateZoomDisplay(); renderMinimap(); }
function zoomOut() { FB.zoom = Math.max(0.3, FB.zoom * 0.85); applyTransform(); updateZoomDisplay(); renderMinimap(); }
function updateZoomDisplay() { document.getElementById('zoomVal').textContent = Math.round(FB.zoom * 100) + '%'; }

function fitView() {
  if (FB.nodes.length === 0) return;
  const xs = FB.nodes.map(n => n.x), ys = FB.nodes.map(n => n.y);
  const minX = Math.min(...xs) - 60, minY = Math.min(...ys) - 60;
  const maxX = Math.max(...xs) + 340, maxY = Math.max(...ys) + 200;
  const wrap = document.getElementById('canvasWrap');
  const scaleX = wrap.clientWidth / (maxX - minX);
  const scaleY = wrap.clientHeight / (maxY - minY);
  FB.zoom = Math.min(Math.min(scaleX, scaleY) * 0.9, 1.5);
  FB.pan.x = -minX + (wrap.clientWidth / FB.zoom - (maxX - minX)) / 2;
  FB.pan.y = -minY + (wrap.clientHeight / FB.zoom - (maxY - minY)) / 2;
  applyTransform();
  updateZoomDisplay();
  renderMinimap();
}

// ── HISTORY (UNDO/REDO) ────────────────────────
function saveHistory() {
  FB.history.push(JSON.stringify({ nodes: FB.nodes, connections: FB.connections }));
  if (FB.history.length > 50) FB.history.shift();
  FB.future = [];
}

function undoAction() {
  if (FB.history.length === 0) { showToast('Nada para desfazer', 'info'); return; }
  FB.future.push(JSON.stringify({ nodes: FB.nodes, connections: FB.connections }));
  const prev = JSON.parse(FB.history.pop());
  FB.nodes = prev.nodes;
  FB.connections = prev.connections;
  FB.selected = null;
  renderAll();
  renderMinimap();
  showToast('↩ Ação desfeita', 'info');
}

function redoAction() {
  if (FB.future.length === 0) { showToast('Nada para refazer', 'info'); return; }
  FB.history.push(JSON.stringify({ nodes: FB.nodes, connections: FB.connections }));
  const next = JSON.parse(FB.future.pop());
  FB.nodes = next.nodes;
  FB.connections = next.connections;
  renderAll();
  renderMinimap();
  showToast('↪ Ação refeita', 'info');
}

// ── CLEAR ──────────────────────────────────────
function clearCanvas() {
  if (!confirm('Limpar todo o fluxo? Esta ação não pode ser desfeita.')) return;
  saveHistory();
  FB.nodes = [{ id: 'n1', type: 'start', x: 120, y: 160, data: { message: 'Olá! Como posso te ajudar?' } }];
  FB.connections = [];
  FB.selected = null;
  closeInspector();
  renderAll();
  renderMinimap();
  showToast('🧹 Canvas limpo', 'info');
}

// ── MINIMAP ────────────────────────────────────
function renderMinimap() {
  const canvas = document.getElementById('minimapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 160, H = 100;
  ctx.clearRect(0, 0, W, H);

  if (FB.nodes.length === 0) return;

  const xs = FB.nodes.map(n => n.x), ys = FB.nodes.map(n => n.y);
  const minX = Math.min(...xs) - 40, minY = Math.min(...ys) - 40;
  const maxX = Math.max(...xs) + 280, maxY = Math.max(...ys) + 140;
  const scale = Math.min(W / (maxX - minX), H / (maxY - minY)) * 0.9;

  const offX = (W - (maxX - minX) * scale) / 2 - minX * scale;
  const offY = (H - (maxY - minY) * scale) / 2 - minY * scale;

  // Connections
  FB.connections.forEach(conn => {
    const f = FB.nodes.find(n => n.id === conn.from);
    const t = FB.nodes.find(n => n.id === conn.to);
    if (!f || !t) return;
    ctx.strokeStyle = conn.type === 'yes' ? 'rgba(34,197,94,.5)' : conn.type === 'no' ? 'rgba(239,68,68,.5)' : 'rgba(59,130,246,.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(f.x * scale + offX, f.y * scale + offY);
    ctx.lineTo(t.x * scale + offX, t.y * scale + offY);
    ctx.stroke();
  });

  // Nodes
  FB.nodes.forEach(node => {
    const def = BLOCK_DEFS[node.type] || BLOCK_DEFS.text;
    ctx.fillStyle = node.id === FB.selected ? '#3B82F6' : 'rgba(59,130,246,.4)';
    ctx.beginPath();
    ctx.roundRect(node.x * scale + offX, node.y * scale + offY, 30 * scale, 12 * scale, 3);
    ctx.fill();
  });
}

// ── PREVIEW ────────────────────────────────────
let previewIdx = 0;
let previewNodes = [];

function togglePreview() {
  const modal = document.getElementById('previewModal');
  modal.classList.toggle('open');
  if (modal.classList.contains('open')) startPreview();
}

function startPreview() {
  previewIdx = 0;
  previewNodes = FB.nodes.filter(n => n.type !== 'end').sort((a,b) => a.x - b.x);
  const msgs = document.getElementById('previewMessages');
  msgs.innerHTML = '';
  addPreviewBotMsg('Iniciando preview do fluxo... 🤖');
  setTimeout(() => advancePreview(), 600);
}

function advancePreview() {
  const msgs = document.getElementById('previewMessages');
  const node = previewNodes[previewIdx];
  if (!node) {
    addPreviewBotMsg('✅ Fluxo concluído!');
    return;
  }
  previewIdx++;

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'pm-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const d = node.data || {};
    switch(node.type) {
      case 'start':
      case 'text':
      case 'end':
        addPreviewBotMsg(d.message || '[Mensagem vazia]');
        break;
      case 'image':
        addPreviewBotMsg('🖼️ ' + (d.caption || '[Imagem]'));
        break;
      case 'audio':
        addPreviewBotMsg('🎵 [Mensagem de voz]');
        break;
      case 'menu':
        if (d.message) addPreviewBotMsg(d.message);
        const optDiv = document.createElement('div');
        optDiv.className = 'pm-menu-options';
        (d.options || ['Opção 1']).forEach(o => {
          const btn = document.createElement('div');
          btn.className = 'pm-option';
          btn.textContent = o;
          btn.onclick = () => {
            addPreviewUserMsg(o);
            setTimeout(() => advancePreview(), 500);
          };
          optDiv.appendChild(btn);
        });
        msgs.appendChild(optDiv);
        break;
      case 'lead':
        addPreviewBotMsg(d.message || 'Por favor, compartilhe seus dados:');
        (d.fields || []).forEach(f => addPreviewBotMsg(`📌 ${f}: ___________`));
        break;
      case 'agent':
        addPreviewBotMsg(d.message || 'Encaminhando...');
        addPreviewBotMsg('👨‍💼 Conectando com ' + (d.agentName || 'atendente') + '...');
        break;
      case 'condition':
        addPreviewBotMsg(`⚡ Verificando: ${d.condition || 'variavel'} ${d.operator || '=='} ${d.value || 'valor'}`);
        break;
      default:
        addPreviewBotMsg(`[${BLOCK_DEFS[node.type]?.label || node.type}]`);
    }
    msgs.scrollTop = msgs.scrollHeight;
  }, 700);
}

function addPreviewBotMsg(text) {
  const msgs = document.getElementById('previewMessages');
  const div = document.createElement('div');
  div.className = 'pm-bubble pm-bot';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addPreviewUserMsg(text) {
  const msgs = document.getElementById('previewMessages');
  const div = document.createElement('div');
  div.className = 'pm-bubble pm-user';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

// ── BLOCK PICKER ──────────────────────────────
function populateBlockPicker() {
  const grid = document.getElementById('bpbGrid');
  if (!grid) return;
  grid.innerHTML = Object.entries(BLOCK_DEFS).map(([type, def]) => `
    <div class="bpb-item" onclick="addBlock('${type}');closeBlockPicker()">
      <div class="bpb-icon" style="background:${def.color}">${def.icon}</div>
      <div class="bpb-info">
        <span class="bpb-name">${def.label}</span>
        <span class="bpb-desc">${getBlockDesc(type)}</span>
      </div>
    </div>
  `).join('');
}

function getBlockDesc(type) {
  const descs = {
    start:'Ponto de entrada do fluxo', text:'Enviar mensagem de texto', image:'Enviar imagem ou mídia',
    audio:'Enviar mensagem de voz', menu:'Menu com opções clicáveis', input:'Capturar resposta do usuário',
    condition:'Lógica condicional if/else', lead:'Salvar dados do lead', agent:'Transferir para atendente humano',
    redirect:'Ir para outro fluxo', webhook:'Chamar API externa', end:'Finalizar conversa'
  };
  return descs[type] || '';
}

function closeBlockPicker() {
  document.getElementById('blockPickerModal').classList.remove('open');
}

// ── FLOW LIST ─────────────────────────────────
const savedFlows = [
  { name: 'Fluxo de Boas-vindas', nodes: 8, status: 'published', channel: '🟢 WhatsApp', updated: 'há 2 horas' },
  { name: 'Captura de Leads', nodes: 5, status: 'published', channel: '📸 Instagram + 🟢 WhatsApp', updated: 'há 1 dia' },
  { name: 'Suporte ao Cliente', nodes: 12, status: 'draft', channel: '🟢 WhatsApp', updated: 'há 3 dias' },
  { name: 'Fluxo de Agendamento', nodes: 7, status: 'draft', channel: '🟢 WhatsApp', updated: 'há 1 semana' },
];

function populateFlowList() {
  const list = document.getElementById('flpList');
  if (!list) return;
  list.innerHTML = savedFlows.map((f, i) => `
    <div class="flp-item" onclick="loadFlow(${i})">
      <div class="flp-icon" style="background:linear-gradient(135deg,rgba(59,130,246,.15),rgba(139,92,246,.15));border:1px solid rgba(59,130,246,.2)">🔀</div>
      <div class="flp-info">
        <div class="flp-name">${f.name}</div>
        <div class="flp-meta">${f.nodes} blocos · ${f.channel} · atualizado ${f.updated}</div>
      </div>
      <span class="flp-badge ${f.status === 'published' ? 'flp-published' : 'flp-draft'}">${f.status === 'published' ? 'Publicado' : 'Rascunho'}</span>
    </div>
  `).join('');
}

function loadFlow(idx) {
  const flow = savedFlows[idx];
  document.getElementById('flowNameDisplay').textContent = flow.name;
  setFlowStatus(flow.status);
  closeFlowList();
  showToast(`📂 Fluxo "${flow.name}" carregado`, 'success');
}

function showFlowList() {
  document.getElementById('flowListOverlay').classList.add('open');
}

function closeFlowList() {
  document.getElementById('flowListOverlay').classList.remove('open');
}

function createNewFlow() {
  closeFlowList();
  clearCanvas();
  document.getElementById('flowNameDisplay').textContent = 'Novo Fluxo';
  setFlowStatus('draft');
  showToast('✨ Novo fluxo criado!', 'success');
}

// ── SEARCH BLOCKS ──────────────────────────────
function filterBlocks(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.block-item').forEach(el => {
    const name = el.querySelector('.bi-name').textContent.toLowerCase();
    const desc = el.querySelector('.bi-desc').textContent.toLowerCase();
    el.classList.toggle('hidden', q && !name.includes(q) && !desc.includes(q));
  });
}

// ── DRAG & DROP ────────────────────────────────
function dragStart(e) {
  e.dataTransfer.setData('blockType', e.currentTarget.dataset.type);
}

function dropBlock(e) {
  const type = e.dataTransfer.getData('blockType');
  if (!type) return;
  const wrap = document.getElementById('canvasWrap');
  const rect = wrap.getBoundingClientRect();
  const x = (e.clientX - rect.left) / FB.zoom - FB.pan.x;
  const y = (e.clientY - rect.top) / FB.zoom - FB.pan.y;
  const id = 'n' + FB.idCounter++;
  const node = { id, type, x, y, data: {} };
  saveHistory();
  FB.nodes.push(node);
  const container = document.getElementById('canvasNodes');
  container.appendChild(createNodeEl(node));
  renderConnections();
  updateInfo();
  renderMinimap();
  selectNode(id);
  setFlowDraft();
}

// ── PANELS ────────────────────────────────────
function toggleBlocksPanel() {
  document.getElementById('blocksPanel').classList.toggle('collapsed');
}

// ── INFO BAR ──────────────────────────────────
function updateInfo() {
  const el = document.getElementById('btInfo');
  if (el) el.textContent = `${FB.nodes.length} blocos · ${FB.connections.length} conexões`;
}

function updateStatusBar() {
  updateInfo();
  updateZoomDisplay();
  applyTransform();
}

// ── TOAST ──────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'toastOut .3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 2500);
}
