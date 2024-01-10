import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from '@rneui/themed';
import React from 'react';
import { navigationRef } from '../services/navigationService';
import { RootStackParamList } from './types';
import theme from '../assets/theme';
import Login from '../screens/login/login';
import ChangePassword from '../screens/changepassword/changepassword';
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
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />


          </Stack.Navigator>
        </ThemeProvider>
      }
    </NavigationContainer>
  );
};

export default Navigation;
