import { makeStyles } from "@rneui/themed";
import { FontSizes, fontGroup } from "../../../util/FontUtils";

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  challengeInfoContainer: {
    width: "100%",
    backgroundColor: "#131422",
    height: 420,
    borderRadius: 30,
    position: "absolute",
    alignItems: "center",
    bottom: 0,
  },
  challengeInfoHeaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
    borderBottomColor: "#2C2D41",
    borderBottomWidth: 1,
    width: "100%",
  },
  challengeInfoHeader: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S18,
    color: theme.colors.white,
    marginTop: 10,
  },
  bottomText: {
    ...fontGroup.p700,
    fontSize: FontSizes.S19,
    textAlign: "center",
    color: "#1158F4",
    marginVertical: 15,
    fontWeight: "700",
  },
}));

export default useStyles;
