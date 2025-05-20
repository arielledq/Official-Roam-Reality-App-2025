import fontGroup from "assets/fonts";
import theme from "assets/theme";
import * as React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FontSizes } from "util/FontUtils";

interface SponsorBannerCaptureHeaderProps {
  imageUri?: string;
  sponsorName?: string;
  onPress?: () => void;
}

const SponsorBannerCaptureHeader = ({
  imageUri,
  sponsorName,
  onPress,
}: SponsorBannerCaptureHeaderProps) => {
  return (
    <View
      style={{
        backgroundColor: "#1158F4",
        height: 53,
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Image
            style={{
              width: 37,
              height: 37,
              marginEnd: 5,
            }}
            source={{ uri: imageUri }}
          />
          <Text
            style={{
              fontSize: FontSizes.S20,
              color: theme.lightColors?.white,
              ...fontGroup.nunitoBold,
            }}
          >
            {sponsorName}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onPress}
          style={{
            backgroundColor: "#fff",
            height: 30,
            paddingHorizontal: 8,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: FontSizes.S16,
              color: "#2B0143",
              ...fontGroup.nunitoBold,
            }}
          >
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SponsorBannerCaptureHeader;
