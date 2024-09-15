import React, { useRef, useState } from "react"

import { Alert, Keyboard, View } from "react-native"

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
import Icon from "../../components/Icon"
import { signUp } from "../../network"
import fontGroup from "../../assets/fonts"
import { handleError, showMessage } from "../../util/helpers"
import { SignUpSchema } from "../../util/ValidationSchemas"
import SocialSignin from "../../components/socialSignin"
import { useNavigation } from "@react-navigation/native"
import { useDispatch } from "react-redux"
import { updateAsOldUser } from "../../redux/Persist"

const SignUp: ScreenStackComponent<RootStackParamList, "SignUp"> = () => {
  const _styles = useStyles()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const [passwordVisibility, setPasswordVisibility] = useState(true)
  const [rePasswordVisibility, setRePasswordVisibility] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const resData = useRef({})

  const navigateToVerifyMail = (email, resetForm) => {
    navigation.navigate('EmailVerification', { email: email.toLowerCase(), data: resData.current })
    resetForm()
  }

  const handleSignup = (v, resetForm) => {
    setIsLoading(true)
    signUp({
      email: v.email.toLowerCase(),
      password: v.password,
    }).then(res => {
      console.log({ res })
      if (res.status == 1) {
        resData.current = res
        dispatch(updateAsOldUser())
        showMessage('Please verify your email to continue', 'success', 'Registration Successful')
        navigateToVerifyMail(v.email, resetForm)
      } else {
        handleError(res)
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const navigateToLogin = () => {
    navigation.navigate('Login')
  }

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader title={""} backgroundColor="transparent" hideBackButton />
      <AppText style={[_styles.headerText, { ...fontGroup.ns900 }]}>Sign up</AppText>
      <AppText style={_styles.subHeaderText}>
        Create an account to ROAM a new dimension with captivating AR
        experiences.
      </AppText>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always">
        <Formik
          initialValues={{
            email: "",
            password: "",
            confirmPassword: ""
          }}
          onSubmit={(v, { resetForm }) => handleSignup(v, resetForm)}
          validationSchema={SignUpSchema}
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
                maxLength={100}
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
                maxLength={20}
                autoCapitalize="none"
                leftIcon={<LockIcon />}
                rightIcon={
                  <Icon onPress={() => {
                    setPasswordVisibility(p => !p)
                  }} name={passwordVisibility ? 'eye' : 'eye-off'} family='feather' color={'#9CA3AF'} size={23} />
                }
              />
              <AppInput
                inputContainerStyle={[_styles.input]}
                containerStyle={{ marginTop: -10, marginBottom: -15 }}
                secureTextEntry={rePasswordVisibility && true}
                onSubmitEditing={Keyboard.dismiss}
                placeholder="Confirm Password"
                placeholderTextColor={theme.darkColors?.grey}
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur('confirmPassword')}
                errorMessage={
                  touched.confirmPassword && errors?.confirmPassword
                    ? errors.confirmPassword
                    : undefined
                }
                maxLength={20}
                autoCapitalize="none"
                leftIcon={<LockIcon />}
                rightIcon={
                  <Icon onPress={() => {
                    setRePasswordVisibility(p => !p)
                  }} name={rePasswordVisibility ? 'eye' : 'eye-off'} family='feather' color={'#9CA3AF'} size={23} />
                }
              />

              {/* login Button */}
              <AppButton
                buttonStyle={_styles.buttonStyle}
                containerStyle={_styles.buttonContainerStyle}
                title={"Sign Up"}
                onPress={handleSubmit}
                loading={isLoading}
              />

              {/* Terms and Conditions */}
              <AppText style={_styles.termsAndConditionstext}>
                {` By clicking "Sign up" you agree to our `}
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
        Already have an account? {""}
        <AppText
          style={_styles.SignInLink}
          onPress={navigateToLogin}
        >
          Sign In
        </AppText>
      </AppText>
    </BackgroundWithImage>
  )
}

export default SignUp
