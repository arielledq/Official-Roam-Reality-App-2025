import {makeStyles} from "@rneui/themed";
import {screenHorizontalPadding} from "../../../util/AppDimensions";
import {FontFamily, FontLineHeights, FontSizes, fontGroup} from "../../../util/FontUtils";

/**
 *  Using makeStyles to set colors with theme.
 * @return useStyles @method
 */

const useStyles = makeStyles(theme => ({
  mainContainer: {
    flex: 1,
    paddingHorizontal: screenHorizontalPadding,
  },
  container: {marginTop: "10%"},
  headerText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S24,
    color: theme.colors.white,
    marginTop: 10,
  },
  subHeaderText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S12,
    color: theme.colors.white,
    marginTop: 10,
  },

  challengeSponsorName: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S22,
    color: theme.colors.white,
  },

  challengeSponsorStartDateText: {
    ...fontGroup.nunitoLight,
    fontSize: FontSizes.S10,
    color: theme.colors.white,
  },
  challengeSponsorStartDateTextValue: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S10,
    color: theme.colors.white,
  },
  pointCount: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S24,
    color: theme.colors.white,
    margin: 0,
  },

  pointCountText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S10,
    color: theme.colors.white,
  },

  bottomText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S19,
    textAlign: "center",
    color: "#1158F4",
    marginVertical: 15,
    fontWeight: "700",
  },
  p: {
    ...fontGroup.nunitoRegular,
    color: "#fff",
    fontSize: FontSizes.S14,
  },
  strong: {
    ...fontGroup.nunitoBold,
    color: "#fff",
    fontSize: FontSizes.S18,
  },
  buttonStyle: {
    height: 50,
  },
  buttonContainerStyle: {
    marginTop: 20,
  },
  pointContainer: {
    backgroundColor: "#9003E050",
    width: "100%",
    height: 87,
    marginVertical: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH25,
    ...fontGroup.nunitoBold,
    color: theme.colors.white,
    marginTop: 5,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContent: {
    margin: 20,
    backgroundColor: theme.colors.inputBG,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.colors.inputBG,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: 8,
    marginBottom: 0,
  },
  appButtonStyle: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  appButtonContainerStyle: {padding: 4},
  appButtonLabelStyle: {
    marginLeft: 8,
    color: theme.colors.white,
    fontSize: FontSizes.S16,
  },
  buttonDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.white,
    borderStyle: "solid",
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: theme.colors.inputBG,
    marginBottom: -5,
    marginBottom: 70,
  },
}));

export default useStyles;
