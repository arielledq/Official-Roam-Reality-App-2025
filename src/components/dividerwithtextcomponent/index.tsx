import React, { FC } from 'react';
import { DividerWithTextProps } from './types';
import { View } from 'react-native';
import { Divider } from '@rneui/base';
import AppText from '../text';
import useStyles from './styles';

const DividerWithText: FC<DividerWithTextProps> = (props) => {
  const { containerStyle, label } = props;
  const styles = useStyles();
  return (
    <View style={[styles.container, containerStyle]}>
      <Divider style={styles.divider} />
      <View style={styles.label}><AppText>{label}</AppText></View>     
      <Divider style={styles.divider} />
    </View>
  );
};

export default DividerWithText;
