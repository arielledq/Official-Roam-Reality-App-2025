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
    flex:1,
    width: '100%',
    position: 'relative',
    backgroundColor:'#000'
  },
  mainHeaderContainer: {
    paddingHorizontal: screenHorizontalPadding,
    marginTop:20,
    position: 'absolute',
    top: -20
  },
  container: {
    marginTop: "10%"
  },
  f1: {
    height: ScreenHeight,
    width: '100%',
    position:'absolute',
    top:0
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
    paddingHorizontal: 10,
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
  timerTextContainer: {
    top: -50,
    position: 'absolute',
    padding: 5,
    backgroundColor: "#090A1620",
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    left:0,
    marginHorizontal:20,
    right:0
  },
  timerText: {
    ...fontGroup.p600,
    fontSize: FontSizes.S10,
    textAlign: 'center',
    color: theme.colors.white,
  },
  holdTextContainer: {
    top: -50,
    position: 'absolute',
    padding: 5,
    backgroundColor: "#090A1620",
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    left:0,
    marginHorizontal:20,
    right:0
  },
  holdText: {
    ...fontGroup.p600,
    fontSize: FontSizes.S10,
    textAlign: 'center',
    color: theme.colors.white,
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
  viewDetailBtn: {
    backgroundColor: '#fff',
    height: 30,
    paddingHorizontal:8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius:4
  },
  viewDetailsIconContainer: {
    backgroundColor: "#1158F4",
    height: 53,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: 'center'
  },
  viewDetailsIconContainerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  viewDetailsIcon: {
    width: 37,
    height: 37,
    marginEnd: 10
  }

}))

export default useStyles