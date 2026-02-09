import React, {useEffect, useState} from "react";
import {View, StyleSheet, Image, TouchableOpacity} from "react-native";
import {DrawerContentScrollView} from "@react-navigation/drawer";
import theme from "../../assets/theme";
import {DrawerActions, useNavigation} from "@react-navigation/native";
import Images from "../../assets/images";
import Icon from "../../components/Icon";
import AppText from "../../components/text";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";
import ConfirmationPopUp from "../../components/confirmationPopUp";
import {deleteAccount, getUserNotificationList, logout} from "../../network";
import {useDispatch} from "react-redux";
import {resetState} from "../../redux/Login";
import LinearGradient from "react-native-linear-gradient";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {removeItem, showMessage, DEBOUNCE_TIME} from "../../util/helpers";
import AppSwitch from "../../components/Switch";
import userLocationHook from "./location.hook";
import SOSIcon from "../../assets/Icons/sos.svg";
import PanicPopUp from "screens/geoarchallenge/panicpopup";
import {widthPercentageToDP} from "react-native-responsive-screen";

const DrawerList = [
  {
    icon: "wavy-hand",
    label: "Welcome",
    navigateTo: "FAQ",
    isImageIcon: true,
  },
  {
    icon: "pin",
    label: "My Live Location",
    description: "Allows your friends to see your live location",
    navigateTo: "toggleLocation",
  },
  {icon: "user", label: "Friends", navigateTo: "Friends"},
  {
    icon: "bells",
    label: "Notifications",
    navigateTo: "Notifications",
    showCount: true,
  },
  {icon: "Invite", label: "Invite Friends", navigateTo: "InviteFriends"},
  {icon: "Folder", label: "Legal", navigateTo: "Legal"},
  {icon: "infocirlceo", label: "Support & Feedback", navigateTo: "SendFeedback"},
  {icon: "setting", label: "Settings", navigateTo: "Settings"},
  {icon: "logout", label: "Logout", navigateTo: "logout"},
];

const DrawerLayout = ({icon, label, description, navigateTo, isLastItem, index, onPress}) => {
  const {loading, locationIsEnabled, toggleUserLocation} = userLocationHook();
  const isFocus = useNavigation().isFocused();
  const [noitifcationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    getUserNotifications();
  }, [isFocus]);

  const getUserNotifications = async () =>
    getUserNotificationList()
      .then(response => {
        if (response && response?.data?.length > 0) {
          // Show only unread notifications
          const unreadNotifications = response.data.filter(notification => !notification?.is_read);
          setNotificationCount(unreadNotifications.length);
        }
      })
      .catch(error => console.error(error));

  function getIconFamily(icon) {
    const customIcons = ["Contact", "Question", "Folder", "Invite", "Wallet", "pin"];
    return customIcons.includes(icon) ? "custom" : "feather";
  }

  const toggleLiveLocationButtonHandler = () => {
    toggleUserLocation();
  };

  const renderDrawerItem = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: widthPercentageToDP("2%"),
        }}
      >
        {DrawerList[index].isImageIcon ? (
          <Image source={Images.WAVE} style={{height: 20, width: 20}} />
        ) : (
          <>
            {DrawerList[index].showCount && noitifcationCount > 0 && (
              <View style={styles.count}></View>
            )}
            <Icon name={icon} family={getIconFamily(icon)} color={"white"} size={20} />
          </>
        )}

        <View style={{flex: 1}}>
          <AppText style={styles.Text}>{label}</AppText>
          {description && <AppText style={styles.Description}>{description}</AppText>}
        </View>
        {navigateTo === "toggleLocation" ? (
          <AppSwitch
            onValueChange={toggleUserLocation}
            value={locationIsEnabled}
            loading={loading}
          />
        ) : isLastItem ? (
          <></>
        ) : (
          <Icon name="right" family="antdesign" color={theme.darkColors?.white} size={20} />
        )}
      </View>
    );
  };
  return (
    <>
      {index === 0 ? (
        <TouchableOpacity onPress={() => onPress(navigateTo)}>
          <LinearGradient
            // colors={["#9003E0", "#1158F4", "#9003E0"]}
            colors={["#7a00cf", "#5532ff"]}
            style={{...styles.linearGradient}}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            {renderDrawerItem()}
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => onPress(navigateTo)} style={styles.linearGradient}>
          {renderDrawerItem()}
        </TouchableOpacity>
      )}
    </>
  );
};

