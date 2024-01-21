import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../../util/AppDimensions"
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils"
import { Dimensions } from "react-native";
let ScreenHeight = Dimensions.get("window").height;

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
    fontSize: FontSizes.S24,
    color: theme.colors.white,
    marginTop: 10,
  },
  subHeaderText: {
    ...fontGroup.p400,
    fontSize: FontSizes.S12,
    color: '#9CA3AF',
    marginTop: 10,
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
    color: theme.colors.white,
  },
  challengeSponsorName: {
    ...fontGroup.p700,
    fontSize: FontSizes.S22,
    color: theme.colors.white,
  },

  challengeSponsorTipText: {
    ...fontGroup.p700,
    fontSize: FontSizes.S12,
    color: "#F2F2F2",
    width:'80%'
  },
  challengeSponsorStartDateText: {
    ...fontGroup.p300,
    fontSize: FontSizes.S10,
    color: "#9CA3AF",
  },
}))

export default useStyles