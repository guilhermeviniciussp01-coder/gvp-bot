// ============================================================
// SUPABASE CONFIG — GVP BOT
// ============================================================
// ============================================================
// SUPABASE CONFIG — GVP BOT
// ============================================================
const SUPABASE_URL = 'https://ypeqnvmaenlnlxmotbrr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZXFudm1hZW5sbmx4bW90YnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTgzMzgsImV4cCI6MjA5Mzc3NDMzOH0.DX2ZX6a4cxy2dyTgxSl5HjUqaGGQmblLNUk860Zab2U';

// Injeta o CDN no HEAD de forma síncrona (async=false)
if (!window.supabase) {
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  s.async = false;
  s.defer = false;
  document.head.insertBefore(s, document.head.firstChild);
}

// Inicializa após o script carregar
var _sb;
function _initSb() {
  if (window.supabase && !_sb) {
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
}

// Tenta inicializar agora e também no DOMContentLoaded
_initSb();
document.addEventListener('DOMContentLoaded', _initSb);

// Garante que _sb existe antes de qualquer chamada
async function _getSb() {
  if (_sb) return _sb;
  return new Promise(resolve => {
    const check = setInterval(() => {
      _initSb();
      if (_sb) { clearInterval(check); resolve(_sb); }
    }, 50);
  });
}

// ── AUTH ────────────────────────────────────────────────────
async function requireAuth() {
  const sb = await _getSb();
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return null; }
  return session;
}

async function fillUserInfo() {
  const sb = await _getSb();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from('perfis').select('*').eq('id', user.id).single();
  return data || { email: user.email };
}

async function loginUser(email, senha) {
  const sb = await _getSb();
  const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  return data;
}

async function logoutUser() {
  const sb = await _getSb();
  await sb.auth.signOut();
  window.location.href = 'login.html';
}

async function getClientes() {
  const sb = await _getSb();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from('clientes')
    .select('*, mensagens(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return data || [];
}

async function saveCliente(cliente) {
  const sb = await _getSb();
  const { data: { user } } = await sb.auth.getUser();
  const { data, error } = await sb.from('clientes').upsert({
    ...cliente, user_id: user.id, updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

async function deleteCliente(id) {
  const sb = await _getSb();
  const { error } = await sb.from('clientes').delete().eq('id', id);
  if (error) throw error;
}

async function getMensagens(limite = 50) {
  const sb = await _getSb();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from('mensagens')
    .select('*, clientes(nome, telefone)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limite);
  return data || [];
}

async function saveMensagem(msg) {
  const sb = await _getSb();
  const { data: { user } } = await sb.auth.getUser();
  const { data, error } = await sb.from('mensagens').insert({
    ...msg, user_id: user.id
  }).select().single();
  if (error) throw error;
  return data;
}

async function getFluxos() {
  const sb = await _getSb();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb.from('fluxos')
    .select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return data || [];
}

async function saveFluxo(fluxo) {
  const sb = await _getSb();
  const { data: { user } } = await sb.auth.getUser();
  const { data, error } = await sb.from('fluxos').upsert({
    ...fluxo, user_id: user.id, updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

async function deleteFluxo(id) {
  const sb = await _getSb();
  const { error } = await sb.from('fluxos').delete().eq('id', id);
  if (error) throw error;
}

async function getIntegracao(tipo) {
  const sb = await _getSb();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from('integracoes')
    .select('*').eq('user_id', user.id).eq('tipo', tipo).single();
  return data;
}

async function saveIntegracao(tipo, config) {
  const sb = await _getSb();
  const { data: { user } } = await sb.auth.getUser();
  const { data, error } = await sb.from('integracoes').upsert({
    user_id: user.id, tipo, config, updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return data;
}

async function getMetricasRange(dias = 7) {
  const sb = await _getSb();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const { data } = await sb.from('metricas')
    .select('*').eq('user_id', user.id)
    .gte('data', desde.toISOString().split('T')[0])
    .order('data', { ascending: true });
  return data || [];
}

async function incrementarMetrica(campo) {
  const sb = await _getSb();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  const hoje = new Date().toISOString().split('T')[0];
  const { data: exist } = await sb.from('metricas')
    .select('*').eq('user_id', user.id).eq('data', hoje).single();
  if (exist) {
    await sb.from('metricas').update({ [campo]: (exist[campo] || 0) + 1 }).eq('id', exist.id);
  } else {
    await sb.from('metricas').insert({ user_id: user.id, data: hoje, [campo]: 1 });
  }
}

async function getPlanoPerfil() {
  const profile = await fillUserInfo();
  return profile?.plano || 'trial';
}

async function atualizarPlano(plano, dados_pagamento = {}) {
  const sb = await _getSb();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;
  await sb.from('perfis').update({
    plano, dados_pagamento,
    plano_ativo_ate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }).eq('id', user.id);
}


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
