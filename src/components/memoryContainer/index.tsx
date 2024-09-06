import React from "react"
import { Alert, Image, Platform, Pressable, TouchableOpacity, View } from "react-native"
import useStyles from "./styles"
import AppText from "../text"
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import FastImage from "react-native-fast-image"
import DownloadImg from "../../assets/ar/download.svg"
import RNFetchBlob from "rn-fetch-blob";
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';

const MemoryContainer = ({
  title,
  description,
  image,
  item,
  onPressAction
}: {
  title: string,
  description: string,
  image: string,
  onPressAction?: () => void,
  item: any
}) => {

  const getPathFromUrl = (url: String) => {
    return url.split("?")[0];
  }

  const styles = useStyles()
  let memoryURL = item?.memory_file
  let memoryPath = getPathFromUrl(item?.memory_file)
  const fileExt = memoryPath.split('.').pop();

  let newMemoryUri = memoryPath.lastIndexOf('/');
  let memoryName = memoryPath.substring(newMemoryUri);

  let dirs = RNFetchBlob.fs.dirs;
  const path = Platform.OS === 'ios' ? dirs.LibraryDir + memoryName : dirs.PictureDir + memoryName;
  //let path = Platform.OS === 'ios' ? dirs['MainBundleDir'] + memoryName : dirs.PictureDir + memoryName;
  const saveToGallery = () => {
    console.log("path:", path)
    console.log("fileExt:", fileExt)
    console.log("memoryURL:", memoryURL)
    console.log("Platform.OS:", Platform.OS)
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
        description: fileExt == 'mp4' ? 'Video' : "Image"
      },
    }).fetch("GET", memoryURL).then(res => {
      if (Platform.OS == 'ios') {
        console.log("res.path::", res)
        CameraRoll.saveAsset(res.data, { type: fileExt == 'mp4' ? 'video' : "photo" }).then(() => {
          Alert.alert("AR Memories!", 'Saved to Camera Roll');
        })
          .catch((err) => {
            console.log('err:', err);
          });;
      } else { Alert.alert("AR Memories!", 'Saved to Camera Roll'); }
    });
  }

  const checkPermission = () => {
    if (Platform.OS == 'android') {
      requestMultiple([
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ]).then(response => {
        console.log("PERMISSIONS.ANDROID:: ", response);
        saveToGallery()
      });
    } else {
      saveToGallery()
    }
  };

  return (
    <Pressable style={styles.cardContainer} onPress={() => onPressAction(item?.memory_file, item?.challenge_details)}>
      <View style={styles.cardInner}>
        <FastImage style={styles.iconStyle}
          resizeMode={FastImage.resizeMode.cover}
          source={{ uri: item.memory_type == 'VIDEO' ? item?.thumbnail_memory_video_file : item?.memory_file }} />
        <View style={styles.cardBottomContent}>
          <View style={{ flexDirection: 'row', marginVertical: 5, marginBottom: 0, alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText numberOfLines={1} style={styles.titleStyle}>{item?.challenge_details?.name}</AppText>
            <TouchableOpacity onPress={checkPermission} style={{ marginStart: 10, padding: 4 }}>
              <DownloadImg style={{ width: 16, height: 12 }} />
            </TouchableOpacity>
          </View>
          <AppText numberOfLines={2} style={styles.Text}>{item?.challenge_details?.description.replace(/<[^>]+>/g, '')}</AppText>
        </View>
      </View>
    </Pressable>
  )
}

export default MemoryContainer
