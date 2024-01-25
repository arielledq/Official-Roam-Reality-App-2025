import { makeStyles } from "@rneui/themed"
import {
  moderateScale,
  screenHorizontalPadding,
  verticalScale
} from "../../util/AppDimensions"
import {
  FontFamily,
  FontLineHeights,
  FontSizes,
  fontGroup
} from "../../util/FontUtils"

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    backgroundColor: theme?.colors?.inputBG
  },

  container: {
    flex: 1,
    marginVertical: 10,
    paddingHorizontal: screenHorizontalPadding + 5
  },
  Textlogout: {
    // fontFamily: FontFamily.QuicksandBold,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH24,
    color: theme?.colors?.inputBlue,
    marginLeft: moderateScale(20),
    marginRight: moderateScale(20),
    marginTop: verticalScale(25),
    marginBottom: verticalScale(20),
    height: 30
  },
  checkIcon: {
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    alignItems: "center",
    marginBottom: 12
  },
  headerText: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH25,
    marginVertical: 8
  },
  logoutText: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH20
  },
  horizontalLine: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: theme.colors.dividerGrey,
    opacity: 0.4,
    marginVertical: 8
  },
  cancelButton: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 50
  },
  cancelButtonText: {
    ...fontGroup.ns800,
    color: theme.colors.inputBlue,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH20
  },
  buttonheaderContainer: {
    paddingHorizontal: screenHorizontalPadding + 5,
    alignItems: "center",
    marginBottom: 15,
    marginTop: 7
  },
  buttonContainer: {
    paddingHorizontal: screenHorizontalPadding - 5
  },
  buttonStyle: {
    height: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonContainerStyle: {
    marginTop: 10
  },
  buttonTitle: {
    ...fontGroup.p600,
    fontSize: FontSizes.S16
  }
}))

export default useStyles
