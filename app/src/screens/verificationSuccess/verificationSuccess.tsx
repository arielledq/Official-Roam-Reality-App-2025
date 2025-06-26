import React from "react";
import {Image, View} from "react-native";
import useStyles from "./styles";
import {RootStackParamList, ScreenStackComponent} from "../../constants/types";
import AppButton from "../../components/button";
import AppHeader from "../../components/header";
import BackgroundWithImage from "../../components/background";
import AppText from "../../components/text";
import Images from "../../assets/images";
import {useNavigation, useRoute} from "@react-navigation/native";
import {useDispatch} from "react-redux";
import {updateVerified} from "../../redux/Login";

const VerificationSuccess: ScreenStackComponent<RootStackParamList, "VerificationSuccess"> = () => {
  const _styles = useStyles();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const ChangePassword = route?.params?.ChangePassword;
  const successText = ChangePassword
    ? "password has been successfully changed"
    : "email address has been successfully verified";
  const buttonText = ChangePassword ? "Continue to Login" : "Continue";

  const handleContinue = () => {
    if (ChangePassword) {
      navigation.reset({
        index: 0,
        routes: [{name: "Login"}],
      });
    } else {
      dispatch(updateVerified(true));
      navigation.reset({
        index: 0,
        routes: [{name: "TabNavigator", params: {screen: "GeoArChallenge"}}],
      });
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
