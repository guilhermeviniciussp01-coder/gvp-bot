-- ================================================
-- GVP BOT — SCHEMA COMPLETO DO BANCO DE DADOS
-- Execute este SQL no Supabase SQL Editor
-- ================================================

-- EXTENSÕES
create extension if not exists "uuid-ossp";

-- ================================================
-- TABELA: perfis de usuário (ligada ao auth)
-- ================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nome text,
  email text,
  telefone text,
  empresa text,
  segmento text,
  volume_atendimento text,
  plano text default 'starter',
  plano_status text default 'trial',
  trial_ends_at timestamptz default (now() + interval '7 days'),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================
-- TABELA: clientes (leads captados pelo bot)
-- ================================================
create table public.clientes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  nome text not null,
  telefone text,
  email text,
  canal text default 'whatsapp',
  status text default 'novo',
  tags text[],
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================
-- TABELA: fluxos de chatbot
-- ================================================
create table public.fluxos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  nome text not null,
  descricao text,
  nodes jsonb default '[]',
  edges jsonb default '[]',
  status text default 'rascunho',
  canal text default 'whatsapp',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================
-- TABELA: mensagens
-- ================================================
create table public.mensagens (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete set null,
  canal text default 'whatsapp',
  direcao text default 'recebida',
  conteudo text,
  tipo text default 'texto',
  lida boolean default false,
  created_at timestamptz default now()
);

-- ================================================
-- TABELA: integrações (whatsapp, instagram, etc)
-- ================================================
create table public.integracoes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  tipo text not null,
  status text default 'desconectado',
  config jsonb default '{}',
  token text,
  numero text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================
-- TABELA: configurações de IA
-- ================================================
create table public.config_ia (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique,
  ativa boolean default false,
  modelo text default 'gpt-3.5-turbo',
  prompt_sistema text default 'Você é um assistente de atendimento profissional e simpático.',
  temperatura numeric default 0.7,
  max_tokens int default 500,
  api_key text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ================================================
-- TABELA: métricas diárias
-- ================================================
create table public.metricas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  data date default current_date,
  conversas int default 0,
  leads int default 0,
  mensagens_enviadas int default 0,
  mensagens_recebidas int default 0,
  taxa_conversao numeric default 0,
  created_at timestamptz default now()
);

-- ================================================
-- ROW LEVEL SECURITY (cada usuário vê só seus dados)
-- ================================================
alter table public.profiles enable row level security;
alter table public.clientes enable row level security;
alter table public.fluxos enable row level security;
alter table public.mensagens enable row level security;
alter table public.integracoes enable row level security;
alter table public.config_ia enable row level security;
alter table public.metricas enable row level security;

-- Políticas: usuário acessa apenas seus próprios dados
create policy "profiles_own" on public.profiles for all using (auth.uid() = id);
create policy "clientes_own" on public.clientes for all using (auth.uid() = user_id);
create policy "fluxos_own" on public.fluxos for all using (auth.uid() = user_id);
create policy "mensagens_own" on public.mensagens for all using (auth.uid() = user_id);
create policy "integracoes_own" on public.integracoes for all using (auth.uid() = user_id);
create policy "config_ia_own" on public.config_ia for all using (auth.uid() = user_id);
create policy "metricas_own" on public.metricas for all using (auth.uid() = user_id);

-- ================================================
-- FUNÇÃO: criar perfil automaticamente no cadastro
-- ================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
