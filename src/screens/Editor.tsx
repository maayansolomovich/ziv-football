import React, { useState } from 'react'
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { C, FONT, METAL } from '../theme'
import { FEET, POSITIONS, emptyPlayer, initials, yearOf, type Player } from '../types'
import { useStore } from '../data/store'
import { useNav } from '../nav'
import { Txt } from '../components/ui'

type FormState = Record<string, string | boolean>

function toForm(p: Player): FormState {
  return {
    name: p.name, pos: p.pos, team: p.team, prevTeam: p.prevTeam ?? '', signed: p.signed,
    shirt: String(p.shirt || ''), age: String(p.age || ''), dob: p.dob === '—' ? '' : p.dob,
    height: String(p.height || ''), weight: String(p.weight || ''), foot: p.foot,
    goals: String(p.goals || ''), assists: String(p.assists || ''), apps: String(p.apps || ''),
    salary: String(p.salary || ''), fee: String(p.fee || ''),
    contractStartFull: p.contractStartFull ?? '', contractEnd: p.contractEnd ?? '',
    phone: p.phone === '—' ? '' : p.phone, ig: p.ig,
  }
}

const num = (x: unknown) => {
  const n = parseInt(String(x).replace(/[^0-9]/g, ''), 10)
  return isNaN(n) ? 0 : n
}

