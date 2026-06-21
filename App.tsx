import React from 'react'
import { ActivityIndicator, TouchableOpacity, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useFonts as useHeebo, Heebo_400Regular, Heebo_500Medium, Heebo_600SemiBold, Heebo_700Bold, Heebo_800ExtraBold, Heebo_900Black } from '@expo-google-fonts/heebo'
import { Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins'

import { C, METAL } from './src/theme'
import { StoreProvider } from './src/data/store'
import { NavProvider, useNav, type Tab } from './src/nav'
import { Txt } from './src/components/ui'
import { Home } from './src/screens/Home'
import { Players } from './src/screens/Players'
import { Profile } from './src/screens/Profile'
import { Editor } from './src/screens/Editor'
import { Studio } from './src/screens/Studio'

function Shell() {
  const nav = useNav()
  const insets = useSafeAreaInsets()

  let screen: React.ReactNode = null
  if (nav.view === 'home') screen = <Home />
  else if (nav.view === 'players') screen = <Players />
  else if (nav.view === 'profile') screen = <Profile />
  else if (nav.view === 'editor') screen = <Editor />
  else if (nav.view === 'studio') screen = <Studio />

  const showNav = nav.view !== 'editor'

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1 }}>{screen}</View>

      {showNav && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 22, paddingBottom: Math.max(insets.bottom, 14), paddingTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', height: 58, borderRadius: 22, backgroundColor: 'rgba(22,22,27,0.96)', borderWidth: 1, borderColor: C.line }}>
            <NavItem tab="home" label="בית" icon="home" />
            <NavItem tab="players" label="שחקנים" icon="users" />
            <NavItem tab="studio" label="סטודיו" icon="studio" />
          </View>
        </View>
      )}

      {nav.toast && (
        <View style={{ position: 'absolute', bottom: 104 + insets.bottom, left: 0, right: 0, alignItems: 'center' }} pointerEvents="none">
          <View style={{ backgroundColor: 'rgba(28,28,34,0.97)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1, borderColor: C.line2 }}>
            <Txt weight="semi" style={{ fontSize: 13.5, color: '#fff' }}>{nav.toast}</Txt>
          </View>
        </View>
      )}
    </View>
  )
}

function NavItem({ tab, label, icon }: { tab: Tab; label: string; icon: 'home' | 'users' | 'studio' }) {
  const nav = useNav()
  const active = nav.tab === tab
  const color = active ? '#fff' : 'rgba(255,255,255,0.4)'
  return (
    <TouchableOpacity onPress={() => nav.go(tab)} style={{ alignItems: 'center', gap: 3, paddingHorizontal: 16 }}>
      {active && (
        <LinearGradient colors={METAL} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', top: -9, width: 26, height: 3, borderRadius: 2 }} />
      )}
      {icon === 'studio' ? (
        <MaterialCommunityIcons name="auto-fix" size={24} color={color} />
      ) : (
        <Feather name={icon} size={24} color={color} />
      )}
      <Txt weight="semi" style={{ fontSize: 10.5, color, textAlign: 'center' }}>{label}</Txt>
    </TouchableOpacity>
  )
}

export default function App() {
  const [heebo] = useHeebo({
    Heebo_400Regular, Heebo_500Medium, Heebo_600SemiBold, Heebo_700Bold, Heebo_800ExtraBold, Heebo_900Black,
    Poppins_700Bold, Poppins_800ExtraBold,
  })

  if (!heebo) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.green} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <StoreProvider>
        <NavProvider>
          <Shell />
        </NavProvider>
      </StoreProvider>
    </SafeAreaProvider>
  )
}
