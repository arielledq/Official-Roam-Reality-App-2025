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
    position: 'relative'
  },
  buttonStyle: {
    height: 50
  },
  buttonContainerStyle: {
    marginTop: 20,
    width:'100%'
  },
  pagerView: {
    flex: 1,
  },
}))

export default useStyles