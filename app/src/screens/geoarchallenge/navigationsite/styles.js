import { makeStyles } from "@rneui/themed";
import { screenHorizontalPadding } from "../../../util/AppDimensions";
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils";

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
    marginTop: 5,
    textAlign: "center",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#131422",
  },
  container: { marginTop: "10%" },
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
    flexDirection: "row",
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
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 2,
    marginStart: 2,
    paddingHorizontal: 8,
  },
  unSelectButtonStyle: {
    backgroundColor: "#77777750",
    borderColor: "#6B7280",
    borderRadius: 2,
    borderWidth: 1,
    height: 37,
    justifyContent: "center",
    alignItems: "center",
    marginStart: 2,
    marginEnd: 2,
    paddingHorizontal: 8,
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
  site_d_header_text: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S18,
    color: theme.colors.white,
    alignItems: "center",
    textAlign: "center",
  },
  site_d_header_number_text: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S18,
    color: "#C881F0",
    alignItems: "center",
    textAlign: "center",
  },
  site_d_header: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S20,
    color: theme.colors.white,
    marginVertical: 10,
  },
  site_via_text: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    color: theme.colors.white,
  },
  site_via_des_text: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S10,
    color: "#C8DFFF",
  },
  site_d_text: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S10,
    color: "#C8DFFF",
    marginVertical: 10,
  },
  protip_text: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
    color: "#1E63EF",
    marginVertical: 10,
  },
  site_distance_time_text: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S14,
    color: "#fff",
    marginHorizontal: 8,
  },
  site_distance_time_value_text: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S20,
    color: "#C881F0",
    marginHorizontal: 8,
  },
}));

export default useStyles;
