import React from "react";
import {View, Text, StyleSheet} from "react-native";
import ReactNativeModal from "react-native-modal";
import {FontSizes} from "util/FontUtils";
import {AppButton} from "components";

import theme from "assets/theme/index.ts";
import Icon from "components/Icon";

interface ARProximityAlertProps {
  isVisible: boolean;
  onClose: () => void;
  onSwitchToLive: () => void;
  arName?: string;
}

const ARProximityAlert = ({
  isVisible = false,
  onClose,
  onSwitchToLive,
  arName = "AR",
}: ARProximityAlertProps) => {
  const handleSwitchToLive = () => {
    onSwitchToLive();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <View style={{flex: 1, position: "absolute", top: 0, bottom: 0, left: 0, right: 0}}>
      <ReactNativeModal
        isVisible={isVisible}
        onDismiss={onClose}
        onBackdropPress={onClose}
        animationIn="fadeIn"
        animationOut="fadeOut"
      >
        <View
          style={[
            styles.alertContent,
            {
              backgroundColor: theme.lightColors?.inputBG,
            },
          ]}
        >
          {/* Close Button */}
          <View style={styles.closeButtonContainer}>
            <AppButton
              onPress={onClose}
              customColors={["transparent", "transparent"]}
              icon={
                <Icon name="closes" color={theme.lightColors?.magenta} family="custom" size={30} />
              }
            />
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}></View>

          {/* Title */}
          <Text style={[styles.title, {color: theme.lightColors?.white}]}>
            You're Close to {arName}!
          </Text>

          {/* Message */}
          <Text style={[styles.message, {color: theme.lightColors?.white}]}>
            Switch to Live View to interact with the AR
          </Text>

          {/* Switch to Live Button */}
          <AppButton onPress={handleSwitchToLive} title="Switch to Live View" />
        </View>
      </ReactNativeModal>
    </View>
  );
};

const styles = StyleSheet.create({
  alertContent: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
    gap: 16,
    maxWidth: 340,
    alignSelf: "center",
  },
  closeButtonContainer: {
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 10,
  },
  iconContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: FontSizes.S20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: FontSizes.S16,
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.9,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonText: {
    fontSize: FontSizes.S16,
    fontWeight: "600",
  },
});

export default ARProximityAlert;
