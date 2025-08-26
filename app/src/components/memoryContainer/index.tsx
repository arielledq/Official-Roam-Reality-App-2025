import React, { useState } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import useStyles from "./styles";
import AppText from "../text";
import FastImage from "react-native-fast-image";
//@ts-ignore
import DownloadImg from "../../assets/ar/download.svg";
import { saveToGallery, truncateText } from "../../util/helpers";
import FullScreenLoadingSpinner from "components/FullScreenLoadingSpinner";

const MemoryContainer = ({
  item,
  onPressAction,
}: {
  item: any;
  onPressAction?: (file: any, details: any) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const styles = useStyles();

  const isMemory = true;
  const capturedDataUri = item?.memory_file;
  const filePath = capturedDataUri?.split("?")[0];
  const fileExt = filePath?.split(".").pop() || "";

  const permissionsGrantedHandler = () => {
    setHasPermission(true);
  };

  const toggleLoadingHandler = () => {
    setIsLoading(currState => !currState);
  };

  const saveToGalleryButtonHandler = () => {
    saveToGallery(
      hasPermission,
      permissionsGrantedHandler,
      isMemory,
      capturedDataUri,
      fileExt,
      toggleLoadingHandler
    );
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
              {truncateText(item?.challenge_details?.name || item?.scan_picture?.name, 8)}
            </AppText>
            <TouchableOpacity
              onPress={saveToGalleryButtonHandler}
              style={{ marginStart: 10, padding: 4 }}
            >
              <DownloadImg style={{ width: 16, height: 12 }} />
            </TouchableOpacity>
          </View>
          <AppText numberOfLines={2} style={styles.description}>
            {truncateText(item?.challenge_details?.description.replace(/<[^>]*>?/gm, " ") || item?.scan_picture?.sponsor?.description.replace(/<[^>]*>?/gm, " "), 30)}
          </AppText>
        </View>
      </View>
      <FullScreenLoadingSpinner isLoading={isLoading} />
    </Pressable>
  );
};

export default MemoryContainer;
