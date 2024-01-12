import { PixelRatio } from 'react-native';
import { moderateScale } from './AppDimensions';

export enum FontFamily {
  NunitoSansRegular = 'NunitoSans-Regular',
  NunitoSansBold = 'NunitoSans-Bold',
  NunitoSansSemiBold = 'NunitoSans-SemiBold',
  PoppinsRegular = 'Poppins-Regular',
  PoppinsBold = 'Poppins-Bold',
  SFUIDisplay = 'sf-ui-display'
}

// Basic fonts size to use in Application
const fontScale = PixelRatio.getFontScale();
const getFontSize = (size: number) => {
  // console.log(`${size} >>> ${size / fontScale} (fontScale: ${fontScale}))`);
  return moderateScale(size * 0.9);
  // return size / fontScale;
};

export const FontSizes = {
  S12: getFontSize(12),
  S13: getFontSize(13),
  S14: getFontSize(14),
  S15: getFontSize(15),
  S16: getFontSize(16),
  S18: getFontSize(18),
  S20: getFontSize(20),
  S22: getFontSize(22),
  S24: getFontSize(24),
  S30: getFontSize(30),
  S35: getFontSize(35),
  S40: getFontSize(40),
  S44: getFontSize(44),
};

// Basic Line heights to use in Application
export const FontLineHeights = {
  LH14: 14,
  LH15: 15,
  LH16: 16,
  LH20: 20,
  LH24: 24,
  LH25: 25,
  LH27: 27,
  LH28: 28,
  LH30: 30,
  LH33: 33,
  LH40: 40,
  LH44: 44,
  LH48: 48,
  LH55: 55,
};
