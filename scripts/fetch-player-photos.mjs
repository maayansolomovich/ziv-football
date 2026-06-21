// One-off: find an official portrait for each player on Transfermarkt and
// upload it into Supabase (photos[0]). Run: node scripts/fetch-player-photos.mjs
// Reads Supabase creds from .env.local. Uses the anon key (RLS allows writes).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// --- env -------------------------------------------------------------------
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)
const SUPABASE_URL = env.EXPO_PUBLIC_SUPABASE_URL
const ANON = env.EXPO_PUBLIC_SUPABASE_ANON_KEY
const TABLE = 'ziv_players'
const TM_API = 'https://transfermarkt-api.fly.dev'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const norm = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\u0590-\u05ff ]/g, '')
    .trim()

async function getJson(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': UA } })
      if (res.status === 429 || res.status >= 500) throw new Error('retry ' + res.status)
      if (!res.ok) return null
      return await res.json()
    } catch (e) {
      if (i === tries - 1) return null
      await sleep(2500 * (i + 1))
    }
  }
  return null
}

// Search TM; pick the best match (Israel nationality + club hint).
async function findTmId(query, teamHint) {
  const data = await getJson(`${TM_API}/players/search/${encodeURIComponent(query)}`)
  const results = data?.results ?? []
  if (!results.length) return null
  const hint = norm(teamHint)
  const scored = results.map((r) => {
    let s = 0
    if ((r.nationalities ?? []).includes('Israel')) s += 2
    const club = norm(r.club?.name)
    if (hint && club && (club.includes(hint) || hint.includes(club))) s += 3
    if (r.marketValue) s += 0.5
    return { r, s }
  })
  scored.sort((a, b) => b.s - a.s)
  return scored[0].r.id
}

// Pull the real portrait URL from the player page (og:image meta tag).
async function findPortrait(tmId) {
  for (const host of ['www.transfermarkt.com', 'www.transfermarkt.us']) {
    try {
      const res = await fetch(`https://${host}/x/profil/spieler/${tmId}`, {
        headers: { 'user-agent': UA, 'accept-language': 'en' },
      })
      if (!res.ok) continue
      const html = await res.text()
      const m =
        html.match(/<meta property="og:image" content="([^"]+)"/i) ||
        html.match(/https:\/\/img\.a\.transfermarkt\.technology\/portrait\/[^"'\s]+/i)
      const url = m?.[1] || m?.[0]
      if (url && !/default\.jpg/i.test(url)) return url.replace('/portrait/medium/', '/portrait/header/')
    } catch {
      /* next host */
    }
  }
  return null
}

async function uploadPhoto(id, url) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      apikey: ANON,
      authorization: `Bearer ${ANON}`,
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify({ photos: [url] }),
  })
  if (!res.ok) throw new Error(`supabase ${res.status}: ${await res.text()}`)
}

async function main() {
  // Live player list from Supabase.
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${TABLE}?select=id,name,team,signed,photos&order=signed.desc`,
    { headers: { apikey: ANON, authorization: `Bearer ${ANON}` } },
  )
  const rows = await res.json()
  console.log(`Loaded ${rows.length} players from Supabase\n`)

  const found = []
  const missed = []

  for (const p of rows) {
    const query = p.id.replace(/-/g, ' ')
    process.stdout.write(`• ${p.name} (${query})… `)
    const tmId = await findTmId(query, p.team)
    if (!tmId) {
      console.log('no TM match')
      missed.push({ name: p.name, reason: 'no TM match' })
      await sleep(1200)
      continue
    }
    const portrait = await findPortrait(tmId)
    if (!portrait) {
      console.log(`TM#${tmId} but no portrait`)
      missed.push({ name: p.name, reason: `TM#${tmId} no portrait` })
      await sleep(1200)
      continue
    }
    try {
      await uploadPhoto(p.id, portrait)
      console.log(`OK → ${portrait}`)
      found.push({ name: p.name, url: portrait })
    } catch (e) {
      console.log(`upload failed: ${e.message}`)
      missed.push({ name: p.name, reason: 'upload failed' })
    }
    await sleep(1300)
  }

  console.log(`\n==== DONE ====`)
  console.log(`Found & uploaded: ${found.length}`)
  console.log(`Missed: ${missed.length}`)
  console.log('\nMISSED:')
  missed.forEach((m) => console.log(`  - ${m.name} (${m.reason})`))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
