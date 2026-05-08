/* ================================================
   GVP BOT — IA CONFIG ENGINE
   ================================================ */

// ── STATE ──────────────────────────────────────
const IA = {
  botName: 'Luna',
  tone: 'formal',
  temperature: 0.7,
  model: 'gpt4o',
  previewMsgs: 1,
  testMsgs: 1,
};

// ── INIT ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateTokenCount();
  initCharCount();
  populateAutoResponses();
  populateFAQ();
  animateUsageBars();
  updateRangeTrack(document.getElementById('tempRange'));
  updateRangeTrack(document.getElementById('lenRange'));
  updateRangeTrack(document.getElementById('emojiRange'));
});

// ── TABS ───────────────────────────────────────
function switchTab(btn, panel) {
  document.querySelectorAll('.ia-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ia-tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + panel).classList.add('active');
}

// ── TOKEN COUNT ────────────────────────────────
function updateTokenCount() {
  const ta = document.getElementById('systemPrompt');
  if (!ta) return;
  const approx = Math.round(ta.value.length / 3.5);
  document.getElementById('tokenCount').textContent = approx + ' tokens estimados';
}

function clearPrompt() {
  document.getElementById('systemPrompt').value = '';
  updateTokenCount();
  liveUpdate();
  showToast('🗑 Prompt limpo', 'info');
}

// ── PROMPT TEMPLATES ───────────────────────────
const TEMPLATES = {
  professional: `Você é ${'{bot_name}'}, atendente virtual profissional. Trate todos os clientes com respeito e formalidade. Use linguagem clara e objetiva. Forneça informações precisas sobre produtos e serviços. Sempre ofereça ajuda adicional ao final de cada resposta.`,
  friendly: `Você é ${'{bot_name}'}, assistente virtual super animado e amigável! 😊 Trate os clientes como amigos. Use linguagem descontraída, emojis e mostre entusiasmo genuíno. Faça com que cada interação seja agradável e memorável!`,
  sales: `Você é ${'{bot_name}'}, especialista em vendas. Seu objetivo é ajudar clientes a encontrar o produto perfeito e fechar vendas. Destaque benefícios, crie urgência sutilmente, ofereça condições especiais e sempre conduza para o fechamento. Seja persuasivo mas nunca agressivo.`,
  support: `Você é ${'{bot_name}'}, agente de suporte técnico. Seu objetivo é resolver problemas dos clientes de forma rápida e eficiente. Seja paciente, faça perguntas diagnósticas relevantes, explique soluções passo a passo e confirme sempre que o problema foi resolvido.`,
  restaurant: `Você é ${'{bot_name}'}, atendente virtual do restaurante. Apresente o cardápio com entusiasmo, responda dúvidas sobre ingredientes e alergênicos, facilite pedidos delivery, informe sobre promoções do dia e tempos de espera. Seja acolhedor e deixe o cliente com água na boca! 🍕`,
};

function insertPromptTemplate(type) {
  const ta = document.getElementById('systemPrompt');
  const name = document.getElementById('botName')?.value || 'Assistente';
  ta.value = TEMPLATES[type].replace(/{bot_name}/g, name);
  updateTokenCount();
  liveUpdate();
  showToast(`✅ Template "${type}" aplicado!`, 'success');
  // Animate
  ta.style.background = 'rgba(59,130,246,.08)';
  setTimeout(() => ta.style.background = '', 600);
}

// ── TONE ───────────────────────────────────────
function selectTone(el, tone) {
  document.querySelectorAll('.tone-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  IA.tone = tone;
  document.getElementById('pcwTone').textContent = 'Tom: ' + el.querySelector('.tone-name').textContent;
  liveUpdate();
  showToast(`🎭 Tom "${el.querySelector('.tone-name').textContent}" selecionado`, 'success');
}

// ── SLIDERS ────────────────────────────────────
function updateLenLabel(v) {
  document.getElementById('lenVal').textContent = v == 1 ? 'Curto' : v == 2 ? 'Médio' : 'Longo';
}
function updateEmojiLabel(v) {
  document.getElementById('emojiVal').textContent = v == 1 ? 'Nunca' : v == 2 ? 'Moderado' : 'Frequente';
}
function updateRangeTrack(input) {
  if (!input) return;
  const min = parseFloat(input.min), max = parseFloat(input.max), val = parseFloat(input.value);
  const pct = ((val - min) / (max - min)) * 100;
  input.style.setProperty('--pct', pct + '%');
  input.style.background = `linear-gradient(90deg, var(--blue) ${pct}%, rgba(255,255,255,.1) ${pct}%)`;
  input.addEventListener('input', () => {
    const p = ((parseFloat(input.value) - min) / (max - min)) * 100;
    input.style.background = `linear-gradient(90deg, var(--blue) ${p}%, rgba(255,255,255,.1) ${p}%)`;
  });
}

// ── LIVE UPDATE ────────────────────────────────
function liveUpdate() {
  const name = document.getElementById('botName')?.value || 'Assistente';
  IA.botName = name;
  const temp = document.getElementById('tempRange')?.value || '0.7';
  IA.temperature = temp;
  document.getElementById('previewBotName').textContent = 'Testando: ' + name;
  document.getElementById('pcwTemp').textContent = temp;
}

// ── RESTRICTIONS ──────────────────────────────
function addRestriction() {
  const list = document.getElementById('restrictionsList');
  const item = document.createElement('div');
  item.className = 'restriction-item';
  item.innerHTML = `
    <div class="ri-toggle" onclick="this.classList.toggle('active')"></div>
    <input style="flex:1;background:none;border:none;outline:none;color:var(--text);font-size:.85rem;font-family:inherit" placeholder="Descreva a restrição..." value="" />
    <button onclick="this.parentElement.remove()" style="color:#EF4444;font-size:.75rem;padding:.2rem .4rem;border-radius:4px;transition:var(--transition)" onmouseover="this.style.background='rgba(239,68,68,.1)'" onmouseout="this.style.background=''">✕</button>
  `;
  list.appendChild(item);
  item.querySelector('input').focus();
}

// ── PREVIEW CHAT ───────────────────────────────
const BOT_RESPONSES = {
  greeting: ['Olá! Que ótimo ter você aqui! 😊 Como posso te ajudar?', 'Oi! Tudo bem? Estou aqui para ajudar com o que precisar! 🌟', 'Bem-vindo! Sou a ' + (document.getElementById('botName')?.value || 'Luna') + '. Como posso ajudar?'],
  products: ['Temos uma coleção incrível! 👗 Nossos destaques são vestidos (R$89-249), blusas (R$49-189) e calças (R$89-249). Tem alguma categoria específica de interesse?', 'Nossa coleção de verão acabou de chegar! 🌸 Peças exclusivas com preços a partir de R$49. Quer ver o catálogo completo?'],
  price: ['Nossos preços são super acessíveis! 💰 A partir de R$49 para blusas e até R$249 para peças especiais. Temos também parcelamento em até 10x sem juros no cartão!', 'Oferecemos ótimo custo-benefício! Peças a partir de R$49. Aceitamos PIX com 5% de desconto extra! 🎉'],
  delivery: ['Entregamos para todo o Brasil! 🚚 Capital SP em 2 dias úteis e outros estados em 5-7 dias. Frete grátis acima de R$199!', 'Entrega rápida e segura! São Paulo capital em até 2 dias, restante do Brasil em 5-7 dias úteis. Frete grátis nas compras acima de R$199! 🎁'],
  default: ['Entendi! 😊 Posso te ajudar com mais alguma coisa?', 'Que ótimo! Tem mais alguma dúvida que posso esclarecer?', 'Perfeito! Estou aqui para o que precisar. Quer conhecer nossa coleção atual?', 'Com certeza! Nossa equipe está sempre à disposição. Posso ajudar com mais alguma informação?', 'Boa pergunta! Vou verificar isso para você agora mesmo! 🔍'],
};

function getAIResponse(msg) {
  const m = msg.toLowerCase();
  if (m.match(/oi|olá|ola|bom dia|boa tarde|boa noite|hello|hi/)) return pick(BOT_RESPONSES.greeting);
  if (m.match(/produto|roupa|vestido|blusa|calça|item|catálogo|coleção/)) return pick(BOT_RESPONSES.products);
  if (m.match(/preço|quanto|valor|custo|caro|barato|pagamento|pix|cartão/)) return pick(BOT_RESPONSES.price);
  if (m.match(/entrega|frete|prazo|envio|chegada|deliver/)) return pick(BOT_RESPONSES.delivery);
  return pick(BOT_RESPONSES.default);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function sendPreviewMsg(text) {
  const inp = document.getElementById('pcwInput');
  if (inp) inp.value = text;
  sendPreviewChat();
}

function sendPreviewChat() {
  const inp = document.getElementById('pcwInput');
  const msg = inp?.value?.trim();
  if (!msg) return;
  inp.value = '';
  document.getElementById('pcwSuggestions').style.display = 'none';

  const msgs = document.getElementById('pcwMessages');
  // User bubble
  appendPreviewMsg(msgs, 'user', msg);
  IA.previewMsgs++;
  document.getElementById('pcwMsgCount').textContent = IA.previewMsgs + ' mensagens';

  // Typing indicator
  const typing = appendTyping(msgs);
  setTimeout(() => {
    typing.remove();
    const response = getAIResponse(msg);
    appendPreviewMsg(msgs, 'bot', response);
    IA.previewMsgs++;
    document.getElementById('pcwMsgCount').textContent = IA.previewMsgs + ' mensagens';
    msgs.scrollTop = msgs.scrollHeight;
  }, 900 + Math.random() * 600);
}

function appendPreviewMsg(container, role, text) {
  const div = document.createElement('div');
  div.className = 'pcw-msg ' + role;
  const avatarStyle = role === 'bot' ? 'background:linear-gradient(135deg,#3B82F6,#8B5CF6)' : 'background:linear-gradient(135deg,#22C55E,#16A34A)';
  const avatarText = role === 'bot' ? '🤖' : '👤';
  div.innerHTML = `
    <div class="pcw-avatar" style="${avatarStyle}">${avatarText}</div>
    <div class="pcw-bubble">${text}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function appendTyping(container) {
  const div = document.createElement('div');
  div.className = 'pcw-msg bot';
  div.innerHTML = `<div class="pcw-avatar" style="background:linear-gradient(135deg,#3B82F6,#8B5CF6)">🤖</div><div class="pcw-typing"><span></span><span></span><span></span></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function resetPreviewChat() {
  const msgs = document.getElementById('pcwMessages');
  const name = document.getElementById('botName')?.value || 'Luna';
  msgs.innerHTML = `<div class="pcw-msg bot">
    <div class="pcw-avatar" style="background:linear-gradient(135deg,#3B82F6,#8B5CF6)">🤖</div>
    <div class="pcw-bubble">Olá! Sou a <strong>${name}</strong>, como posso te ajudar? 😊</div>
  </div>`;
  document.getElementById('pcwSuggestions').style.display = '';
  IA.previewMsgs = 1;
  document.getElementById('pcwMsgCount').textContent = '1 mensagem';
  showToast('↺ Preview reiniciado', 'info');
}

// ── TEST CHAT MODAL ────────────────────────────
function openTestChat() {
  const name = document.getElementById('botName')?.value || 'Luna';
  const tone = document.querySelector('.tone-card.selected')?.querySelector('.tone-name')?.textContent || 'Formal';
  document.getElementById('tcbPersonality').textContent = name;
  document.getElementById('tcbTone').textContent = tone;
  document.getElementById('testChatModal').classList.add('open');
  document.getElementById('tcbInput').focus();
}
function closeTestChat() {
  document.getElementById('testChatModal').classList.remove('open');
}

function sendTestMsg() {
  const inp = document.getElementById('tcbInput');
  const msg = inp?.value?.trim();
  if (!msg) return;
  inp.value = '';
  const msgs = document.getElementById('tcbMessages');
  appendPreviewMsg(msgs, 'user', msg);
  IA.testMsgs++;
  const typing = appendTyping(msgs);
  setTimeout(() => {
    typing.remove();
    appendPreviewMsg(msgs, 'bot', getAIResponse(msg));
    IA.testMsgs++;
    document.getElementById('tcbMsgCount').textContent = IA.testMsgs + ' mensagens';
  }, 800 + Math.random() * 700);
}

function clearTestChat() {
  const name = document.getElementById('botName')?.value || 'Luna';
  const tone = document.querySelector('.tone-card.selected')?.querySelector('.tone-name')?.textContent || 'Formal';
  document.getElementById('tcbMessages').innerHTML = `
    <div class="tcb-system-msg">Sistema inicializado · Personalidade: <strong>${name}</strong> · Tom: <strong>${tone}</strong></div>
    <div class="pcw-msg bot">
      <div class="pcw-avatar" style="background:linear-gradient(135deg,#3B82F6,#8B5CF6)">🤖</div>
      <div class="pcw-bubble">Olá! Sou <strong>${name}</strong>. Como posso te ajudar? 😊</div>
    </div>`;
  IA.testMsgs = 1;
  document.getElementById('tcbMsgCount').textContent = '1 mensagem';
}

function exportTestChat() {
  showToast('📋 Conversa copiada para área de transferência!', 'success');
}

// ── SAVE ──────────────────────────────────────
function saveAll() {
  const btn = document.getElementById('saveAllText');
  const loader = document.getElementById('saveAllLoader');
  btn.style.display = 'none';
  loader.style.display = 'block';

  setTimeout(() => {
    btn.style.display = '';
    loader.style.display = 'none';
    showToast('✅ Configurações salvas com sucesso!', 'success');
  }, 1600);
}

// ── TRAINING ──────────────────────────────────
function simulateUpload() {
  const names = ['novo_catalogo.pdf', 'faq_clientes.txt', 'lista_produtos.csv', 'manual_atendimento.docx'];
  const name = names[Math.floor(Math.random() * names.length)];
  const ext = name.split('.').pop().toUpperCase();
  const list = document.getElementById('docsList');

  // Add processing item
  const item = document.createElement('div');
  item.className = 'doc-item';
  item.innerHTML = `
    <div class="doc-icon ${ext.toLowerCase()}">${ext}</div>
    <div class="doc-info">
      <span class="doc-name">${name}</span>
      <span class="doc-meta">Fazendo upload...</span>
    </div>
    <div class="doc-status processing">⏳ Processando</div>
    <button class="doc-del" onclick="removeDoc(this)">✕</button>
  `;
  list.insertBefore(item, list.firstChild);
  showToast('📎 Fazendo upload...', 'info');

  // Upload progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 25) + 10;
    item.querySelector('.doc-meta').textContent = `Processando... ${Math.min(progress, 100)}%`;
    if (progress >= 100) {
      clearInterval(interval);
      item.querySelector('.doc-status').className = 'doc-status trained';
      item.querySelector('.doc-status').textContent = '✓ Treinado';
      item.querySelector('.doc-meta').textContent = `${(Math.random() * 3 + 0.5).toFixed(1)} MB · ${Math.floor(Math.random() * 100) + 20} fragmentos · agora`;
      const count = parseInt(document.getElementById('docCount').textContent) + 1;
      document.getElementById('docCount').textContent = count;
      const chunks = parseInt(document.getElementById('chunkCount').textContent) + Math.floor(Math.random() * 60) + 20;
      document.getElementById('chunkCount').textContent = chunks;
      showToast(`✅ "${name}" treinado com sucesso!`, 'success');
    }
  }, 400);
}

function removeDoc(btn) {
  const item = btn.closest('.doc-item');
  item.style.opacity = '0';
  item.style.transform = 'translateX(20px)';
  item.style.transition = 'all .3s ease';
  setTimeout(() => {
    item.remove();
    const count = Math.max(0, parseInt(document.getElementById('docCount').textContent) - 1);
    document.getElementById('docCount').textContent = count;
  }, 300);
  showToast('🗑 Documento removido', 'info');
}

function saveKnowledge() {
  const btn = event.target;
  btn.textContent = '⏳ Salvando...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✅ Salvo!';
    btn.style.background = 'rgba(34,197,94,.2)';
    btn.style.borderColor = 'rgba(34,197,94,.3)';
    btn.style.color = '#22C55E';
    setTimeout(() => {
      btn.textContent = '💾 Salvar conhecimento';
      btn.disabled = false;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 2000);
    showToast('✅ Conhecimento salvo!', 'success');
  }, 1200);
}

function retrainIA() {
  const text = document.getElementById('retrainText');
  const loader = document.getElementById('retrainLoader');
  text.style.display = 'none';
  loader.style.display = 'block';

  const steps = [
    { icon: '⏳', label: 'Próximo retreinamento', meta: 'Processando documentos...', status: 'running' },
  ];
  const tp4 = document.getElementById('tp4');

  setTimeout(() => {
    tp4.querySelector('.tpi-icon').textContent = '🔄';
    tp4.querySelector('.tpi-info span').textContent = 'Retreinando modelo';
    tp4.querySelector('.tpi-meta').textContent = 'Vetorizando documentos... 45%';
    tp4.className = 'tp-item running';
    tp4.querySelector('.tpi-time').textContent = 'agora';
  }, 800);

  setTimeout(() => {
    tp4.querySelector('.tpi-icon').textContent = '✅';
    tp4.querySelector('.tpi-info span').textContent = 'Modelo retreinado com sucesso!';
    tp4.querySelector('.tpi-meta').textContent = `${document.getElementById('docCount').textContent} arquivos · ${document.getElementById('chunkCount').textContent} fragmentos`;
    tp4.className = 'tp-item done';
    tp4.querySelector('.tpi-time').textContent = 'agora mesmo';
    text.style.display = '';
    loader.style.display = 'none';
    showToast('🎯 IA retreinada com sucesso!', 'success');
  }, 3000);
}

function handleFileDrop(e) {
  e.preventDefault();
  document.getElementById('uploadArea').classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length > 0) simulateUpload();
}

