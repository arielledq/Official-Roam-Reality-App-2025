import * as React from "react";
import { View } from "react-native";
import AppButton from "./button";
import { FontSizes } from "util/FontUtils";

const ViewInfoButton = ({ showOnHeader = false, onPress = () => {} }) => {
  return (
    <View
      style={{
        marginVertical: showOnHeader ? 0 : 16,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AppButton
        onPress={onPress}
        buttonStyle={{ height: 40, width: 90 }}
        title={"VIEW INFO"}
        titleStyle={{ fontSize: FontSizes.S12, fontWeight: "700" }}
      />
    </View>
  );
};

export default ViewInfoButton;
