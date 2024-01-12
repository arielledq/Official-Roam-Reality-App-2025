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
import { MailIcon } from "../../assets/svg"
import AppHeader from "../../components/header"
import BackgroundWithImage from "../../components/background"
import theme from "../../assets/theme"
import AppText from "../../components/text"
import Images from "../../assets/images"

const ForgotPassword: ScreenStackComponent<
  RootStackParamList,
  "ForgotPassword"
> = ({ }) => {
  const _styles = useStyles()

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader title={""} backgroundColor="transparent" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={_styles.scroll}
      >
        <Formik
          initialValues={{
            email: ""
          }}
          onSubmit={() => console.log("hello")}
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
                <View style={_styles.appIconContainer}>
                  <Image source={Images.AppIconCircle} />
                </View>
                <AppText style={_styles.headerText}>Forgot Password ?</AppText>
                <AppText style={_styles.subHeaderText}>
                  Please enter the email address associated with your account,
                  and we'll send you a link to reset your password
                </AppText>
                <AppInput
                  inputContainerStyle={[_styles.input]}
                  containerStyle={{ marginBottom: -10, marginTop: 10 }}
                  placeholder={"Email Address"}
                  placeholderTextColor={theme.darkColors?.grey}
                  value={values.email}
                  autoCapitalize="none"
                  onChangeText={handleChange("email")}
                  // onBlur={handleBlur('username')}
                  errorMessage={
                    touched.email && errors?.email ? errors.email : undefined
                  }
                  autoCorrect={false}
                  textContentType="emailAddress"
                  autoComplete="email"
                  leftIconContainerStyle={{ marginRight: 5 }}
                  leftIcon={<MailIcon />}
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
              </View>
              <AppButton
                buttonStyle={_styles.buttonStyle}
                containerStyle={_styles.buttonContainerStyle}
                title={"Send Link"}
                // onPress={handleSubmit}
                // loading={isLoading}
              />
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </BackgroundWithImage>
  )
}

export default ForgotPassword
