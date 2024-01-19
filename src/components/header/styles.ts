import { makeStyles } from '@rneui/themed';
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from '../../util/FontUtils';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.ns700,
    color: theme.colors.white,
    marginTop: 5
  },
  containerStyle: {
    borderBottomWidth: 0,
  },
  backIcon: { paddingHorizontal: 5 },
}));

export default useStyles;
