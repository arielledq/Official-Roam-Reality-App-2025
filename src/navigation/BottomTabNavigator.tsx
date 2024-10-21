import { StyleSheet, Text, View, Image } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { useTheme } from 'react-native-paper'

import Home from '../screens/home';
import Profile from '../screens/profile/profile';
import Scores from '../screens/scores';
import Rally from '../screens/rally';
import Icon from "../components/Icon"
import { Icons } from '../assets/Icons';
import GeoArChallenge from '../screens/geoarchallenge';
import ScoreBoard from '../screens/scoreboard';


const Tab = createMaterialBottomTabNavigator();

const BottomTabNavigator = () => {
  const theme = useTheme();
  theme.colors.secondaryContainer = "transparent"

  const glowEffect = () => {
    return (<Image style={{ position: 'absolute', top: -15, left: -30, height: 60, width: 90 }} source={Icons.IconBGHome} />)
  }
  return (
    <Tab.Navigator
      initialRouteName="GeoArChallenge"
      barStyle={styles.tabBarStyle}
      activeColor='#FFFFFF'
      inactiveColor='#FFFFFF'
      theme={theme}
    >
      <Tab.Screen
        name="GeoArChallenge"
        component={GeoArChallenge}
        options={{
          tabBarLabel: <Text style={styles.tabBarLabelStyle}>Home</Text>,
          tabBarIcon: ({ focused }) => (
            <View style={{ position: 'relative' }}>
              {focused && glowEffect()}
              <Icon
                name={'UnselectedHomeIcon'}
                family='custom'
                size={25}
              />
            </View>

          ),
        }}
      />
      <Tab.Screen
        name="Scores"
        component={ScoreBoard}
        options={{
          tabBarLabel: <Text style={styles.tabBarLabelStyle}>Scores</Text>,
          tabBarIcon: ({ focused }) => (
            <View style={{ position: 'relative' }}>
              {focused && glowEffect()}
              <Icon
                name={'UnselectedBadgeIcon'}
                family='custom'
                size={28}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Go Navigate"
        component={Home}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <Icon
              name={'SelectedCamera'}
              family='custom'
              size={50}
              style={styles.cameraTabStyle}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Rally"
        component={Rally}
        options={{
          tabBarLabel: <Text style={styles.tabBarLabelStyle}>Rally</Text>,
          tabBarIcon: ({ focused }) => (
            <View style={{ position: 'relative' }}>
              {focused && glowEffect()}
              <Icon
                name={'UnselectedFlagIcon'}
                family='custom'
                size={25}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: <Text style={styles.tabBarLabelStyle}>Profile</Text>,
          tabBarIcon: ({ focused }) => (
            <View style={{ position: 'relative' }}>
              {focused && glowEffect()}
              <Icon
                name={'UnselectedProfile'}
                family='custom'
                size={25}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 80,
    position: 'absolute',
    backgroundColor: '#090A16',
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 5
  },
  tabBarIconStyle: {
    marginTop: -40
  },
  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 5
  },
  cameraTabStyle: {
    marginTop: -5
  }
})
