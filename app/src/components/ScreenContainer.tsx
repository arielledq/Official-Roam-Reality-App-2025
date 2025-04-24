import * as React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackgroundWithImage from "./background";
import { screenHorizontalPadding } from "util/AppDimensions";

const ScreenContainer = ({ children = <></>, style = {} }) => {
  const insets = useSafeAreaInsets();

  return (
    <BackgroundWithImage
      style={[styles.root, { paddingTop: insets.top, padding: insets.bottom + 88 }, style]}
    >
      {children}
    </BackgroundWithImage>
  );
};

export default ScreenContainer;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: screenHorizontalPadding,
  },
});
