import {StyleSheet, Text, View, Image} from "react-native";
import {createMaterialBottomTabNavigator} from "react-native-paper/react-navigation";
import {useTheme} from "react-native-paper";
import {SafeAreaProvider} from "react-native-safe-area-context";

import Profile from "../screens/profile/profile";
import Rally from "../screens/rally";
import GeoArChallenge from "../screens/home";
import ScoreBoard from "../screens/scoreboard";

import Icon from "../components/Icon";
import {Icons} from "../assets/Icons";
import ARScreen from "screens/arScreen";
import ARTipsScreen from "screens/arTips";
import {AppButton} from "components";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";

const Tab = createMaterialBottomTabNavigator();

const BottomTabNavigator = () => {
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

  return (
    <SafeAreaProvider style={styles.container}>
      <Tab.Navigator
        barStyle={styles.tabBarStyle}
        activeColor="#FFFFFF"
        inactiveColor="#FFFFFF"
        theme={theme}
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
          component={ARScreen}
          options={{
            tabBarLabel: "",
            tabBarIcon: ({focused}) => (
              <AppButton
                containerStyle={{
                  width: widthPercentageToDP(13),
                  height: widthPercentageToDP(13),
                  borderRadius: widthPercentageToDP(100),
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: heightPercentageToDP(2),
                }}
                customColors={["#7a00cf", "#5532ff"]}
                showButton={false}
              >
                <Icons.Arcamera />
              </AppButton>
            ),
          }}
        />
        <Tab.Screen
          name="FAQ’s"
          component={ARTipsScreen}
          options={{
            // @ts-ignore
            tabBarLabel: <Text style={styles.tabBarLabelStyle}>FAQ’s</Text>,
            tabBarIcon: ({focused}) => (
              <View style={{position: "relative"}}>
                {focused && glowEffect()}
                <Icon name={"infocirlceo"} family="antdesign" size={25} color="#ffffffc0" />
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
