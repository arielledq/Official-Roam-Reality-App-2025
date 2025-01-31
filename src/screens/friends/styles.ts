import { Path } from "react-native-svg";
import { makeStyles } from "@rneui/themed";
import { FontSizes, fontGroup } from "../../util/FontUtils";
import { screenHorizontalPadding } from "../../util/AppDimensions";

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
  headerText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S18,
    color: theme.colors.white,
  },
  subHeaderText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S18,
    color: theme.colors.white,
    paddingLeft: 20,
  },
  text: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S18,
    color: theme.colors.white,
    paddingLeft: 10,
  },
  textSelected: {
    color: theme.colors.pink,
    fontWeight: "bold",
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
  greenLabel: {
    color: theme.colors.green,
  },
  title: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S12,
    color: theme.colors.magenta,
  },
  subTitle: {
    ...fontGroup.nunitoLight,
    fontSize: FontSizes.S10,
    color: theme.colors.white,
  },
  addButton: {
    ...fontGroup.nunitoBold,
    color: theme.lightColors?.green,
    fontSize: FontSizes.S12,
  },
}));
export default useStyles;
