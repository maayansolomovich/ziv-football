-- ============================================================
-- Ziv Agency — Full Setup Script
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1. Create table
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

-- 2. RLS
alter table public.ziv_players enable row level security;
drop policy if exists "ziv_players anon all" on public.ziv_players;
create policy "ziv_players anon all" on public.ziv_players
  for all to anon using (true) with check (true);

-- 3. Realtime
do $$
begin
  alter publication supabase_realtime add table public.ziv_players;
exception when duplicate_object then null;
end $$;

-- 4. Insert all players
insert into public.ziv_players (id,name,pos,team,prev_team,signed,shirt,age,dob,height,weight,foot,goals,assists,apps,salary,fee,contract_start_full,contract_end,contract_file,exp_soon,phone,ig,email,photos) values
('ofek-biton','אופק ביטון','קשר תוקפני','הפועל חיפה',NULL,true,0,26,'27/09/1999',175,0,'ימין',0,0,0,0,0,'03/09/2025','30/06/2026',NULL,false,NULL,'','','[]'::jsonb),
('stav-turiel','סתיו טוריאל','כנף ימין','הפועל תל אביב',NULL,true,0,25,'14/01/2001',0,0,'שמאל',0,0,0,0,0,'10/01/2024','30/06/2029',NULL,false,NULL,'','','[]'::jsonb),
('triko-gatehun','טריקו גטהון','מגן שמאל','מכבי קריית מלאכי',NULL,true,0,31,'01/01/1995',0,0,'ימין',0,0,0,0,0,'24/09/2024',NULL,NULL,false,NULL,'','','[]'::jsonb),
('dor-kochav','דור כוכב','קשר תוקפני','הפועל רעננה',NULL,true,0,33,'06/05/1993',0,0,'ימין',0,0,0,0,0,'13/01/2025',NULL,NULL,false,NULL,'','','[]'::jsonb),
('ori-tzaadon','אורי צעדון','מגן ימין','מכבי הרצליה',NULL,true,0,32,'17/05/1994',170,0,'ימין',0,0,0,0,0,'01/07/2025',NULL,NULL,false,NULL,'','','[]'::jsonb),
('ahmad-abed','אחמד אעבד','כנף ימין','מכבי אחי נצרת',NULL,true,0,36,'30/03/1990',184,0,'ימין',0,0,0,0,0,'07/01/2026',NULL,NULL,false,NULL,'','','[]'::jsonb),
('abdallah-jaber','עבדאללה ג''אבר','מגן שמאל','מכבי בני ריינה',NULL,true,0,33,'17/02/1993',175,0,'שמאל',0,0,0,0,0,'19/01/2023','30/06/2029',NULL,false,NULL,'','','[]'::jsonb),
('ron-unger','רון אונגר','מגן ימין','עירוני טבריה',NULL,true,0,24,'05/09/2001',0,0,'ימין',0,0,0,0,0,'01/07/2025','30/06/2027',NULL,false,NULL,'','','[]'::jsonb),
('daniel-tenenbaum','דניאל טננבאום','שוער','עירוני קריית שמונה',NULL,true,0,31,'19/04/1995',191,0,'ימין',0,0,0,0,0,'01/07/2025','30/06/2027',NULL,false,NULL,'','','[]'::jsonb),
('itay-zada','איתי זדה','כנף שמאל','מכבי יפו',NULL,true,0,23,'30/11/2002',165,0,'ימין',0,0,0,0,0,'22/01/2026','30/06/2026',NULL,false,NULL,'','','[]'::jsonb),
('dolev-balulu','דולב בלולו','קשר מרכזי','מכבי יפו',NULL,true,0,27,'17/04/1999',0,0,'ימין',0,0,0,0,0,'11/02/2026',NULL,NULL,false,NULL,'','','[]'::jsonb),
('sintayehu-sallalich','סנטי סולליך','כנף ימין','ללא קבוצה',NULL,true,0,35,'20/06/1991',167,0,'ימין',0,0,0,0,0,'01/07/2025',NULL,NULL,false,NULL,'','','[]'::jsonb),
('ben-yechezkel','בן יחזקאל',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('idan-va-aknin','עידן ועקנין',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('netanel-peretz','נתנאל פרץ',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('aviv-lin','אביב לין',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('shon-buskila','שון בוסקילה',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('daniel-elmaleh','דניאל אלמלח',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('david-asanka','דוד אסנקה',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('harel-levy','הראל לוי',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('ronen-peretz','רונן פרץ',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('adir-maya','אדיר מאיה',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('tom-yechezkel','טום יחזקאל',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('shagiv-elbaz','שגיב אלבז',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('itay-elkeslasi','איתי אלקסלסי',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('omer-nachfawi','עומר נאחפאווי',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('dassa-ayelin','דסה איילין',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('adir-rachamim','אדיר רחמים',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('niko-lasedman','ניקו לסדמן',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('roi-rabinowitz','רועי רבינוביץ',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('noam-shenhav','נועם שנהב',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('daniel-de-wandler','דניאל דה וונדלר',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('yair-nir','יאיר ניר',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('itzik-baruch','איציק ברוך',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('uri-kargola','אורי קרגולה',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('ofek-mashan','אופק משען',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('nir-hassan','ניר חסון',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('elad-ashram','אלעד אשרם',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('yonatan-greenbaum','יונתן גרינבאום',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('gal-ka-atabi','גל קעתבי',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('shai-mossinko','שי מוסינקו',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('saber-badir','סאבר באדיר',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('haim-mekonnen','חיים מקונן',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('koren-zisman','קורן זיסמן',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('sharon-adam','שרון אדם',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('henti','הנטי',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb),
('dror-nir','דרור ניר',NULL,'',NULL,false,0,0,'—',0,0,'ימין',0,0,0,0,0,NULL,NULL,NULL,false,NULL,'','','[]'::jsonb)
on conflict (id) do nothing;
