import React, {FC} from "react";
import {StyleSheet, View, ViewStyle, TextStyle} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import {DropdownProps} from "react-native-element-dropdown/src/components/Dropdown/model.ts";

import LinearGradient from "react-native-linear-gradient";
import theme from "../../assets/theme";
import {FontSizes, fontGroup} from "../../util/FontUtils";

type AppDropdownProps = DropdownProps<any> & {
    containerStyle?: ViewStyle;
    dropdownStyle?: ViewStyle;
    placeholderStyle?: TextStyle;
    customColors?: string[];
};

const AppDropdown: FC<AppDropdownProps> = ({
                                               containerStyle,
                                               dropdownStyle,
                                               placeholderStyle,
                                               selectedTextStyle,
                                               customColors,
                                               ...props
                                           }) => {
    const defaultColors = ["#B816E0", "#1158F4", "#9003E0"];
    const colors = customColors || defaultColors;

    return (
        <LinearGradient
            colors={colors}
    start={{x: 0, y: 1}}
    end={{x: 1, y: 3}}
    style={[styles.gradientContainer, containerStyle]}
>
    <View style={styles.innerContainer}>
    <Dropdown
        style={[styles.dropdown, dropdownStyle]}
    placeholderStyle={[styles.placeholderStyle, placeholderStyle]}
    selectedTextStyle={[styles.selectedTextStyle, selectedTextStyle]}
    itemTextStyle={styles.itemTextStyle}
    iconStyle={styles.iconStyle}
    containerStyle={[styles.dropdownContainer, containerStyle]}
    {...props}
    />
    </View>
    </LinearGradient>
);
};

const BORDER_RADIUS = 8;

const styles = StyleSheet.create({
    gradientContainer: {
        borderRadius: BORDER_RADIUS,
        padding: 1,
    },
    innerContainer: {
        backgroundColor: "transparent",
        borderRadius: BORDER_RADIUS,
    },
    dropdown: {
        height: 50,
        borderRadius: BORDER_RADIUS,
        paddingHorizontal: 12,
        backgroundColor: "transparent",
    },
    placeholderStyle: {
        fontSize: FontSizes.S14,
        color: theme.darkColors?.white,
        ...fontGroup.nunitoRegular,
    },
    selectedTextStyle: {
        fontSize: FontSizes.S26,
        color: theme.darkColors?.white,
        ...fontGroup.nunitoRegular,
    },
    itemTextStyle: {
        color: theme.darkColors?.white,
    },
    iconStyle: {
        tintColor: theme.darkColors?.white,
    },
    focusedInput: {
        borderWidth: 1,
        borderColor: theme.lightColors?.purple,
        backgroundColor: theme.lightColors?.inputBG, // oscuro o contrastante
    },
    dropdownContainer: {
        marginTop:-20,
        borderWidth: 0,
        borderRadius: BORDER_RADIUS,
        backgroundColor: theme.lightColors?.inputBG || "#222",
    },
});

export default AppDropdown;
