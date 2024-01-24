import { makeStyles } from '@rneui/themed';
import { moderateScale, verticalScale } from '../../util/AppDimensions';
import { FontLineHeights, FontSizes, fontGroup } from '../../util/FontUtils';

const useStyles = makeStyles((theme) => ({
  container: {
    marginLeft: 0,
    marginRight: 0,
    borderRadius: 4,
    marginBottom: 5
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'center',
    marginLeft: moderateScale(10),
    marginRight: moderateScale(10),
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
  },
  Text: {
    ...fontGroup.p600,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH21,
    color: theme.colors.white,
    marginLeft: 10
  },
  leftContainer: {
    flexDirection: 'row'
  }
}));

export default useStyles;
