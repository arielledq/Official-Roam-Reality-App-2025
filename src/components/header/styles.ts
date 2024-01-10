import { makeStyles } from '@rneui/themed';
import { FontFamily, FontLineHeights, FontSizes } from '../../util/FontUtils';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: FontSizes.S20,
    lineHeight: FontLineHeights.LH28,
    fontFamily: FontFamily.NunitoSansBold,
    color: theme.colors.white,
  },
  containerStyle: {
    borderBottomWidth: 0,
  },
  backIcon: { paddingHorizontal: 5 },
}));

export default useStyles;
