import React, {useEffect, useRef, useState} from "react";
import {View, Text, TouchableOpacity, Image, Alert, Platform} from "react-native";
import {ShareDialog} from "react-native-fbsdk-next";

import Share from "react-native-share";
import ReactNativeModal from "react-native-modal";

import AppButton from "../button";
import theme from "assets/theme";
import {FontFamily, FontSizes} from "util/FontUtils";
import {socialPointsARUpdateAPI} from "network";
import Images from "assets/images";
import {showMessage} from "util/helpers";
import Config from "config";
import {SHARE_CONDITIONS_TEXT, SSNN, SSNN_TYPE} from "../../constants";

import FullScreenLoadingSpinner from "../FullScreenLoadingSpinner";

import {
  prepareFileForSharing,
  extractFirstHashtag,
  prepareShareMessage,
  normalizeFileExt,
} from "../../util/helpers";

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

  const shareToOthers = async (fileUri: string, ext: string, shareMessageBase: string) => {
    const mimeType = ext === "mp4" ? "video/mp4" : `image/${ext}`;
    const shareOptions = {
      url: fileUri,
      type: mimeType,
      message: shareMessageBase,
    };
    await Share.open(shareOptions);
  };

  const share = async (selectedSSNN: SSNN_TYPE) => {
    const ext = normalizeFileExt(fileExt);

    try {
      safeSetLoading(true);
      const updatedFileUri = await prepareFileForSharing(fileUri || "", ext);

      const shareMessageBase = prepareShareMessage(sponsor);
      const firstHashtag = extractFirstHashtag(sponsor?.tags);

      let hasSharedToSSNN = false;

      const shareToOtherHandler = async () => {
        try {
          await shareToOthers(updatedFileUri, ext, shareMessageBase);
          hasSharedToSSNN = true;
        } catch (error) {
          handleSharingError(error);
        }
      };

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
              const shareLinkContent: any = {};
              if (ext === "mp4") {
                shareLinkContent.contentType = "video";
                shareLinkContent.commonParameters = firstHashtag
                  ? {hashtag: firstHashtag}
                  : undefined;
                shareLinkContent.video = {localUrl: updatedFileUri};
              } else {
                shareLinkContent.contentType = "photo";
                shareLinkContent.photos = [{imageUrl: updatedFileUri, userGenerated: true}];
                shareLinkContent.commonParameters = firstHashtag
                  ? {hashtag: firstHashtag}
                  : undefined;
              }
              const canShow = await ShareDialog.canShow(shareLinkContent);
              if (canShow) {
                const result = await ShareDialog.show(shareLinkContent);
                if (!result.isCancelled) hasSharedToSSNN = true;
              }
            } else {
              shareToOtherHandler();
            }
          } catch (error) {
            console.error("Error sharing to Facebook:", error);
            shareToOtherHandler();
          }
          break;
        }

        case SSNN.OTHERS: {
          shareToOtherHandler();
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
      style={styles.modal}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Share To Socials</Text>

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
  modal: {margin: 0},
  content: {
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
  },
  title: {fontSize: FontSizes.S20, fontWeight: "bold", color: theme.lightColors?.white},
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
