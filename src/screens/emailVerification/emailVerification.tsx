import React from "react"

import { View } from "react-native"

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

const EmailVerification: ScreenStackComponent<
  RootStackParamList,
  "EmailVerification"
> = ({ navigation }) => {
  const _styles = useStyles()
  const navigatetoSuccess = () => {
    navigation.navigate('VerificationSuccess')
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
          onSubmit={navigatetoSuccess}
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
                <AppText style={_styles.otptext}>
                  Didn't receive the OTP?{" "}
                  <AppText
                    style={_styles.resendButton}
                    // onPress={navigateToSignUp}
                  >
                    Click here to resend
                  </AppText>
                  .
                </AppText>
                <AppButton
                  buttonStyle={_styles.buttonStyle}
                  containerStyle={_styles.buttonContainerStyle}
                  title={"Verify Now"}
                  onPress={handleSubmit}
                  // loading={isLoading}
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
