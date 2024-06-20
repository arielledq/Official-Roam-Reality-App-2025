import React, { useEffect, useState } from "react"
import { View, Keyboard, Alert } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { AppButton, AppHeader, AppInput } from "../../components"
import { ContactUsSchema } from "../../util/ValidationSchemas"
import BackgroundWithImage from "../../components/background"
import { contactUs, getProfieDetails } from "../../network"
import { useSelector } from "react-redux"
import theme from "../../assets/theme"
import useStyles from "./styles"
import { Formik } from "formik"
import { DrawerActions } from "@react-navigation/native"

const ContactUs = ({ navigation }) => {
  const userProfile = useSelector(state => state.login?.data?.user)
  const [profileDetails, setProfileDetails] = useState(null)
  const [isNameInputFocused, setNameInputFocused] = useState(false)
  const [isEmailInputFocused, setEmailInputFocused] = useState(false)
  const [isMessageInputFocused, setMessageInputFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const _styles = useStyles()

  useEffect(() => {
    fetchProfileDetails()
  }, [])

  const fetchProfileDetails = async () => {
    try {
      getProfieDetails({
        id: userProfile.user_profile.id
      })
        .then(res => {
          if (res.status == 1) {
            setProfileDetails(res)
          } else {
            console.error("Error", "Error fetching profile details: ")
          }
        })
        .catch(err => {
          console.error("Error", "Error fetching profile details: ")
        })
        .finally(() => setIsLoading(false))
    } catch (error) {
      console.error("Error", "Error fetching profile details: ")
    }
  }

  const submitHandler = values => {
    setIsLoading(true)
    contactUs({
      message: values?.message
    })
      .then(res => {
        if (res.status == 1) {
          Alert.alert("Success", "Message submitted successfully!", [
            {
              text: "OK",
              onPress: () => {
                navigation.dispatch(DrawerActions.closeDrawer)
                navigation.navigate("Home")
              }
            }
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
    <BackgroundWithImage>
      <AppHeader title={"Contact Us"} backgroundColor="transparent" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        contentContainerStyle={_styles.scroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
      >
        <Formik
          initialValues={{
            name: profileDetails?.user?.name ?? "",
            email: profileDetails?.user?.email ?? "",
            message: ""
          }}
          onSubmit={values => submitHandler(values)}
          enableReinitialize
          validationSchema={ContactUsSchema}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <View style={_styles.container}>
              <View style={_styles.chidlView}>
                <AppInput
                  inputContainerStyle={[
                    _styles.input,
                    isNameInputFocused ? _styles.focusedInput : {},
                    touched.name && errors?.name ? _styles.inputError : {}
                  ]}
                  selectionColor={"white"}
                  onFocus={() => setNameInputFocused(true)}
                  onBlur={() => setNameInputFocused(false)}
                  placeholder="Full name"
                  onSubmitEditing={Keyboard.dismiss}
                  placeholderTextColor={
                    (touched.name && errors?.name) || isNameInputFocused
                      ? theme.darkColors?.white
                      : theme.darkColors?.grey
                  }
                  value={values.name}
                  onChangeText={handleChange("name")}
                  errorMessage={
                    touched.name && errors?.name ? errors.name : undefined
                  }
                  autoCapitalize="none"
                  editable={false}
                />
                <AppInput
                  inputContainerStyle={[
                    _styles.input,
                    isEmailInputFocused ? _styles.focusedInput : {},
                    touched.email && errors?.email ? _styles.inputError : {}
                  ]}
                  selectionColor={"white"}
                  onFocus={() => setEmailInputFocused(true)}
                  onBlur={() => setEmailInputFocused(false)}
                  placeholder="Email Address"
                  onSubmitEditing={Keyboard.dismiss}
                  placeholderTextColor={
                    (touched.email && errors?.email) || isEmailInputFocused
                      ? theme.darkColors?.white
                      : theme.darkColors?.grey
                  }
                  value={values.email}
                  onChangeText={handleChange("email")}
                  errorMessage={
                    touched.email && errors?.email ? errors.email : undefined
                  }
                  autoCapitalize="none"
                  editable={false}
                />
                <AppInput
                  style={[
                    _styles.input,
                    _styles.textbox,
                    isMessageInputFocused ? _styles.focusedInput : {},
                    touched.message && errors?.message ? _styles.inputError : {}
                  ]}
                  selectionColor={"white"}
                  onFocus={() => setMessageInputFocused(true)}
                  onBlur={() => setMessageInputFocused(false)}
                  placeholder="Write your message here"
                  onSubmitEditing={Keyboard.dismiss}
                  placeholderTextColor={
                    (touched.message && errors?.message) ||
                    isMessageInputFocused
                      ? theme.darkColors?.white
                      : theme.darkColors?.grey
                  }
                  value={values.message}
                  onChangeText={handleChange("message")}
                  errorMessage={
                    touched.message && errors?.message
                      ? errors.message
                      : undefined
                  }
                  autoCapitalize="none"
                  textAlignVertical="top"
                  multiline={true}
                />
              </View>
              <AppButton
                buttonStyle={_styles.buttonStyle}
                containerStyle={_styles.buttonContainer}
                title={"Submit"}
                onPress={handleSubmit}
                loading={isLoading}
              />
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </BackgroundWithImage>
  )
}

export default ContactUs
