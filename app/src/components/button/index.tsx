import {Button} from "@rneui/themed";
import React, {FC} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import theme from "../../assets/theme";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";
import {ButtonProps} from "./type";
import LinearGradient from "react-native-linear-gradient";

const AppButton: FC<ButtonProps> = (props: ButtonProps) => {
  const {
    buttonStyle = {},
    titleStyle = {},
    containerStyle = {},
    customColors,
    radius,
    ...otherProps
  } = props;

  const defaultColors = ["#B816E0", "#1158F4", "#9003E0"];
  const colors = customColors || defaultColors;
  return (
    <TouchableOpacity onPress={otherProps.onPress} style={[styles.containerStyle, containerStyle]}>
      <LinearGradient
        colors={colors}
        start={{x: 0, y: 1}}
        end={{x: 1, y: 1}}
        style={[
          styles.containerStyle,
          containerStyle,
          {
            padding: 0,
            minHeight: 50,
          },
        ]}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 10,
          }}
        >
          <Button
            loadingStyle={{backgroundColor: "transparent"}}
            disabledStyle={{backgroundColor: "transparent"}}
            buttonStyle={[styles.buttonStyle, buttonStyle]}
            containerStyle={[styles.containerStyle, otherProps?.loading && {minWidth: 100}]}
            titleStyle={[styles.titleStyle, titleStyle]}
            {...otherProps}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const BORDER_RADIUS = 8;

const styles = StyleSheet.create({
  buttonStyle: {
    borderRadius: BORDER_RADIUS,
    backgroundColor: "transparent",
  },
  titleStyle: {
    fontSize: FontSizes.S18,
    ...fontGroup.nunitoRegular,
    lineHeight: FontLineHeights.LH20,
    color: theme.darkColors?.white,
  },
  containerStyle: {borderRadius: BORDER_RADIUS},
});

export default AppButton;
