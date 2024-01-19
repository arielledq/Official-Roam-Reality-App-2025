import React, { useState } from "react"

import { Alert, Image, KeyboardTypeOptions, View } from "react-native"

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
import fontGroup from "../../assets/fonts"
import { confirmEmailOtp, sendCode } from "../../network"
import { ForgotPasswordSchema, OTPSchema } from "../../util/ValidationSchemas"
import { handleError } from "../../util/helpers"

const ForgotPassword: ScreenStackComponent<
  RootStackParamList,
  "ForgotPassword"
> = ({ navigation }) => {
  const _styles = useStyles()
  const [emailData, setEmailData] = useState('')
  const [sending, setSending] = useState(false)
  const [codesent, setCodeSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const placeholderText = codesent ? "Enter Code" : "Email Address"
  const buttonText = codesent ? "Submit" : "Send Code"
  const textContentTypeText = codesent ? "oneTimeCode" : "emailAddress"
  const autoCompleteType = codesent ? "sms-otp" : "email"
  const keyboardType = codesent ? "numeric" : "default" as KeyboardTypeOptions
  const handleSendMail = (values, { resetForm }) => {   
    if (!codesent) {   
      setSending(true) 
      sendCode({ email: values.input }).then((res) => {
      if (res.status == 1) {
        resetForm()
        setEmailData(values.input)
        setCodeSent(true)
        Alert.alert(
          'OTP Sent!',
          `An OTP code has been sent to ${values.input}. Please check your email.`,
          [
            { text: 'OK' },
          ]
        );
      } else {
        handleError(res)
      }
      }).finally(() => {
        setSending(false)
      })   
    } else {
      setIsLoading(true)
      confirmEmailOtp({email: emailData, otp: values.input}).then((res) => {
        console.log({ res })
        if (res.status == 1) {
          navigation.navigate("FPChangePassword", {token: res.token, uid: res.uid})
        } else {
          handleError(res)
        }
      }).finally(() => {
        setIsLoading(false)
      })  
    }    
  }

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader title={""} backgroundColor="transparent" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={_styles.scroll}
      >
        <Formik
          initialValues={{
            input: ""
          }}
          onSubmit={(values, { resetForm }) => handleSendMail(values, { resetForm })}
          validationSchema={codesent ? OTPSchema : ForgotPasswordSchema}
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
                <AppText style={[_styles.headerText, { ...fontGroup.ns800 }]}>
                  Forgot Password ?
                </AppText>
                <AppText style={_styles.subHeaderText}>
                  Please enter the email address associated with your account,
                  and we'll send you a link to reset your password
                </AppText>
                <AppInput
                  inputContainerStyle={[_styles.input]}
                  containerStyle={{ marginBottom: -10, marginTop: 10 }}
                  placeholder={placeholderText}
                  placeholderTextColor={theme.darkColors?.grey}
                  value={values.input}
                  autoCapitalize="none"
                  onChangeText={handleChange("input")}
                  onBlur={handleBlur('input')}
                  errorMessage={
                    touched.input && errors?.input ? errors.input : undefined
                  }                  
                  autoCorrect={false}
                  textContentType={textContentTypeText}
                  autoComplete={autoCompleteType}
                  leftIconContainerStyle={{ marginRight: 5 }}
                  keyboardType={keyboardType}
                  leftIcon={<MailIcon />}
                />
                {codesent ? (
                  <AppText style={_styles.alreadyHaveAccount}>
                    Didn't receive the OTP? {""}
                    <AppText style={_styles.SignInLink}>
                      Click here to resend
                    </AppText>
                    .
                  </AppText>
                ) : (
                  <></>
                )}
              </View>
              <AppButton
                buttonStyle={_styles.buttonStyle}
                containerStyle={_styles.buttonContainerStyle}
                title={buttonText}
                onPress={handleSubmit}
                loading={codesent? isLoading : sending}
                disabled={sending}
              />
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </BackgroundWithImage>
  )
}

export default ForgotPassword
