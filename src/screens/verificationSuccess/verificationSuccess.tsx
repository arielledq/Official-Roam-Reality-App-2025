import React from "react"

import { Image, View } from "react-native"

import { Formik } from "formik"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import useStyles from "./styles"
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
import AppButton from "../../components/button"
import AppInput from "../../components/input"
import { CubeIcon } from "../../assets/svg"
import AppHeader from "../../components/header"
import BackgroundWithImage from "../../components/background"
import theme from "../../assets/theme"
import AppText from "../../components/text"
import Images from "../../assets/images"
import { useNavigation } from "@react-navigation/native"

const VerificationSuccess: ScreenStackComponent<
  RootStackParamList,
  "VerificationSuccess"
> = () => {
  const _styles = useStyles()
  const navigation = useNavigation()

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader title={""} backgroundColor="transparent" hideBackButton />
      <View style={_styles.container}>
        <Image style={_styles.checkIcon} source={Images.CircleCheck} />
        <AppText style={_styles.headerText}>Congratulations!</AppText>
        <AppText style={_styles.subHeaderText}>
          🎉 Hooray! Your email address has been successfully verified.
        </AppText>
      </View>
      <AppButton
        buttonStyle={_styles.buttonStyle}
        containerStyle={_styles.buttonContainerStyle}
        title={"Continue"}
        onPress={() => navigation.navigate('Login')}
      />
    </BackgroundWithImage>
  )
}

export default VerificationSuccess