const DrawerItems = ({onPress}) => {
  return DrawerList.map((el, i) => {
    return (
      <DrawerLayout
        key={i}
        icon={el.icon}
        label={el.label}
        description={el.description}
        navigateTo={el.navigateTo}
        index={i}
        isLastItem={i >= DrawerList.length - 1}
        onPress={v => onPress(el.navigateTo)}
      />
    );
  });
};

function DrawerContent(props) {
  const navigation = useNavigation();
  const stackNav = navigation.getParent && navigation.getParent(); // Root stack
  const [openPanicPopUp, setOpenPanicPopup] = useState(false);
  const dispatch = useDispatch();
  const [popupDetails, setPopupDetails] = useState({});
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);

  const [noitifcationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    getUserNotifications();
  }, []);

  const getUserNotifications = async () =>
    getUserNotificationList()
      .then(response => {
        if (response && response?.data?.length > 0) {
          // Show only unread notifications
          const unreadNotifications = response.data.filter(notification => !notification?.is_read);
          setNotificationCount(unreadNotifications.length);
        }
      })
      .catch(error => console.error(error));
  const closeDrawerIfPossible = () => {
    // preferimos el navigation que viene por props del Drawer
    const nav = props?.navigation || navigation;

    // 1) direct method (the most reliable when it exists)
    if (nav && typeof nav.closeDrawer === "function") {
      try {
        nav.closeDrawer();
        return;
      } catch (e) {}
    }

    // 2) fallback con DrawerActions (algunas versiones no exponen closeDrawer)
    if (nav && typeof nav.dispatch === "function") {
      try {
        nav.dispatch(DrawerActions.closeDrawer());
        return;
      } catch (e) {}
    }

    // 3) last resort: the navigation from the hook
    if (navigation && typeof navigation.closeDrawer === "function") {
      try {
        navigation.closeDrawer();
        return;
      } catch (e) {}
    }
    if (navigation && typeof navigation.dispatch === "function") {
      try {
        navigation.dispatch(DrawerActions.closeDrawer());
        return;
      } catch (e) {}
    }
  };
  // Wait 2 frames to let the navigation tree re-mount (Auth/App)
  const waitNextFrame = () =>
    new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  const onPressHandler = navigateTo => {
    closeDrawerIfPossible();
    switch (navigateTo) {
      case "delete": {
        setPopupDetails({
          title: "Delete Account",
          description: "Are you sure you want to delete your account?",
          cancelText: "Cancel",
        });
        setConfirmationVisible(true);
        break;
      }
      case "logout": {
        setPopupDetails({
          title: "Log Out",
          description: "Are you sure you want to logout?",
          cancelText: "Cancel",
        });

        setConfirmationVisible(true);

        break;
      }
      case "toggleLocation": {
        break;
      }
      case "Home": {
        // Reset to the TabNavigator home from the root stack
        if (stackNav && typeof stackNav.reset === "function") {
          stackNav.reset({
            index: 0,
            routes: [
              {name: "TabNavigator", params: {screen: "Tab", params: {screen: "GeoArChallenge"}}},
            ],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [
              {name: "TabNavigator", params: {screen: "Tab", params: {screen: "GeoArChallenge"}}},
            ],
          });
        }
        break;
      }
      case "FAQ": {
        navigation.reset({
          index: 0,
          routes: [{name: "TabNavigator", params: {screen: "Tab", params: {screen: "FAQ’s"}}}],
        });
        break;
      }
      default:
        // We ALWAYS navigate through the parent stack (where Settings, Friends, etc. are)
        if (stackNav && typeof stackNav.navigate === "function") {
          stackNav.navigate(navigateTo);
        } else {
          navigation.navigate(navigateTo);
        }
        break;
    }
  };

  const handleLogOutButton = async () => {
    try {
      // Cerrar modal y drawer primero
      setConfirmationVisible(false);
      closeDrawerIfPossible();

      // Logout de proveedores externos
      try {
        await GoogleSignin.revokeAccess();
      } catch (error) {
        console.error("GoogleSignin revokeAccess error", error);
      }
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.error("GoogleSignin signOut error", error);
      }
      try {
        await removeItem("fbToken");
      } catch (error) {
        console.error("removeItem fbToken error", error);
      }
      try {
        await removeItem("instaToken");
      } catch (error) {
        console.error("removeItem instaToken error", error);
      }
      try {
        logout();
      } catch (error) {
        console.error("logout error", error);
      }

      // Limpia Redux (esto cambia AppStack → AuthStack)
      try {
        dispatch(resetState());
      } catch (error) {
        console.error("dispatch error", error);
      }

      // Wait for the navigation tree to re-mount and then reset to Login
      await waitNextFrame();

      const rootNav = (navigation.getParent && navigation.getParent()) || navigation;
    } catch (error) {
      console.error("handleLogOutButton error", error);
    }
  };
  const closeModalHandler = () => {
    setConfirmationVisible(false);
  };
  const handleDeleteAccount = () => {
    deleteAccount().then(res => {
      if (res.status == 1) {
        handleLogOutButton();
        showMessage("Your account has been deleted successfully");
      } else {
        showMessage(res.message.error, "error");
      }
    });
  };

  const MenuRightComponent = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("SOS");
        }}
        style={{paddingRight: 5}}
      >
        <SOSIcon width={30} height={30} />
      </TouchableOpacity>
    );
  };
  return (
    <>
      <View style={{flex: 1, backgroundColor: theme.darkColors?.drawerBG}}>
        <DrawerContentScrollView {...props}>
          <View style={styles.drawerContent}>
            <View style={styles.checkIcon}>
              <Image source={Images.AppSettingsIcon} />
            </View>
            <View style={styles.drawerSection}>
              <DrawerItems onPress={v => onPressHandler(v)} />
            </View>
          </View>
        </DrawerContentScrollView>
        <View
          style={{
            position: "absolute",
            zIndex: 1,
            right: 0,
            bottom: 0,
            marginBottom: "10%",
            marginRight: "2%",
          }}
        >
          <MenuRightComponent />
        </View>
      </View>

      <ConfirmationPopUp
        title={popupDetails?.title}
        description={popupDetails?.description}
        confirmText={popupDetails?.title}
        confirmHandler={popupDetails?.title == "Log Out" ? handleLogOutButton : handleDeleteAccount}
        isVisible={isConfirmationVisible}
        cancelText={"Cancel"}
        cancelHandler={closeModalHandler}
      />
    </>
  );
}

export default DrawerContent;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingBottom: 20,
  },
  drawerSection: {
    marginTop: 15,
    borderBottomWidth: 0,
  },
  Text: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S14,
    lineHeight: FontLineHeights.LH21,
    color: theme.darkColors?.white,
    marginLeft: 10,
  },
  Description: {
    fontSize: FontSizes.S8,
    color: theme.darkColors?.white,
    marginLeft: 10,
  },
  checkIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  linearGradient: {
    marginTop: 13,
    width: "90%",
    height: widthPercentageToDP("12%"),
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "flex-start",
    alignSelf: "center",
  },
  count: {
    width: widthPercentageToDP("2.5%"),
    height: widthPercentageToDP("2.5%"),
    borderRadius: 100,
    backgroundColor: theme.lightColors.inputRed,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    left: widthPercentageToDP("2%"),
    top: 0,
    zIndex: 1,
  },
});
