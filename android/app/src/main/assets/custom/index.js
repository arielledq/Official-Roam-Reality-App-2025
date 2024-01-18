import { Platform } from 'react-native'

const fonts = {
  SF100: Platform.OS == 'android' ? 'sf-ui-display-thin' : 'SF UI Display Thin',
  SF200:
    Platform.OS == 'android'
      ? 'sf-ui-display-ultralight'
      : 'SF UI Display Ultralight',
  SF300:
    Platform.OS == 'android' ? 'sf-ui-display-light' : 'SF UI Display Light',
  SF400:
    Platform.OS == 'android'
      ? 'sf-ui-display-regular'
      : 'SF UI Display Regular',
  SF500:
    Platform.OS == 'android' ? 'sf-ui-display-medium' : 'SF UI Display Medium',
  SF600:
    Platform.OS == 'android'
      ? 'sf-ui-display-semibold'
      : 'SF UI Display Semibold',
  SF700: Platform.OS == 'android' ? 'sf-ui-display-bold' : 'SF UI Display Bold',
  SF900:
    Platform.OS == 'android' ? 'sf-ui-display-black' : 'SF UI Display Black',

  P100: Platform.OS == 'android' ? 'Poppins-Thin' : 'Poppins Thin',
  P200: Platform.OS == 'android' ? 'Poppins-ExtraLight' : 'Poppins ExtraLight',
  P300: Platform.OS == 'android' ? 'Poppins-Light' : 'Poppins Light',
  P400: Platform.OS == 'android' ? 'Poppins-Regular' : 'Poppins Regular',
  P500: Platform.OS == 'android' ? 'Poppins-Medium' : 'Poppins Medium',
  P600: Platform.OS == 'android' ? 'Poppins-SemiBold' : 'Poppins SemiBold',
  P700: Platform.OS == 'android' ? 'Poppins-Bold' : 'Poppins Bold',
  P800: Platform.OS == 'android' ? 'Poppins-ExtraBold' : 'Poppins ExtraBold',
  P900: Platform.OS == 'android' ? 'Poppins-Black' : 'Poppins Black',

  NS200:
    Platform.OS == 'android'
      ? 'NunitoSans_10pt-ExtraLight'
      : 'Nunito Sans 10pt ExtraLight',
  NS300:
    Platform.OS == 'android'
      ? 'NunitoSans_10pt-Light'
      : 'Nunito Sans 10pt Light',
  NS400:
    Platform.OS == 'android'
      ? 'NunitoSans_10pt-Regular'
      : 'Nunito Sans 10pt Regular',
  NS500:
    Platform.OS == 'android'
      ? 'NunitoSans_10pt-Medium'
      : 'Nunito Sans 10pt Medium',
  NS600:
    Platform.OS == 'android'
      ? 'NunitoSans_10pt-SemiBold'
      : 'Nunito Sans 10pt SemiBold',
  NS700:
    Platform.OS == 'android' ? 'NunitoSans_10pt-Bold' : 'Nunito Sans 10pt Bold',
  NS800:
    Platform.OS == 'android'
      ? 'NunitoSans_10pt-ExtraBold'
      : 'Nunito Sans 10pt ExtraBold',
  NS900:
    Platform.OS == 'android'
      ? 'NunitoSans_10pt-Black'
      : 'Nunito Sans 10pt Black'
}

const fontGroup = {
  sf100: {
    fontFamily: fonts.SF100,
    fontWeight: Platform.OS == 'android' ? null : '100'
  },
  sf200: {
    fontFamily: fonts.SF200,
    fontWeight: Platform.OS == 'android' ? null : '200'
  },
  sf300: {
    fontFamily: fonts.SF300,
    fontWeight: Platform.OS == 'android' ? null : '300'
  },
  sf400: {
    fontFamily: fonts.SF400,
    fontWeight: Platform.OS == 'android' ? null : '400'
  },
  sf500: {
    fontFamily: fonts.SF500,
    fontWeight: Platform.OS == 'android' ? null : '500'
  },
  sf600: {
    fontFamily: fonts.SF600,
    fontWeight: Platform.OS == 'android' ? null : '600'
  },
  sf700: {
    fontFamily: fonts.SF700,
    fontWeight: Platform.OS == 'android' ? null : '700'
  },
  sf900: {
    fontFamily: fonts.SF900,
    fontWeight: Platform.OS == 'android' ? null : '900'
  },
  p100: {
    fontFamily: fonts.P100,
    fontWeight: Platform.OS == 'android' ? null : '100'
  },
  p200: {
    fontFamily: fonts.P200,
    fontWeight: Platform.OS == 'android' ? null : '200'
  },
  p300: {
    fontFamily: fonts.P300,
    fontWeight: Platform.OS == 'android' ? null : '300'
  },
  p400: {
    fontFamily: fonts.P400,
    fontWeight: Platform.OS == 'android' ? null : '400'
  },
  p500: {
    fontFamily: fonts.P500,
    fontWeight: Platform.OS == 'android' ? null : '500'
  },
  p600: {
    fontFamily: fonts.P600,
    fontWeight: Platform.OS == 'android' ? null : '600'
  },
  p700: {
    fontFamily: fonts.P700,
    fontWeight: Platform.OS == 'android' ? null : '700'
  },
  p800: {
    fontFamily: fonts.P800,
    fontWeight: Platform.OS == 'android' ? null : '800'
  },
  p900: {
    fontFamily: fonts.P900,
    fontWeight: Platform.OS == 'android' ? null : '900'
  },
  ns200: {
    fontFamily: fonts.NS200,
    fontWeight: Platform.OS == 'android' ? null : '200'
  },
  ns300: {
    fontFamily: fonts.NS300,
    fontWeight: Platform.OS == 'android' ? null : '300'
  },
  ns400: {
    fontFamily: fonts.NS400,
    fontWeight: Platform.OS == 'android' ? null : '400'
  },
  ns500: {
    fontFamily: fonts.NS500,
    fontWeight: Platform.OS == 'android' ? null : '500'
  },
  ns600: {
    fontFamily: fonts.NS600,
    fontWeight: Platform.OS == 'android' ? null : '600'
  },
  ns700: {
    fontFamily: fonts.NS700,
    fontWeight: Platform.OS == 'android' ? null : '700'
  },
  ns800: {
    fontFamily: fonts.NS800,
    fontWeight: Platform.OS == 'android' ? null : '800'
  },
  ns900: {
    fontFamily: fonts.NS900,
    fontWeight: Platform.OS == 'android' ? null : '900'
  }
}

export default fontGroup

export { fonts }
