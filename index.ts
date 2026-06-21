import 'react-native-url-polyfill/auto'
import { DevSettings, I18nManager } from 'react-native'
import * as Updates from 'expo-updates'
import { registerRootComponent } from 'expo'

import App from './App'

// Force RTL for this Hebrew-only app.
// forceRTL takes effect only after a reload — I18nManager.isRTL stays false
// until after the reload, so this guard naturally prevents an infinite loop.
I18nManager.allowRTL(true)
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true)
  if (__DEV__) {
    DevSettings.reload()
  } else {
    Updates.reloadAsync().catch(console.error)
  }
}

registerRootComponent(App)
