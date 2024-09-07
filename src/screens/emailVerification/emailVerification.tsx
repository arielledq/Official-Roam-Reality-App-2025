import React, { useState } from "react"

import { Alert, View } from "react-native"

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
import { useNavigation, useRoute } from "@react-navigation/native"
import { confirmCode, sendCode } from "../../network"
import { handleError, showMessage } from "../../util/helpers"
import { useDispatch } from "react-redux"
import { updateUserData } from "../../redux/Login"
import Timer from "../../components/timer"

const EmailVerification: ScreenStackComponent<
  RootStackParamList,
  "EmailVerification"
> = () => {
  const _styles = useStyles()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const route = useRoute()
  const email = route?.params?.email
  const data = route?.params?.data
  const profile = route?.params?.profile
  const [isLoading, setIsLoading] = useState(false)
  const [timerVisible, setTimerVisible] = useState(false)

  const navigatetoSuccess = () => {
    if (profile) {
      navigation.replace('VerificationSuccessC', { ChangePassword: false, data, profile })
    } else {
      navigation.replace('VerificationSuccess', { ChangePassword: false, data, profile })
    }
  }

  const handleResend = () => {
    sendCode({ email }).then(res => {
      if (res.status == 1) {
        setTimerVisible(true)
        showMessage('Code sent successfully')
      } else {
        handleError(res)
      }
    })
  }

  const verifyEmail = (values) => {
    if (!values.code) {
      showMessage('Please enter the verification code', 'error')
      return
    }
    setIsLoading(true)
    confirmCode({ email: email, otp: values.code }).then(res => {
      console.log({ res })
      if (res.status == 1) {
        navigatetoSuccess()
      } else {
        handleError(res)
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const handleSkip = () => {
    // login user
    if (profile) {
      navigation.goBack()
    }
    else {
      dispatch(updateUserData(data))
    }
  }

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader title={"Email Verification"} backgroundColor="transparent" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={_styles.scroll}
      >
        <Formik
          initialValues={{
            code: ""
          }}
          onSubmit={values => {
            verifyEmail(values)
          }}
        // validationSchema={validationSchema}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched
          }) => (
            <View style={_styles.formContainer}>
              <View style={_styles.childView}>
                <AppText style={_styles.headerText}>Verify Your Email</AppText>
                <AppText style={_styles.subHeaderText}>
                  🎉 Congratulations on taking the first step! To ensure the
                  security of your account, we just need to verify your email
                  address
                </AppText>
                <AppInput
                  inputContainerStyle={[_styles.input]}
                  containerStyle={{ marginTop: 20 }}
                  placeholder={"Email Verification code"}
                  placeholderTextColor={theme.darkColors?.grey}
                  value={values.code}
                  autoCapitalize="none"
                  onChangeText={handleChange("code")}
                  // onBlur={handleBlur('username')}
                  errorMessage={
                    touched.code && errors?.code ? errors.code : undefined
                  }
                  autoCorrect={false}
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  leftIconContainerStyle={{ marginRight: 5 }}
                  keyboardType="numeric"
                  leftIcon={<CubeIcon />}
                />

                {timerVisible
                  ? <Timer callback={
                    () => { setTimerVisible(false) }
                  } />
                  :
                  <AppText style={_styles.otptext}>
                    {`Didn't receive the Code?  `}
                    <AppText
                      style={_styles.resendButton}
                      onPress={handleResend}
                    >
                      Click here to resend
                    </AppText>
                  </AppText>}
                <AppButton
                  buttonStyle={_styles.buttonStyle}
                  containerStyle={[_styles.buttonContainerStyle]}
                  title={"Skip"}
                  onPress={handleSkip}
                  disabled={isLoading}
                />
                <AppButton
                  buttonStyle={_styles.buttonStyle}
                  containerStyle={[_styles.buttonContainerStyle, { marginTop: 10 }]}
                  title={"Verify Now"}
                  onPress={handleSubmit}
                  loading={isLoading}
                />

              </View>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </BackgroundWithImage>
  )
}

export default EmailVerification
