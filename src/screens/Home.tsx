import React from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { C, FONT, METAL } from '../theme'
import { fmtShort } from '../types'
import { useStore } from '../data/store'
import { useNav } from '../nav'
import { Avatar, Chip, Monogram, Txt } from '../components/ui'

export function Home() {
  const { players } = useStore()
  const nav = useNav()
  const insets = useSafeAreaInsets()

  const signed = players.filter((p) => p.signed)
  const free = players.filter((p) => !p.signed)
  const expSoon = players.filter((p) => p.expSoon)
  const totalValue = players.reduce((a, p) => a + p.fee, 0)
  const avgAge = players.length
    ? Math.round(players.reduce((a, p) => a + p.age, 0) / players.length)
    : 0

  const Stat = ({ label, value, sub, color }: { label: string; value: React.ReactNode; sub?: string; color?: string }) => (
    <View style={{ flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 18, padding: 14 }}>
      <Txt weight="extra" style={{ fontSize: 26, color: C.t1 }}>{value}</Txt>
      <Txt weight="med" style={{ fontSize: 12.5, color: C.t2, marginTop: 6 }}>{label}</Txt>
      {sub ? <Txt weight="semi" style={{ fontSize: 11, color: color ?? C.t3, marginTop: 3 }}>{sub}</Txt> : null}
    </View>
  )

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingTop: insets.top + 8, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
          <Monogram size={46} />
          <View>
            <Txt weight="semi" style={{ fontSize: 11, color: C.t3, letterSpacing: 0.5 }}>שלום זיו</Txt>
            <Txt style={{ fontFamily: FONT.brandBold, fontSize: 15, letterSpacing: 0.5, color: C.t1 }}>ZIV SOLOMOVICH</Txt>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => nav.showToast('אין התראות חדשות')}
          style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="bell" size={20} color={C.t1} />
        </TouchableOpacity>
      </View>

      {/* hero value card */}
      <LinearGradient
        colors={['#202127', '#0e0f12']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ borderRadius: 24, padding: 20, marginBottom: 18, borderWidth: 1, borderColor: C.line2 }}
      >
        <Txt weight="semi" style={{ fontSize: 12, color: C.t2, marginBottom: 6 }}>שווי תיק שחקנים מוערך</Txt>
        <Txt weight="extra" style={{ fontSize: 34, color: '#dfe2e8', letterSpacing: -0.5 }}>{fmtShort(totalValue)}</Txt>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          <Chip text={players.length + ' שחקנים'} color="#c9ccd4" />
          <Chip text={signed.length + ' חתומים'} color={C.green} />
        </View>
      </LinearGradient>

      {/* stat grid */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <Stat label="חתומים בקבוצות" value={signed.length} sub="פעילים" color={C.green} />
        <Stat label="חופשיים" value={free.length} sub="זמינים להעברה" color={C.amber} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <Stat label="חוזים שפגים" value={expSoon.length} sub="דורש טיפול" color={C.red} />
        <Stat label="ממוצע גיל" value={avgAge || '—'} sub="הסגל" color={C.t3} />
      </View>

      {/* contract alerts */}
      {expSoon.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
            <Txt weight="bold" style={{ fontSize: 15 }}>חוזים לחידוש</Txt>
            <Chip text="דורש טיפול" color={C.red} />
          </View>
          {expSoon.slice(0, 4).map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => nav.openProfile(p.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 11, marginBottom: 8 }}
            >
              <Avatar name={p.name} size={40} uri={p.photos[0]} />
              <View style={{ flex: 1 }}>
                <Txt weight="semi" style={{ fontSize: 14 }}>{p.name}</Txt>
                <Txt style={{ fontSize: 12, color: C.t3 }}>{p.team || 'חופשי'}</Txt>
              </View>
              <View style={{ alignItems: 'flex-start' }}>
                <Txt weight="bold" style={{ fontSize: 12.5, color: C.red }}>פג {p.contractEnd}</Txt>
                <Txt style={{ fontSize: 11, color: C.t3 }}>סיום חוזה</Txt>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* empty state */}
      {players.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 30, marginBottom: 8 }}>
          <Txt weight="bold" style={{ fontSize: 16, color: C.t2, textAlign: 'center' }}>אין עדיין שחקנים בסגל</Txt>
          <Txt style={{ fontSize: 13, color: C.t3, marginTop: 6, textAlign: 'center' }}>
            עברו ללשונית "שחקנים" והוסיפו שחקן ראשון עם כפתור ה־+
          </Txt>
        </View>
      )}

      {/* quick action */}
      <TouchableOpacity
        onPress={() => nav.go('studio')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#26272d', '#15161a']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: C.line2, borderRadius: 18, padding: 15 }}
        >
          <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="auto-fix" size={22} color="#1a1b1f" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Txt weight="bold" style={{ fontSize: 14.5 }}>סטודיו תוכן</Txt>
            <Txt style={{ fontSize: 12, color: C.t2, marginTop: 1 }}>הכנת פוסט החתמה, גול או ברכה</Txt>
          </View>
          <Feather name="chevron-left" size={20} color={C.t3} />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  )
}
