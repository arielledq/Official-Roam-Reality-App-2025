import React,{useState,useEffect} from 'react'
import {Image} from 'react-native'

import BackgroundWithImage from '../../components/background'
import { AppButton, AppText } from '../../components'
import Strings from '../../constants/Strings'
import { Icons } from '../../assets/Icons'
import Images from '../../assets/images'
import useStyles from './styles'

const onboardingScreens = [
  {
    backgroundImage: Images.Onboarding1, 
    device: Images.Device1, 
    icon: <Icons.NavigationPoint1 />
  },
  {
    backgroundImage: Images.Onboarding2, 
    device: Images.Device2, 
    icon: <Icons.NavigationPoint2 />
  },
  {
    backgroundImage: Images.Onboarding3, 
    device: Images.Device3, 
    icon: <Icons.NavigationPoint3 />
  },
];

const Onboarding = ({navigation}) => {
  const styles = useStyles();
  const [activeIndex, setActiveIndex] = useState(1);

  useEffect(()=>{
    setTimeout(()=>{
      if(activeIndex === onboardingScreens.length){
        navigation.reset({
          index: 0,
          routes: [{ name: 'SignUp' }],
          });
      }
      else{
        setActiveIndex((prevIndex) => prevIndex + 1)
      }
    }, 2000)
  },[activeIndex])

  const getImageSource = () => onboardingScreens[activeIndex - 1] || onboardingScreens[0];
  const { backgroundImage, device, icon } = getImageSource();

  const continueHandler = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignUp' }],
    });
  };

  return (
  <BackgroundWithImage 
    imageSource={backgroundImage} 
    style={styles.imageBg}
  >
    <AppText style={styles.headerText}>
      {Strings.Get} <AppText style={styles.boldText}>{Strings.ready} </AppText>{Strings.to}
    </AppText>
    <Image source={device} style={styles.image}/>
    <AppText style={styles.footerText1}>{Strings.WithTheCarribean}</AppText>
    <AppText style={styles.footerText2}>{Strings.FirstTravelARGame}</AppText>
    <>{icon}</>
    <AppButton
      containerStyle={styles.btnContainer}
      title={Strings.LetsBegin}
      onPress={continueHandler}
    />
  </BackgroundWithImage>
  )
}

export default Onboarding