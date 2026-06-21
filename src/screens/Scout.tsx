import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { C, FONT, METAL } from '../theme'
import { useNav } from '../nav'
import { Avatar, Txt } from '../components/ui'
import {
  AGE_CLASS_HE,
  fmtMarketValue,
  marketTopUrl,
  POS_GROUPS,
  posGroup,
  posLabel,
  profileUrl,
  quickSearchUrl,
  searchPlayers,
  type PosGroup,
  type TmPlayer,
} from '../lib/transfermarkt'
import { hasOpenAiKey, parseScoutQuery, type ScoutFilters } from '../lib/openai'
import { ageFromDob, queryTmPlayers, type TmDbPlayer } from '../lib/tmDb'

export function Scout() {
  const nav = useNav()
  const insets = useSafeAreaInsets()
  const [mode, setMode] = useState<'name' | 'smart'>('name')
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState<PosGroup | null>(null)
  const [players, setPlayers] = useState<TmPlayer[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Smart (natural-language) search state.
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ScoutFilters | null>(null)
  const [results, setResults] = useState<TmDbPlayer[] | null>(null)
  const aiAbort = useRef<AbortController | null>(null)

  const runAi = useCallback(async (text: string) => {
    aiAbort.current?.abort()
    const ctrl = new AbortController()
    aiAbort.current = ctrl
    setAiLoading(true)
    setAiError(null)
    setFilters(null)
    setResults(null)
    try {
      const f = await parseScoutQuery(text, ctrl.signal)
      if (ctrl.signal.aborted) return
      setFilters(f)
      const rows = await queryTmPlayers(f)
      if (ctrl.signal.aborted) return
      setResults(rows)
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      const msg = (e as Error).message
      setAiError(
        msg === 'NO_KEY' || msg === 'BAD_KEY'
          ? 'מפתח ה-OpenAI חסר או שגוי. הוסיפו EXPO_PUBLIC_OPENAI_API_KEY לקובץ ‎.env.local'
          : msg?.includes('tm_players') || msg?.includes('relation')
            ? 'מאגר השחקנים עדיין לא נטען. הריצו את סקריפט הייבוא (scripts/import_tm_players.py).'
            : 'לא הצלחנו לבצע את החיפוש. נסו לנסח מחדש.',
      )
    } finally {
      setAiLoading(false)
    }
  }, [])

  const run = useCallback(async (q: string, nextPage: number) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    if (nextPage === 1) setLoading(true)
    else setLoadingMore(true)
    setError(null)
    try {
      const res = await searchPlayers(q, nextPage, ctrl.signal)
      setLastPage(res.lastPage)
      setPage(res.page)
      setPlayers((prev) => (nextPage === 1 ? res.players : [...prev, ...res.players]))
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      setError('לא הצלחנו להתחבר ל-Transfermarkt. נסו שוב.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Debounce the live search so we don't hammer the rate-limited API on every keystroke.
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      abortRef.current?.abort()
      setPlayers([])
      setError(null)
      setLoading(false)
      return
    }
    const t = setTimeout(() => run(q, 1), 450)
    return () => clearTimeout(t)
  }, [query, run])

  const filtered = useMemo(
    () => (pos ? players.filter((p) => posGroup(p.position) === pos) : players),
    [players, pos],
  )

  const q = query.trim()
  const canLoadMore = page < lastPage && q.length >= 2

  const PosChip = ({ k, label }: { k: PosGroup | null; label: string }) => {
    const active = pos === k
    const body = (
      <Txt weight="semi" style={{ fontSize: 13, color: active ? '#15161a' : C.t2 }}>{label}</Txt>
    )
    return (
      <TouchableOpacity onPress={() => setPos(k)} activeOpacity={0.8}>
        {active ? (
          <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={chipStyle}>
            {body}
          </LinearGradient>
        ) : (
          <View style={[chipStyle, { backgroundColor: C.card, borderWidth: 1, borderColor: C.line }]}>{body}</View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 18 }}>
        <View style={{ marginBottom: 14 }}>
          <Txt weight="semi" style={{ fontSize: 12, color: C.t3, textAlign: 'right' }}>מאגר Transfermarkt</Txt>
          <Txt weight="extra" style={{ fontSize: 26, letterSpacing: -0.5, textAlign: 'right' }}>חיפוש שחקן</Txt>
        </View>

        {/* mode switch */}
        <View style={{ flexDirection: 'row', backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 4, marginBottom: 12 }}>
          <ModeTab active={mode === 'name'} label="לפי שם" onPress={() => setMode('name')} />
          <ModeTab active={mode === 'smart'} label="חיפוש חכם" onPress={() => setMode('smart')} />
        </View>

        {mode === 'name' ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 13, height: 44, marginBottom: 11 }}>
              <Feather name="search" size={18} color={C.t3} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="שם השחקן (באנגלית)"
                placeholderTextColor={C.t3}
                autoCorrect={false}
                style={{ flex: 1, color: C.t1, fontSize: 14.5, fontFamily: FONT.reg, textAlign: 'right' }}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Feather name="x" size={18} color={C.t3} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <PosChip k={null} label="הכל" />
              {POS_GROUPS.map((g) => (
                <PosChip key={g.key} k={g.key} label={g.label} />
              ))}
            </ScrollView>
          </>
        ) : (
          <SmartPanel
            aiText={aiText}
            setAiText={setAiText}
            onSearch={() => aiText.trim().length >= 3 && runAi(aiText.trim())}
            loading={aiLoading}
            error={aiError}
            filters={filters}
            results={results}
          />
        )}
      </View>

      {mode === 'name' && (
      <View style={{ paddingHorizontal: 14, paddingTop: 14 }}>
        {loading && (
          <View style={{ paddingVertical: 50, alignItems: 'center' }}>
            <ActivityIndicator color={C.green} />
          </View>
        )}

        {!loading && error && (
          <View style={{ paddingVertical: 44, alignItems: 'center', gap: 12 }}>
            <Feather name="wifi-off" size={26} color={C.t3} />
            <Txt style={{ textAlign: 'center', color: C.t3, fontSize: 14 }}>{error}</Txt>
            <TouchableOpacity onPress={() => run(q, 1)} style={{ paddingVertical: 9, paddingHorizontal: 18, borderRadius: 999, backgroundColor: C.card, borderWidth: 1, borderColor: C.line2 }}>
              <Txt weight="semi" style={{ fontSize: 13, color: C.t1 }}>נסה שוב</Txt>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && q.length < 2 && (
          <View style={{ paddingVertical: 60, alignItems: 'center', gap: 10 }}>
            <Feather name="globe" size={30} color={C.t3} />
            <Txt style={{ textAlign: 'center', color: C.t3, fontSize: 14, paddingHorizontal: 30 }}>
              הקלידו שם שחקן וסננו לפי תפקיד כדי לחפש במאגר Transfermarkt
            </Txt>
          </View>
        )}

        {!loading && !error && q.length >= 2 && filtered.length === 0 && (
          <Txt style={{ textAlign: 'center', color: C.t3, paddingVertical: 50, fontSize: 14 }}>
            {players.length === 0
              ? 'לא נמצאו שחקנים בשם זה'
              : canLoadMore
                ? 'אין שחקנים בתפקיד זה בדף הנוכחי — טענו עוד תוצאות'
                : 'אין שחקנים בתפקיד שנבחר — נסו תפקיד אחר'}
          </Txt>
        )}

        {filtered.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => Linking.openURL(profileUrl(p))}
            activeOpacity={0.85}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 10, marginBottom: 9 }}
          >
            <Avatar name={p.name} size={48} />
            <View style={{ flex: 1 }}>
              <Txt weight="semi" style={{ fontSize: 15, textAlign: 'right' }} numberOfLines={1}>{p.name}</Txt>
              <Txt style={{ fontSize: 12.5, color: C.t3, marginTop: 2, textAlign: 'right' }} numberOfLines={1}>
                {posLabel(p.position)} · {p.club || 'ללא קבוצה'}{p.age ? ' · ' + p.age : ''}
              </Txt>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <View style={{ alignItems: 'flex-start' }}>
                <Txt weight="extra" style={{ fontSize: 13.5, color: C.green }}>{fmtMarketValue(p.marketValue)}</Txt>
                <Txt style={{ fontSize: 10.5, color: C.t3 }}>שווי</Txt>
              </View>
              <Feather name="external-link" size={16} color={C.t3} />
            </View>
          </TouchableOpacity>
        ))}

        {canLoadMore && (
          <TouchableOpacity
            onPress={() => run(q, page + 1)}
            disabled={loadingMore}
            style={{ marginTop: 4, marginBottom: 6, padding: 13, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center' }}
          >
            {loadingMore ? <ActivityIndicator color={C.t2} /> : <Txt weight="semi" style={{ fontSize: 13.5, color: C.t2 }}>טען עוד תוצאות</Txt>}
          </TouchableOpacity>
        )}

        {q.length >= 2 && !loading && (
          <TouchableOpacity
            onPress={() => Linking.openURL(quickSearchUrl(q))}
            style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 15, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.line2 }}
          >
            <Text style={{ fontFamily: FONT.brand, fontSize: 13.5, letterSpacing: 0.6, color: C.green }}>TRANSFERMARKT</Text>
            <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: C.t2 }}>↗</Text>
          </TouchableOpacity>
        )}
      </View>
      )}
    </ScrollView>
  )
}

