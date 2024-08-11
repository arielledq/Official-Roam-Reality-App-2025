import { makeStyles } from '@rneui/themed';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { FontLineHeights, FontSizes, fontGroup } from '../../util/FontUtils';

const useStyles = makeStyles((theme) => ({
  cardInner: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    height: 172,
    width: 127,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: theme.colors.boxStatBG,
    marginRight: 9,
    marginLeft: 19,
    marginBottom: '50%'
  },
  cardBottomContent: {
    // alignContent: 'center',
    // alignItems: 'center',
    // justifyContent: 'center',
    // marginTop: -20
    paddingHorizontal:12
  },
  titleStyle: {
    ...fontGroup.ns800,
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH16,
    color: theme.colors.white,
    flex:1,
  },
  Text: {
    ...fontGroup.sf500,
    fontSize: FontSizes.S10,
    lineHeight: FontLineHeights.LH12,
    color: theme.colors.TandCgrey,
    marginBottom:2
  },
  iconStyle: {
    marginBottom: 2,
    width:107,
    height:100,
    borderRadius:10
  }
}));

export default useStyles;