// ── KNOWLEDGE EDITOR TABS ─────────────────────
let currentKETab = 'sobre';
function switchKETab(btn, tab) {
  document.querySelectorAll('.ke-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.ke-textarea').forEach(ta => ta.style.display = 'none');
  document.getElementById('ke-' + tab).style.display = '';
  currentKETab = tab;
  updateCharCount();
}

function initCharCount() {
  document.querySelectorAll('.ke-textarea').forEach(ta => {
    ta.addEventListener('input', updateCharCount);
  });
  updateCharCount();
}

function updateCharCount() {
  const active = document.getElementById('ke-' + currentKETab);
  const count = active ? active.value.length : 0;
  const el = document.getElementById('keCharCount');
  if (el) el.textContent = count.toLocaleString('pt-BR') + ' caracteres';
}

// ── AUTO RESPONSES ─────────────────────────────
const defaultResponses = [
  { trigger: 'oi / olá / bom dia', response: 'Olá! Bem-vindo à {{nome_empresa}}! 😊 Como posso te ajudar hoje?', open: true },
  { trigger: 'preço / quanto custa', response: 'Nossos produtos partem de R$49. Posso te enviar o catálogo completo com todos os preços! 💰', open: false },
  { trigger: 'entrega / frete', response: 'Entregamos para todo o Brasil! Frete grátis acima de R$199. Prazo: SP capital 2 dias, outros estados 5-7 dias úteis. 🚚', open: false },
  { trigger: 'cancelar / cancelamento', response: 'Entendo! Para cancelamentos, entre em contato pelo e-mail cancelamento@empresa.com ou nosso WhatsApp {{telefone_suporte}}. Podemos te ajudar de outra forma?', open: false },
  { trigger: 'falar com humano / atendente', response: 'Claro! Vou te transferir para um de nossos atendentes agora mesmo. Um momento! 👨‍💼', open: false },
];

