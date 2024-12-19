import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import FastImage from "react-native-fast-image";
import Images from "../../assets/images";
import { update } from "../../redux/Splash";

const AnimatedSplash = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(async () => {
      dispatch(update());
    }, 2000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FastImage
        style={styles.image}
        source={Images.Splash}
        resizeMode={FastImage.resizeMode.cover}
      />
    </SafeAreaView>
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
