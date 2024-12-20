import React, { useState } from "react";

import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";
import MoveForwardIcon from "../../../assets/geoar/large-step.svg";
import { useSelector } from "react-redux";
import useStyles from "./styles";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import MarkerIcon from "../../../assets/geoar/marker_img.svg";
import mapCustomStyle from "../../../constants/MapCustomStyles";

const GeoArSiteArrived = ({}) => {
  const _styles = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: "You have Arrived",
          style: [_styles.heading],
        }}
        backgroundColor="transparent"
      />

      {isLoading && <ActivityIndicator size="large" />}
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
            showsUserLocation={Platform.OS === "ios"}
            initialRegion={{
              latitude: selectedGeoSite.lat_long.coordinates[1],
              longitude: selectedGeoSite.lat_long.coordinates[0],
              latitudeDelta: 0.0032,
              longitudeDelta: 0.0032,
            }}
          >
            <Marker
              coordinate={{
                latitude: selectedGeoSite.lat_long.coordinates[1],
                longitude: selectedGeoSite.lat_long.coordinates[0],
              }}
              title={selectedGeoSite.name}
            >
              <View style={{ width: 30, height: 30 }}>
                <MarkerIcon />
              </View>
            </Marker>
          </MapView>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("ChallengeSelection")}
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
            <Text style={_styles.infoText}>
              Explore with your camera to find Augmented Reality Experiences at this site! Remember
              to Geo-Check in anywhere you go!
            </Text>
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
