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
    <View style={{marginTop: 10}}>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() => onPress()}
        style={{
          opacity: disabled ? 0.5 : 1,
          backgroundColor: theme.lightColors?.grey4,
          borderRadius: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 12,
          marginBottom: 10,
        }}
      >
        {/* <View style={{width: 50}}>
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
        </View> */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            width: widthPercentageToDP("45%"),
          }}
        >
          <Image
            source={{uri: sponsorImage}}
            style={{
              width: widthPercentageToDP("14%"),
              height: widthPercentageToDP("14%"),
              borderRadius: 10,
            }}
          />
          <Text
            style={{
              color: "white",
              fontSize: FontSizes.S12,
              fontWeight: "bold",
              width: widthPercentageToDP("30%"),
            }}
            numberOfLines={1}
          >
            {CapitalFirstLetter(title)}
          </Text>
        </View>

        <View
          style={{
            alignItems: "center",
            flex: 1,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <View style={styles.contBox}>
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

            <Text style={styles.attemptsText}>Points</Text>
          </View>
          <View style={styles.contBox}>
            <HalfCircleProgress
              progress={calculateProgress()}
              radius={18}
              strokeWidth={6}
              text={attemptsDetails}
              textStyle={{color: theme.lightColors?.grey0, fontSize: 6, fontWeight: "bold"}}
            />
            <Text style={styles.attemptsText}>Attempts</Text>
          </View>
          <View style={styles.contBox}>
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

            <Text style={styles.attemptsText}>Cooldown</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ARChallengeItem;

const styles = StyleSheet.create({
  contBox: {
    width: heightPercentageToDP("5%"),
    height: heightPercentageToDP("5%"),
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000c0",
  },
  attemptsText: {
    color: theme.lightColors?.white,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },
});
