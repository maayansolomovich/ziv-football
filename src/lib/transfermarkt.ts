// Lightweight client for the public Transfermarkt API wrapper
// (felipeall/transfermarkt-api). It scrapes Transfermarkt and exposes a REST
// interface. The hosted instance is rate-limited and best-effort, so every
// call here is defensive and falls back gracefully.
const BASE = 'https://transfermarkt-api.fly.dev'

export interface TmPlayer {
  id: string
  name: string
  position: string | null
  club: string | null
  age: number | null
  nationalities: string[]
  marketValue: number | null
}

interface SearchResponse {
  query: string
  pageNumber: number
  lastPageNumber: number
  results: {
    id: string
    name: string
    position?: string
    club?: { id: string; name: string }
    age?: number
    nationalities?: string[]
    marketValue?: number
  }[]
}

export interface SearchResult {
  players: TmPlayer[]
  page: number
  lastPage: number
}

export async function searchPlayers(
  query: string,
  page = 1,
  signal?: AbortSignal,
): Promise<SearchResult> {
  const url = `${BASE}/players/search/${encodeURIComponent(query)}?page_number=${page}`
  const res = await fetch(url, { signal, headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`Transfermarkt ${res.status}`)
  const data = (await res.json()) as SearchResponse
  return {
    page: data.pageNumber ?? page,
    lastPage: data.lastPageNumber ?? page,
    players: (data.results ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      position: r.position ?? null,
      club: r.club?.name ?? null,
      age: r.age ?? null,
      nationalities: r.nationalities ?? [],
      marketValue: r.marketValue ?? null,
    })),
  }
}

// Transfermarkt ignores the name slug and resolves the profile by id, so a
// throwaway slug is fine here.
export function profileUrl(p: TmPlayer): string {
  const slug = p.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'spieler'
  return `https://www.transfermarkt.com/${slug}/profil/spieler/${p.id}`
}

export function quickSearchUrl(query: string): string {
  return `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(query)}`
}

// --- Position grouping -----------------------------------------------------
// Transfermarkt returns inconsistent position labels (abbreviations like "RW",
// "GK", and full words like "Defender", "Midfield"). We normalise them into the
// four buckets a scout actually filters by.
export type PosGroup = 'gk' | 'def' | 'mid' | 'att'

export const POS_GROUPS: { key: PosGroup; label: string }[] = [
  { key: 'gk', label: 'שוער' },
  { key: 'def', label: 'הגנה' },
  { key: 'mid', label: 'קישור' },
  { key: 'att', label: 'התקפה' },
]

const POS_HE: Record<string, string> = {
  GK: 'שוער',
  CB: 'בלם',
  RB: 'מגן ימני',
  LB: 'מגן שמאלי',
  RWB: 'מגן ימני',
  LWB: 'מגן שמאלי',
  SW: 'ליברו',
  DM: 'קשר אחורי',
  CM: 'קשר מרכזי',
  AM: 'קשר התקפי',
  RM: 'כנף ימני',
  LM: 'כנף שמאלי',
  RW: 'כנף ימני',
  LW: 'כנף שמאלי',
  CF: 'חלוץ מרכזי',
  SS: 'חלוץ נסוג',
  ST: 'חלוץ',
}

const GROUP_OF: Record<string, PosGroup> = {
  GK: 'gk',
  CB: 'def', RB: 'def', LB: 'def', RWB: 'def', LWB: 'def', SW: 'def',
  DM: 'mid', CM: 'mid', AM: 'mid', RM: 'mid', LM: 'mid',
  RW: 'att', LW: 'att', CF: 'att', SS: 'att', ST: 'att',
}

export function posLabel(pos: string | null): string {
  if (!pos) return '—'
  const code = pos.trim().toUpperCase()
  if (POS_HE[code]) return POS_HE[code]
  // Full-word fallbacks Transfermarkt sometimes uses.
  if (code.includes('GOAL')) return 'שוער'
  if (code.includes('DEFEND') || code.includes('BACK')) return 'הגנה'
  if (code.includes('MID')) return 'קישור'
  if (code.includes('FORWARD') || code.includes('STRIK') || code.includes('WING')) return 'התקפה'
  return pos
}

export function posGroup(pos: string | null): PosGroup | null {
  if (!pos) return null
  const code = pos.trim().toUpperCase()
  if (GROUP_OF[code]) return GROUP_OF[code]
  if (code.includes('GOAL')) return 'gk'
  if (code.includes('DEFEND') || code.includes('BACK')) return 'def'
  if (code.includes('MID')) return 'mid'
  if (code.includes('FORWARD') || code.includes('STRIK') || code.includes('WING')) return 'att'
  return null
}

export function fmtMarketValue(v: number | null): string {
  if (!v) return '—'
  if (v >= 1_000_000) return '€' + (v / 1_000_000).toFixed(v % 1_000_000 ? 1 : 0) + 'M'
  if (v >= 1_000) return '€' + Math.round(v / 1_000) + 'K'
  return '€' + v
}

// --- Natural-language → Transfermarkt "most valuable players" deep link -----
// Transfermarkt's rich detailed search (max value, contract end, free agent) is
// POST-only and bot-protected, so it can't be deep-linked. The "marktwertetop"
// list IS GET-filterable by position group + age + nationality and is sorted by
// market value, so it's the reliable target we open.
const AUSRICHTUNG: Record<PosGroup, string> = {
  gk: 'Torwart',
  def: 'Abwehr',
  mid: 'Mittelfeld',
  att: 'Sturm',
}

export const AGE_CLASS_HE: Record<string, string> = {
  u18: 'עד גיל 18',
  u19: 'עד גיל 19',
  u20: 'עד גיל 20',
  u21: 'עד גיל 21',
  u23: 'עד גיל 23',
  '23-30': 'גילאי 23–30',
  o30: 'מעל גיל 30',
  o32: 'מעל גיל 32',
  o34: 'מעל גיל 34',
}

export function marketTopUrl(opts: { positionGroup?: PosGroup | null; ageClass?: string | null }): string {
  const params = new URLSearchParams({
    ausrichtung: opts.positionGroup ? AUSRICHTUNG[opts.positionGroup] : 'alle',
    spielerposition_id: 'alle',
    altersklasse: opts.ageClass || 'alle',
    land_id: '0',
    kontinent_id: '0',
    plus: '1',
  })
  return `https://www.transfermarkt.com/spieler-statistik/wertvollstespieler/marktwertetop?${params.toString()}`
}
