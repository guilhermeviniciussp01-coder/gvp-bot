/* ================================================
   GVP BOT — CLIENTES ENGINE
   ================================================ */

// ── DATA ───────────────────────────────────────
const CLIENTES_DATA = [
  { id:1,  nome:'Marcela Costa',    tel:'(11) 9 9821-3344', email:'marcela@estilocarioca.com', empresa:'Estilo Carioca',   cargo:'Proprietária',  segmento:'Loja / Varejo',     plano:'Pro',        status:'Ativo',     data:'2025-08-14', venc:'2026-08-14', obs:'Cliente VIP, sempre renova' },
  { id:2,  nome:'Rafael Santos',    tel:'(21) 9 8765-4321', email:'rafael@sabordorio.com.br',  empresa:'Sabor do Rio',     cargo:'CEO',           segmento:'Restaurante / Delivery', plano:'Starter', status:'Ativo',  data:'2025-10-03', venc:'2026-10-03', obs:'' },
  { id:3,  nome:'Ana Paula Lima',   tel:'(31) 9 7654-3210', email:'ana@clinicabela.com',      empresa:'Clínica Bela',     cargo:'Diretora',      segmento:'Saúde / Estética',  plano:'Enterprise', status:'Ativo',    data:'2025-06-22', venc:'2026-06-22', obs:'Usa API para integração' },
  { id:4,  nome:'João Ferreira',    tel:'(41) 9 6543-2109', email:'joao@imobjf.com.br',       empresa:'ImobJF',           cargo:'Gerente',       segmento:'Imóveis',           plano:'Pro',        status:'Trial',     data:'2026-04-10', venc:'2026-05-10', obs:'Trial vence em breve' },
  { id:5,  nome:'Luana Martins',    tel:'(51) 9 5432-1098', email:'luana@cursoslm.com',       empresa:'Cursos LM',        cargo:'Fundadora',     segmento:'Educação',          plano:'Starter',    status:'Inativo',   data:'2025-12-01', venc:'2026-01-01', obs:'Cancelou em Jan/26' },
  { id:6,  nome:'Carlos Eduardo',   tel:'(11) 9 4321-0987', email:'carlos@tecnoweb.com.br',   empresa:'TecnoWeb',         cargo:'CTO',           segmento:'Serviços',          plano:'Enterprise', status:'Ativo',    data:'2025-07-19', venc:'2026-07-19', obs:'' },
  { id:7,  nome:'Fernanda Lima',    tel:'(19) 9 3210-9876', email:'fernanda@boutiquef.com',   empresa:'Boutique F',       cargo:'Proprietária',  segmento:'Loja / Varejo',     plano:'Pro',        status:'Ativo',     data:'2025-09-05', venc:'2026-09-05', obs:'Expandindo para 3 lojas' },
  { id:8,  nome:'Bruno Alves',      tel:'(71) 9 2109-8765', email:'bruno@deliverybr.com',     empresa:'Delivery BR',      cargo:'Sócio',         segmento:'Restaurante / Delivery', plano:'Pro',  status:'Trial',     data:'2026-04-28', venc:'2026-05-28', obs:'' },
  { id:9,  nome:'Patricia Sousa',   tel:'(85) 9 1098-7654', email:'patricia@spamed.com.br',   empresa:'SPA Med',          cargo:'Proprietária',  segmento:'Saúde / Estética',  plano:'Starter',    status:'Ativo',    data:'2026-01-15', venc:'2027-01-15', obs:'' },
  { id:10, nome:'Diego Ribeiro',    tel:'(62) 9 0987-6543', email:'diego@construtora.com',    empresa:'Construtora DR',   cargo:'Diretor',       segmento:'Imóveis',           plano:'Enterprise', status:'Bloqueado', data:'2025-11-20', venc:'2025-12-20', obs:'Pagamento pendente' },
  { id:11, nome:'Juliana Castro',   tel:'(13) 9 9876-5432', email:'ju@moda360.com.br',        empresa:'Moda 360',         cargo:'CEO',           segmento:'Loja / Varejo',     plano:'Pro',        status:'Ativo',     data:'2026-02-08', venc:'2027-02-08', obs:'' },
  { id:12, nome:'Thiago Mendes',    tel:'(47) 9 8765-5555', email:'thiago@agenciamx.com',     empresa:'Agência MX',       cargo:'Sócio',         segmento:'Serviços',          plano:'Pro',        status:'Ativo',     data:'2025-08-30', venc:'2026-08-30', obs:'' },
  { id:13, nome:'Camila Ferreira',  tel:'(31) 9 7654-4444', email:'camila@biolashca.com',     empresa:'Biolash CA',       cargo:'Proprietária',  segmento:'Saúde / Estética',  plano:'Starter',    status:'Ativo',     data:'2026-03-11', venc:'2027-03-11', obs:'' },
  { id:14, nome:'Lucas Pereira',    tel:'(11) 9 6543-3333', email:'lucas@techsol.io',         empresa:'TechSol',          cargo:'CTO',           segmento:'Serviços',          plano:'Enterprise', status:'Ativo',     data:'2025-05-17', venc:'2026-05-17', obs:'Maior cliente da base' },
  { id:15, nome:'Vanessa Oliveira', tel:'(21) 9 5432-2222', email:'vanessa@glamour.com',      empresa:'Glamour Store',    cargo:'Diretora',      segmento:'Loja / Varejo',     plano:'Pro',        status:'Inativo',   data:'2025-12-20', venc:'2026-01-20', obs:'' },
  { id:16, nome:'Rodrigo Lima',     tel:'(41) 9 4321-1111', email:'rodrigo@foodtruck.com',    empresa:'Food Truck RJ',    cargo:'Proprietário',  segmento:'Restaurante / Delivery', plano:'Starter', status:'Trial', data:'2026-05-01', venc:'2026-06-01', obs:'Novo trial' },
  { id:17, nome:'Isabela Nunes',    tel:'(61) 9 3210-0000', email:'isa@educapro.com.br',      empresa:'Educa Pro',        cargo:'Fundadora',     segmento:'Educação',          plano:'Pro',        status:'Ativo',     data:'2026-01-25', venc:'2027-01-25', obs:'' },
  { id:18, nome:'Gabriel Costa',   tel:'(85) 9 2109-1234', email:'gabriel@imovsp.com.br',    empresa:'ImóvSP',           cargo:'Gerente',       segmento:'Imóveis',           plano:'Enterprise', status:'Ativo',     data:'2025-09-09', venc:'2026-09-09', obs:'' },
  { id:19, nome:'Mariana Rocha',    tel:'(48) 9 1098-2345', email:'mari@boutiquemr.com',      empresa:'Boutique MR',      cargo:'Proprietária',  segmento:'Loja / Varejo',     plano:'Starter',    status:'Ativo',     data:'2026-03-30', venc:'2027-03-30', obs:'' },
  { id:20, nome:'André Batista',    tel:'(27) 9 0987-3456', email:'andre@automacaoes.com',    empresa:'AutomaçãoES',      cargo:'CEO',           segmento:'Serviços',          plano:'Pro',        status:'Ativo',     data:'2025-10-14', venc:'2026-10-14', obs:'' },
  { id:21, nome:'Tainá Freitas',    tel:'(92) 9 9876-4567', email:'taina@belezareal.com',     empresa:'Beleza Real AM',   cargo:'Proprietária',  segmento:'Saúde / Estética',  plano:'Starter',    status:'Inativo',   data:'2026-01-05', venc:'2026-02-05', obs:'' },
  { id:22, nome:'Felipe Cardoso',   tel:'(11) 9 8765-6789', email:'felipe@marketingpro.com',  empresa:'Marketing Pro',    cargo:'Diretor',       segmento:'Serviços',          plano:'Enterprise', status:'Ativo',     data:'2025-07-01', venc:'2026-07-01', obs:'' },
];

