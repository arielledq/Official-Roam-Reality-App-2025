import { makeStyles } from '@rneui/themed';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { FontLineHeights, FontSizes } from '../../util/FontUtils';


const useStyles = makeStyles((theme) => ({
  cardContainer: {
    height: 60,
    width: wp('28%'),
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: theme.colors.boxStatBG
  },
  cardInner: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  cardBottomContent: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  TextNameTop: {
    fontSize: FontSizes.S22,
    lineHeight: FontLineHeights.LH24,
    color: theme.colors.white,
  },
  Text: {
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH16,
    color: theme.colors.white,
    // opacity: 0.9,
  },
}));

export default useStyles;
