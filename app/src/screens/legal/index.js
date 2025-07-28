import React, {useState} from "react";
import {View, StyleSheet, Image, Alert, TouchableOpacity, Pressable} from "react-native";
import {DrawerContentScrollView, DrawerItem} from "@react-navigation/drawer";
import theme from "../../assets/theme";
import {useNavigation} from "@react-navigation/native";
import Images from "../../assets/images";
import Icon from "../../components/Icon";
import AppText from "../../components/text";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";
import LinearGradient from "react-native-linear-gradient";
import BackgroundWithImage from "../../components/background";
import useStyles from "./styles";
import {AppHeader} from "../../components";

const DrawerList = [
  {icon: "Folder", label: "Privacy Policy", navigateTo: "PrivacyPolicy"},
  {
    icon: "Folder",
    label: "Terms and Conditions",
    navigateTo: "TermsAndConditions",
  },
  {
    icon: "Folder",
    label: "End User Agreement",
    navigateTo: "UserAgreement",
  },
  {
    icon: "Folder",
    label: "Waiver",
    navigateTo: "Waiver",
  },
];

const DrawerLayout = ({icon, label, navigateTo, index, onPress}) => {
  const renderDrawerItem = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Icon name={icon} family={"custom"} color={"white"} size={20} />
        <AppText style={styles.Text}>{label}</AppText>
        <Icon name="right" color={theme.darkColors?.white} size={20} />
      </View>
    );
  };
  return (
    <TouchableOpacity onPress={() => onPress(navigateTo)} style={styles.linearGradient}>
      {renderDrawerItem()}
    </TouchableOpacity>
  );
};

const DrawerItems = ({onPress}) => {
  return DrawerList.map((el, i) => {
    return (
      <DrawerLayout
        key={i}
        icon={el.icon}
        label={el.label}
        navigateTo={el.navigateTo}
        index={i}
        onPress={v => onPress(el.navigateTo)}
      />
    );
  });
};
function DrawerContent(props) {
  const navigation = useNavigation();
  const _styles = useStyles();
  const onPressHandler = navigateTo => navigation.navigate(navigateTo);

  return (
    <>
      <BackgroundWithImage style={_styles.mainContainer}>
        <View style={styles.drawerContent}>
          <AppHeader containerStyle={_styles.headerContainer} title={"Legal"} />
          <View style={styles.drawerSection}>
            <DrawerItems onPress={v => onPressHandler(v)} />
          </View>
        </View>
      </BackgroundWithImage>
    </>
  );
}

export default DrawerContent;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingBottom: 20,
  },
  drawerSection: {
    marginTop: 15,
    borderBottomWidth: 0,
  },
  Text: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH21,
    color: theme.darkColors?.white,
    marginLeft: 10,
    flex: 1,
  },
  checkIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  linearGradient: {
    marginLeft: 20,
    marginRight: 10,
    marginTop: 13,
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "flex-start",
  },
});
