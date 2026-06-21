import * as ImagePicker from 'expo-image-picker'

/** Opens the gallery and returns a local URI, or null if cancelled/denied. */
export async function pickImage(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!perm.granted) return null
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.85,
  })
  if (res.canceled || !res.assets?.length) return null
  return res.assets[0].uri
}
