import React from 'react'
import { Image, StyleSheet, Text, type TextProps, View, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { C, FONT, METAL, METAL_DARK } from '../theme'
import { initials as toInitials } from '../types'

// Layout props that belong on the wrapper View, not the inner Text
const VIEW_KEYS = new Set([
  'flex','flexGrow','flexShrink','flexBasis',
  'margin','marginTop','marginBottom','marginLeft','marginRight',
  'marginStart','marginEnd','marginHorizontal','marginVertical',
  'alignSelf','position','top','bottom','left','right','start','end',
  'zIndex','opacity',
])

export function Txt({ style, weight, ...rest }: TextProps & { weight?: keyof typeof FONT }) {
  const flat = StyleSheet.flatten(style) as Record<string, unknown> | null
  const viewExtras: Record<string, unknown> = {}
  const textExtras: Record<string, unknown> = {}
  if (flat) {
    for (const [k, v] of Object.entries(flat)) {
      if (VIEW_KEYS.has(k)) viewExtras[k] = v
      else textExtras[k] = v
    }
  }
  return (
    <View style={[{ flexDirection: 'row', alignSelf: 'stretch' }, viewExtras as ViewStyle]}>
      <Text
        {...rest}
        style={[
          { fontFamily: FONT[weight ?? 'reg'], color: C.t1, textAlign: 'right', writingDirection: 'rtl', flex: 1 },
          textExtras,
        ]}
      />
    </View>
  )
}

export function Monogram({ size }: { size: number }) {
  return (
    <LinearGradient
      colors={METAL_DARK}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Text
        style={{
          fontFamily: FONT.brand,
          fontSize: size * 0.56,
          color: '#e8ebf1',
          transform: [{ skewX: '-7deg' }],
          lineHeight: size * 0.7,
        }}
      >
        Z
      </Text>
    </LinearGradient>
  )
}

export function Avatar({
  name,
  size,
  ring,
  uri,
}: {
  name: string
  size: number
  ring?: boolean
  uri?: string | null
}) {
  const inner = uri ? (
    <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: size / 2 }} />
  ) : (
    <LinearGradient
      colors={['#2a2b31', '#131418']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={{ width: '100%', height: '100%', borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ fontFamily: FONT.bold, color: '#e9e9ee', fontSize: size * 0.36 }}>
        {toInitials(name)}
      </Text>
    </LinearGradient>
  )

  if (ring) {
    return (
      <LinearGradient
        colors={METAL}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ width: size, height: size, borderRadius: size / 2, padding: 2 }}
      >
        <View style={{ flex: 1, borderRadius: size / 2, overflow: 'hidden' }}>{inner}</View>
      </LinearGradient>
    )
  }
  return <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>{inner}</View>
}

export function Chip({
  text,
  color,
  solid,
}: {
  text: string
  color: string
  solid?: boolean
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 4,
        paddingHorizontal: 9,
        borderRadius: 999,
        backgroundColor: solid ? color : color + '1f',
        borderWidth: 1,
        borderColor: solid ? 'transparent' : color + '40',
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: solid ? '#06120c' : color }} />
      <Text style={{ fontFamily: FONT.semi, fontSize: 11, color: solid ? '#06120c' : color }}>{text}</Text>
    </View>
  )
}

export const styles = StyleSheet.create({
  cardBase: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 18,
  },
})
