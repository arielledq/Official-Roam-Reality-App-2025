import * as React from "react";
import { Text, View } from "react-native";

import fontGroup from "assets/fonts";
import { FontSizes } from "util/FontUtils";
import theme from "assets/theme";

// @ts-ignore
import PinIcon from "../assets/geoar/pin_locationicon.svg";
// @ts-ignore
import TrophyIcon from "../assets/geoar/trophy_icon.svg";

interface PinFoundCaptureHeaderProps {
  pinFound?: boolean;
  points?: number;
}

const iconSize = 32;

const PinFoundCaptureHeader = ({ pinFound, points }: PinFoundCaptureHeaderProps) => {
  return (
    <View
      style={{
        backgroundColor: "#131422",
        borderRadius: 100,
        paddingVertical: 4,
        paddingHorizontal: 8,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <PinIcon style={{ width: iconSize, height: iconSize, marginEnd: 10 }} />
        <View>
          <Text
            // @ts-ignore
            style={{
              ...fontGroup.ns400,
              fontSize: FontSizes.S12,
              color: theme.lightColors?.white,
              lineHeight: 13.64,
              marginVertical: 4,
              textAlign: "center",
            }}
          >
            Pin Found
          </Text>
          <Text
            // @ts-ignore
            style={{
              ...fontGroup.ns600,
              fontSize: FontSizes.S16,
              color: "#C881F0",
              textAlign: "center",
            }}
          >
            {pinFound ? 1 : 0} / 1
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ marginEnd: 10 }}>
          <Text
            // @ts-ignore
            style={{
              ...fontGroup.ns400,
              fontSize: FontSizes.S12,
              color: theme.lightColors?.white,
              lineHeight: 13.64,
              marginVertical: 4,
              textAlign: "center",
            }}
          >
            Points
          </Text>
          <Text
            // @ts-ignore
            style={{
              ...fontGroup.ns600,
              fontSize: FontSizes.S16,
              color: "#C881F0",
              textAlign: "center",
            }}
          >
            {points}
          </Text>
        </View>
        <TrophyIcon style={{ width: iconSize, height: iconSize }} />
      </View>
    </View>
  );
};

export default PinFoundCaptureHeader;
