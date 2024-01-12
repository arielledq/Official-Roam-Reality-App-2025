import React, { useState } from "react"

import { Keyboard, TouchableOpacity, View } from "react-native"

import { Formik } from "formik"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import useStyles from "./styles"
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
import AppButton from "../../components/button"
import AppInput from "../../components/input"
import {
  AppleIcon,
  EyeIcon,
  FacebookIcon,
  GoogleIcon,
  LockIcon,
  MailIcon
} from "../../assets/svg"
import AppHeader from "../../components/header"
import BackgroundWithImage from "../../components/background"
import theme from "../../assets/theme"
import AppText from "../../components/text"
import { DividerWithText } from "../../components"
import { login } from '../../network'
import { useDispatch, useSelector } from "react-redux"
import { updateUserData } from "../../redux/Login"
import { useNavigation } from "@react-navigation/native"


const Login: ScreenStackComponent<RootStackParamList, "Login"> = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const login = useSelector(state => state.login)
  const [passwordVisibility, setPasswordVisibility] = useState(true)
  console.log({ login })

  const handleLogin = (v) => {
    dispatch(updateUserData({
      email: v.email,
      password: v.password
    }))
    // login({
    //   username: v.email,
    //   password: v.password
    // }).then(res => {
    //   console.log({ res })
    // }).catch(err => {
    //   console.log({ err })
    // })
  }

  const navigateToResetPassword = () => {
    navigation.navigate("ForgotPassword")
  }

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader title={""} backgroundColor="transparent" hideBackButton />
      <AppText style={_styles.headerText}>Welcome back!</AppText>
      <AppText style={_styles.subHeaderText}>
        Create an account to ROAM a new dimension with captivating AR
        experiences.
      </AppText>
      <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
        <Formik
          initialValues={{
            email: "",
            password: ""
          }}
          onSubmit={(v) => handleLogin(v)}
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
            <View style={_styles.container}>
              <AppInput
                inputContainerStyle={[_styles.input]}
                containerStyle={{ marginBottom: -10 }}
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
              <AppInput
                inputContainerStyle={[_styles.input]}
                secureTextEntry={passwordVisibility && true}
                onSubmitEditing={Keyboard.dismiss}
                placeholder="Password"
                placeholderTextColor={theme.darkColors?.grey}
                value={values.password}
                onChangeText={handleChange("password")}
                // onBlur={handleBlur('password')}
                errorMessage={
                  touched.password && errors?.password
                    ? errors.password
                    : undefined
                }
                autoCapitalize="none"
                leftIcon={<LockIcon />}
                rightIcon={<EyeIcon />}
              />

              {/* forgot password */}
              <AppText
                style={_styles.fpText}
                onPress={navigateToResetPassword}
              >
                Forgot Password?
              </AppText>

              {/* login Button */}
              <AppButton
                buttonStyle={_styles.buttonStyle}
                containerStyle={_styles.buttonContainerStyle}
                title={"Sign In"}
                onPress={handleSubmit}
              // loading={isLoading}
              />

              {/* Terms and Conditions */}
              <AppText style={_styles.termsAndConditionstext}>
                By clicking "Sign in" you agree to our {""}
                <AppText
                  style={_styles.TandCLink}
                // onPress={navigateToSignUp}
                >
                  Terms and Conditions.
                </AppText>
              </AppText>

              {/* divider */}
              <DividerWithText containerStyle={_styles.divider} label={"OR"} />

              {/* social sign in options */}
              <View style={_styles.socialSUcontainer}>
                <TouchableOpacity>
                  <FacebookIcon style={_styles.socialSIicon} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <GoogleIcon style={_styles.socialSIicon} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <AppleIcon style={_styles.socialSIicon} />
                </TouchableOpacity>
              </View>

            </View>
          )}
        </Formik>
        <AppText style={_styles.alreadyHaveAccount}>
          Already have an account? {""}
          <AppText
            style={_styles.SignInLink}
          // onPress={navigateToSignUp}
          >
            Sign In
          </AppText>
        </AppText>
      </KeyboardAwareScrollView>

    </BackgroundWithImage>
  )
}

export default Login
