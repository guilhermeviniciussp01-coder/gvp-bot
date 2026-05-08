/* ================================================
   GVP BOT — PLANOS & PAGAMENTOS ENGINE
   ================================================ */

// ── STATE ──────────────────────────────────────
const PAY = {
  isAnnual: false,
  selectedPlan: null,
  method: 'card',
  pixTimerInterval: null,
  pixSeconds: 600,
};

const PLANS = {
  basico:   { name:'Básico',   icon:'🌱', monthly:47,  annual:37,  color:'#64748B' },
  business: { name:'Business', icon:'🚀', monthly:97,  annual:77,  color:'#3B82F6' },
  premium:  { name:'Premium',  icon:'💎', monthly:247, annual:197, color:'#8B5CF6' },
};

// ── INIT ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildComparisonTable();
  generateBoletoBarcode();
  generatePixQR();
  setBoletoVenc();
  animateUsageBars();
});

// ── BILLING TOGGLE ─────────────────────────────
function toggleBilling() {
  PAY.isAnnual = !PAY.isAnnual;
  const knob = document.getElementById('btKnob');
  const ml   = document.getElementById('btMonthly');
  const al   = document.getElementById('btAnnual');

  knob.classList.toggle('annual', PAY.isAnnual);
  ml.classList.toggle('active', !PAY.isAnnual);
  al.classList.toggle('active', PAY.isAnnual);

  // Animate price changes
  document.querySelectorAll('.pc-amount').forEach(el => {
    const val = PAY.isAnnual ? el.dataset.annual : el.dataset.monthly;
    el.style.transform = 'scale(.85)';
    el.style.opacity   = '0';
    setTimeout(() => {
      el.textContent     = val;
      el.style.transform = 'scale(1)';
      el.style.opacity   = '1';
      el.style.transition = 'all .25s cubic-bezier(.4,0,.2,1)';
    }, 180);
  });

  // Show/hide annual notes
  [1,2,3].forEach(i => {
    const note = document.getElementById('annualNote' + i);
    if (note) note.style.display = PAY.isAnnual ? 'block' : 'none';
  });

  document.querySelectorAll('.pc-billing-note').forEach(el => {
    el.textContent = PAY.isAnnual
      ? 'Cobrado anualmente · cancele quando quiser'
      : 'Cobrado mensalmente · sem contrato';
  });

  showToast(PAY.isAnnual ? '🎉 20% de desconto aplicado!' : 'Voltando para cobrança mensal', PAY.isAnnual ? 'success' : 'info');
}

// ── COMPARISON TABLE ───────────────────────────
const COMP_ROWS = [
  ['WhatsApp',            '1 número',  '3 números',     'Ilimitado'],
  ['Conversas/mês',       '500',       'Ilimitado',     'Ilimitado'],
  ['Instagram Bot',       false,       true,            true],
  ['IA GPT-4o',           false,       true,            true],
  ['Fluxos',              'Básicos',   'Avançados',     'Avançados+'],
  ['Captura de leads',    true,        true,            true],
  ['Analytics',           'Básico',    'Completo',      'Avançado'],
  ['Multi-atendentes',    false,       '3 agentes',     'Ilimitado'],
  ['API de integração',   false,       false,           true],
  ['White-label',         false,       false,           true],
  ['Dashboard custom.',   false,       false,           true],
  ['Gerente de conta',    false,       false,           true],
  ['SLA 99.9%',           false,       false,           true],
  ['Suporte',             'E-mail',    'Prioritário',   'Dedicado 24/7'],
];

function buildComparisonTable() {
  const tbody = document.getElementById('compTableBody');
  if (!tbody) return;
  tbody.innerHTML = COMP_ROWS.map(([feat, b, bus, p]) => `
    <tr>
      <td class="ct-feature">${feat}</td>
      <td>${renderCell(b)}</td>
      <td class="ct-featured-col">${renderCell(bus, true)}</td>
      <td>${renderCell(p, false, true)}</td>
    </tr>
  `).join('');
}

function renderCell(val, isFeatured=false, isPremium=false) {
  if (val === true)  return `<span class="ct-yes">✓</span>`;
  if (val === false) return `<span class="ct-no">—</span>`;
  const cls = isFeatured ? 'blue' : isPremium ? 'purple' : '';
  return `<span class="ct-val ${cls}">${val}</span>`;
}

