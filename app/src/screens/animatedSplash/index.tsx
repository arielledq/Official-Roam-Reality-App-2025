import React, {useEffect, useState} from "react";
import {Linking, Modal, StatusBar, StyleSheet, Text, View} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import {useNavigation} from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import Images from "../../assets/images";
import {update} from "../../redux/Splash";
import {checkAppLatestUpdate} from "util/helpers";
import {AppButton} from "components";
import {PUBLIC_APP_STORE_URL} from "../../constants";
import theme from "assets/theme";

const AnimatedSplash = () => {
  const [appIsUpdated, setAppIsUpdated] = useState(true);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const token   = useSelector((state:any) => state.login?.data?.token);
  const newUser = useSelector((state:any) => state.persist?.newUser); // true en primera ejecución

  // const routeDecision = () => {
  //   // ocultar splash en tu redux si corresponde
  //   dispatch(update(null));
  //
  //   if (token) {
  //     // 👉 Usuario autenticado: directo al Home
  //     // @ts-ignore
  //     navigation.reset({
  //       index: 0,
  //       routes: [
  //         { name: "TabNavigator", params: { screen: "Tab", params: { screen: "GeoArChallenge" } } },
  //       ],
  //     });
  //     return;
  //   }
  //
  //   if (newUser) {
  //     // 👉 Primera vez: Onboarding
  //     // @ts-ignore
  //     navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
  //   } else {
  //     // 👉 Usuario recurrente sin token: Login
  //     // @ts-ignore
  //     navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  //   }
  // };

  const routeDecision = () => {
    // ✅ Solo marcar que el splash terminó. NO navega aquí.
    dispatch(update(true)); // asegúrate que `update(true)` ponga splashShown = true
  };

  // const checkAppUpdateHandler = async () => {
  //   const isUpdated = await checkAppLatestUpdate();
  //   setAppIsUpdated(isUpdated);
  //   if (isUpdated) routeDecision();
  // };

  const checkAppUpdateHandler = async () => {
    const isUpdated = await checkAppLatestUpdate();
    setAppIsUpdated(isUpdated);
    if (isUpdated) routeDecision();
  };

  useEffect(() => {
    // mismo delay que tenías
    const t = setTimeout(checkAppUpdateHandler, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar />
      <FastImage style={styles.image} source={Images.Splash} resizeMode={FastImage.resizeMode.cover} />
      <Modal visible={!appIsUpdated} style={{flex: 1}}>
        <View style={{flex: 1, backgroundColor: theme.darkColors?.background, justifyContent: "center", alignItems: "center", gap: 16}}>
          <Text style={{color: theme.lightColors?.white, fontSize: 20, fontWeight: "bold"}}>Update available!</Text>
          <Text style={{color: theme.lightColors?.white, fontSize: 16}}>Please update the app to continue.</Text>
          <AppButton onPress={() => Linking.openURL(PUBLIC_APP_STORE_URL)}>Open App Store</AppButton>
        </View>
      </Modal>
    </View>
  );
};

export default AnimatedSplash;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090A16" },
  image: { height: "100%", width: "100%" },
});
