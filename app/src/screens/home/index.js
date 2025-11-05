import React, {useEffect, useState} from "react";
import {FlatList, Image, ImageBackground, Text, TouchableOpacity, View} from "react-native";

import {OneSignal} from "react-native-onesignal";
import {DrawerActions, useNavigation} from "@react-navigation/native";
import {useDispatch, useSelector} from "react-redux";

import AppHeader from "../../components/header";
import ScreenContainer from "components/ScreenContainer";
import PanicPopUp from "../geoarchallenge/panicpopup";
import Icon from "components/Icon";

import {accountSetupIsComplete, handleError, showMessage} from "../../util/helpers";
import {
  getGeoARDestinations,
  getARProfile,
  getARStettings,
  getARChallenges,
  getGeoARDestinationsMini,
  getARSitesStars,
  updateProfile,
  getProfieDetails,
} from "../../network";
import {
  updateARUserData,
  updateARSettings,
  updateSelectedDestination,
  updateAnyWhereChallenges,
  updateDestinationData,
  updateStarSitesCount,
} from "../../redux/AR";

import SiteIcon from "../../assets/geoar/siteicon.svg";
import StarSiteIcon from "../../assets/geoar/starsite.svg";
import GradientDownPNG from "../../assets/geoar/gradient_down.png";
import SOSIcon from "../../assets/Icons/sos.svg";
import ArIcon from "../../assets/geoar/aricon.svg";
import {MenuIcon} from "../../assets/svg";

import useStyles from "./styles";
import {GIFT_POINTS} from "../../constants";
import {updateUserProperties} from "redux/Login/reducer";
import {useOneSignal} from "../../hooks/useOneSignal";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import theme from "assets/theme";
import Images from "assets/images";
import {getProfilePicture} from "util/imageUtils";
import FastImage from "react-native-fast-image";
import {AppButton} from "components";
import {Icons} from "assets/Icons";

