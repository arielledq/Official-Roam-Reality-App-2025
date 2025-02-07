import { makeStyles } from "@rneui/themed";
import { screenHorizontalPadding } from "../../util/AppDimensions";
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils";

const useStyles = makeStyles(theme => ({
  container: {
    paddingHorizontal: screenHorizontalPadding - 15,
    flex: 1,
    marginTop: 40,
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
  },
  scroll: {
    flex: 1,
  },
}));
export default useStyles;
