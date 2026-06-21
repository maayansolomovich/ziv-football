import React, { useState } from 'react'
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { C, FONT, METAL } from '../theme'
import { useStore } from '../data/store'
import { useNav } from '../nav'
import { Avatar, Txt } from '../components/ui'

export function Players() {
  const { players } = useStore()
  const nav = useNav()
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'signed' | 'free'>('all')

  const q = query.trim()
  let list = players.filter(
    (p) => !q || p.name.includes(q) || (p.team && p.team.includes(q)) || p.pos.includes(q),
  )
  if (filter === 'signed') list = list.filter((p) => p.signed)
  if (filter === 'free') list = list.filter((p) => !p.signed)

  const Filt = ({ k, label, count }: { k: typeof filter; label: string; count: number }) => {
    const active = filter === k
    const body = (
      <Txt weight="semi" style={{ fontSize: 13, color: active ? '#15161a' : C.t2 }}>
        {label} · {count}
      </Txt>
    )
    return (
      <TouchableOpacity onPress={() => setFilter(k)} activeOpacity={0.8}>
        {active ? (
          <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ paddingVertical: 8, paddingHorizontal: 15, borderRadius: 999 }}>
            {body}
          </LinearGradient>
        ) : (
          <View style={{ paddingVertical: 8, paddingHorizontal: 15, borderRadius: 999, backgroundColor: C.card, borderWidth: 1, borderColor: C.line }}>{body}</View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
          <View>
            <Txt weight="semi" style={{ fontSize: 12, color: C.t3 }}>הסגל שלי</Txt>
            <Txt weight="extra" style={{ fontSize: 26, letterSpacing: -0.5 }}>שחקנים</Txt>
          </View>
          <TouchableOpacity onPress={() => nav.openEditor(null)} activeOpacity={0.85}>
            <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 13 }}>
              <Feather name="plus" size={18} color="#15161a" />
              <Txt weight="bold" style={{ fontSize: 13.5, color: '#15161a' }}>הוסף</Txt>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 13, height: 44, marginBottom: 11 }}>
          <Feather name="search" size={18} color={C.t3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="חיפוש שם, קבוצה או תפקיד"
            placeholderTextColor={C.t3}
            style={{ flex: 1, color: C.t1, fontSize: 14.5, fontFamily: FONT.reg, textAlign: 'right' }}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Filt k="all" label="הכל" count={players.length} />
          <Filt k="signed" label="חתומים" count={players.filter((p) => p.signed).length} />
          <Filt k="free" label="חופשיים" count={players.filter((p) => !p.signed).length} />
        </ScrollView>
      </View>

      <View style={{ paddingHorizontal: 14, paddingTop: 12 }}>
        {list.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => nav.openProfile(p.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 10, marginBottom: 9 }}
          >
            <Avatar name={p.name} size={48} ring={p.signed} uri={p.photos[0]} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <Txt weight="semi" style={{ fontSize: 15, flex: 1 }}>{p.name}</Txt>
                {p.tmUrl?.trim() ? <Feather name="link" size={13} color={C.green} /> : null}
                {p.expSoon ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.red }} /> : null}
              </View>
              <Txt style={{ fontSize: 12.5, color: C.t3, marginTop: 2 }} numberOfLines={1}>
                {p.pos} · {p.team || 'חופשי'}
              </Txt>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <View style={{ alignItems: 'flex-start' }}>
                <Txt weight="extra" style={{ fontSize: 14 }}>#{p.shirt || '—'}</Txt>
                <Txt style={{ fontSize: 10.5, color: C.t3 }}>חולצה</Txt>
              </View>
              <Feather name="chevron-left" size={18} color={C.t3} />
            </View>
          </TouchableOpacity>
        ))}
        {list.length === 0 && (
          <Txt style={{ textAlign: 'center', color: C.t3, paddingVertical: 50, fontSize: 14 }}>
            {players.length === 0 ? 'אין עדיין שחקנים — הוסיפו עם כפתור ה־+' : 'לא נמצאו שחקנים'}
          </Txt>
        )}
      </View>
    </ScrollView>
  )
}
