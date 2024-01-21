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
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Main Navigation container provided to application.
 * ThemeProvider is applied for using theme in application.
 * @returns JSX.Element
 */
const Navigation = () => {
  const token = useSelector(state => state.login?.data?.token)
  const newUser = useSelector(state => state.persist?.newUser)

  const renderAuthStack = () => {
    return (
      <>
        {
          newUser ?
            <>
              <Stack.Screen name="SignUp" component={SignUp} />
              <Stack.Screen name="Login" component={Login} />
            </> :
            <>
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
        <Stack.Screen name="ARChallenge" component={ARChallenge} />
        <Stack.Screen name="ArChallengeDetails" component={ArChallengeDetails} />
        <Stack.Screen name="ArChallengeCapture" component={ArChallengeCapture} />
        <Stack.Screen name="ArChallengeShare" component={ArChallengeShare} />
      </>
    )
  }
  const renderCommonStack = () => {
    return (
      <>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
      </>
    )
  }
  return (
    <NavigationContainer ref={navigationRef}>
      {
        <ThemeProvider theme={theme}>
          <Stack.Navigator
            initialRouteName="ArChallengeShare"
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right"
            }}>
            {token ?
              renderCommonStack() : renderAuthStack()
            }
          </Stack.Navigator>
        </ThemeProvider>
      }
    </NavigationContainer>
  );
};

export default Navigation;
