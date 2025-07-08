import React, {useState, useEffect} from "react";
import {Image, View} from "react-native";

import BackgroundWithImage from "../../components/background";
import {AppButton, AppText} from "../../components";
import Strings from "../../constants/Strings";
import Images from "../../assets/images";
import useStyles from "./styles";
import {useSelector} from "react-redux";

const onboardingScreens = [
  {
    backgroundImage: Images.Onboarding1,
    device: Images.Device1,
  },
];

const Onboarding = ({navigation}) => {
  const styles = useStyles();
  const [activeIndex, setActiveIndex] = useState(1);
  const {newUser} = useSelector(state => state.persist);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (activeIndex === onboardingScreens.length) {
        navigation.reset({
          index: 0,
          routes: [{name: newUser ? "SignUp" : "Login"}],
        });
      } else {
        setActiveIndex(prevIndex => prevIndex + 1);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [activeIndex]);

  const getImageSource = () => onboardingScreens[activeIndex - 1] || onboardingScreens[0];
  const {backgroundImage, device} = getImageSource();

  const continueHandler = () => {
    navigation.reset({
      index: 0,
      routes: [{name: newUser ? "SignUp" : "Login"}],
    });
  };

  return (
    <BackgroundWithImage imageSource={backgroundImage} style={styles.imageBg}>
      <AppText style={styles.headerText}>
        {Strings.Get} <AppText style={styles.boldText}>{Strings.ready} </AppText>
        {Strings.to}
      </AppText>
      <Image source={device} style={styles.image} />
      <AppText style={styles.footerText1}>{Strings.WithTheCarribean}</AppText>
      <AppText style={styles.footerText2}>{Strings.FirstTravelARGame}</AppText>
      <AppButton
        containerStyle={styles.btnContainer}
        title={Strings.LetsBegin}
        onPress={continueHandler}
      />
    </BackgroundWithImage>
  );
};

export default Onboarding;
