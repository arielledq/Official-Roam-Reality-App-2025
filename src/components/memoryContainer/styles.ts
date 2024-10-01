import { makeStyles } from '@rneui/themed'
import { FontLineHeights, FontSizes, fontGroup } from '../../util/FontUtils'

const useStyles = makeStyles(theme => ({
  cardWrapper: {
    width: 128,

    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: theme.colors.boxStatBG,
    borderRadius: 12,

    paddingTop: 8,
    paddingBottom: 4,
    gap: 4,
  },
  cardContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  cardImage: {
    width: 112,
    height: 112 / (9 / 16),
    borderRadius: 10,
  },
  cardContent: {
    gap: 4,
  },
  title: {
    ...(fontGroup.ns800 as any),
    fontSize: FontSizes.S12,
    color: theme.colors.white,
  },
  description: {
    height: 32,
    ...(fontGroup.sf500 as any),
    fontSize: FontSizes.S10,
    lineHeight: FontLineHeights.LH12,
    color: theme.colors.TandCgrey,
  },
}))

export default useStyles
