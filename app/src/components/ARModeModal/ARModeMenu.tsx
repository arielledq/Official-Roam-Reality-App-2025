import React from "react";
import {View} from "react-native";
import {AppButton} from "components";
// @ts-ignore
import {ARModeMenuType} from "constants";
import theme from "assets/theme";

interface ARModeMenuProps {
  options: ARModeMenuType[];
  onPress: (mode: ARModeMenuType) => void;
}

const ARModeMenu = ({options, onPress}: ARModeMenuProps) => {
  return (
    <View style={{width: "100%", gap: 10, flex: 1}}>
      {options?.length > 0 &&
        options.map((option: ARModeMenuType) => (
          <AppButton
            key={option.id}
            buttonStyle={{height: 52, width: "100%"}}
            customColors={[
              theme.lightColors?.pink || "",
              theme.lightColors?.purple || "",
              theme.lightColors?.inputBlue || "",
            ]}
            onPress={() => onPress(option)}
            titleStyle={{width: "100%", fontWeight: "700"}}
            title={option.label}
          />
        ))}
    </View>
  );
};

export default ARModeMenu;
