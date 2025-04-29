import React, {useState} from "react";
import {View, StyleSheet, Image, TouchableOpacity} from "react-native";
import {DrawerContentScrollView} from "@react-navigation/drawer";
import theme from "../../assets/theme";
import {useNavigation} from "@react-navigation/native";
import Images from "../../assets/images";
import Icon from "../../components/Icon";
import AppText from "../../components/text";
import {FontLineHeights, FontSizes, fontGroup} from "../../util/FontUtils";
import ConfirmationPopUp from "../../components/confirmationPopUp";
import {deleteAccount, logout} from "../../network";
import {useDispatch} from "react-redux";
import {resetState} from "../../redux/Login";
import LinearGradient from "react-native-linear-gradient";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {removeItem, showMessage} from "../../util/helpers";
import AppSwitch from "../../components/Switch";
import userLocationHook from "./location.hook";

const DrawerList = [
  {icon: "earth", label: "AR Challenges", navigateTo: "ARChallenge"},
  {
    icon: "pin",
    label: "My Live Location",
    description: "Allows your friends to see your live location",
    navigateTo: "toggleLocation",
  },
  {icon: "user", label: "Friends", navigateTo: "Friends"},
  {icon: "Invite", label: "Invite Friends", navigateTo: "InviteFriends"},
  {icon: "Folder", label: "Legal", navigateTo: "Legal"},
  {icon: "infocirlceo", label: "Support & Feedback", navigateTo: "SendFeedback"},
  {icon: "setting", label: "Settings", navigateTo: "Settings"},
  {icon: "logout", label: "Logout", navigateTo: "logout"},
];

const DrawerLayout = ({icon, label, description, navigateTo, isLastItem, index, onPress}) => {
  const {loading, locationIsEnabled, toggleUserLocation} = userLocationHook();

  function getIconFamily(icon) {
    const customIcons = ["Contact", "Question", "Folder", "Invite", "Wallet", "pin"];
    return customIcons.includes(icon) ? "custom" : "antdesign";
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
          flex: 1,
        }}
      >
        <Icon name={icon} family={getIconFamily(icon)} color={"white"} size={20} />
        <View style={{flex: 1}}>
          <AppText style={styles.Text}>{label}</AppText>
          {description && <AppText style={styles.Description}>{description}</AppText>}
        </View>
        {navigateTo === "toggleLocation" ? (
          <AppSwitch
            onValueChange={toggleLiveLocationButtonHandler}
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
            colors={["#9003E0", "#1158F4", "#9003E0"]}
            style={[
              styles.linearGradient,
              {
                padding: 0,
                minHeight: 50,
              },
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 10,
              }}
            >
              {renderDrawerItem()}
            </View>
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
  const dispatch = useDispatch();
  const [popupDetails, setPopupDetails] = useState({});
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const onPressHandler = navigateTo => {
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
        navigation.reset({
          index: 0,
          routes: [{name: "TabNavigator", params: {screen: "GeoArChallenge"}}],
        });
        break;
      }

      default:
        navigation.navigate(navigateTo);
        break;
    }
  };
  const handleLogOutButton = async () => {
    await GoogleSignin.revokeAccess().catch(err => console.error(err));
    await GoogleSignin.signOut().catch(err => console.error(err));
    await removeItem("fbToken");
    await removeItem("instaToken");
    logout();
    dispatch(resetState());
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
    marginLeft: 20,
    marginRight: 10,
    marginTop: 13,
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "flex-start",
  },
});
