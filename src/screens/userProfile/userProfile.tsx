import React, { useEffect, useState } from "react"
import { Keyboard, TouchableOpacity, View } from "react-native"
import { Formik } from "formik"
// import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
// import { VisibleEye, VisibleEyeClose } from '../../assets/svg';
import theme from "../../assets/theme"
import AppButton from "../../components/button"
import useStyles from "./styles"
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
// import { handleErrorMessage } from '../../util/util';
import BackgroundWithImage from "../../components/background"
import AppHeader from "../../components/header"
import { EyeIcon } from "../../assets/svg"


const UserProfile: ScreenStackComponent<
  RootStackParamList,
  "UserProfile"
> = ({ navigation }) => {
  const _styles = useStyles()

  return (
      <BackgroundWithImage style={_styles.mainContainer}>
        <AppHeader title={"Change Password"} backgroundColor="transparent" />
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          contentContainerStyle={_styles.scroll}
        >
        </KeyboardAwareScrollView>
      </BackgroundWithImage>
  )
}

export default UserProfile
