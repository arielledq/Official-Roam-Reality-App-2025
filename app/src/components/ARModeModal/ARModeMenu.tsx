import React from "react";
import {View} from "react-native";
import {AppButton} from "components";

interface Option {
  id: string;
  name: string;
}

interface ARModeMenuProps {
  options: Option[];
  onPress: (mode: Option) => void;
}

const ARModeMenu = ({options, onPress}: ARModeMenuProps) => {
  return (
    <View style={{width: "100%", gap: 10, flex: 1}}>
      {options?.length > 0 &&
        options.map((option: Option) => (
          <AppButton
            key={option.id}
            buttonStyle={{height: 52, width: "100%"}}
            customColors={["#B816E0", "#8516e0", "#1158F4"]}
            onPress={() => onPress(option)}
            titleStyle={{width: "100%", fontWeight: "700"}}
            title={option.name}
          />
        ))}
    </View>
  );
};

export default ARModeMenu;
