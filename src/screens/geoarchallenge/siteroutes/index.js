import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";
import { useNavigation } from "@react-navigation/native";
import CarIcon from "../../../assets/geoar/car.svg";
import RoadIcon from "../../../assets/geoar/road.svg";
import TimeIcon from "../../../assets/geoar/time.svg";
import { useSelector } from "react-redux";
import { AppButton } from "../../../components";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MarkerIcon from "../../../assets/geoar/marker_img.svg";
import MapViewDirections from "react-native-maps-directions";
import { convertKilometersToMiles } from "../../../util/helpers";
import Strings from "../../../constants/Strings";
import { getBounds, getCenterOfBounds } from "../../../util/LocationLib";
import { GeolocationContext } from "../../../GeolocationProvider";

const GeoArSiteRoutes = ({ route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [mileDistance, setMileDistance] = useState(0);
  const [durationMins, setDurationMins] = useState(0);
  const [walkDurationMins, setWalkDurationMins] = useState(0);
  const [routes, setRoutes] = useState(0);

  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);
  const { userLocation } = useContext(GeolocationContext);

  const navigation = useNavigation();
  const mapView = useRef();

  const latitude = userLocation?.latitude;
  const longitude = userLocation?.longitude;

  const starChallengeObj = route.params?.starsChallenge;
  const isStarChallenge = !!starChallengeObj?.id;

  const getFullBounds = () => {
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

  const getFullCenter = () => {
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

  const minOrHoursWalkDriving = (walkDurationMins, mode) => {
    if (walkDurationMins < 60) {
      return (
        <>
          {Math.round(walkDurationMins)} <Text style={styles.durationText}>mins ({mode})</Text>
        </>
      );
    } else if (walkDurationMins >= 60) {
      var hours = Math.floor(walkDurationMins / 60);
      return (
        <>
          {Math.round(hours)} <Text style={styles.durationText}>hours ({mode})</Text>
        </>
      );
    }
  };

  let screenTitle = "";
  let regionCoordinates = { lat: 0, lon: 0 };
  let markerSiteData = {
    lat: 0,
    lon: 0,
    title: "",
    icon: null,
  };

  if (isStarChallenge) {
    screenTitle = "Navigate to the Star";
    regionCoordinates = {
      lat: starChallengeObj?.location?.coordinates[1],
      lon: starChallengeObj?.location?.coordinates[0],
    };
    markerSiteData = {
      lat: starChallengeObj?.location?.coordinates[1],
      lon: starChallengeObj?.location?.coordinates[0],
      title: "",
      icon: <MarkerIcon />, // TODO: Update to a cicle icon
    };
  } else {
    screenTitle = selectedGeoSite.name;
    regionCoordinates = {
      lat: selectedGeoSite.lat_long.coordinates[1],
      lon: selectedGeoSite.lat_long.coordinates[0],
    };
    markerSiteData = {
      lat: selectedGeoSite.lat_long.coordinates[1],
      lon: selectedGeoSite.lat_long.coordinates[0],
      title: selectedGeoSite.name,
      icon: <MarkerIcon />,
    };
  }

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

  const renderMapViewDirections = mode => {
    return (
      <MapViewDirections
        origin={{
          latitude: latitude,
          longitude: longitude,
        }}
        precision={"high"}
        timePrecision={"now"}
        mode={mode}
        destination={{
          latitude: regionCoordinates.lat,
          longitude: regionCoordinates.lon,
        }}
        apikey={Strings.GOOGLE_PLACE_API_KEY}
        strokeWidth={mode === "DRIVING" ? 3 : 0}
        strokeColor="hotpink"
        optimizeWaypoints={true}
        onReady={result => {
          if (mode === "DRIVING") {
            setMileDistance(convertKilometersToMiles(result.distance));
            setDurationMins(result.duration);
            setRoutes(1);
          } else {
            setWalkDurationMins(result.duration);
            setRoutes(1);
          }
        }}
        onError={errorMessage => {
          console.error("GOT AN ERROR", errorMessage);
          setRoutes(0);
        }}
      />
    );
  };

  useEffect(() => {
    if (!!userLocation?.latitude && !!userLocation?.longitude) setIsLoading(false);
  }, [userLocation?.latitude, userLocation?.longitude]);

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: screenTitle,
          style: styles.heading,
        }}
        backgroundColor="transparent"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            ref={mapView}
            style={styles.map}
            initialRegion={initialRegion}
          >
            <Marker
              coordinate={{
                latitude: markerSiteData.lat,
                longitude: markerSiteData.lon,
              }}
              title={markerSiteData.title}
            >
              <View style={styles.markerIconContainer}>{markerSiteData.icon}</View>
            </Marker>

            {latitude && longitude && (
              <>
                <Marker
                  coordinate={{
                    latitude: latitude,
                    longitude: longitude,
                  }}
                  title={"Current Location"}
                >
                  <View style={styles.markerIconContainer}>
                    <MarkerIcon />
                  </View>
                </Marker>

                {renderMapViewDirections("DRIVING")}
                {renderMapViewDirections("WALKING")}
              </>
            )}
          </MapView>
        </View>

        <View style={styles.routesContainer}>
          <Text style={styles.siteHeader}>Routes</Text>
          <TouchableOpacity>
            <Text style={styles.routesCount}>{routes}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.routeDetailsContainer}>
          <View style={styles.routeRow}>
            <CarIcon style={styles.icon} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeTitle}>Route Available</Text>
              <Text style={styles.routeDescription}>
                Fastest route now due to traffic conditions
              </Text>
            </View>
          </View>
          <View style={styles.distanceRow}>
            <RoadIcon style={styles.smallIcon} />
            <Text style={styles.distanceLabel}>Distance</Text>
            <Text style={styles.distanceValue}>
              {mileDistance.toFixed(2)} <Text style={styles.distanceUnit}>miles</Text>
            </Text>
          </View>
          <View style={styles.distanceRow}>
            <TimeIcon style={styles.smallIcon} />
            <Text style={styles.distanceLabel}>Est. Time</Text>
            <Text style={styles.distanceValue}>
              {minOrHoursWalkDriving(durationMins, "Drive")} /{" "}
              {minOrHoursWalkDriving(walkDurationMins, "Walk")}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <AppButton
              onPress={() =>
                navigation.navigate("GeoArSiteNavigation", {
                  mapMode: "driving",
                  starsChallenge: starChallengeObj,
                })
              }
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              title={"Drive To Location"}
              loading={isLoading}
            />
          </View>
          <View style={styles.buttonContainer}>
            <AppButton
              onPress={() =>
                navigation.navigate("GeoArSiteNavigation", {
                  mapMode: "walking",
                  starsChallenge: starChallengeObj,
                })
              }
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              title={"Walk to Location"}
              loading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </BackgroundWithImage>
  );
};

