import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LinearGradient from "react-native-linear-gradient"

import { Icons } from '../assets/Icons';
import Home from '../screens/home';

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
        name="Home0" 
        component={Home} 
        options = {{
          tabBarLabel : "Home",
          tabBarIcon: ({focused}) => (
            focused ? <Icons.SelectedHomeIcon/> : <Icons.UnselectedHomeIcon />
          ),
          tabBarIconStyle : styles.tabBarIconStyle,
          tabBarLabelStyle : styles.tabBarLabelStyle
        }}
      />
      <Tab.Screen 
        name="Home1" 
        component={Home} 
        options = {{
          tabBarLabel : "Home1",
          tabBarIcon: ({focused}) => (
            focused ? <Icons.SelectedBadgeIcon/> : <Icons.UnselectedBadgeIcon />
          ),
          tabBarIconStyle : styles.tabBarIconStyle,
          tabBarLabelStyle : styles.tabBarLabelStyle
        }}
      />
      <Tab.Screen 
        name="Home2" 
        component={Home} 
        options = {{
          tabBarLabel: () => null,
          tabBarIcon: ({focused}) => (
            focused ? <Icons.SelectedCamera/> : <Icons.SelectedCamera />
          ),
          tabBarIconStyle : [styles.tabBarIconStyle,styles.cameraTabStyle],
        }}
      />
       <Tab.Screen 
        name="Home4" 
        component={Home} 
        options = {{
          tabBarLabel : "Home3",
          tabBarIcon: ({focused}) => (
            focused ? <Icons.SelectedFlagIcon/> : <Icons.UnselectedFlagIcon />
          ),
          tabBarIconStyle : styles.tabBarIconStyle,
          tabBarLabelStyle : styles.tabBarLabelStyle,
        }}
      />
        <Tab.Screen 
        name="Profile" 
        component={Home} 
        options = {{
          tabBarLabel : "Profile",
          tabBarIcon: ({focused}) => (
            focused ? <Icons.SelectedProfile/> : <Icons.UnselectedProfile />
          ),
          tabBarIconStyle : styles.tabBarIconStyle,
          tabBarLabelStyle : styles.tabBarLabelStyle
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator

const styles = StyleSheet.create({
  tabBarStyle : { 
    height : 90,
    position: 'absolute' ,
    backgroundColor : '#090A16',
    borderTopStartRadius : 20,
    borderTopEndRadius : 20,
    paddingHorizontal : 25
  },
  tabBarIconStyle : {
    marginBottom : -10
  },
  tabBarLabelStyle : {
    fontSize : 12,
    fontWeight : '700',
    lineHeight : 12,
    color : '#FFFFFF',
    textAlign : 'center',
    marginTop : -10
  },
  cameraTabStyle: {
    marginTop : 5
  }
})