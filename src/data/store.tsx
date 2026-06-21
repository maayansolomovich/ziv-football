import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PLAYERS_TABLE, supabase } from '../lib/supabase'
import type { Player } from '../types'

const CACHE_KEY = 'ziv.players.cache.v1'

// DB rows are snake_case; the app uses camelCase. Map both ways here so the
// rest of the app never sees the database shape.
type Row = {
  id: string
  name: string
  pos: string
  team: string
  prev_team: string | null
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
  contract_start_full: string | null
  contract_end: string | null
  contract_file: string | null
  exp_soon: boolean
  phone: string
  ig: string
  email: string
  photos: string[] | null
  created_at?: string
}

const toPlayer = (r: Row): Player => ({
  id: r.id,
  name: r.name,
  pos: r.pos,
  team: r.team ?? '',
  prevTeam: r.prev_team,
  signed: !!r.signed,
  shirt: r.shirt ?? 0,
  age: r.age ?? 0,
  dob: r.dob ?? '—',
  height: r.height ?? 0,
  weight: r.weight ?? 0,
  foot: r.foot ?? 'ימין',
  goals: r.goals ?? 0,
  assists: r.assists ?? 0,
  apps: r.apps ?? 0,
  salary: r.salary ?? 0,
  fee: r.fee ?? 0,
  contractStartFull: r.contract_start_full,
  contractEnd: r.contract_end,
  contractFile: r.contract_file,
  expSoon: !!r.exp_soon,
  phone: r.phone ?? '—',
  ig: r.ig ?? '',
  email: r.email ?? '',
  photos: Array.isArray(r.photos) ? r.photos : [],
})

const toRow = (p: Player): Row => ({
  id: p.id,
  name: p.name,
  pos: p.pos,
  team: p.team,
  prev_team: p.prevTeam,
  signed: p.signed,
  shirt: p.shirt,
  age: p.age,
  dob: p.dob,
  height: p.height,
  weight: p.weight,
  foot: p.foot,
  goals: p.goals,
  assists: p.assists,
  apps: p.apps,
  salary: p.salary,
  fee: p.fee,
  contract_start_full: p.contractStartFull,
  contract_end: p.contractEnd,
  contract_file: p.contractFile,
  exp_soon: p.expSoon,
  phone: p.phone,
  ig: p.ig,
  email: p.email,
  photos: p.photos,
})

interface StoreValue {
  players: Player[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  getById: (id: string) => Player | undefined
  addPlayer: (data: Omit<Player, 'id'>) => Player
  updatePlayer: (id: string, data: Partial<Player>) => void
  removePlayer: (id: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const playersRef = useRef<Player[]>([])

  const setAndCache = useCallback((next: Player[]) => {
    playersRef.current = next
    setPlayers(next)
    void AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next))
  }, [])

  const refresh = useCallback(async () => {
    const { data, error: err } = await supabase
      .from(PLAYERS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
      // Fall back to the last cached snapshot so the app still works offline.
      const cached = await AsyncStorage.getItem(CACHE_KEY)
      if (cached) {
        try {
          setPlayers(JSON.parse(cached))
        } catch {
          /* ignore */
        }
      }
      return
    }
    setError(null)
    setAndCache((data as Row[]).map(toPlayer))
  }, [setAndCache])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
    const channel = supabase
      .channel('ziv_players_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: PLAYERS_TABLE }, () => {
        void refresh()
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refresh])

  const getById = useCallback((id: string) => playersRef.current.find((p) => p.id === id), [])

  // Mutations update local state immediately (optimistic) and sync to Supabase
  // in the background; realtime keeps the other device in step.
  const addPlayer = useCallback(
    (data: Omit<Player, 'id'>) => {
      const player: Player = { id: 'p' + Date.now(), ...data }
      setAndCache([player, ...playersRef.current])
      supabase
        .from(PLAYERS_TABLE)
        .insert(toRow(player))
        .then(({ error: err }) => err && setError(err.message))
      return player
    },
    [setAndCache],
  )

  const updatePlayer = useCallback(
    (id: string, data: Partial<Player>) => {
      const next = playersRef.current.map((p) => (p.id === id ? { ...p, ...data } : p))
      setAndCache(next)
      const updated = next.find((p) => p.id === id)
      if (updated) {
        supabase
          .from(PLAYERS_TABLE)
          .update(toRow(updated))
          .eq('id', id)
          .then(({ error: err }) => err && setError(err.message))
      }
    },
    [setAndCache],
  )

  const removePlayer = useCallback(
    (id: string) => {
      setAndCache(playersRef.current.filter((p) => p.id !== id))
      supabase
        .from(PLAYERS_TABLE)
        .delete()
        .eq('id', id)
        .then(({ error: err }) => err && setError(err.message))
    },
    [setAndCache],
  )

  const value = useMemo(
    () => ({ players, loading, error, refresh, getById, addPlayer, updatePlayer, removePlayer }),
    [players, loading, error, refresh, getById, addPlayer, updatePlayer, removePlayer],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
