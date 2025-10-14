import React, {useEffect, useState} from "react";

import {Keyboard, Text, TouchableOpacity, View} from "react-native";

import {Formik} from "formik";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import useStyles from "./styles";
import {RootStackParamList, ScreenStackComponent} from "../../constants/types";
import AppButton from "../../components/button";
import AppInput from "../../components/input";
import {LockIcon, MailIcon} from "../../assets/svg";
import AppHeader from "../../components/header";
import BackgroundWithImage from "../../components/background";
import theme from "../../assets/theme";
import AppText from "../../components/text";
import {login} from "../../network";
import {useDispatch, useSelector} from "react-redux";
import {updateUserData} from "../../redux/Login";
import {SigninSchema} from "../../util/ValidationSchemas";
import Icon from "../../components/Icon";
import {handleError} from "../../util/helpers";
import SocialSignin from "../../components/socialSignin";
import {updateAsOldUser} from "../../redux/Persist";
import {setItemWithListener} from "../../util/EventsListener";
import {fonts} from "assets/fonts";
import {FontSizes} from "util/FontUtils";
import Config from "config";
import {useOneSignal} from "../../hooks/useOneSignal";

const LOGIN_INITIAL_VALUES = {
  email: __DEV__ ? Config?.DEV_EMAIL || "" : "",
  password: __DEV__ ? Config?.DEV_PASSWORD || "" : "",
};

const Login: ScreenStackComponent<RootStackParamList, "Login"> = ({navigation}) => {
  const _styles = useStyles();
  const dispatch = useDispatch();
  const newUser = useSelector(state => state.persist.newUser);
  const token = useSelector(state => state.login?.data?.token);
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const {setOnesignalDevice} = useOneSignal();

  const handleLogin = v => {
    setIsLoading(true);
    login({username: v.email.toLowerCase(), password: v.password})
      .then(res => {
        if (res.status == 1) {
          setItemWithListener("userToken", res?.token);
          dispatch(updateUserData(res));
          setOnesignalDevice();
          if (newUser) dispatch(updateAsOldUser());

          navigation.reset({
            index: 0,
            routes: [
              {name: "TabNavigator", params: {screen: "Tab", params: {screen: "GeoArChallenge"}}},
            ],
          });
        } else {
          handleError(res);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.log("err", err);
        setIsLoading(false);
      });
  };

  const navigateToResetPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const navigateToSignUp = () => {
    navigation.navigate("SignUp");
  };

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader title={""} backgroundColor="transparent" hideBackButton />
      <AppText style={[_styles.headerText]}>Welcome !</AppText>
      <AppText style={_styles.subHeaderText}>
        Login to ROAM a new dimension with captivating AR experiences.
      </AppText>

      <KeyboardAwareScrollView
        style={{flex: 1}}
        nestedScrollEnabled={false}
        keyboardShouldPersistTaps="always"
      >
        <Formik
          initialValues={{
            email: LOGIN_INITIAL_VALUES.email,
            password: LOGIN_INITIAL_VALUES.password,
          }}
          onSubmit={v => handleLogin(v)}
          validationSchema={SigninSchema}
        >
          {({handleChange, handleBlur, handleSubmit, values, errors, touched}) => (
            <View style={_styles.container}>
              <AppInput
                inputContainerStyle={[_styles.input]}
                containerStyle={{marginBottom: -10}}
                placeholder={"Email Address"}
                placeholderTextColor={theme.lightColors?.grey0}
                value={values.email}
                autoCapitalize="none"
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                errorMessage={touched.email && errors?.email ? errors.email : undefined}
                autoCorrect={false}
                textContentType="emailAddress"
                autoComplete="email"
                leftIconContainerStyle={{marginRight: 5}}
                leftIcon={<MailIcon />}
              />
              <AppInput
                inputContainerStyle={[_styles.input]}
                secureTextEntry={passwordVisibility && true}
                onSubmitEditing={Keyboard.dismiss}
                placeholder="Password"
                placeholderTextColor={theme.lightColors?.grey0}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                errorMessage={touched.password && errors?.password ? errors.password : undefined}
                autoCapitalize="none"
                leftIcon={<LockIcon />}
                rightIcon={
                  <Icon
                    onPress={() => {
                      setPasswordVisibility(p => !p);
                    }}
                    name={passwordVisibility ? "eye" : "minus"}
                    family="antdesign"
                    color={"#9CA3AF"}
                    size={23}
                  />
                }
              />

              {/* forgot password */}
              <AppText style={_styles.fpText} onPress={navigateToResetPassword}>
                Forgot Password?
              </AppText>

              <View style={_styles.buttonWrapper}>
                <AppButton
                  buttonStyle={_styles.buttonStyle}
                  containerStyle={_styles.buttonContainerStyle}
                  title={"LOGIN"}
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={isLoading}
                />
                <AppButton
                  buttonStyle={_styles.buttonStyle}
                  containerStyle={_styles.buttonContainerStyle}
                  title={"SIGN UP"}
                  onPress={navigateToSignUp}
                  disabled={isLoading}
                />
              </View>

              {/* Terms and Conditions */}
              {/* <AppText style={_styles.termsAndConditionstext}>
                {` By clicking "Sign in" you agree to our `}
                <AppText
                  style={_styles.TandCLink}
                  onPress={() => {
                    navigation.navigate("TermsAndConditions");
                  }}
                >
                  {`Terms and Conditions `}
                </AppText>
                and
                <AppText
                  style={_styles.TandCLink}
                  onPress={() => {
                    navigation.navigate("PrivacyPolicy");
                  }}
                >
                  {` Privacy Policy.`}
                </AppText>
              </AppText> */}

              {/* social sign in options */}
              <SocialSignin setLoading={setIsLoading} />
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 50,
        }}
      >
        {/* <AppText style={_styles.alreadyHaveAccount}>
          Don’t have an account? {""}
        </AppText>
        <TouchableOpacity
          onPress={navigateToSignUp}
          style={{
            padding: 8,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.nunitoBold,
              fontSize: FontSizes.S14,
              color: theme.lightColors?.purple,
              textDecorationLine: "underline",
            }}
          >
            Sign Up
          </Text>
        </TouchableOpacity> */}

        <AppText style={_styles.termsAndConditionstext}>
          {` By clicking "Sign in" you agree to our `}
          <AppText
            style={_styles.TandCLink}
            onPress={() => {
              navigation.navigate("TermsAndConditions");
            }}
          >
            {`Terms and Conditions `}
          </AppText>
          and
          <AppText
            style={_styles.TandCLink}
            onPress={() => {
              navigation.navigate("PrivacyPolicy");
            }}
          >
            {` Privacy Policy.`}
          </AppText>
        </AppText>
      </View>
    </BackgroundWithImage>
  );
};

export default Login;
