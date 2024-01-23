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
  headerStyle: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S24,
    lineHeight: FontLineHeights.LH33,
    marginTop: 0
  },
  headerContainer: {
    paddingVertical: 15,
    borderBottomWidth: 0,
  },
  menuIcon: {
    paddingLeft: 5
  },
  scroll: {
    paddingHorizontal: screenHorizontalPadding - 4
  },
  scoreboard: {
    ...fontGroup.ns900,
    color: theme.colors.lightGrey,
    fontSize: FontSizes.S48,
    lineHeight: FontLineHeights.LH66,
    marginTop: '10%'
  },
  statContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boxstatContainerStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  boxstatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: '15%'
  }, 
}));

export default useStyles;
