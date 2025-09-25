import React, {useState, useEffect} from "react";
import {View, StyleSheet, Image, TouchableOpacity} from "react-native";
import {DrawerContentScrollView} from "@react-navigation/drawer";
import theme from "../../assets/theme";
import {useNavigation, DrawerActions} from "@react-navigation/native";
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
import {DEBOUNCE_TIME, removeItem, showMessage} from "../../util/helpers";
import AppSwitch from "../../components/Switch";
import userLocationHook from "./location.hook";
import useDebounce from "hooks/debounce";
import useDebounceApi from "hooks/useDebounceApi";

const DrawerList = [
    {icon: "earth", label: "AR Challenges", navigateTo: "ARChallenge"},
    {
        icon: "pin",
        label: "My Live Location",
        description: "Allows your friends to see your live location",
        navigateTo: "toggleLocation",
    },
    {icon: "user", label: "Friends", navigateTo: "Friends"},
    {icon: "bells", label: "Notifications", navigateTo: "Notifications"},
    {icon: "Invite", label: "Invite Friends", navigateTo: "InviteFriends"},
    {icon: "Folder", label: "Legal", navigateTo: "Legal"},
    {icon: "infocirlceo", label: "Support & Feedback", navigateTo: "SendFeedback"},
    {icon: "setting", label: "Settings", navigateTo: "Settings"},
    {icon: "logout", label: "Logout", navigateTo: "logout"},
];

const DrawerLayout = ({icon, label, description, navigateTo, isLastItem, index, onPress}) => {
    const { locationIsEnabled, toggleUserLocation} = userLocationHook();
    const [loading, setLoading] = useState(false);
    function getIconFamily(icon) {
        const customIcons = ["Contact", "Question", "Folder", "Invite", "Wallet", "pin"];
        return customIcons.includes(icon) ? "custom" : "antdesign";
    }

    const debouncedUserLocationApi = useDebounceApi(() => {
        toggleUserLocation();
        setLoading(false);
    }, 5000);

    const locationToggleHandler = () => {
        setLoading(true);
        debouncedUserLocationApi();
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
                <Icon name={icon} family={getIconFamily(icon)} color={"white"} size={20}/>
                <View style={{flex: 1}}>
                    <AppText style={styles.Text}>{label}</AppText>
                    {description && <AppText style={styles.Description}>{description}</AppText>}
                </View>
                {navigateTo === "toggleLocation" ? (
                    <AppSwitch
                        // disabled={loading}
                        onValueChange={locationToggleHandler}
                        value={locationIsEnabled}
                        loading={loading}
                    />
                ) : isLastItem ? (
                    <></>
                ) : (
                    <Icon name="right" family="antdesign" color={theme.darkColors?.white} size={20}/>
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
    const stackNav = navigation.getParent && navigation.getParent(); // Stack raíz
    const dispatch = useDispatch();
    const [popupDetails, setPopupDetails] = useState({});
    const [isConfirmationVisible, setConfirmationVisible] = useState(false);

    // Cierra el drawer si existe este método
    const closeDrawerIfPossible = () => {
        // preferimos el navigation que viene por props del Drawer
        const nav = props?.navigation || navigation;

        // 1) método directo (el más confiable cuando existe)
        if (nav && typeof nav.closeDrawer === 'function') {
            try {
                nav.closeDrawer();
                return;
            } catch (e) {
            }
        }

        // 2) fallback con DrawerActions (algunas versiones no exponen closeDrawer)
        if (nav && typeof nav.dispatch === 'function') {
            try {
                nav.dispatch(DrawerActions.closeDrawer());
                return;
            } catch (e) {
            }
        }

        // 3) último recurso: el navigation del hook
        if (navigation && typeof navigation.closeDrawer === 'function') {
            try {
                navigation.closeDrawer();
                return;
            } catch (e) {
            }
        }
        if (navigation && typeof navigation.dispatch === 'function') {
            try {
                navigation.dispatch(DrawerActions.closeDrawer());
                return;
            } catch (e) {
            }
        }
    };

    // Espera 2 frames para dejar que el árbol de navegación se re-monte (Auth/App)
    const waitNextFrame = () =>
        new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const onPressHandler = navigateTo => {
        // Siempre cerramos el drawer antes de navegar
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
                // no navegamos; lo maneja el switch
                break;
            }
            case "Home": {
                // Reinicia al home del TabNavigator desde el stack raíz
                if (stackNav && typeof stackNav.reset === "function") {
                    stackNav.reset({
                        index: 0,
                        routes: [{name: "TabNavigator", params: {screen: "Tab", params: {screen: "GeoArChallenge"}}}],
                    });
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [{name: "TabNavigator", params: {screen: "Tab", params: {screen: "GeoArChallenge"}}}],
                    });
                }
                break;
            }

            default:
                // Navegamos SIEMPRE por el stack padre (donde están Settings, Friends, etc.)
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

            // Esperar a que el árbol de navegación se re-monte y recién resetear a Login
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
                showMessage(res.message?.error || "Error deleting account", "error");
            }
        });
    };

    return (
        <>
            <View style={{flex: 1, backgroundColor: theme.darkColors?.drawerBG}}>
                <DrawerContentScrollView {...props}>
                    <View style={styles.drawerContent}>
                        <View style={styles.checkIcon}>
                            <Image source={Images.AppSettingsIcon}/>
                        </View>
                        <View style={styles.drawerSection}>
                            <DrawerItems onPress={v => onPressHandler(v)}/>
                        </View>
                    </View>
                </DrawerContentScrollView>

                <ConfirmationPopUp
                    title={popupDetails?.title}
                    description={popupDetails?.description}
                    confirmText={popupDetails?.title}
                    cancelText={popupDetails?.cancelText}
                    confirmHandler={
                        popupDetails?.title == "Log Out" ? handleLogOutButton : handleDeleteAccount
                    }
                    cancelHandler={closeModalHandler}
                    isVisible={isConfirmationVisible}
                />
            </View>
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