function populateAutoResponses() {
  const list = document.getElementById('autoResponsesList');
  if (!list) return;
  list.innerHTML = defaultResponses.map((r, i) => buildARItem(r, i)).join('');
}

function buildARItem(r, i) {
  return `<div class="ar-item">
    <div class="ar-header" onclick="toggleAR(this)">
      <div class="ar-trigger">🔍 ${r.trigger}</div>
      <span style="font-size:.7rem;color:var(--text-muted)">→</span>
      <div class="ar-response-preview">${r.response.slice(0, 50)}...</div>
      <div class="toggle-sw-sm active ar-toggle" onclick="event.stopPropagation();this.classList.toggle('active')"></div>
      <span class="ar-arrow">▾</span>
    </div>
    <div class="ar-body ${r.open ? 'open' : ''}">
      <div>
        <div class="ar-label">Gatilhos (palavras-chave)</div>
        <input class="ar-input" type="text" value="${r.trigger}" placeholder="palavra1 / palavra2 / frase exata" />
      </div>
      <div>
        <div class="ar-label">Resposta automática</div>
        <textarea class="ar-input ar-textarea">${r.response}</textarea>
      </div>
      <button class="ar-del" onclick="this.closest('.ar-item').remove();showToast('🗑 Resposta removida','info')">🗑 Remover esta resposta</button>
    </div>
  </div>`;
}

