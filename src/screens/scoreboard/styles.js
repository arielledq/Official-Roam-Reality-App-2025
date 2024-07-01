import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../util/AppDimensions"
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils"

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
    position: 'relative',
  },
}))

export default useStyles