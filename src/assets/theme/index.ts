import { createTheme } from "@rneui/themed";

/**
 *  Create different colors to use in makeStyle.
 */
const theme = createTheme({
  lightColors: {
    // INFO: 'grey' colors were validated
    grey0: "#BCBCBC",
    grey1: "#6F6F76",
    grey2: "#99999990",
    // INFO: Validated colors
    white: "#FFFFFF",
    inputBG: "#131422",

    // TODO: Verify usage of these colors
    purple: "#9003E0",
    pink: "#B816E0",
    inputBlue: "#1158F4",
    yellow: "#EAB308",
    statBG: "#323250",
    boxStatBG: "#27273F",
    drawerBG: "#202136",
    magenta: "#C881F0",
    green: "#67CE67",
    inputRed: "#D75D50",
  },
  // TODO: Verify usage of 'darkColors', remove and update usage to 'lightColors'
  darkColors: {
    white: "#FFFFFF",
    inputBG: "#131422",
    grey: "#9CA3AF",
    dividerGrey: "#4B5563",
    TandCgrey: "#6B7280",
    purple: "#9003E0",
    pink: "#B816E0",
    inputBlue: "#1158F4",
    buttonGrey: "#FFFFFF1A",
    yellow: "#EAB308",
    lightGrey: "#FFFFFF0D",
    statBG: "#323250",
    boxStatBG: "#27273F",
    toggleOff: "#6F6F76",
    grey: "#BCBCBC",
    grey31: "#4F4F4F",
    drawerBG: "#202136",
    inputRed: "#D75D50",
  },
  mode: "light",
});

export default theme;
