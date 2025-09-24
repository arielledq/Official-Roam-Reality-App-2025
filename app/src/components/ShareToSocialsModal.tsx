import React, {useEffect, useRef, useState} from "react";
import {View, Text, TouchableOpacity, Image, Alert, Platform} from "react-native";
import RNFS from "react-native-fs";
import {ShareDialog, SharePhotoContent, ShareVideoContent} from "react-native-fbsdk-next";

import Share from "react-native-share";
import ReactNativeModal from "react-native-modal";

import AppButton from "./button";
import theme from "assets/theme";
import {FontFamily, FontSizes} from "util/FontUtils";
import {socialPointsARUpdateAPI} from "network";
import Images from "assets/images";
import {showMessage} from "util/helpers";
import Config from "config";
import {SHARE_CONDITIONS_TEXT, SSNN, SSNN_TYPE} from "../constants";

import FullScreenLoadingSpinner from "./FullScreenLoadingSpinner";
import IGPostTypeButton from "./ShareToSocialsModal/IGPostTypeButton";

import {
  prepareFileForSharing,
  extractFirstHashtag,
  prepareShareMessage,
  normalizeFileExt,
} from "../util/helpers";

interface ShareToSocialsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onPointsGranted?: (selectedSSNN: string) => void;
  fileUri?: string | undefined;
  fileExt?: string | undefined;
  sponsor?: {description: string; tags: string} | undefined;
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
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  const handleSharingError = (error: any) => {
    console.error("Sharing error:", error);

    if (error?.message?.includes("not installed") || error?.message?.includes("No app")) {
      Alert.alert("App Required", "The required app is not installed on your device.");
    } else if (error?.message?.includes("User did not share")) {
      // Silent handling for user cancellation
      return;
    } else if (!error?.message?.includes("No file URI available")) {
      Alert.alert("Sharing Failed", "The content could not be shared. Please try again.");
    }
  };

  const safeSetLoading = (value: boolean) => {
    if (isMounted.current) {
      setLoading(value);
    }
  };

  const share = async (selectedSSNN: SSNN_TYPE, postType: "stories" | "feed" = "stories") => {
    const ext = normalizeFileExt(fileExt); // "mp4", "png", etc.

    try {
      safeSetLoading(true);
      const updatedFileUri = await prepareFileForSharing(fileUri || "", ext);

      const shareMessageBase = prepareShareMessage(sponsor);
      const firstHashtag = extractFirstHashtag(sponsor?.tags);

      let hasSharedToSSNN = false;

      switch (selectedSSNN) {
        case SSNN.INSTAGRAM: {
          // Determine the social type based on postType
          const socialType =
            postType === "feed" ? Share.Social.INSTAGRAM : Share.Social.INSTAGRAM_STORIES;

          let shareOptions: any = {
            social: socialType,
            appId: Config.FACEBOOK_APP_ID,
          };
          if (ext === "mp4") {
            shareOptions = {...shareOptions, backgroundVideo: updatedFileUri};
          } else {
            shareOptions = {...shareOptions, backgroundImage: updatedFileUri};
          }
          await Share.shareSingle(shareOptions);
          hasSharedToSSNN = true;
          break;
        }

        case SSNN.FACEBOOK: {
          try {
            if (Platform.OS === "ios") {
              if (ext === "mp4") {
                // @ts-ignore
                const shareLinkContent: ShareVideoContent = {
                  contentType: "video",
                  commonParameters: firstHashtag ? {hashtag: firstHashtag} : undefined,
                };
                const isHttp = updatedFileUri.startsWith("http");
                const isFile = updatedFileUri.startsWith("file://");

                if (isHttp) {
                  shareLinkContent.contentUrl = updatedFileUri;
                } else if (isFile) {
                  shareLinkContent.video = {localUrl: updatedFileUri};
                }
                const canShow = await ShareDialog.canShow(shareLinkContent);
                if (canShow) {
                  const result = await ShareDialog.show(shareLinkContent);
                  if (!result.isCancelled) hasSharedToSSNN = true;
                }
              } else {
                const shareLinkContent: SharePhotoContent = {
                  contentType: "photo",
                  photos: [{imageUrl: updatedFileUri, userGenerated: true}],
                  commonParameters: firstHashtag ? {hashtag: firstHashtag} : undefined,
                };
                const canShow = await ShareDialog.canShow(shareLinkContent);
                if (canShow) {
                  await ShareDialog.show(shareLinkContent);
                  hasSharedToSSNN = true;
                }
              }
            } else {
              const shareOptions: any = {
                title: "Share via",
                message: shareMessageBase,
                url: updatedFileUri,
                social: Share.Social.FACEBOOK,
                type: ext === "mp4" ? "video/mp4" : `image/${ext}`,
              };
              await Share.shareSingle(shareOptions);
              hasSharedToSSNN = true;
            }
          } catch (error) {
            // Fallback to generic share
            const shareOptions = {
              title: "Share via",
              message: shareMessageBase,
              url: updatedFileUri,
              type: ext === "mp4" ? "video/mp4" : `image/${ext}`,
            };
            await Share.open(shareOptions);
            hasSharedToSSNN = true;
          }
          break;
        }

        case SSNN.OTHERS: {
          const mimeType = ext === "mp4" ? "video/mp4" : `image/${ext}`;
          const shareOptions = {
            url: updatedFileUri,
            type: mimeType,
            message: shareMessageBase,
          };
          await Share.open(shareOptions);
          hasSharedToSSNN = true;
          break;
        }

        default:
          break;
      }

      // Handle points granting if sharing was successful
      if (!isMemory && hasSharedToSSNN) {
        try {
          await socialPointsARUpdateAPI({social_network: selectedSSNN});
          showMessage(
            "You've been granted points for sharing to your socials",
            "success",
            "Socials points granted!"
          );
          if (onPointsGranted) onPointsGranted(selectedSSNN);
        } catch (error: any) {
          console.error("Error assigning points:", error?.message, error);
        }
      }
    } catch (error: any) {
      handleSharingError(error);
    } finally {
      safeSetLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onDismiss={onClose}
      onBackdropPress={onClose}
      style={{margin: 0}}
    >
      <View
        style={{
          backgroundColor: theme.lightColors?.grey4,
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 24,
          alignItems: "center",
          gap: 16,
          marginHorizontal: 20,
          alignSelf: "center",
          marginTop: "auto",
          marginBottom: "auto",
        }}
      >
        <Text
          style={{fontSize: FontSizes.S20, fontWeight: "bold", color: theme.lightColors?.white}}
        >
          Share To Socials
        </Text>

        <Text style={{fontSize: FontSizes.S12, color: theme.lightColors?.grey0}}>
          {SHARE_CONDITIONS_TEXT}
        </Text>

        <View style={{flexDirection: "row", justifyContent: "center", gap: 32}}>
          <TouchableOpacity onPress={() => share(SSNN.INSTAGRAM)}>
            <Image source={Images.Instagram} style={{height: 40, width: 40}} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => share(SSNN.FACEBOOK)}>
            <Image source={Images.Facebook} style={{height: 40, width: 40}} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => share(SSNN.OTHERS)}>
            <Image source={Images.TikTokShare} style={{height: 40, width: 68}} />
          </TouchableOpacity>
        </View>

        <AppButton
          onPress={onClose}
          buttonStyle={{height: 45, width: 95}}
          containerStyle={{}}
          title={"Done"}
        />
        <FullScreenLoadingSpinner isLoading={loading} />
      </View>
    </ReactNativeModal>
  );
};

const styles = {
  modal: {
    backgroundColor: theme.lightColors?.grey4,
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
    backgroundColor: theme.lightColors?.grey4,
  },
};

export default ShareToSocialsModal;