export function Editor() {
  const { getById, addPlayer, updatePlayer, removePlayer } = useStore()
  const nav = useNav()
  const insets = useSafeAreaInsets()
  const editing = nav.editId ? getById(nav.editId) : undefined
  const [f, setF] = useState<FormState>(() =>
    editing ? toForm(editing) : { ...emptyPlayer(), shirt: '', age: '', height: '', weight: '', goals: '', assists: '', apps: '', salary: '', fee: '', dob: '', contractStartFull: '', contractEnd: '', prevTeam: '', phone: '', ig: '' } as unknown as FormState,
  )
  const set = (k: string, v: string | boolean) => setF((s) => ({ ...s, [k]: v }))
  const str = (k: string) => String(f[k] ?? '')

  const save = () => {
    const name = str('name').trim()
    if (!name) {
      nav.showToast('יש להזין שם שחקן')
      return
    }
    const signed = !!f.signed
    const ceY = yearOf(str('contractEnd'))
    const data: Omit<Player, 'id'> = {
      ...emptyPlayer(),
      name,
      pos: str('pos') || 'קשר מרכזי',
      team: str('team').trim(),
      prevTeam: str('prevTeam').trim() || null,
      signed,
      shirt: num(f.shirt),
      age: num(f.age),
      dob: str('dob').trim() || '—',
      height: num(f.height),
      weight: num(f.weight),
      foot: str('foot') || 'ימין',
      goals: num(f.goals),
      assists: num(f.assists),
      apps: num(f.apps),
      salary: num(f.salary),
      fee: num(f.fee),
      contractStartFull: str('contractStartFull').trim() || null,
      contractEnd: str('contractEnd').trim() || null,
      contractFile: null,
      expSoon: signed && !!ceY && ceY <= 2026,
      phone: str('phone').trim() || '—',
      ig: str('ig').trim(),
      email: '',
      photos: editing?.photos ?? [],
    }
    if (editing) {
      updatePlayer(editing.id, data)
      nav.back('profile', { id: editing.id })
      nav.showToast('הפרטים עודכנו')
    } else {
      const created = addPlayer(data)
      nav.openProfile(created.id)
      nav.showToast('השחקן נוסף בהצלחה')
    }
  }

  const del = () => {
    if (!editing) return
    removePlayer(editing.id)
    nav.go('players')
    nav.showToast('השחקן נמחק')
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <TouchableOpacity onPress={() => (editing ? nav.back('profile', { id: editing.id }) : nav.go('players'))} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="chevron-right" size={24} color={C.t1} />
        </TouchableOpacity>
        <Txt weight="bold" style={{ fontSize: 17 }}>{editing ? 'עריכת שחקן' : 'הוספת שחקן'}</Txt>
        <TouchableOpacity onPress={save} activeOpacity={0.85}>
          <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ paddingVertical: 10, paddingHorizontal: 18, borderRadius: 13 }}>
            <Txt weight="bold" style={{ fontSize: 14, color: '#15161a' }}>שמור</Txt>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 18 }}>
        <View style={{ alignItems: 'center', marginVertical: 6 }}>
          <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ width: 84, height: 84, borderRadius: 42, padding: 2 }}>
            <LinearGradient colors={['#2a2b31', '#131418']} style={{ flex: 1, borderRadius: 42, alignItems: 'center', justifyContent: 'center' }}>
              <Txt weight="bold" style={{ fontSize: 30, color: '#e9e9ee' }}>{initials(str('name').trim() || '•')}</Txt>
            </LinearGradient>
          </LinearGradient>
        </View>

        <Sect t="פרטים בסיסיים" />
        <Lbl t="שם מלא" />
        <Input value={str('name')} onChangeText={(v) => set('name', v)} placeholder="שם השחקן" />

        <Lbl t="תפקיד" style={{ marginTop: 12 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {POSITIONS.map((pp) => {
            const active = str('pos') === pp
            return (
              <TouchableOpacity key={pp} onPress={() => set('pos', pp)} activeOpacity={0.8}>
                {active ? (
                  <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={chip}>
                    <Txt weight="semi" style={{ fontSize: 13, color: '#15161a' }}>{pp}</Txt>
                  </LinearGradient>
                ) : (
                  <View style={[chip, { backgroundColor: C.card, borderWidth: 1, borderColor: C.line }]}>
                    <Txt weight="semi" style={{ fontSize: 13, color: C.t2 }}>{pp}</Txt>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        <Row>
          <Field label="מספר חולצה" value={str('shirt')} onChangeText={(v) => set('shirt', v)} placeholder="10" numeric />
        </Row>

        <Sect t="סטטוס וקבוצות" />
        <Seg value={f.signed ? 'signed' : 'free'} options={[['signed', 'חתום'], ['free', 'חופשי']]} onChange={(v) => set('signed', v === 'signed')} />
        <Lbl t="קבוצה נוכחית" style={{ marginTop: 12 }} />
        <Input value={str('team')} onChangeText={(v) => set('team', v)} placeholder="שם הקבוצה" />
        <Lbl t="קבוצה קודמת" style={{ marginTop: 12 }} />
        <Input value={str('prevTeam')} onChangeText={(v) => set('prevTeam', v)} placeholder="שם הקבוצה" />

        <Sect t="פרטים אישיים" />
        <Row>
          <Field label="תאריך לידה" value={str('dob')} onChangeText={(v) => set('dob', v)} placeholder="01/01/2002" />
          <Field label="גיל" value={str('age')} onChangeText={(v) => set('age', v)} placeholder="22" numeric />
        </Row>
        <Row mt>
          <Field label='גובה (ס"מ)' value={str('height')} onChangeText={(v) => set('height', v)} placeholder="180" numeric />
          <Field label='משקל (ק"ג)' value={str('weight')} onChangeText={(v) => set('weight', v)} placeholder="74" numeric />
        </Row>
        <Lbl t="רגל חזקה" style={{ marginTop: 12 }} />
        <Seg value={str('foot')} options={FEET.map((x) => [x, x] as [string, string])} onChange={(v) => set('foot', v)} />

        <Sect t="סטטיסטיקות" />
        <Row>
          <Field label="גולים" value={str('goals')} onChangeText={(v) => set('goals', v)} placeholder="0" numeric />
          <Field label="בישולים" value={str('assists')} onChangeText={(v) => set('assists', v)} placeholder="0" numeric />
          <Field label="הופעות" value={str('apps')} onChangeText={(v) => set('apps', v)} placeholder="0" numeric />
        </Row>

        <Sect t="כספים" />
        <Row>
          <Field label="שכר חודשי (₪)" value={str('salary')} onChangeText={(v) => set('salary', v)} placeholder="15000" numeric />
          <Field label="עלות כרטיס (₪)" value={str('fee')} onChangeText={(v) => set('fee', v)} placeholder="500000" numeric />
        </Row>

        <Sect t="חוזה" />
        <Row>
          <Field label="תחילת חוזה" value={str('contractStartFull')} onChangeText={(v) => set('contractStartFull', v)} placeholder="01/07/2024" />
          <Field label="סיום חוזה" value={str('contractEnd')} onChangeText={(v) => set('contractEnd', v)} placeholder="30/06/2026" />
        </Row>

        <Sect t="פרטי קשר" />
        <Lbl t="טלפון" />
        <Input value={str('phone')} onChangeText={(v) => set('phone', v)} placeholder="050-0000000" keyboardType="phone-pad" />
        <Lbl t="אינסטגרם" style={{ marginTop: 12 }} />
        <Input value={str('ig')} onChangeText={(v) => set('ig', v)} placeholder="@username" />

        {editing && (
          <TouchableOpacity onPress={del} style={{ marginTop: 24, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,93,108,0.4)', alignItems: 'center' }}>
            <Txt weight="bold" style={{ fontSize: 14, color: C.red }}>מחק שחקן</Txt>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={save} activeOpacity={0.85} style={{ marginTop: 12 }}>
          <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ padding: 16, borderRadius: 16, alignItems: 'center' }}>
            <Txt weight="bold" style={{ fontSize: 16, color: '#15161a' }}>{editing ? 'שמור שינויים' : 'הוסף שחקן'}</Txt>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const inputStyle = {
  width: '100%' as const,
  backgroundColor: C.card,
  borderWidth: 1,
  borderColor: C.line,
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 13,
  color: C.t1,
  fontSize: 14.5,
  fontFamily: FONT.reg,
  textAlign: 'right' as const,
}
const chip = { paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999 }

const Lbl = ({ t, style }: { t: string; style?: object }) => (
  <Txt weight="semi" style={[{ fontSize: 11.5, color: C.t3, marginBottom: 6 }, style]}>{t}</Txt>
)
const Sect = ({ t }: { t: string }) => (
  <Txt weight="bold" style={{ fontSize: 12.5, color: C.t2, marginTop: 22, marginBottom: 10 }}>{t}</Txt>
)
const Row = ({ children, mt }: { children: React.ReactNode; mt?: boolean }) => (
  <View style={{ flexDirection: 'row', gap: 10, marginTop: mt ? 12 : 12 }}>{children}</View>
)

function Input(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput {...props} placeholderTextColor={C.t3} style={inputStyle} />
}

function Field({ label, value, onChangeText, placeholder, numeric }: { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; numeric?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <Lbl t={label} />
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={C.t3} keyboardType={numeric ? 'numeric' : 'default'} style={inputStyle} />
    </View>
  )
}

function Seg({ value, options, onChange }: { value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map(([val, label]) => {
        const active = value === val
        return (
          <TouchableOpacity key={val} onPress={() => onChange(val)} activeOpacity={0.85} style={{ flex: 1 }}>
            {active ? (
              <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ paddingVertical: 11, borderRadius: 12, alignItems: 'center' }}>
                <Txt weight="semi" style={{ fontSize: 13.5, color: '#15161a' }}>{label}</Txt>
              </LinearGradient>
            ) : (
              <View style={{ paddingVertical: 11, borderRadius: 12, alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.line }}>
                <Txt weight="semi" style={{ fontSize: 13.5, color: C.t2 }}>{label}</Txt>
              </View>
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
