import theme from "assets/theme";
import React from "react";
import { ActivityIndicator, Switch } from "react-native";

const AppSwitch = props => {
  if (props?.loading) {
    return <ActivityIndicator />;
  }
  return (
    <Switch
      trackColor={{ false: theme.lightColors.grey3, true: theme?.lightColors.magenta }}
      thumbColor={theme?.lightColors.purple}
      {...props}
    />
  );
};

export default AppSwitch;
