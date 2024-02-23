import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../../util/AppDimensions"
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils"

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
    color: theme.colors.white,
    marginTop: 10,
  },

  challengeSponsorName: {
    ...fontGroup.p700,
    fontSize: FontSizes.S22,
    color: theme.colors.white,
  },

  challengeSponsorStartDateText: {
    ...fontGroup.p300,
    fontSize: FontSizes.S10,
    color: theme.colors.white,
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

  bottomText: {
    ...fontGroup.p700,
    fontSize: FontSizes.S19,
    textAlign: 'center',
    color: "#1158F4",
    marginVertical: 15,
    fontWeight: "700"
  },
  p: {
    ...fontGroup.p400,
    color: '#fff',
    fontSize: FontSizes.S14,
  },
  strong: {
    ...fontGroup.p700,
    color: '#fff',
    fontSize: FontSizes.S18,
  },
  buttonStyle: {
    height: 50
  },
  buttonContainerStyle: {
    marginTop: 20
  },
  pointContainer: { 
    backgroundColor: "#9003E050", 
    width: '100%', 
    height: 87, 
    marginVertical: 20, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  heading: {
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.ns700,
    color: theme.colors.white,
    marginTop: 5,
    textAlign:'center'
  },
}))

export default useStyles