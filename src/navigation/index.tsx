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
import EditProfile from '../screens/editProfile/editProfile';
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Main Navigation container provided to application.
 * ThemeProvider is applied for using theme in application.
 * @returns JSX.Element
 */
const Navigation = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      {
        <ThemeProvider theme={theme}>
          <Stack.Navigator
            initialRouteName="ChangePassword"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="EmailVerification" component={EmailVerification} />
            <Stack.Screen name="VerificationSuccess" component={VerificationSuccess} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="EditProfile" component={EditProfile} />

          </Stack.Navigator>
        </ThemeProvider>
      }
    </NavigationContainer>
  );
};

export default Navigation;
