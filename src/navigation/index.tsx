import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from '@rneui/themed';
import React from 'react';
import { navigationRef } from '../services/navigationService';
import { RootStackParamList } from './types';
import theme from '../assets/theme';
import Login from '../screens/login/login';
import ChangePassword from '../screens/changepassword/changepassword';
import ForgotPassword from '../screens/forgotpassword/forgotpassword';
import SignUp from '../screens/signup/signup';
import EmailVerification from '../screens/emailVerification/emailVerification';
import VerificationSuccess from '../screens/verificationSuccess/verificationSuccess';
import Profile from '../screens/profile/profile';
import { useSelector } from 'react-redux';
import EditProfile from '../screens/editProfile/editProfile';
import Home from '../screens/home';
import TermsAndConditions from '../screens/termsAndConditions';
import PrivacyPolicy from '../screens/PrivacyPolicy';
import FPChangePassword from '../screens/fpchangepassword/fpchangepassword';
import ArChallengeDetails from '../screens/archallenge/challengedetails';
import ArChallengeCapture from '../screens/archallenge/challengecapture';
import ARChallenge from '../screens/archallenge';
import ArChallengeShare from '../screens/archallenge/challengeshare';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerContent from '../screens/drawerContent/DrawerContent';
import Onboarding from '../screens/onboarding/onboarding';
import DrawerNavigator from './DrawerNavigator'
import BottomTabNavigator from './BottomTabNavigator';
import Settings from '../screens/settings';
import Privacy from '../screens/privacy';
import AnimatedSplash from '../screens/animatedSplash';
import ContactUs from '../screens/ContactUs/ContactUs'
import FAQ from '../screens/FAQ/FAQ';
import GeoArChallenge from '../screens/geoarchallenge';
import GeoArChallengeDetails from '../screens/geoarchallenge/destinationdetails';
import GeoArSiteDetails from '../screens/geoarchallenge/sitedetails';
import GeoArSiteRoutes from '../screens/geoarchallenge/siteroutes';
import GeoArSiteNavigation from '../screens/geoarchallenge/navigationsite';
import GeoArOutdoor from '../screens/geoarchallenge/outdoorgeoar';
import ARFilter from '../screens/archallenge/FilterView';
import Feedback from '../../screens/support-send-feedback/Feedback';
import InviteFriends from '../screens/inviteFriends/InviteFriends';
import GeoArSiteArrived from '../screens/geoarchallenge/arrivedsite';
import ChallengeSelection from '../screens/geoarchallenge/challengeselection';
import UniqueArChallenge from '../screens/geoarchallenge/uniquechallenge';
import PinChallenge from '../screens/geoarchallenge/pinchallenge';
import StarChallenge from '../screens/geoarchallenge/starchallenge';
import ArPinChallengeShare from '../screens/geoarchallenge/locationpinshare';
import GeoUniqueArChallengeDetails from '../screens/geoarchallenge/geouniquechallengedetails';
import UniqueArChallengeCapture from '../screens/geoarchallenge/uniquechallengecapture';
import UniqueArChallengeShare from '../screens/geoarchallenge/uniquechallengeshare';


const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

/**
 * Main Navigation container provided to application.
 * ThemeProvider is applied for using theme in application.
 * @returns JSX.Element
 */
const Navigation = () => {
  const splashShown = useSelector(state => state.splash?.splashShown)
  const token = useSelector(state => state.login?.data?.token)
  const { newUser } = useSelector(state => state.persist)

  console.log({ token })
  console.log('newUser', newUser)

  const renderAuthStack = () => {
    return (
      <>
        {
          newUser ?
            <>
              <Stack.Screen name="Onboarding" component={Onboarding} />
              <Stack.Screen name="SignUp" component={SignUp} />
              <Stack.Screen name="Login" component={Login} />
            </> :
            <>
              <Stack.Screen name="Onboarding" component={Onboarding} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="SignUp" component={SignUp} />
            </>
        }
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="EmailVerification" component={EmailVerification} />
        <Stack.Screen name="VerificationSuccess" component={VerificationSuccess} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
        <Stack.Screen name="FPChangePassword" component={FPChangePassword} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />

      </>
    )
  }
  const renderCommonStack = () => {
    return (
      <>
        <Stack.Screen name="Home" component={DrawerNav} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="SendFeedback" component={Feedback} />
        <Stack.Screen name="InviteFriends" component={InviteFriends} />
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
        <Stack.Screen name="ARChallenge" component={ARChallenge} />
        <Stack.Screen name="ArChallengeDetails" component={ArChallengeDetails} />
        <Stack.Screen name="ArChallengeCapture" component={ArChallengeCapture} />
        <Stack.Screen name="ArChallengeShare" component={ArChallengeShare} />
        <Stack.Screen name="GeoArOutdoor" component={GeoArOutdoor} />
        <Stack.Screen name="ARFilter" component={ARFilter} />
        <Stack.Screen name="GeoArChallenge" component={GeoArChallenge} />
        <Stack.Screen name="GeoArChallengeDetails" component={GeoArChallengeDetails} />
        <Stack.Screen name="GeoArSiteDetails" component={GeoArSiteDetails} />
        <Stack.Screen name="GeoArSiteRoutes" component={GeoArSiteRoutes} />
        <Stack.Screen name="GeoArSiteNavigation" component={GeoArSiteNavigation} />
        <Stack.Screen name="GeoArSiteArrived" component={GeoArSiteArrived} />
        <Stack.Screen name="ChallengeSelection" component={ChallengeSelection} />
        <Stack.Screen name="UniqueArChallenge" component={UniqueArChallenge} />
        <Stack.Screen name="PinChallenge" component={PinChallenge} />
        <Stack.Screen name="StarChallenge" component={StarChallenge} />
        <Stack.Screen name="ArPinChallengeShare" component={ArPinChallengeShare} />
        <Stack.Screen name="GeoUniqueArChallengeDetails" component={GeoUniqueArChallengeDetails} />
        <Stack.Screen name="UniqueArChallengeCapture" component={UniqueArChallengeCapture} />
        <Stack.Screen name="UniqueArChallengeShare" component={UniqueArChallengeShare} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Privacy" component={Privacy} />
        <Stack.Screen name="EmailVerificationC" component={EmailVerification} />
        <Stack.Screen name="VerificationSuccessC" component={VerificationSuccess} />
        <Stack.Screen name="ContactUs" component={ContactUs} />
        <Stack.Screen name="FAQ" component={FAQ} />
      </>
    )
  }

  const DrawerNav = () => {
    return (
      <Drawer.Navigator
        drawerContent={props => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: "slide"
        }}>
        <Drawer.Screen name="Tab" component={BottomTabNavigator} />
      </Drawer.Navigator>
    )
  }

  const StackNav = () => {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}>
        {splashShown ?
          token ? renderCommonStack() : renderAuthStack() :
          <Stack.Screen name="AnimatedSplash" component={AnimatedSplash} />
        }
      </Stack.Navigator>
    )
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <ThemeProvider theme={theme}>
        <StackNav />
      </ThemeProvider>
    </NavigationContainer>
  );
};

export default Navigation;