// ── STATE ──────────────────────────────────────
let CL = {
  all: [...CLIENTES_DATA],
  filtered: [...CLIENTES_DATA],
  page: 1,
  pageSize: 10,
  sortField: 'data',
  sortDir: 'desc',
  selected: new Set(),
  view: 'table',
  editingId: null,
  deleteTargetId: null,
};

// ── INIT ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  animateKPIs();
  renderTable();
  renderPagination();
  setTodayDate();
});

function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  const fData = document.getElementById('fData');
  if (fData) fData.value = today;
}

// ── KPI ANIMATION ─────────────────────────────
function animateKPIs() {
  const total    = CL.all.length;
  const active   = CL.all.filter(c => c.status === 'Ativo').length;
  const pro      = CL.all.filter(c => c.plano === 'Pro' || c.plano === 'Enterprise').length;
  const trial    = CL.all.filter(c => c.status === 'Trial' || c.status === 'Inativo').length;

  animCount('kpiTotal',  total);
  animCount('kpiActive', active);
  animCount('kpiPro',    pro);
  animCount('kpiTrial',  trial);
}

function animCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0, dur = 1400;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── FILTER ────────────────────────────────────
function filterTable() {
  const q      = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('filterStatus').value;
  const plano  = document.getElementById('filterPlano').value;
  const order  = document.getElementById('filterOrder').value;

  // Show/hide clear btn
  document.getElementById('searchClear').style.display = q ? 'block' : 'none';

  CL.filtered = CL.all.filter(c => {
    const matchQ = !q ||
      c.nome.toLowerCase().includes(q) ||
      c.tel.includes(q) ||
      c.empresa.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchS = !status || c.status === status;
    const matchP = !plano  || c.plano  === plano;
    return matchQ && matchS && matchP;
  });

  // Sort
  CL.filtered.sort((a, b) => {
    if (order === 'newer') return new Date(b.data) - new Date(a.data);
    if (order === 'older') return new Date(a.data) - new Date(b.data);
    if (order === 'name')  return a.nome.localeCompare(b.nome);
    if (order === 'plano') return ['Starter','Pro','Enterprise'].indexOf(b.plano) - ['Starter','Pro','Enterprise'].indexOf(a.plano);
    return 0;
  });

  CL.page = 1;
  renderTable();
  renderPagination();
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').style.display = 'none';
  filterTable();
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterPlano').value = '';
  document.getElementById('filterOrder').value = 'newer';
  document.getElementById('searchClear').style.display = 'none';
  filterTable();
}

