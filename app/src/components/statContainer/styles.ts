import {makeStyles} from "@rneui/themed";
import {widthPercentageToDP as wp} from "react-native-responsive-screen";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";
import {Platform} from "react-native";

const useStyles = makeStyles(theme => ({
  cardInner: {
    // justifyContent: "center",
    // alignContent: "center",
    // alignItems: "center",
  },
  cardContainer: {
    width: wp("27%"),
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 56,
    paddingBottom: wp("10%"),
    paddingTop: wp("2%"),
    gap: 10,
    backgroundColor: theme.colors.boxStatBG,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardBottomContent: {
    // alignContent: "center",
    // alignItems: "center",
    // justifyContent: "center",
    // marginTop: -20,
  },
  valueStyle: {
    ...fontGroup.nutinoExtraBold,
    fontSize: FontSizes.S26,

    color: theme.colors.white,
    // marginTop: 7,
  },
  Text: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S10,
    lineHeight: FontLineHeights.LH14,
    color: theme.colors.white,
    opacity: 0.8,
  },
  iconStyle: {
    width: wp("22%"),
    height: wp("22%"),
    borderRadius: 200,
    justifyContent: "center",
    alignItems: "center",
  },
}));

export default useStyles;
