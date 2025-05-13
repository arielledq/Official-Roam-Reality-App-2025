import { makeStyles } from "@rneui/themed";
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils";

const useStyles = makeStyles(theme => ({
  container: {
    paddingHorizontal: 20,
    flex: 1,
    marginTop: 20,
  },
  question: {
    flex: 1,
    ...fontGroup.nunitoRegular,
    color: theme.colors.white,
    fontSize: FontSizes.S15,
    lineHeight: FontLineHeights.LH24,
    marginBottom: 15,
  },
  question1: {
    flex: 1,
    ...fontGroup.nunitoRegular,
    color: theme.colors.white,
    fontSize: FontSizes.S15,
    lineHeight: FontLineHeights.LH24,
    marginBottom: 20,
  },
  answer: {
    ...fontGroup.nunitoRegular,
    color: theme.colors.grey0,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH24,
    marginBottom: 20,
  },
  line: {
    borderBottomColor: theme.colors.grey31,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btn: {
    marginLeft: 10,
  },
  contentContainerStyle: {
    paddingBottom: 50,
  },
}));
export default useStyles;
