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
    fontSize: FontSizes.S40,
    lineHeight: FontLineHeights.LH55,
    color: theme.colors.white,
    marginTop: 10,
    fontWeight: "900"
  },
  subHeaderText: {
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH25,
    color: theme.colors.white,
    marginTop: 10,
    fontWeight: "400"
  },
  input: {
    height: 58,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme?.colors?.inputBG
  },
  fpText: {
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
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH15,
    color: theme.colors.TandCgrey,
    textAlign: "center",
    marginTop: 10
  },
  TandCLink: {
    fontSize: FontSizes.S12,
    color: theme.colors.purple,
    textDecorationLine: "underline"
  },
  alreadyHaveAccount: {
    fontSize: FontSizes.S13,
    lineHeight: FontLineHeights.LH16,
    color: theme.colors.grey,
    textAlign: "center",
    marginBottom: 20
  },
  SignInLink: {
    fontSize: FontSizes.S14,
    color: theme.colors.purple,
    textDecorationLine: "underline"
  },
  socialSUcontainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  label: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colors.white,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH20,
  },
  socialSIicon: {
    marginHorizontal: 10
  }
}))

export default useStyles
