import { makeStyles } from "@rneui/themed"
import { screenHorizontalPadding } from "../../../util/AppDimensions"
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils"

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    backgroundColor:'transparent'
  },
  buttonStyle: {
    height: 50
  },
  buttonContainerStyle: {
    marginTop: 20,
    width: '100%'
  },
  pagerView: {
    flex: 1,
  },
  borderStyles: {
    borderStyle: 'dashed',
    borderColor: 'gray',
  },
  textStyles: {
    color: '#fff',
    fontSize: FontSizes.S22,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.ns700,
  },
  cornerStyles: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
    borderColor: '#aaa',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    fontSize: FontSizes.S22,
    lineHeight: FontLineHeights.LH25,
    marginHorizontal: 8,
    maxWidth: '75%',
    textAlign: 'center',
    ...fontGroup.giRegular,
  },
  filterTitleText: {
    color: '#fff',
    fontSize: FontSizes.S30,
    lineHeight: FontLineHeights.LH33,
    ...fontGroup.giBold,
    marginHorizontal: 5,
    textAlign: 'center'
  },
  filterTextView: {
    position: 'absolute',
    zIndex: 20,
    right: 0,
    left: 0,
    alignItems: 'center'
  },
  locationTextView: {
    position: 'absolute',
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  filterTextBottom: {
    bottom: 25
  },
  locationTextBottom: {
    bottom: 80
  },
  filterTextTop: {
    top: 80
  },
  locationTextTop: {
    top: 25
  },
  appNameText: {
    color: '#fff',
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH33,
    ...fontGroup.giRegular,
    marginHorizontal: 5,
    textAlign: 'center'
  },
  textFilterView: {
    justifyContent: "flex-start",
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    paddingVertical:10

  },
  imageFilterView: {
    width:100,height:100
  }
}))

export default useStyles