// ── OPEN PAYMENT ───────────────────────────────
function openPayment(plan) {
  PAY.selectedPlan = plan;
  const p = PLANS[plan];

  // Set modal info
  document.getElementById('pmPlanIcon').textContent  = p.icon;
  document.getElementById('pmPlanName').textContent  = p.name;
  document.getElementById('osPlan').textContent       = p.name;

  updatePaymentPrices();
  generatePixQR();
  setBoletoVenc();
  generateBoletoBarcode();
  updateBoletoAmount();
  resetPaymentSteps();

  // Show modal
  document.getElementById('paymentModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  switchPayMethod(document.getElementById('methodCard'), 'card');

  // Highlight selected plan card
  document.querySelectorAll('.plan-card').forEach(c => c.style.opacity = '.6');
  const el = document.getElementById('plan' + plan.charAt(0).toUpperCase() + plan.slice(1));
  if (el) el.style.opacity = '1';
}

function closePayment() {
  document.getElementById('paymentModal').classList.remove('open');
  document.body.style.overflow = '';
  clearInterval(PAY.pixTimerInterval);
  document.querySelectorAll('.plan-card').forEach(c => c.style.opacity = '');
}

function updatePaymentPrices() {
  const p   = PLANS[PAY.selectedPlan];
  const price = PAY.isAnnual ? p.annual : p.monthly;
  const isCard = PAY.method === 'card';
  const isPix  = PAY.method === 'pix';

  document.getElementById('pmPlanPrice').textContent = `R$ ${price}/mês`;
  document.getElementById('osPrice').textContent     = `R$ ${price.toFixed(2).replace('.',',')}`;

  const discRow  = document.getElementById('osDiscountRow');
  const pixDisc  = (price * 0.05).toFixed(2).replace('.',',');
  const total    = isPix ? (price * 0.95).toFixed(2).replace('.',',') : price.toFixed(2).replace('.',',');

  if (isPix) {
    discRow.style.display = 'flex';
    document.getElementById('osDiscount').textContent = `-R$ ${pixDisc}`;
    document.getElementById('pixAmount').textContent  = `R$ ${total}`;
  } else {
    discRow.style.display = 'none';
  }
  document.getElementById('osTotal').textContent = `R$ ${total}`;
  document.getElementById('boletoAmount').textContent = `R$ ${price.toFixed(2).replace('.',',')}`;
}

// ── PAY METHOD ─────────────────────────────────
function switchPayMethod(btn, method) {
  PAY.method = method;
  document.querySelectorAll('.pmt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.pay-method-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + method).classList.add('active');

  updatePaymentPrices();

  if (method === 'pix') startPixTimer();
  else clearInterval(PAY.pixTimerInterval);

  const payText = document.getElementById('pmPayText');
  if (method === 'pix')    payText.textContent = '⚡ Confirmar via PIX';
  else if (method === 'boleto') payText.textContent = '📄 Gerar boleto';
  else payText.textContent = '🔒 Pagar agora';
}

// ── CARD FLIP ─────────────────────────────────
function flipCardFront() {
  document.getElementById('creditCardEl').classList.remove('flipped');
}
function flipCardBack() {
  document.getElementById('creditCardEl').classList.add('flipped');
}

// ── CARD FORMATTING ────────────────────────────
function formatCardNumber(input) {
  let v = input.value.replace(/\D/g,'').slice(0,16);
  v = v.replace(/(.{4})/g,'$1 ').trim();
  input.value = v;

  // Display on card
  const display = v.padEnd(19,'•').replace(/\d/g,(c,i) => i < v.replace(/\s/g,'').length ? c : '•');
  const parts = display.replace(/\s/g,'').match(/.{1,4}/g) || [];
  document.getElementById('cardNumberDisplay').textContent = parts.join(' ');

  // Detect card type
  const num = v.replace(/\s/g,'');
  const cfType = document.getElementById('cfCardType');
  if (/^4/.test(num)) cfType.innerHTML = '💙';
  else if (/^5[1-5]/.test(num)) cfType.innerHTML = '🔴';
  else if (/^3[47]/.test(num)) cfType.innerHTML = '🟢';
  else cfType.innerHTML = '';
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g,'').slice(0,4);
  if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2);
  input.value = v;
  document.getElementById('cardExpiryDisplay').textContent = v || 'MM/AA';
}