// ── SORT ──────────────────────────────────────
function sortBy(field) {
  if (CL.sortField === field) CL.sortDir = CL.sortDir === 'asc' ? 'desc' : 'asc';
  else { CL.sortField = field; CL.sortDir = 'asc'; }

  document.querySelectorAll('.sort-icon').forEach(i => { i.classList.remove('asc','desc'); i.textContent = '↕'; });
  const icon = document.getElementById('sort-' + field);
  if (icon) { icon.textContent = CL.sortDir === 'asc' ? '↑' : '↓'; icon.classList.add(CL.sortDir); }

  const dir = CL.sortDir === 'asc' ? 1 : -1;
  CL.filtered.sort((a, b) => {
    const va = a[field] || '', vb = b[field] || '';
    return va.localeCompare(vb) * dir;
  });
  CL.page = 1;
  renderTable();
}

// ── RENDER TABLE ──────────────────────────────
function renderTable() {
  const start  = (CL.page - 1) * CL.pageSize;
  const slice  = CL.filtered.slice(start, start + CL.pageSize);
  const tbody  = document.getElementById('tableBody');
  const empty  = document.getElementById('emptyState');

  if (CL.filtered.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'flex';
  } else {
    empty.style.display = 'none';
    tbody.innerHTML = slice.map(c => buildRow(c)).join('');
  }

  if (CL.view === 'grid') renderGrid();
}

function buildRow(c) {
  const initials = c.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const color    = avatarColor(c.id);
  const planCls  = 'plan-' + c.plano.toLowerCase();
  const stCls    = 'status-' + c.status.toLowerCase().replace(/\s/g,'');
  const stIcon   = { Ativo:'●', Trial:'●', Inativo:'●', Bloqueado:'◉' }[c.status] || '●';
  const checked  = CL.selected.has(c.id) ? 'checked' : '';

  return `
  <tr class="${CL.selected.has(c.id) ? 'selected' : ''}" id="row-${c.id}">
    <td class="td-check">
      <label class="checkbox-label">
        <input type="checkbox" ${checked} onchange="toggleSelect(${c.id},this)" />
        <span class="checkmark"></span>
      </label>
    </td>
    <td>
      <div class="client-cell">
        <div class="cc-avatar" style="background:${color}">${initials}</div>
        <div class="cc-info">
          <span class="cc-name">${c.nome}</span>
          <span class="cc-email">${c.email}</span>
        </div>
      </div>
    </td>
    <td class="td-phone">${c.tel}</td>
    <td class="td-empresa" title="${c.empresa}">${c.empresa}</td>
    <td><span class="plan-badge ${planCls}">${planIcon(c.plano)} ${c.plano}</span></td>
    <td><span class="status-badge ${stCls}"><span class="status-dot"></span>${c.status}</span></td>
    <td class="td-date">${formatDate(c.data)}</td>
    <td class="td-actions">
      <div class="row-actions">
        <button class="ra-btn ra-view" onclick="openModal('view',${c.id})" title="Visualizar">👁</button>
        <button class="ra-btn ra-edit" onclick="openModal('edit',${c.id})" title="Editar">✏️</button>
        <button class="ra-btn ra-delete" onclick="openDeleteModal(${c.id})" title="Deletar">🗑️</button>
      </div>
    </td>
  </tr>`;
}

