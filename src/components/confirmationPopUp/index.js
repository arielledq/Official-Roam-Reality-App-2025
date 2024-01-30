import { StyleSheet, TouchableOpacity, View, Modal } from "react-native"
import React, { useState } from "react"
import AppText from "../text"
import AppButton from "../button"
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils"
import theme from "../../assets/theme"
import { screenHorizontalPadding } from "../../util/AppDimensions"

const ConfirmationPopUp = React.forwardRef(
  (
    {
      title,
      description,
      confirmText,
      cancelText,
      confirmHandler = () => {},
      cancelHandler,
      isVisible
    },
    ref
  ) => {
    const [modalVisible, setModalVisible] = useState(isVisible)
    const show = () => setModalVisible(true)
    const hide = () => setModalVisible(false)
    
    React.useImperativeHandle(ref, () => ({
      show,
      hide
    }))
    const closeModal = () => {
      setModalVisible(false)
      cancelHandler && cancelHandler()
    }

    const handleConfirm = () => {
      setModalVisible(false)
      confirmHandler()
    }

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
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
              onPress={handleConfirm}
            />

            {/* Cancel Button */}
            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
              <AppText style={styles.cancelButtonText}>{cancelText}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }
)

export default ConfirmationPopUp

const styles = StyleSheet.create({
  modalContainer: { 
    backgroundColor: theme.lightColors.inputBG, 
    justifyContent: "flex-end",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    // height: "32.7%",
  },
  header: {
    alignItems: "center",
    marginBottom: 12
  },
  headerText: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH25,
    marginBottom: 8,
    marginTop: 13
  },
  logoutText: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH20
  },
  horizontalLine: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: theme.darkColors?.dividerGrey,
    opacity: 0.4,
    marginVertical: 8
  },
  cancelButton: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 50
  },
  cancelButtonText: {
    ...fontGroup.ns800,
    color: theme.darkColors?.inputBlue,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH20
  },
  buttonheaderContainer: {
    paddingHorizontal: screenHorizontalPadding + 5,
    alignItems: "center",
    marginBottom: 15,
    marginTop: 7
  },
  buttonContainer: {
    paddingHorizontal: screenHorizontalPadding - 5
  },
  buttonStyle: {
    height: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonContainerStyle: {
    marginTop: 10
  },
  buttonTitle: {
    ...fontGroup.p600,
    fontSize: FontSizes.S16
  }
})
