import { makeStyles } from '@rneui/themed'
import { FontLineHeights, FontSizes, fontGroup } from '../../util/FontUtils'

const useStyles = makeStyles(theme => ({
  cardWrapper: {
    width: 115,

    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: theme.colors.boxStatBG,
    borderRadius: 12,

    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 8,

    gap: 4,
  },
  cardContainer: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  cardImage: {
    width: 100,
    height: 100 / (9 / 16),
    borderRadius: 10,
  },
  cardContent: {
    gap: 4,
  },
  title: {
    ...(fontGroup.ns800 as any),
    fontSize: FontSizes.S12,
    fontWeight: 800,
    color: theme.colors.white,
  },
  description: {
    height: 32,
    ...(fontGroup.sf500 as any),
    fontSize: FontSizes.S10,
    fontWeight: 800,
    lineHeight: FontLineHeights.LH12,
    color: theme.colors.TandCgrey,
  },
}))

export default useStyles
