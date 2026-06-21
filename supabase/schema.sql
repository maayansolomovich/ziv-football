-- Ziv Agency — players table
-- Run once in Supabase Dashboard → SQL Editor → New query → Run.

create table if not exists public.ziv_players (
  id text primary key,
  name text not null,
  pos text,
  team text default '',
  prev_team text,
  signed boolean not null default false,
  shirt int default 0,
  age int default 0,
  dob text default '—',
  height int default 0,
  weight int default 0,
  foot text default 'ימין',
  goals int default 0,
  assists int default 0,
  apps int default 0,
  salary bigint default 0,
  fee bigint default 0,
  contract_start_full text,
  contract_end text,
  contract_file text,
  exp_soon boolean not null default false,
  phone text default '—',
  ig text default '',
  email text default '',
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- No login yet (lean, 2 users): allow the anon key full access, governed by RLS.
alter table public.ziv_players enable row level security;

drop policy if exists "ziv_players anon all" on public.ziv_players;
create policy "ziv_players anon all" on public.ziv_players
  for all to anon using (true) with check (true);

-- Live sync between Ziv and his wife.
alter publication supabase_realtime add table public.ziv_players;
