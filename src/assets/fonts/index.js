import { Platform } from 'react-native'

const fonts = {
  SF100: Platform.OS == 'android' ? 'SFUIDisplay-Thin' : 'SFUIDisplay-Thin',
  SF200: Platform.OS == 'android' ? 'SFUIDisplay-Ultralight' : 'SFUIDisplay-Ultralight',
  SF300: Platform.OS == 'android' ? 'SFUIDisplay-Light' : 'SFUIDisplay-Light',
  SF400: Platform.OS == 'android' ? 'SFUIDisplay-Regular' : 'SFUIDisplay-Regular',
  SF500: Platform.OS == 'android' ? 'SFUIDisplay-Medium' : 'SFUIDisplay-Medium',
  SF600: Platform.OS == 'android' ? 'SFUIDisplay-Semibold' : 'SFUIDisplay-Semibold',
  SF700: Platform.OS == 'android' ? 'SFUIDisplay-Bold' : 'SFUIDisplay-Bold',
  SF900: Platform.OS == 'android' ? 'SFUIDisplay-Black' : 'SFUIDisplay-Black',

  P100: Platform.OS == 'android' ? 'Poppins-Thin' : 'Poppins-Thin',
  P200: Platform.OS == 'android' ? 'Poppins-ExtraLight' : 'Poppins-ExtraLight',
  P300: Platform.OS == 'android' ? 'Poppins-Light' : 'Poppins-Light',
  P400: Platform.OS == 'android' ? 'Poppins-Regular' : 'Poppins-Regular',
  P500: Platform.OS == 'android' ? 'Poppins-Medium' : 'Poppins-Medium',
  P600: Platform.OS == 'android' ? 'Poppins-SemiBold' : 'Poppins-SemiBold',
  P700: Platform.OS == 'android' ? 'Poppins-Bold' : 'Poppins-Bold',
  P800: Platform.OS == 'android' ? 'Poppins-ExtraBold' : 'Poppins-ExtraBold',
  P900: Platform.OS == 'android' ? 'Poppins-Black' : 'Poppins-Black',

  NS200: Platform.OS == 'android' ? 'NunitoSans10pt-ExtraLight' : 'NunitoSans10pt-ExtraLight',
  NS300: Platform.OS == 'android' ? 'NunitoSans10pt-Light' : 'NunitoSans10pt-Light',
  NS400: Platform.OS == 'android' ? 'NunitoSans10pt-Regular' : 'NunitoSans10pt-Regular',
  NS500: Platform.OS == 'android' ? 'NunitoSans10pt-Medium' : 'NunitoSans10pt-Medium',
  NS600: Platform.OS == 'android' ? 'NunitoSans10pt-SemiBold' : 'NunitoSans10pt-SemiBold',
  NS700: Platform.OS == 'android' ? 'NunitoSans10pt-Bold' : 'NunitoSans10pt-Bold',
  NS800: Platform.OS == 'android' ? 'NunitoSans10pt-ExtraBold' : 'NunitoSans10pt-ExtraBold',
  NS900: Platform.OS == 'android' ? 'NunitoSans10pt-Black' : 'NunitoSans10pt-Black',

  GIBold: Platform.OS == 'android' ? 'GlacialIndifference-Bold' : 'GlacialIndifference-Bold',
  GIItalic: Platform.OS == 'android' ? 'GlacialIndifference-Italic' : 'GlacialIndifference-Italic',
  GIRegular:
    Platform.OS == 'android' ? 'GlacialIndifference-Regular' : 'GlacialIndifference-Regular',
}

const fontGroup = {
  sf100: {
    fontFamily: fonts.SF100,
    fontWeight: Platform.OS == 'android' ? null : '100',
  },
  sf200: {
    fontFamily: fonts.SF200,
    fontWeight: Platform.OS == 'android' ? null : '200',
  },
  sf300: {
    fontFamily: fonts.SF300,
    fontWeight: Platform.OS == 'android' ? null : '300',
  },
  sf400: {
    fontFamily: fonts.SF400,
    fontWeight: Platform.OS == 'android' ? null : '400',
  },
  sf500: {
    fontFamily: fonts.SF500,
    fontWeight: Platform.OS == 'android' ? null : '500',
  },
  sf600: {
    fontFamily: fonts.SF600,
    fontWeight: Platform.OS == 'android' ? null : '600',
  },
  sf700: {
    fontFamily: fonts.SF700,
    fontWeight: Platform.OS == 'android' ? null : '700',
  },
  sf900: {
    fontFamily: fonts.SF900,
    fontWeight: Platform.OS == 'android' ? null : '900',
  },
  p100: {
    fontFamily: fonts.P100,
    fontWeight: Platform.OS == 'android' ? null : '100',
  },
  p200: {
    fontFamily: fonts.P200,
    fontWeight: Platform.OS == 'android' ? null : '200',
  },
  p300: {
    fontFamily: fonts.P300,
    fontWeight: Platform.OS == 'android' ? null : '300',
  },
  p400: {
    fontFamily: fonts.P400,
    fontWeight: Platform.OS == 'android' ? null : '400',
  },
  p500: {
    fontFamily: fonts.P500,
    fontWeight: Platform.OS == 'android' ? null : '500',
  },
  p600: {
    fontFamily: fonts.P600,
    fontWeight: Platform.OS == 'android' ? null : '600',
  },
  p700: {
    fontFamily: fonts.P700,
    fontWeight: Platform.OS == 'android' ? null : '700',
  },
  p800: {
    fontFamily: fonts.P800,
    fontWeight: Platform.OS == 'android' ? null : '800',
  },
  p900: {
    fontFamily: fonts.P900,
    fontWeight: Platform.OS == 'android' ? null : '900',
  },
  ns200: {
    fontFamily: fonts.NS200,
    fontWeight: Platform.OS == 'android' ? null : '200',
  },
  ns300: {
    fontFamily: fonts.NS300,
    fontWeight: Platform.OS == 'android' ? null : '300',
  },
  ns400: {
    fontFamily: fonts.NS400,
    fontWeight: Platform.OS == 'android' ? null : '400',
  },
  ns500: {
    fontFamily: fonts.NS500,
    fontWeight: Platform.OS == 'android' ? null : '500',
  },
  ns600: {
    fontFamily: fonts.NS600,
    fontWeight: Platform.OS == 'android' ? null : '600',
  },
  ns700: {
    fontFamily: fonts.NS700,
    fontWeight: Platform.OS == 'android' ? null : '700',
  },
  ns800: {
    fontFamily: fonts.NS800,
    fontWeight: Platform.OS == 'android' ? null : '800',
  },
  ns900: {
    fontFamily: fonts.NS900,
    fontWeight: Platform.OS == 'android' ? null : '900',
  },

  giBold: {
    fontFamily: fonts.GIBold,
    fontWeight: 'bold',
  },
  giItalic: {
    fontFamily: fonts.GIItalic,
  },
  giRegular: {
    fontFamily: fonts.GIRegular,
  },
}

export default fontGroup

export { fonts }
