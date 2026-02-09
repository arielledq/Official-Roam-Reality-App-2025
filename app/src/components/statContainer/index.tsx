import React from "react";
import {Image, ImageBackground, TouchableOpacity, View} from "react-native";
import useStyles from "./styles";
import AppText from "../text";
import Images from "../../assets/images";
import AppButton from "components/button";

const StatContainer = ({
  value,
  property,
  onPressAction,
}: {
  value: string;
  property: string;
  onPressAction?: () => void;
}) => {
  const styles = useStyles();

  // const getIcon = () => {
  //   switch (property) {
  //     case "Global Rank":
  //       return Images.GlobalIcon;
  //     case "Points":
  //       return Images.PointsIcon;
  //     case "TT Rank":
  //       return Images.RankIcon;
  //     default:
  //       break;
  //   }
  // };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPressAction}>
      <AppButton containerStyle={styles.iconStyle} showButton={false}>
        <AppText style={styles.valueStyle}>{value}</AppText>
      </AppButton>

      <AppText style={styles.Text}>{property}</AppText>
    </TouchableOpacity>
  );
};

export default StatContainer;
