// Queries the imported Transfermarkt dataset in Supabase (table tm_players).
// The natural-language filters from openai.ts are translated into a Supabase
// query here — all server-side, no live Transfermarkt calls at query time.
import { supabase } from './supabase'
import type { AgeClass, PositionGroup, ScoutFilters } from './openai'

export interface TmDbPlayer {
  id: string
  name: string
  position: string | null
  subPosition: string | null
  club: string | null
  marketValue: number | null
  contractUntil: string | null
  dob: string | null
  nationality: string | null
  foot: string | null
  url: string | null
}

const GROUP_TO_POS: Record<PositionGroup, string> = {
  gk: 'Goalkeeper',
  def: 'Defender',
  mid: 'Midfield',
  att: 'Attack',
}

// Translate an age bucket into date-of-birth bounds relative to today.
function dobBounds(ageClass: AgeClass | null): { min?: string; max?: string } {
  if (!ageClass) return {}
  const now = new Date()
  const iso = (yearsAgo: number) =>
    new Date(now.getFullYear() - yearsAgo, now.getMonth(), now.getDate()).toISOString().slice(0, 10)
  switch (ageClass) {
    case 'u18': return { min: iso(18) }
    case 'u19': return { min: iso(19) }
    case 'u20': return { min: iso(20) }
    case 'u21': return { min: iso(21) }
    case 'u23': return { min: iso(23) }
    case '23-30': return { min: iso(30), max: iso(23) }
    case 'o30': return { max: iso(30) }
    case 'o32': return { max: iso(32) }
    case 'o34': return { max: iso(34) }
    default: return {}
  }
}

export function ageFromDob(dob: string | null): number | null {
  if (!dob) return null
  const d = new Date(dob)
  if (isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

export async function queryTmPlayers(f: ScoutFilters, limit = 60): Promise<TmDbPlayer[]> {
  let q = supabase
    .from('tm_players')
    .select('id,name,position,sub_position,club,market_value,contract_until,dob,nationality,foot,url')
    .not('market_value', 'is', null)

  if (f.positionGroup) q = q.eq('position', GROUP_TO_POS[f.positionGroup])
  if (f.maxValueEur) q = q.lte('market_value', f.maxValueEur)
  if (f.minValueEur) q = q.gte('market_value', f.minValueEur)
  if (f.playerName) q = q.ilike('name', `%${f.playerName}%`)
  if (f.freeAgent) q = q.is('club', null)
  if (f.contractUntilYear) {
    q = q.gte('contract_until', `${f.contractUntilYear}-01-01`).lte('contract_until', `${f.contractUntilYear}-12-31`)
  }
  const b = dobBounds(f.ageClass)
  if (b.min) q = q.gte('dob', b.min)
  if (b.max) q = q.lte('dob', b.max)

  q = q.order('market_value', { ascending: false }).limit(limit)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    position: (r.position as string) ?? null,
    subPosition: (r.sub_position as string) ?? null,
    club: (r.club as string) ?? null,
    marketValue: (r.market_value as number) ?? null,
    contractUntil: (r.contract_until as string) ?? null,
    dob: (r.dob as string) ?? null,
    nationality: (r.nationality as string) ?? null,
    foot: (r.foot as string) ?? null,
    url: (r.url as string) ?? null,
  }))
}
