import React, { useState } from "react";
import { Alert, Image, Keyboard, Linking, Pressable, View } from "react-native";
import { Formik } from "formik";
import { AppButton, AppHeader, AppInput, AppText } from "../../components";
import theme from "../../assets/theme";
import { feedbackSchema } from "../../util/ValidationSchemas";
import BackgroundWithImage from "../../components/background";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useStyles from "./styles";
import { sendFeedback } from "../../network";
import Images from "../../assets/images";
import { showMessage } from "../../util/helpers";

const Feedback = () => {
  const _styles = useStyles();
  const [loading, setLoading] = React.useState(false);
  const [isTitleFocused, setTitleFocused] = useState(false);
  const [isDescInputFocused, setDescInputFocused] = useState(false);

  const SupportOptionsData = [
    {
      icon: Images.Facebook,
      text: "Facebook",
      link: "https://www.facebook.com/RoamReality",
    },
    {
      icon: Images.Instagram,
      text: "Instagram",
      link: "https://www.instagram.com/roamreality",
    },
    {
      icon: Images.YouTube,
      text: "YouTube",
      link: "https://youtube.com/playlist?list=PL8nZ3JL_pRJfOEU1CeWnW1n_-i_aXIHHQ&feature=shared",
    },
  ];

  /**
   * Method to handle form data
   * @param values Feedback form data (Title and Description)
   */
  const handleFormData = (values: any, resetForm: any) => {
    setLoading(true);
    const data = {
      title: values.title?.trim(),
      message: values.description?.trim(),
    };
    sendFeedback(data)
      .then(response => {
        setLoading(false);
        Keyboard.dismiss();
        if (response.status === 1) {
          resetForm(); // Reset form after successful submission
          showMessage("Thank you for your feedback", "success", "Feedback Submitted");
        } else {
          showMessage("Something went wrong", "error");
        }
      })
      .catch(error => {
        setLoading(false);
        console.error("error", JSON.stringify(error));
        showMessage("Something went wrong", "error");
      });
  };

  return (
    <BackgroundWithImage>
      <AppHeader title={"Support & Feedback"} backgroundColor="transparent" />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        contentContainerStyle={[_styles.scroll, { paddingHorizontal: 25 }]}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
      >
        <>
          <AppText style={_styles.subHeaderText}>Find Us On</AppText>
          <View style={_styles.linkContainer}>
            {SupportOptionsData.map((item, index) => (
              <SupportOptions key={index} icon={item.icon} text={item.text} link={item.link} />
            ))}
          </View>
          <AppText style={_styles.subHeaderText}>Write To Us</AppText>
          <Formik
            initialValues={{
              title: "",
              description: "",
            }}
            validateOnChange={true}
            validationSchema={feedbackSchema}
            onSubmit={(values, { resetForm }) => {
              handleFormData(values, resetForm);
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => {
              return (
                <View style={_styles.container}>
                  <AppInput
                    inputContainerStyle={[
                      _styles.input,
                      isTitleFocused ? _styles.focusedInput : {},
                      touched.title && errors?.title ? _styles.inputError : {},
                    ]}
                    selectionColor={"white"}
                    onFocus={() => setTitleFocused(true)}
                    onBlur={() => setTitleFocused(false)}
                    placeholder="Title"
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={
                      (touched.title && errors?.title) || isTitleFocused
                        ? theme.lightColors?.white
                        : theme.lightColors?.grey0
                    }
                    value={values.title}
                    onChangeText={handleChange("title")}
                    errorMessage={touched.title && errors?.title ? errors.title : undefined}
                    maxLength={250}
                    autoCapitalize="none"
                  />
                  <AppInput
                    style={[
                      _styles.input,
                      _styles.textbox,
                      isDescInputFocused ? _styles.focusedInput : {},
                      touched.description && errors?.message ? _styles.inputError : {},
                    ]}
                    selectionColor={"white"}
                    onFocus={() => setDescInputFocused(true)}
                    onBlur={() => setDescInputFocused(false)}
                    placeholder="Description"
                    onSubmitEditing={Keyboard.dismiss}
                    maxLength={500}
                    placeholderTextColor={
                      (touched.description && errors?.description) || isDescInputFocused
                        ? theme.lightColors?.white
                        : theme.lightColors?.grey0
                    }
                    value={values.description}
                    onChangeText={handleChange("description")}
                    errorMessage={
                      touched.description && errors?.description ? errors.description : undefined
                    }
                    autoCapitalize="none"
                    textAlignVertical="top"
                    multiline={true}
                  />
                  <AppButton
                    buttonStyle={_styles.buttonStyle}
                    containerStyle={_styles.buttonContainer}
                    title={"Submit"}
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={
                      values.title?.length === 0 || values.description?.length === 0 ? true : false
                    }
                  />
                </View>
              );
            }}
          </Formik>
        </>
      </KeyboardAwareScrollView>
    </BackgroundWithImage>
  );
};

interface SupportOptionsProps {
  icon: any;
  text: string;
  link: string;
}

const SupportOptions = (props: SupportOptionsProps) => {
  const _styles = useStyles();

  const onLinkClick = () => {
    Linking.openURL(props.link);
  };

  return (
    <View style={[_styles.row, _styles.rowSpaceBetween, _styles.contactOption]}>
      <View style={_styles.row}>
        <Image source={props?.icon} style={_styles.linkImages} />
        <AppText style={_styles.linkText}>{props?.text}</AppText>
      </View>
      <Pressable onPress={onLinkClick}>
        <AppText style={[_styles.text, _styles.link]}>Visit</AppText>
      </Pressable>
    </View>
  );
};

export default Feedback;
