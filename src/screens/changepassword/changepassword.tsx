import React, { useState } from "react"
import { Keyboard, TouchableOpacity, View } from "react-native"
import { Formik } from "formik"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import theme from "../../assets/theme"
import AppButton from "../../components/button"
import useStyles from "./styles"
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
import BackgroundWithImage from "../../components/background"
import { validationSchema } from "./validation"
import AppHeader from "../../components/header"
import AppInput from "../../components/input"
import { EyeIcon, LockIcon } from "../../assets/svg"

type ChangePasswordFormValues = {
  oldPassword: string,
  newPassword: string,
  confirmnewPassword: string
}

const ChangePassword: ScreenStackComponent<
  RootStackParamList,
  "ChangePassword"
> = ({ navigation }) => {
  const [id, setId] = useState(0)
  const _styles = useStyles()
  const [oldpasswordVisibility, setOldPasswordVisibility] = useState(true)
  const [newpasswordVisibility, setNewPasswordVisibility] = useState(true)
  const [confirmnewpasswordVisibility, setConfirmNewPasswordVisibility] =
    useState(true)

  function handleChangePassword(values: ChangePasswordFormValues) {}

  function eyeIcon() {
    return (
      <TouchableOpacity
        onPress={() => setOldPasswordVisibility(!oldpasswordVisibility)}
      >
        {oldpasswordVisibility ? <EyeIcon /> : <EyeIcon />}
      </TouchableOpacity>
    )
  }

  function eyeNIcon() {
    return (
      <TouchableOpacity
        onPress={() => setNewPasswordVisibility(!newpasswordVisibility)}
      >
        {newpasswordVisibility ? <EyeIcon /> : <EyeIcon />}
      </TouchableOpacity>
    )
  }

  function eyeCIcon() {
    return (
      <TouchableOpacity
        onPress={() =>
          setConfirmNewPasswordVisibility(!confirmnewpasswordVisibility)
        }
      >
        {confirmnewpasswordVisibility ? <EyeIcon /> : <EyeIcon />}
      </TouchableOpacity>
    )
  }

  return (
    <>
      <BackgroundWithImage style={_styles.mainContainer}>
        <AppHeader title={"Change Password"} backgroundColor="transparent" />
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          contentContainerStyle={_styles.scroll}
        >
          <Formik
            initialValues={{
              oldPassword: "",
              newPassword: "",
              confirmnewPassword: ""
            }}
            onSubmit={handleChangePassword}
            validationSchema={validationSchema}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <View style={_styles.container}>
                <View style={_styles.chidlView}>
                  <AppInput
                    inputContainerStyle={[_styles.input]}
                    secureTextEntry={oldpasswordVisibility}
                    placeholder="Old Password"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={theme.darkColors?.grey}
                    value={values.oldPassword}
                    onChangeText={handleChange("oldPassword")}
                    // onBlur={handleBlur('oldPassword')}
                    errorMessage={
                      touched.oldPassword && errors?.oldPassword
                        ? errors.oldPassword
                        : undefined
                    }
                    autoCapitalize="none"
                    rightIcon={eyeIcon()}
                    leftIcon={<LockIcon />}
                  />
                  <AppInput
                    inputContainerStyle={[_styles.input]}
                    secureTextEntry={newpasswordVisibility}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="Password"
                    placeholderTextColor={theme.darkColors?.grey}
                    value={values.newPassword}
                    onChangeText={handleChange("newPassword")}
                    // onBlur={handleBlur('password')}
                    errorMessage={
                      touched.newPassword && errors?.newPassword
                        ? errors.newPassword
                        : undefined
                    }
                    autoCapitalize="none"
                    rightIcon={eyeNIcon()}
                    leftIcon={<LockIcon />}
                  />
                  <AppInput
                    inputContainerStyle={[_styles.input]}
                    secureTextEntry={confirmnewpasswordVisibility}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={theme.darkColors?.grey}
                    placeholder="Confirm Password"
                    value={values.confirmnewPassword}
                    onChangeText={handleChange("confirmnewPassword")}
                    // onBlur={handleBlur('password')}
                    errorMessage={
                      touched.confirmnewPassword && errors?.confirmnewPassword
                        ? errors.confirmnewPassword
                        : undefined
                    }
                    autoCapitalize="none"
                    rightIcon={eyeCIcon()}
                    leftIcon={<LockIcon />}
                  />
                </View>

                <AppButton
                  buttonStyle={_styles.buttonStyle}
                  containerStyle={_styles.buttonContainer}
                  title={"Change Password"}
                  onPress={handleSubmit}
                  //   loading={isLoading}
                />
              </View>
            )}
          </Formik>
        </KeyboardAwareScrollView>
      </BackgroundWithImage>
    </>
  )
}

export default ChangePassword
