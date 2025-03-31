import React, { useEffect, useState } from "react";
import { Linking, Modal, StatusBar, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import FastImage from "react-native-fast-image";
import Images from "../../assets/images";
import { update } from "../../redux/Splash";
import { checkAppLatestUpdate } from "util/helpers";
import { AppButton } from "components";
import { PUBLIC_APP_STORE_URL } from "../../constants";
import theme from "assets/theme";

const AnimatedSplash = () => {
  const [appIsUpdated, setAppIsUpdated] = useState(true);
  const dispatch = useDispatch();

  const checkAppUpdateHandler = async () => {
    const isUpdated = await checkAppLatestUpdate();
    if (isUpdated) {
      dispatch(update(null));
    }
    setAppIsUpdated(isUpdated);
  };

  useEffect(() => {
    setTimeout(() => {
      checkAppUpdateHandler();
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar />
      <FastImage
        style={styles.image}
        source={Images.Splash}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Modal visible={!appIsUpdated} style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.darkColors?.background,
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Text style={{ color: theme.lightColors?.white, fontSize: 20, fontWeight: "bold" }}>
            Update available!
          </Text>
          <Text style={{ color: theme.lightColors?.white, fontSize: 16 }}>
            Please update the app to continue.
          </Text>
          <AppButton onPress={() => Linking.openURL(PUBLIC_APP_STORE_URL)}>
            Open App Store
          </AppButton>
        </View>
      </Modal>
    </View>
  );
};

export default AnimatedSplash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090A16",
  },
  image: {
    height: "100%",
    width: "100%",
  },
});
