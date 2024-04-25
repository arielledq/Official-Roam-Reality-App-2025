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
    textAlign:'center'
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: screenHorizontalPadding,
    justifyContent:'flex-start'
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
    fontWeight:'bold'
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
    paddingHorizontal:8
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
    paddingHorizontal:8
  },
  //Flat Item
  containerView: {
    paddingHorizontal: 12,
    marginVertical: 15,
    flex:1,
    minHeight: 280,
    justifyContent: "flex-end",
    alignItems: "center",
    borderRadius: 12,
    margin: 5,
    overflow:'hidden',
    position:'relative'
  },
  list_title: {
    ...fontGroup.ns800,
    fontSize: FontSizes.S26,
    color: theme.colors.white,
    marginTop:5,
  },
  s_list_count: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S14,
    color: theme.colors.white,
    alignItems:'center',
    textAlign:'center',
  },
  s_list_text: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    alignItems:'center',
    textAlign:'center'
  },
  gradient:{
    position:'absolute',
    top:0,bottom:0,left:0,right:0
  }
}))

export default useStyles