import { makeStyles } from '@rneui/themed';
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
  scroll: { flex: 1 },
}));

export default useStyles;
