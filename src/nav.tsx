import React, { createContext, useCallback, useContext, useRef, useState } from 'react'

export type Tab = 'home' | 'players' | 'scout' | 'studio'
export type View = Tab | 'profile' | 'editor'

interface NavState {
  view: View
  tab: Tab
  selectedId: string | null
  editId: string | null
  gallery: number
}

interface NavValue extends NavState {
  toast: string | null
  go: (tab: Tab) => void
  openProfile: (id: string) => void
  openEditor: (id: string | null) => void
  setGallery: (i: number) => void
  back: (to: View, opts?: { id?: string }) => void
  showToast: (msg: string) => void
}

const NavContext = createContext<NavValue | null>(null)

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NavState>({
    view: 'home',
    tab: 'home',
    selectedId: null,
    editId: null,
    gallery: 0,
  })
  const [toast, setToast] = useState<string | null>(null)
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null)

  const go = (tab: Tab) => setState((s) => ({ ...s, view: tab, tab }))
  const openProfile = (id: string) =>
    setState((s) => ({ ...s, view: 'profile', selectedId: id, gallery: 0 }))
  const openEditor = (id: string | null) =>
    setState((s) => ({ ...s, view: 'editor', editId: id }))
  const setGallery = (i: number) => setState((s) => ({ ...s, gallery: i }))
  const back = (to: View, opts?: { id?: string }) =>
    setState((s) => ({
      ...s,
      view: to,
      tab: to === 'profile' || to === 'editor' ? s.tab : (to as Tab),
      ...(opts?.id ? { selectedId: opts.id } : {}),
    }))

  const showToast = (msg: string) => {
    if (toastT.current) clearTimeout(toastT.current)
    setToast(msg)
    toastT.current = setTimeout(() => setToast(null), 2600)
  }

  return (
    <NavContext.Provider
      value={{ ...state, toast, go, openProfile, openEditor, setGallery, back, showToast }}
    >
      {children}
    </NavContext.Provider>
  )
}

export function useNav(): NavValue {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used within NavProvider')
  return ctx
}
