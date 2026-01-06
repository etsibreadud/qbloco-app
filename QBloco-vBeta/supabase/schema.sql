-- QBloco MVP schema (Supabase / Postgres)
-- Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- 1) Blocos (programação)
create table if not exists public.blocos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date text not null,          -- keep as text for MVP (e.g., "2026-02-14"); can migrate to date later
  time text not null,          -- keep as text for MVP (e.g., "14:00")
  neighborhood text not null,
  metro text not null,
  audience text[] not null default '{}',
  expected_crowd integer,
  rating numeric(2,1) not null default 0,
  created_at timestamptz not null default now()
);

-- 2) Favoritos (por usuário)
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  bloco_id uuid not null references public.blocos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, bloco_id)
);

-- 3) Check-in sessions (gamificação)
create table if not exists public.checkin_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bloco_id uuid not null references public.blocos(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  distance_m integer,
  status text not null default 'in_progress',
  created_at timestamptz not null default now()
);

create index if not exists idx_checkin_sessions_user on public.checkin_sessions(user_id, started_at desc);
create index if not exists idx_favorites_user on public.favorites(user_id);

-- RLS
alter table public.blocos enable row level security;
alter table public.favorites enable row level security;
alter table public.checkin_sessions enable row level security;

-- Blocos: leitura pública (MVP). Para restringir, troque para authenticated.
drop policy if exists "blocos_select_public" on public.blocos;
create policy "blocos_select_public" on public.blocos
for select
to public
using (true);

-- Favorites: somente dono
drop policy if exists "favorites_owner_select" on public.favorites;
create policy "favorites_owner_select" on public.favorites
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "favorites_owner_insert" on public.favorites;
create policy "favorites_owner_insert" on public.favorites
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "favorites_owner_delete" on public.favorites;
create policy "favorites_owner_delete" on public.favorites
for delete
to authenticated
using (auth.uid() = user_id);

-- Check-in sessions: somente dono
drop policy if exists "sessions_owner_select" on public.checkin_sessions;
create policy "sessions_owner_select" on public.checkin_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "sessions_owner_insert" on public.checkin_sessions;
create policy "sessions_owner_insert" on public.checkin_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "sessions_owner_update" on public.checkin_sessions;
create policy "sessions_owner_update" on public.checkin_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Optional: constrain status values
-- alter table public.checkin_sessions
--   add constraint check_status
--   check (status in ('in_progress','completed','canceled'));
