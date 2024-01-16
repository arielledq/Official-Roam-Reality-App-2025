import { makeStyles } from "@rneui/themed"
import { FontFamily, FontLineHeights, FontSizes,fontGroup } from "../../util/FontUtils"

const useStyles = makeStyles(theme => ({
  row: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  nameContainer: { flex: 1 },
  name: {
    color: theme.colors.black,
    fontSize: FontSizes.S20,
    ...fontGroup.ns700,
    lineHeight: FontLineHeights.LH27
  },
  userName: {
    color: theme.colors.black,
    fontSize: FontSizes.S12,
    ...fontGroup.ns400,
    lineHeight: FontLineHeights.LH16,
  },
  containerBottom: {
    flexDirection: "row",
    flex: 1,
  },
  verificationStatus: {
    color: theme.colors.black,
    fontSize: FontSizes.S12,
    marginLeft: 8
  }
}))

export default useStyles
