import {StyleSheet, Text, View, Image, SafeAreaView} from "react-native";
import {createMaterialBottomTabNavigator} from "react-native-paper/react-navigation";
import {useTheme} from "react-native-paper";
import {SafeAreaProvider} from "react-native-safe-area-context";

import ARTipsScreen from "../screens/arTips";
import Profile from "../screens/profile/profile";
import Rally from "../screens/rally";
import GeoArChallenge from "../screens/home";
import ScoreBoard from "../screens/scoreboard";

import Icon from "../components/Icon";
import {Icons} from "../assets/Icons";
import ARScreen from "screens/arScreen";
import FunFactsScreen from "screens/challenges/FunFactsScreen";
// import {getFocusedRouteNameFromRoute} from "@react-navigation/native";

const Tab = createMaterialBottomTabNavigator();

const BottomTabNavigator = () => {
  // const BottomTabNavigator = ({route}: {route: any}) => {
  const theme = useTheme();
  theme.colors.secondaryContainer = "transparent";

  const glowEffect = () => {
    return (
      <Image
        style={{position: "absolute", top: -15, left: -30, height: 60, width: 90}}
        source={Icons.IconBGHome}
      />
    );
  };

  // const routeName = getFocusedRouteNameFromRoute(route) ?? "DefaultScreen";
  // const tabBarStyle = routeName === "Go Navigate" ? {display: "none"} : {display: "flex"};

  return (
    <SafeAreaProvider style={styles.container}>
      <Tab.Navigator
        initialRouteName="GeoArChallenge"
        barStyle={styles.tabBarStyle}
        activeColor="#FFFFFF"
        inactiveColor="#FFFFFF"
        theme={theme}
        // screenOptions={({route}) => ({
        //   tabBarStyle: routeName === "Go Navigate" ? {display: "none"} : {display: "flex"},
        // })}
      >
        <Tab.Screen
          name="GeoArChallenge"
          component={GeoArChallenge}
          options={{
            // @ts-ignore
            tabBarLabel: <Text style={styles.tabBarLabelStyle}>Home</Text>,
            tabBarIcon: ({focused}) => (
              <View style={{position: "relative"}}>
                {focused && glowEffect()}
                <Icon name={"UnselectedHomeIcon"} family="custom" size={25} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Scores"
          component={ScoreBoard}
          options={{
            // @ts-ignore
            tabBarLabel: <Text style={styles.tabBarLabelStyle}>Scores</Text>,
            tabBarIcon: ({focused}) => (
              <View style={{position: "relative"}}>
                {focused && glowEffect()}
                <Icon name={"UnselectedBadgeIcon"} family="custom" size={28} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Go Navigate"
          // @ts-ignore
          // component={FunFactsScreen}
          component={ARScreen}
          options={{
            tabBarLabel: "",
            tabBarIcon: ({focused}) => (
              <Icon
                name={"SelectedCamera"}
                family="custom"
                size={50}
                style={styles.cameraTabStyle}
              />
            ),
            // tabBarStyle: {display: "none"},
          }}
        />
        <Tab.Screen
          name="Rally"
          component={Rally}
          options={{
            // @ts-ignore
            tabBarLabel: <Text style={styles.tabBarLabelStyle}>Rally</Text>,
            tabBarIcon: ({focused}) => (
              <View style={{position: "relative"}}>
                {focused && glowEffect()}
                <Icon name={"UnselectedFlagIcon"} family="custom" size={25} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          // @ts-ignore
          component={Profile}
          options={{
            // @ts-ignore
            tabBarLabel: <Text style={styles.tabBarLabelStyle}>Profile</Text>,
            tabBarIcon: ({focused}) => (
              <View style={{position: "relative"}}>
                {focused && glowEffect()}
                <Icon name={"UnselectedProfile"} family="custom" size={25} />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaProvider>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090A16",
  },
  tabBarStyle: {
    backgroundColor: "#090A16",
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    paddingHorizontal: 25,
    paddingTop: 5,
  },
  tabBarIconStyle: {
    marginTop: -40,
  },
  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 5,
  },
  cameraTabStyle: {
    marginTop: -5,
  },
});