function toggleAR(header) {
  const body = header.nextElementSibling;
  const arrow = header.querySelector('.ar-arrow');
  body.classList.toggle('open');
  arrow.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : '';
  arrow.style.transition = 'transform .3s ease';
}

function addAutoResponse() {
  const list = document.getElementById('autoResponsesList');
  const newItem = buildARItem({ trigger: 'novo gatilho', response: 'Nova resposta automática...', open: true }, Date.now());
  list.insertAdjacentHTML('afterbegin', newItem);
  list.querySelector('.ar-input').focus();
  showToast('✅ Nova resposta adicionada!', 'success');
}

// ── FAQ ───────────────────────────────────────
const defaultFAQ = [
  { q: 'Qual é o prazo de entrega?', a: 'São Paulo capital: 2 dias úteis. Interior SP e outros estados: 5-7 dias úteis. Temos opção de entrega expressa em 24h para a capital!', cat: 'Entrega' },
  { q: 'Como funciona a troca?', a: 'Você tem 30 dias corridos após a compra para fazer trocas. Basta entrar em contato pelo WhatsApp ou email. Para trocas por defeito, o frete é por nossa conta!', cat: 'Trocas' },
  { q: 'Quais formas de pagamento aceitam?', a: 'Aceitamos: Cartão de crédito (até 10x sem juros), PIX (5% desconto), boleto bancário e transferência bancária.', cat: 'Pagamento' },
  { q: 'Vocês têm loja física?', a: 'Sim! Estamos em Pinheiros, São Paulo. Funcionamos de Seg-Sex 10h-19h e Sáb 10h-16h. Nossa loja fica na Rua da Moda, 123.', cat: 'Sobre nós' },
];

