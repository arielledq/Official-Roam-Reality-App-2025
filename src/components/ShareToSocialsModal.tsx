import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

import Share from "react-native-share";
import ReactNativeModal from "react-native-modal";

import AppButton from "./button";
import theme from "assets/theme";
import { FontFamily, FontSizes } from "util/FontUtils";
import { socialPointsARUpdateAPI } from "network";
import Images from "assets/images";
import { showMessage } from "util/helpers";
import Config from "config";
import { SSNN } from "../constants";

interface ShareToSocialsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onPointsGranted: (
    selectedSSNN: string,
    grantSocialPointsHandler: (selectedSSNN: string) => {}
  ) => void;
  fileUri?: string | undefined;
  fileExt?: string | undefined;
  sponsor?: { description: string; tags: string } | undefined;
  isMemory?: boolean;
}

const ShareToSocialsModal: React.FC<ShareToSocialsModalProps> = ({
  isVisible = false,
  onClose,
  onPointsGranted,
  fileUri,
  fileExt,
  sponsor,
  isMemory = false,
}) => {
  const share = async (selectedSSNN: string) => {
    // If correctedCaptureData doesn't already have "file://" prefix, add it
    let updatedFileUri = fileUri;
    if (!updatedFileUri?.startsWith("file://")) {
      updatedFileUri = `file://${fileUri}`;
    }

    // Determine MIME type based on file extension
    const mimeType = fileExt === "mp4" ? "video/mp4" : `image/${fileExt}`;

    // Share the file
    let shareOptions = {};

    switch (selectedSSNN) {
      case SSNN.INSTAGRAM:
        shareOptions = {
          social: Share.Social.INSTAGRAM_STORIES,
          appId: Config.FACEBOOK_APP_ID,
        };
        if (fileExt === "mp4") {
          shareOptions = { ...shareOptions, backgroundVideo: updatedFileUri };
        } else {
          shareOptions = { ...shareOptions, backgroundImage: updatedFileUri };
        }
        break;
      case SSNN.FACEBOOK:
        shareOptions = {
          social: Share.Social.FACEBOOK_STORIES,
          appId: Config.FACEBOOK_APP_ID,
        };
        if (fileExt === "mp4") {
          shareOptions = { ...shareOptions, backgroundImage: updatedFileUri };
        } else {
          shareOptions = { ...shareOptions, backgroundVideo: updatedFileUri };
        }
        break;
      case SSNN.OTHERS:
        shareOptions = {
          url: updatedFileUri,
          type: mimeType,
          message: `${sponsor?.description ? sponsor.description.replace(/<[^>]*>/g, "") : ""}\n\n${
            sponsor?.tags ? sponsor.tags.replace(",", "\n") : ""
          }`,
        };
        break;

      default:
        break;
    }

    let hasShared = false;
    try {
      if (selectedSSNN === SSNN.OTHERS) {
        await Share.open(shareOptions);
        hasShared = true;
      } else {
        // @ts-ignore
        await Share.shareSingle(shareOptions);
        hasShared = true;
      }
    } catch (error: any) {
      console.error("Error sharing media:", error?.message, error);
    }
    if (!isMemory && hasShared) {
      try {
        const grantSocialPointsHandler = async (selectedSSNN: string) => {
          await socialPointsARUpdateAPI({
            social_network: selectedSSNN,
          });

          showMessage(
            "You've been granted points for sharing to your socials",
            "success",
            `Socials points granted!`
          );
        };
        onPointsGranted(selectedSSNN, grantSocialPointsHandler);
      } catch (error: any) {
        console.error("Error assigning points:", error?.message, error);
      }
    }
  };

  if (!isVisible) return null;

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

          <Text style={{ fontSize: FontSizes.S12, color: theme.lightColors?.grey0 }}>
            Must share to at least one social media platform to earn any points. Users earn one
            additional point per social platform.
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 32 }}>
            <TouchableOpacity onPress={() => share(SSNN.INSTAGRAM)}>
              <Image source={Images.Instagram} style={{ height: 40, width: 40 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => share(SSNN.FACEBOOK)}>
              <Image source={Images.Facebook} style={{ height: 40, width: 40 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => share(SSNN.OTHERS)}>
              <Image source={Images.TikTokShare} style={{ height: 40, width: 68 }} />
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
