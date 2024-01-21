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
    backgroundColor: '#000'
  },
  container: { marginTop: "10%" },
  f1: {
    height: ScreenHeight,
    width: '100%'
  },
  bottomContainer: {
    width: '100%',
    height: 110,
    backgroundColor: "#090A16",
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    alignItems: 'center'
  },

  challengeSponsorName: {
    ...fontGroup.p700,
    fontSize: FontSizes.S20,
    color: theme.colors.white,
  },

  btnText: {
    ...fontGroup.p600,
    fontSize: FontSizes.S16,
    color: "#2B0143",
  },
}))

export default useStyles