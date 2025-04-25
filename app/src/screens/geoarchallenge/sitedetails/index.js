import React, {useEffect, useState} from "react";

import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";
import {useNavigation} from "@react-navigation/native";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import CloseBIcon from "../../../assets/geoar/close-square.svg";
import ProTipIcon from "../../../assets/geoar/pro-tip.svg";
import GradientDownPNG from "../../../assets/geoar/gradient_down.png";
import Geocoder from "react-native-geocoding";
import {showLocation} from "react-native-map-link";

import {useDispatch, useSelector} from "react-redux";
import useStyles from "./styles";
import {width} from "../../../util/AppDimensions";
import {AppButton} from "../../../components";
import RenderHTML from "react-native-render-html";
import {FontSizes, fontGroup} from "../../../util/FontUtils";
import {updateSelectedGeoARSiteStars} from "../../../redux/AR";
import {checkUniqueARChallengeDoneAPI, getAllARSitesStars} from "../../../network";
import {getBounds} from "../../../util/LocationLib";
import NumericStatItem from "../../../components/NumericStatItem";
import MarkerIcon from "components/marker";
import {
  pinColor,
  processCoolDownPeriod,
  processMyCheckIns,
  tracksViewChanges,
  useCustomMarkers,
} from "util/helpers";
import Icon from "components/Icon";
import theme from "assets/theme";
import {EXPERIENCE_TYPE_CHOICES} from "../../../constants";

