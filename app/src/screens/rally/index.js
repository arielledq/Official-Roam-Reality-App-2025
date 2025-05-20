import React, {useState} from "react";
import {ActivityIndicator, ImageBackground, StyleSheet, View} from "react-native";

import theme from "assets/theme";

const Rally = () => {
  const [loading, setLoading] = useState(true); // State to manage loading

  return (
    <ImageBackground
      source={require("../../assets/images/ROAM_RALLY_2025_04_01.webp")}
      style={styles.imageBackground}
      resizeMode="cover"
      onLoadStart={() => setLoading(true)}
      onLoadEnd={() => setLoading(false)}
    >
      {loading && (
        <View style={[styles.loadingOverlay, {backgroundColor: theme.lightColors.inputBG}]}>
          <ActivityIndicator size="large" color={theme.lightColors.purple} />
        </View>
      )}
    </ImageBackground>
  );
};

export default Rally;

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire ImageBackground
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark semi-transparent overlay
    justifyContent: "center",
    alignItems: "center",
  },
});
