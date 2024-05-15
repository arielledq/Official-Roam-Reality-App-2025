import * as React from "react"
import {
  Text,
  View,
  StyleSheet,
  Keyboard,
  Pressable,
  Image
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

interface InviteFriendsProps {}

const InviteFriends = (props: InviteFriendsProps) => {
  const _styles = useStyles()
  const [isMessageFocused, setMessageFocused] = React.useState(false)
  const [isEmailInputFocused, setEmailInputFocused] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
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
            name: "",
            email: "",
            message: ""
          }}
          onSubmit={values => submitHandler(values)}
          enableReinitialize
          validationSchema={inviteFriendSchema}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <View style={_styles.container}>
              <View style={_styles.chidlView}>
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
              <Pressable>
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
