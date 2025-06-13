import React, {useEffect} from "react";
import {LogBox, StyleSheet, StatusBar} from "react-native";

import {Provider} from "react-redux";
import "react-native-devsettings/withAsyncStorage";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import Geocoder from "react-native-geocoding";
import Toast, {ErrorToast, SuccessToast} from "react-native-toast-message";
import {OneSignal} from "react-native-onesignal";
import "react-native-get-random-values";
import {PersistGate} from "redux-persist/integration/react";
import {Provider as PaperProvider} from "react-native-paper";

import Config from "./config";
import {persistor, store} from "./store";
import {NotificationProvider} from "./NotificationProvider";
import Navigation from "./navigation";
import {GeolocationProvider} from "./GeolocationProvider";

if (__DEV__) {
  require("../ReactotronConfig"); // Import before any other code
}

Geocoder.init(Config.GEOCODER_API_KEY);

// INFO: react-native-onesignal setup
OneSignal.initialize(Config.ONE_SIGNAL_APP_ID);
OneSignal.Notifications.requestPermission(true);
OneSignal.Notifications.addEventListener("foregroundWillDisplay", event => {
  const notification = event.getNotification();
  event.complete(notification);
});

const toastConfig = {
  success: props => <SuccessToast {...props} text2NumberOfLines={2} text1NumberOfLines={2} />,
  error: props => <ErrorToast {...props} text2NumberOfLines={2} text1NumberOfLines={2} />,
};

const App = () => {
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
