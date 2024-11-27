import * as React from "react";
import { Image, LayoutChangeEvent, Text, View } from "react-native";
import BackgroundWithImage from "./background";
import UnityView from "@azesmway/react-native-unity/src";
import Video from "react-native-video";

interface UnityARCameraProps {
  unityRef?: any;
  isProcessingMedia?: boolean;
  isUnityLoaded?: boolean;
  onUnityMessage?: (message: string | any) => void;
  onUnityLayout?: (event?: LayoutChangeEvent) => void;
  capturedImage?: string;
  capturedVideo?: string;
}

const UnityARCamera = ({
  unityRef = null,
  isProcessingMedia = false,
  isUnityLoaded = false,
  onUnityMessage,
  onUnityLayout,
  capturedImage,
  capturedVideo,
}: UnityARCameraProps) => {
  return (
    <View style={{ marginVertical: 20, minHeight: 512 }}>
      <View style={{ flex: 1 }}>
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
            <BackgroundWithImage>
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
                  <UnityView ref={unityRef} style={{ flex: 1 }} onUnityMessage={onUnityMessage} />
                </View>
              )}
            </BackgroundWithImage>
            {capturedImage && (
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
