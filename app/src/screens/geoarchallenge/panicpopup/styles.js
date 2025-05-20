import { makeStyles } from "@rneui/themed";
import { screenHorizontalPadding } from "../../../util/AppDimensions";
import { FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils";

const useStyles = makeStyles(theme => ({
  container: {
    paddingHorizontal: screenHorizontalPadding,
    flex: 1,
    marginTop: 40,
  },
  input: {
    ...fontGroup.nunitoRegular,
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme?.colors?.inputBG,
    marginVertical: -5,
    color: theme?.colors?.white,
  },
  focusedInput: {
    backgroundColor: theme.colors.inputBlue,
  },
  inputError: {
    backgroundColor: theme.colors.pink,
  },
  buttonContainer: { marginBottom: 10 },
  buttonStyle: { height: 50 },
  textbox: {
    height: 140,
    paddingTop: 20,
    paddingLeft: 20,
  },
  scroll: {
    flex: 1,
  },
  notShareBottomText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S19,
    textAlign: "center",
    color: "#DC2626",
    fontWeight: "700",
  },
  emergencyText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S14,
    color: "#fff",
    marginVertical: 5,
  },
  emergencyTextDes: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S12,
    color: "#fff",
    marginBottom: 10,
  },
}));
export default useStyles;
