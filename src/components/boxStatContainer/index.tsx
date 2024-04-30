import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import useStyles from './styles';
import AppText from '../text';

const BoxStatContainer = ({
  boxId,
  value,
  property,
  onPressAction
}: {
  boxId: number | undefined;
  value: number | undefined;
  property: string;
  onPressAction?: () => void;
}) => {
  const styles = useStyles();
  const cardStyles = boxId === 1 || boxId === 4 || boxId === 7 ?
  styles.cardMarginLeft : styles.cardContainer
  return (
    <TouchableOpacity style={cardStyles} onPress={onPressAction}>
      <View style={styles.cardInner}>
        <AppText style={styles.TextNameTop}>{value}</AppText>
        <AppText style={styles.Text}>{property}</AppText>
      </View>
    </TouchableOpacity>
  );
};

export default BoxStatContainer ;
