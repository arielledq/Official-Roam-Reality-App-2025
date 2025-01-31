import * as React from "react";
import BackgroundWithImage from "./background";
import { screenHorizontalPadding } from "util/AppDimensions";
import AppHeader from "./header";
import { fontGroup, FontLineHeights, FontSizes } from "util/FontUtils";
import theme from "assets/theme";
import { ScrollView, StyleSheet, useWindowDimensions, View, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";

interface CaptureChallengeScreenProps {
  appHeader?: boolean;
  title?: string;
  headerRightComponent?: React.ReactNode;
  modals?: React.ReactNode;
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
}

const ChallengeScreen = ({
  title = "",
  headerRightComponent,
  modals,
  children,
  style,
  appHeader = true,
  scrollable = true,
}: CaptureChallengeScreenProps) => {
  const { height, width } = useWindowDimensions();

  const screenContainerStyle = {
    paddingBottom: 40,
    paddingHorizontal: screenHorizontalPadding,
    ...style,
  };
  let screenContainer = (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={screenContainerStyle}>
      {children}
    </ScrollView>
  );
  if (!scrollable) {
    screenContainer = <View style={{ ...screenContainerStyle, flex: 1 }}>{children}</View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.darkColors?.inputBG }}>
      <BackgroundWithImage
        style={[{ width: width, height: height / 2 }, styles.backgroundStyle]}
        imageStyle={styles.backgroundImage}
      >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", `${theme.darkColors?.inputBG}`]} // Transparent to semi-black
          style={styles.gradient}
          start={{ x: 0.5, y: 0.5 }} // Middle
          end={{ x: 0.5, y: 1 }} // Bottom
        />
      </BackgroundWithImage>
      {appHeader && (
        <AppHeader
          centerComponent={{
            text: title,
            numberOfLines: 2,
            // @ts-ignore
            style: {
              fontSize: FontSizes.S14,
              lineHeight: FontLineHeights.LH20,
              color: theme.lightColors?.white,
              textAlign: "center",
              ...fontGroup.nunitoBold,
            },
          }}
          centerContainerStyle={{ alignItems: "center", justifyContent: "center" }}
          backgroundColor="transparent"
          // @ts-expect-error
          rightComponent={headerRightComponent}
        />
      )}
      {screenContainer}

      {modals}
    </View>
  );
};

export default ChallengeScreen;

const styles = StyleSheet.create({
  backgroundStyle: {
    position: "absolute",
    top: 0,
    left: 0,

    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  backgroundImage: {
    resizeMode: "stretch",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject, // Covers the entire ImageBackground
  },
});
