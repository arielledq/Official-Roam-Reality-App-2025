import React, {useState} from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import BackgroundWithImage from "../../components/background";
import theme from "../../assets/theme";
import {AppButton, AppHeader} from "../../components";
import Icon from "../../components/Icon";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";
import {useNavigation} from "@react-navigation/native";
import {deleteAccount, logout} from "network";
import {removeItem, showMessage} from "util/helpers";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {resetState} from "redux/Login";
import {useDispatch} from "react-redux";
import ConfirmationPopUp from "components/confirmationPopUp";

function SettingsItem({label, onPress, icon}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.darkColors?.inputBlue,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginHorizontal: 25,
        marginVertical: 10,
        borderRadius: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Icon name={icon} family="custom" size={24} />
        <Text style={styles.text}>{label}</Text>
      </View>
      <Icon name="right" family="right" color={theme.darkColors?.white} size={24} />
    </TouchableOpacity>
  );
}

const Settings = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  const handleLogOutButton = async () => {
    await GoogleSignin.revokeAccess().catch(err => console.error(err));
    await GoogleSignin.signOut().catch(err => console.error(err));
    await removeItem("fbToken");
    await removeItem("instaToken");
    logout();
    dispatch(resetState());
  };

  const handleDeleteAccount = () => {
    deleteAccount().then(res => {
      if (res.status == 1) {
        handleLogOutButton();
        showMessage("Your account has been deleted successfully");
      } else {
        showMessage(res.message.error, "error");
      }
    });
  };

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword");
  };
  const handlePrivacy = () => {
    navigation.navigate("Privacy");
  };

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader title={"Settings"} backgroundColor="transparent" />
      <SettingsItem icon="lock" label={"Change password"} onPress={handleChangePassword} />
      <SettingsItem icon="privacy" label={"Privacy"} onPress={handlePrivacy} />
      <View style={{width: "100%", paddingHorizontal: 24}}>
        <AppButton
          onPress={() => setIsOpenDeleteModal(true)}
          // buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          customColors={[theme.darkColors?.inputRed, theme.darkColors?.inputRed]}
          title={"Delete account"}
          // loading={isLoading}
        />
      </View>
      <ConfirmationPopUp
        title={"Delete Account"}
        description={"Are you sure you want to delete your account? This action is irreversible."}
        confirmText={"Accept and Continue"}
        confirmHandler={handleDeleteAccount}
        isVisible={isOpenDeleteModal}
        cancelText={"Cancel"}
        cancelHandler={() => setIsOpenDeleteModal(false)}
      />
    </BackgroundWithImage>
  );
};

export default Settings;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme?.colors?.inputBG,
  },
  text: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH21,
    color: theme.darkColors?.white,
    marginLeft: 15,
  },
  socialAccount: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH24,
  },
  linkNow: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH21,
    color: theme.darkColors?.inputBlue,
  },
  buttonStyle: {
    backgroundColor: theme.darkColors?.inputRed,
  },
  buttonContainerStyle: {
    marginTop: 24,
  },
});
