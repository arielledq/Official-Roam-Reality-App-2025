import {Platform} from "react-native";

const fonts = {
  nunitoLight: Platform.OS === "ios" ? "NunitoSans10pt-ExtraLight" : "Nunito Sans 10pt ExtraLight",
  nunitoRegular: Platform.OS === "ios" ? "NunitoSans10pt-Regular" : "Nunito Sans 10pt",
  nunitoBold: Platform.OS === "ios" ? "NunitoSans10pt-Bold" : "Nunito Sans 10pt Bold",
  nutinoExtraBold: Platform.OS === "ios" ? "NunitoSans7ptCondensed-Black" : "Nunito Sans 7pt Bold",
};

const fontGroup = {
  nunitoLight: {
    fontFamily: fonts.nunitoLight,
    fontWeight: "100",
  },
  nunitoRegular: {
    fontFamily: fonts.nunitoRegular,
    fontWeight: "400",
  },
  nunitoBold: {
    fontFamily: fonts.nunitoBold,
    fontWeight: "700",
  },
  nutinoExtraBold: {
    fontFamily: fonts.nutinoExtraBold,
    fontWeight: "800",
  },
};

export default fontGroup;

export {fonts};
