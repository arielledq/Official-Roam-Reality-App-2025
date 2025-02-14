import {StyleSheet, TouchableOpacity, View, Modal, ScrollView, useWindowDimensions, Text} from "react-native";
import React, { useState } from "react";
import { FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils";
import theme from "../../assets/theme";
import { screenHorizontalPadding } from "../../util/AppDimensions";
import {useSelector} from "react-redux";
import RenderHTML from "react-native-render-html";
import {AppButton, AppText} from "components";

const ConfirmationPopUp = ({
   confirmHandler = () => {},
   cancelHandler = () => {},
   isVisible = false,
   }) => {
  const settings = useSelector(state => state.ar?.arSettings);
  const htmlContent = settings?.waiver_details?.replace(/#000000/g, "#fff");
  const { width } = useWindowDimensions();
  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={cancelHandler}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <AppText style={styles.headerText}>{"Waiver Details"}</AppText>
          <View style={styles.horizontalLine} />
        </View>

        {/* Button Header */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, width: "100%", padding: 24 }}
        >
          <RenderHTML
            tagsStyles={{
              p: { color: "#9CA3AF", fontSize: FontSizes.S14 },
              ol: { color: "#9CA3AF", fontSize: FontSizes.S14 },
              strong: { color: "#fff", fontSize: FontSizes.S18 },
            }}
            source={{ html: htmlContent }}
            contentWidth={width}
          />
        </ScrollView>
        <View style={{ width: "100%", paddingHorizontal: 24 }}>
          <AppButton
            onPress={confirmHandler}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            // titleStyle={styles.buttonTitle}
            title={"Accept and Continue"}
          />
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={cancelHandler}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationPopUp;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: theme.lightColors.inputBG,
    height: 440,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: "absolute",
    bottom: 0,
    alignItems: "center",
    paddingBottom: 20,
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
    fontSize: FontSizes.S18,
    textAlign: "center",
    color: "#1158F4",
    marginVertical: 15,
    fontWeight: "700",
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
