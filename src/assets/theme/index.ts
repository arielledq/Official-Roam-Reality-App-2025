import { createTheme } from '@rneui/themed';

/**
 *  Create different colors to use in makeStyle.
 */
const theme = createTheme({
  lightColors: {
    white: '#FFFFFF',
    inputBG: '#131422',
    grey: '#9CA3AF',
    dividerGrey: '#4B5563',
    TandCgrey: '#6B7280',
    purple: '#9003E0',
    blue: '#1158F4',
    pink: '#B816E0',
  },
  darkColors: {
    white: '#FFFFFF',
    inputBG: '#131422',
    grey: '#9CA3AF',
    dividerGrey: '#4B5563',
    TandCgrey: '#6B7280',
    purple: '#9003E0',
    blue: '#1158F4',
    pink: '#B816E0'
  },
  mode: 'light',
});

export default theme;
