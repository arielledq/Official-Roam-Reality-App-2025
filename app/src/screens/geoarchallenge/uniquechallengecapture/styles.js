import { makeStyles } from "@rneui/themed";
import { screenHorizontalPadding } from "../../../util/AppDimensions";
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils";
import { Dimensions } from "react-native";
let ScreenHeight = Dimensions.get("window").height;
let ScreenWidth = Dimensions.get("window").width;

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
    backgroundColor: "#0F1424",
    zIndex: 1000,
  },
  innerContainer: {
    paddingHorizontal: screenHorizontalPadding,
    paddingBottom: 40,
  },
  heading: {
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.nunitoBold,
    color: theme.colors.white,
    marginTop: 5,
    textAlign: "center",
  },
  mainHeaderContainer: {
    paddingHorizontal: screenHorizontalPadding,
    marginTop: 20,
    top: -20,
    backgroundColor: "#202136",
    zIndex: 1000,
  },
  mainHeaderContainerIOS: {
    height: 120,
  },
  container: {
    marginTop: "10%",
  },
  f1: {
    position: "relative",
    marginHorizontal: screenHorizontalPadding,
    height: ScreenWidth * 1.2,
  },

  challengeSponsorName: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S20,
    color: theme.colors.white,
  },

  btnText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    color: "#2B0143",
  },
  loadingText: {
    fontSize: FontSizes.S24,
    color: theme.colors.black,
    marginTop: 10,
  },

  descriptionText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S14,
    textAlign: "center",
    color: "#9CA3AF",
    marginVertical: 15,
    fontWeight: "700",
  },

  //view details styles
  viewDetailBtn: {
    backgroundColor: "#fff",
    height: 30,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  viewDetailsIconContainer: {
    backgroundColor: "#1158F4",
    height: 53,
    borderRadius: 8,
    justifyContent: "center",
  },
  viewDetailsIconContainerWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  viewDetailsIcon: {
    width: 37,
    height: 37,
    marginEnd: 10,
  },

  borderStyles: {
    borderStyle: "dashed",
    borderColor: "gray",
  },
  textStyles: {
    color: "#fff",
  },
  cornerStyles: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "white",
    borderColor: "#aaa",
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  navigatorView: {
    width: "100%",
    flex: 1,
  },
}));

export default useStyles;
