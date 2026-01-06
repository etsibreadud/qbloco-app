# QBloco – guia de blocos do Rio

Aplicativo React + Vite com Supabase para listar, filtrar e administrar blocos de carnaval do Rio de Janeiro. Projeto pensado para custo zero (Supabase free tier + deploy em Vercel) e manutenção simples.

## Stack escolhida
- **Frontend**: React 18 + Vite, Tailwind CSS, componentes Radix/MUI e ícones Lucide.
- **Backend-as-a-Service**: Supabase (Postgres, Auth, Storage, Row Level Security).
- **Auth**: Magic Link por e-mail (Supabase). Admins definidos por variável de ambiente `VITE_ADMIN_EMAILS`.
- **Deploy**: Vercel (build com `npm run build`).
- **Importação**: script Node (`npm run import:csv`) com Supabase service role e CSV.

## Pré-requisitos
- Node 20+
- Conta gratuita no [Supabase](https://supabase.com/)
- Conta gratuita no [Vercel](https://vercel.com/)

## Setup local
1. Instale dependências:
   ```bash
   npm install
   ```
2. Crie o arquivo `.env.local` na raiz com as chaves públicas:
   ```bash
   VITE_SUPABASE_URL="https://<sua-instancia>.supabase.co"
   VITE_SUPABASE_ANON_KEY="<anon-key>"
   VITE_ADMIN_EMAILS="admin@exemplo.com,outra@exemplo.com"
   ```
3. Rode o app:
   ```bash
   npm run dev
   ```
   Se as variáveis não estiverem definidas o app usa os dados de exemplo locais (somente leitura, sem login).

## Modelagem e SQL
Use a aba **SQL Editor** do Supabase e execute o script abaixo para criar tabelas, chaves e RLS. Ele modela N:N entre blocos e públicos-alvo.

```sql
create table if not exists audiences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

create table if not exists blocos (
  id text primary key,
  name text not null,
  date date not null,
  time text not null,
  neighborhood text not null,
  metro text not null,
  expected_crowd text check (expected_crowd in ('low','medium','high','very-high')) default 'medium',
  rating numeric default 0,
  review_count integer default 0,
  audience text[],
  source text,
  observations text,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists bloco_audiences (
  bloco_id text references blocos(id) on delete cascade,
  audience_id uuid references audiences(id) on delete cascade,
  primary key (bloco_id, audience_id)
);

create table if not exists favorites (
  user_id uuid references auth.users(id) on delete cascade,
  bloco_id text references blocos(id) on delete cascade,
  primary key (user_id, bloco_id)
);

create table if not exists checkin_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  bloco_id text references blocos(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  distance_m integer,
  status text default 'in_progress'
);

-- Políticas: leitura pública
alter table blocos enable row level security;
alter table favorites enable row level security;
alter table checkin_sessions enable row level security;
alter table bloco_audiences enable row level security;

create policy "blocos_public" on blocos for select using (true);
create policy "audiences_public" on bloco_audiences for select using (true);

-- Escrita apenas para admins (checado por claim customizada 'is_admin')
create policy "admin_write_blocos" on blocos for all using (auth.jwt() ->> 'is_admin' = 'true');
create policy "admin_write_aud" on bloco_audiences for all using (auth.jwt() ->> 'is_admin' = 'true');

-- Usuário logado controla seus favoritos e check-ins
create policy "favorites_owner" on favorites for select using (auth.uid() = user_id);
create policy "favorites_owner_write" on favorites for insert with check (auth.uid() = user_id);
create policy "favorites_owner_delete" on favorites for delete using (auth.uid() = user_id);

create policy "checkins_owner" on checkin_sessions for select using (auth.uid() = user_id);
create policy "checkins_owner_write" on checkin_sessions for insert with check (auth.uid() = user_id);
create policy "checkins_owner_update" on checkin_sessions for update using (auth.uid() = user_id);
```

### Permissão de admin
- No Supabase, vá em **Authentication → Policies → JWT** e adicione o claim `is_admin` para os e-mails listados em `VITE_ADMIN_EMAILS` (ou use a função `auth.admin.generateLink` e atribua o claim manualmente).
- Apenas contas com `is_admin=true` enxergam o painel de admin no app.

## Importação por CSV
1. Garanta que o schema acima exista.
2. Crie `.env` com:
   ```env
   SUPABASE_URL="https://<sua-instancia>.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="<service-role>"
   ```
3. Use o CSV de exemplo (`data/sample-blocos.csv`) ou outro com cabeçalhos:
   `id,name,date,time,neighborhood,metro,audiences,expected_crowd,rating,review_count,source,observations`
4. Rode:
   ```bash
   npm run import:csv -- ./data/sample-blocos.csv
   ```
   O script cria públicos-alvo inexistentes, upserta blocos e repovoa a tabela de junção.

## Uso do app
- **Programação**: busca por nome/metrô/bairro, filtros por intervalo de datas, horário (manhã/tarde/noite), público-alvo multi-seleção, metrô/bairro, lotação e ordenação (data, avaliação, lotação).
- **Detalhe do bloco**: público-alvo, expectativa de público, metrô, fonte/observações, favoritos, check-in/check-out.
- **Perfil**: magic link, trilha de check-ins, favoritos e badges.
- **Admin**: criar/editar/excluir blocos (campo de ID permite atualizar) e botão de recarregar lista.

## Deploy na Vercel (gratuito)
1. Faça fork deste repositório e conecte no Vercel.
2. Defina variáveis de ambiente no projeto Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAILS`
3. Build command: `npm run build` • Output: `dist`
4. Cada push na branch principal dispara novo deploy automático.

## Publicação do zero
1. Crie o projeto no Supabase e rode o SQL de modelagem acima.
2. Cadastre `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_ADMIN_EMAILS` no `.env.local`.
3. (Opcional) Importe blocos iniciais com `npm run import:csv -- ./data/sample-blocos.csv`.
4. Teste local com `npm run dev`.
5. Conecte o repo na Vercel e publique. O app já estará pronto com dados públicos e painel admin.

## Comandos úteis
- `npm run dev` – servidor local
- `npm run build` – build de produção
- `npm run import:csv -- ./data/sample-blocos.csv` – importa/atualiza blocos a partir de CSV

## Observações
- Sem chaves do Supabase, o app funciona em modo demo usando os blocos de exemplo locais (somente leitura, sem login, favoritos ou admin).
- Não committe `.env` ou chaves privadas.
