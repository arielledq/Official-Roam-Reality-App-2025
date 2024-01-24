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
    height: ScreenHeight,
    width: '100%',
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
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    paddingHorizontal: 10
  },
  bottomButtonContainer:
  {
    width: 117,
    height: 42,
    borderRadius: 4,
    backgroundColor: "#ffffff10",
    alignItems: 'center',
    justifyContent: 'center'
  },
  bottomButtonText: {
    ...fontGroup.p700,
    color: theme.colors.white,
    fontSize: FontSizes.S16,
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
  loadingText: {
    ...fontGroup.ns900,
    fontSize: FontSizes.S24,
    color: theme.colors.black,
    marginTop: 10,
  },
  //information view
  challengeInfoContainer: { width: '100%', backgroundColor: "#131422", height: 420, borderRadius: 30, position: 'absolute', bottom: 0, alignItems: 'center' },
  challengeInfoHeaderContainer: { paddingVertical: 20, alignItems: 'center', borderBottomColor: "#2C2D41", borderBottomWidth: 1, width: '100%' },
  challengeInfoHeader: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S18,
    color: theme.colors.white,
    marginTop: 10,
  },
  buttonStyle: {
    height: 50
  },
  buttonContainerStyle: {
    marginTop: 20
  },
  bottomText: {
    ...fontGroup.p700,
    fontSize: FontSizes.S19,
    textAlign: 'center',
    color: "#1158F4",
    marginVertical: 15,
    fontWeight: "700"
  },
  descriptionText: {
    ...fontGroup.p400,
    fontSize: FontSizes.S14,
    textAlign: 'center',
    color: "#9CA3AF",
    marginVertical: 15,
    fontWeight: "700"
  },

  //view details styles
  viewDetailBtn: { backgroundColor: '#fff', height: 30, width: 118, alignItems: 'center', justifyContent: 'center' },
  viewDetailsIconContainer: { backgroundColor: "#1158F4", height: 53, borderRadius: 8, marginHorizontal: 20, marginTop: 20, justifyContent: 'center' },
  viewDetailsIconContainerWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  viewDetailsIcon: { width: 37, height: 37, marginEnd: 10 }

}))

export default useStyles