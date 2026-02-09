import {Button} from "@rneui/themed";
import React, {FC} from "react";
import {StyleSheet, TouchableOpacity, View, StyleProp, ViewStyle} from "react-native";
import theme from "../../assets/theme";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";
import {ButtonProps as ButtonPropsRN} from "./type";
import LinearGradient from "react-native-linear-gradient";

interface AppButtonProps extends ButtonPropsRN {
  innerContainerStyle?: StyleProp<ViewStyle>;
  showButton?: boolean;
}

const AppButton: FC<AppButtonProps> = (props: AppButtonProps) => {
  const {
    buttonStyle = {},
    titleStyle = {},
    containerStyle = {},
    innerContainerStyle,
    customColors,
    radius,
    showButton = true,
    ...otherProps
  } = props;

  // const defaultColors = ["#B816E0", "#1158F4", "#9003E0"];
  const defaultColors = ["#7a00cf", "#5532ff"];
  const colors = customColors || defaultColors;
  return (
    <TouchableOpacity
      onPress={otherProps.onPress}
      style={[styles.containerStyle, containerStyle]}
      disabled={otherProps?.disabled}
    >
      <LinearGradient
        colors={colors}
        start={{x: 0, y: 1}}
        end={{x: 1, y: 1}}
        style={[
          styles.containerStyle,
          {
            padding: 0,
            minHeight: 50,
          },
          containerStyle,
        ]}
      >
        {showButton ? (
          <View
            style={[
              {
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 10,
              },
              innerContainerStyle,
            ]}
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
        ) : (
          props.children
        )}
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
