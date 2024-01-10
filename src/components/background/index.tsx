import React, { ReactNode } from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Images from '../../assets/images';
import theme from '../../assets/theme';

interface BackgroundWithImageProps {
  children: ReactNode;
  imageSource?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
}

const BackgroundWithImage: React.FC<BackgroundWithImageProps> = ({
  children,
  imageSource = Images.Background,
  style,
}) => {
  return (
    <ImageBackground source={imageSource} style={[styles.background, style]}>
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    // justifyContent: 'center',
    backgroundColor: theme.darkColors?.inputBG,
  },
});

export default BackgroundWithImage;
