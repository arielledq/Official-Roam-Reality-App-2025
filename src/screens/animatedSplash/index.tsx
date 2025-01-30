import React, { useEffect } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
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
    
   <View style={styles.container}>
     <StatusBar/>
      <FastImage
        style={styles.image}
        source={Images.Splash}
        resizeMode={FastImage.resizeMode.cover}
      />
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
