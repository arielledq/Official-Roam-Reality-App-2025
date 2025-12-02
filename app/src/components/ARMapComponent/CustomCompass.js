import React from "react";
import {TouchableOpacity, StyleSheet, View} from "react-native";
import Animated, {useAnimatedStyle} from "react-native-reanimated";
import {Icons} from "assets/Icons";
import {widthPercentageToDP} from "react-native-responsive-screen";
import theme from "assets/theme";

const CustomCompass = ({heading, onPress}) => {
  // Rotate the compass needle based on the heading
  const animatedCompassStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `-${heading.value}deg`}],
  }));

  return (
    <TouchableOpacity style={styles.compassButton} activeOpacity={0.7} onPress={onPress}>
      <Animated.View style={[animatedCompassStyle]}>
        <Icons.compass width={widthPercentageToDP(15)} height={widthPercentageToDP(15)} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  compassButton: {
    backgroundColor: theme.lightColors?.white,
    position: "absolute",
    right: 0,
    bottom: 0,

    marginBottom: widthPercentageToDP(50),
    marginRight: widthPercentageToDP(5),
    width: widthPercentageToDP(14.5),
    height: widthPercentageToDP(14.5),
    borderRadius: widthPercentageToDP(100),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CustomCompass;
