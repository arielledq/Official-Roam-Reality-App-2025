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
  },
  formContainer: {
    paddingHorizontal: screenHorizontalPadding,
    flex: 1
  },
  appIconContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  headerText: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S30,
    lineHeight: FontLineHeights.LH55,
    color: theme.colors.white
  },
  subHeaderText: {
   ...fontGroup.p400,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH25,
    color: theme.colors.white,
    marginTop: 10,
  },
  input: {
   ...fontGroup.sf400,
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme?.colors?.inputBG
  },
  buttonStyle: {
    height: 50
  },
  buttonContainerStyle: {
    marginBottom: '10%'
  },
  otptext: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH20,
    color: theme.colors.white,
  },
  resendButton: {
    ...fontGroup.sf400,
    fontSize: FontSizes.S14,
    color: theme.colors.inputBlue,
    textDecorationLine: "underline"
  },
  childView: { flex: 1 },
  scroll: { flex: 1 },
  alreadyHaveAccount: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH16,
    color: theme.colors.white,
    marginBottom: 10
  },
  SignInLink: {
    ...fontGroup.sf500,
    fontSize: FontSizes.S14,
    color: theme.colors.inputBlue,
  },
}))

export default useStyles
