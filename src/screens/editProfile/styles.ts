import { makeStyles } from '@rneui/themed';
import { screenHorizontalPadding } from '../../util/AppDimensions';
import { FontLineHeights, FontSizes, fontGroup } from '../../util/FontUtils';

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    flex: 1,
    backgroundColor: theme?.colors?.inputBG,
  },
  container: {
    paddingHorizontal: screenHorizontalPadding - 5,
    flex: 1,
    marginTop: -15
  },
  buttonContainer: { marginBottom: '10%' },
  buttonStyle: { height: 50 },
  input: {
    ...fontGroup.sf500,
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme?.colors?.inputBG,
    marginVertical: -5
  },
  timeInput: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme?.colors?.inputBG,
    marginVertical: -5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chidlView: { flex: 1 },
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
    ...fontGroup.sf500,
    color: theme.colors.white,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH20,
    paddingLeft: 12
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  listContent: {
    paddingBottom: '10%'
  },
  dropdownStyle: {
    backgroundColor: theme.colors.inputBG,
    borderColor: theme.colors.inputBG,
    borderRadius: 6,
  },
  placeholderStyle: {
    ...fontGroup.sf500,
    color: theme.colors.grey,
    marginStart: 3,
    fontSize: FontSizes.S14,
    opacity: 1,
  },
  placeholderDOBStyle: {
    ...fontGroup.sf500,
    color: theme.colors.white,
    marginStart: 3,
    fontSize: FontSizes.S14,
    opacity: 1,
  },
  timeteststyle: {
    ...fontGroup.sf500,
    marginStart: 3,
    color: theme.colors.grey,
    fontSize: FontSizes.S14,
    opacity: 1,
  },
  itemContainerStyle: {
    color: theme.colors.grey,
    backgroundColor: theme.colors.inputBG,
    borderRadius: 6
  },
  dropdownParentView: { zIndex: 1, marginBottom: 20, marginTop: -7 },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1, // This will make the text take up the available space
  },
  privacyContainer: {
    flexDirection: 'row',
    // paddingHorizontal: 20,
    paddingRight: screenHorizontalPadding + 30,
    marginVertical: '7%',
  },
  privacyText: {
    ...fontGroup.p400,
    color: theme.colors.grey,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH20,
  },
  focusedInput: {
    backgroundColor: theme.colors.inputBlue
  },
  inputError: {
    backgroundColor: theme.colors.pink
  },
  errorText: {
    color: 'red',
    fontSize: FontSizes.S13, 
    marginLeft: 5, 
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

export default useStyles;
