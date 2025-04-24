import React from "react";
import { Image, View } from "react-native";
import useStyles from "./styles";
import { RootStackParamList, ScreenStackComponent } from "../../constants/types";
import AppButton from "../../components/button";
import AppHeader from "../../components/header";
import BackgroundWithImage from "../../components/background";
import AppText from "../../components/text";
import Images from "../../assets/images";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { updateUserData, updateVerified } from "../../redux/Login";

const VerificationSuccess: ScreenStackComponent<RootStackParamList, "VerificationSuccess"> = () => {
  const _styles = useStyles();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const data = route?.params?.data;
  const profile = route?.params?.profile;
  const ChangePassword = route?.params?.ChangePassword;
  const successText = ChangePassword
    ? "password has been successfully changed"
    : "email address has been successfully verified";
  const buttonText = ChangePassword ? "Continue to Login" : "Continue";

  const handleContinue = () => {
    if (ChangePassword) {
      navigation.replace("Login");
    } else if (profile) {
      navigation.replace("TabNavigator");
      dispatch(updateVerified(true));
    } else {
      dispatch(
        updateUserData({
          ...data,
          user: {
            ...data?.user,
            user_profile: {
              ...data?.user?.user_profile,
              is_verified: true,
            },
          },
        })
      );
      setTimeout(() => {
        navigation.replace("TabNavigator");
      }, 250);
    }
  };

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader title={""} backgroundColor="transparent" hideBackButton />
      <View style={_styles.container}>
        <Image style={_styles.checkIcon} source={Images.CircleCheck} />
        <AppText adjustsFontSizeToFit={true} numberOfLines={1} style={_styles.headerText}>
          Congratulations!
        </AppText>
        <AppText style={_styles.subHeaderText}>🎉 Hooray! Your {successText}.</AppText>
      </View>
      <AppButton
        buttonStyle={_styles.buttonStyle}
        containerStyle={_styles.buttonContainerStyle}
        title={buttonText}
        onPress={handleContinue}
      />
    </BackgroundWithImage>
  );
};

export default VerificationSuccess;
