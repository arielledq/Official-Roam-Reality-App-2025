import * as React from "react";
import { Image, LayoutChangeEvent, Text, View, Dimensions } from "react-native";
import UnityView from "@azesmway/react-native-unity/src";
// @ts-expect-error
import Video from "react-native-video";
import ARFilter from "screens/archallenge/FilterView";

const offset = 120;
const { width: screenWidth } = Dimensions.get("window"); // Get screen width
const aspectHeight = ((screenWidth - offset) * 16) / 9; // Calculate height based on 9:16 aspect ratio

interface ImageFilter {
  challengeObj: any;
  viewShotRef: any;
}
interface UnityARCameraProps {
  unityRef?: any;
  isProcessingMedia?: boolean;
  isUnityLoaded?: boolean;
  onUnityMessage?: (message: string | any) => void;
  onUnityLayout?: (event?: LayoutChangeEvent) => void;
  capturedImage?: string;
  imageFilter?: ImageFilter;
  capturedVideo?: string;
}

const UnityARCamera = ({
  unityRef = null,
  isProcessingMedia = false,
  isUnityLoaded = false,
  onUnityMessage,
  onUnityLayout,
  capturedImage,
  imageFilter,
  capturedVideo,
}: UnityARCameraProps) => {
  const imageHasFilters = imageFilter?.challengeObj?.ar_filters?.length > 0;
  return (
    <View style={{ flex: 1, alignItems: "center", marginVertical: 20 }}>
      <View style={{ flex: 1, minHeight: aspectHeight, width: screenWidth - offset }}>
        {isProcessingMedia ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>Processing your content...</Text>
          </View>
        ) : (
          <>
            <View style={{ flex: 1 }}>
              {isUnityLoaded && (
                <View
                  style={{
                    flex: 1,
                    width: "100%",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 16,
                  }}
                  onLayout={onUnityLayout}
                >
                  {/* @ts-ignore */}
                  <UnityView ref={unityRef} style={{ flex: 1 }} onUnityMessage={onUnityMessage} />
                </View>
              )}
            </View>
            {capturedImage && !imageHasFilters && (
              <Image
                style={{
                  width: "100%",
                  flex: 1,
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  position: "absolute",
                  backgroundColor: "#fff",
                }}
                source={{ uri: `file://${capturedImage}` }}
              />
            )}
            {capturedImage && imageHasFilters && (
              <View
                style={{
                  width: "100%",
                  flex: 1,
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  position: "absolute",
                  backgroundColor: "#fff",
                }}
              >
                <ARFilter
                  challengeObj={imageFilter?.challengeObj}
                  viewShotRef={imageFilter?.viewShotRef}
                  captureData={capturedImage}
                />
              </View>
            )}
            {capturedVideo && (
              <Video
                repeat
                style={{
                  width: "100%",
                  flex: 1,
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  position: "absolute",
                  backgroundColor: "#fff",
                }}
                source={{ uri: `file://${capturedVideo}` }}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default UnityARCamera;
