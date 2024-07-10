import React, { useEffect, useState } from "react"
import { View, Keyboard, Text, TouchableOpacity, Alert } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { AppButton, AppHeader, AppInput } from "../../../components"
import { PanicPopUpSchema } from "../../../util/ValidationSchemas"
import BackgroundWithImage from "../../../components/background"
import { useSelector } from "react-redux"
import theme from "../../../assets/theme"
import useStyles from "./styles"
import { Formik } from "formik"
import { panicMessageAPI } from "../../../network"

const PanicPopUp = ({ onClose }) => {
  const _styles = useStyles()
  const [isMessageInputFocused, setMessageInputFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const submitHandler = values => {
    setIsLoading(true)

    console.log(values?.message)
    panicMessageAPI({
      'message': values.message
    })
      .then(res => {
        console.log("panicMessageAPI res", res)
        if (res.status == 1) {
          Alert.alert("Success", "Message submitted successfully!", [
            {
              text: "OK",
              onPress: () => {
                onClose()
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
      <AppHeader title={"Emergency Message"} leftComponent={null} backgroundColor="transparent" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        contentContainerStyle={_styles.scroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
      >
        <Formik
          initialValues={{
            message: ""
          }}
          onSubmit={values => submitHandler(values)}
          enableReinitialize
          validationSchema={PanicPopUpSchema}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <View style={_styles.container}>
              <Text style={_styles.emergencyText}>Emergency Procedure</Text>
              <Text style={_styles.emergencyTextDes}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ullamcorper erat nec blandit pharetra. Quisque mattis elit semper sem mattis, a commodo nisi mattis.</Text>
              <View style={_styles.chidlView}>
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
              <TouchableOpacity onPress={() => { onClose() }}>
                <Text style={_styles.notShareBottomText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </BackgroundWithImage>
  )
}

export default PanicPopUp
