import * as React from "react"
import {
  Text,
  View,
  StyleSheet,
  Keyboard,
  Pressable,
  Image,
  Share,
  Alert
} from "react-native"
import BackgroundWithImage from "../../components/background"
import { AppButton, AppHeader, AppInput } from "../../components"
import { Formik } from "formik"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { inviteFriendSchema } from "../../util/ValidationSchemas"
import theme from "../../assets/theme"
import { SvgXml } from "react-native-svg"
import { Icons } from "../../assets/Icons"
import useStyles from "./styles"
import Images from "../../assets/images"
import { inviteFriendByEmail } from "../../network"
import { showMessage } from "../../util/helpers"

interface InviteFriendsProps {}

const InviteFriends = (props: InviteFriendsProps) => {
  const _styles = useStyles()
  const [isMessageFocused, setMessageFocused] = React.useState(false)
  const [isEmailInputFocused, setEmailInputFocused] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  /**
   * Method to share the app link through email, message, etc.
   */
  const onShareLinkClick = async () => {
    const result = Share.share({
      message: "https://www.google.com",
      title: "Invite Friends"
    })
    if (result.action === Share.sharedAction) {
      // Link has been successfully shared
      showMessage("App link shared successfully")
    }
  }

  /**
   * Method to invite friends using their email id and message
   */
  const inviteFriends = async (values: any, resetForm: any) => {
    // API call to invite friends
    setLoading(true)
    const data = {
      email: values.email?.trim(),
      message: values.message?.trim()
    }
    inviteFriendByEmail(data)
      .then(response => {
        setLoading(false)
        Keyboard.dismiss()
        if (response.status === 1) {
          showMessage("An invite has been sent to your friend")
          resetForm() // Reset form after successful submission
        } else {
          showMessage("Something went wrong", 'error')
        }
      })
      .catch(error => {
        setLoading(false)
        console.error("error", JSON.stringify(error))
        showMessage("Something went wrong", 'error')
      })
  }

  return (
    <BackgroundWithImage>
      <AppHeader title={"Invite Friends"} backgroundColor="transparent" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        contentContainerStyle={_styles.scroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
      >
        <Formik
          initialValues={{
            email: "",
            message: ""
          }}
          onSubmit={(values, { resetForm }) => inviteFriends(values, resetForm)}
          enableReinitialize
          validationSchema={inviteFriendSchema}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <View style={_styles.container}>
              <View>
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
                />
                <AppInput
                  style={[
                    _styles.input,
                    _styles.textbox,
                    isMessageFocused ? _styles.focusedInput : {},
                    touched.message && errors?.message ? _styles.inputError : {}
                  ]}
                  selectionColor={"white"}
                  onFocus={() => setMessageFocused(true)}
                  onBlur={() => setMessageFocused(false)}
                  placeholder="Write your message here"
                  onSubmitEditing={Keyboard.dismiss}
                  placeholderTextColor={
                    (touched.message && errors?.message) || isMessageFocused
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
                loading={loading}
              />
              <Pressable onPress={onShareLinkClick}>
                <Image
                  source={Images.ShareInvite}
                  style={_styles.shareInvite}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </BackgroundWithImage>
  )
}

export default InviteFriends

const styles = StyleSheet.create({
  container: {}
})
