import { makeStyles } from "@rneui/themed";
import { screenHorizontalPadding } from "../../util/AppDimensions";
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils";

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    paddingHorizontal: screenHorizontalPadding,
    paddingBottom: 20,
  },
  container: { marginTop: "9%" },
  headerText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S40,
    lineHeight: FontLineHeights.LH55,
    color: theme.colors.white,
    marginTop: "10%",
  },
  subHeaderText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH25,
    color: theme.colors.white,
    marginTop: 10,
  },
  input: {
    ...fontGroup.nunitoRegular,
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme?.colors?.inputBG,
  },
  fpText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH24,
    color: theme.colors.white,
    textAlign: "right",
    marginTop: -10,
  },
  buttonStyle: {
    height: 50,
  },
  buttonContainerStyle: {
    marginTop: 20,
  },
  divider: {
    marginBottom: "10%",
  },
  termsAndConditionstext: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH20,
    color: theme.colors.white,
    textAlign: "center",
    marginTop: "5%",
  },
  TandCLink: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S12,
    color: theme.colors.purple,
    textDecorationLine: "underline",
  },
  alreadyHaveAccount: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S13,
    lineHeight: FontLineHeights.LH16,
    color: theme.colors.white,
    textAlign: "center",
    marginBottom: 50,
  },
  SignInLink: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S14,
    color: theme.colors.purple,
    textDecorationLine: "underline",
  },
  socialSUcontainer: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  socialSIicon: {
    marginHorizontal: 10,
  },
}));

export default useStyles;
