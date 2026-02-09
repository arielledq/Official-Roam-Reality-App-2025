import {Image, View, StyleSheet} from "react-native";
import Video from "react-native-video";

const ResponsiveMedia = ({
  source = {},
  containerHeight = 300,
  containerStyle = {},
  imageStyle = {},
  isImage = true,
  onLoadEnd = () => {},
}) => {
  return (
    <View style={[styles.container, {height: containerHeight}, containerStyle]}>
      {isImage ? (
        <Image
          source={source}
          style={[styles.image, {height: containerHeight}, imageStyle]}
          onLoadEnd={onLoadEnd}
          resizeMode="stretch"
        />
      ) : (
        <Video
          source={source}
          style={[styles.image, {height: containerHeight}, imageStyle]}
          onReadyForDisplay={onLoadEnd}
          repeat={true}
        />
      )}
    </View>
  );
};

export default ResponsiveMedia;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: undefined,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    overflow: "hidden",
  },
});
