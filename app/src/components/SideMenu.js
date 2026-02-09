import {fonts} from "assets/fonts";
import theme from "assets/theme";
import React, {useEffect} from "react";
import {View, Text, TouchableOpacity, StyleSheet, Dimensions} from "react-native";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/Ionicons";
import {FontFamily, FontSizes} from "util/FontUtils";
import HalfCircleProgress from "./HalfCircleProgress";
import {AR_MODES} from "constants";

const {height: screenHeight} = Dimensions.get("window");

const SideMenu = ({
  isVisible = false,
  onToggle,
  points = 3,
  completed = 2,
  total = 3,
  attemptsDetails,
  totalAttempts = 100,
  currentAttempts = 30,
  selectedSite,
  onPressInfo,
}) => {
  const [challengeDetials, setChallengeDetails] = React.useState(null);

  function formatCooldownTime(cooldown) {
    if (!cooldown) return 0;

    const [hourStr] = cooldown.split(":");
    const hours = parseInt(hourStr, 10);

    return isNaN(hours) ? 0 : hours;
  }
  useEffect(() => {
    if (selectedSite?.id) {
      let attemptsDetails = "";
      let sponsorImage = "";
      let points = selectedSite?.point ?? 0;
      let coolDownHours = 0;
      let totalAttempts = 0;
      let currentAttempts = 0;

      switch (selectedSite?.selectedMode?.mode) {
        case AR_MODES.GEO_TAG_MODE:
          attemptsDetails = `${site?.user_attempts || 0}/${site?.challenge_attempt || 0}`;

          totalAttempts = site?.challenge_attempt || 0;
          currentAttempts = site?.user_attempts || 0;
          coolDownHours = formatCooldownTime(site?.checkin_cooldown) || 0;

          break;
        case AR_MODES.SCAN_MODE:
          const item = selectedSite?.scanChallenge;
          points = item?.points || 0;
          attemptsDetails = `${item?.user_attempts || 0}/${item?.attempts || 0}`;
          totalAttempts = item?.attempts || 0;
          currentAttempts = item?.user_attempts || 0;
          coolDownHours = formatCooldownTime(item.cooldown) || 0;

          break;
        case AR_MODES.HUNT_MODE:
          const site = selectedSite;
          attemptsDetails = `${site?.userAttempt ?? site?.ar_star?.user_attempts ?? 0}/${
            site?.ar_star?.attempts || 0
          }`;
          totalAttempts = site?.ar_star?.attempts || 0;
          currentAttempts = site?.userAttempt ?? site?.ar_star?.user_attempts ?? 0;
          coolDownHours = formatCooldownTime(site?.hunt_cooldownn) || 0;
          break;
        default:
          break;
      }

      setChallengeDetails({
        attemptsDetails,
        totalAttempts,
        currentAttempts,
        points,
        coolDownHours,
      });
    }
  }, [selectedSite]);
  const calculateProgress = () => {
    if (challengeDetials?.totalAttempts == 0) return 0;
    if (challengeDetials?.currentAttempts == 0) return 0;
    return Math.min(
      (challengeDetials?.currentAttempts / challengeDetials?.totalAttempts) * 100,
      100
    );
  };
  return (
    <View style={styles.mainToggle}>
      {/* Toggle Button */}
      <TouchableOpacity style={styles.toggleButton} onPress={onToggle}>
        <Icon name={isVisible ? "chevron-forward" : "chevron-back"} size={30} color="#ffffff" />
      </TouchableOpacity>

      {/* Side Menu */}
      {isVisible && (
        <View style={styles.menuContainer}>
          {/* Points Section */}
          <View style={styles.menuSection}>
            <View style={styles.pointsBox}>
              <Text style={styles.pointsLabel}>Points</Text>
              <Text style={styles.pointsNumber}>{challengeDetials?.points || 0}</Text>
            </View>
          </View>

          <View style={styles.menuSection}>
            <View style={styles.pointsBox}>
              <Text style={styles.pointsLabel}>Cooldown</Text>
              <Text style={styles.pointsNumber}>{challengeDetials?.coolDownHours || 0}H</Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.menuSection}>
            <View style={styles.progressBox}>
              <Text style={styles.attemptsText}>Attempts</Text>
              <HalfCircleProgress
                progress={calculateProgress()}
                radius={18}
                strokeWidth={6}
                text={challengeDetials?.attemptsDetails || ""}
                textStyle={{color: theme.lightColors?.grey0, fontSize: 6, fontWeight: "bold"}}
              />
            </View>
          </View>

          {/* Info Section */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainToggle: {
    position: "absolute",
    right: 0,
    top: screenHeight / 2 - heightPercentageToDP("20%"), // Adjust based on your layout
  },
  toggleButton: {
    width: widthPercentageToDP("10%"),
    height: widthPercentageToDP("12%"),
    alignSelf: "flex-end",
    backgroundColor: "#000000",

    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
  },
  menuContainer: {
    width: widthPercentageToDP("18%"),
    backgroundColor: "rgba(1, 0, 0, 0.9)",
    marginTop: heightPercentageToDP("2%"),
    // borderRadius: 12,
    paddingVertical: heightPercentageToDP("2%"),

    zIndex: 1000, // Lower z-index so toggle button appears on top
    borderRadius: 8,
  },
  menuSection: {
    alignItems: "center",
  },
  pointsBox: {
    width: widthPercentageToDP("12%"),
    height: widthPercentageToDP("12%"),

    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  pointsNumber: {
    color: "#ffffff",
    fontSize: FontSizes.S18,
    fontFamily: fonts.nunitoBold,
  },
  pointsLabel: {
    color: "#ffffff",
    fontSize: FontSizes.S8,
    fontWeight: "600",
  },
  progressBox: {
    alignItems: "center",
    width: widthPercentageToDP("12%"),
    height: widthPercentageToDP("12%"),
    gap: 6,

    justifyContent: "center",
  },
  progressCircle: {
    width: widthPercentageToDP("12%"),
    height: widthPercentageToDP("12%"),
    borderRadius: widthPercentageToDP("6%"),
    backgroundColor: "#5532ff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  progressText: {
    color: "#ffffff",
    fontSize: FontSizes.S14,
    fontWeight: "600",
  },
  progressLabel: {
    color: "#ffffff",
    fontSize: FontSizes.S12,
    fontWeight: "600",
    marginTop: 4,
  },
  infoBox: {
    width: widthPercentageToDP("15%"),
    height: widthPercentageToDP("15%"),

    justifyContent: "center",
    alignItems: "center",
  },
  attemptsText: {
    color: theme.lightColors?.white,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default SideMenu;
