import React, { ReactNode } from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Images from "../../assets/images";
import theme from "../../assets/theme";

interface BackgroundWithImageProps {
  children?: ReactNode;
  imageSource?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

const BackgroundWithImage: React.FC<BackgroundWithImageProps> = ({
  children,
  imageSource = Images.Background,
  style,
  imageStyle,
  ...props
}) => {
  return (
    <ImageBackground
      source={imageSource}
      style={[styles.background, style]}
      imageStyle={imageStyle}
      {...props}
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    backgroundColor: theme.darkColors?.inputBG,
  },
});

export default BackgroundWithImage;
