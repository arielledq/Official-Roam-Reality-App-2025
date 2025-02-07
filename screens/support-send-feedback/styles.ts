import { makeStyles } from "@rneui/themed";
import { screenHorizontalPadding } from "../../src/util/AppDimensions";
import { FontSizes, fontGroup } from "../../src/util/FontUtils";

const useStyles = makeStyles(theme => ({
  container: {
    paddingHorizontal: screenHorizontalPadding - 15,
    flex: 1,
    marginTop: 20,
  },
  chidlView: { flex: 1 },
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
  buttonContainer: { marginBottom: "10%" },
  buttonStyle: { height: 50 },
  textbox: {
    height: 140,
    paddingTop: 20,
    paddingLeft: 20,
    backgroundColor: theme?.colors?.inputBG,
  },
  subHeaderText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S18,
    color: theme.colors.white,
    paddingLeft: 20,
  },
  text: {
    ...fontGroup.nunitoLight,
    fontSize: FontSizes.S14,
    color: theme.colors.white,
    paddingLeft: 10,
  },
  scroll: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowSpaceBetween: {
    justifyContent: "space-between",
  },
  linkContainer: {
    paddingLeft: 10,
    paddingRight: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  contactOption: {
    paddingVertical: 20,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    backgroundColor: theme?.colors?.inputBG,
  },
  link: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    color: theme.colors.inputBlue,
  },
  linkImages: {
    width: 27,
    aspectRatio: 1,
  },
  linkText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    color: theme.colors.white,
    paddingLeft: 10,
  },
}));
export default useStyles;
