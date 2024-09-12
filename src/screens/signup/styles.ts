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
    paddingHorizontal: screenHorizontalPadding,
    paddingBottom: 20
  },
  container: { marginTop: "9%" },
  headerText: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S40,
    lineHeight: FontLineHeights.LH55,
    color: theme.colors.white,
    marginTop: '10%',
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
    backgroundColor: theme?.colors?.inputBG,
  },
  fpText: {
    ...fontGroup.sf400,
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
    marginBottom: '10%',
  },
  termsAndConditionstext: {
    ...fontGroup.sf400,
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH20,
    color: theme.colors.TandCgrey,
    textAlign: "center",
    marginTop: '5%'
  },
  TandCLink: {
    ...fontGroup.sf400,
    fontSize: FontSizes.S12,
    color: theme.colors.purple,
    textDecorationLine: "underline"
  },
  alreadyHaveAccount: {
    ...fontGroup.ns600,
    fontSize: FontSizes.S13,
    lineHeight: FontLineHeights.LH16,
    color: theme.colors.grey,
    textAlign: "center",
    marginBottom: 10
  },
  SignInLink: {
    ...fontGroup.ns600,
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
