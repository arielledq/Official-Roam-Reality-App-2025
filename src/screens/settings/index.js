import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../components/background";
import theme from "../../assets/theme";
import { AppHeader } from "../../components";
import Icon from "../../components/Icon";
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils";
import { useNavigation } from "@react-navigation/native";

function SettingsItem({ label, onPress, icon }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.darkColors?.inputBlue,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginHorizontal: 25,
        marginVertical: 10,
        borderRadius: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Icon name={icon} family="custom" size={24} />
        <Text style={styles.text}>{label}</Text>
      </View>
      <Icon name="chevron-right" family="entypo" color={theme.darkColors?.white} size={24} />
    </TouchableOpacity>
  );
}

const Settings = () => {
  const navigation = useNavigation();

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword");
  };
  const handlePrivacy = () => {
    navigation.navigate("Privacy");
  };

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader title={"Settings"} backgroundColor="transparent" />
      <SettingsItem icon="lock" label={"Change password"} onPress={handleChangePassword} />
      <SettingsItem icon="privacy" label={"Privacy"} onPress={handlePrivacy} />
    </BackgroundWithImage>
  );
};

export default Settings;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme?.colors?.inputBG,
  },
  text: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH21,
    color: theme.darkColors?.white,
    marginLeft: 15,
  },
  socialAccount: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH24,
  },
  linkNow: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH21,
    color: theme.darkColors?.inputBlue,
  },
});
