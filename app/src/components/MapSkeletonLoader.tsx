// MapIconSkeletonLoader.js (Corrected Icon Visibility & Shimmer Color)
import React, {useRef, useEffect} from "react";
import {View, StyleSheet, Animated, Easing} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "./Icon";

const MapIconSkeletonLoader = ({shimmerBaseColor}) => {
  const translateXAnim = useRef(new Animated.Value(-1)).current;
  const baseColor = "#E0E0E0"; // Default base icon color

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateXAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [translateXAnim]);

  const shimmerTranslateX = translateXAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-150, 150],
  });

  return (
    <View style={styles.container}>
      <Icon name="find" size={50} color={baseColor} style={styles.icon} />
      <View style={styles.shimmerContainer}>
        <Animated.View
          style={[styles.shimmerElement, {transform: [{translateX: shimmerTranslateX}]}]}
        >
          <LinearGradient
            colors={["transparent", shimmerBaseColor, "transparent"]}
            style={StyleSheet.absoluteFill}
            start={{x: 0, y: 0.5}}
            end={{x: 1, y: 0.5}}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  icon: {
    // No specific icon styles needed here, color is set via prop
  },
  shimmerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  shimmerElement: {
    width: "150%",
    height: "100%",
    backgroundColor: "transparent", // Shimmer element itself is transparent
    transform: [{skewX: "0deg"}],
    position: "absolute",
    top: 0,
    left: "-150%",
  },
});

export default MapIconSkeletonLoader;
