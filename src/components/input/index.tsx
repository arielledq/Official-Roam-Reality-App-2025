import { Input } from '@rneui/themed';
import React, { FC, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import theme from '../../assets/theme';
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from '../../util/FontUtils';
import { TextInputProps } from './type';

const AppInput: FC<TextInputProps> = (props: TextInputProps) => {
  const {
    containerStyle = {},
    inputStyle = {},
    inputContainerStyle,
    ...otherProps
  } = props;
  const [focus, setFocus] = useState(false);

  return (
    <Input
      errorStyle={otherProps?.errorMessage && {
        marginBottom: 20
      }}
      containerStyle={[styles.container, containerStyle]}
      inputStyle={[styles.text, inputStyle]}
      // style={[focus && styles.style, style]}
      inputContainerStyle={[
        styles.inputStyle, inputContainerStyle
      ]}
      onFocus={(e) => {
        setFocus(true);
        props?.onFocus && props?.onFocus(e);
      }}
      onBlur={(e) => {
        setFocus(false);
        props?.onBlur && props?.onBlur(e);
        // inputRef.current.blur();
      }}
      leftIconContainerStyle={styles.leftContainerStyle}
      {...otherProps}
    />
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 0, paddingVertical: 0 },
  text: {
    fontSize: FontSizes.S14,
    ...fontGroup.sf500,
    color: theme.darkColors?.white,
    lineHeight: FontLineHeights.LH20,
    marginTop: Platform.OS == 'ios' ? -3 : 0
  },
  inputStyle: {
    borderBottomColor: 'transparent',
  },
  leftContainerStyle: {
    marginRight: 5
  }
});

export default AppInput;
