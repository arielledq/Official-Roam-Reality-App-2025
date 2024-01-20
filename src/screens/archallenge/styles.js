import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../util/AppDimensions"
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils"

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
  rowView: { 
    width: '100%',
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginVertical:10
  },
  buttonSelectText: {
    ...fontGroup.p400,
    fontSize: FontSizes.S14,
    color: theme.colors.white,
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
    marginEnd: 2
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
    marginStart: 2
  },
  //Flat Item
  list_item: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: 166,
    height: 113,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff10",
    borderRadius: 12,
    margin: 5
  },
  list_title: {
    ...fontGroup.sf700,
    fontSize: FontSizes.S12,
    color: theme.colors.white
  },
  list_image: {
    width: 60,
    height: 60
  }
}))

export default useStyles