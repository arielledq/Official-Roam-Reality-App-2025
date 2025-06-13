import React, {useEffect, useState} from "react";
import {FlatList, Image, ImageBackground, Text, TouchableOpacity, View} from "react-native";

import OneSignal from "react-native-onesignal";
import {DrawerActions, useNavigation} from "@react-navigation/native";
import {useDispatch, useSelector} from "react-redux";

import AppHeader from "../../components/header";
import ScreenContainer from "components/ScreenContainer";
import PanicPopUp from "../geoarchallenge/panicpopup";

import {accountSetupIsComplete, handleError, showMessage} from "../../util/helpers";
import {
  getGeoARDestinations,
  getARProfile,
  getARStettings,
  getARChallenges,
  getARSitesStars,
  setDevice,
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

const GeoArChallenge = ({}) => {
  const _styles = useStyles();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [destinationData, setDestinationData] = useState([]);
  const [starSitesCount, setStarSitesCount] = useState({});
  const [openPanicPopUp, setOpenPanicPopup] = useState(false);
  const navigation = useNavigation();

  const user = useSelector(state => state?.login?.data?.user);

  const navigateToGeoChanllenge = additionalData => {
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

  const setOnesignalDevice = () => {
    OneSignal.getDeviceState().then(deviceData => {
      if (deviceData?.userId) {
        setDevice({...deviceData, active: true})
          .then(res => {})
          .catch(err => {
            console.error("Device Data Update Error", err);
          });
      }
    });
  };

  const ARSposored = () => {
    setIsLoading(true);
    getGeoARDestinations()
      .then(res => {
        if (res.status == 1) {
          setDestinationData(res.data);
          dispatch(updateDestinationData(res.data));
          for (let i = 0; i < res.data.length; i++) {
            const d = res.data[i];
            getARStarSites(d.id);
          }
        } else {
          res.message.message = "Error in loading Challenges.";
          handleError(res);
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
        } else {
          res.message.message = "Error in loading Challenges.";
          handleError(res);
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
        } else {
          res.message.message = "Error in loading Challenges.";
          handleError(res);
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
    navigation.navigate("GeoArOutdoor", {challengeObj: obj});
  };

  const Item = ({obj}) => (
    <TouchableOpacity onPress={() => navigateToChallengeDetails(obj)} style={{width: "100%"}}>
      <ImageBackground style={_styles.containerView} resizeMode="cover" source={{uri: obj.image}}>
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
          <Text style={_styles.list_title}>{obj.name}</Text>
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
              <SiteIcon style={{width: 48, height: 48}} />
              <Text style={_styles.s_list_count}>{obj.star_ar_sites.length}</Text>
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
              <StarSiteIcon style={{width: 48, height: 48}} />
              <Text style={_styles.s_list_count}>{getStarCount(obj.id)}</Text>
              <Text style={_styles.s_list_text}>Star Sites</Text>
            </View>
            <View style={{alignItems: "center", justifyContent: "center"}}>
              <ArIcon style={{width: 48, height: 48}} />
              <Text style={_styles.s_list_count}>{obj.unique_ar_sites.length}</Text>
              <Text style={_styles.s_list_text}>AR Challenges</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
  const handleMenuButton = () => {
    return (
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
        style={{paddingLeft: 5}}
      >
        <MenuIcon />
      </TouchableOpacity>
    );
  };

  const MenuRightComponent = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          setOpenPanicPopup(true);
        }}
        style={{paddingRight: 5}}
      >
        <SOSIcon width={30} height={30} />
      </TouchableOpacity>
    );
  };

  const getUserProfile = async userProfileId => {
    try {
      const response = await getProfieDetails({id: userProfileId});

      if (response.status == 1) {
        const accountIsComplete = accountSetupIsComplete(response);
        if (!accountIsComplete) {
          setTimeout(() => {
            // @ts-ignore
            navigation.replace("EditProfile", {profileDetails: response});
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

    OneSignal.setNotificationOpenedHandler(notification => {
      const {additionalData} = notification.notification;

      if (additionalData) {
        navigateToGeoChanllenge(additionalData);
      }
    });

    return () => {
      OneSignal.clearHandlers();
    };
  }, []);

  useEffect(() => {
    if (user?.user_ar_profile?.points === GIFT_POINTS && !user?.has_receive_points) {
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
          text: "AR Experiences",
          style: [_styles.heading],
        }}
        backgroundColor="transparent"
        isBottomTab
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{flex: 1, marginTop: 15}}
        data={destinationData}
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
