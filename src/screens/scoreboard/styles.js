import { makeStyles } from "@rneui/themed";
import { screenHorizontalPadding } from "../../util/AppDimensions";
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils";

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  heading: {
    fontSize: FontSizes.S20,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.ns700,
    color: theme.colors.white,
    marginTop: 5,
    textAlign: "center",
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: screenHorizontalPadding,
    justifyContent: "flex-start",
    position: "relative",
    paddingBottom: 65,
  },
  subTitle: {
    ...fontGroup.p600,
    fontSize: FontSizes.S18,
    color: theme.colors.white,
    marginVertical: 10,
  },
  rankText: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
  },
  rankTextNumber: {
    ...fontGroup.ns600,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
  },
  nameText: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    width: 80,
  },
  destinationText: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S12,
    color: "#D1D5DB",
  },
}));

export default useStyles;
