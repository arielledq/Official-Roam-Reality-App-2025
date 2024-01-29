import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LinearGradient from "react-native-linear-gradient"

import { Icons } from '../assets/Icons';
import Home from '../screens/home';
import Profile from '../screens/profile/profile';
import Scores from '../screens/scores';
import Rally from '../screens/rally';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBarStyle,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeScreen"
        component={Home}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            focused ? <Icons.SelectedHomeIcon /> : <Icons.UnselectedHomeIcon />
          ),
          tabBarIconStyle: styles.tabBarIconStyle,
          tabBarLabelStyle: styles.tabBarLabelStyle
        }}
      />
      <Tab.Screen
        name="Scores"
        component={Scores}
        options={{
          tabBarLabel: "Scores",
          tabBarIcon: ({ focused }) => (
            focused ? <Icons.SelectedBadgeIcon /> : <Icons.UnselectedBadgeIcon />
          ),
          tabBarIconStyle: styles.tabBarIconStyle,
          tabBarLabelStyle: styles.tabBarLabelStyle
        }}
      />
      <Tab.Screen
        name="Go Navigate"
        component={Home}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            focused ? <Icons.SelectedCamera /> : <Icons.SelectedCamera />
          ),
          tabBarIconStyle: [styles.tabBarIconStyle, styles.cameraTabStyle],
        }}
      />
      <Tab.Screen
        name="Rally"
        component={Rally}
        options={{
          tabBarLabel: "Rally",
          tabBarIcon: ({ focused }) => (
            focused ? <Icons.SelectedFlagIcon /> : <Icons.UnselectedFlagIcon />
          ),
          tabBarIconStyle: styles.tabBarIconStyle,
          tabBarLabelStyle: styles.tabBarLabelStyle,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            focused ? <Icons.SelectedProfile /> : <Icons.UnselectedProfile />
          ),
          tabBarIconStyle: styles.tabBarIconStyle,
          tabBarLabelStyle: styles.tabBarLabelStyle
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 90,
    position: 'absolute',
    backgroundColor: '#090A16',
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    paddingHorizontal: 25
  },
  tabBarIconStyle: {
    // marginBottom: -10
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: -10
  },
  cameraTabStyle: {
    marginTop: 5
  }
})