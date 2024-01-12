import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../util/AppDimensions"
import { FontFamily, FontLineHeights, FontSizes } from "../../util/FontUtils"

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    backgroundColor: theme?.colors?.inputBG,
  },
  formContainer: {
    marginTop: "10%",
    paddingHorizontal: screenHorizontalPadding,
    flex: 1
  },
  headerText: {
    fontFamily: FontFamily.NunitoSansBold,
    fontSize: FontSizes.S30,
    lineHeight: FontLineHeights.LH55,
    color: theme.colors.white
  },
  subHeaderText: {
    fontFamily: FontFamily.PoppinsRegular,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH25,
    color: theme.colors.white,
    marginTop: 10,
    fontWeight: "400"
  },
  input: {
    fontFamily: FontFamily.SFUIDisplay,
    height: 58,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme?.colors?.inputBG
  },
  buttonStyle: {
    height: 50
  },
  buttonContainerStyle: {
    marginTop: '15%'
  },
  otptext: {
    fontFamily: FontFamily.NunitoSansRegular,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH20,
    color: theme.colors.white,
  },
  resendButton: {
    fontFamily: FontFamily.NunitoSansSemiBold,
    fontSize: FontSizes.S14,
    color: theme.colors.pink,
  },
  childView: { flex: 1 },
  scroll: { flex: 1 }
}))

export default useStyles
