import * as React from "react";
import {View, TouchableOpacity, Text, Image} from "react-native";

interface ARChallengeItemProps {
  onPress: () => void;
  points: number;
  title: string;
  attemptsDetails: string;
  coolDownHours: number;
  sponsorImage: string;
}

const ARChallengeItem = ({
  onPress,
  points,
  title,
  attemptsDetails,
  coolDownHours,
  sponsorImage,
}: ARChallengeItemProps) => {
  return (
    <View style={{marginTop: 10, marginLeft: 10}}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress()}
        style={{
          backgroundColor: "#27273F",
          borderRadius: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 12,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            backgroundColor: "#7A32F4",
            borderRadius: 4,
            padding: 6,
            alignItems: "center",
            justifyContent: "center",
            width: 50,
          }}
        >
          <Text style={{color: "white", fontSize: 14, fontWeight: "bold"}}>{points || 0}</Text>
          <Text style={{color: "white", fontSize: 10}}>Points</Text>
        </View>
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={{color: "white", fontSize: 12, fontWeight: "bold"}}>{title}</Text>
          <View style={{flexDirection: "row", alignItems: "center", marginTop: 2}}>
            <Text style={{color: "#C881F0", fontSize: 10}}>{attemptsDetails}</Text>
            <Text style={{color: "#C881F0", fontSize: 10, marginLeft: 10}}>
              ⏱ {coolDownHours || 0} Hrs Cooldown
            </Text>
          </View>
        </View>
        <Image source={{uri: sponsorImage}} style={{width: 40, height: 40, borderRadius: 20}} />
      </TouchableOpacity>
    </View>
  );
};

export default ARChallengeItem;