// ── GRID RENDER ───────────────────────────────
function renderGrid() {
  const start = (CL.page - 1) * CL.pageSize;
  const slice = CL.filtered.slice(start, start + CL.pageSize);
  const grid  = document.getElementById('cardsGrid');
  if (!grid) return;
  grid.innerHTML = slice.map(c => buildCard(c)).join('');
}

function buildCard(c) {
  const initials = c.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const color    = avatarColor(c.id);
  const planCls  = 'plan-' + c.plano.toLowerCase();
  const stCls    = 'status-' + c.status.toLowerCase();
  return `
  <div class="client-card" id="card-${c.id}">
    <div class="cc-top">
      <div class="cc-avatar-lg" style="background:${color}">${initials}</div>
      <div class="cc-top-info">
        <div class="cc-top-name">${c.nome}</div>
        <div class="cc-top-emp">${c.empresa}</div>
      </div>
    </div>
    <div class="cc-badges">
      <span class="plan-badge ${planCls}">${planIcon(c.plano)} ${c.plano}</span>
      <span class="status-badge ${stCls}"><span class="status-dot"></span>${c.status}</span>
    </div>
    <div class="cc-details">
      <div class="ccd-row"><span class="ccd-icon">📱</span>${c.tel}</div>
      <div class="ccd-row"><span class="ccd-icon">✉️</span>${c.email}</div>
      <div class="ccd-row"><span class="ccd-icon">📅</span>${formatDate(c.data)}</div>
    </div>
    <div class="cc-actions">
      <button class="cc-btn" onclick="openModal('view',${c.id})">👁 Ver</button>
      <button class="cc-btn" onclick="openModal('edit',${c.id})">✏️ Editar</button>
      <button class="cc-btn danger" onclick="openDeleteModal(${c.id})">🗑️</button>
    </div>
  </div>`;
}

// ── PAGINATION ────────────────────────────────
function renderPagination() {
  const total = CL.filtered.length;
  const pages = Math.ceil(total / CL.pageSize);
  const start = (CL.page - 1) * CL.pageSize + 1;
  const end   = Math.min(CL.page * CL.pageSize, total);

  const info  = document.getElementById('pagInfo');
  const pages1 = document.getElementById('pagPages');
  const prev  = document.getElementById('pagPrev');
  const next  = document.getElementById('pagNext');

  if (info)   info.textContent  = total > 0 ? `Mostrando ${start}-${end} de ${total} clientes` : 'Nenhum resultado';
  if (prev)   prev.disabled     = CL.page <= 1;
  if (next)   next.disabled     = CL.page >= pages;
  if (pages1) pages1.innerHTML  = buildPageNums(pages);

  // Grid pagination
  const gInfo = document.getElementById('pagInfoGrid');
  const gPages = document.getElementById('pagPagesGrid');
  if (gInfo)  gInfo.textContent = total > 0 ? `${start}-${end} de ${total}` : '';
  if (gPages) gPages.innerHTML  = buildPageNums(pages);
}

function buildPageNums(pages) {
  const nums = [];
  const max  = 5;
  let start  = Math.max(1, CL.page - 2);
  let end    = Math.min(pages, start + max - 1);
  if (end - start < max - 1) start = Math.max(1, end - max + 1);

  for (let i = start; i <= end; i++) {
    nums.push(`<div class="pag-num ${i === CL.page ? 'active' : ''}" onclick="goPage(${i})">${i}</div>`);
  }
  return nums.join('');
}