const GeoArChallenge = ({}) => {
  const _styles = useStyles();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [destinationDataMini, setDestinationDataMini] = useState([]);
  const [userPofileImage, setUserPofileImage] = useState("");

  const [starSitesCount, setStarSitesCount] = useState({});
  const [openPanicPopUp, setOpenPanicPopup] = useState(false);
  const navigation = useNavigation();

  const destinationData = useSelector(state => state?.ar?.destinationData);

  const oneSignalClickHandler = additionalData => {
    navigateToGeoChallenge(additionalData);
  };
  const {setOnesignalDevice} = useOneSignal(oneSignalClickHandler);

  const user = useSelector(state => state?.login?.data?.user);

  const navigateToGeoChallenge = additionalData => {
    const {destinationId} = additionalData;
    if (destinationId && destinationData?.length) {
      const selectedDestination = destinationData.find(
        destination => destination?.id === destinationId
      );
      if (selectedDestination) {
        dispatch(updateSelectedDestination(selectedDestination));
        setTimeout(() => {
          navigation.navigate("GeoArChallengeDetails");
        }, 500);
      }
    }
  };

  const ARSposored = () => {
    setIsLoading(true);
    getGeoARDestinationsMini()
      .then(res => {
        if (res?.status == 1) {
          setDestinationDataMini(res?.data);
          for (let i = 0; i < res.data.length; i++) {
            const d = res.data[i];
            getARStarSites(d.id);
          }
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    getGeoARDestinations()
      .then(res => {
        if (res.status == 1) {
          dispatch(updateDestinationData(res.data));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const ARUserProfile = () => {
    setIsLoading(true);
    getARProfile()
      .then(res => {
        if (res.status == 1) {
          dispatch(updateARUserData(res));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getSettings = () => {
    setIsLoading(true);
    getARStettings()
      .then(res => {
        if (res.data.length > 0) {
          dispatch(updateARSettings(res.data[0]));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const loadDestinations = () => {
    ARSposored();
    ARUserProfile();
    getSettings();
    setIsLoading(true);
    getARChallenges()
      .then(res => {
        if (res.status == 1) {
          dispatch(updateAnyWhereChallenges(res?.data));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getARStarSites = async id => {
    const res = await getARSitesStars({id});
    starSitesCount[id] = res.data[0];
    setStarSitesCount({...starSitesCount});
    dispatch(updateStarSitesCount({[id]: res.data[0]}));
  };

  const getStarCount = id => {
    return starSitesCount[id] ? starSitesCount[id] : 0;
  };

  const updatePointsNotification = () => {
    updateProfile({
      id: user?.user_profile?.id,
      data: {has_receive_points: true},
    })
      .then(res => {
        if (res.status == 1) {
          dispatch(updateUserProperties({has_receive_points: true}));
          showMessage(
            `Surprise! We’ve added ${GIFT_POINTS} bonus points to your Roam Reality account!`,
            "success",
            null,
            10000
          );
        } else {
          handleError(res);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const navigateToChallengeDetails = obj => {
    dispatch(updateSelectedDestination(obj));
    navigation.navigate("GeoArOutdoor");
  };

  const Item = ({obj}) => {
    const destinationId = obj?.id;
    let fullDestinationData = null;
    if (destinationData?.length) {
      fullDestinationData = destinationData?.find(destination => destination?.id === destinationId);
    }
    return (
      <TouchableOpacity
        onPress={() => navigateToChallengeDetails(fullDestinationData)}
        style={{width: "100%"}}
        disabled={!fullDestinationData}
      >
        <ImageBackground
          style={_styles.containerView}
          resizeMode="cover"
          source={{uri: obj?.image}}
        >
          <Image
            source={GradientDownPNG}
            resizeMode="cover"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              top: 0,
              width: "110%",
            }}
          />
          <View style={{width: "100%", marginBottom: 10}}>
            <Text style={_styles.list_title}>{obj?.name}</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "100%",
                alignItems: "flex-start",
                marginTop: 20,
              }}
            >
              <View style={{alignItems: "center", justifyContent: "center"}}>
                <AppButton
                  containerStyle={_styles.shadowBoxImage}
                  customColors={["#7a00cf", "#5532ff"]}
                  showButton={false}
                >
                  <Icons.sites />
                </AppButton>

                <Text style={_styles.s_list_count}>{obj?.star_ar_sites_cnt || 0}</Text>
                <Text style={_styles.s_list_text}>Sites</Text>
              </View>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginStart: 22,
                  marginEnd: 10,
                }}
              >
                <AppButton
                  containerStyle={_styles.shadowBoxImage}
                  customColors={["#7a00cf", "#5532ff"]}
                  showButton={false}
                >
                  <FastImage
                    source={Images.destination}
                    style={{width: widthPercentageToDP(7), height: widthPercentageToDP(7)}}
                    resizeMode="contain"
                    defaultSource={Images.destination}
                  />
                </AppButton>
                <Text style={_styles.s_list_count}>{getStarCount(obj.id)}</Text>
                <Text style={_styles.s_list_text}>Hunts</Text>
              </View>
              <View style={{alignItems: "center", justifyContent: "center"}}>
                <AppButton
                  containerStyle={_styles.shadowBoxImage}
                  customColors={["#7a00cf", "#5532ff"]}
                  showButton={false}
                >
                  <Icons.Ar />
                </AppButton>
                <Text style={_styles.s_list_count}>{obj?.unique_ar_sites_cnt || 0}</Text>
                <Text style={_styles.s_list_text}>Non-Geo AR</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };
  const handleMenuButton = () => {
    return (
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
        style={{paddingLeft: 5, marginTop: heightPercentageToDP("1%")}}
      >
        <MenuIcon />
      </TouchableOpacity>
    );
  };

  const MenuRightComponent = () => {
    const profilePicture = getProfilePicture(userPofileImage?.image || user?.user_profile?.image);
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Profile");
        }}
      >
        {userPofileImage ? (
          <FastImage
            source={{uri: profilePicture}}
            style={_styles.profileImage}
            resizeMode={FastImage.resizeMode.cover}
            defaultSource={Images.AppLogo}
          />
        ) : (
          <View
            style={{
              marginTop: heightPercentageToDP("1%"),
            }}
          ></View>
        )}
      </TouchableOpacity>
    );
  };

  const getUserProfile = async userProfileId => {
    try {
      const response = await getProfieDetails({id: userProfileId});

      if (response.status == 1) {
        setUserPofileImage(response);
        const accountIsComplete = accountSetupIsComplete(response);
        if (!accountIsComplete) {
          setTimeout(() => {
            // @ts-ignore
            navigation.replace("EditProfile", {
              profileDetails: response,
              accountNotComplete: true,
              extraInfo: user,
            });
          }, 300);
        }
      } else {
        throw new Error("Error fetching profile details");
      }
    } catch (error) {
      console.error("Error fetching profile details: ", error);
    }
  };

  useEffect(() => {
    loadDestinations();
    setOnesignalDevice();

    const clickListener = event => {
      console.log("OneSignal: notification clicked:", event);

      const notification = event.getNotification();
      const additionalData = notification?.additionalData;

      if (additionalData) {
        navigateToGeoChallenge(additionalData);
      }
    };

    OneSignal.Notifications.addEventListener("click", clickListener);

    return () => {
      OneSignal.Notifications.removeEventListener("click", clickListener);
    };
  }, []);

  useEffect(() => {
    if (user?.ar_user_profile_user?.points === GIFT_POINTS && !user?.has_receive_points) {
      updatePointsNotification();
    }

    const userProfileId = user?.user_profile?.id;
    getUserProfile(userProfileId);
  }, [user]);

  return (
    <ScreenContainer>
      <AppHeader
        rightComponent={<MenuRightComponent />}
        leftComponent={handleMenuButton()}
        centerComponent={{
          text: "Pick Your Destination",
          style: [_styles.heading],
        }}
        backgroundColor="transparent"
        isBottomTab
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{flex: 1, marginTop: 15}}
        data={destinationDataMini}
        numColumns={1}
        refreshing={isLoading}
        onRefresh={() => {
          loadDestinations();
        }}
        renderItem={({item}) => <Item obj={item} />}
        keyExtractor={item => item.id}
      />
      {openPanicPopUp && (
        <View style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0}}>
          <PanicPopUp
            onClose={() => {
              setOpenPanicPopup(false);
            }}
          />
        </View>
      )}
    </ScreenContainer>
  );
};

export default GeoArChallenge;
