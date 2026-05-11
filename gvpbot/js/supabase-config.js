const SUPABASE_URL = 'https://ypeqnvmaenlnlxmotbrr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZXFudm1hZW5sbmx4bW90YnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTgzMzgsImV4cCI6MjA5Mzc3NDMzOH0.DX2ZX6a4cxy2dyTgxSl5HjUqaGGQmblLNUk860Zab2U';
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function fillUserInfo() {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return null;
  const { data } = await _sb.from('perfis').select('*').eq('id', user.id).single();
  return data || { email: user.email };
}
async function getClientes() {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return [];
  const { data } = await _sb.from('clientes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  return data || [];
}
async function saveCliente(c) {
  const { data: { user } } = await _sb.auth.getUser();
  const { data, error } = await _sb.from('clientes').upsert({ ...c, user_id: user.id }).select().single();
  if (error) throw error; return data;
}
async function deleteCliente(id) {
  const { error } = await _sb.from('clientes').delete().eq('id', id);
  if (error) throw error;
}
async function getMensagens(limite = 50) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return [];
  const { data } = await _sb.from('mensagens').select('*, clientes(nome, telefone)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(limite);
  return data || [];
}
async function getFluxos() {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return [];
  const { data } = await _sb.from('fluxos').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  return data || [];
}
async function saveFluxo(f) {
  const { data: { user } } = await _sb.auth.getUser();
  const { data, error } = await _sb.from('fluxos').upsert({ ...f, user_id: user.id }).select().single();
  if (error) throw error; return data;
}
async function getIntegracao(tipo) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return null;
  const { data } = await _sb.from('integracoes').select('*').eq('user_id', user.id).eq('tipo', tipo).single();
  return data;
}
async function saveIntegracao(tipo, config) {
  const { data: { user } } = await _sb.auth.getUser();
  const { data, error } = await _sb.from('integracoes').upsert({ user_id: user.id, tipo, config }).select().single();
  if (error) throw error; return data;
}
async function getMetricasRange(dias = 7) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return [];
  const desde = new Date(); desde.setDate(desde.getDate() - dias);
  const { data } = await _sb.from('metricas').select('*').eq('user_id', user.id).gte('data', desde.toISOString().split('T')[0]).order('data', { ascending: true });
  return data || [];
}
async function getPlanoPerfil() {
  const p = await fillUserInfo(); return p?.plano || 'trial';
}
async function atualizarPlano(plano, dados_pagamento = {}) {
  const { data: { user } } = await _sb.auth.getUser();
  if (!user) return;
  await _sb.from('perfis').update({ plano, dados_pagamento, plano_ativo_ate: new Date(Date.now() + 30*24*60*60*1000).toISOString() }).eq('id', user.id);
}
