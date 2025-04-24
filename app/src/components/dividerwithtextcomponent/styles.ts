import { makeStyles } from "@rneui/themed";
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils";

const useStyles = makeStyles(theme => ({
  container: { flexDirection: "row" },
  divider: {
    flex: 1.2,
    backgroundColor: theme.colors.dividerGrey,
    opacity: 0.3,
    height: 1,
    alignSelf: "center",
  },
  label: {
    ...fontGroup.nunitoRegular,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    color: theme.colors.white,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH20,
  },
}));

export default useStyles;
