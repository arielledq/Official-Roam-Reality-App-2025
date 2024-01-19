import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import useStyles from './styles';
import AppText from '../text';
import Images from '../../assets/images';

const StatContainer = ({
  value,
  property,
  onPressAction
}: {
  value: string;
  property: string;
  onPressAction?: () => void;
}) => {
  const styles = useStyles();

  const getIcon = () => {
    switch (property) {
      case 'Global Rank':
        return Images.GlobalIcon;
      case 'Points':
        return Images.PointsIcon;
      case 'TT Rank':
        return Images.RankIcon;
      default:
        break;
    }
  };


  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPressAction}>
      <View style={styles.cardInner}>
      <Image style={styles.iconStyle} source={getIcon()} />
        <View style={styles.cardBottomContent}>
          <AppText style={styles.Text}>{property}</AppText>
          <AppText style={styles.valueStyle}>{value}</AppText>
        </View>        
      </View>
    </TouchableOpacity>
  );
};

export default StatContainer ;
