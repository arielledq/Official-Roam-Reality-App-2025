import { makeStyles } from "@rneui/themed";
import { screenHorizontalPadding } from "../../util/AppDimensions";
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils";

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
    flex: 1,
  },
  appIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S30,
    lineHeight: FontLineHeights.LH55,
    color: theme.colors.white,
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
  buttonStyle: {
    height: 50,
  },
  buttonContainerStyle: {
    marginBottom: "10%",
  },
  otptext: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH20,
    color: theme.colors.white,
  },
  resendButton: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S14,
    color: theme.colors.inputBlue,
    textDecorationLine: "underline",
  },
  childView: { flex: 1 },
  scroll: { flex: 1 },
  alreadyHaveAccount: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH16,
    color: theme.colors.white,
    marginBottom: 10,
  },
  SignInLink: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S14,
    color: theme.colors.inputBlue,
  },
}));

export default useStyles;
