import React, { useEffect, useState } from "react";

import { FlatList, Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { handleError } from "../../util/helpers";
import {
  getGeoARDestinations,
  getARProfile,
  getARStettings,
  getARChallenges,
  getARSitesStars,
  setDevice,
} from "../../network";

import BackgroundWithImage from "../../components/background";
import AppHeader from "../../components/header";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import SiteIcon from "../../assets/geoar/siteicon.svg";
import StarSiteIcon from "../../assets/geoar/starsite.svg";
import GradientDownPNG from "../../assets/geoar/gradient_down.png";
import SOSIcon from "../../assets/Icons/sos.svg";
import ArIcon from "../../assets/geoar/aricon.svg";
import {
  updateARUserData,
  updateARSettings,
  updateSelectedDestination,
  updateAnyWhereChallenges,
} from "../../redux/AR";

import { useDispatch } from "react-redux";
import useStyles from "./styles";
import { MenuIcon } from "../../assets/svg";
import PanicPopUp from "./panicpopup";
import OneSignal from "react-native-onesignal";

const GeoArChallenge = ({}) => {
  const _styles = useStyles();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [destinationData, setDestinationData] = useState([]);
  const [starSitesCount, setStarSitesCount] = useState({});
  const [openPanicPopUp, setOpenPanicPopup] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    OneSignal.setNotificationOpenedHandler(notification => {
      const { additionalData } = notification.notification;

      if (additionalData) {
        navigateToGeoChanllenge(additionalData);
      }
    });

    return () => {
      OneSignal.clearHandlers();
    };
  }, []);

  const navigateToGeoChanllenge = additionalData => {
    const { destinationId } = additionalData;
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
        setDevice({ ...deviceData, active: true })
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
          // setNumberOfChallenges(res?.data?.length)
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
    const res = await getARSitesStars({ id });
    starSitesCount[id] = res.data[0];
    setStarSitesCount({ ...starSitesCount });
  };

  const getStarCount = id => {
    return starSitesCount[id] ? starSitesCount[id] : 0;
  };

  useEffect(() => {
    loadDestinations();
    setOnesignalDevice();
  }, []);

  const navigateToChallengeDetails = obj => {
    dispatch(updateSelectedDestination(obj));
    navigation.navigate("GeoArOutdoor", { challengeObj: obj });
  };

  const Item = ({ obj }) => (
    <TouchableOpacity onPress={() => navigateToChallengeDetails(obj)} style={{ width: "100%" }}>
      <ImageBackground style={_styles.containerView} resizeMode="cover" source={{ uri: obj.image }}>
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
        <View style={{ width: "100%", marginBottom: 10 }}>
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
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <SiteIcon style={{ width: 48, height: 48 }} />
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
              <StarSiteIcon style={{ width: 48, height: 48 }} />
              <Text style={_styles.s_list_count}>{getStarCount(obj.id)}</Text>
              <Text style={_styles.s_list_text}>Star Sites</Text>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <ArIcon style={{ width: 48, height: 48 }} />
              <Text style={_styles.s_list_count}>{obj.unique_ar_sites.length}</Text>
              <Text style={_styles.s_list_text}>AR Photo Challenges</Text>
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
        style={{ paddingLeft: 5 }}
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
        style={{ paddingRight: 5 }}
      >
        <SOSIcon width={30} height={30} />
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
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
        style={{ flex: 1, marginVertical: 15 }}
        data={destinationData}
        numColumns={1}
        refreshing={isLoading}
        onRefresh={() => {
          loadDestinations();
        }}
        renderItem={({ item }) => <Item obj={item} />}
        keyExtractor={item => item.id}
      />
      {openPanicPopUp && (
        <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
          <PanicPopUp
            onClose={() => {
              setOpenPanicPopup(false);
            }}
          />
        </View>
      )}
    </BackgroundWithImage>
  );
};

export default GeoArChallenge;
