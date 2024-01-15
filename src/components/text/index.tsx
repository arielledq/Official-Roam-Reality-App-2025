import { Text } from '@rneui/themed';
import React, { FC } from 'react';
import { TextProps } from './type';
import { StyleSheet } from 'react-native';
import theme from '../../assets/theme';
import fontGroup from '../../assets/fonts'

const AppText: FC<TextProps> = (props) => {
  const { style = {}, ...otherProps } = props;
  return <Text
    suppressHighlighting={true}
    allowFontScaling={false}
    style={[styles.textStyle, style]} {...otherProps} />;
};

const styles = StyleSheet.create({
  textStyle: {
    color: theme?.darkColors?.white,
    ...fontGroup.ns400,
  },
});
export default AppText;
