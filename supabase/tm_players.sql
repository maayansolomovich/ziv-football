-- Transfermarkt scouting dataset (dcaribou/transfermarkt-datasets · Kaggle:
-- davidcariboo/player-scores). Powers the "חיפוש חכם" tab — natural-language
-- queries are translated to filters and run against THIS table (no live calls
-- to Transfermarkt at query time).
--
-- Run once in Supabase Dashboard → SQL Editor → New query → Run, then load the
-- rows with: python3 scripts/import_tm_players.py

create table if not exists public.tm_players (
  id text primary key,                  -- Transfermarkt player_id
  name text not null,
  position text,                        -- Goalkeeper | Defender | Midfield | Attack
  sub_position text,                    -- e.g. Centre-Back, Left Winger
  club text,                            -- null = free agent
  club_id int,
  market_value bigint,                  -- current market value, euros
  highest_market_value bigint,
  contract_until date,
  dob date,
  foot text,
  height int,
  nationality text,
  image_url text,
  url text,                             -- Transfermarkt profile URL
  last_season int
);

create index if not exists tm_players_position_idx on public.tm_players (position);
create index if not exists tm_players_market_value_idx on public.tm_players (market_value);
create index if not exists tm_players_contract_idx on public.tm_players (contract_until);
create index if not exists tm_players_dob_idx on public.tm_players (dob);

-- Reference data: the app reads it; the import script writes it. Mirrors the
-- lean anon-access pattern already used by ziv_players in this project.
alter table public.tm_players enable row level security;

drop policy if exists "tm_players anon all" on public.tm_players;
create policy "tm_players anon all" on public.tm_players
  for all to anon using (true) with check (true);
