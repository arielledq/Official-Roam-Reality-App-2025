import { Button } from "@rneui/themed"
import React, { FC } from "react"
import { StyleSheet } from "react-native"
import theme from "../../assets/theme"
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils"
import { ButtonProps } from "./type"
import LinearGradient from "react-native-linear-gradient"

const AppButton: FC<ButtonProps> = (props: ButtonProps) => {
  const {
    buttonStyle = {},
    titleStyle = {},
    containerStyle = {},
    customColors,
    ...otherProps
  } = props

  const defaultColors = ["#B816E0", "#1158F4", "#9003E0"];
  const colors = customColors || defaultColors;
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 1 }}
      style={[styles.containerStyle, containerStyle]}
    >
      <Button
        loadingStyle={{ backgroundColor: "transparent" }}
        disabledStyle={{ backgroundColor: "transparent" }}
        buttonStyle={[styles.buttonStyle, buttonStyle]}
        containerStyle={[styles.containerStyle]}
        titleStyle={[styles.titleStyle, titleStyle]}
        {...otherProps}
      />
    </LinearGradient>
  )
}

const BORDER_RADIUS = 8

const styles = StyleSheet.create({
  buttonStyle: {
    borderRadius: BORDER_RADIUS,
    backgroundColor: "transparent"
  },
  titleStyle: {
    fontSize: FontSizes.S18,
    ...fontGroup.sf400,
    lineHeight: FontLineHeights.LH20,
    color: theme.darkColors?.white
  },
  containerStyle: { borderRadius: BORDER_RADIUS }
})

export default AppButton
