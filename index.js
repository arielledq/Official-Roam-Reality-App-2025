import 'react-native-gesture-handler'
/**
 * @format
 */

import { AppRegistry, StatusBar, Platform, LogBox } from "react-native"
import App from './src/App'
import { name as appName } from './app.json'

LogBox.ignoreAllLogs()

if (Platform.OS == "android") {
  StatusBar.setTranslucent(true)
  StatusBar.setBackgroundColor("transparent")
  StatusBar.setBarStyle("light-content")
}

AppRegistry.registerComponent(appName, () => App)

if (window.document) {
  AppRegistry.runApplication(appName, {
    rootTag: document.getElementById('root')
  })
}
