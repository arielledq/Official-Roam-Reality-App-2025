import { createTheme } from "@rneui/themed";

/**
 *  Create different colors to use in makeStyle.
 */
const theme = createTheme({
  lightColors: {
    // INFO: Validated colors
    grey0: "#BCBCBC",
    grey1: "#6F6F76",
    grey2: "#99999990",
    grey3: "#6B7280",
    white: "#FFFFFF",
    inputBG: "#131422",
    inputBlue: "#1158F4",
    purple: "#9003E0",
    magenta: "#C881F0",
    inputRed: "#D75D50",

    // TODO: Verify usage of these colors
    pink: "#B816E0",
    yellow: "#EAB308",
    statBG: "#323250",
    boxStatBG: "#27273F",
    drawerBG: "#202136",
    green: "#67CE67",
  },
  // TODO: Verify usage of 'darkColors', remove and update usage to 'lightColors'
  darkColors: {
    // INFO: Validated colors
    grey0: "#BCBCBC",
    grey1: "#6F6F76",
    grey2: "#99999990",
    grey3: "#6B7280",
    white: "#FFFFFF",
    inputBG: "#131422",
    inputBlue: "#1158F4",
    purple: "#9003E0",
    magenta: "#C881F0",
    inputRed: "#D75D50",

    // TODO: Verify usage of these colors
    dividerGrey: "#4B5563",
    TandCgrey: "#6B7280",
    pink: "#B816E0",
    buttonGrey: "#FFFFFF1A",
    yellow: "#EAB308",
    lightGrey: "#FFFFFF0D",
    statBG: "#323250",
    boxStatBG: "#27273F",
    toggleOff: "#6F6F76",
    grey31: "#4F4F4F",
    drawerBG: "#202136",
  },
  mode: "light",
});

export default theme;
