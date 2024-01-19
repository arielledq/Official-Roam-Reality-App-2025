import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import useStyles from './styles';
import AppText from '../text';

const BoxStatContainer = ({
  value,
  property,
  onPressAction
}: {
  value: number | undefined;
  property: string;
  onPressAction?: () => void;
}) => {
  const styles = useStyles();

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPressAction}>
      <View style={styles.cardInner}>
        <AppText style={styles.TextNameTop}>{value}</AppText>
        <View style={styles.cardBottomContent}>
          <AppText style={styles.Text}>{property}</AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BoxStatContainer ;
