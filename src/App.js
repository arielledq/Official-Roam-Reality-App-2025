import React, { useEffect } from 'react'
import Navigation from './navigation'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from './store'
import 'react-native-devsettings/withAsyncStorage'
import { StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import SplashScreen from 'react-native-splash-screen'

const App = () => {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide()
    }, 100)
  }, [])
  return (
    <Provider store={store}>
      {/* this  GestureHandlerRootView is used for https://gorhom.github.io/react-native-bottom-sheet/*/}
      <GestureHandlerRootView style={styles.root}>
        <PersistGate loading={null} persistor={persistor}>
          <Navigation />
        </PersistGate>
      </GestureHandlerRootView>
    </Provider>
  )
}

export default App

const styles = StyleSheet.create({
  root: { flex: 1 }
})
