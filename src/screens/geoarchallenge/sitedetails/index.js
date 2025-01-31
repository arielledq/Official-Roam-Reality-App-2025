import React, { useEffect, useState } from "react";

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
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import CloseBIcon from "../../../assets/geoar/close-square.svg";
import ProTipIcon from "../../../assets/geoar/pro-tip.svg";
import GradientDownPNG from "../../../assets/geoar/gradient_down.png";
import Geocoder from "react-native-geocoding";

import { useDispatch, useSelector } from "react-redux";
import useStyles from "./styles";
import { width } from "../../../util/AppDimensions";
import { AppButton } from "../../../components";
import RenderHTML from "react-native-render-html";
import { FontSizes, fontGroup } from "../../../util/FontUtils";
import { updateSelectedGeoARSiteStars } from "../../../redux/AR";
import { checkUniqueARChallengeDoneAPI, getAllARSitesStars } from "../../../network";
import { getBounds, getCenterOfBounds } from "../../../util/LocationLib";
import NumericStatItem from "../../../components/NumericStatItem";
import MarkerIcon from "components/marker";
import { pinColor, tracksViewChanges, useCustomMarkers } from "util/helpers";
import Icon from "components/Icon";

const GeoArSiteDetails = ({ route }) => {
  const experience_type = route.params?.experience_type;

  const [isLoading, setIsLoading] = useState(false);
  const [showProTips, setShowProTips] = useState(false);
  const [address, setAddress] = useState(null);
  const [starsCount, setStarsCount] = useState(0);
  const [coolDownFinished, setCoolDownFinished] = useState(false);
  const [coolDownHoursText, setCoolDownHoursText] = useState("");

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
          const timeString = res?.message?.remaining;
          // Split the string into hours, minutes, seconds, and milliseconds
          const [hours, minutes, seconds] = timeString.split(/[:.]/);

          // Convert to a Date object (assuming today's date)
          const date = new Date();
          date.setHours(hours, minutes, seconds);

          // Extract the time in hours (24-hour format)
          const hoursOnly = date.getHours();
          const minutesOnly = date.getMinutes();
          const secondsOnly = date.getSeconds();

          // setCoolDownHours(hoursOnly);

          let coolDownHasFinished = false;
          if (hoursOnly === 0 && minutesOnly === 0 && secondsOnly === 0) {
            coolDownHasFinished = true;
            setCoolDownFinished(coolDownHasFinished);
          }

          let remainingText = "";

          if (hoursOnly >= 1) {
            remainingText = `${hoursOnly}h`;
          } else {
            remainingText = `<1h`;
          }
          if (coolDownHasFinished) {
            remainingText = `0h`;
          }
          setCoolDownHoursText(remainingText);
        }
        // if (res.errorStatus == 403) {
        //   setIsChallengeDone(true);
        // } else {
        //   setIsChallengeDone(false);
        // }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // console.log("coolDownHours", coolDownHours, coolDownFinished);

  const getAddress = () => {
    if (selectedGeoSite.address_text != "") {
      setAddress(selectedGeoSite.address_text);
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
    getAllARSitesStars({ id: selectedGeoSite.id })
      .then(res => {
        if (res.status == 1) {
          dispatch(updateSelectedGeoARSiteStars(res.data));
        }
      })
      .finally(() => {});
  };

  const setStarCounts = () => {
    setStarsCount(selectedGeoARSiteStars?.length);
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
            <ProTipIcon style={{ width: 24, height: 24 }} source={ProTipIcon} />
            <Text style={_styles.protip_text}>
              {selectedGeoSite?.category?.id ? "Useful Links" : "Pro Tips"}
            </Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, width: "100%", padding: 24 }}
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
              html: `${selectedGeoSite?.pro_tips.toString().replaceAll("#000000", "#fff")}}`,
            }}
          />
        </ScrollView>
        <View style={{ width: "100%", paddingHorizontal: 24 }}>
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
          arrayPoints.push({ latitude: point[1], longitude: point[0] });
        }
      }
      const bounds = getBounds(arrayPoints);
      return bounds;
    } else {
      return null;
    }
  };

  const getFullCenter = _ => {
    if (selectedGeoSite.geo_site_border) {
      let arrayPoints = [];
      for (let i = 0; i < selectedGeoSite.geo_site_border.coordinates.length; i++) {
        const points = selectedGeoSite.geo_site_border.coordinates[i];
        for (let j = 0; j < points.length; j++) {
          const point = points[j];
          arrayPoints.push({ latitude: point[1], longitude: point[0] });
        }
      }
      const latitude_longitude = getCenterOfBounds(arrayPoints);
      return latitude_longitude;
    } else {
      return null;
    }
  };

  const letsRoamButtonHandler = async () => {
    // INFO: Commented out temporarily
    // try {
    //   const metadata = {
    //     destinationId: selectedDestination?.id,
    //   }
    //   await sendRoamingNotification({
    //     metadata: metadata,
    //   })
    // } catch (error) {
    //   console.error('There was an error sending the notification to friends:', error)
    // }

    navigation.navigate("GeoArSiteRoutes", {
      experience_type,
      coolDown: {
        coolDownFinished,
        coolDownHoursText,
      },
      checkIns: "",
    });
  };

  const initialRegion = {
    latitude: selectedGeoSite.lat_long.coordinates[1],
    longitude: selectedGeoSite.lat_long.coordinates[0],
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  const full_latitude_longitude = getFullCenter();
  const full_bounds = getFullBounds();
  if (full_bounds) {
    initialRegion.latitudeDelta = Number(full_bounds.maxLat - full_bounds.minLat);
    initialRegion.longitudeDelta = Number(full_bounds.maxLng - full_bounds.minLng);
  }
  if (full_latitude_longitude) {
    initialRegion.latitude = Number(full_latitude_longitude.latitude);
    initialRegion.longitude = Number(full_latitude_longitude.longitude);
  }

  useEffect(() => {
    getAddress();
    geoARSitesStars();
    checkIfChallengeIsDone();
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
                <View style={{ width: 30, height: 30 }}>
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
            <CloseBIcon style={{ height: 32, width: 32 }} />
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
            source={{ uri: selectedGeoSite.image }}
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
            {/* <View
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
              <Text style={{ fontSize: 12, color: "black" }}>My Check-ins:</Text>
              <Text style={{ fontSize: 12, fontWeight: "bold", color: "purple" }}>1/3</Text>
            </View> */}
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
                style={{ fontSize: 12, color: "black" }}
              >{`${coolDownHoursText} cool down`}</Text>
              <Icon name="clockcircleo" family="antdesign" size={20} color="purple" />
            </View>
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
              <ProTipIcon style={{ width: 24, height: 24 }} source={ProTipIcon} />
              <Text style={_styles.protip_text}>
                {selectedGeoSite?.category?.id ? "Useful Links" : "Pro Tips"}
              </Text>
            </TouchableOpacity>
            <View>
              <AppButton
                onPress={letsRoamButtonHandler}
                buttonStyle={_styles.buttonStyle}
                titleStyle={{ fontWeight: "bold" }}
                containerStyle={_styles.buttonContainerStyle}
                title={"Let's Roam"}
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
