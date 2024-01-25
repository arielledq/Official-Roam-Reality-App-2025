import React, { useEffect, useMemo, useRef, useState } from "react"
import { AppButton, AppHeader, AppText } from "../../components"

import { Alert, Image, ScrollView, TouchableOpacity, View } from "react-native"
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
import useStyles from "./styles"
import SettingOption from "../../components/settingOption"
import Images from "../../assets/images"
import { logout } from "../../network"
import { useDispatch } from "react-redux"
import { resetState } from "../../redux/Login"
import AppBottomSheet from "../../components/bottomSheet"
import BottomSheet from "@gorhom/bottom-sheet"
import { useNavigation } from "@react-navigation/native"

const Menu: ScreenStackComponent<RootStackParamList, "Menu"> = ({
  
}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ["33%"], [])
  const navigation = useNavigation()

  function handleNavigation(title: string) {
    switch (title) {
      case "archallenges":
        break
      case "chats":
        break
      case "friends":
        break
      case "wallet":
        break
      case "aboutus":
        break
      case "privacypolicy":
        navigation.navigate("PrivacyPolicy")
        break
      case "termsandconditions":
        navigation.navigate("TermsAndConditions")
        break
      case "settings":
        break
    }
  }

  const handleLogOut = () => {
    bottomSheetRef.current?.expand()
  }

  const handleLogOutButton = () => {
    logout()
    dispatch(resetState())
  }

  const handleDeleteAccount = () => {}

  const invite = () => {}

  return (
    <>
      <ScrollView style={_styles.mainContainer}>
        <AppHeader title={""} backgroundColor="transparent" hideBackButton />
        <View style={_styles.checkIcon}>
          <Image source={Images.AppSettingsIcon} />
        </View>
        <View style={_styles.container}>
          <SettingOption
            title={"AR Challenges"}
            onNavigate={() => handleNavigation("archallenges")}
            iconType={"target"}
            rightIconDisabled={false}
          />

          <SettingOption
            title={"Chats"}
            onNavigate={() => handleNavigation("chats")}
            iconType={"message-square"}
            rightIconDisabled={false}
          />

          <SettingOption
            title={"Friends"}
            onNavigate={() => handleNavigation("friends")}
            iconType={"users"}
            rightIconDisabled={false}
          />

          <SettingOption
            title={"Wallet"}
            onNavigate={() => handleNavigation("wallet")}
            iconType={"target"}
            rightIconDisabled={false}
          />

          <SettingOption
            title={"About Us"}
            onNavigate={() => handleNavigation("aboutus")}
            iconType={"info"}
            rightIconDisabled={false}
          />

          <SettingOption
            title={"Invite Friends"}
            onNavigate={invite}
            iconType={"target"}
            rightIconDisabled={false}
          />

          <SettingOption
            title={"Privacy Policy"}
            onNavigate={() => handleNavigation("privacypolicy")}
            iconType={"target"}
            rightIconDisabled={false}
          />

          <SettingOption
            title={"Terms and Conditions"}
            onNavigate={() => handleNavigation("termsandconditions")}
            iconType={"target"}
            rightIconDisabled={false}
          />

          <SettingOption
            title={"Settings"}
            onNavigate={() => handleNavigation("settings")}
            iconType={"settings"}
            rightIconDisabled={false}
          />

          <SettingOption
            title={"Delete Account"}
            onNavigate={handleDeleteAccount}
            iconType={"trash-2"}
            rightIconDisabled={true}
          />

          <SettingOption
            title={"Logout"}
            onNavigate={handleLogOut}
            iconType={"log-out"}
            rightIconDisabled={true}
          />
        </View>

        <AppBottomSheet bottomSheetRef={bottomSheetRef} snaps={snapPoints}>
          {/* Header */}
          <View style={_styles.header}>
            <AppText style={_styles.headerText}>Log Out</AppText>
            <View style={_styles.horizontalLine} />
          </View>

          {/* Button Header */}
          <View style={_styles.buttonheaderContainer}>
            <AppText style={_styles.logoutText}>
              Are you sure you want to Log Out?
            </AppText>
          </View>

          <View style={_styles.buttonContainer}>
            {/* Logout Button */}
            <AppButton
              buttonStyle={_styles.buttonStyle}
              containerStyle={_styles.buttonContainerStyle}
              titleStyle={_styles.buttonTitle}
              title={"Log out"}
              onPress={handleLogOutButton}
            />

            {/* Cancel Button */}
            <TouchableOpacity
              style={_styles.cancelButton}
              onPress={() => bottomSheetRef.current?.close()}
            >
              <AppText style={_styles.cancelButtonText}>Cancel</AppText>
            </TouchableOpacity>
          </View>
        </AppBottomSheet>
      </ScrollView>
    </>
  )
}

export default Menu
