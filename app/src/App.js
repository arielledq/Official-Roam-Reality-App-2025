import React, {useEffect} from "react";
import {LogBox, StyleSheet, StatusBar} from "react-native";

import {Provider} from "react-redux";
import "react-native-devsettings/withAsyncStorage";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import Geocoder from "react-native-geocoding";
import Toast, {ErrorToast, SuccessToast} from "react-native-toast-message";
import {LogLevel, OneSignal} from "react-native-onesignal";
import "react-native-get-random-values";
import {PersistGate} from "redux-persist/integration/react";
import {Provider as PaperProvider} from "react-native-paper";
import {enableScreens} from "react-native-screens";
import {useOneSignal} from "./hooks/useOneSignal";

import Config from "./config";
import {persistor, store} from "./store";
import {NotificationProvider} from "./NotificationProvider";
import Navigation from "./navigation";
import {GeolocationProvider} from "./GeolocationProvider";

if (__DEV__) {
  require("../ReactotronConfig"); // Import before any other code
}

enableScreens();
Geocoder.init(Config.GEOCODER_API_KEY);
//OneSignal.Debug.setLogLevel(LogLevel.Verbose);
// INFO: react-native-onesignal setup
OneSignal.initialize(Config.ONE_SIGNAL_APP_ID);
OneSignal.Notifications.requestPermission(true);
OneSignal.Notifications.addEventListener("foregroundWillDisplay", event => {
  const notification = event.getNotification();
  event.complete(notification);
});

//OneSignal.User.pushSubscription.addEventListener("change", async () => {
//  try {
//    const id = await OneSignal.User.pushSubscription.getIdAsync();
//    const token = await OneSignal.User.pushSubscription.getTokenAsync();
//    const optedIn = await OneSignal.User.pushSubscription.getOptedInAsync();

//  } catch (e) {

//  }
//});

const toastConfig = {
  success: props => <SuccessToast {...props} text2NumberOfLines={2} text1NumberOfLines={2} />,
  error: props => <ErrorToast {...props} text2NumberOfLines={2} text1NumberOfLines={2} />,
};

const App = () => {
  //  const { setOnesignalDevice } = useOneSignal();
  //  useEffect(() => {
  //    LogBox.ignoreLogs(["Warning: ..."]);
  //    LogBox.ignoreAllLogs();
  //    // Llama una vez para registrar el device en tu backend y loguear id/permiso
  //    setOnesignalDevice();
  //  }, [setOnesignalDevice]);

  useEffect(() => {
    LogBox.ignoreLogs(["Warning: ..."]);
    LogBox.ignoreAllLogs();
  }, []);

  return (
    <PaperProvider>
      <NotificationProvider>
        <Provider store={store}>
          <GestureHandlerRootView style={styles.root}>
            <PersistGate loading={null} persistor={persistor}>
              <GeolocationProvider>
                <StatusBar hidden={true} />
                <Navigation />
              </GeolocationProvider>
            </PersistGate>
          </GestureHandlerRootView>
          <Toast config={toastConfig} />
        </Provider>
      </NotificationProvider>
    </PaperProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  root: {flex: 1},
});
