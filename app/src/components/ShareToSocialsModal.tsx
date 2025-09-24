import React, {useState} from "react";
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
  onPointsGranted: (
    selectedSSNN: string,
    grantSocialPointsHandler: (selectedSSNN: string) => {}
  ) => void;
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
  const [showChooseIGPostType, setShowChooseIGPostType] = useState(false);
  const [loading, setLoading] = useState(false);

  const share = async (selectedSSNN: SSNN_TYPE) => {
    const ext = normalizeFileExt(fileExt); // "mp4", "png", etc.

    try {
      // Use the helper function to prepare the file
      setLoading(true);
      const updatedFileUri = await prepareFileForSharing(fileUri || "", ext);
      setLoading(false);

      const shareMessageBase = prepareShareMessage(sponsor);
      const firstHashtag = extractFirstHashtag(sponsor?.tags);

      let hasSharedToSSNN = false;

      switch (selectedSSNN) {
        case SSNN.INSTAGRAM: {
          let shareOptions: any = {
            social: Share.Social.INSTAGRAM_STORIES,
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
                const shareLinkContent: ShareVideoContent = {
                  contentType: "video",
                  commonParameters: firstHashtag ? {hashtag: firstHashtag} : undefined,
                  contentUrl: "",
                  video: {localUrl: ""},
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
          const grantSocialPointsHandler = async (selectedSSNNStr: string) => {
            await socialPointsARUpdateAPI({social_network: selectedSSNNStr});
            showMessage(
              "You've been granted points for sharing to your socials",
              "success",
              "Socials points granted!"
            );
          };
          onPointsGranted(selectedSSNN, grantSocialPointsHandler);
        } catch (error: any) {
          console.error("Error assigning points:", error?.message, error);
        }
      }
    } catch (error: any) {
      console.error("Error sharing media:", error?.message, error);
      if (error?.message?.includes("not installed") || error?.message?.includes("No app")) {
        showMessage("The app is not installed.", "error");
      } else if (!error?.message?.includes("No file URI available")) {
        showMessage("The content could not be shared.", "error");
      }
    } finally {
      setShowChooseIGPostType(false);
    }
  };

  const ChooseSocialNetwork = (
    <>
      <Text style={{fontSize: FontSizes.S20, fontWeight: "bold", color: theme.lightColors?.white}}>
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
    </>
  );

  const ChooseInstagramPostType = (
    <>
      <View style={{alignItems: "center", gap: 16}}>
        <Text style={{color: theme.lightColors?.white}}>Choose how to share on Instagram</Text>

        <View style={{flexDirection: "row", gap: 16}}>
          <IGPostTypeButton
            onPress={() => share(SSNN.INSTAGRAM)}
            text="Share to Stories"
            imageSource={require("../assets/images/ig_stories.png")}
          />

          <IGPostTypeButton
            onPress={() => share(SSNN.INSTAGRAM)}
            text="Share to Feed"
            imageSource={require("../assets/images/ig_post.png")}
          />
        </View>
      </View>
    </>
  );

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
        {showChooseIGPostType ? ChooseInstagramPostType : ChooseSocialNetwork}
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
