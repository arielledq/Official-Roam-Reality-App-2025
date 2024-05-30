import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../../util/AppDimensions"
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils"

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  heading: {
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.ns700,
    color: theme.colors.white,
    marginTop: 5,
    textAlign:'center'
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: screenHorizontalPadding
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
    width: '100%',
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginVertical:10
  },
  buttonSelectText: {
    fontSize: FontSizes.S14,
    color: theme.colors.white,
    fontWeight:'bold'
  },
  selectButtonStyle:
  {
    backgroundColor: "#B816E050",
    borderColor: "#B816E0",
    borderRadius: 2,
    borderWidth: 1,
    height: 37,
    flex: .5,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 2,
    marginStart: 2
  },
  unSelectButtonStyle:
  {
    backgroundColor: "#77777750",
    borderColor: "#6B7280",
    borderRadius: 2,
    borderWidth: 1,
    height: 37,
    flex: .5,
    justifyContent: 'center',
    alignItems: 'center',
    marginStart: 2,
    marginEnd: 2,
  },
  //Flat Item
  list_item: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex:1,
    minHeight: 200,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#ffffff10",
    borderRadius: 12,
    margin: 5,
    overflow:'hidden'
  },
  list_title: {
    ...fontGroup.sf700,
    fontSize: FontSizes.S16,
    color: theme.colors.white,
    marginTop:5,
    textAlign:'center'
  },
  s_list_title: {
    ...fontGroup.sf500,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    marginTop:5,
    alignItems:'center',
    textAlign:'center'
  },
  list_image: {
    position:'absolute',
    top:0,
    bottom:0,
    left:0,
    right:0
  }
}))

export default useStyles