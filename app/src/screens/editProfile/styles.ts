import {makeStyles} from "@rneui/themed";
import {screenHorizontalPadding} from "../../util/AppDimensions";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

// @ts-ignore
const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    backgroundColor: theme?.colors?.inputBG,
  },
  container: {
    paddingHorizontal: screenHorizontalPadding - 5,
    flex: 1,
    marginTop: -15,
  },
  buttonContainer: {marginBottom: "10%"},
  buttonStyle: {height: 50},
  input: {
    ...fontGroup.nunitoRegular,
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme?.colors?.inputBG,
    marginVertical: -5,
  },
  timeInput: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme?.colors?.inputBG,
    marginVertical: -5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chidlView: {flex: 1},
  dropdown: {
    height: 50,
    backgroundColor: theme.colors.inputBG,
    borderRadius: 6,
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 5,
  },
  selectedTextStyle: {
    ...fontGroup.nunitoRegular,
    color: theme.colors.grey0,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH20,
    paddingLeft: 12,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  listContent: {
    paddingBottom: "10%",
  },
  dropdownStyle: {
    backgroundColor: theme.colors.inputBG,
    borderColor: theme.colors.inputBG,
    borderRadius: 6,
  },
  placeholderStyle: {
    ...fontGroup.nunitoRegular,
    color: theme.colors.grey0,
    marginStart: 3,
    fontSize: FontSizes.S14,
    opacity: 1,
  },
  placeholderDOBStyle: {
    ...fontGroup.nunitoRegular,
    color: theme.colors.white,
    marginStart: 3,
    fontSize: FontSizes.S14,
    opacity: 1,
  },
  timeteststyle: {
    ...fontGroup.nunitoRegular,
    marginStart: 3,
    color: theme.colors.grey0,
    fontSize: FontSizes.S14,
    opacity: 1,
  },
  itemContainerStyle: {
    color: theme.colors.grey0,
    backgroundColor: theme.colors.grey4,
  },
  dropdownParentView: {
    marginBottom: 20,
    marginTop: -7,
  },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1, // This will make the text take up the available space
  },
  privacyContainer: {
    flexDirection: "row",
    // paddingHorizontal: 20,
    paddingRight: screenHorizontalPadding + 30,
    marginVertical: "7%",
  },
  privacyText: {
    ...fontGroup.nunitoRegular,
    color: theme.colors.grey0,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH20,
  },
  focusedInput: {
    backgroundColor: theme.colors.inputBlue,
  },
  inputError: {
    backgroundColor: theme.colors.pink,
  },
  errorText: {
    fontSize: FontSizes.S13,
    marginLeft: 5,
    color: theme.colors.error,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}));

export default useStyles;
