import React, {FC, useState} from "react";
import {View, TextInput, StyleSheet} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import {FontSizes, fontGroup} from "../../util/FontUtils";
import theme from "../../assets/theme";
import Icon from "../Icon";
import {TransparentSearchBarProps} from "./type";

const TransparentSearchBar: FC<TransparentSearchBarProps> = props => {
  const {
    placeholder = "Search Locations",
    value,
    onChangeText,
    style,
    containerStyle,
    onSubmitEditing,
    ...otherProps
  } = props;

  return (
    <View style={[styles.container, containerStyle]}>
      <Icon
        name="search"
        family="ionicon"
        size={20}
        color={theme.darkColors?.white}
        style={styles.searchIcon}
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, style]}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        {...otherProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#77777750",
    borderColor: "#6B7280",
    borderRadius: 2,
    borderWidth: 1,
    height: hp(5),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    flex: 1,
    marginRight: 10,
  },
  input: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S14,
    color: theme.lightColors?.white,
    flex: 1,
    height: "100%",
    paddingLeft: 5,
  },
  searchIcon: {
    marginRight: 5,
  },
});

export default TransparentSearchBar;
