import React, { useEffect } from "react"
import Navigation from "./navigation"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { persistor, store } from "./store"
import "react-native-devsettings/withAsyncStorage"
import { LogBox, StyleSheet } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import SplashScreen from "react-native-splash-screen"
import Geocoder from "react-native-geocoding"
import Toast, { ErrorToast, SuccessToast } from "react-native-toast-message"
import OneSignal from "react-native-onesignal"
import { NotificationProvider } from "./NotificationProvider"
import Config from "./config"
import {GeolocationProvider} from "./GeolocationProvider";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://8a0ac5dac07d4ed0b64bd75ab3c5a765@sentry.innovatica.com.py//58',

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // enableSpotlight: __DEV__,
});

Geocoder.init("AIzaSyAd_EZRrfSjO2OS6p-h89wrT3y8xyREpTA")

OneSignal.setAppId(Config.ONE_SIGNAL_APP_ID)

OneSignal.promptForPushNotificationsWithUserResponse()

OneSignal.setNotificationWillShowInForegroundHandler(
  notificationReceivedEvent => {
    const notification = notificationReceivedEvent.getNotification()
    notificationReceivedEvent.complete(notification)
  }
)

const toastConfig = {
  success: props => (
    <SuccessToast {...props} text2NumberOfLines={2} text1NumberOfLines={2} />
  ),
  error: props => (
    <ErrorToast {...props} text2NumberOfLines={2} text1NumberOfLines={2} />
  )
}

const App = () => {
  useEffect(() => {
    LogBox.ignoreLogs(["Warning: ..."])
    LogBox.ignoreAllLogs()
    setTimeout(() => {
      SplashScreen.hide()
    }, 100)
  }, [])

  return (
    <NotificationProvider>
      <Provider store={store}>
        {/* this  GestureHandlerRootView is used for https://gorhom.github.io/react-native-bottom-sheet/*/}
        <GestureHandlerRootView style={styles.root}>
          <PersistGate loading={null} persistor={persistor}>
            <GeolocationProvider>
              <Navigation />
            </GeolocationProvider>
          </PersistGate>
        </GestureHandlerRootView>
        <Toast config={toastConfig} />
      </Provider>
    </NotificationProvider>
  )
}

export default App

const styles = StyleSheet.create({
  root: { flex: 1 }
})
