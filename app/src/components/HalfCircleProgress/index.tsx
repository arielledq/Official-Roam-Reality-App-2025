import React from "react";
import {View, Text, StyleSheet} from "react-native";
import Svg, {Path} from "react-native-svg";
import theme from "assets/theme";

interface HalfCircleProgressProps {
  progress: number; // Progress percentage (0-100)
  radius?: number;
  strokeWidth?: number;
  text: string;
  textStyle?: any;
}

const HalfCircleProgress: React.FC<HalfCircleProgressProps> = ({
  progress,
  radius = 20,
  strokeWidth = 3,
  text,
  textStyle,
}) => {
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * Math.PI; // Half circle circumference
  const progressLength = (progress / 100) * circumference;

  const svgSize = radius * 2;
  const centerX = radius;
  const centerY = radius;

  // Create the half circle path - starting from left (180°) to right (0°)
  const createHalfCirclePath = (r: number) => {
    // Start from left side (180°) and go to right side (0°) - clockwise
    return `M ${centerX - r} ${centerY} A ${r} ${r} 0 0 1 ${centerX + r} ${centerY}`;
  };

  return (
    <View style={[styles.container, {width: svgSize, height: radius + strokeWidth}]}>
      <Svg height={radius + strokeWidth} width={svgSize} style={StyleSheet.absoluteFillObject}>
        {/* Background half circle */}
        <Path
          d={createHalfCirclePath(normalizedRadius)}
          stroke={theme.lightColors?.white || "#c2b2b2ff"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="square"
        />
        {/* Progress half circle - only render if progress > 0 */}
        {progress > 0 && (
          <Path
            d={createHalfCirclePath(normalizedRadius)}
            stroke={"#8000ff"}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="square"
            strokeDasharray={`${progressLength} ${circumference}`}
            strokeDashoffset={0}
          />
        )}
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.text, textStyle]}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    top: "20%",
  },
  text: {
    fontSize: 8,
    color: theme.lightColors?.grey0,
    textAlign: "center",
  },
});

export default HalfCircleProgress;
