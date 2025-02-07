import { makeStyles } from "@rneui/themed";
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils";

const useStyles = makeStyles(theme => ({
  heading: {
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.nunitoBold,
    color: theme.colors.white,
    marginTop: 5,
  },
  containerStyle: {
    borderBottomWidth: 0,
    alignItems: "center",
  },
  backIcon: { paddingHorizontal: 5 },
}));

export default useStyles;
