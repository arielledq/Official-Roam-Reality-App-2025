import React from "react"
import { View, StyleSheet, Image } from "react-native"
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer"
import theme from "../../assets/theme"
import { useNavigation } from "@react-navigation/native"
import Images from "../../assets/images"
import Icon from "../../components/Icon"
import AppText from "../../components/text"
import { FontLineHeights, FontSizes, fontGroup } from '../../util/FontUtils';

const DrawerList = [
  { icon: "target", label: "AR Challenges", navigateTo: "ARChallenge" },
  { icon: "message-square", label: "Chats", navigateTo: "Home" },
  { icon: "users", label: "Friends", navigateTo: "Home" },
  { icon: "target", label: "Wallet", navigateTo: "Home" },
  { icon: "info", label: "About Us", navigateTo: "Home" },
  { icon: "target", label: "Invite Friends", navigateTo: "Home" },
  { icon: "target", label: "Privacy Policy", navigateTo: "PrivacyPolicy" },
  {
    icon: "target",
    label: "Terms and Conditions",
    navigateTo: "TermsAndConditions"
  },
  { icon: "settings", label: "Settings", navigateTo: "Home" },
  { icon: "trash-2", label: "Delete Account", navigateTo: "delete" },
  { icon: "log-out", label: "Logout",  navigateTo: "logout" }
]

const DrawerLayout = ({ icon, label, navigateTo, isLastTwoItems, index}) => {
  const navigation = useNavigation()
  const onPressHandler = () => {
    if (navigateTo === 'delete') {
      navigation.navigate('Home', {openBottomSheet: false, deleteAccount: true});
    } 
    else if(navigateTo === 'logout') {
      navigation.navigate('Home', {openBottomSheet: true, deleteAccount: false});
    }else {
      navigation.navigate(navigateTo);
    }
  };

  return (
    <DrawerItem
      icon={() => (
        <Icon name={icon} family="feather" color={"white"} size={20} style={{ marginLeft: 10 }} />
      )}
      label={() => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <AppText style={styles.Text}>
            {label}
          </AppText>
          {!isLastTwoItems && (
            <Icon
              name="chevron-right"
              family="entypo"
              color={theme.darkColors?.white}
              size={20}
              style={{ marginRight: -20 }}
            />
          )}
        </View>
      )}
      labelStyle={{ color: theme.darkColors?.white, marginLeft: -20 }}
      onPress={onPressHandler}
      style={{ backgroundColor: index === 0 ? theme.lightColors.pink : "transparent" }}
    />
  )
}

const DrawerItems = () => {
  return DrawerList.map((el, i) => {
    return (
      <DrawerLayout
        key={i}
        icon={el.icon}
        label={el.label}
        navigateTo={el.navigateTo}
        index={i}
        isLastTwoItems={i >= DrawerList.length - 2}
      />
    )
  })
}
function DrawerContent(props) {
  return (
    <View style={{ flex: 1, backgroundColor: theme.darkColors?.inputBG }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View style={styles.checkIcon}>
            <Image source={Images.AppSettingsIcon} />
          </View>
          <View style={styles.drawerSection}>
            <DrawerItems />
          </View>
        </View>
      </DrawerContentScrollView>
    </View>
  )
}

export default DrawerContent

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1
  },
  drawerSection: {
    marginTop: 15,
    borderBottomWidth: 0
  },
  Text: {
    ...fontGroup.p600,
    marginLeft: -20,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH21,
    color: theme.darkColors?.white,
  },
  checkIcon: {
    alignItems: "center",
    justifyContent: "center"
  }
})
