import * as React from "react";
import {View, TouchableOpacity, Text, Image, StyleSheet} from "react-native";
import theme from "assets/theme";
import Icon from "components/Icon";
import AppButton from "components/button";
import HalfCircleProgress from "components/HalfCircleProgress";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import {FontSizes} from "util/FontUtils";
interface ARChallengeItemProps {
  onPress: () => void;
  points: number;
  title: string;
  attemptsDetails: string;
  totalAttempts?: number; // Total attempts allowed
  currentAttempts?: number; // Current attempts used
  coolDownHours: number;
  sponsorImage: string;
  disabled: any;
}

const ARChallengeItem = ({
  onPress,
  points,
  title,
  attemptsDetails,
  totalAttempts = 100,
  currentAttempts = 30,
  coolDownHours,
  sponsorImage,
  disabled,
}: ARChallengeItemProps) => {
  const CapitalFirstLetter = (str: string) => {
    /// capitalize first letter and letter after spaces
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  const calculateProgress = () => {
    if (totalAttempts == 0) return 0;
    if (currentAttempts == 0) return 0;
    return Math.min((currentAttempts / totalAttempts) * 100, 100);
  };
  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() => onPress()}
        style={{
          opacity: disabled ? 0.5 : 1,
          backgroundColor: "#0f101e",
          borderRadius: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 15,
          marginBottom: 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            width: widthPercentageToDP("45%"),
            flex: 1,
          }}
        >
          <View style={styles.contBox}>
            <Text style={styles.attemptsText}>Points</Text>
            <Text
              style={{
                color: theme.lightColors?.white,
                fontSize: FontSizes.S18,
                fontWeight: "bold",

                marginBottom: 2,
              }}
            >
              {points || 0}
            </Text>
          </View>
          <Image
            source={{uri: sponsorImage}}
            style={{
              width: widthPercentageToDP("10%"),
              height: widthPercentageToDP("10%"),
              borderRadius: 6,
              marginLeft: widthPercentageToDP("2%"),
            }}
          />
          <Text
            style={{
              color: "white",
              fontSize: FontSizes.S13,
              fontWeight: "bold",
              width: widthPercentageToDP("25%"),
            }}
            numberOfLines={2}
          >
            {CapitalFirstLetter(title)}
          </Text>
        </View>

        <View
          style={{
            alignItems: "center",

            flexDirection: "row",
            gap: 10,
          }}
        >
          <View style={styles.contBox}>
            <Text style={styles.attemptsText}>Attempts</Text>
            <HalfCircleProgress
              progress={calculateProgress()}
              radius={18}
              strokeWidth={6}
              text={attemptsDetails}
              textStyle={{color: theme.lightColors?.grey0, fontSize: 6, fontWeight: "bold"}}
            />
          </View>
          <View style={styles.contBox}>
            <Text style={styles.attemptsText}>Cooldown</Text>
            <Text
              style={{
                color: theme.lightColors?.white,
                fontSize: FontSizes.S18,
                fontWeight: "bold",

                marginBottom: 2,
              }}
            >
              {coolDownHours || 0}H
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ARChallengeItem;

const styles = StyleSheet.create({
  contBox: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",

    gap: 4,
  },
  attemptsText: {
    color: theme.lightColors?.white,
    fontSize: 8,
    fontWeight: "regular",
    textAlign: "center",
  },
});
