import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Linking, Alert, Platform } from "react-native";
import RNFS from "react-native-fs";

import Share from "react-native-share";
import ReactNativeModal from "react-native-modal";

import AppButton from "./button";
import theme from "assets/theme";
import { FontFamily, FontSizes } from "util/FontUtils";
import { socialPointsARUpdateAPI } from "network";
import Images from "assets/images";
import { showMessage } from "util/helpers";
import Config from "config";
import { SHARE_CONDITIONS_TEXT, SSNN, SSNN_TYPE } from "../constants";

import { ShareDialog } from "react-native-fbsdk-next";
import FullScreenLoadingSpinner from "./FullScreenLoadingSpinner";

/**
 * Converts a local file to a base64 data URI.
 * @param {string} fileUri - The local file URI.
 * @param {string} fileExt - The file extension (e.g., 'jpg', 'png', or 'mp4').
 * @returns {Promise<string|null>} The data URI or null if there was an error.
 */
const getBase64DataUri = async (fileUri = "", fileExt = "") => {
  // Ensure the URI doesn't include the "file://" prefix for RNFS.readFile
  const normalizedUri = fileUri.startsWith("file://") ? fileUri.replace("file://", "") : fileUri;

  try {
    const base64Data = await RNFS.readFile(normalizedUri, "base64");
    if (fileExt === "mp4") {
      // For videos, note that large files may become impractical as base64 strings
      return `data:video/mp4;base64,${base64Data}`;
    } else {
      // For images
      return `data:image/${fileExt};base64,${base64Data}`;
    }
  } catch (error) {
    console.error("Error converting file to base64:", error);
    return null;
  }
};

interface IGPostTypeButtonProps {
  onPress: () => {};
  imageSource: any | { uri: string };
  text: string;
}

const IGPostTypeButton = ({ onPress, imageSource, text }: IGPostTypeButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 8,
        paddingVertical: 16,
        borderRadius: 8,
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 16,
        borderColor: theme.lightColors?.purple,
        borderWidth: 3,
        width: 124,
      }}
    >
      <View style={{ height: 64, width: 64, justifyContent: "center", alignItems: "center" }}>
        <Image source={imageSource} />
      </View>
      <Text style={{ color: theme.lightColors?.white, fontSize: 12 }}>{text}</Text>
    </TouchableOpacity>
  );
};

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
  const [showChooseIGPostType, setShowChooseIGPostType] = useState(false);
  const [loading, setLoading] = useState(false);

  const share = async (selectedSSNN: SSNN_TYPE) => {
    // Construct the full file:// URI more explicitly
    let updatedFileUri = fileUri || "";

    if (updatedFileUri) {
      // Check if fileUri is not null or undefined
      if (!updatedFileUri.startsWith("file://") && !updatedFileUri.startsWith("http")) {
        if (updatedFileUri.startsWith("/")) {
          updatedFileUri = `file://${updatedFileUri}`; // Correctly handle paths starting with /
        } else {
          updatedFileUri = `file://${RNFS.CachesDirectoryPath}/${updatedFileUri}`; // If relative, assume it's in cache (adjust if needed) - requires react-native-fs
        }
      } else if (updatedFileUri.startsWith("http")) {
        // download image and get local uri
        try {
          setLoading(true);
          // Get the filename from the URL
          const filename = updatedFileUri.split("?")[0].split("/").pop();

          // Determine the local file path
          const localFilePath = `${RNFS.CachesDirectoryPath}/${filename}`;

          // Download the file
          const download = RNFS.downloadFile({
            fromUrl: updatedFileUri,
            toFile: localFilePath,
          });

          const downloadResult = await download.promise;

          if (downloadResult.statusCode === 200) {
            updatedFileUri = `file://${localFilePath}`;
          } else {
            console.error("Failed to download file:", downloadResult);
            // Handle download error appropriately
          }
        } catch (error) {
          console.error("Error downloading media:", error);
          // Handle sharing error appropriately
        } finally {
          setLoading(false);
        }
      }
    }

    // Determine MIME type based on file extension
    const mimeType = fileExt === "mp4" ? "video/mp4" : `image/${fileExt}`;

    // Share the file
    let shareOptions = {};

    const shareMessage = `${
      sponsor?.description ? sponsor.description.replace(/<[^>]*>/g, "") : ""
    }\n\n${sponsor?.tags ? sponsor.tags.replace(",", "\n") : ""}`;

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
        if (Platform.OS === "ios") {
          if (fileExt === "mp4") {
            shareOptions = {
              contentType: "video",
              video: {
                localUrl: updatedFileUri,
              },
            };
          } else {
            shareOptions = {
              contentType: "photo",
              photos: [
                {
                  imageUrl: updatedFileUri,
                },
              ],
            };
          }
        } else {
          shareOptions = {
            social: Share.Social.FACEBOOK,
            appId: Config.FACEBOOK_APP_ID,
            message: shareMessage,
          };

          // Convert the file to a base64 data URI
          const dataUri = await getBase64DataUri(updatedFileUri, fileExt);
          if (!dataUri) {
            Alert.alert("Error", "Failed to convert content for Facebook");
            return;
          }

          shareOptions = { ...shareOptions, url: dataUri };
        }

        break;
      case SSNN.OTHERS:
        shareOptions = {
          url: updatedFileUri,
          type: mimeType,
          message: shareMessage,
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
        if (Platform.OS === "ios" && selectedSSNN === SSNN.FACEBOOK) {
          await ShareDialog.canShow(shareOptions);
          const resultDialog = await ShareDialog.show(shareOptions);
          if (resultDialog?.isCancelled) {
            throw new Error("Share cancelled");
          }
          hasShared = true;
        } else {
          // @ts-ignore
          await Share.shareSingle(shareOptions);
          hasShared = true;
        }
      }
    } catch (error: any) {
      console.error("Error sharing media:", error?.message, error);
    } finally {
      setShowChooseIGPostType(false);
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

  const ChooseSocialNetwork = (
    <>
      <Text
        style={{ fontSize: FontSizes.S20, fontWeight: "bold", color: theme.lightColors?.white }}
      >
        Share To Socials
      </Text>

      <Text style={{ fontSize: FontSizes.S12, color: theme.lightColors?.grey0 }}>
        {SHARE_CONDITIONS_TEXT}
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
    </>
  );

  const ChooseInstagramPostType = (
    <>
      <View style={{ alignItems: "center", gap: 16 }}>
        <Text style={{ color: theme.lightColors?.white }}>Choose how to share on Instagram</Text>

        <View style={{ flexDirection: "row", gap: 16 }}>
          <IGPostTypeButton
            onPress={() => share(SSNN.INSTAGRAM, Share.Social.INSTAGRAM_STORIES)}
            text="Share to Stories"
            imageSource={require("../assets/images/ig_stories.png")}
          />

          <IGPostTypeButton
            onPress={() => share(SSNN.INSTAGRAM, Share.Social.INSTAGRAM)}
            text="Share to Feed"
            imageSource={require("../assets/images/ig_post.png")}
          />
        </View>
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, position: "absolute" }}>
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
          {showChooseIGPostType ? ChooseInstagramPostType : ChooseSocialNetwork}
          <FullScreenLoadingSpinner isLoading={loading} />
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
