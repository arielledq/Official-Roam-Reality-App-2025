import {makeStyles} from "@rneui/themed";
import {screenHorizontalPadding} from "../../util/AppDimensions";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    backgroundColor: theme?.colors?.inputBG,
  },

  headerContainer: {
    paddingVertical: 15,
    borderBottomWidth: 0,
    backgroundColor: "rgba(0, 0, 0, 0.0)",
  },
  header: {
    marginBottom: 20,
  },
  headingView: {
    flexDirection: "row",
    paddingHorizontal: screenHorizontalPadding,
    marginBottom: widthPercentageToDP(8),

    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S24,
    fontWeight: "800",
    lineHeight: FontLineHeights.LH30,
    color: theme.colors.white,
    flex: 1,
    alignItems: "center",
  },
  menuIcon: {
    paddingLeft: 5,
  },
  scroll: {
    paddingHorizontal: screenHorizontalPadding - 4,
  },
  scoreboardContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  scoreboard: {
    ...fontGroup.nunitoBold,
    color: theme.colors.grey3,
    fontSize: FontSizes.S48,
    fontWeight: "900",
    lineHeight: FontLineHeights.LH66,
    marginTop: "5%",
  },
  statContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    padding: 10,
  },
  boxstatContainerStyle: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  buttonStyle: {
    height: 44,
  },
  buttonContainerStyle: {
    marginTop: 20,
    width: 112,
  },
  buttonText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S10,
    lineHeight: FontLineHeights.LH16,
    marginLeft: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  editButtonContainer: {
    // position: "absolute",
    right: 10,
    zIndex: 10,

    // top: heightPercentageToDP(1),
  },
  editButton: {
    marginVertical: 5,
    width: widthPercentageToDP(22),
  },
  container_style: {
    paddingBottom: 50,
  },
  blurView: {
    overflow: "hidden",
    position: "absolute",
    top: 0,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  shadowBoxImage: {
    width: widthPercentageToDP(12),
    height: widthPercentageToDP(12),
    justifyContent: "center",
    alignItems: "center",
  },
}));

export default useStyles;
