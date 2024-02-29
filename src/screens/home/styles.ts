import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../util/AppDimensions"
import { FontFamily, FontLineHeights, FontSizes,fontGroup } from "../../util/FontUtils"

const useStyles = makeStyles((theme) => ({
  mainContainer : {
    flex:1,
    backgroundColor: '#131422',
    },
    container: {
        flex: 1,
        paddingHorizontal: 25,
        paddingVertical: 20
    },
    imageBg : {
        width : '100%',
        height : 335,
        borderRadius : 20,
        marginBottom :20
      },
      firstView : {
        flex:1
      },
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal : 20,
        paddingBottom : 25,
      },
      headerText : {
      ...fontGroup.ns700,
      fontSize: FontSizes.S26,
      lineHeight: FontLineHeights.LH35,
      marginVertical: 0,
    },
    imageStyle : {
       borderRadius: 20
    },
    innerView : {
      width : '70%'
    },
    challengesText : {
      ...fontGroup.ns800,
      fontSize: FontSizes.S12,
      lineHeight: FontLineHeights.LH15,
      marginTop: 10,
      marginStart: 3
    },
    subtitleText : {
      ...fontGroup.ns400,
      fontSize: FontSizes.S12,
      lineHeight: FontLineHeights.LH15,
      marginTop: 10,
      marginStart: 3
    },
    containerStyle: {
      paddingBottom : 150,
      marginTop : 80
    },
    blurView : {
      overflow: "hidden",
      position:'absolute', 
      top : 0,
      height : 85,
      zIndex : 10
    },
    headerContainer: {
      paddingVertical: 15,
      borderBottomWidth: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.0)'
    },
    })
)

export default useStyles