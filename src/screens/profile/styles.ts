import { makeStyles } from '@rneui/themed';
import { screenHorizontalPadding } from '../../util/AppDimensions';
import { FontLineHeights, FontSizes } from '../../util/FontUtils';

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    flex: 1,
    backgroundColor: theme?.colors?.inputBG,
  }, 
  headerStyle: {
    fontSize: FontSizes.S24,
    lineHeight: FontLineHeights.LH33
  },
  menuIcon: {
    paddingLeft: 5
  },
  scroll: {
    flex: 1,
    // paddingHorizontal: screenHorizontalPadding - 4
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover', // or 'contain' or 'stretch' or 'repeat'
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10%',
    paddingHorizontal: 20,
    paddingVertical: 23
  },
}));

export default useStyles;
