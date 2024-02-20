import React, { useState } from 'react'
import { View, Keyboard ,TextInput,Text} from 'react-native'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { AppButton, AppHeader, AppInput } from '../../components';
import { ContactUsSchema } from '../../util/ValidationSchemas';
import BackgroundWithImage from '../../components/background';
import theme from "../../assets/theme"
import useStyles from "./styles"
import { Formik } from "formik"

const ContactUs = () => {
  const [isNameInputFocused, setNameInputFocused] = useState(false)
  const [isEmailInputFocused, setEmailInputFocused] = useState(false)
  const [isMessageInputFocused, setMessageInputFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showError , setShowError] = useState(false)
  const _styles = useStyles()
  
  return (
    <BackgroundWithImage>
      <AppHeader title={"Contact Us"} backgroundColor="transparent" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        contentContainerStyle={_styles.scroll}
      >
      <Formik
        initialValues={{
            name :  "",
            email : "",
            message : ""
        }}
        onSubmit={values => setShowError(true)}
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
                /> 
                  <AppInput
                    style={[
                    _styles.input,_styles.textbox,
                    isMessageInputFocused ? _styles.focusedInput : {},
                    touched.message && errors?.message ? _styles.inputError : {}
                    ]}
                    selectionColor={"white"}
                    onFocus={() => setMessageInputFocused(true)}
                    onBlur={() => setMessageInputFocused(false)}
                    placeholder="Write your message here"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={
                        (touched.message && errors?.message) || isMessageInputFocused
                        ? theme.darkColors?.white
                        : theme.darkColors?.grey
                    }
                    value={values.message}
                    onChangeText={handleChange("message")}
                    errorMessage={
                        touched.message && errors?.message ? errors.message : undefined
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