const chipStyle = { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 999 } as const

function ModeTab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ flex: 1 }}>
      {active ? (
        <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ paddingVertical: 9, borderRadius: 11, alignItems: 'center' }}>
          <Txt weight="bold" style={{ fontSize: 13.5, color: '#15161a' }}>{label}</Txt>
        </LinearGradient>
      ) : (
        <View style={{ paddingVertical: 9, borderRadius: 11, alignItems: 'center' }}>
          <Txt weight="semi" style={{ fontSize: 13.5, color: C.t2 }}>{label}</Txt>
        </View>
      )}
    </TouchableOpacity>
  )
}

function FilterChip({ text }: { text: string }) {
  return (
    <View style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: C.card2, borderWidth: 1, borderColor: C.line }}>
      <Text style={{ fontFamily: FONT.semi, fontSize: 12.5, color: C.t1, textAlign: 'right' }}>{text}</Text>
    </View>
  )
}

// Module-level so the text input keeps focus across the parent's re-renders.
function SmartPanel({
  aiText,
  setAiText,
  onSearch,
  loading,
  error,
  filters,
}: {
  aiText: string
  setAiText: (s: string) => void
  onSearch: () => void
  loading: boolean
  error: string | null
  filters: ScoutFilters | null
}) {
  const posHe: Record<string, string> = { gk: 'שוער', def: 'הגנה', mid: 'קישור', att: 'התקפה' }
  const chips: string[] = []
  if (filters) {
    if (filters.positionGroup) chips.push('תפקיד: ' + posHe[filters.positionGroup])
    if (filters.ageClass) chips.push(AGE_CLASS_HE[filters.ageClass] ?? filters.ageClass)
    if (filters.maxValueEur) chips.push('עד ' + fmtMarketValue(filters.maxValueEur))
    if (filters.minValueEur) chips.push('מ-' + fmtMarketValue(filters.minValueEur))
    if (filters.freeAgent) chips.push('חופשי / ללא קבוצה')
    if (filters.contractUntilYear) chips.push('חוזה עד ' + filters.contractUntilYear)
    if (filters.playerName) chips.push('שם: ' + filters.playerName)
  }
  // These two can't be applied automatically on the Transfermarkt list page.
  const softFilters = !!(filters && (filters.maxValueEur || filters.minValueEur || filters.freeAgent || filters.contractUntilYear))

  return (
    <View>
      {!hasOpenAiKey && (
        <View style={{ marginBottom: 11, padding: 11, borderRadius: 12, backgroundColor: C.amber + '1f', borderWidth: 1, borderColor: C.amber + '40' }}>
          <Txt style={{ fontSize: 12.5, color: C.amber, textAlign: 'right' }}>
            כדי להשתמש בחיפוש החכם הוסיפו EXPO_PUBLIC_OPENAI_API_KEY לקובץ ‎.env.local
          </Txt>
        </View>
      )}

      <View style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 12, marginBottom: 11 }}>
        <TextInput
          value={aiText}
          onChangeText={setAiText}
          placeholder="למשל: שוער עד מיליון אירו עם חוזה שנגמר ב-2026"
          placeholderTextColor={C.t3}
          multiline
          style={{ color: C.t1, fontSize: 14.5, fontFamily: FONT.reg, textAlign: 'right', minHeight: 48, textAlignVertical: 'top' }}
        />
        <TouchableOpacity onPress={onSearch} disabled={loading || aiText.trim().length < 3} activeOpacity={0.85} style={{ marginTop: 8, opacity: loading || aiText.trim().length < 3 ? 0.5 : 1 }}>
          <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, borderRadius: 12 }}>
            {loading ? (
              <ActivityIndicator color="#15161a" />
            ) : (
              <>
                <Feather name="zap" size={16} color="#15161a" />
                <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: '#15161a' }}>חפש</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {error && (
        <Txt style={{ fontSize: 13, color: C.red, textAlign: 'right', marginBottom: 10 }}>{error}</Txt>
      )}

      {filters && (
        <View style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 14 }}>
          <Txt weight="bold" style={{ fontSize: 14, textAlign: 'right', marginBottom: 4 }}>הבנתי שאתה מחפש</Txt>
          <Txt style={{ fontSize: 13, color: C.t2, textAlign: 'right', marginBottom: 11 }}>{filters.summary}</Txt>

          <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 7 }}>
            {chips.length ? chips.map((c, i) => <FilterChip key={i} text={c} />) : <FilterChip text="ללא פילטרים — כל השחקנים" />}
          </View>

          <TouchableOpacity
            onPress={() => Linking.openURL(marketTopUrl({ positionGroup: filters.positionGroup, ageClass: filters.ageClass }))}
            activeOpacity={0.85}
            style={{ marginTop: 14 }}
          >
            <LinearGradient colors={['#26272d', '#15161a']} start={{ x: 0.2, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: C.line2 }}>
              <Text style={{ fontFamily: FONT.brand, fontSize: 13, letterSpacing: 0.6, color: C.green }}>TRANSFERMARKT</Text>
              <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: C.t1 }}>פתח רשימה ↗</Text>
            </LinearGradient>
          </TouchableOpacity>

          {softFilters && (
            <Txt style={{ fontSize: 11.5, color: C.t3, textAlign: 'right', marginTop: 10, lineHeight: 17 }}>
              הערה: שווי שוק וחוזה לא ניתנים לסינון אוטומטי בעמוד הזה. הרשימה ממוינת לפי שווי (היקרים למעלה) — גללו למטה לשחקנים הזולים יותר.
            </Txt>
          )}
        </View>
      )}
    </View>
  )
}
