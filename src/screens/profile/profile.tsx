import React from "react"
import { TouchableOpacity, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import useStyles from "./styles"
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
// import { handleErrorMessage } from '../../util/util';
import BackgroundWithImage from "../../components/background"
import AppHeader from "../../components/header"
import { MenuIcon } from "../../assets/svg"
import UserInfoCard from "../../components/userInfoCard"
import { Avatar } from "@rneui/base"
import { AppText } from "../../components"
import StatContainer from "../../components/statContainer"
import BoxStatContainer from "../../components/boxStatContainer"

const Profile: ScreenStackComponent<RootStackParamList, "Profile"> = ({
  navigation
}) => {
  const _styles = useStyles()

  const handleMenuButton = () => {
    return (
      <TouchableOpacity style={_styles.menuIcon}>
        <MenuIcon />
      </TouchableOpacity>
    )
  }

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        containerStyle={_styles.headerContainer}
        titleStyle={_styles.headerStyle}
        title={"Profile"}
        leftComponent={handleMenuButton()}
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        style={_styles.scroll}
      >
        <Avatar size={350} />
        <UserInfoCard name={""} email={""} editAction={() => console.log()} />
        <AppText style={_styles.scoreboard}>SCOREBOARD</AppText>

        <View style={_styles.statContainerStyle}>
          <StatContainer value={"178/1000"} property={"Global Rank"} />
          <StatContainer value={"23"} property={"Points"} />
          <StatContainer value={"23"} property={"TT Rank"} />
        </View>

        <View style={_styles.statContainerStyle}>
          <BoxStatContainer value={50} property={"Sites Viewed"}/>
        </View>

      </KeyboardAwareScrollView>
    </BackgroundWithImage>
  )
}

export default Profile
