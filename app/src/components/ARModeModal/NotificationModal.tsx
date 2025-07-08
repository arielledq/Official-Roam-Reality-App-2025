import React from "react";
import {View, Text, StyleSheet} from "react-native";
import ReactNativeModal from "react-native-modal";

import {AR_MODES} from "../../constants/index.ts";
import {FontSizes} from "util/FontUtils.ts";

import {AppButton} from "components";
import Icon from "components/Icon";

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedMode: any;
}

const NotificationModal = ({isVisible = false, onClose, selectedMode}: NotificationModalProps) => {
  if (!isVisible) return null;

  const isHuntMode = selectedMode?.mode === AR_MODES.HUNT_MODE;

  return (
    <View style={{flex: 1, position: "absolute", top: 0, bottom: 0, left: 0, right: 0}}>
      <ReactNativeModal
        style={{alignItems: "center"}}
        isVisible={isVisible}
        onDismiss={onClose}
        onBackdropPress={onClose}
      >
        <View style={[styles.modalContent, {backgroundColor: "#000000AA"}]}>
          <View style={{height: isHuntMode ? 20 : "auto", justifyContent: "center"}}>
            <Icon name={selectedMode?.icon} family="custom" size={isHuntMode ? 90 : 60} />
          </View>
          <Text style={{fontSize: FontSizes.S20, fontWeight: "bold", color: "#C881F0"}}>
            {selectedMode?.listLabel}
          </Text>
          <Text
            style={{fontSize: FontSizes.S15, fontWeight: "500", color: "#fff", textAlign: "center"}}
          >
            {selectedMode?.modeSubTitle1}
          </Text>
          <Text
            style={{
              fontSize: FontSizes.S14,
              fontWeight: "bold",
              color: "#C881F0",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            {selectedMode?.modeSubTitle2}
          </Text>
          <AppButton
            size={"sm"}
            customColors={["transparent", "transparent"]}
            title={"Okay"}
            titleStyle={{color: "#67CE67", fontSize: 16, fontWeight: "700"}}
            containerStyle={{minHeight: 20, height: 20}}
            buttonStyle={{height: 30}}
            onPress={onClose}
          />
        </View>
      </ReactNativeModal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 24,
    alignItems: "center",
    gap: 16,
    maxHeight: "60%",
    maxWidth: "95%",
  },
});

export default NotificationModal;
