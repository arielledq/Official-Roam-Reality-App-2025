import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../util/AppDimensions"
import { FontFamily, FontLineHeights, FontSizes,fontGroup } from "../../util/FontUtils"

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    backgroundColor: theme?.colors?.inputBG,
    paddingHorizontal: screenHorizontalPadding,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: screenHorizontalPadding,
  },
  headerText: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S35,
    lineHeight: FontLineHeights.LH48,
    color: theme.colors.white
  },
  subHeaderText: {
    ...fontGroup.p400,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH25,
    color: theme.colors.white,
    textAlign: 'center',
    marginTop: '10%',
  },
  buttonStyle: {
    height: 50
  },
  buttonContainerStyle: {
    marginBottom: '10%'
  },
  checkIcon: {
    marginBottom: '10%'
  },
}))

export default useStyles
