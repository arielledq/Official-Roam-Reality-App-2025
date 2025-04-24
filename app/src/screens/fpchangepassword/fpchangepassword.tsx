import React, { useState } from "react";
import { Keyboard, View } from "react-native";
import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import theme from "../../assets/theme";
import AppButton from "../../components/button";
import useStyles from "./styles";
import { RootStackParamList, ScreenStackComponent } from "../../constants/types";
import BackgroundWithImage from "../../components/background";
import AppHeader from "../../components/header";
import AppInput from "../../components/input";
import { LockIcon } from "../../assets/svg";
import { FPChangePasswordSchema } from "../../util/ValidationSchemas";
import Icon from "../../components/Icon";
import { resetPassword } from "../../network";
import { handleError } from "../../util/helpers";

const FPChangePassword: ScreenStackComponent<RootStackParamList, "FPChangePassword"> = ({
  navigation,
  route,
}) => {
  const _styles = useStyles();
  const { token, uid } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [newpasswordVisibility, setNewPasswordVisibility] = useState(true);
  const [confirmnewpasswordVisibility, setConfirmNewPasswordVisibility] = useState(true);

  const handleChangePassword = values => {
    setIsLoading(true);
    resetPassword({
      new_password1: values.newPassword,
      new_password2: values.confirmnewPassword,
      uid: uid,
      token: token,
    })
      .then(res => {
        {
          if (res.status == 1) {
            navigation.navigate("VerificationSuccess", { ChangePassword: true });
          } else {
            handleError(res);
          }
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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
              newPassword: "",
              confirmnewPassword: "",
            }}
            onSubmit={values => handleChangePassword(values)}
            validationSchema={FPChangePasswordSchema}
          >
            {({ handleChange, handleSubmit, values, errors, touched }) => (
              <View style={_styles.container}>
                <View style={_styles.chidlView}>
                  <AppInput
                    inputContainerStyle={[_styles.input]}
                    secureTextEntry={newpasswordVisibility}
                    containerStyle={{ marginBottom: -10 }}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholder="New Password"
                    placeholderTextColor={theme.lightColors?.grey0}
                    value={values.newPassword}
                    onChangeText={handleChange("newPassword")}
                    // onBlur={handleBlur('password')}
                    errorMessage={
                      touched.newPassword && errors?.newPassword ? errors.newPassword : undefined
                    }
                    autoCapitalize="none"
                    rightIcon={
                      <Icon
                        onPress={() => {
                          setNewPasswordVisibility(p => !p);
                        }}
                        name={newpasswordVisibility ? "eye" : "eye-off"}
                        family="feather"
                        color={"#9CA3AF"}
                        size={23}
                      />
                    }
                    leftIcon={<LockIcon />}
                  />
                  <AppInput
                    inputContainerStyle={[_styles.input]}
                    secureTextEntry={confirmnewpasswordVisibility}
                    onSubmitEditing={Keyboard.dismiss}
                    placeholderTextColor={theme.lightColors?.grey0}
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
                    rightIcon={
                      <Icon
                        onPress={() => {
                          setConfirmNewPasswordVisibility(p => !p);
                        }}
                        name={confirmnewpasswordVisibility ? "eye" : "eye-off"}
                        family="feather"
                        color={"#9CA3AF"}
                        size={23}
                      />
                    }
                    leftIcon={<LockIcon />}
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
  );
};

export default FPChangePassword;
