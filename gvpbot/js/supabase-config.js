// ================================================
// GVP BOT — CONFIGURAÇÃO SUPABASE
// ================================================

const SUPABASE_URL = 'https://ypeqnvmaenlnlxmotbrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZXFudm1hZW5sbmx4bW90YnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTgzMzgsImV4cCI6MjA5Mzc3NDMzOH0.DX2ZX6a4cxy2dyTgxSl5HjUqaGGQmblLNUk860Zab2U';

// Carregar Supabase via CDN
const supabaseScript = document.createElement('script');
supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
supabaseScript.onload = () => {
  window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.dispatchEvent(new Event('supabase-ready'));
};
document.head.appendChild(supabaseScript);

// ================================================
// AUTH HELPERS
// ================================================

// Verificar sessão ativa
async function getSession() {
  await waitSupabase();
  const { data: { session } } = await window.supabase.auth.getSession();
  return session;
}

// Verificar se está logado, senão redireciona
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

// Redirecionar se já logado (para login/cadastro)
async function redirectIfLoggedIn() {
  const session = await getSession();
  if (session) {
    window.location.href = 'dashboard.html';
  }
}

// Buscar perfil do usuário
async function getProfile() {
  const session = await getSession();
  if (!session) return null;
  const { data } = await window.supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  return data;
}

// Logout
async function logout() {
  await waitSupabase();
  await window.supabase.auth.signOut();
  window.location.href = 'login.html';
}

// Aguardar Supabase carregar
function waitSupabase() {
  return new Promise(resolve => {
    if (window.supabase && typeof window.supabase.auth !== 'undefined') {
      resolve();
    } else {
      window.addEventListener('supabase-ready', resolve, { once: true });
    }
  });
}

// Preencher dados do usuário na interface
async function fillUserInfo() {
  const profile = await getProfile();
  if (!profile) return;

  const nome = profile.nome || profile.email || 'Usuário';
  const iniciais = nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const empresa = profile.empresa || 'Minha Empresa';
  const plano = profile.plano || 'starter';

  document.querySelectorAll('.user-avatar, .user-avatar-sm').forEach(el => {
    el.textContent = iniciais;
  });
  document.querySelectorAll('.user-mini-name').forEach(el => {
    el.textContent = nome.split(' ')[0];
  });
  document.querySelectorAll('.user-mini-plan').forEach(el => {
    el.textContent = 'Plano ' + plano.charAt(0).toUpperCase() + plano.slice(1);
  });
  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = nome.split(' ')[0];
  });
}