// ── PIX ───────────────────────────────────────
function generatePixQR() {
  const canvas = document.getElementById('pixQRCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 180, cell = 7, cols = Math.floor(size/cell);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0,0,size,size);
  ctx.fillStyle = '#111111';

  const seed = 42;
  function rand(x,y) {
    const n = Math.sin(x*127.1+y*311.7+seed)*43758.5453;
    return n-Math.floor(n);
  }
  for(let r=0;r<cols;r++) {
    for(let c=0;c<cols;c++) {
      if((r<7&&c<7)||(r<7&&c>cols-8)||(r>cols-8&&c<7)) continue;
      if(rand(r,c)>.5) ctx.fillRect(c*cell,r*cell,cell-1,cell-1);
    }
  }
  drawFinder(ctx,0,0,cell);
  drawFinder(ctx,(cols-7)*cell,0,cell);
  drawFinder(ctx,0,(cols-7)*cell,cell);
}

function drawFinder(ctx,x,y,cell) {
  ctx.fillStyle='#111111';
  ctx.fillRect(x,y,7*cell,7*cell);
  ctx.fillStyle='#FFFFFF';
  ctx.fillRect(x+cell,y+cell,5*cell,5*cell);
  ctx.fillStyle='#111111';
  ctx.fillRect(x+2*cell,y+2*cell,3*cell,3*cell);
}

function startPixTimer() {
  clearInterval(PAY.pixTimerInterval);
  PAY.pixSeconds = 600;
  const circle = document.getElementById('pixTimerCircle');
  const label  = document.getElementById('pixTimerVal');
  const total  = 88;

  PAY.pixTimerInterval = setInterval(() => {
    PAY.pixSeconds--;
    const min = String(Math.floor(PAY.pixSeconds/60)).padStart(2,'0');
    const sec = String(PAY.pixSeconds%60).padStart(2,'0');
    if (label) label.textContent = `${min}:${sec}`;
    if (circle) circle.style.strokeDashoffset = total - (total*(PAY.pixSeconds/600));
    if (PAY.pixSeconds <= 0) {
      clearInterval(PAY.pixTimerInterval);
      showToast('⏱ QR Code expirou. Gerando novo...','info');
      PAY.pixSeconds = 600;
      generatePixQR();
    }
  }, 1000);
}

function copyPIX(btn) {
  const key = document.getElementById('pixKey').textContent;
  navigator.clipboard?.writeText(key).catch(()=>{});
  btn.textContent = '✅ Copiado!';
  btn.classList.add('copied');
  setTimeout(() => { btn.textContent = '📋 Copiar'; btn.classList.remove('copied'); }, 2000);
  showToast('📋 Chave PIX copiada!','success');
}

// ── BOLETO ────────────────────────────────────
function generateBoletoBarcode() {
  const container = document.getElementById('bvBcLines');
  if (!container) return;
  let html = '';
  for (let i = 0; i < 80; i++) {
    const w = Math.random() > 0.6 ? 3 : 1;
    const c = i % 2 === 0 ? '#111' : '#fff';
    html += `<div style="width:${w}px;background:${c};flex-shrink:0"></div>`;
  }
  container.innerHTML = html;
}

function setBoletoVenc() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  const el = document.getElementById('bvVenc');
  if (el) el.textContent = d.toLocaleDateString('pt-BR');
}

function updateBoletoAmount() {
  const p = PLANS[PAY.selectedPlan];
  if (!p) return;
  const price = PAY.isAnnual ? p.annual : p.monthly;
  const el = document.getElementById('boletoAmount');
  if (el) el.textContent = `R$ ${price.toFixed(2).replace('.',',')}`;
}

function copyBoleto(btn) {
  const code = document.getElementById('bvCode').textContent;
  navigator.clipboard?.writeText(code).catch(()=>{});
  btn.textContent = '✅ Código copiado!';
  setTimeout(() => btn.textContent = '📋 Copiar código de barras', 2000);
  showToast('📋 Código de barras copiado!','success');
}

function downloadBoleto() {
  showToast('⬇️ Baixando PDF do boleto...','info');
  setTimeout(() => showToast('✅ PDF gerado com sucesso!','success'), 1500);
}

// ── PROCESS PAYMENT ────────────────────────────
const PROCESSING_STEPS = [
  { icon:'🔒', text:'Verificando segurança SSL' },
  { icon:'💳', text:'Processando dados do pagamento' },
  { icon:'🏦', text:'Comunicando com o banco emissor' },
  { icon:'✅', text:'Confirmando transação' },
  { icon:'🎉', text:'Ativando seu plano' },
];

