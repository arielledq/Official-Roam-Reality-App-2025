import { Text } from '@rneui/themed';
import React, { FC } from 'react';
import { TextProps } from './type';
import { StyleSheet } from 'react-native';
import { FontFamily } from '../../util/FontUtils';
import theme from '../../assets/theme';

const AppText: FC<TextProps> = (props) => {
  const { style = {}, ...otherProps } = props;
  return <Text style={[styles.textStyle, style]} {...otherProps} />;
};

const styles = StyleSheet.create({
  textStyle: {
    color: theme?.darkColors?.white,
    fontFamily: FontFamily.NunitoSansRegular,
  },
});
export default AppText;
