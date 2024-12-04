import * as React from "react";
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { FontSizes } from "../util/FontUtils";
import fontGroup from "../assets/fonts";
import theme from "../assets/theme";

// @ts-ignore
import CaptureIcon from "../assets/geoar/capture_icon.svg";

interface CameraControlsProps {
  hasCapturedContent: boolean;
  onRetake?: () => void;
  onDone?: () => void;
  onCameraPress?: () => void;
  startRecordVideo?: () => void;
  stopRecordVideo?: () => void;
  customInstructions?: string;
  isRecording?: boolean;
  timer?: string;
  isVideo?: boolean;
  challengeHasFilters?: boolean;
}

const CameraControls = ({
  hasCapturedContent,
  onRetake,
  onDone,
  onCameraPress,
  startRecordVideo,
  stopRecordVideo,
  customInstructions = "",
  isRecording,
  timer,
  isVideo,
  challengeHasFilters,
}: CameraControlsProps) => {
  const videoInstructionText = isRecording ? timer : "Press and hold the button to record a video";
  const photoInstructionText = customInstructions || "Tap the button to take a picture";
  const instructionText = isVideo ? videoInstructionText : photoInstructionText;

  return (
    <View
      style={{
        backgroundColor: "#131422",
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <View style={$holdTextContainer}>
        {challengeHasFilters && hasCapturedContent && (
          <Text style={$holdText}>Swipe Left or Right for Filters</Text>
        )}
        {!hasCapturedContent && <Text style={$holdText}>{instructionText}</Text>}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" }}>
        {hasCapturedContent && !!onRetake && (
          <TouchableOpacity onPress={onRetake} activeOpacity={0.8} style={$actionButtons}>
            <Text style={$bottomButtonText}>Retake</Text>
          </TouchableOpacity>
        )}

        {!hasCapturedContent && (
          <TouchableOpacity
            onPress={() => {
              if (isVideo || !onCameraPress) return;
              onCameraPress();
            }}
            onLongPress={() => {
              if (!isVideo || !startRecordVideo) return;
              startRecordVideo();
            }}
            onPressOut={() => {
              if (!isVideo || !stopRecordVideo) return;
              stopRecordVideo();
            }}
            style={$cameraButton}
          >
            <CaptureIcon />
          </TouchableOpacity>
        )}

        {hasCapturedContent && !!onDone && (
          <TouchableOpacity onPress={onDone} activeOpacity={0.8} style={$actionButtons}>
            <Text style={$bottomButtonText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
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
  marginVertical: 8,
};

// @ts-ignore
const $bottomButtonText: TextStyle = {
  ...fontGroup.p700,
  color: theme.lightColors?.white,
  fontSize: FontSizes.S16,
};

// @ts-ignore
const $holdText: TextStyle = {
  ...fontGroup.p600,
  fontSize: FontSizes.S10,
  textAlign: "center",
  color: theme.lightColors?.white,
};

const $holdTextContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  paddingTop: 4,
  paddingBottom: 16,
  paddingHorizontal: 32,
  gap: 8,
};
