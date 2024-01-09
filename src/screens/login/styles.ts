import { makeStyles } from '@rneui/themed';
import { screenHorizontalPadding } from '../../util/AppDimensions';
import { FontFamily, FontLineHeights, FontSizes } from '../../util/FontUtils';

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    flex: 1,
  },
  container: { paddingHorizontal: screenHorizontalPadding, marginTop: '10%' },

  input: {
    height: 58,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: theme?.colors?.inputBG,
  },

}));

export default useStyles;
