import { makeStyles } from "@rneui/themed";
import { screenHorizontalPadding } from "../../util/AppDimensions";
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils";

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
    marginTop: 20,
    marginHorizontal: 5,
  },
  heading: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S22,
    lineHeight: FontLineHeights.LH30,
    color: theme.colors.white,
    flex: 1,
    marginLeft: -5,
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
    lineHeight: FontLineHeights.LH66,
    marginTop: "5%",
  },
  statContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  boxstatContainerStyle: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  arrow_3: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: -29,
    marginTop: -23,
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
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH16,
    marginLeft: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  editButtonContainer: {
    position: "absolute",
    top: 140,
    right: 20,
    zIndex: 10,
  },
  editButton: {
    marginVertical: 5,
    // flexDirection: "row",
    // alignItems: "center"
  },
  container_style: {
    paddingBottom: "50%",
  },
  blurView: {
    overflow: "hidden",
    position: "absolute",
    top: 0,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  removeBtnContainer: {
    width: 107,
    backgroundColor: theme?.colors?.inputRed,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  removeBtnText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S12,
    margin: 0,
  },
}));

export default useStyles;
