import React from "react"
import { ImageBackground, TouchableOpacity, View } from "react-native"
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
import Images from "../../assets/images"
import { Avatar } from "@rneui/base"


const Profile: ScreenStackComponent<
  RootStackParamList,
  "Profile"
> = ({ navigation }) => {
  const _styles = useStyles()

  const handleMenuButton = () => {
    return (
      <TouchableOpacity style={_styles.menuIcon}>
        <MenuIcon />
      </TouchableOpacity>    
    );
  };

  return (
      <BackgroundWithImage style={_styles.mainContainer}>
        <AppHeader titleStyle={_styles.headerStyle} title={"Profile"} backgroundColor="transparent" leftComponent={handleMenuButton()} />
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          style={_styles.scroll}
        >
          <Avatar 
          size={150}
          />
          <ImageBackground source={Images.GradientRectBG} style={_styles.imageBackground}>
               <UserInfoCard name={""} email={""} editAction={() => console.log()} />
          </ImageBackground>
          
        </KeyboardAwareScrollView>
      </BackgroundWithImage>
  )
}

export default Profile
