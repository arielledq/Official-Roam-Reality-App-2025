import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../../util/AppDimensions"
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils"
import { Dimensions, Platform } from "react-native";
let ScreenHeight = Dimensions.get("window").height;
let ScreenWidth = Dimensions.get("window").width;

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
    backgroundColor: "#0F1424",
    zIndex: 1000

  },
  heading: {
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.ns700,
    color: theme.colors.white,
    marginTop: 5,
    textAlign: 'center'
  },
  mainHeaderContainer: {
    paddingHorizontal: screenHorizontalPadding,
    marginTop: 20,
    top: -20,
    backgroundColor: '#202136',
    zIndex: 1000,
  },
  mainHeaderContainerIOS: {
    height: 120,
  },
  detailsViewContainer: {
    paddingHorizontal: screenHorizontalPadding,
    marginTop: -20,
    backgroundColor: "#0F1424",
    paddingVertical: 20,
    zIndex: 1000
  },
  detailsViewContainerIOS: {
    height: 100,
  },
  container: {
    marginTop: "10%"
  },
  f1: {
    position: "relative",
    marginHorizontal: screenHorizontalPadding,
    height: (ScreenWidth * 1.2)
  },
  imageVideoView: {
    width: '100%',
    flex: 1,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    backgroundColor: '#fff'
  },
  navigatorView: {
    width: '100%',
    flex: 1,
  },
  bottomContainer: {
    width: '100%',
    height: 110,
    backgroundColor: "#090A16",
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    alignItems: 'center',
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
    left: 0,
    marginHorizontal: 20,
    right: 0
  },
  timerText: {
    ...fontGroup.p600,
    fontSize: FontSizes.S10,
    textAlign: 'center',
    color: theme.colors.white,
  },
  holdTextContainer: {
    backgroundColor: "#090A1620",
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginVertical: 20,
    height: 25,
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
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4
  },
  viewDetailsIconContainer: {
    backgroundColor: "#1158F4",
    height: 53,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  viewDetailsIconContainerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  viewDetailsIcon: {
    width: 37,
    height: 37,
    marginEnd: 5
  },
  borderStyles: {
    borderStyle: 'dashed',
    borderColor: 'gray',
  },
  textStyles: {
    color: '#fff',
  },
  cornerStyles: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
    borderColor: '#aaa',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  filterHeight: {
    height: (ScreenWidth * 1.2)
  },
  filterBottomContainer: {
    position: 'absolute',
    bottom: 0
  }
}))

export default useStyles