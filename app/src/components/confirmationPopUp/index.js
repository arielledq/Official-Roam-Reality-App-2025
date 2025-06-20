import {StyleSheet, TouchableOpacity, View, Modal, TouchableWithoutFeedback} from "react-native";
import React from "react";
import AppText from "../text";
import AppButton from "../button";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";
import theme from "../../assets/theme";
import {screenHorizontalPadding} from "../../util/AppDimensions";

const ConfirmationPopUp = ({
  title,
  description,
  confirmText,
  cancelText,
  confirmHandler = () => {},
  cancelHandler = () => {},
  isVisible,
}) => {
  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={cancelHandler}>
      <TouchableWithoutFeedback onPress={cancelHandler}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.modalContainer}>
                {/* Header */}
                <View style={styles.header}>
                  <AppText style={styles.headerText}>{title}</AppText>
                  <View style={styles.horizontalLine} />
                </View>
                {/* Button Header */}
                <View style={styles.buttonheaderContainer}>
                  <AppText style={styles.logoutText}>{description}</AppText>
                </View>
                <View style={styles.buttonContainer}>
                  {/* Confirm Button */}
                  <AppButton
                    buttonStyle={styles.buttonStyle}
                    containerStyle={styles.buttonContainerStyle}
                    titleStyle={styles.buttonTitle}
                    title={confirmText}
                    onPress={confirmHandler}
                  />
                  {/* Cancel Button */}
                  <TouchableOpacity style={styles.cancelButton} onPress={cancelHandler}>
                    <AppText style={styles.cancelButtonText}>{cancelText}</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ConfirmationPopUp;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: theme.lightColors.inputBG,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "auto",
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH25,
    marginBottom: 8,
    marginTop: 13,
  },
  logoutText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH25,
    textAlign: "center",
  },
  horizontalLine: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: theme.darkColors?.dividerGrey,
    opacity: 0.4,
    marginVertical: 8,
  },
  cancelButton: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  cancelButtonText: {
    ...fontGroup.nunitoBold,
    color: theme.darkColors?.inputBlue,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH20,
  },
  buttonheaderContainer: {
    paddingHorizontal: screenHorizontalPadding + 5,
    alignItems: "center",
    marginBottom: 15,
    marginTop: 7,
  },
  buttonContainer: {
    paddingHorizontal: screenHorizontalPadding - 5,
  },
  buttonStyle: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainerStyle: {
    marginTop: 10,
  },
  buttonTitle: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S16,
  },
});
