import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../util/AppDimensions"
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils"

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    backgroundColor: theme?.colors?.inputBG
  },

  headerContainer: {
    paddingVertical: 15,
    borderBottomWidth: 0,
    // backgroundColor: "transparent",
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
    // position: "absolute",
    // top: 0,
    // left: 0,
    // right: 0,
    // zIndex: 2
  },
  header: {
    marginBottom: "12%"
  },
  headingView: {
    flexDirection: "row",
    marginTop: "15%",
    marginHorizontal: 5
  },
  heading: {
    ...fontGroup.ns800,
    fontSize: FontSizes.S22,
    lineHeight: FontLineHeights.LH30,
    color: theme.colors.white,
    flex: 1,
    marginLeft: -5
  },
  menuIcon: {
    paddingLeft: 5
  },
  scroll: {
    paddingHorizontal: screenHorizontalPadding - 4
  },
  scoreboardContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreboard: {
    ...fontGroup.ns900,
    color: theme.colors.lightGrey,
    fontSize: FontSizes.S48,
    lineHeight: FontLineHeights.LH66,
    marginTop: "10%",
  },
  statContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  boxstatContainerStyle: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  arrow_3: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: -29,
    marginTop: -23
  },
  buttonStyle: {
    height: 44
  },
  buttonContainerStyle: {
    marginTop: 20,
    width: 112
  },
  buttonText: {
    ...fontGroup.ns900,
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH16,
    marginLeft: 10
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10
  },
  editButtonContainer: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 1
  },
  editButton: {
    borderRadius: 20,
    height: 47,
    width: 120,
    flexDirection: "row",
    alignItems: "center"
  },
}))

export default useStyles
