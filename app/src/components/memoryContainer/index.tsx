import React, {useState} from "react";
import {Pressable, TouchableOpacity, View} from "react-native";
import useStyles from "./styles";
import AppText from "../text";
import FastImage from "react-native-fast-image";
//@ts-ignore
import DownloadImg from "../../assets/ar/download.svg";
import {saveToGallery, truncateText} from "../../util/helpers";
import FullScreenLoadingSpinner from "components/FullScreenLoadingSpinner";
import Icon from "components/Icon";

const MemoryContainer = ({
  item,
  onPressAction,
  onChnagePrivacy = (item: any, privacy: any) => {
    // Function to handle privacy change
  },
}: {
  item: any;
  onPressAction?: (file: any, details: any) => void;
  onChnagePrivacy?: (item: any, privacy: any) => void;
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
      </View>
      <View style={styles.cardContent}>
        <AppText numberOfLines={1} style={styles.title}>
          {item?.challenge_details?.name}
        </AppText>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
          onPress={() => onChnagePrivacy(item, item?.privacy === "public" ? "private" : "public")}
        >
          <AppText style={styles.buttonText}>Privacy</AppText>
          {item?.privacy == "public" ? (
            <Icon name="eye-outline" family="ionicon" size={15} color={"#fff"} />
          ) : (
            <Icon name="eye-off-outline" family="ionicon" size={15} color={"#fff"} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
          onPress={saveToGalleryButtonHandler}
        >
          <AppText style={styles.buttonText}>Download</AppText>

          <Icon name="download" family="antdesign" size={15} color={"#fff"} />
        </TouchableOpacity>
      </View>
      <FullScreenLoadingSpinner isLoading={isLoading} />
    </Pressable>
  );
};

export default MemoryContainer;
