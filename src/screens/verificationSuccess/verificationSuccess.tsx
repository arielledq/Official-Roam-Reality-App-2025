import React from "react"
import { Image, View } from "react-native"
import useStyles from "./styles"
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
import AppButton from "../../components/button"
import AppHeader from "../../components/header"
import BackgroundWithImage from "../../components/background"
import AppText from "../../components/text"
import Images from "../../assets/images"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useDispatch } from "react-redux"
import { updateUserData } from "../../redux/Login"

const VerificationSuccess: ScreenStackComponent<
  RootStackParamList,
  "VerificationSuccess"
> = () => {
  const _styles = useStyles()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const route = useRoute()
  const data = route?.params?.data
  const ChangePassword = route?.params?.ChangePassword
  const successText = ChangePassword ? "password has been successfully changed" : "email address has been successfully verified"
  const handleContinue = () => {
    if (ChangePassword) {
      navigation.navigate('Login')
    } else {
      data.user.user_profile.is_verified = true
      dispatch(updateUserData(data))
    }
  }
  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader title={""} backgroundColor="transparent" hideBackButton />
      <View style={_styles.container}>
        <Image style={_styles.checkIcon} source={Images.CircleCheck} />
        <AppText style={_styles.headerText}>Congratulations!</AppText>
        <AppText style={_styles.subHeaderText}>
          🎉 Hooray! Your {successText}.
        </AppText>
      </View>
      <AppButton
        buttonStyle={_styles.buttonStyle}
        containerStyle={_styles.buttonContainerStyle}
        title={"Continue"}
        onPress={handleContinue}
      />
    </BackgroundWithImage>
  )
}

export default VerificationSuccess