const GeoArSiteDetails = ({route}) => {
  const experience_type = route.params?.experience_type;

  const [isLoading, setIsLoading] = useState(false);
  const [showProTips, setShowProTips] = useState(false);
  const [address, setAddress] = useState(null);
  const [starsCount, setStarsCount] = useState(0);
  const [coolDownFinished, setCoolDownFinished] = useState(false);
  const [coolDownHoursText, setCoolDownHoursText] = useState("");
  const [myCheckInsText, setMyCheckInsText] = useState("");

  const selectedDestination = useSelector(state => state.ar?.selectedDestination);
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);
  const selectedGeoARSiteStars = useSelector(state => state.ar?.selectedGeoARSiteStars);

  const _styles = useStyles();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const checkIfChallengeIsDone = () => {
    setIsLoading(true);

    checkUniqueARChallengeDoneAPI({
      geo_challenge: selectedGeoSite.pin_challenge.id,
      geo_site: selectedGeoSite.id,
    })
      .then(res => {
        if (res?.message?.message && res?.message?.remaining) {
          const {coolDownHasFinished, remainingText} = processCoolDownPeriod(
            res?.message?.remaining
          );
          setCoolDownFinished(coolDownHasFinished);
          setCoolDownHoursText(remainingText);
        } else if (res?.message && res?.status === 1) {
          setCoolDownFinished(true);
          setCoolDownHoursText("0h");
        } else {
          setCoolDownFinished(true);
          setCoolDownHoursText("");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getAddress = () => {
    if (selectedGeoSite.address_text != "") {
      setAddress(selectedGeoSite.address_text);
      return;
    }
    Geocoder.from({
      latitude: selectedGeoSite.lat_long.coordinates[1],
      longitude: selectedGeoSite.lat_long.coordinates[0],
    })
      .then(json => {
        try {
          var addressComponent = json.results[0].formatted_address;
          setAddress(addressComponent);
        } catch (ex) {
          setAddress("Not found.");
        }
      })
      .catch(error => console.warn(error));
  };

  const geoARSitesStars = () => {
    getAllARSitesStars({id: selectedGeoSite.id})
      .then(res => {
        if (res.status == 1) {
          dispatch(updateSelectedGeoARSiteStars(res.data));
        }
      })
      .finally(() => {});
  };

  const setStarCounts = () => {
    setStarsCount(selectedGeoARSiteStars?.stars || 0);
  };

  const InfoView = () => {
    return (
      <View style={_styles.challengeInfoContainer}>
        <View style={_styles.challengeInfoHeaderContainer}>
          <View
            onPress={() => setShowProTips(true)}
            style={{
              justifyContent: "center",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ProTipIcon style={{width: 24, height: 24}} source={ProTipIcon} />
            <Text style={_styles.protip_text}>
              {selectedGeoSite?.category?.id ? "Useful Links" : "Pro Tips"}
            </Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{paddingBottom: 100}}
          showsVerticalScrollIndicator={false}
          style={{flex: 1, width: "100%", padding: 24}}
        >
          <RenderHTML
            contentWidth={width}
            tagsStyles={{
              p: {
                color: "#9CA3AF",
                fontSize: FontSizes.S14,
              },
              strong: {
                color: "#fff",
                fontSize: FontSizes.S18,
              },
              ol: {
                color: "#fff",
              },
              li: {
                color: "#fff",
              },
            }}
            source={{
              html: `${selectedGeoSite?.pro_tips.toString().replaceAll("#000000", "#fff")}`,
            }}
          />
        </ScrollView>
        <View style={{width: "100%", paddingHorizontal: 24}}>
          <AppButton
            onPress={() => setShowProTips(false)}
            buttonStyle={_styles.buttonStyle}
            containerStyle={_styles.buttonContainerStyle}
            title={"Close"}
          />
        </View>
      </View>
    );
  };

  const getFullBounds = _ => {
    if (selectedGeoSite.geo_site_border) {
      let arrayPoints = [];
      for (let i = 0; i < selectedGeoSite.geo_site_border.coordinates.length; i++) {
        const points = selectedGeoSite.geo_site_border.coordinates[i];
        for (let j = 0; j < points.length; j++) {
          const point = points[j];
          arrayPoints.push({latitude: point[1], longitude: point[0]});
        }
      }
      const bounds = getBounds(arrayPoints);
      return bounds;
    } else {
      return null;
    }
  };

  const skipNavigationButtonHandler = () => {
    switch (experience_type) {
      case EXPERIENCE_TYPE_CHOICES.AR_CHALLENGE:
        navigation.navigate("ARChallenge");
        break;

      default:
        if (!selectedGeoSite?.pin_challenge) {
          showMessage("Pin Challenge is unavailable right now", "error");
          return;
        }

        navigation.navigate("ChallengeDetails", {
          challengeObj: selectedGeoSite,
          experience_type: experience_type,
          coolDown: {
            coolDownFinished: coolDownFinished,
            coolDownHoursText: coolDownHoursText,
          },
          checkIns: myCheckInsText,
        });

        break;
    }
  };

  const navigateButtonHandler = async () => {
    // Open external navigation app
    if (!selectedGeoSite?.lat_long?.coordinates?.length) {
      return;
    }

    const lat = selectedGeoSite?.lat_long?.coordinates[1];
    const long = selectedGeoSite?.lat_long?.coordinates[0];
    showLocation({
      latitude: lat,
      longitude: long,
      alwaysIncludeGoogle: true,
      appsWhiteList: ["apple-maps", "google-maps", "waze"],
    }).then(value => {
      if (value) {
        setTimeout(() => {
          skipNavigationButtonHandler();
        }, 2000);
      }
    });

    // NOTE: Keeping for reference
    // navigation.navigate("GeoArSiteNavigation", {
    //   experience_type,
    //   coolDown: {
    //     coolDownFinished: coolDownFinished,
    //     coolDownHoursText: coolDownHoursText,
    //   },
    //   checkIns: myCheckInsText,
    //   mapMode: MAP_MODE.DRIVING,
    //   starsChallenge: null,
    // });
  };

  const initialRegion = {
    latitude: selectedGeoSite.lat_long.coordinates[1],
    longitude: selectedGeoSite.lat_long.coordinates[0],
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  const full_bounds = getFullBounds();
  if (full_bounds) {
    initialRegion.latitudeDelta = Number(full_bounds.maxLat - full_bounds.minLat);
    initialRegion.longitudeDelta = Number(full_bounds.maxLng - full_bounds.minLng);
  }

  useEffect(() => {
    getAddress();
    geoARSitesStars();

    // Cool Down info
    checkIfChallengeIsDone();

    // My Check-ins info
    const usersCheckIns = processMyCheckIns(
      selectedGeoSite?.user_attempts,
      selectedGeoSite?.challenge_attempt
    );
    setMyCheckInsText(usersCheckIns);
  }, []);

  useEffect(() => {
    setStarCounts();
  }, [selectedGeoARSiteStars]);

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: selectedDestination.name,
          style: [_styles.heading],
        }}
        backgroundColor="transparent"
      />

      {isLoading && <ActivityIndicator size="large" />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            width: "100%",
            position: "relative",
            height: 160,
            borderRadius: 16,
            marginVertical: 15,
            overflow: "hidden",
          }}
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
            initialRegion={initialRegion}
          >
            <Marker
              coordinate={{
                latitude: selectedGeoSite.lat_long.coordinates[1],
                longitude: selectedGeoSite.lat_long.coordinates[0],
              }}
              title={selectedGeoSite.name}
              pinColor={pinColor}
              tracksViewChanges={tracksViewChanges}
            >
              {useCustomMarkers && (
                <View
                  style={{
                    width: 30,
                    height: 30,
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <Image
                    resizeMode="cover"
                    style={{
                      width: 19,
                      height: 19,
                      position: "absolute",
                      top: 2.5,
                      borderRadius: 100,
                    }}
                    source={{uri: selectedGeoSite?.localFilePath}}
                  />
                  <MarkerIcon color={selectedGeoSite?.category?.color} />
                </View>
              )}
            </Marker>
          </MapView>
        </View>

        <View
          style={{
            flexDirection: "row",
            paddingVertical: 20,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={_styles.site_d_header_text}>Site Details</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <CloseBIcon style={{height: 32, width: 32}} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            backgroundColor: "#131422",
            borderRadius: 16,
            padding: 20,
            marginBottom: 30,
          }}
        >
          <ImageBackground
            style={{
              width: "100%",
              height: 213,
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
            }}
            source={{uri: selectedGeoSite.image}}
            resizeMode="cover"
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
            {myCheckInsText && (
              <View
                style={{
                  position: "absolute",
                  top: 60,
                  right: 10,
                  backgroundColor: "#fff",
                  opacity: 0.9,
                  borderRadius: 32,
                  flexDirection: "row",
                  paddingHorizontal: 16,
                  gap: 4,
                  alignItems: "center",
                  height: 40,
                }}
              >
                <Text style={{fontSize: 12, color: "black"}}>My Check-Ins:</Text>
                <Text style={{fontSize: 12, fontWeight: "bold", color: "purple"}}>
                  {myCheckInsText}
                </Text>
              </View>
            )}
            {coolDownHoursText && (
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  backgroundColor: "#fff",
                  opacity: 0.9,
                  borderRadius: 32,
                  flexDirection: "row",
                  paddingHorizontal: 16,
                  gap: 8,
                  alignItems: "center",
                  height: 40,
                }}
              >
                <Text
                  style={{fontSize: 12, color: "black"}}
                >{`${coolDownHoursText} cool down`}</Text>
                <Icon name="clockcircleo" family="antdesign" size={20} color="purple" />
              </View>
            )}
          </ImageBackground>
          <Text style={_styles.site_d_header}>{selectedGeoSite.name}</Text>
          <Text style={_styles.site_d_text}>{address}</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "flex-start",
              marginTop: 20,
              marginBottom: 30,
            }}
          >
            <NumericStatItem count={selectedGeoSite.check_ins} label="Check-ins" />
            <NumericStatItem count={starsCount} label="Stars" />
            <NumericStatItem
              count={selectedDestination.unique_ar_sites.length}
              label="AR Experiences"
            />
          </View>
          <RenderHTML
            contentWidth={width}
            tagsStyles={{
              p: {
                ...fontGroup.nunitoRegular,
                lineHeight: 19.1,
                color: "#fff",
                fontSize: FontSizes.S12,
              },
              strong: {
                ...fontGroup.nunitoRegular,
                lineHeight: 19.1,
                color: "#fff",
                fontSize: FontSizes.S14,
              },
              span: {
                ...fontGroup.nunitoRegular,
                lineHeight: 19.1,
                color: "#fff",
                fontSize: FontSizes.S12,
              },
            }}
            source={{
              html: `${selectedGeoSite?.description?.toString().replaceAll("#000000", "#fff")}`,
            }}
          />
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowProTips(true)}
              style={{
                justifyContent: "center",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Icon
                name={"info"}
                family="feather"
                color={theme.lightColors?.inputBlue}
                size={32}
                // style={styles.verificationIcon}
              />
              {/* <ProTipIcon style={{ width: 24, height: 24 }} source={ProTipIcon} /> */}
              {/* <Text style={_styles.protip_text}>
                {selectedGeoSite?.category?.id ? "Useful\nLinks" : "Pro Tips"}
              </Text> */}
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                gap: 16,
                alignItems: "center",
              }}
            >
              <AppButton
                onPress={navigateButtonHandler}
                buttonStyle={_styles.buttonStyle}
                titleStyle={{fontWeight: "bold"}}
                containerStyle={_styles.buttonContainerStyle}
                title={"Navigate"}
                loading={isLoading}
              />

              <AppButton
                onPress={skipNavigationButtonHandler}
                buttonStyle={_styles.buttonStyle}
                titleStyle={{fontWeight: "bold"}}
                containerStyle={_styles.buttonContainerStyle}
                title={"Geo Check-In"}
                loading={isLoading}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      {showProTips && InfoView()}
    </BackgroundWithImage>
  );
};

export default GeoArSiteDetails;
