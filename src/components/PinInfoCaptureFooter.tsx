import * as React from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import Sound from "react-native-sound";

import fontGroup from "assets/fonts";
import { FontSizes } from "util/FontUtils";
import theme from "assets/theme";

// @ts-ignore
import RadarBlipIcon from "../assets/geoar/radar_blip.svg";
// @ts-ignore
import MenIcon from "../assets/geoar/men_icon.svg";
// @ts-ignore
import SpeakerIcon from "../assets/geoar/speaker_icon.svg";
// @ts-ignore
import InfoIcon from "../assets/geoar/Info.svg";

interface PinInfoCaptureFooterProps {
  pinFound?: boolean;
  distance?: number;
}

const PinInfoCaptureFooter = ({ pinFound, distance = 0 }: PinInfoCaptureFooterProps) => {
  const [blinkTimer, setBlinkTimer] = React.useState(0);
  const [muteSound, setMuteSound] = React.useState(false);

  const Blink = ({ duration = 0, style = {}, children = <></> }) => {
    if (duration === 0) {
      return <View style={{ ...style }}>{children}</View>;
    }

    const fadeAnimation = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnimation, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [duration]);

    return (
      <View style={{ ...style }}>
        <Animated.View style={{ opacity: fadeAnimation }}>{children}</Animated.View>
      </View>
    );
  };

  const playProximitySound = () => {
    Sound.setCategory("Playback");
    let proximitySound = new Sound("record.mp3", Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.error("failed to load the sound", error);
      } else {
        proximitySound.play();
      }
    });
  };

  React.useEffect(() => {
    const setInterValSoundBlink = setInterval(() => {
      if (!muteSound) {
        playProximitySound();
      }
    }, blinkTimer);

    if (blinkTimer > 0) {
    } else {
      clearInterval(setInterValSoundBlink);
    }

    return () => {
      clearInterval(setInterValSoundBlink);
    };
  }, [blinkTimer, muteSound]);

  React.useEffect(() => {
    if (distance <= 200 && distance > 100) {
      setBlinkTimer(3000);
    } else if (distance <= 100 && distance >= 50) {
      setBlinkTimer(2000);
    } else if (distance < 50 && distance >= 25) {
      setBlinkTimer(1000);
    } else if (distance < 10) {
      setBlinkTimer(500);
    } else {
      setBlinkTimer(0);
    }
  }, [distance]);

  return (
    <View
      style={{
        backgroundColor: "#131422",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 32,
        marginVertical: 8,
        alignItems: "center",
        gap: 12,
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <MenIcon style={{ width: 30, height: 30 }} />
          <View>
            <Text
              // @ts-ignore
              style={{
                ...fontGroup.ns400,
                fontSize: FontSizes.S12,
                color: theme.lightColors?.white,
              }}
            >
              Pin
            </Text>
            <Text
              // @ts-ignore
              style={{
                ...fontGroup.ns600,
                fontSize: FontSizes.S14,
                color: "#C881F0",
              }}
            >
              {pinFound ? "Pin Found" : `${distance} feet away`}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Blink duration={blinkTimer} style={{ marginEnd: 10 }}>
            <RadarBlipIcon style={{ width: 10, height: 10, marginEnd: 25 }} />
          </Blink>
          <TouchableOpacity onPress={() => setMuteSound(!muteSound)}>
            <SpeakerIcon style={{ width: 30, height: 30, color: !muteSound ? "#fff" : "#000" }} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <InfoIcon style={{ width: 20, height: 20 }} />
        <Text
          // @ts-ignore
          style={{
            ...fontGroup.ns400,
            fontSize: FontSizes.S10,
            color: theme.lightColors?.white,
            lineHeight: 13.64,
          }}
        >
          The closer you get to the Pin faster the chime beeps and quicker the dot pulsates. You can
          switch off the Sound by clicking on the speaker.
        </Text>
      </View>
    </View>
  );
};

export default PinInfoCaptureFooter;
