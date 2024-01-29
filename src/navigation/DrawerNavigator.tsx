import { createDrawerNavigator } from '@react-navigation/drawer';

import BottomTabNavigator from './BottomTabNavigator';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen 
        name="Home" 
        component={BottomTabNavigator} 
        options={{
            headerShown: false
        }}
    />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;