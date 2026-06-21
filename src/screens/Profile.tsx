import React from 'react'
import { Image, Linking, ScrollView, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { C, FONT, METAL } from '../theme'
import { fmt, fmtShort } from '../types'
import { useStore } from '../data/store'
import { useNav } from '../nav'
import { Chip, Txt } from '../components/ui'
import { pickImage } from '../photos'

const GALLERY = 5

export function Profile() {
  const { getById, updatePlayer } = useStore()
  const nav = useNav()
  const insets = useSafeAreaInsets()
  const p = nav.selectedId ? getById(nav.selectedId) : undefined

  if (!p) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ color: C.t3 }}>השחקן לא נמצא</Txt>
      </View>
    )
  }

  const photo = p.photos[nav.gallery] ?? null

  const addPhotoAt = async (index: number) => {
    const uri = await pickImage()
    if (!uri) return
    const photos = [...p.photos]
    photos[index] = uri
    updatePlayer(p.id, { photos })
    nav.setGallery(index)
  }

  const Row = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.line }}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Txt style={{ fontSize: 13.5, color: C.t2, flex: 1 }}>{label}</Txt>
      <Txt weight="semi" style={{ fontSize: 14, color: accent ?? C.t1, textAlign: 'left' }}>{value}</Txt>
    </View>
  )

  const StatBox = ({ v, l, c }: { v: number; l: string; c?: string }) => (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 16 }}>
      <Txt weight="extra" style={{ fontSize: 22, color: c ?? C.t1 }}>{v}</Txt>
      <Txt style={{ fontSize: 11, color: C.t3, marginTop: 5 }}>{l}</Txt>
    </View>
  )

  const SectTitle = ({ t }: { t: string }) => (
    <Txt weight="bold" style={{ fontSize: 13, color: C.t2, marginTop: 24, marginBottom: 8 }}>{t}</Txt>
  )

  const hasContract = !!(p.contractFile || p.signed)
  const hasTm = !!p.tmUrl?.trim()

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* hero */}
      <TouchableOpacity activeOpacity={0.95} onPress={() => addPhotoAt(nav.gallery)} style={{ height: 430 }}>
        {photo ? (
          <Image source={{ uri: photo }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        ) : (
          <LinearGradient colors={['#202127', '#0c0d10']} style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Feather name="image" size={34} color={C.t3} />
            <Txt style={{ color: C.t3, fontSize: 13 }}>הקש להוספת תמונת שחקן</Txt>
          </LinearGradient>
        )}
        <LinearGradient
          colors={['rgba(10,10,13,0.55)', 'rgba(10,10,13,0)', 'rgba(10,10,13,0.2)', 'rgba(10,10,13,0.97)']}
          locations={[0, 0.26, 0.55, 1]}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          pointerEvents="none"
        />

        {/* top bar */}
        <View style={{ position: 'absolute', top: insets.top + 6, right: 16, left: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => nav.back('players')} style={iconBtn}>
            <Feather name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nav.openEditor(p.id)} style={iconBtn}>
            <Feather name="edit-2" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* gallery dots */}
        <View style={{ position: 'absolute', bottom: 96, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }} pointerEvents="none">
          {Array.from({ length: GALLERY }).map((_, i) => (
            <View key={i} style={{ width: i === nav.gallery ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === nav.gallery ? '#fff' : 'rgba(255,255,255,0.4)' }} />
          ))}
        </View>

        {/* name block */}
        <View style={{ position: 'absolute', bottom: 18, right: 18, left: 18 }}>
          <View style={{ flexDirection: 'row', gap: 7, marginBottom: 9 }}>
            {p.signed ? <Chip text={p.team} color={C.green} /> : <Chip text="שחקן חופשי" color={C.amber} />}
            {p.expSoon ? <Chip text="חוזה פג בקרוב" color={C.red} /> : null}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Txt weight="extra" style={{ fontSize: 30, color: '#fff', letterSpacing: -0.5 }}>{p.name}</Txt>
              <Txt weight="med" style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{p.pos}</Txt>
            </View>
            <Txt style={{ fontFamily: FONT.brand, fontSize: 46, color: '#dfe2e8' }}>{p.shirt || ''}</Txt>
          </View>
        </View>
      </TouchableOpacity>

      <View style={{ paddingHorizontal: 18 }}>
        {/* stats */}
        <View style={{ flexDirection: 'row', gap: 9, marginTop: 18 }}>
          <StatBox v={p.age} l="גיל" />
          <StatBox v={p.goals} l="גולים" c={C.green} />
          <StatBox v={p.assists} l="בישולים" c={C.blue} />
          <StatBox v={p.apps} l="הופעות" />
        </View>

        {/* photos */}
        <SectTitle t="תמונות" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 9 }}>
          {Array.from({ length: GALLERY }).map((_, i) => {
            const uri = p.photos[i]
            return (
              <TouchableOpacity
                key={i}
                onPress={() => (uri ? nav.setGallery(i) : addPhotoAt(i))}
                style={{ width: 74, height: 92, borderRadius: 14, borderWidth: 2, borderColor: i === nav.gallery ? '#fff' : C.line, overflow: 'hidden', backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' }}
              >
                {uri ? <Image source={{ uri }} style={{ width: '100%', height: '100%' }} /> : <Feather name="plus" size={20} color={C.t3} />}
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* contract */}
        <SectTitle t="חוזה" />
        <View style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 18, paddingHorizontal: 15 }}>
          <Row icon={<Feather name="users" size={18} color={C.t2} />} label="קבוצה נוכחית" value={p.team || '—'} />
          <Row icon={<Feather name="users" size={18} color={C.t2} />} label="קבוצה קודמת" value={p.prevTeam || '—'} />
          <Row icon={<Feather name="calendar" size={18} color={C.t2} />} label="תחילת חוזה" value={p.contractStartFull || '—'} />
          <Row icon={<Feather name="calendar" size={18} color={C.t2} />} label="סיום חוזה" value={p.contractEnd || '—'} accent={p.expSoon ? C.red : C.t1} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 }}>
            <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="file-text" size={18} color={C.t2} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt weight="semi" style={{ fontSize: 13.5, color: hasContract ? C.t1 : C.t3 }} numberOfLines={1}>
                {p.contractFile || (p.signed ? 'חוזה_' + p.name.split(' ')[0] + '.pdf' : 'אין חוזה פעיל')}
              </Txt>
              <Txt style={{ fontSize: 11.5, color: C.t3 }}>{hasContract ? 'מסמך חוזה' : 'שחקן חופשי'}</Txt>
            </View>
            {hasContract && (
              <TouchableOpacity onPress={() => nav.showToast('הורדת חוזה תהיה זמינה בקרוב')}>
                <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="download" size={18} color="#15161a" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* finances */}
        <SectTitle t="כספים" />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <LinearGradient colors={['#1d1e23', '#121316']} style={{ flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 18, padding: 15 }}>
            <Txt style={{ fontSize: 12, color: C.t3, marginBottom: 6 }}>שכר חודשי</Txt>
            <Txt weight="extra" style={{ fontSize: 21 }}>{fmt(p.salary)}</Txt>
          </LinearGradient>
          <LinearGradient colors={['#1d1e23', '#121316']} style={{ flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 18, padding: 15 }}>
            <Txt style={{ fontSize: 12, color: C.t3, marginBottom: 6 }}>עלות כרטיס</Txt>
            <Txt weight="extra" style={{ fontSize: 21, color: '#dfe2e8' }}>{fmtShort(p.fee)}</Txt>
          </LinearGradient>
        </View>

        {/* personal */}
        <SectTitle t="פרטים אישיים" />
        <View style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 18, paddingHorizontal: 15 }}>
          <Row icon={<Feather name="calendar" size={18} color={C.t2} />} label="תאריך לידה" value={p.dob} />
          <Row icon={<Feather name="trending-up" size={18} color={C.t2} />} label="גובה" value={p.height ? p.height + ' ס"מ' : '—'} />
          <Row icon={<Feather name="bar-chart-2" size={18} color={C.t2} />} label="משקל" value={p.weight ? p.weight + ' ק"ג' : '—'} />
          <Row icon={<MaterialCommunityIcons name="shoe-cleat" size={18} color={C.t2} />} label="רגל חזקה" value={p.foot} />
        </View>

        {/* contact */}
        <SectTitle t="פרטי קשר" />
        <View style={{ flexDirection: 'row', gap: 9 }}>
          <ContactBtn icon={<Feather name="phone" size={20} color={C.green} />} label="התקשר" onPress={() => Linking.openURL('tel:' + p.phone)} />
          <ContactBtn icon={<Feather name="mail" size={20} color={C.blue} />} label="מייל" onPress={() => Linking.openURL('mailto:' + (p.email || ''))} />
          <ContactBtn icon={<Feather name="instagram" size={20} color={C.pink} />} label="אינסטגרם" onPress={() => {
            const handle = (p.ig || '').replace('@', '')
            if (handle) Linking.openURL('https://instagram.com/' + handle)
            else nav.showToast('לא הוזן אינסטגרם')
          }} />
        </View>

        {/* transfermarkt */}
        <TouchableOpacity
          onPress={() => Linking.openURL(hasTm ? p.tmUrl : 'https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=' + encodeURIComponent(p.name))}
          style={{ marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 15, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: hasTm ? C.green + '55' : C.line2 }}
        >
          {hasTm ? <Feather name="check-circle" size={15} color={C.green} /> : null}
          <Txt style={{ fontFamily: FONT.brand, fontSize: 13.5, letterSpacing: 0.6, color: C.green }}>TRANSFERMARKT</Txt>
          <Txt weight="bold" style={{ fontSize: 15, color: C.t2 }}>↗</Txt>
        </TouchableOpacity>
        <Txt style={{ fontSize: 11, color: hasTm ? C.green : C.t3, marginTop: 7 }}>
          {hasTm ? 'קישור פרופיל מקושר' : 'אין קישור — חיפוש לפי שם'}
        </Txt>

        {/* create post */}
        <TouchableOpacity onPress={() => nav.go('studio')} activeOpacity={0.85} style={{ marginTop: 12 }}>
          <LinearGradient colors={METAL} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 18 }}>
            <MaterialCommunityIcons name="auto-fix" size={21} color="#15161a" />
            <Txt weight="bold" style={{ fontSize: 15.5, color: '#15161a' }}>צור פוסט לשחקן</Txt>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const iconBtn = {
  width: 42,
  height: 42,
  borderRadius: 14,
  backgroundColor: 'rgba(10,10,13,0.5)',
  borderWidth: 1,
  borderColor: C.line2,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
}

function ContactBtn({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 7, paddingVertical: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 16 }}>
      {icon}
      <Txt style={{ fontSize: 11.5, color: C.t2 }}>{label}</Txt>
    </TouchableOpacity>
  )
}
