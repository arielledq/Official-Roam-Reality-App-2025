import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../../util/AppDimensions"
import {
  FontFamily,
  FontLineHeights,
  FontSizes,
  fontGroup
} from "../../../util/FontUtils"
import { Dimensions } from "react-native"
let ScreenHeight = Dimensions.get("window").height

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    paddingHorizontal: screenHorizontalPadding
  },
  container: { marginTop: "10%" },
  headerText: {
    ...fontGroup.ns900,
    fontSize: FontSizes.S20,
    color: theme.colors.white,
    marginTop: 10
  },
  subHeaderText: {
    ...fontGroup.p400,
    fontSize: FontSizes.S12,
    color: "#9CA3AF",
    marginTop: 10,
    marginBottom: 30
  },
  pointCount: {
    ...fontGroup.p900,
    fontSize: FontSizes.S24,
    color: theme.colors.white,
    margin: 0
  },

  pointCountText: {
    ...fontGroup.p400,
    fontSize: FontSizes.S10,
    color: theme.colors.white
  },
  challengeSponsorName: {
    ...fontGroup.p700,
    fontSize: FontSizes.S22,
    color: theme.colors.white
  },

  challengeSponsorTipText: {
    ...fontGroup.p700,
    fontSize: FontSizes.S12,
    color: "#F2F2F2",
    width: "100%",
    marginTop: 2
  },
  challengeSponsorStartDateText: {
    ...fontGroup.p300,
    fontSize: FontSizes.S10,
    color: "#F2F2F2"
  },
  buttonStyle: {
    height: 50
  },
  buttonContainerStyle: {
    marginTop: 10
  },
  bottomText: {
    ...fontGroup.p700,
    fontSize: FontSizes.S19,
    textAlign: "center",
    color: "#1158F4",
    marginVertical: 15,
    fontWeight: "700"
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
    paddingHorizontal: 10
  },
  shareBtn: {
    marginHorizontal: 8
  },
  heading: {
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.ns700,
    color: theme.colors.white,
    marginTop: 5,
    textAlign: "center"
  },
  shareText: {
    ...fontGroup.p400,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    flex: 1,
    textAlign: "right"
  },
  detailContainer: {
    borderRadius: 12,
    width: "100%",
    backgroundColor: "#272741",
    marginVertical: 20,
    overflow: "hidden",
    alignItems: "center"
  },
  pointsParentContainer: {
    width: "100%",
    height: 104,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20
  },
  detailPointContainter: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 73,
    height: 63,
    borderRadius: 8,
    backgroundColor: "transparent"
  },
  mainHeaderContainerIOS: {
    height: 120
  },
  detailsViewContainerIOS: {
    height: 100
  }
}))

export default useStyles
