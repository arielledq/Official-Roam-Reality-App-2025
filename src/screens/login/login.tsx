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
  LockIcon,
  MailIcon
} from "../../assets/svg"
import AppHeader from "../../components/header"
import BackgroundWithImage from "../../components/background"
import theme from "../../assets/theme"
import AppText from "../../components/text"
import { login } from '../../network'
import { useDispatch } from "react-redux"
import { updateUserData } from "../../redux/Login"
import { useNavigation } from "@react-navigation/native"
import { SigninSchema } from "../../util/ValidationSchemas"
import Icon from "../../components/Icon"
import { handleError } from "../../util/helpers"
import SocialSignin from "../../components/socialSignin"

const Login: ScreenStackComponent<RootStackParamList, "Login"> = ({
  navigation
}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  // const navigation = useNavigation()
  const [passwordVisibility, setPasswordVisibility] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  console.log({ login })

  const handleLogin = (v) => {
    setIsLoading(true)
    // dispatch(updateUserData())
    login({
      username: v.email.toLowerCase(),
      password: v.password
    }).then(res => {
      console.log({ res })
      if (res.status == 1) {
        dispatch(updateUserData(res))
      } else {
        handleError(res)
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const navigateToResetPassword = () => {
    navigation.navigate("ForgotPassword")
  }

  const navigateToSignUp = () => {
    navigation.navigate("SignUp")
  }

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader title={""} backgroundColor="transparent" hideBackButton />
      <AppText style={[_styles.headerText]}>Welcome back!</AppText>
      <AppText style={_styles.subHeaderText}>
        Create an account to ROAM a new dimension with captivating AR
        experiences.
      </AppText>
      <KeyboardAwareScrollView style={{ flex: 1 }} nestedScrollEnabled={false} keyboardShouldPersistTaps="always">
        <Formik
          initialValues={{
            email: "",
            password: ""
          }}
          onSubmit={(v) => handleLogin(v)}
          validationSchema={SigninSchema}
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
                onBlur={handleBlur('email')}
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
                onBlur={handleBlur('password')}
                errorMessage={
                  touched.password && errors?.password
                    ? errors.password
                    : undefined
                }
                autoCapitalize="none"
                leftIcon={<LockIcon />}
                rightIcon={
                  <Icon onPress={() => {
                    setPasswordVisibility(p => !p)
                  }} name={passwordVisibility ? 'eye' : 'eye-off'} family='feather' color={'#9CA3AF'} size={23} />
                }
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
                loading={isLoading}
                disabled={isLoading}
              />

              {/* Terms and Conditions */}
              <AppText style={_styles.termsAndConditionstext}>
                {` By clicking "Sign in" you agree to our `}
                <AppText
                  style={_styles.TandCLink}
                  onPress={() => {
                    navigation.navigate('TermsAndConditions')
                  }}
                >
                  {`Terms and Conditions `}
                </AppText>and
                <AppText
                  style={_styles.TandCLink}
                  onPress={() => {
                    navigation.navigate('PrivacyPolicy')
                  }}
                >
                  {` Privacy Policy.`}
                </AppText>
              </AppText>

              {/* social sign in options */}
              <SocialSignin
                setLoading={setIsLoading}
              />

            </View>
          )}
        </Formik>

      </KeyboardAwareScrollView>
      <AppText style={_styles.alreadyHaveAccount}>
        Don’t have an account? {""}
        <AppText
          style={_styles.SignInLink}
          onPress={navigateToSignUp}
        >
          Sign Up
        </AppText>
      </AppText>

    </BackgroundWithImage>
  )
}

export default Login
