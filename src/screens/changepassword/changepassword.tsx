import React, { useState } from "react"
import { Alert, Keyboard, TouchableOpacity, View } from "react-native"
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
import AppHeader from "../../components/header"
import AppInput from "../../components/input"
import Icon from "../../components/Icon"
import { ChangePasswordSchema } from "../../util/ValidationSchemas"
import { changePassword } from "../../network"

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
  const [isLoading, setIsLoading] = useState(false)

  function handleChangePassword(values: ChangePasswordFormValues) {
    setIsLoading(true)
    changePassword({
      old_password: values.oldPassword,
      new_password: values.newPassword,
      confirm_password: values.confirmnewPassword
    })
      .then(res => {
        console.log({ res })
        if (res.status == 1) {
          Alert.alert("Success", res.message, [
            { text: "OK", onPress: () => navigation.goBack() }
          ])
        } else {
          Alert.alert("Error", res.message.error)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
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
            validationSchema={ChangePasswordSchema}
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
                <View style={_styles.chidlView}>
                  <AppInput
                    inputContainerStyle={[_styles.input]}
                    containerStyle={{ marginBottom: -10 }}
                    secureTextEntry={oldpasswordVisibility}
                    placeholder="Old Password"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={theme.darkColors?.grey}
                    value={values.oldPassword}
                    onChangeText={handleChange("oldPassword")}
                    onBlur={handleBlur("oldPassword")}
                    errorMessage={
                      touched.oldPassword && errors?.oldPassword
                        ? errors.oldPassword
                        : undefined
                    }
                    autoCapitalize="none"
                    rightIcon={
                      <Icon
                        onPress={() => {
                          setOldPasswordVisibility(p => !p)
                        }}
                        name={oldpasswordVisibility ? "eye" : "eye-off"}
                        family="feather"
                        color={"#9CA3AF"}
                        size={23}
                      />
                    }
                    leftIcon={
                      <Icon
                        name={"lock"}
                        family="feather"
                        color={"grey"}
                        size={24}
                      />
                    }
                  />
                  <AppInput
                    inputContainerStyle={[_styles.input]}
                    secureTextEntry={newpasswordVisibility}
                    containerStyle={{ marginBottom: -10 }}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="Password"
                    placeholderTextColor={theme.darkColors?.grey}
                    value={values.newPassword}
                    onChangeText={handleChange("newPassword")}
                    onBlur={handleBlur("newPassword")}
                    errorMessage={
                      touched.newPassword && errors?.newPassword
                        ? errors.newPassword
                        : undefined
                    }
                    autoCapitalize="none"
                    rightIcon={
                      <Icon
                        onPress={() => {
                          setNewPasswordVisibility(p => !p)
                        }}
                        name={newpasswordVisibility ? "eye" : "eye-off"}
                        family="feather"
                        color={"#9CA3AF"}
                        size={23}
                      />
                    }
                    leftIcon={
                      <Icon
                        name={"lock"}
                        family="feather"
                        color={"grey"}
                        size={24}
                      />
                    }
                  />
                  <AppInput
                    inputContainerStyle={[_styles.input]}
                    secureTextEntry={confirmnewpasswordVisibility}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={theme.darkColors?.grey}
                    placeholder="Confirm Password"
                    value={values.confirmnewPassword}
                    onChangeText={handleChange("confirmnewPassword")}
                    onBlur={handleBlur("confirmnewPassword")}
                    errorMessage={
                      touched.confirmnewPassword && errors?.confirmnewPassword
                        ? errors.confirmnewPassword
                        : undefined
                    }
                    autoCapitalize="none"
                    rightIcon={
                      <Icon
                        onPress={() => {
                          setConfirmNewPasswordVisibility(p => !p)
                        }}
                        name={confirmnewpasswordVisibility ? "eye" : "eye-off"}
                        family="feather"
                        color={"#9CA3AF"}
                        size={23}
                      />
                    }
                    leftIcon={
                      <Icon
                        name={"lock"}
                        family="feather"
                        color={"grey"}
                        size={24}
                      />
                    }
                  />
                </View>

                <AppButton
                  buttonStyle={_styles.buttonStyle}
                  containerStyle={_styles.buttonContainer}
                  title={"Change Password"}
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={isLoading}
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
