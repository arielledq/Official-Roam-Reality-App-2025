import { Input } from '@rneui/themed';
import React, { FC, useState } from 'react';
import { StyleSheet } from 'react-native';
import theme from '../../assets/theme';
import { FontFamily, FontLineHeights, FontSizes } from '../../util/FontUtils';
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
    // fontFamily: FontFamily.SFUiDisplay,
    color: theme.darkColors?.white,
    lineHeight: FontLineHeights.LH20,
    fontWeight: '500',
  },
  inputStyle: {
    borderBottomColor: 'transparent'
  },
  leftContainerStyle: {
    marginRight: 5
  }
});

export default AppInput;
