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
  imageSource: any | {uri: string};
  text: string;
}

const IGPostTypeButton = ({onPress, imageSource, text}: IGPostTypeButtonProps) => {
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
      <View style={{height: 64, width: 64, justifyContent: "center", alignItems: "center"}}>
        <Image source={imageSource} />
      </View>
      <Text style={{color: theme.lightColors?.white, fontSize: 12}}>{text}</Text>
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
    let ext = (fileExt || "").replace(/^\./, "").toLowerCase(); // "mp4", "png", etc.

    let updatedFileUri = fileUri || "";
    try {
      if (updatedFileUri) {
        const isHttp = updatedFileUri.startsWith("http");
        const isFile = updatedFileUri.startsWith("file://");
        if (!isHttp && !isFile) {
          updatedFileUri = updatedFileUri.startsWith("/")
              ? `file://${updatedFileUri}`
              : `file://${RNFS.CachesDirectoryPath}/${updatedFileUri}`;
        } else if (isHttp) {
          setLoading?.(true);
          const urlNoQuery = updatedFileUri.split("?")[0];
          const filename = urlNoQuery.split("/").pop() || `shared_${Date.now()}.${ext || "bin"}`;
          const localFilePath = `${RNFS.CachesDirectoryPath}/${filename}`;
          const { statusCode } = await RNFS.downloadFile({
            fromUrl: updatedFileUri,
            toFile: localFilePath,
          }).promise;
          if (statusCode === 200) {
            updatedFileUri = `file://${localFilePath}`;
          } else {
            throw new Error(`Download failed with status ${statusCode}`);
          }
        }
      }
    } catch (e) {
      console.error("Error preparando media para compartir:", e);
      setLoading?.(false);
      Alert.alert("Error", "No se pudo preparar el archivo para compartir.");
      return;
    } finally {
      setLoading?.(false);
    }

    if (!updatedFileUri) {
      Alert.alert("Error", "No hay archivo para compartir.");
      return;
    }

    const cleanDescription =
        sponsor?.description ? sponsor.description.replace(/<[^>]*>/g, "") : "";
    const tagsRaw = sponsor?.tags || "";
    const tagsMulti = tagsRaw.replace(/,\s*/g, "\n");
    let shareMessageBase = `${cleanDescription}${cleanDescription && tagsMulti ? "\n\n" : ""}${tagsMulti}`.trim();

    const firstHashtag = (() => {
      const m = tagsRaw.match(/#[^\s#,]+/);
      return m ? m[0] : undefined;
    })();

    let hasSharedToSSNN = false;
    try {
      switch (selectedSSNN) {
        case SSNN.INSTAGRAM: {
          let shareOptions: any = {
            social: Share.Social.INSTAGRAM_STORIES,
            appId: Config.FACEBOOK_APP_ID,
          };
          if (ext === "mp4") {
            shareOptions = { ...shareOptions, backgroundVideo: updatedFileUri };
          } else {
            shareOptions = { ...shareOptions, backgroundImage: updatedFileUri };
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
                  video: { localUrl: updatedFileUri }, // usar SIEMPRE updatedFileUri
                  commonParameters: firstHashtag ? { hashtag: firstHashtag } : undefined,
                };
                const canShow = await ShareDialog.canShow(shareLinkContent);
                if (canShow) {
                  const result = await ShareDialog.show(shareLinkContent);
                  if (!result.isCancelled) hasSharedToSSNN = true;
                }
              } else {
                const shareLinkContent: SharePhotoContent = {
                  contentType: "photo",
                  photos: [{ imageUrl: updatedFileUri, userGenerated: true }],
                  commonParameters: firstHashtag ? { hashtag: firstHashtag } : undefined,
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
            console.error("Facebook share error:", error);
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
    } catch (error: any) {
      console.error("Error sharing media:", error?.message, error);
      if (error?.message?.includes("not installed") || error?.message?.includes("No app")) {
        Alert.alert("Error", "No tienes la app requerida instalada.");
      } else {
        Alert.alert("Error", "No se pudo compartir el contenido.");
      }
    } finally {
      setShowChooseIGPostType?.(false);
    }

    if (!isMemory && hasSharedToSSNN) {
      try {
        const grantSocialPointsHandler = async (selectedSSNNStr: string) => {
          await socialPointsARUpdateAPI({ social_network: selectedSSNNStr });
          showMessage?.(
              "You've been granted points for sharing to your socials",
              "success",
              `Socials points granted!`
          );
        };
        onPointsGranted?.(selectedSSNN, grantSocialPointsHandler);
      } catch (e: any) {
        console.error("Error assigning points:", e?.message, e);
      }
    }
  };


  if (!isVisible) return null;

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
    <View style={{flex: 1, position: "absolute"}}>
      <ReactNativeModal isVisible={isVisible} onDismiss={onClose} onBackdropPress={onClose}>
        <View
          style={{
            backgroundColor: theme.lightColors?.grey4,
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
