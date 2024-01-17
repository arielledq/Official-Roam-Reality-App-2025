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
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Main Navigation container provided to application.
 * ThemeProvider is applied for using theme in application.
 * @returns JSX.Element
 */
const Navigation = () => {
  const token = useSelector(state => state.login?.data?.token)

  const renderAuthStack = () => {
    return (
      <>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="EmailVerification" component={EmailVerification} />
        <Stack.Screen name="VerificationSuccess" component={VerificationSuccess} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      </>
    )
  }
  const renderCommonStack = () => {
    return (
      <>
        <Stack.Screen name="Home" component={Home} />
      </>
    )
  }
  return (
    <NavigationContainer ref={navigationRef}>
      {
        <ThemeProvider theme={theme}>
          <Stack.Navigator
            initialRouteName="Login"
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
