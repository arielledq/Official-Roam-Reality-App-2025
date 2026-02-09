import React, {useEffect, useState} from "react";
import {View, Keyboard, Text, TouchableOpacity, Alert} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {AppButton, AppHeader, AppInput} from "../../../components";
import {PanicPopUpSchema} from "../../../util/ValidationSchemas";
import BackgroundWithImage from "../../../components/background";
import {useSelector} from "react-redux";
import theme from "../../../assets/theme";
import useStyles from "./styles";
import {Formik} from "formik";
import {panicMessageAPI} from "../../../network";
import {getDeviceCurrentLocation} from "../../../util/LocationLib";
import {showMessage} from "../../../util/helpers";
import {BackArrowIcon} from "assets/svg";
import {useNavigation} from "@react-navigation/native";

const PanicPopUp = ({onClose}) => {
  const _styles = useStyles();
  const Navigation = useNavigation();
  const [isMessageInputFocused, setMessageInputFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = values => {
    getDeviceCurrentLocation(position => {
      setIsLoading(true);
      panicMessageAPI({
        message: values.message,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
        .then(res => {
          if (res.status == 1) {
            showMessage("Message submitted successfully!");
            Navigation.goBack();
          } else {
            showMessage(res.message.error, "error");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  return (
    <BackgroundWithImage>
      <AppHeader
        title={"Emergency Message"}
        leftComponent={
          <TouchableOpacity onPress={() => Navigation.goBack()}>
            <BackArrowIcon />
          </TouchableOpacity>
        }
        backgroundColor="transparent"
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        contentContainerStyle={_styles.scroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
      >
        <Formik
          initialValues={{
            message: "",
          }}
          onSubmit={values => submitHandler(values)}
          enableReinitialize
          validationSchema={PanicPopUpSchema}
        >
          {({handleChange, handleSubmit, values, errors, touched}) => (
            <View style={_styles.container}>
              <Text style={_styles.emergencyText}>Emergency Procedure</Text>
              <Text style={_styles.emergencyTextDes}>
                In case of an emergency, please send us details immediately, and a Roam
                representative will reach out as soon as possible. If cell service is limited and we
                cannot reach you, we may contact the nearest police station or search and rescue
                team using your latest location data to help ensure your safety.
              </Text>
              <View style={_styles.chidlView}>
                <AppInput
                  style={[
                    _styles.input,
                    _styles.textbox,
                    isMessageInputFocused ? _styles.focusedInput : {},
                    touched.message && errors?.message ? _styles.inputError : {},
                  ]}
                  selectionColor={"white"}
                  onFocus={() => setMessageInputFocused(true)}
                  onBlur={() => setMessageInputFocused(false)}
                  placeholder="Write your message here"
                  onSubmitEditing={Keyboard.dismiss}
                  placeholderTextColor={
                    (touched.message && errors?.message) || isMessageInputFocused
                      ? theme.lightColors?.white
                      : theme.lightColors?.grey0
                  }
                  value={values.message}
                  onChangeText={handleChange("message")}
                  errorMessage={touched.message && errors?.message ? errors.message : undefined}
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
              <TouchableOpacity
                onPress={() => {
                  Navigation.goBack();
                }}
              >
                <Text style={_styles.notShareBottomText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </BackgroundWithImage>
  );
};

export default PanicPopUp;
