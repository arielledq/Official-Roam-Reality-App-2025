import * as React from "react";
import { Image, ScrollView, Text, View, Dimensions, TouchableOpacity } from "react-native";

import RenderHTML from "react-native-render-html";
import { StyleSheet } from "react-native";

import { fontGroup, FontSizes } from "util/FontUtils";
import theme from "assets/theme";

// @ts-ignore
import LineIcon from "assets/ar/line.png";

const { width } = Dimensions.get("window");

const ViewInfoModal = ({ isVisible = false, onClose = () => {}, content = "" }) => {
  if (!isVisible) return null;
  return (
    <View style={styles.challengeInfoContainer}>
      <View style={styles.challengeInfoHeaderContainer}>
        <Image source={LineIcon} style={{ width: 35.63, height: 4 }} />
        <Text style={styles.challengeInfoHeader}>Challenge Details</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: "100%", padding: 24 }}
      >
        <RenderHTML
          contentWidth={width}
          tagsStyles={{
            p: { color: "#FFF", fontSize: FontSizes.S14 },
            strong: { color: "#FFF", fontSize: FontSizes.S18 },
          }}
          source={{ html: content }}
        />
      </ScrollView>
      <View style={{ width: "100%", paddingHorizontal: 24, marginBottom: 20 }}>
        <TouchableOpacity activeOpacity={0.6} onPress={onClose}>
          <Text style={styles.bottomText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ViewInfoModal;

const styles = StyleSheet.create({
  challengeInfoContainer: {
    width: "100%",
    backgroundColor: "#131422",
    height: 420,
    borderRadius: 30,
    position: "absolute",
    alignItems: "center",
    bottom: 0,
  },
  challengeInfoHeaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
    borderBottomColor: "#2C2D41",
    borderBottomWidth: 1,
    width: "100%",
  },
  challengeInfoHeader: {
    ...fontGroup.nunitoBold,
    fontWeight: "700",
    fontSize: FontSizes.S18,
    color: theme.lightColors?.white,
    marginTop: 10,
  },
  bottomText: {
    ...fontGroup.nunitoBold,
    fontWeight: "700",
    fontSize: FontSizes.S18,
    textAlign: "center",
    color: "#1158F4",
    marginVertical: 15,
  },
});
