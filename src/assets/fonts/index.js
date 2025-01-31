import { Platform } from "react-native";

const fonts = {
  nunitoLight: Platform.OS === "ios" ? "Nunito Sans 10pt ExtraLight" : "NunitoSans10ptExtraLight",
  nunitoRegular: Platform.OS === "ios" ? "Nunito Sans 10pt Regular" : "NunitoSans10ptRegular",
  nunitoBold: Platform.OS === "ios" ? "Nunito Sans 10pt Bold" : "NunitoSans10ptBold",
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
};

export default fontGroup;

export { fonts };
