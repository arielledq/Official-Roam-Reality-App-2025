import {makeStyles} from "@rneui/themed";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";

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
    marginTop: 4,
    textAlign: "center",
  },
  listHeaderContainer: {
    gap: 8,
  },
  countryFiltersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  rankTitle: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S14,
    color: theme.colors.white,
    marginVertical: 12,
  },
  leaderboardTitle: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    color: theme.colors.white,
    marginVertical: 12,
  },
  rankText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S8,
    color: theme.colors.white,
  },
  rankTextPosition: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
  },
  pointsText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S18,
    color: theme.colors.white,
  },
  nameText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    color: theme.colors.white,
  },
  destinationText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S12,
    color: "#D1D5DB",
  },
  tabsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
    gap: 4,
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
  countryButtonStyle: {
    height: 60,
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: 2,
    flex: 0.5,
    marginEnd: 2,
    marginStart: 2,
  },
  countrySelectedButtonStyle: {
    backgroundColor: "#B816E050",
  },
  countryUnSelectedButtonStyle: {
    backgroundColor: "#13142290",
  },
  buttonSelectText: {
    fontSize: FontSizes.S14,
    color: theme.colors.white,
    fontWeight: "bold",
  },
}));

export default useStyles;
