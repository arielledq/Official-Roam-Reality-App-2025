import * as React from "react";
import {View, TouchableOpacity, Text, Image} from "react-native";
import theme from "assets/theme";
import Icon from "components/Icon";
import AppButton from "components/button";
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
          backgroundColor: theme.lightColors?.grey4,
          borderRadius: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 12,
          marginBottom: 10,
        }}
      >
        <View style={{width: 50}}>
          <AppButton
            customColors={[
              theme.lightColors?.pink || "",
              theme.lightColors?.purple || "",
              theme.lightColors?.inputBlue || "",
            ]}
            containerStyle={{
              padding: 0,
              margin: 0,
              borderRadius: 4,
              minHeight: 35,
            }}
            innerContainerStyle={{
              paddingHorizontal: 0,
            }}
            iconContainerStyle={{
              padding: 0,
            }}
            titleStyle={{fontSize: 12, color: theme.lightColors?.grey1, fontWeight: "bold"}}
            disabled={true}
            title={
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{color: "white", fontSize: 14, fontWeight: "bold"}}>
                  {points || 0}
                </Text>
                <Text style={{color: "white", fontSize: 10}}>Points</Text>
              </View>
            }
          />
        </View>

        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={{color: "white", fontSize: 12, fontWeight: "bold"}}>{title}</Text>
          <View style={{flexDirection: "row", alignItems: "center", marginTop: 2, gap: 8}}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 2}}>
              <Icon name="pinrosa" family="custom" size={14} />
              <Text style={{color: theme.lightColors?.grey0, fontSize: 10}}>{attemptsDetails}</Text>
            </View>
            <View style={{flexDirection: "row", alignItems: "center", gap: 2}}>
              <Icon name="clock" family="custom" size={14} />
              <Text style={{color: theme.lightColors?.grey0, fontSize: 10}}>
                {coolDownHours || 0} Hrs Cooldown
              </Text>
            </View>
          </View>
        </View>
        <Image source={{uri: sponsorImage}} style={{width: 40, height: 40, borderRadius: 20}} />
      </TouchableOpacity>
    </View>
  );
};

export default ARChallengeItem;
