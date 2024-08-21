import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../../util/AppDimensions"
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils"

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  heading: {
    fontSize: FontSizes.S20,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.ns700,
    color: theme.colors.white,
    marginTop: 5,
    textAlign: 'center'
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: screenHorizontalPadding,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: "#1f2236",
  },
  ARMainContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
    overflow: 'hidden',
    borderRadius:16
  },
  f1: {
    bottom: 0,
    width: '100%',
    position: 'absolute',
    top: 0
  },
  container: { marginTop: "10%" },
  headerText: {
    ...fontGroup.ns900,
    fontSize: FontSizes.S24,
    color: theme.colors.white,
  },
  subHeaderText: {
    ...fontGroup.p400,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    marginTop: 5,
  },
  pointsText: {
    ...fontGroup.ns900,
    fontSize: FontSizes.S24,
    color: theme.colors.white,
  },
  yourPointsText: {
    ...fontGroup.p400,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    marginTop: 5,
  },
  rowView: {
    flexDirection: 'row',
  },
  buttonSelectText: {
    fontSize: FontSizes.S14,
    color: theme.colors.white,
    fontWeight: 'bold'
  },
  selectButtonStyle:
  {
    backgroundColor: "#B816E050",
    borderColor: "#B816E0",
    borderRadius: 2,
    borderWidth: 1,
    height: 37,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 2,
    marginStart: 2,
    paddingHorizontal: 8
  },
  unSelectButtonStyle:
  {
    backgroundColor: "#77777750",
    borderColor: "#6B7280",
    borderRadius: 2,
    borderWidth: 1,
    height: 37,
    justifyContent: 'center',
    alignItems: 'center',
    marginStart: 2,
    marginEnd: 2,
    paddingHorizontal: 8
  },
  //Flat Item
  containerView: {
    paddingHorizontal: 12,
    marginVertical: 15,
    flex: 1,
    minHeight: 280,
    justifyContent: "flex-end",
    alignItems: "center",
    borderRadius: 12,
    margin: 5,
    overflow: 'hidden',
    position: 'relative'
  },
  list_title: {
    ...fontGroup.ns800,
    fontSize: FontSizes.S26,
    color: theme.colors.white,
    marginTop: 5,
  },
  s_list_count: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S14,
    color: theme.colors.white,
    alignItems: 'center',
    textAlign: 'center',
  },
  s_list_text: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    alignItems: 'center',
    textAlign: 'center'
  },
  gradient: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0
  },
  site_d_header_text: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S18,
    color: theme.colors.white,
    alignItems: 'center',
    textAlign: 'center'
  },
  site_d_header_number_text: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S18,
    color: '#C881F0',
    alignItems: 'center',
    textAlign: 'center'
  },
  site_d_header: {
    ...fontGroup.ns800,
    fontSize: FontSizes.S20,
    color: theme.colors.white,
    marginVertical: 10
  },
  site_via_text: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S16,
    color: theme.colors.white,
  },
  site_via_des_text: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S10,
    color: '#C8DFFF',
  },
  site_d_text: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S10,
    color: '#C8DFFF',
    marginVertical: 10
  },
  protip_text: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S16,
    color: '#1E63EF',
    marginVertical: 10
  },
  arrivedText: {
    ...fontGroup.ns600,
    fontSize: FontSizes.S16,
    color: '#C881F0'
  },
  exploringText: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    lineHeight: 13.64,
    marginVertical: 4
  },
  infoText: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S10,
    color: theme.colors.white,
    lineHeight: 13.64
  },
  bottomButtonContainer:
  {
    width: 96,
    height: 42,
    borderRadius: 4,
    backgroundColor: "#00000090",
    alignItems: 'center',
    justifyContent: 'center'
  },
  bottomButtonText: {
    ...fontGroup.p700,
    color: theme.colors.white,
    fontSize: FontSizes.S16,
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
}))

export default useStyles