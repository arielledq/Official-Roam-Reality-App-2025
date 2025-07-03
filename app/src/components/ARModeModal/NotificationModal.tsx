import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet} from "react-native";
import ReactNativeModal from "react-native-modal";

import {AR_MODES, ModeType} from "../../constants/index.ts";
import {FontSizes} from "util/FontUtils.ts";

import {AppButton} from "components";
import Icon from "components/Icon";

const NotificationModal = ({
  isVisible = false,
  onClose,
  onPointsGranted,
  sponsor,
  selectedDestination = [],
  selectedMode = AR_MODES.SCAN_MODE,
}) => {
  const [mode, setMode] = useState<ModeType>(selectedMode);

  useEffect(() => {
    if (isVisible && selectedMode) {
      setMode(selectedMode);
    }
  }, [isVisible, selectedMode]);

  const MODE_TITLES: Record<ModeType, string> = {
    ar: "AR MODE",
    scan: "Scan Mode",
    hunt: "Hunt Mode",
    checkin: "Check-In Mode",
  };
  const MODE_SUBTITLES: Record<ModeType, string> = {
    ar: "AR MODE",
    scan: "Users can scan their environment or QR Code to trigger the AR.",
    hunt: "Users are to follow the arrows to find hidden gems",
    checkin: "The Geo Tag is anchored in front of you, size and position fully customisable",
  };
  const MODE_SUBTITLES2: Record<ModeType, string> = {
    ar: "AR MODE",
    scan: "Snap a photo/video with the AR",
    hunt: "TAP the AR to Capture",
    checkin: "Snap a creative photo/video with the Geo-Tag",
  };
  const IconName: Record<ModeType, string> = {
    ar: "scan",
    scan: "scan",
    hunt: "huntMode",
    checkin: "pinlocation",
  };

  if (!isVisible) return null;

  return (
    <View style={{flex: 1, position: "absolute", top: 0, bottom: 0, left: 0, right: 0}}>
      <ReactNativeModal
        style={{alignItems: "center"}}
        isVisible={isVisible}
        onDismiss={onClose}
        onBackdropPress={onClose}
      >
        <View style={[styles.modalContent, {backgroundColor: "#000000AA"}]}>
          <View style={{height: mode === "hunt" ? 20 : "auto", justifyContent: "center"}}>
            <Icon name={IconName[mode]} family="custom" size={mode === "hunt" ? 90 : 60} />
          </View>
          <Text style={{fontSize: FontSizes.S20, fontWeight: "bold", color: "#C881F0"}}>
            {MODE_TITLES[mode]}
          </Text>
          <Text
            style={{fontSize: FontSizes.S15, fontWeight: "500", color: "#fff", textAlign: "center"}}
          >
            {MODE_SUBTITLES[mode]}
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
            {MODE_SUBTITLES2[mode]}
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
