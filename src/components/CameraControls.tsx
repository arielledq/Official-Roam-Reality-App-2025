import * as React from "react";
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { FontSizes } from "../util/FontUtils";
import fontGroup from "../assets/fonts";
import theme from "../assets/theme";

// @ts-ignore
import CaptureIcon from "../assets/geoar/capture_icon.svg";

interface CameraControlsProps {
  hasCapturedImage: boolean;
  onRetake?: () => void;
  onDone?: () => void;
  onCameraPress?: () => void;
  onCameraHold?: () => void;
}

const CameraControls = ({
  hasCapturedImage,
  onRetake,
  onDone,
  onCameraPress,
  onCameraHold,
}: CameraControlsProps) => {
  return (
    <View
      style={{
        backgroundColor: "#131422",
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
      }}
    >
      {hasCapturedImage && !!onRetake && (
        <TouchableOpacity onPress={onRetake} activeOpacity={0.8} style={$actionButtons}>
          <Text style={$bottomButtonText}>Retake</Text>
        </TouchableOpacity>
      )}

      {!hasCapturedImage && (!!onCameraPress || !!onCameraHold) && (
        <TouchableOpacity onPress={onCameraPress} style={$cameraButton}>
          <CaptureIcon />
        </TouchableOpacity>
      )}

      {hasCapturedImage && !!onDone && (
        <TouchableOpacity onPress={onDone} activeOpacity={0.8} style={$actionButtons}>
          <Text style={$bottomButtonText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CameraControls;

const $cameraButton: ViewStyle = {
  width: 56,
  height: 56,
};

const $actionButtons: ViewStyle = {
  borderRadius: 8,
  backgroundColor: "#FFFFFF40",
  alignItems: "center",
  justifyContent: "center",
  width: 96,
  height: 42,
};

// @ts-ignore
const $bottomButtonText: TextStyle = {
  ...fontGroup.p700,
  color: theme.lightColors?.white,
  fontSize: FontSizes.S16,
};
