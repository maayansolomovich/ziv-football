export interface Player {
  id: string
  name: string
  pos: string
  team: string
  prevTeam: string | null
  signed: boolean
  shirt: number
  age: number
  dob: string
  height: number
  weight: number
  foot: string
  goals: number
  assists: number
  apps: number
  salary: number
  fee: number
  contractStartFull: string | null
  contractEnd: string | null
  contractFile: string | null
  expSoon: boolean
  phone: string
  ig: string
  email: string
  tmUrl: string
  photos: string[]
}

export const POSITIONS = [
  'שוער',
  'בלם',
  'מגן ימני',
  'מגן שמאלי',
  'קשר אחורי',
  'קשר מרכזי',
  'קשר התקפי',
  'כנף ימני',
  'כנף שמאלי',
  'חלוץ מרכזי',
]

export const FEET = ['ימין', 'שמאל', 'שתיים']

export function emptyPlayer(): Omit<Player, 'id'> {
  return {
    name: '',
    pos: 'קשר מרכזי',
    team: '',
    prevTeam: null,
    signed: false,
    shirt: 0,
    age: 0,
    dob: '—',
    height: 0,
    weight: 0,
    foot: 'ימין',
    goals: 0,
    assists: 0,
    apps: 0,
    salary: 0,
    fee: 0,
    contractStartFull: null,
    contractEnd: null,
    contractFile: null,
    expSoon: false,
    phone: '—',
    ig: '',
    email: '',
    tmUrl: '',
    photos: [],
  }
}

export const fmt = (n: number) => '₪' + Number(n || 0).toLocaleString('en-US')
export const fmtShort = (n: number) => {
  if (n >= 1000000) return '₪' + (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + 'M'
  if (n >= 1000) return '₪' + (n / 1000).toFixed(0) + 'K'
  return '₪' + (n || 0)
}

export const initials = (name: string) => {
  const parts = name.trim().split(/\s+/)
  return ((parts[0] || '')[0] || '') + ((parts[1] || '')[0] || '')
}

export const yearOf = (d: string | null): number => {
  if (!d) return 0
  const n = parseInt(String(d).slice(-4), 10)
  return Number.isFinite(n) ? n : 0
}
