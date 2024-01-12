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
    paddingHorizontal: screenHorizontalPadding
  },
  container: { marginTop: "10%" },
  headerText: {
    fontFamily: FontFamily.NunitoSansBold,
    fontSize: FontSizes.S40,
    lineHeight: FontLineHeights.LH55,
    color: theme.colors.white,
    marginTop: 10,
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
  fpText: {
    fontFamily: FontFamily.SFUIDisplay,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH24,
    color: theme.colors.white,
    textAlign: "right",
    marginTop: -10
  },
  buttonStyle: {
    height: 50
  },
  buttonContainerStyle: {
    marginTop: 20
  },
  divider: {
    marginVertical: '10%',
  },
  termsAndConditionstext: {
    fontFamily: FontFamily.SFUIDisplay,
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH15,
    color: theme.colors.TandCgrey,
    textAlign: "center",
    marginTop: 10
  },
  TandCLink: {
    fontFamily: FontFamily.SFUIDisplay,
    fontSize: FontSizes.S12,
    color: theme.colors.purple,
    textDecorationLine: "underline"
  },
  alreadyHaveAccount: {
    fontFamily: FontFamily.NunitoSansSemiBold,
    fontSize: FontSizes.S13,
    lineHeight: FontLineHeights.LH16,
    color: theme.colors.grey,
    textAlign: "center",
    marginTop: '20%'
  },
  SignInLink: {
    fontFamily: FontFamily.NunitoSansSemiBold,
    fontSize: FontSizes.S14,
    color: theme.colors.purple,
    textDecorationLine: "underline"
  },
  socialSUcontainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  socialSIicon: {
    marginHorizontal: 10
  }
}))

export default useStyles
