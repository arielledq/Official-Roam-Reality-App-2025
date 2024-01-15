import React, { useState } from "react"

import { Alert, Image, View } from "react-native"

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
import { sendCode } from "../../network"
import { ForgotPasswordSchema } from "../../util/ValidationSchemas"
import { handleError } from "../../util/helpers"

const ForgotPassword: ScreenStackComponent<
  RootStackParamList,
  "ForgotPassword"
> = ({ }) => {
  const _styles = useStyles()
  const [sending, setSending] = useState(false)

  const handleSendMail = (values) => {
    setSending(true)
    sendCode({ email: values.email }).then((res) => {
      if (res.status == 1) {
        Alert.alert('', "Code sent successfully")
      } else {
        handleError(res)
      }
    }).finally(() => {
      setSending(false)
    })
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
            email: ""
          }}
          onSubmit={(values) => handleSendMail(values)}
          validationSchema={ForgotPasswordSchema}
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
                <AppText style={[_styles.headerText, { ...fontGroup.ns800 }]}>Forgot Password ?</AppText>
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
                  // onBlur={handleBlur('email')}
                  errorMessage={
                    touched.email && errors?.email ? errors.email : undefined
                  }
                  autoCorrect={false}
                  textContentType="emailAddress"
                  autoComplete="email"
                  leftIconContainerStyle={{ marginRight: 5 }}
                  leftIcon={<MailIcon />}
                />
              </View>
              <AppButton
                buttonStyle={_styles.buttonStyle}
                containerStyle={_styles.buttonContainerStyle}
                title={"Send Link"}
                onPress={handleSubmit}
                loading={sending}
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
