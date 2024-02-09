import React,{useState} from 'react'
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

  const getImageSource = () => onboardingScreens[activeIndex - 1] || onboardingScreens[0];
  const { backgroundImage, device, icon } = getImageSource();

  const continueHandler = async() => {
    if(activeIndex === onboardingScreens.length){
      navigation.navigate('SignUp')
    }
    else{
      setActiveIndex((prevIndex) => prevIndex + 1)
    }
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