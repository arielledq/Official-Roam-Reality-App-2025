import { makeStyles } from "@rneui/themed";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils";

const useStyles = makeStyles(theme => ({
  cardContainer: {
    height: 60,
    width: wp("28%"),
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: theme.colors.grey4,
    marginTop: 7,
    marginHorizontal: 2.6,
  },
  cardMarginLeft: {
    height: 60,
    width: wp("28%"),
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: theme.colors.grey4,
    marginTop: 7,
    marginRight: 2.6,
    marginLeft: 25,
  },
  cardInner: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  TextNameTop: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH20,
    color: theme.colors.white,
  },
  Text: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S10,
    lineHeight: FontLineHeights.LH12,
    color: theme.colors.white,
  },
}));

export default useStyles;
