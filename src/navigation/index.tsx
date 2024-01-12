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
import { UserProfile } from '../../modules/user-profile';
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
            initialRouteName="SignUp"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="EmailVerification" component={EmailVerification} />
            <Stack.Screen name="VerificationSuccess" component={VerificationSuccess} />
            <Stack.Screen name="UserProfile" component={UserProfile} />

          </Stack.Navigator>
        </ThemeProvider>
      }
    </NavigationContainer>
  );
};

export default Navigation;