function changePage(dir) {
  const pages = Math.ceil(CL.filtered.length / CL.pageSize);
  CL.page = Math.max(1, Math.min(CL.page + dir, pages));
  renderTable(); renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goPage(n) {
  CL.page = n;
  renderTable(); renderPagination();
}

function changePageSize(n) {
  CL.pageSize = parseInt(n);
  CL.page = 1;
  renderTable(); renderPagination();
}

// ── VIEW TOGGLE ───────────────────────────────
function setView(v, btn) {
  CL.view = v;
  document.querySelectorAll('.vt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (v === 'table') {
    document.getElementById('tableCard').style.display = '';
    document.getElementById('gridView').style.display = 'none';
  } else {
    document.getElementById('tableCard').style.display = 'none';
    document.getElementById('gridView').style.display = '';
    renderGrid();
    renderPagination();
  }
}

// ── SELECTION ─────────────────────────────────
function toggleSelect(id, cb) {
  if (cb.checked) CL.selected.add(id);
  else CL.selected.delete(id);

  const row = document.getElementById('row-' + id);
  if (row) row.classList.toggle('selected', cb.checked);

  updateSelectionBar();
}

function toggleSelectAll(cb) {
  const start = (CL.page - 1) * CL.pageSize;
  const slice = CL.filtered.slice(start, start + CL.pageSize);

  slice.forEach(c => {
    if (cb.checked) CL.selected.add(c.id);
    else CL.selected.delete(c.id);
    const row = document.getElementById('row-' + c.id);
    if (row) { row.classList.toggle('selected', cb.checked); }
    const chk = row?.querySelector('input[type=checkbox]');
    if (chk) chk.checked = cb.checked;
  });

  updateSelectionBar();
}

function updateSelectionBar() {
  const bar = document.getElementById('selectionBar');
  const count = CL.selected.size;
  bar.style.display = count > 0 ? 'flex' : 'none';
  document.getElementById('selCount').textContent = `${count} selecionado${count !== 1 ? 's' : ''}`;
}

function clearSelection() {
  CL.selected.clear();
  document.querySelectorAll('.cl-table input[type=checkbox]').forEach(cb => cb.checked = false);
  document.querySelectorAll('.cl-table tbody tr').forEach(tr => tr.classList.remove('selected'));
  document.getElementById('selectionBar').style.display = 'none';
  document.getElementById('selectAll').checked = false;
}

function bulkAction(action) {
  const count = CL.selected.size;
  if (action === 'delete') {
    if (!confirm(`Deletar ${count} cliente(s) selecionado(s)?`)) return;
    CL.all = CL.all.filter(c => !CL.selected.has(c.id));
    CL.filtered = CL.filtered.filter(c => !CL.selected.has(c.id));
    CL.selected.clear();
    renderTable(); renderPagination(); animateKPIs();
    document.getElementById('selectionBar').style.display = 'none';
    showToast(`🗑️ ${count} cliente(s) deletado(s)`, 'info');
  } else if (action === 'export') {
    showToast(`📤 Exportando ${count} clientes...`, 'success');
    clearSelection();
  } else if (action === 'email') {
    showToast(`📧 E-mail enviado para ${count} clientes!`, 'success');
    clearSelection();
  }
}

// ── MODAL ─────────────────────────────────────
function openModal(mode, id) {
  const modal   = document.getElementById('clientModal');
  const title   = document.getElementById('modalTitle');
  const sub     = document.getElementById('modalSubtitle');
  const vp      = document.getElementById('viewProfile');
  const tabs    = document.getElementById('modalTabs');
  const footer  = document.getElementById('cmbFooter');
  const delBtn  = document.getElementById('cmbDeleteBtn');
  const saveBtn = document.getElementById('cmbSave');

  resetModalForm();
  CL.editingId = id || null;

  if (mode === 'new') {
    title.textContent = 'Novo Cliente';
    sub.textContent   = 'Preencha os dados abaixo';
    vp.style.display  = 'none';
    tabs.style.display = '';
    footer.style.display = '';
    delBtn.style.display = 'none';
    saveBtn.querySelector('#cmbSaveText').textContent = '+ Adicionar cliente';
    switchModalTab(document.querySelector('.modal-tab'), 'dados');

  } else if (mode === 'edit') {
    const c = CL.all.find(x => x.id === id);
    if (!c) return;
    title.textContent = 'Editar Cliente';
    sub.textContent   = c.nome;
    vp.style.display  = 'none';
    tabs.style.display = '';
    footer.style.display = '';
    delBtn.style.display = '';
    saveBtn.querySelector('#cmbSaveText').textContent = '💾 Salvar alterações';
    fillForm(c);

  } else if (mode === 'view') {
    const c = CL.all.find(x => x.id === id);
    if (!c) return;
    title.textContent = 'Perfil do Cliente';
    sub.textContent   = 'Informações detalhadas';
    vp.style.display  = 'flex';
    tabs.style.display = '';
    footer.style.display = '';
    delBtn.style.display = '';
    saveBtn.querySelector('#cmbSaveText').textContent = '✏️ Editar';
    saveBtn.onclick = () => { closeModal(); openModal('edit', id); };
    fillViewProfile(c);
    fillForm(c);
    renderHistorico(c);
    switchModalTab(document.querySelector('.modal-tab'), 'dados');
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fillForm(c) {
  document.getElementById('fNome').value     = c.nome    || '';
  document.getElementById('fTel').value      = c.tel     || '';
  document.getElementById('fEmail').value    = c.email   || '';
  document.getElementById('fEmpresa').value  = c.empresa || '';
  document.getElementById('fCargo').value    = c.cargo   || '';
  document.getElementById('fSegmento').value = c.segmento|| '';
  document.getElementById('fObs').value      = c.obs     || '';
  document.getElementById('fPlano').value    = c.plano   || 'Pro';
  document.getElementById('fStatus').value   = c.status  || 'Ativo';
  document.getElementById('fData').value     = c.data    || '';
  document.getElementById('fVenc').value     = c.venc    || '';
}

function fillViewProfile(c) {
  const initials = c.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const color    = avatarColor(c.id);
  document.getElementById('vpAvatar').textContent         = initials;
  document.getElementById('vpAvatar').style.background    = color;
  document.getElementById('vpName').textContent            = c.nome;
  document.getElementById('vpCompany').textContent         = `${c.cargo} · ${c.empresa}`;
  document.getElementById('vpBadges').innerHTML = `
    <span class="plan-badge plan-${c.plano.toLowerCase()}">${planIcon(c.plano)} ${c.plano}</span>
    <span class="status-badge status-${c.status.toLowerCase()}"><span class="status-dot"></span>${c.status}</span>
  `;

  const days = Math.floor((new Date() - new Date(c.data)) / 86400000);
  document.getElementById('vpDays').textContent  = days;
  document.getElementById('vpMsgs').textContent  = (Math.floor(days * 4.7 + Math.random() * 50)).toLocaleString('pt-BR');
  document.getElementById('vpLeads').textContent = Math.floor(days * 0.8 + Math.random() * 20);
}

function renderHistorico(c) {
  const events = [
    { icon: '🎉', color: '#22C55E', text: `Cliente <strong>${c.nome}</strong> cadastrado no plano <strong>${c.plano}</strong>`, time: formatDate(c.data) },
    { icon: '🤖', color: '#3B82F6', text: 'Bot WhatsApp ativado com sucesso', time: formatDate(c.data) },
    { icon: '📊', color: '#8B5CF6', text: 'Primeiro acesso ao dashboard', time: formatDate(c.data) },
    { icon: '💬', color: '#F59E0B', text: 'Primeiras 100 conversas automatizadas atingidas', time: 'há 15 dias' },
    { icon: '🔄', color: '#14B8A6', text: `Plano renovado — <strong>${c.plano}</strong>`, time: 'há 30 dias' },
  ];

  document.getElementById('historicoList').innerHTML = events.map(e => `
    <div class="hist-item">
      <div class="hist-dot" style="background:${e.color}"></div>
      <div class="hist-info">
        <div class="hist-text">${e.icon} ${e.text}</div>
        <div class="hist-time">${e.time}</div>
      </div>
    </div>
  `).join('');
}

function resetModalForm() {
  ['fNome','fTel','fEmail','fEmpresa','fCargo','fObs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('fPlano').value    = 'Pro';
  document.getElementById('fStatus').value   = 'Ativo';
  document.getElementById('fSegmento').value = '';
  document.getElementById('cmbSave').onclick = saveModal;
  document.getElementById('cmbSaveLoader').style.display = 'none';
  document.getElementById('cmbSaveText').style.display  = '';
}

function closeModal() {
  document.getElementById('clientModal').classList.remove('open');
  document.body.style.overflow = '';
  CL.editingId = null;
}

function switchModalTab(btn, tab) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('mtab-' + tab).classList.add('active');
}

function saveModal() {
  const nome = document.getElementById('fNome').value.trim();
  const tel  = document.getElementById('fTel').value.trim();
  if (!nome) { showToast('⚠️ Nome é obrigatório', 'error'); document.getElementById('fNome').focus(); return; }
  if (!tel)  { showToast('⚠️ Telefone é obrigatório', 'error'); document.getElementById('fTel').focus(); return; }

  const saveText   = document.getElementById('cmbSaveText');
  const saveLoader = document.getElementById('cmbSaveLoader');
  saveText.style.display   = 'none';
  saveLoader.style.display = 'block';

  setTimeout(() => {
    const newData = {
      nome,
      tel,
      email:    document.getElementById('fEmail').value.trim(),
      empresa:  document.getElementById('fEmpresa').value.trim(),
      cargo:    document.getElementById('fCargo').value.trim(),
      segmento: document.getElementById('fSegmento').value,
      obs:      document.getElementById('fObs').value.trim(),
      plano:    document.getElementById('fPlano').value,
      status:   document.getElementById('fStatus').value,
      data:     document.getElementById('fData').value || new Date().toISOString().split('T')[0],
      venc:     document.getElementById('fVenc').value,
    };

    if (CL.editingId) {
      const idx = CL.all.findIndex(c => c.id === CL.editingId);
      if (idx >= 0) { CL.all[idx] = { ...CL.all[idx], ...newData }; }
      showToast('✅ Cliente atualizado!', 'success');
    } else {
      const newId = Math.max(...CL.all.map(c => c.id)) + 1;
      CL.all.unshift({ id: newId, ...newData });
      showToast('✅ Cliente adicionado!', 'success');
    }

    filterTable();
    animateKPIs();
    closeModal();
  }, 1200);
}

function deleteFromModal() {
  closeModal();
  openDeleteModal(CL.editingId);
}

// ── DELETE MODAL ──────────────────────────────
function openDeleteModal(id) {
  CL.deleteTargetId = id;
  const c = CL.all.find(x => x.id === id);
  if (c) {
    document.getElementById('deleteModalDesc').innerHTML = `Você está prestes a deletar <strong>${c.nome}</strong>.<br>Esta ação não pode ser desfeita.`;
  }
  document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('open');
  CL.deleteTargetId = null;
}

function confirmDelete() {
  const text   = document.getElementById('dmConfirmText');
  const loader = document.getElementById('dmLoader');
  text.style.display   = 'none';
  loader.style.display = 'block';

  setTimeout(() => {
    const c = CL.all.find(x => x.id === CL.deleteTargetId);
    CL.all      = CL.all.filter(x => x.id !== CL.deleteTargetId);
    CL.filtered = CL.filtered.filter(x => x.id !== CL.deleteTargetId);
    renderTable(); renderPagination(); animateKPIs();
    closeDeleteModal();
    showToast(`🗑️ ${c?.nome || 'Cliente'} deletado`, 'info');
    text.style.display   = '';
    loader.style.display = 'none';
  }, 1000);
}

// ── EXPORT CSV ────────────────────────────────
function exportCSV() {
  const headers = ['ID','Nome','Telefone','Email','Empresa','Cargo','Plano','Status','Cadastro'];
  const rows = CL.all.map(c =>
    [c.id, c.nome, c.tel, c.email, c.empresa, c.cargo, c.plano, c.status, c.data].join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'clientes_gvpbot.csv';
  a.click();
  showToast('📤 CSV exportado com sucesso!', 'success');
}

// ── HELPERS ───────────────────────────────────
const COLORS = [
  'linear-gradient(135deg,#3B82F6,#1D4ED8)',
  'linear-gradient(135deg,#8B5CF6,#6D28D9)',
  'linear-gradient(135deg,#22C55E,#16A34A)',
  'linear-gradient(135deg,#F59E0B,#D97706)',
  'linear-gradient(135deg,#EC4899,#BE185D)',
  'linear-gradient(135deg,#14B8A6,#0D9488)',
  'linear-gradient(135deg,#F97316,#EA580C)',
  'linear-gradient(135deg,#6366F1,#4338CA)',
];
function avatarColor(id) { return COLORS[id % COLORS.length]; }

function planIcon(p) { return { Starter:'⭐', Pro:'💎', Enterprise:'🚀' }[p] || ''; }

function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

// ── TOAST ──────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => { t.style.animation = 'toastOut .3s ease forwards'; setTimeout(() => t.remove(), 300); }, 2500);
}
