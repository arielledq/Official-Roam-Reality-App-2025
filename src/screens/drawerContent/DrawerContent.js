import React, { useState } from "react"
import { View, StyleSheet, Image, Alert, TouchableOpacity } from "react-native"
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer"
import theme from "../../assets/theme"
import { useNavigation } from "@react-navigation/native"
import Images from "../../assets/images"
import Icon from "../../components/Icon"
import AppText from "../../components/text"
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils"
import ConfirmationPopUp from "../../components/confirmationPopUp"
import { deleteAccount, logout } from "../../network"
import { useDispatch } from "react-redux"
import { resetState } from "../../redux/Login"
import LinearGradient from "react-native-linear-gradient"
import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { removeItem, showMessage } from "../../util/helpers"

const DrawerList = [
  { icon: "target", label: "AR Photo Challenges", navigateTo: "Home" },
  { icon: "message-square", label: "Chats", navigateTo: "Home" },
  { icon: "users", label: "Friends", navigateTo: "Friends" },
  { icon: "Wallet", label: "Wallet", navigateTo: "Home" },
  { icon: "info", label: "About Us", navigateTo: "Home" },
  { icon: "Invite", label: "Invite Friends", navigateTo: "InviteFriends" },
  { icon: "Folder", label: "Privacy Policy", navigateTo: "PrivacyPolicy" },
  { icon: "info", label: "Send Feedback", navigateTo: "SendFeedback" },
  {
    icon: "Folder",
    label: "Terms and Conditions",
    navigateTo: "TermsAndConditions"
  },
  { icon: "Contact", label: "Contact Us", navigateTo: "ContactUs" },
  { icon: "Question", label: "FAQ", navigateTo: "FAQ" },
  { icon: "settings", label: "Settings", navigateTo: "Settings" },
  { icon: "trash-2", label: "Delete Account", navigateTo: "delete" },
  { icon: "log-out", label: "Logout", navigateTo: "logout" }
]

const DrawerLayout = ({
  icon,
  label,
  navigateTo,
  isLastTwoItems,
  index,
  onPress
}) => {
  function getIconFamily(icon) {
    const customIcons = ["Contact", "Question", "Folder", "Invite", "Wallet"]
    return customIcons.includes(icon) ? "custom" : "feather"
  }
  const renderDrawerItem = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Icon
          name={icon}
          family={getIconFamily(icon)}
          color={"white"}
          size={20}
        />
        <AppText style={styles.Text}>{label}</AppText>
        {!isLastTwoItems && (
          <Icon
            name="chevron-right"
            family="entypo"
            color={theme.darkColors?.white}
            size={20}
          />
        )}
      </View>
    )
  }
  return (
    <>
      {index === 0 ? (
        <TouchableOpacity onPress={() => onPress(navigateTo)}>
          <LinearGradient
            colors={["#9003E0", "#1158F4", "#9003E0"]}
            style={styles.linearGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {renderDrawerItem()}
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => onPress(navigateTo)}
          style={styles.linearGradient}
        >
          {renderDrawerItem()}
        </TouchableOpacity>
      )}
    </>
  )
}

const DrawerItems = ({ onPress }) => {
  return DrawerList.map((el, i) => {
    return (
      <DrawerLayout
        key={i}
        icon={el.icon}
        label={el.label}
        navigateTo={el.navigateTo}
        index={i}
        isLastTwoItems={i >= DrawerList.length - 2}
        onPress={v => onPress(el.navigateTo)}
      />
    )
  })
}
function DrawerContent(props) {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const [popupDetails, setPopupDetails] = useState({})
  const [isConfirmationVisible, setConfirmationVisible] = useState(false)
  const onPressHandler = navigateTo => {
    if (navigateTo === "delete") {
      setPopupDetails({
        title: "Delete Account",
        description: "Are you sure you want to delete your account?",
        cancelText: "Cancel"
      })
      setConfirmationVisible(true)
    } else if (navigateTo === "logout") {
      setPopupDetails({
        title: "Log Out",
        description: "Are you sure you want to logout?",
        cancelText: "Cancel"
      })
      setConfirmationVisible(true)
    } else {
      navigation.navigate(navigateTo)
    }
  }
  const handleLogOutButton = async () => {
    await GoogleSignin.revokeAccess().catch(err => console.log(err))
    await GoogleSignin.signOut().catch(err => console.log(err))
    await removeItem("fbToken")
    await removeItem("instaToken")
    await removeItem("tiktokToken")
    logout()
    dispatch(resetState())
  }
  const closeModalHandler = () => {
    setConfirmationVisible(false)
  }
  const handleDeleteAccount = () => {
    deleteAccount().then(res => {
      console.log({ res })
      if (res.status == 1) {
        handleLogOutButton()
        showMessage("Your account has been deleted successfully")
      } else {
        showMessage(res.message.error, "error")
      }
    })
  }
  return (
    <>
      <View style={{ flex: 1, backgroundColor: theme.darkColors?.drawerBG }}>
        <DrawerContentScrollView {...props}>
          <View style={styles.drawerContent}>
            <View style={styles.checkIcon}>
              <Image source={Images.AppSettingsIcon} />
            </View>
            <View style={styles.drawerSection}>
              <DrawerItems onPress={v => onPressHandler(v)} />
            </View>
          </View>
        </DrawerContentScrollView>
      </View>
      <ConfirmationPopUp
        title={popupDetails?.title}
        description={popupDetails?.description}
        confirmText={popupDetails?.title}
        confirmHandler={
          popupDetails?.title == "Log Out"
            ? handleLogOutButton
            : handleDeleteAccount
        }
        isVisible={isConfirmationVisible}
        cancelText={"Cancel"}
        cancelHandler={closeModalHandler}
      />
    </>
  )
}

export default DrawerContent

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingBottom: 20
  },
  drawerSection: {
    marginTop: 15,
    borderBottomWidth: 0
  },
  Text: {
    ...fontGroup.p600,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH21,
    color: theme.darkColors?.white,
    marginLeft: 10,
    flex: 1
  },
  checkIcon: {
    alignItems: "center",
    justifyContent: "center"
  },
  linearGradient: {
    marginLeft: 20,
    marginRight: 10,
    marginTop: 13,
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "flex-start"
  }
})
