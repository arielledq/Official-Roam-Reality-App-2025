import React, {useEffect} from "react";
import {LogBox, StyleSheet, StatusBar} from "react-native";

import {Provider} from "react-redux";
import "react-native-devsettings/withAsyncStorage";
import {GestureHandlerRootView} from "react-native-gesture-handler";
// import SplashScreen from "react-native-splash-screen";
import Geocoder from "react-native-geocoding";
import Toast, {ErrorToast, SuccessToast} from "react-native-toast-message";
import OneSignal from "react-native-onesignal";
import MapboxGL from "@rnmapbox/maps";
import "react-native-get-random-values";
import {PersistGate} from "redux-persist/integration/react";

import Config from "./config";
import {persistor, store} from "./store";
import {NotificationProvider} from "./NotificationProvider";
import Navigation from "./navigation";
import {GeolocationProvider} from "./GeolocationProvider";

if (__DEV__) {
  require("../ReactotronConfig"); // Import before any other code
}

MapboxGL.setAccessToken(Config.MAPBOX_PUBLIC_KEY);

Geocoder.init(Config.GEOCODER_API_KEY);

OneSignal.setAppId(Config.ONE_SIGNAL_APP_ID);

OneSignal.promptForPushNotificationsWithUserResponse();

OneSignal.setNotificationWillShowInForegroundHandler(notificationReceivedEvent => {
  const notification = notificationReceivedEvent.getNotification();
  notificationReceivedEvent.complete(notification);
});

const toastConfig = {
  success: props => <SuccessToast {...props} text2NumberOfLines={2} text1NumberOfLines={2} />,
  error: props => <ErrorToast {...props} text2NumberOfLines={2} text1NumberOfLines={2} />,
};

const App = () => {
  useEffect(() => {
    LogBox.ignoreLogs(["Warning: ..."]);
    LogBox.ignoreAllLogs();
    setTimeout(() => {
      // SplashScreen.hide();
    }, 100);
  }, []);

  return (
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
  );
};

export default App;

const styles = StyleSheet.create({
  root: {flex: 1},
});
