import React, {useEffect, useRef} from "react";
import {Animated, Easing, View} from "react-native";

const BouncingMarker = ({children}) => {
  // 1. Initialize the animated value (Scale starts at 1)
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // FIX: Force set the value to 1.0 immediately.
    scaleValue.setValue(1.0);

    // 2. Define the animation loop (Pulse/Scale effect)
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        // Step 1: Scale Up
        Animated.timing(scaleValue, {
          toValue: 1.2, // Grow to 120%
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // Step 2: Scale Down
        Animated.timing(scaleValue, {
          toValue: 1.0, // Return to original
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Start the animation
    pulseAnimation.start();

    // Cleanup on unmount
    return () => pulseAnimation.stop();
  }, [scaleValue]);

  // 4. Apply the transform to the view (Scale instead of TranslateY)
  // FIX: Added a wrapper View with padding to prevent the top of the
  // marker from being cut off (clipped) when it scales up.
  return (
    <View style={{padding: 15}}>
      <Animated.View style={{transform: [{scale: scaleValue}]}}>{children}</Animated.View>
    </View>
  );
};

export default BouncingMarker;
