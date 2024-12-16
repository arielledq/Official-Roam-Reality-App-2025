import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

import Share from "react-native-share";
import ReactNativeModal from "react-native-modal";

import AppButton from "./button";
import theme from "assets/theme";
import { FontFamily, FontSizes } from "util/FontUtils";
import { socialPointsARUpdateAPI } from "network";
import Images from "assets/images";

interface ShareToSocialsModalProps {
  isVisible: boolean;
  onClose: () => void;
  fileUri: string;
  fileExt: string;
}

type SSNN = "IG" | "FB" | "TT";

const ShareToSocialsModal: React.FC<ShareToSocialsModalProps> = ({
  isVisible,
  onClose,
  fileUri,
  fileExt,
}) => {
  const share = async (ssnn: SSNN) => {
    // If correctedCaptureData doesn't already have "file://" prefix, add it
    if (!fileUri.startsWith("file://")) {
      fileUri = `file://${fileUri}`;
    }

    // Determine MIME type based on file extension
    const mimeType = fileExt === "mp4" ? "video/mp4" : `image/${fileExt}`;

    // Share the file
    try {
      let shareOptions = {
        // backgroundImage: "http://urlto.png",
        // stickerImage: "data:image/png;base64,<imageInBase64>", //or you can use "data:" link
        // backgroundBottomColor: "#fefefe",
        // backgroundTopColor: "#906df4",
        // attributionURL: "http://deep-link-to-app", //in beta
        // social: Share.Social.INSTAGRAM_STORIES,
        // appId: "your_fb_app_id",
      };

      switch (ssnn) {
        case "IG":
          shareOptions = {
            ...shareOptions,
            social: Share.Social.INSTAGRAM_STORIES,
            appId: "your_fb_app_id",
          };
          if (fileExt === "mp4") {
            shareOptions = { ...shareOptions, backgroundImage: fileUri };
          } else {
            shareOptions = { ...shareOptions, backgroundVideo: fileUri };
          }
          break;
        case "FB":
          shareOptions = {
            ...shareOptions,
            social: Share.Social.FACEBOOK_STORIES,
            appId: "your_fb_app_id",
          };
          if (fileExt === "mp4") {
            shareOptions = { ...shareOptions, backgroundImage: fileUri };
          } else {
            shareOptions = { ...shareOptions, backgroundVideo: fileUri };
          }
          break;
        case "TT":
          /**
            TODO: Refer to these links
              https://developers.tiktok.com/doc/mobile-sdk-ios-quickstart
              https://developers.tiktok.com/doc/share-kit-ios-quickstart-v2?enter_method=left_navigation
              https://developers.tiktok.com/doc/mobile-sdk-android-quickstart
              https://developers.tiktok.com/doc/share-kit-android-quickstart-v2?enter_method=left_navigation
          */
          // shareOptions = {
          //   ...shareOptions,
          //   social: Share.Social.FACEBOOK_STORIES,
          //   appId: "your_fb_app_id",
          // };
          // if (fileExt === "mp4") {
          //   shareOptions = { ...shareOptions, backgroundImage: fileUri };
          // } else {
          //   shareOptions = { ...shareOptions, backgroundVideo: fileUri };
          // }
          break;

        default:
          break;
      }

      await Share.open({
        url: fileUri,
        type: mimeType,
      });

      await socialPointsARUpdateAPI({
        social_network: "",
      });
      // showMessage(
      //   "You've been granted points for sharing to your socials",
      //   "success",
      //   `Socials points granted!`
      // );
    } catch (error: any) {
      console.error("Error sharing media:", error?.message, error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ReactNativeModal isVisible={isVisible} onDismiss={onClose} onBackdropPress={onClose}>
        <View
          style={{
            backgroundColor: theme.lightColors?.boxStatBG,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 24,
            alignItems: "center",
            gap: 16,
          }}
        >
          <Text
            style={{ fontSize: FontSizes.S20, fontWeight: "bold", color: theme.lightColors?.white }}
          >
            Share To Socials
          </Text>

          <Text style={{ fontSize: FontSizes.S12, color: theme.lightColors?.grey }}>
            Must share to at least one social media platform to earn any points. Users earn one
            additional point per social platform.
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 32 }}>
            <TouchableOpacity>
              <Image source={Images.Instagram} style={{ height: 40, width: 40 }} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={Images.Facebook} style={{ height: 40, width: 40 }} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={Images.TikTok}
                style={{
                  height: 40,
                  width: 40,
                  backgroundColor: "white",
                  borderRadius: 80,
                }}
              />
            </TouchableOpacity>
          </View>

          <AppButton
            onPress={onClose}
            buttonStyle={{ height: 45, width: 95 }}
            containerStyle={{}}
            title={"Done"}
          />
        </View>
      </ReactNativeModal>
    </View>
  );
};

const styles = {
  modal: {
    backgroundColor: theme.lightColors?.boxStatBG,
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 26,
    color: theme.lightColors?.white,
    fontFamily: FontFamily.PoppinsBold,
    fontWeight: 600,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 18,
    color: theme.lightColors?.white,
    fontFamily: FontFamily.NunitoSansRegular,
    fontWeight: 400,
    marginBottom: 15,
  },
  description: {
    fontSize: 30,
    fontWeight: 400,
    fontFamily: FontFamily.PoppinsBold,
    minHeight: 300,
    flex: 1,
    backgroundColor: theme.lightColors?.boxStatBG,
  },
};

export default ShareToSocialsModal;
