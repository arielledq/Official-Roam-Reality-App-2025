import React, { useState } from "react";
import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { StyleSheet } from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { FontFamily, FontSizes } from "util/FontUtils";
import { ENABLED_LOCATION_TEXT, DISABLED_LOCATION_TEXT } from "../../constants";

import AppHeader from "../../components/header";
import ScreenContainer from "components/ScreenContainer";
import Icon from "components/Icon";
import { AppButton } from "components";
import AppSwitch from "components/Switch";

import userLocationHook from "screens/drawerContent/location.hook";
import { logout } from "network";
import { resetState } from "redux/Login";

import theme from "../../assets/theme";

const pinOn = require("../../assets/images/material-symbols_location-on-rounded.png");
const pinOff = require("../../assets/images/material-symbols_location-off-rounded.png");

const BandHome = ({}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading, locationIsEnabled, toggleUserLocation } = userLocationHook();
  const loginState = useSelector((state: any) => state.login);
  const user = loginState?.data?.user;
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  const toggleLiveLocationButtonHandler = () => {
    toggleUserLocation();
  };

  const toggleSettingsModalHandler = () => setIsSettingsModalVisible(currState => !currState);

  const changePasswordButtonHandler = () => {
    toggleSettingsModalHandler();
    navigation.navigate("ChangePassword" as never);
  };

  const logoutButtonHandler = () => {
    logout();
    dispatch(resetState());
  };

  const changePasswordColors = [`${theme.lightColors?.inputBG}`, `${theme.lightColors?.inputBG}`];
  const logoutColors = [`${theme.lightColors?.inputRed}`, `${theme.lightColors?.inputRed}`];

  return (
    <ScreenContainer>
      <>
        <AppHeader
          leftComponent={<></>}
          rightComponent={
            <TouchableOpacity onPress={toggleSettingsModalHandler}>
              <Icon name="settings" family="feather" color={"white"} size={20} />
            </TouchableOpacity>
          }
          centerComponent={{
            text: "Band Profile",
            style: styles.header,
          }}
          backgroundColor="transparent"
          isBottomTab
        />

        <View style={styles.content}>
          <View style={styles.bandInfoContainer}>
            <View style={styles.bandInfoLabelContainer}>
              <Text style={styles.bandInfoLabel}>Band Name:</Text>
              <Text style={styles.bandInfoText}>🎵 {user?.name}</Text>
            </View>
            <View style={styles.bandInfoLabelContainer}>
              <Text style={styles.bandInfoLabel}>Email:</Text>
              <Text style={styles.bandInfoText}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.locationBroadcastContainer}>
            <View style={styles.locationTitleContainer}>
              <Text style={styles.locationTitle}>Location Sharing</Text>
              <Text style={styles.locationSubtitle}>
                Enable location sharing to broadcast your band's location to users.
              </Text>
            </View>

            <View
              style={{
                marginVertical: 24,
                alignItems: "center",
                height: 100,
                justifyContent: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator color={theme.lightColors?.white} size="large" />
              ) : (
                <Image
                  source={locationIsEnabled ? pinOn : pinOff}
                  style={{ width: 100, height: 100 }}
                />
              )}
            </View>

            <TouchableWithoutFeedback onPress={toggleLiveLocationButtonHandler}>
              <View style={styles.locationFieldContainer}>
                <View style={styles.locationTextLabelContainer}>
                  <Text style={styles.locationLabel}>Share Location:</Text>
                  <Text style={styles.locationSubText}>
                    {locationIsEnabled ? ENABLED_LOCATION_TEXT : DISABLED_LOCATION_TEXT}
                  </Text>
                </View>

                <View style={styles.locationInputContainer}>
                  <AppSwitch
                    onValueChange={toggleLiveLocationButtonHandler}
                    value={locationIsEnabled}
                    loading={loading}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isSettingsModalVisible}
          onDismiss={toggleSettingsModalHandler}
        >
          <TouchableWithoutFeedback onPress={toggleSettingsModalHandler}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <AppButton
                  onPress={changePasswordButtonHandler}
                  buttonStyle={styles.appButtonStyle}
                  customColors={changePasswordColors}
                  containerStyle={styles.appButtonContainerStyle}
                  title={
                    <>
                      <Icon
                        name="lock"
                        family="custom"
                        size={24}
                        color={theme.lightColors?.white}
                      />
                      <Text style={styles.appButtonLabelStyle}>Change password</Text>
                    </>
                  }
                />
                <AppButton
                  onPress={logoutButtonHandler}
                  buttonStyle={styles.appButtonStyle}
                  customColors={logoutColors}
                  containerStyle={styles.appButtonContainerStyle}
                  title={
                    <>
                      <Icon
                        name="log-out"
                        family="feather"
                        size={24}
                        color={theme.lightColors?.white}
                      />
                      <Text style={styles.appButtonLabelStyle}>Logout</Text>
                    </>
                  }
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </>
    </ScreenContainer>
  );
};

export default BandHome;

const styles = StyleSheet.create({
  header: {
    fontSize: FontSizes.S20,
    fontWeight: "bold",
    color: theme.lightColors?.white,
    textAlign: "center",
  },
  content: {
    flex: 1,
    gap: 40,
    marginTop: 24,
  },
  bandInfoContainer: {
    gap: 8,
  },
  bandInfoLabelContainer: {},
  bandInfoLabel: {
    fontSize: FontSizes.S12,
    fontFamily: FontFamily.NunitoSansRegular,
    color: theme.lightColors?.grey0,
  },
  bandInfoText: {
    fontSize: FontSizes.S16,
    fontFamily: FontFamily.NunitoSansBold,
    fontWeight: "bold",
    color: theme.lightColors?.white,
  },
  locationBroadcastContainer: {
    gap: 16,
    flex: 1,
  },
  locationTitleContainer: { gap: 8 },
  locationTitle: {
    fontSize: FontSizes.S18,
    fontFamily: FontFamily.NunitoSansBold,
    fontWeight: "bold",
    color: theme.lightColors?.white,
  },
  locationSubtitle: {
    fontSize: FontSizes.S12,
    fontFamily: FontFamily.NunitoSansRegular,
    color: theme.lightColors?.grey0,
  },
  locationFieldContainer: { flexDirection: "row" },
  locationTextLabelContainer: { flex: 1 },
  locationLabel: {
    fontSize: FontSizes.S16,
    fontFamily: FontFamily.NunitoSansRegular,
    color: theme.lightColors?.white,
  },
  locationSubText: {
    fontSize: FontSizes.S12,
    fontFamily: FontFamily.NunitoSansRegular,
    color: theme.lightColors?.grey0,
  },
  locationInputContainer: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    backgroundColor: `${theme.lightColors?.inputBG}50`,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    margin: 20,
    backgroundColor: theme.lightColors?.inputBG,
    borderRadius: 20,
    padding: 35,
    shadowColor: theme.lightColors?.inputBG,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: 24,
  },
  appButtonStyle: {
    alignItems: "center",
    justifyContent: "center",
  },
  appButtonContainerStyle: { padding: 4 },
  appButtonLabelStyle: {
    marginLeft: 8,
    color: theme.lightColors?.white,
    fontSize: FontSizes.S16,
  },
});
