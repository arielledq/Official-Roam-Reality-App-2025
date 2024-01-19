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
  container: {
    paddingHorizontal: screenHorizontalPadding,
    marginTop: '10%',
    flex: 1,
  },
  buttonContainer: { marginBottom: '10%' },
  buttonStyle: { height: 50 },
  input: {
    height: 50,
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
