import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../../util/AppDimensions"
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils"

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1
  },
  container: { marginTop: "10%" },
  f1:{
    flex:1
  },
  bottomContainer:{ width: '100%', height: 110, backgroundColor: "#090A16", borderTopEndRadius: 20, borderTopStartRadius: 20, alignItems: 'center' }
}))

export default useStyles