import * as React from "react";
import {StyleSheet} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import BackgroundWithImage from "./background";
import {screenHorizontalPadding} from "util/AppDimensions";

import {StyleProp, ViewStyle} from "react-native";

interface ScreenContainerProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const ScreenContainer = ({children, style}: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();

  return (
    <BackgroundWithImage style={[styles.root, {paddingTop: insets.top}, style]}>
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
