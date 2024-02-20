import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import BackgroundWithImage from "../../components/background"
import theme from "../../assets/theme"
import { AppHeader, AppText } from "../../components"
import Icon from "../../components/Icon"
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils"
import { useNavigation } from "@react-navigation/native"
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager
} from "react-native-fbsdk-next"
import { setItem } from "../../util/helpers"

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
      <Icon
        name="chevron-right"
        family="entypo"
        color={theme.darkColors?.white}
        size={24}
      />
    </TouchableOpacity>
  )
}

function SocialAccountItem({ label, onPress, icon }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.darkColors?.statBG,
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
      <TouchableOpacity
        onPress={onPress}
        name="chevron-right"
        family="entypo"
        color={theme.darkColors?.white}
        size={24}
      >
        <AppText style={styles.linkNow}>Link now</AppText>
      </TouchableOpacity>
    </View>
  )
}

const Settings = () => {
  const navigation = useNavigation()

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword")
  }
  const handlePrivacy = () => {
    navigation.navigate("Privacy")
  }

  const fbLink = (resCallBack) => {
    LoginManager.logOut()
    return LoginManager.logInWithPermissions(["public_profile", "email"]).then(
      result => {
        console.log("result:", result)
        if (
          result.declinedPermissions &&
          result.declinedPermissions.includes("email")
        ) {
          resCallBack({ message: "Email is required" })
        } else if (result.isCancelled) {
          console.log("error")
        } else {
          const infoRequest = new GraphRequest(
            "/me?fields=id,name,email,picture",
            null,
            resCallBack
          )
          new GraphRequestManager().addRequest(infoRequest).start()
          AccessToken.getCurrentAccessToken().then(async(data) => {
            const accessToken = data.accessToken.toString();
            await setItem("fbToken", accessToken)
          })
        }
      },
      function (error) {
        console.log("Login fail with error: " + error)
      }
    )
  }

  const onFbLink = async () => {
    try {
      await fbLink(_resInfoCallback)
    } catch (e) {
      console.log("error raised", e)
    }
  }

  const _resInfoCallback = (error, result) => {
      if (error) {
        console.log("login has error: " + error)
        return
      }  
      else {
        const userdata = result;
        console.log("userData result:", userdata)
    }
  }
  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader title={"Settings"} backgroundColor="transparent" />
      <SettingsItem
        icon="lock"
        label={"Change password"}
        onPress={handleChangePassword}
      />
      <SettingsItem icon="privacy" label={"Privacy"} onPress={handlePrivacy} />
      <AppText style={styles.socialAccount}>Social Accounts</AppText>
      <SocialAccountItem
        icon="FacebookIcon"
        label={"Facebook"}
        onPress={onFbLink}
      />
      <SocialAccountItem
        icon="Instagram"
        label={"Instagram"}
        onPress={handlePrivacy}
      />
      <SocialAccountItem
        icon="TikTok"
        label={"TikTok"}
        onPress={handlePrivacy}
      />
    </BackgroundWithImage>
  )
}

export default Settings

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
  },
  socialAccount: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    ...fontGroup.ns600,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH24
  },
  linkNow: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH21,
    color: theme.darkColors?.inputBlue
  }
})
