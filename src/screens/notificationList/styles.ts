import { makeStyles } from "@rneui/themed"
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils"

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    backgroundColor: "#202136"
  },
  container: {
    flex: 1,
    paddingHorizontal: 15
  },
  firstView: {
    flex: 1
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors?.inputBG,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5
  },
  headerText: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S26,
    lineHeight: FontLineHeights.LH35,
    marginVertical: 0
  },
  title: {
    ...fontGroup.ns600,
    color: theme.colors.magenta,
    fontSize: 12
  },
  date: {
    ...fontGroup.ns300,
    color: theme.colors.white,
    fontSize: 8,
    marginTop: 2,
    marginBottom: 5
  },
  message: {
    ...fontGroup.p300,
    color: theme.colors.white,
    fontSize: 10
  },
  actionLabel: {
    ...fontGroup.p600,
    color: theme.colors.white,
    fontSize: 14
  }
}))

export default useStyles
