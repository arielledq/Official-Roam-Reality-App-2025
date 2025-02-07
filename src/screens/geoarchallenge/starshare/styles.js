import { makeStyles } from "@rneui/themed";
import { screenHorizontalPadding } from "../../../util/AppDimensions";
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils";
import { Dimensions } from "react-native";
let ScreenHeight = Dimensions.get("window").height;

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    paddingHorizontal: screenHorizontalPadding,
  },
  container: { marginTop: "10%" },
  headerText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S24,
    color: theme.colors.white,
    marginTop: 10,
  },
  subHeaderText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S12,
    color: "#9CA3AF",
    marginTop: 10,
  },
  pointCount: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S24,
    color: theme.colors.white,
    margin: 0,
  },

  pointCountText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S10,
    color: theme.colors.white,
  },
  challengeSponsorName: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S22,
    color: theme.colors.white,
  },

  challengeSponsorTipText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S12,
    color: "#F2F2F2",
    width: "100%",
    marginTop: 2,
  },
  challengeSponsorStartDateText: {
    ...fontGroup.nunitoLight,
    fontSize: FontSizes.S10,
    color: "#F2F2F2",
  },
  buttonStyle: {
    height: 50,
  },
  buttonContainerStyle: {
    marginTop: 10,
  },
  bottomText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S19,
    textAlign: "center",
    color: "#1158F4",
    marginVertical: 15,
    fontWeight: "700",
  },
  socialShareContainer: {
    borderRadius: 4,
    height: 50,
    width: "100%",
    backgroundColor: "#272741",
    marginVertical: 5,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  shareBtn: {
    marginHorizontal: 8,
  },
  heading: {
    fontSize: FontSizes.S20,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.nunitoBold,
    color: theme.colors.white,
    marginTop: 5,
    textAlign: "center",
  },
  shareText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
  },
  imageContainer: {
    borderRadius: 12,
    width: "100%",
    backgroundColor: "#272741",
    marginTop: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  detailContainer: {
    borderRadius: 12,
    width: "100%",
    backgroundColor: "#272741",
    marginTop: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  pointsParentContainer: {
    width: "100%",
    height: 104,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  detailPointContainter: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 73,
    height: 63,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  titleText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    color: "#C881F0",
  },
  descriptionText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S10,
    color: theme.colors.white,
    lineHeight: FontLineHeights.LH14,
  },
  sponsoredByText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    lineHeight: FontLineHeights.LH15,
    fontWeight: "600",
  },
  notShareBottomText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S19,
    textAlign: "center",
    color: "#DC2626",
    marginVertical: 15,
    fontWeight: "700",
    marginBottom: 30,
  },
}));

export default useStyles;
