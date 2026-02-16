import {makeStyles} from "@rneui/themed";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  heading: {
    fontSize: FontSizes.S20,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.nunitoBold,
    color: theme.colors.white,
    marginTop: heightPercentageToDP("1.5%"),
    textAlign: "center",
  },
  container: {marginTop: "10%"},
  headerText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S24,
    color: theme.colors.white,
  },
  subHeaderText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    marginTop: 5,
  },
  pointsText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S24,
    color: theme.colors.white,
  },
  yourPointsText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    marginTop: 5,
  },
  rowView: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonSelectText: {
    fontSize: FontSizes.S14,
    color: theme.colors.white,
    fontWeight: "bold",
  },
  selectButtonStyle: {
    backgroundColor: "#B816E050",
    borderColor: "#B816E0",
    borderRadius: 2,
    borderWidth: 1,
    height: 37,
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 2,
    marginStart: 2,
  },
  unSelectButtonStyle: {
    backgroundColor: "#77777750",
    borderColor: "#6B7280",
    borderRadius: 2,
    borderWidth: 1,
    height: 37,
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
    marginStart: 2,
    marginEnd: 2,
  },
  //Flat Item
  containerView: {
    paddingHorizontal: 12,
    marginVertical: 15,
    flex: 1,
    minHeight: 280,
    justifyContent: "flex-end",
    alignItems: "center",
    borderRadius: 12,
    margin: 5,
    overflow: "hidden",
    position: "relative",
  },
  list_title: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S26,
    color: theme.colors.white,
    marginTop: 5,
  },
  s_list_count: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S14,
    color: theme.colors.white,
    alignItems: "center",
    textAlign: "center",
  },
  s_list_text: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    alignItems: "center",
    textAlign: "center",
  },
  gradient: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  profileImage: {
    width: heightPercentageToDP("6%"),
    height: heightPercentageToDP("6%"),
    borderRadius: 100,
  },
  shadowBoxImage: {
    width: widthPercentageToDP(12),
    height: widthPercentageToDP(12),
    borderRadius: widthPercentageToDP(100),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: heightPercentageToDP(0.2),
  },
}));

export default useStyles;
