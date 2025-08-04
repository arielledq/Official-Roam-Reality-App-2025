import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import ReactNativeModal from "react-native-modal";
import theme from "assets/theme";
import FastImage from "react-native-fast-image";
import Video from "react-native-video";

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  notification: {
    title: string;
    description: string;
    extra_data: any;
  };
}

// Function to infer media type based on the file extension
const getMediaTypeFromUrl = (url: string) => {
  const extension = url?.split(".")?.pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension || "")) {
    return "image";
  }

  if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension || "")) {
    return "video";
  }

  return "image";
};

const NotificationModal: React.FC<NotificationModalProps> = ({
  isVisible,
  onClose,
  notification,
}) => {
  if (!isVisible) return null;
  const media_url = notification?.extra_data?.image;
  const mediaType = getMediaTypeFromUrl(media_url);

  const renderMedia = () => {
    if (mediaType === "image") {
      return (
        <FastImage
          source={{uri: media_url}}
          style={styles.media}
          resizeMode={FastImage.resizeMode.contain}
        />
      );
    } else if (mediaType === "video") {
      return (
        <Video
          source={{uri: media_url}}
          style={styles.media}
          resizeMode="contain"
          controls={true}
          paused={false}
        />
      );
    } else {
      return <Text style={styles.errorText}>Unsupported media type</Text>;
    }
  };

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
      backdropOpacity={0.6}
      style={styles.modal}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.description}</Text>
        {media_url && <View style={styles.mediaContainer}>{renderMedia()}</View>}

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: theme.lightColors?.grey4,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "85%",
    gap: 16,
  },

  title: {
    color: theme.lightColors?.magenta,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  message: {
    color: theme.lightColors?.white,
    fontSize: 14,
    lineHeight: 24,
    textAlign: "center",
  },
  mediaContainer: {
    width: "100%",
    height: 250,
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  media: {
    width: "100%",
    height: "100%",
    maxWidth: 300,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignSelf: "center",
  },
  closeButtonText: {
    color: theme.lightColors?.error,
    fontSize: 18,
  },
  errorText: {
    color: theme.lightColors?.error,
    fontSize: 16,
    textAlign: "center",
  },
});

export default NotificationModal;
