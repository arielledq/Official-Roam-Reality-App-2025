import React from "react";
import { Platform, Pressable, TouchableOpacity, View } from "react-native";
import useStyles from "./styles";
import AppText from "../text";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import FastImage from "react-native-fast-image";
//@ts-ignore
import DownloadImg from "../../assets/ar/download.svg";
import RNFetchBlob from "rn-fetch-blob";
import { requestMultiple, PERMISSIONS } from "react-native-permissions";
import { showMessage, truncateText } from "../../util/helpers";

const MemoryContainer = ({
  item,
  onPressAction,
}: {
  item: any;
  onPressAction?: (file: any, details: any) => void;
}) => {
  const getPathFromUrl = (url: String) => {
    return url.split("?")[0];
  };

  const styles = useStyles();
  let memoryURL = item?.memory_file;
  let memoryPath = getPathFromUrl(item?.memory_file);
  const fileExt = memoryPath.split(".").pop();

  let newMemoryUri = memoryPath.lastIndexOf("/");
  let memoryName = memoryPath.substring(newMemoryUri);

  let dirs = RNFetchBlob.fs.dirs;
  const path = Platform.OS === "ios" ? dirs.LibraryDir + memoryName : dirs.PictureDir + memoryName;
  const saveToGallery = () => {
    RNFetchBlob.config({
      fileCache: true,
      appendExt: fileExt,
      indicator: true,
      IOSBackgroundTask: true,
      path: path,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: path,
        description: fileExt == "mp4" ? "Video" : "Image",
      },
    })
      .fetch("GET", memoryURL)
      .then(res => {
        if (Platform.OS == "ios") {
          CameraRoll.saveAsset(res.data, { type: fileExt == "mp4" ? "video" : "photo" })
            .then(() => {
              showMessage("Saved to Camera Roll", "success", "AR Memories!");
            })
            .catch(err => {
              showMessage("There was an error saving to Camera Roll", "error", "AR Memories!");
            });
        } else {
          showMessage("Saved to Camera Roll", "success", "AR Memories!");
        }
      });
  };

  const checkPermission = () => {
    if (Platform.OS == "android") {
      requestMultiple([
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ]).then(response => {
        saveToGallery();
      });
    } else {
      saveToGallery();
    }
  };

  return (
    <Pressable
      style={styles.cardWrapper}
      onPress={() => onPressAction && onPressAction(item?.memory_file, item?.challenge_details)}
    >
      <View style={styles.cardContainer}>
        <FastImage
          style={styles.cardImage}
          resizeMode={FastImage.resizeMode.cover}
          source={{
            uri:
              item.memory_type == "VIDEO" ? item?.thumbnail_memory_video_file : item?.memory_file,
          }}
        />
        <View style={styles.cardContent}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <AppText numberOfLines={1} style={styles.title}>
              {truncateText(item?.challenge_details?.name, 8)}
            </AppText>
            <TouchableOpacity onPress={checkPermission} style={{ marginStart: 10, padding: 4 }}>
              <DownloadImg style={{ width: 16, height: 12 }} />
            </TouchableOpacity>
          </View>
          <AppText numberOfLines={2} style={styles.description}>
            {truncateText(item?.challenge_details?.description.replace(/<[^>]+>/g, ""), 30)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
};

export default MemoryContainer;
