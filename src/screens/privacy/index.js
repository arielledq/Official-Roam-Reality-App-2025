import React, { useState } from "react"
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import BackgroundWithImage from "../../components/background"
import theme from "../../assets/theme"
import { AppHeader, AppText } from "../../components"
import Icon from "../../components/Icon"
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils"
import { useNavigation } from "@react-navigation/native"
import ToggleSwitch from "toggle-switch-react-native"

function PrivacyToggle({ label, value, setter, icon }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.darkColors?.inputBlue,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginHorizontal: 25,
        marginVertical: 10,
        borderRadius: 8
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <Icon name={icon} family="custom" size={24} />
        <Text style={styles.text}>{label}</Text>
      </View>
      <ToggleSwitch
        isOn={value}
        onColor={theme?.lightColors?.purple}
        offColor={theme?.lightColors?.toggleOff}
        size="medium"
        onToggle={isOn => {
          setter(isOn)
        }}
      />
    </View>
  )
}

const Privacy = () => {
  const navigation = useNavigation()
  const [notificationToggles, setNotificationToggles] = useState({
    newsAndUpdates: true,
    arRouteNearby: true,
    rallyEventUpdates: true,
    levelRankingUpgrades: true,
    friendRequest: true
  })
  const [Permissions, setPermissions] = useState({
    camera: true,
    microphone: true
  })

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword")
  }
  const handlePrivacy = () => {
    navigation.navigate("Privacy")
  }
  const handleNotificationToggle = (key, value) => {
    setNotificationToggles({
      ...notificationToggles,
      [key]: value
    })
  }
  const handlePermissionToggle = (key, value) => {
    setPermissions({
      ...Permissions,
      [key]: value
    })
  }
  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader title={"Privacy"} backgroundColor="transparent" />
      <AppText
        style={{
          ...fontGroup.ns400,
          fontSize: FontSizes.S20,
          marginLeft: 25,
          paddingVertical: 10
        }}
      >
        Notification Settings
      </AppText>
      <PrivacyToggle
        icon="file"
        label="News and Updates"
        value={notificationToggles.newsAndUpdates}
        setter={value => handleNotificationToggle("newsAndUpdates", value)}
      />
      <PrivacyToggle
        icon={"star"}
        label="AR Route Nearby"
        value={notificationToggles.arRouteNearby}
        setter={value => handleNotificationToggle("arRouteNearby", value)}
      />
      <PrivacyToggle
        icon="flag"
        label="Rally Event Updates"
        value={notificationToggles.rallyEventUpdates}
        setter={value => handleNotificationToggle("rallyEventUpdates", value)}
      />
      <PrivacyToggle
        icon="scores"
        label="Level/Ranking Upgrades"
        value={notificationToggles.levelRankingUpgrades}
        setter={value =>
          handleNotificationToggle("levelRankingUpgrades", value)
        }
      />
      <PrivacyToggle
        icon="user"
        label="Friend Request"
        value={notificationToggles.friendRequest}
        setter={value => handleNotificationToggle("friendRequest", value)}
      />
      {/* <AppText
        style={{
          ...fontGroup.ns400,
          fontSize: FontSizes.S20,
          marginLeft: 25,
          marginTop: 10
        }}
      >
        Permissions
      </AppText>
      <AppText
        onPress={() => {
          Linking.openSettings()
        }}
        style={{
          ...fontGroup.ns400,
          fontSize: FontSizes.S16,
          marginTop: 10,
          color: theme?.lightColors?.yellow,
          textAlign: 'center',
          marginHorizontal: 25,
          paddingVertical: 20
        }}
      >
        Manage your app permissions in app settings, click here
      </AppText> */}
    </BackgroundWithImage>
  )
}

export default Privacy

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme?.colors?.inputBG
  },
  text: {
    ...fontGroup.ns600,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH21,
    color: theme.darkColors?.white,
    marginLeft: 15
  }
})