function populateFAQ() {
  const list = document.getElementById('faqEditorList');
  if (!list) return;
  list.innerHTML = defaultFAQ.map((f, i) => buildFAQItem(f, i)).join('');
}

function buildFAQItem(f, i) {
  return `<div class="faq-ed-item">
    <input class="faq-ed-q" type="text" value="${f.q}" placeholder="Pergunta frequente..." />
    <textarea class="faq-ed-a" placeholder="Resposta detalhada...">${f.a}</textarea>
    <div class="faq-ed-footer">
      <span class="faq-ed-cat">📁 ${f.cat}</span>
      <button class="faq-ed-del" onclick="this.closest('.faq-ed-item').remove();showToast('🗑 FAQ removida','info')">🗑 Remover</button>
    </div>
  </div>`;
}

function addFAQ() {
  const list = document.getElementById('faqEditorList');
  const item = buildFAQItem({ q: '', a: '', cat: 'Geral' }, Date.now());
  list.insertAdjacentHTML('afterbegin', item);
  list.querySelector('.faq-ed-q').focus();
  showToast('✅ Nova FAQ adicionada!', 'success');
}

// ── MODEL SELECTOR ─────────────────────────────
function selectModel(el, model) {
  document.querySelectorAll('.model-option').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
  IA.model = model;
  const name = el.querySelector('.mo-name').textContent;
  document.querySelectorAll('.ia-model-badge span:nth-child(2)').forEach(s => s.textContent = name);
  showToast(`🤖 Modelo "${name}" selecionado`, 'success');
}

// ── VARIABLES ─────────────────────────────────
function copyVar(el) {
  navigator.clipboard?.writeText(el.textContent).catch(() => {});
  el.classList.add('copied');
  setTimeout(() => el.classList.remove('copied'), 1500);
  showToast(`📋 ${el.textContent} copiado!`, 'success');
}

// ── USAGE BARS ────────────────────────────────
function animateUsageBars() {
  setTimeout(() => {
    document.querySelectorAll('.ub-fill').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => bar.style.width = w, 100);
    });
  }, 400);
}

// ── TOAST ──────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
