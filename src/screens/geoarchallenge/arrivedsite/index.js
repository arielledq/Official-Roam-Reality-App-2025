import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import AppHeader from "../../../components/header";
import mapCustomStyle from "../../../constants/MapCustomStyles";
import BackgroundWithImage from "../../../components/background";

import MoveForwardIcon from "../../../assets/geoar/large-step.svg";
import MarkerIcon from "../../../assets/geoar/marker_img.svg";
import CircleMarkerIcon from "../../../assets/geoar/circle_marker_img.svg";

import useStyles from "./styles";
import { pinColor, tracksViewChanges, useCustomMarkers } from "util/helpers";

// Navigation Step 3
const GeoArSiteArrived = ({ route }) => {
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);

  const _styles = useStyles();
  const navigation = useNavigation();

  const starChallengeObj = route.params?.starsChallenge;
  const isStarChallenge = !!starChallengeObj?.id;

  let latitude = 0;
  let longitude = 0;

  if (isStarChallenge) {
    latitude = starChallengeObj?.location?.coordinates[1];
    longitude = starChallengeObj?.location?.coordinates[0];
  } else if (selectedGeoSite) {
    latitude = selectedGeoSite?.lat_long?.coordinates[1];
    longitude = selectedGeoSite?.lat_long?.coordinates[0];
  }

  const arrivedButtonHandler = () => {
    if (isStarChallenge) {
      navigation.navigate("StarChallenge", { starChallenge: starChallengeObj });
    } else {
      navigation.navigate("ChallengeSelection");
    }
  };

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: "You have Arrived",
          style: [_styles.heading],
        }}
        backgroundColor="transparent"
      />

      <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            position: "relative",
            minHeight: 520,
            borderRadius: 16,
            overflow: "hidden",
            marginTop: 20,
            marginHorizontal: 30,
          }}
        >
          <MapView
            customMapStyle={mapCustomStyle}
            provider={PROVIDER_GOOGLE}
            style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
            zoomEnabled={true}
            scrollEnabled={true}
            initialRegion={{
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.0032,
              longitudeDelta: 0.0032,
            }}
          >
            <Marker
              coordinate={{
                latitude: latitude,
                longitude: longitude,
              }}
              pinColor={pinColor}
              tracksViewChanges={tracksViewChanges}
            >
              {useCustomMarkers && (
                <View style={{ width: 30, height: 30 }}>
                  {isStarChallenge ? <CircleMarkerIcon /> : <MarkerIcon />}
                </View>
              )}
            </Marker>
          </MapView>
        </View>
        <TouchableOpacity
          onPress={arrivedButtonHandler}
          style={{
            backgroundColor: "#131422",
            borderRadius: 16,
            padding: 20,
            paddingBottom: 20,
            marginVertical: 20,
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <View style={{ flex: 1, marginEnd: 12 }}>
            <Text style={_styles.arrivedText}>Arrived</Text>
            <Text style={_styles.exploringText}>Begin exploring</Text>
            {!isStarChallenge && (
              <Text style={_styles.infoText}>
                Explore with your camera to find Augmented Reality Experiences at this site!
                Remember to Geo-Check in anywhere you go!
              </Text>
            )}
          </View>
          <View>
            <MoveForwardIcon style={{ width: 56, height: 56 }} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </BackgroundWithImage>
  );
};

export default GeoArSiteArrived;
