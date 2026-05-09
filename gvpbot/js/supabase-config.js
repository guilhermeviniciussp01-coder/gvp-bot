// ============================================================
// SUPABASE CONFIG — GVP BOT
// ============================================================
const SUPABASE_URL = 'https://ypeqnvmaenlnlxmotbrr.supabase.co';
const SUPABASE_KEY = 'COLE_SUA_ANON_KEY_AQUI'; // ← veja abaixo como pegar

// ⚠️ CORREÇÃO: variável é _sb (usada em todas as funções)
// Suporte aos dois formatos do CDN
const _supabase = window.supabase || window.Supabase;
const _sb = _supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── AUTH ────────────────────────────────────────────────────
async function requireAuth() {
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return null; }
  return session;
}

async function fillUserInfo() {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return null;
  const { data } = await _sb.from('perfis').select('*').eq('id', user.id).single();
  return data || { email: user.email };
}

async function loginUser(email, senha) {
  const { data, error } = await _sb.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  return data;
}

async function cadastrarUser(email, senha, nome) {
  const { data, error } = await _sb.auth.signUp({
    email, password: senha,
    options: { data: { nome } }
  });
  if (error) throw error;
  if (data.user) {
    await _sb.from('perfis').upsert({ id: data.user.id, nome, email, plano: 'trial' });
  }
  return data;
}

async function logoutUser() {
  await _sb.auth.signOut();
  window.location.href = 'login.html';
}

// ── CLIENTES ────────────────────────────────────────────────
async function getClientes() {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return [];
  const { data } = await _sb.from('clientes')
    .select('*, mensagens(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return data || [];
}

async function saveCliente(cliente) {
  const { data: { user } } = await _sb.auth.getUser();
  const { data, error } = await _sb.from('clientes').upsert({
    ...cliente, user_id: user.id, updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

async function deleteCliente(id) {
  const { error } = await _sb.from('clientes').delete().eq('id', id);
  if (error) throw error;
}

// ── MENSAGENS ───────────────────────────────────────────────
async function getMensagens(limite = 50) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return [];
  const { data } = await _sb.from('mensagens')
    .select('*, clientes(nome, telefone)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limite);
  return data || [];
}

async function saveMensagem(msg) {
  const { data: { user } } = await _sb.auth.getUser();
  const { data, error } = await _sb.from('mensagens').insert({
    ...msg, user_id: user.id
  }).select().single();
  if (error) throw error;
  return data;
}

// ── FLUXOS ──────────────────────────────────────────────────
async function getFluxos() {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return [];
  const { data } = await _sb.from('fluxos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return data || [];
}

async function saveFluxo(fluxo) {
  const { data: { user } } = await _sb.auth.getUser();
  const { data, error } = await _sb.from('fluxos').upsert({
    ...fluxo, user_id: user.id, updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

async function deleteFluxo(id) {
  const { error } = await _sb.from('fluxos').delete().eq('id', id);
  if (error) throw error;
}

// ── INTEGRAÇÕES ─────────────────────────────────────────────
async function getIntegracao(tipo) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return null;
  const { data } = await _sb.from('integracoes')
    .select('*').eq('user_id', user.id).eq('tipo', tipo).single();
  return data;
}

async function saveIntegracao(tipo, config) {
  const { data: { user } } = await _sb.auth.getUser();
  const { data, error } = await _sb.from('integracoes').upsert({
    user_id: user.id, tipo, config, updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

// ── MÉTRICAS ────────────────────────────────────────────────
async function getMetricasRange(dias = 7) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return [];
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const { data } = await _sb.from('metricas')
    .select('*')
    .eq('user_id', user.id)
    .gte('data', desde.toISOString().split('T')[0])
    .order('data', { ascending: true });
  return data || [];
}

async function incrementarMetrica(campo) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return;
  const hoje = new Date().toISOString().split('T')[0];
  const { data: exist } = await _sb.from('metricas')
    .select('*').eq('user_id', user.id).eq('data', hoje).single();
  if (exist) {
    await _sb.from('metricas').update({ [campo]: (exist[campo] || 0) + 1 })
      .eq('id', exist.id);
  } else {
    await _sb.from('metricas').insert({ user_id: user.id, data: hoje, [campo]: 1 });
  }
}

// ── PLANO ───────────────────────────────────────────────────
async function getPlanoPerfil() {
  const profile = await fillUserInfo();
  return profile?.plano || 'trial';
}

async function atualizarPlano(plano, dados_pagamento = {}) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return;
  await _sb.from('perfis').update({
    plano,
    dados_pagamento,
    plano_ativo_ate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }).eq('id', user.id);
}
