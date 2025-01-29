import { makeStyles } from "@rneui/themed";
import { FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils";

const useStyles = makeStyles(_theme => ({
  mainContainer: {
    flex: 1,
    backgroundColor: "#202136",
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
  },
  imageBg: {
    width: "100%",
    minHeight: 180,
    borderRadius: 20,
    marginBottom: 20,
    paddingVertical: 20,
    backgroundColor: "#131422",
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
    fontSize: FontSizes.S22,
    lineHeight: FontLineHeights.LH30,
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
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH15,
    marginTop: 10,
    marginStart: 3,
  },
  subtitleText: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH15,
    marginTop: 10,
    marginStart: 3,
  },
  containerStyle: {
    marginTop: 140,
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
