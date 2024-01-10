import { makeStyles } from '@rneui/themed';
import { FontFamily, FontLineHeights, FontSizes } from '../../util/FontUtils';
import { screenHorizontalPadding } from '../../util/AppDimensions';

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
    paddingHorizontal: screenHorizontalPadding,
    marginTop: '10%',
    flex: 1,
  },
  titleTop: {
    // fontFamily: FontFamily.QuicksandBold,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH24,
    color: theme.colors.white,
    marginBottom: 22,
  },
  labelStyle: {
    // fontFamily: FontFamily.QuicksandRegular,
    color: theme?.colors?.white,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH24,
    marginBottom: 2,
  },
  buttonContainer: { marginBottom: '8%' },
  buttonStyle: { height: 50 },
  input: {
    height: 58,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme?.colors?.inputBG,
  },
  scroll: { flex: 1 },
  chidlView: { flex: 1 },
  listContent: {
    paddingBottom: '10%'
  }
}));

export default useStyles;
