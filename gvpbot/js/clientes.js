/* ================================================
   GVP BOT — CLIENTES ENGINE (Supabase)
   ================================================ */

// ── STATE ──────────────────────────────────────
let CL = {
  all: [],
  filtered: [],
  page: 1,
  pageSize: 10,
  sortField: 'created_at',
  sortDir: 'desc',
  selected: new Set(),
  view: 'table',
  editingId: null,
  deleteTargetId: null,
};

// ── INIT ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return; }
  await loadClientes();
});

async function loadClientes() {
  try {
    const data = await getClientes();
    CL.all      = data;
    CL.filtered = [...data];
    animateKPIs();
    renderTable();
    renderPagination();
  } catch(e) {
    showToast('❌ Erro ao carregar clientes', 'error');
  }
}

// ── KPI ANIMATION ─────────────────────────────
function animateKPIs() {
  const total = CL.all.length;
  const conv  = CL.all.filter(c => c.status === 'convertido').length;
  const wa    = CL.all.filter(c => c.canal === 'whatsapp').length;
  const ig    = CL.all.filter(c => c.canal === 'instagram').length;

  animCount('kpiTotal',  total);
  animCount('kpiActive', conv);
  animCount('kpiPro',    wa);
  animCount('kpiTrial',  ig);
}

function animCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / 1400, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ── FILTER ────────────────────────────────────
function filterTable() {
  const q      = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('filterStatus').value;
  const canal  = document.getElementById('filterCanal')?.value || '';
  const order  = document.getElementById('filterOrder').value;

  document.getElementById('searchClear').style.display = q ? 'block' : 'none';

  CL.filtered = CL.all.filter(c => {
    const matchQ = !q ||
      (c.nome||'').toLowerCase().includes(q) ||
      (c.telefone||'').includes(q) ||
      (c.email||'').toLowerCase().includes(q);
    const matchS = !status || c.status === status;
    const matchC = !canal  || c.canal  === canal;
    return matchQ && matchS && matchC;
  });

  CL.filtered.sort((a, b) => {
    if (order === 'newer') return new Date(b.created_at) - new Date(a.created_at);
    if (order === 'older') return new Date(a.created_at) - new Date(b.created_at);
    if (order === 'name')  return (a.nome||'').localeCompare(b.nome||'');
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
  if (document.getElementById('filterCanal')) document.getElementById('filterCanal').value = '';
  document.getElementById('filterOrder').value = 'newer';
  document.getElementById('searchClear').style.display = 'none';
  filterTable();
}

// ── SORT ──────────────────────────────────────
function sortBy(field) {
  if (CL.sortField === field) CL.sortDir = CL.sortDir === 'asc' ? 'desc' : 'asc';
  else { CL.sortField = field; CL.sortDir = 'asc'; }
  const dir = CL.sortDir === 'asc' ? 1 : -1;
  CL.filtered.sort((a, b) => ((a[field]||'') > (b[field]||'') ? 1 : -1) * dir);
  CL.page = 1;
  renderTable();
}

// ── RENDER TABLE ──────────────────────────────
function renderTable() {
  const start = (CL.page - 1) * CL.pageSize;
  const slice = CL.filtered.slice(start, start + CL.pageSize);
  const tbody = document.getElementById('tableBody');
  const empty = document.getElementById('emptyState');

  if (CL.filtered.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'flex';
  } else {
    if (empty) empty.style.display = 'none';
    tbody.innerHTML = slice.map(c => buildRow(c)).join('');
  }
  if (CL.view === 'grid') renderGrid();
}

function buildRow(c) {
  const initials = (c.nome||'?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
  const color    = avatarColor(c.id);
  const stCls    = 'status-' + (c.status||'novo');
  const canal    = c.canal === 'whatsapp' ? '🟢 WhatsApp' : '📸 Instagram';
  const data     = c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—';

  return `
  <tr id="row-${c.id}">
    <td class="td-check">
      <label class="checkbox-label">
        <input type="checkbox" onchange="toggleSelect('${c.id}',this)" />
        <span class="checkmark"></span>
      </label>
    </td>
    <td>
      <div class="client-cell">
        <div class="cc-avatar" style="background:${color}">${initials}</div>
        <div class="cc-info">
          <span class="cc-name">${c.nome||'Sem nome'}</span>
          <span class="cc-email">${c.email||''}</span>
        </div>
      </div>
    </td>
    <td class="td-phone">${c.telefone||'—'}</td>
    <td>${canal}</td>
    <td><span class="status-badge ${stCls}"><span class="status-dot"></span>${c.status||'novo'}</span></td>
    <td class="td-date">${data}</td>
    <td class="td-actions">
      <div class="row-actions">
        <button class="ra-btn ra-edit"   onclick="openModal('edit','${c.id}')"   title="Editar">✏️</button>
        <button class="ra-btn ra-delete" onclick="openDeleteModal('${c.id}')"    title="Deletar">🗑️</button>
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
  grid.innerHTML = slice.map(c => {
    const initials = (c.nome||'?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
    const color    = avatarColor(c.id);
    return `
    <div class="client-card">
      <div class="cc-top">
        <div class="cc-avatar-lg" style="background:${color}">${initials}</div>
        <div class="cc-top-info">
          <div class="cc-top-name">${c.nome||'Sem nome'}</div>
          <div class="cc-top-emp">${c.canal === 'whatsapp' ? '🟢 WhatsApp' : '📸 Instagram'}</div>
        </div>
      </div>
      <div class="cc-badges">
        <span class="status-badge status-${c.status||'novo'}"><span class="status-dot"></span>${c.status||'novo'}</span>
      </div>
      <div class="cc-details">
        <div class="ccd-row"><span class="ccd-icon">📱</span>${c.telefone||'—'}</div>
        <div class="ccd-row"><span class="ccd-icon">✉️</span>${c.email||'—'}</div>
      </div>
      <div class="cc-actions">
        <button class="cc-btn" onclick="openModal('edit','${c.id}')">✏️ Editar</button>
        <button class="cc-btn danger" onclick="openDeleteModal('${c.id}')">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

// ── PAGINATION ────────────────────────────────
function renderPagination() {
  const total  = CL.filtered.length;
  const pages  = Math.ceil(total / CL.pageSize);
  const start  = (CL.page - 1) * CL.pageSize + 1;
  const end    = Math.min(CL.page * CL.pageSize, total);

  const info   = document.getElementById('pagInfo');
  const pPages = document.getElementById('pagPages');
  if (info)   info.textContent = total > 0 ? `Mostrando ${start}-${end} de ${total} clientes` : 'Nenhum resultado';
  if (pPages) pPages.innerHTML = buildPageNums(pages);
}

function buildPageNums(pages) {
  const nums = [], max = 5;
  let s = Math.max(1, CL.page - 2), e = Math.min(pages, s + max - 1);
  if (e - s < max - 1) s = Math.max(1, e - max + 1);
  for (let i = s; i <= e; i++)
    nums.push(`<div class="pag-num ${i === CL.page ? 'active' : ''}" onclick="goPage(${i})">${i}</div>`);
  return nums.join('');
}

function changePage(dir) {
  const pages = Math.ceil(CL.filtered.length / CL.pageSize);
  CL.page = Math.max(1, Math.min(CL.page + dir, pages));
  renderTable(); renderPagination();
}

function goPage(n) { CL.page = n; renderTable(); renderPagination(); }
function changePageSize(n) { CL.pageSize = parseInt(n); CL.page = 1; renderTable(); renderPagination(); }

// ── VIEW TOGGLE ───────────────────────────────
function setView(v, btn) {
  CL.view = v;
  document.querySelectorAll('.vt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tableCard').style.display = v === 'table' ? '' : 'none';
  document.getElementById('gridView').style.display  = v === 'grid'  ? '' : 'none';
  if (v === 'grid') renderGrid();
}

// ── SELECTION ─────────────────────────────────
function toggleSelect(id, cb) {
  if (cb.checked) CL.selected.add(id); else CL.selected.delete(id);
  document.getElementById('row-' + id)?.classList.toggle('selected', cb.checked);
  updateSelectionBar();
}

function toggleSelectAll(cb) {
  const slice = CL.filtered.slice((CL.page-1)*CL.pageSize, CL.page*CL.pageSize);
  slice.forEach(c => {
    if (cb.checked) CL.selected.add(c.id); else CL.selected.delete(c.id);
    const row = document.getElementById('row-' + c.id);
    if (row) { row.classList.toggle('selected', cb.checked); row.querySelector('input[type=checkbox]').checked = cb.checked; }
  });
  updateSelectionBar();
}

function updateSelectionBar() {
  const n = CL.selected.size;
  const bar = document.getElementById('selectionBar');
  if (bar) bar.style.display = n > 0 ? 'flex' : 'none';
  const el = document.getElementById('selCount');
  if (el) el.textContent = `${n} selecionado${n !== 1 ? 's' : ''}`;
}

function clearSelection() {
  CL.selected.clear();
  document.querySelectorAll('.cl-table input[type=checkbox]').forEach(cb => cb.checked = false);
  document.querySelectorAll('.cl-table tbody tr').forEach(tr => tr.classList.remove('selected'));
  const bar = document.getElementById('selectionBar');
  if (bar) bar.style.display = 'none';
}

// ── MODAL ─────────────────────────────────────
function openModal(mode, id) {
  CL.editingId = id || null;
  const title = document.getElementById('modalTitle');
  const delBtn = document.getElementById('cmbDeleteBtn');

  resetModalForm();

  if (mode === 'edit' && id) {
    const c = CL.all.find(x => x.id === id);
    if (!c) return;
    if (title)  title.textContent = 'Editar Cliente';
    if (delBtn) delBtn.style.display = '';
    fillForm(c);
  } else {
    if (title)  title.textContent = 'Novo Cliente';
    if (delBtn) delBtn.style.display = 'none';
  }

  document.getElementById('clientModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fillForm(c) {
  document.getElementById('fNome').value   = c.nome      || '';
  document.getElementById('fTel').value    = c.telefone  || '';
  document.getElementById('fEmail').value  = c.email     || '';
  document.getElementById('fCanal').value  = c.canal     || 'whatsapp';
  document.getElementById('fStatus').value = c.status    || 'novo';
  document.getElementById('fObs').value    = c.notas     || '';
}

function resetModalForm() {
  ['fNome','fTel','fEmail','fObs'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const canal  = document.getElementById('fCanal');  if (canal)  canal.value  = 'whatsapp';
  const status = document.getElementById('fStatus'); if (status) status.value = 'novo';
}

function closeModal() {
  document.getElementById('clientModal').classList.remove('open');
  document.body.style.overflow = '';
  CL.editingId = null;
}

async function saveModal() {
  const nome = document.getElementById('fNome').value.trim();
  const tel  = document.getElementById('fTel').value.trim();
  if (!nome) { showToast('⚠️ Nome é obrigatório', 'error'); return; }

  const btn = document.getElementById('cmbSave');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Salvando...'; }

  try {
    const payload = {
      nome,
      telefone: tel,
      email:  document.getElementById('fEmail').value.trim(),
      canal:  document.getElementById('fCanal').value,
      status: document.getElementById('fStatus').value,
      notas:  document.getElementById('fObs').value.trim(),
    };
    if (CL.editingId) payload.id = CL.editingId;

    await saveCliente(payload);
    await loadClientes();
    closeModal();
    showToast(CL.editingId ? '✅ Cliente atualizado!' : '✅ Cliente adicionado!', 'success');
  } catch(e) {
    showToast('❌ Erro ao salvar: ' + e.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Salvar cliente'; }
  }
}

function deleteFromModal() {
  closeModal();
  openDeleteModal(CL.editingId);
}

// ── DELETE ────────────────────────────────────
function openDeleteModal(id) {
  CL.deleteTargetId = id;
  const c = CL.all.find(x => x.id === id);
  const desc = document.getElementById('deleteModalDesc');
  if (desc && c) desc.innerHTML = `Deletar <strong>${c.nome}</strong>? Esta ação não pode ser desfeita.`;
  document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('open');
  CL.deleteTargetId = null;
}

async function confirmDelete() {
  const btn = document.getElementById('dmConfirmText');
  if (btn) btn.textContent = '⏳ Deletando...';

  try {
    await deleteCliente(CL.deleteTargetId);
    await loadClientes();
    closeDeleteModal();
    showToast('🗑️ Cliente deletado', 'info');
  } catch(e) {
    showToast('❌ Erro ao deletar', 'error');
  } finally {
    if (btn) btn.textContent = 'Sim, deletar';
  }
}

// ── EXPORT CSV ────────────────────────────────
function exportCSV() {
  const headers = ['Nome','Telefone','Email','Canal','Status','Cadastro'];
  const rows = CL.all.map(c => [
    c.nome, c.telefone, c.email, c.canal, c.status,
    c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : ''
  ].join(','));
  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'clientes_gvpbot.csv';
  a.click();
  showToast('📤 CSV exportado!', 'success');
}

// ── HELPERS ───────────────────────────────────
const COLORS = [
  'linear-gradient(135deg,#3B82F6,#1D4ED8)',
  'linear-gradient(135deg,#8B5CF6,#6D28D9)',
  'linear-gradient(135deg,#22C55E,#16A34A)',
  'linear-gradient(135deg,#F59E0B,#D97706)',
  'linear-gradient(135deg,#EC4899,#BE185D)',
  'linear-gradient(135deg,#14B8A6,#0D9488)',
];
function avatarColor(id) {
  const n = typeof id === 'string' ? id.charCodeAt(0) + id.charCodeAt(id.length-1) : id;
  return COLORS[n % COLORS.length];
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
}
