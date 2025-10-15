import {makeStyles} from "@rneui/themed";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";
import {widthPercentageToDP} from "react-native-responsive-screen";

const useStyles = makeStyles(theme => ({
  cardWrapper: {
    width: "30%",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.boxStatBG,
    borderRadius: 12,

    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 8,

    gap: 4,
  },
  cardContainer: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    gap: 4,
  },
  cardImage: {
    width: 100,
    height: 100 / (100 / 143),
    borderRadius: 10,
  },
  cardContent: {
    gap: 8,
    width: "100%",
  },
  title: {
    ...(fontGroup.nunitoBold as any),
    fontSize: FontSizes.S12,
    fontWeight: 800,
    color: theme.colors.white,
  },
  description: {
    height: 32,
    ...(fontGroup.nunitoRegular as any),
    fontSize: FontSizes.S10,
    fontWeight: 500,
    lineHeight: FontLineHeights.LH12,
    color: theme.colors.white,
  },
  buttonText: {
    ...(fontGroup.nunitoRegular as any),
    fontSize: FontSizes.S10,
    fontWeight: 400,
    color: theme.colors.white,
  },
}));

export default useStyles;