export default GeoArSiteRoutes;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  heading: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    color: "#fff",
    marginTop: 5,
    textAlign: "center",
  },
  mapContainer: {
    width: "100%",
    position: "relative",
    height: 292,
    borderRadius: 16,
    overflow: "hidden",
  },
  map: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  markerIconContainer: {
    width: 30,
    height: 30,
  },
  routesContainer: {
    flexDirection: "row",
    paddingVertical: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  siteHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  routesCount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#C881F0",
    textAlign: "center",
  },
  routeDetailsContainer: {
    backgroundColor: "#131422",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 24,
    height: 24,
  },
  routeTextContainer: {
    marginHorizontal: 20,
    justifyContent: "flex-start",
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  routeDescription: {
    fontSize: 10,
    fontWeight: "400",
    color: "#C8DFFF",
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  smallIcon: {
    width: 20,
    height: 20,
  },
  distanceLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#fff",
    marginHorizontal: 8,
  },
  distanceValue: {
    fontSize: 14,
    fontWeight: "400",
    color: "#C881F0",
    marginHorizontal: 8,
  },
  distanceUnit: {
    fontSize: 10,
    fontWeight: "400",
  },
  buttonContainer: {
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  buttonStyle: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonContainerStyle: {
    width: "100%",
  },
  durationText: {
    fontSize: 10,
  },
});
