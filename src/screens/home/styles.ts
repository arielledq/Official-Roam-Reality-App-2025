import { makeStyles } from "@rneui/themed";
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils";
import { screenHorizontalPadding } from "util/AppDimensions";

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    paddingHorizontal: screenHorizontalPadding,
    paddingBottom: 80,
  },
  container: {
    flex: 1,
    paddingHorizontal: screenHorizontalPadding,
    paddingBottom: 80,
  },
  heading: {
    fontSize: FontSizes.S20,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.ns700,
    fontWeight: "700",
    color: theme.colors.white,
    marginTop: 5,
    textAlign: "center",
  },
  imageBg: {
    width: "100%",
    minHeight: 180,
    borderRadius: 20,
    marginBottom: 20,
    paddingVertical: 20,
    backgroundColor: "#131422",
  },
  containerStyle: {
    marginTop: 16,
  },
  row1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  firstView: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  headerText: {
    ...fontGroup.ns700,
    fontWeight: "700",
    fontSize: FontSizes.S26,
    lineHeight: FontLineHeights.LH35,
    marginVertical: 0,
  },
  imageStyle: {
    borderRadius: 20,
  },
  innerView: {
    width: "70%",
  },
  challengesText: {
    ...fontGroup.ns800,
    fontWeight: "800",
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH15,
    marginTop: 10,
    marginStart: 3,
  },
  subtitleText: {
    ...fontGroup.ns400,
    fontWeight: "400",
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH15,
    marginTop: 10,
    marginStart: 3,
  },
  list: {
    marginBottom: 80,
    flex: 1,
  },
  blurView: {
    overflow: "hidden",
    position: "absolute",
    top: 0,
    zIndex: 10,
  },
  headerContainer: {
    paddingVertical: 15,
    borderBottomWidth: 0,
    backgroundColor: "rgba(0, 0, 0, 0.0)",
  },
}));

export default useStyles;
