import theme from "assets/theme";
import React from "react";
import {View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar} from "react-native";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons";
import {FontSizes} from "util/FontUtils";

const {width: screenWidth} = Dimensions.get("window");

const UnityHeader = ({
  title = "Choose your AR MODE",
  onBackPress,
  selectedMode = "Live",
  onModeChange,
}) => {
  const modes = ["Map", "Live", "List"];

  const renderModeButton = mode => {
    const isSelected = selectedMode === mode;

    return (
      <TouchableOpacity
        key={mode}
        style={[styles.modeButton, isSelected && styles.selectedModeButton]}
        onPress={() => onModeChange(mode)}
      >
        <Text style={[styles.modeButtonText, isSelected && styles.selectedModeButtonText]}>
          {mode}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Icon name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.modesContainer}>{modes.map(renderModeButton)}</View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: heightPercentageToDP("5%"),
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "rgba(56, 55, 55, 0.95)", // More solid background like in screenshot
    paddingVertical: "4%",
    paddingHorizontal: "4%",
    marginHorizontal: "5%",
    borderRadius: 12,

    alignSelf: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: "2%",
    gap: widthPercentageToDP("4%"),
  },
  backButton: {
    width: widthPercentageToDP("12%"),
    height: widthPercentageToDP("10%"),
    backgroundColor: theme.lightColors?.grey4,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginTop: "2%",
  },
  titleText: {
    color: theme.lightColors?.white,
    fontSize: FontSizes.S16,
    fontWeight: "600",
    textAlign: "center",
  },
  modesContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
  },
  modeButton: {
    width: widthPercentageToDP("20%"),
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    height: widthPercentageToDP("10%"),
    backgroundColor: theme.lightColors?.grey4,
  },
  selectedModeButton: {
    backgroundColor: "#5532ff",
  },
  modeButtonText: {
    color: theme.lightColors?.white,
    fontSize: FontSizes.S16,
    fontWeight: "600",
    textAlign: "center",
  },
  selectedModeButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});

export default UnityHeader;
