import * as React from "react";
import BackgroundWithImage from "./background";
import { screenHorizontalPadding } from "util/AppDimensions";
import AppHeader from "./header";
import { fontGroup, FontLineHeights, FontSizes } from "util/FontUtils";
import theme from "assets/theme";
import { ScrollView } from "react-native";

interface CaptureChallengeScreenProps {
  title?: string;
  modals?: React.ReactNode;
  children: React.ReactNode;
}

const CaptureChallengeScreen = ({ title = "", modals, children }: CaptureChallengeScreenProps) => {
  return (
    <BackgroundWithImage
      style={{
        flex: 1,
      }}
    >
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
            ...fontGroup.ns700,
          },
        }}
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
          paddingHorizontal: screenHorizontalPadding,
        }}
      >
        {children}
      </ScrollView>

      {modals}
    </BackgroundWithImage>
  );
};

export default CaptureChallengeScreen;
