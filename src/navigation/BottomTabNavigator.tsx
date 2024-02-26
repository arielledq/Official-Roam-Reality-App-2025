import { StyleSheet,Text } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { useTheme } from 'react-native-paper'

import Home from '../screens/home';
import Profile from '../screens/profile/profile';
import Scores from '../screens/scores';
import Rally from '../screens/rally';
import Icon from "../components/Icon"

const Tab = createMaterialBottomTabNavigator();

const BottomTabNavigator = () => {
  const theme = useTheme();
  theme.colors.secondaryContainer = "transparent"
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      barStyle={styles.tabBarStyle}
      activeColor='#FFFFFF'
      inactiveColor='#FFFFFF'
      theme={theme}
    >
      <Tab.Screen
        name="HomeScreen"
        component={Home}
        options={{
          tabBarLabel: <Text style={styles.tabBarLabelStyle}>Home</Text>,
          tabBarIcon: ({focused}) => ( 
              <Icon  
                name={focused ? 'SelectedHomeIcon' : 'UnselectedHomeIcon'} 
                family='custom' 
                size={focused ? 110 : 30} 
                style={focused && styles.tabBarIconStyle}
              /> 
          ),
        }}
      />
      <Tab.Screen
        name="Scores"
        component={Scores}
        options={{
          tabBarLabel: <Text style={styles.tabBarLabelStyle}>Scores</Text>,
          tabBarIcon: ({ focused }) => (
            <Icon  
                name={focused ? 'SelectedBadgeIcon' : 'UnselectedBadgeIcon'} 
                family='custom' 
                size={focused ? 110 : 33} 
                style={focused && styles.tabBarIconStyle}
              /> 
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
                size={55} 
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
            <Icon  
              name={focused ? 'SelectedFlagIcon' : 'UnselectedFlagIcon'} 
              family='custom' 
              size={focused ? 110 : 30} 
              style={focused && styles.tabBarIconStyle}
          />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: <Text style={styles.tabBarLabelStyle}>Profile</Text>,
          tabBarIcon: ({ focused }) => (
            <Icon  
              name={focused ? 'SelectedProfile' : 'UnselectedProfile'} 
              family='custom' 
              size={focused ? 110 : 30} 
              style={focused && styles.tabBarIconStyle}
        />
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
    paddingHorizontal: 25
  },
  tabBarIconStyle: {
    marginTop: -40
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10
  },
  cameraTabStyle: {
    marginTop: -5
  }
})