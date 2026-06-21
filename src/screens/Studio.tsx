import React from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { C, FONT, METAL } from '../theme'
import { Monogram, Txt } from '../components/ui'

const TEMPLATES = ['החתמה', 'חוזה חדש', 'גול', 'ניצחון', 'יום הולדת']

export function Studio() {
  const insets = useSafeAreaInsets()
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Txt weight="semi" style={{ fontSize: 12, color: C.t3 }}>יצירת תוכן</Txt>
          <Txt weight="extra" style={{ fontSize: 26, letterSpacing: -0.5 }}>סטודיו</Txt>
        </View>
        <Monogram size={40} />
      </View>

      <View style={{ paddingHorizontal: 18, paddingTop: 30, alignItems: 'center' }}>
        <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ width: 78, height: 78, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="auto-fix" size={38} color="#15161a" />
        </LinearGradient>

        <View style={{ marginTop: 18, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: C.line2, backgroundColor: C.card }}>
          <Txt style={{ fontFamily: FONT.brandBold, fontSize: 12, letterSpacing: 1.5, color: '#dfe2e8' }}>COMING SOON</Txt>
        </View>

        <Txt weight="extra" style={{ fontSize: 22, marginTop: 16, textAlign: 'center' }}>מחולל הפוסטים בדרך</Txt>
        <Txt style={{ fontSize: 14, color: C.t2, marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
          בקרוב תוכלו ליצור פוסטים מעוצבים לרשתות החברתיות ישירות מהאפליקציה — החתמה, חוזה, גול, ניצחון ויום הולדת — ולשתף בלחיצה.
        </Txt>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 22 }}>
          {TEMPLATES.map((t) => (
            <View key={t} style={{ paddingVertical: 8, paddingHorizontal: 15, borderRadius: 999, backgroundColor: C.card, borderWidth: 1, borderColor: C.line }}>
              <Txt weight="semi" style={{ fontSize: 13, color: C.t3 }}>{t}</Txt>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