function processPayment() {
  if (PAY.method === 'card') {
    const num = document.getElementById('inputCardNum').value.replace(/\s/g,'');
    const exp = document.getElementById('inputExpiry').value;
    const cvv = document.getElementById('inputCVV').value;
    if (num.length < 16) { showToast('⚠️ Número do cartão inválido','error'); return; }
    if (exp.length < 5)  { showToast('⚠️ Validade inválida','error'); return; }
    if (cvv.length < 3)  { showToast('⚠️ CVV inválido','error'); return; }
  }

  // Show processing step
  document.getElementById('step-checkout').style.display = 'none';
  document.getElementById('step-processing').style.display = 'block';
  clearInterval(PAY.pixTimerInterval);

  const stepsContainer = document.getElementById('psStepsList');
  stepsContainer.innerHTML = PROCESSING_STEPS.map((s,i) =>
    `<div class="psl-item pending" id="psl-${i}"><span class="psl-icon">${s.icon}</span>${s.text}</div>`
  ).join('');

  const fill = document.getElementById('psProgressFill');
  const msgs = ['Conectando com o banco...','Criptografando dados...','Aguardando autorização...','Confirmando pagamento...','Ativando plano...'];
  let step = 0;

  const interval = setInterval(() => {
    // Update progress
    fill.style.width = ((step+1)/PROCESSING_STEPS.length*100) + '%';

    // Update step indicators
    if (step > 0) {
      const prev = document.getElementById('psl-'+(step-1));
      if (prev) prev.className = 'psl-item done';
    }
    const curr = document.getElementById('psl-'+step);
    if (curr) curr.className = 'psl-item active';

    document.getElementById('processingMsg').textContent = msgs[step] || '';
    step++;

    if (step >= PROCESSING_STEPS.length) {
      clearInterval(interval);
      const last = document.getElementById('psl-'+(step-1));
      if (last) last.className = 'psl-item done';

      setTimeout(() => showSuccess(), 600);
    }
  }, 600);
}

function showSuccess() {
  document.getElementById('step-processing').style.display = 'none';
  document.getElementById('step-success').style.display = 'block';

  const p     = PLANS[PAY.selectedPlan];
  const price = PAY.isAnnual ? p.annual : p.monthly;
  const disc  = PAY.method === 'pix' ? (price*0.05).toFixed(2).replace('.',',') : null;
  const total = PAY.method === 'pix' ? (price*0.95).toFixed(2).replace('.',',') : price.toFixed(2).replace('.',',');

  const venc = new Date();
  venc.setMonth(venc.getMonth() + (PAY.isAnnual ? 12 : 1));

  document.getElementById('ssDetails').innerHTML = `
    <div class="ss-detail-row"><span>Plano</span><span>${p.name}</span></div>
    <div class="ss-detail-row"><span>Cobrança</span><span>${PAY.isAnnual ? 'Anual' : 'Mensal'}</span></div>
    ${disc ? `<div class="ss-detail-row"><span>Desconto PIX</span><span style="color:#22C55E">-R$ ${disc}</span></div>` : ''}
    <div class="ss-detail-row"><span>Total pago</span><span style="color:#4ADE80;font-size:.95rem">R$ ${total}</span></div>
    <div class="ss-detail-row"><span>Próxima cobrança</span><span>${venc.toLocaleDateString('pt-BR')}</span></div>
  `;

  launchConfetti();
  showToast('🎉 Plano ativado com sucesso!','success');
}

// ── CONFETTI ──────────────────────────────────
function launchConfetti() {
  const container = document.getElementById('ssConfetti');
  if (!container) return;
  const colors = ['#3B82F6','#8B5CF6','#22C55E','#F59E0B','#EC4899','#60A5FA','#A78BFA'];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random()*100}%;
      background: ${colors[Math.floor(Math.random()*colors.length)]};
      width: ${Math.random()*8+4}px;
      height: ${Math.random()*8+4}px;
      border-radius: ${Math.random()>0.5 ? '50%' : '2px'};
      animation-duration: ${Math.random()*1.5+1}s;
      animation-delay: ${Math.random()*0.8}s;
    `;
    container.appendChild(piece);
  }
  setTimeout(() => container.innerHTML = '', 3000);
}

// ── RESET PAYMENT STEPS ────────────────────────
function resetPaymentSteps() {
  document.getElementById('step-checkout').style.display = 'block';
  document.getElementById('step-processing').style.display = 'none';
  document.getElementById('step-success').style.display = 'none';

  // Reset card form
  ['inputCardNum','inputHolder','inputExpiry','inputCVV'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('cardNumberDisplay').textContent = '•••• •••• •••• ••••';
  document.getElementById('cardHolderDisplay').textContent = 'SEU NOME';
  document.getElementById('cardExpiryDisplay').textContent = 'MM/AA';
  document.getElementById('cardCVVDisplay').textContent    = '•••';
  document.getElementById('creditCardEl').classList.remove('flipped');
  document.getElementById('psProgressFill').style.width = '0%';
}

// ── FAQ ───────────────────────────────────────
function togglePFaq(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.pf-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

// ── USAGE BARS ────────────────────────────────
function animateUsageBars() {
  setTimeout(() => {
    document.querySelectorAll('.cpu-fill').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => bar.style.width = w, 100);
    });
  }, 500);
}

// ── TOAST ──────────────────────────────────────
function showToast(msg, type='info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => { t.style.animation='toastOut .3s ease forwards'; setTimeout(()=>t.remove(),300); }, 2500);
}
