import { makeStyles } from '@rneui/themed';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { FontLineHeights, FontSizes, fontGroup } from '../../util/FontUtils';
import { Platform } from 'react-native';

const useStyles = makeStyles((theme) => ({
  cardInner: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    height: 190,
    width: wp('27%'),
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 56,
    backgroundColor: theme.colors.statBG,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardBottomContent: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20
  },
  valueStyle: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH22,
    color: theme.colors.white,
    marginTop: 7
  },
  Text: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S10,
    lineHeight: FontLineHeights.LH14,
    color: theme.colors.white,
    opacity: 0.8,
  },
  iconStyle: {
    marginTop: -42,
    marginBottom: 2
  }
}));

export default useStyles;
