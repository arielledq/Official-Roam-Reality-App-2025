import { makeStyles } from "@rneui/themed"
import { FontFamily, FontLineHeights, FontSizes,fontGroup } from "../../util/FontUtils"

const useStyles = makeStyles(theme => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameContainer: { flex: 1 },
  name: {
    ...fontGroup.ns700,
    color: theme.colors.white,
    fontSize: FontSizes.S30,
    lineHeight: FontLineHeights.LH40,
  },
  name1 : {
    ...fontGroup.ns700,
    color: theme.colors.white,
    fontSize: FontSizes.S30,
    lineHeight: FontLineHeights.LH40,
    marginTop : 150
  },
  userName: {
    ...fontGroup.ns400,
    color: theme.colors.grey,
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH16,
  },
  containerBottom: {
    flexDirection: "row",
    alignItems: 'center', 
    marginTop: '6%'
  },
  verificationIcon:{
    marginHorizontal: 5
  },
  verificationStatus: {
    ...fontGroup.p500,
    color: theme.colors.yellow,
    fontSize: FontSizes.S10,
    lineHeight: FontLineHeights.LH14
  },
  verifyNowContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  verifyNow: {
    ...fontGroup.ns700,
    color: theme.colors.inputRed,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH20
  },
  verifyButton: {
    height: 30,
    width: 95,
    backgroundColor: theme.colors.buttonGrey,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5
  }
}))

export default useStyles
