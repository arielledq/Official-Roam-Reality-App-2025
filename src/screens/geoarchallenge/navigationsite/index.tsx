import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSelector } from "react-redux";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import Sound from "react-native-sound";
import moment from "moment";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import Modal from "react-native-modal";
import Tts from "react-native-tts";
import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import { useNetInfo } from "@react-native-community/netinfo";
import MapboxGL from "@rnmapbox/maps";
import { Button } from "@rneui/themed";
import OfflineManager from "@rnmapbox/maps/src/modules/offline/offlineManager";
import Geolocation from "react-native-geolocation-service";

import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";

import { GeolocationContext } from "../../../GeolocationProvider";
import Config from "../../../config";
import { convertKilometersToMiles, showMessage } from "../../../util/helpers";
import {
  getDeviceCurrentLocation,
  getLocationDistance,
  hasLocationPermission,
} from "../../../util/LocationLib";
import mapCustomStyle from "../../../constants/MapCustomStyles";

// @ts-ignore
import HomeIcon from "../../../assets/geoar/home.svg";
// @ts-ignore
import CloseBIcon from "../../../assets/geoar/close-square.svg";
// @ts-ignore
import SkipIcon from "../../../assets/geoar/skipButton.svg";
// @ts-ignore
import MarkerIcon from "../../../assets/geoar/marker_img.svg";
// @ts-ignore
import Mute from "../../../assets/svg/mute.svg";
// @ts-ignore
import Unmute from "../../../assets/svg/unmute.svg";
// direction icons
// @ts-ignore
import TurnLeft from "../../../assets/svg/ManeuverMapsIcon/TurnLeft.svg";
// @ts-ignore
import TurnRight from "../../../assets/svg/ManeuverMapsIcon/TurnRight.svg";
// @ts-ignore
import TurnSlightLeft from "../../../assets/svg/ManeuverMapsIcon/TurnSlightLeft.svg";
// @ts-ignore
import TurnSlightRight from "../../../assets/svg/ManeuverMapsIcon/TurnSlightRight.svg";
// @ts-ignore
import TurnSharpLeft from "../../../assets/svg/ManeuverMapsIcon/TurnSharpLeft.svg";
// @ts-ignore
import TurnSharpRight from "../../../assets/svg/ManeuverMapsIcon/TurnSharpRight.svg";
// @ts-ignore
import CallMerge from "../../../assets/svg/ManeuverMapsIcon/CallMerge.svg";
// @ts-ignore
import UTurnLeft from "../../../assets/svg/ManeuverMapsIcon/UTurnLeft.svg";
// @ts-ignore
import UTurnRight from "../../../assets/svg/ManeuverMapsIcon/UTurnRight.svg";
// @ts-ignore
import Ferry from "../../../assets/svg/ManeuverMapsIcon/Ferry.svg";
// @ts-ignore
import ForkLeft from "../../../assets/svg/ManeuverMapsIcon/ForkLeft.svg";
// @ts-ignore
import ForkRight from "../../../assets/svg/ManeuverMapsIcon/ForkRight.svg";
// @ts-ignore
import KeepLeft from "../../../assets/svg/ManeuverMapsIcon/KeepLeft.svg";
// @ts-ignore
import KeepRight from "../../../assets/svg/ManeuverMapsIcon/KeepRight.svg";
// @ts-ignore
import Merge from "../../../assets/svg/ManeuverMapsIcon/Merge.svg";
// @ts-ignore
import RampLeft from "../../../assets/svg/ManeuverMapsIcon/RampLeft.svg";
// @ts-ignore
import RampRight from "../../../assets/svg/ManeuverMapsIcon/RampRight.svg";
// @ts-ignore
import RoundaboutLeft from "../../../assets/svg/ManeuverMapsIcon/RoundaboutLeft.svg";
// @ts-ignore
import RoundaboutRight from "../../../assets/svg/ManeuverMapsIcon/RoundaboutRight.svg";
// @ts-ignore
import Straight from "../../../assets/svg/ManeuverMapsIcon/Straight.svg";
// @ts-ignore
import MergeType from "../../../assets/svg/ManeuverMapsIcon/MergeType.svg";
// @ts-ignore
import Train from "../../../assets/svg/ManeuverMapsIcon/Train.svg";

import useStyles from "./styles";

const MARGIN_ARRIVAL_METERS = 50;
const NEXT_STEP_DISTANCE_MAP_HEADING_CHANGE = 20;
const NEXT_STEP_DISTANCE = 50;
const ZOOM_LEVEL_THRESHOLD = 15;

type StepResponse = {
  reached: boolean;
  html_instructions: string;
  index: any;
  end_location?: {
    lat: number;
    lng: number;
  };
  maneuver?: string;
};

type MapCoords = {
  coords: { latitude: number; longitude: number };
};

// Navigation Step 2
const GeoArSiteNavigation = () => {
  const [mileDistance, setMileDistance] = useState(0);
  const [durationMins, setDurationMins] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [location, setLocation] = useState<MapCoords | null>(null);
  const [routeInitialLocation, setRouteInitialLocation] = useState<MapCoords | null>(null);
  const [steps, setSteps] = useState<StepResponse[]>([]);
  const [mute, setMute] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepResponse | null>(null);
  const [currentRouteIcon, setCurrentRouteIcon] = useState<React.ReactNode | null>(null);
  const distanceFromStep = useRef(0);

  const selectedGeoSite = useSelector((state: any) => state.ar?.selectedGeoSite);
  const { userLocation } = useContext(GeolocationContext);
  const [latitude, setLatitude] = useState(userLocation?.latitude);
  const [longitude, setLongitude] = useState(userLocation?.longitude);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [router, setRoute] = useState<{} | null>(null);
  const [selectedStep, setSelectedStep] = useState<StepResponse | null>(null);

  const mapView = useRef(null);
  const mapViewRef = useRef(null);
  const watchIdRef = useRef(null);
  const compassHeading = useRef(0);
  const navigationMessage = useRef("");

  const route = useRoute();
  const _styles = useStyles();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const screenHeight = Dimensions.get("window").height;
  const { type, isConnected } = useNetInfo();

  // @ts-ignore
  const mapMode = route?.params?.mapMode;

  // @ts-ignore
  const starChallengeObj = route.params?.starsChallenge;
  const isStarChallenge = !!starChallengeObj?.id;

  let latitudeDestination;
  let longitudeDestination;

  if (isStarChallenge) {
    latitudeDestination = starChallengeObj?.location?.coordinates[1];
    longitudeDestination = starChallengeObj?.location?.coordinates[0];
  } else {
    latitudeDestination = selectedGeoSite?.lat_long?.coordinates[1];
    longitudeDestination = selectedGeoSite?.lat_long?.coordinates[0];
  }

  const calculatedEstimatedTime = (duration: string | number) => {
    const now = new Date();
    const calcTime = moment(now).add(duration, "minutes").format("hh:mm A");
    setEstimatedTime(calcTime);
  };

  const getFirstLocation = () => {
    const position = { coords: { latitude, longitude } };

    const endPosition = {
      latitude: latitudeDestination,
      longitude: longitudeDestination,
    };

    const headingValue = calculateBearing(
      position.coords.latitude,
      position.coords.longitude,
      endPosition.latitude,
      endPosition.longitude
    );

    compassHeading.current = headingValue;

    // @ts-ignore
    setLocation(position);
    // @ts-ignore
    setRouteInitialLocation(position);
  };

  function calculateBearing(startLat: number, startLng: number, endLat: number, endLng: number) {
    const startLatRad = (Math.PI / 180) * startLat;
    const startLngRad = (Math.PI / 180) * startLng;
    const endLatRad = (Math.PI / 180) * endLat;
    const endLngRad = (Math.PI / 180) * endLng;

    const dLng = endLngRad - startLngRad;

    const x = Math.sin(dLng) * Math.cos(endLatRad);
    const y =
      Math.cos(startLatRad) * Math.sin(endLatRad) -
      Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(dLng);

    let bearing = Math.atan2(x, y);
    bearing = (bearing * 180) / Math.PI; // Convert from radians to degrees
    bearing = (bearing + 360) % 360; // Normalize to 0-360

    return bearing;
  }

  const navigateToNextScreen = () => {
    //@ts-ignore
    navigation.replace("GeoArSiteArrived", { starsChallenge: starChallengeObj });
  };

  const minOrHoursWalkDriving = (walkDurationMins: number) => {
    if (walkDurationMins < 60) {
      return (
        <>
          {Math.round(walkDurationMins)} <Text style={{ fontSize: 14 }}>mins</Text>
        </>
      );
    } else if (walkDurationMins >= 60) {
      var hours = Math.floor(walkDurationMins / 60);
      return (
        <>
          {Math.round(hours)} <Text style={{ fontSize: 14 }}>hours</Text>
        </>
      );
    }
  };

  const playProximitySound = () => {
    if (mute) return;
    Tts.setDucking(true);
    Tts.speak("Calculating new route");
  };

  const closeHandler = () => {
    // navigation.replace('ChallengeSelection')
    navigation.goBack();
  };

  const adjustZoomLevel = (distance: number) => {
    if (distance < 3) return 19; // Close-up for short distances
    if (distance < 10) return 18; // Medium zoom for moderate distances
    return 17; // Wider view for long distances
  };

  const getCurrentStep = () => {
    const currentStep = steps.find(step => !step.reached);
    if (currentStep) {
      return currentStep;
    }
    return null;
  };

  const getNextStep = () => {
    const currentStep = steps.find(step => !step.reached);
    if (currentStep) {
      return steps?.[currentStep.index + 1];
    }
    return null;
  };

  const handleUserLocationChange = () => {
    const currentStepRes = getCurrentStep();
    const nextStepRes = getNextStep();

    if (currentStepRes) {
      if (currentStepRes !== currentStep) {
        setCurrentStep(currentStepRes);
        setSelectedStep(currentStepRes);
        if (currentStepRes.maneuver) {
          renderManeuverIcon(currentStepRes.maneuver);
        }
        distanceFromStep.current = 0;

        if (navigationMessage.current !== currentStepRes.html_instructions) {
          navigationMessage.current = currentStepRes.html_instructions;
          if (!mute) {
            Tts.setDucking(true);
            Tts.speak(navigationMessage.current);
          }
        }

        if (!currentStepRes?.end_location?.lat || !currentStepRes?.end_location?.lng) return;

        const headingValue = calculateBearing(
          latitude,
          longitude,
          currentStepRes?.end_location?.lat,
          currentStepRes?.end_location?.lng
        );

        // @ts-ignore
        mapView?.current?.animateCamera({
          center: { latitude, longitude },
          heading: headingValue,
          pitch: 60,
          zoom: 19,
        });

        compassHeading.current = headingValue;
      } else {
        if (zoomLevel > ZOOM_LEVEL_THRESHOLD) {
          // @ts-ignore
          mapView?.current?.animateCamera({
            center: {
              latitude,
              longitude,
              pitch: 60,
              zoom: 19,
              heading: compassHeading.current,
            },
          });
        }
      }

      if (!currentStepRes?.end_location?.lat || !currentStepRes?.end_location?.lng) return;

      const distanceFromNextStep = getLocationDistance(
        { latitude, longitude },
        {
          latitude: currentStepRes?.end_location?.lat,
          longitude: currentStepRes?.end_location?.lng,
        }
      );

      if (distanceFromStep.current === 0) {
        distanceFromStep.current = distanceFromNextStep;
      }

      const difference = distanceFromNextStep - distanceFromStep.current;

      // Check if user is off route
      if (difference > MARGIN_ARRIVAL_METERS) {
        playProximitySound();
        // @ts-ignore
        mapView.current.animateCamera({
          center: { latitude, longitude },
          heading: compassHeading.current,
          pitch: 60,
          zoom: 19,
        });

        setRouteInitialLocation({ coords: { latitude, longitude } });
      }

      // Check if user has reached next step
      if (distanceFromNextStep <= NEXT_STEP_DISTANCE_MAP_HEADING_CHANGE) {
        currentStepRes.reached = true;
      }

      if (nextStepRes && distanceFromNextStep <= NEXT_STEP_DISTANCE) {
        setSelectedStep(nextStepRes);
        if (nextStepRes.maneuver) {
          renderManeuverIcon(nextStepRes.maneuver);
        }

        if (!mute) {
          Tts.setDucking(true);
          Tts.speak(nextStepRes.html_instructions);
        }
      }
    }

    // Check distance from selected site
    const dis = getLocationDistance(
      { latitude, longitude },
      {
        latitude: selectedGeoSite.lat_long.coordinates[1],
        longitude: selectedGeoSite.lat_long.coordinates[0],
      }
    );

    if (dis < selectedGeoSite.check_in_site_radius) {
      // @ts-ignore
      navigation.replace("GeoArSiteArrived");
      return;
    }
  };

  const calculateZoomLevel = (region: any) => {
    const zoom = Math.log2(360 / region.longitudeDelta);
    return Math.round(zoom);
  };

  const handleRegionChange = (region?: any) => {
    if (!region) return;
    const zoom = calculateZoomLevel(region);
    setZoomLevel(zoom);
  };

  const downloadOfflineRegion = async () => {
    // Setup bounding box for offline
    const lat1 = latitude;
    const lng1 = longitude;
    const lat2 = selectedGeoSite.lat_long.coordinates[1];
    const lng2 = selectedGeoSite.lat_long.coordinates[0];

    const south = Math.min(lat1, lat2);
    const north = Math.max(lat1, lat2);
    const west = Math.min(lng1, lng2);
    const east = Math.max(lng1, lng2);

    const packOptions = {
      name: `MyOfflinePack-${selectedGeoSite.name}`,
      styleURL: MapboxGL.StyleURL.Dark,
      bounds: [
        [west, south],
        [east, north],
      ],
      minZoom: 12,
      maxZoom: 18,
    };

    try {
      const existingPacks = await MapboxGL.offlineManager.getPacks();
      const hasPack = existingPacks.find(p => p.name === `MyOfflinePack-${selectedGeoSite.name}`);
      if (!hasPack) {
        await OfflineManager.createPack(
          // @ts-ignore
          packOptions,
          // progress callback
          (offlineRegion, status: any) => {
            if (
              status.completedResourceCount === status.requiredResourceCount &&
              status.completedTileCount === status.requiredTileCount
            ) {
              console.log("Offline download complete!");
            }
          },
          // error callback
          error => {
            console.log("Error creating offline pack", error);
          }
        );
      }
    } catch (err) {
      console.log("Error setting up offline pack", err);
    }
  };

  const mapBoxGetRoute = () => {
    const origin = `${longitude},${latitude}`;
    const destination = `${selectedGeoSite.lat_long.coordinates[0]},${selectedGeoSite.lat_long.coordinates[1]}`;
    const MBUrlBase = "https://api.mapbox.com/directions/v5/mapbox/";
    const MBUrlParams = `?geometries=geojson&steps=true&access_token=${Config.MAPBOX_PUBLIC_KEY}&overview=full`;
    const MBUrl = `${MBUrlBase}${mapMode.toLowerCase()}/${origin};${destination}${MBUrlParams}`;
    // Fetch route data from Mapbox Directions API
    fetch(MBUrl)
      .then(response => response.json())
      .then(data => {
        if (data?.routes?.length) {
          const routeLine = {
            type: "Feature",
            geometry: data.routes[0].geometry,
          };
          setRoute(routeLine);
        }
      })
      .catch(error => console.error(error));
  };

  const getLocationUpdates = async () => {
    const hasPermission = await hasLocationPermission();
    if (!hasPermission) return;

    // @ts-ignore
    watchIdRef.current = Geolocation.watchPosition(
      position => {
        // console.log("watchPosition", position);
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      error => {
        console.error(error);
      },
      {
        accuracy: { android: "high", ios: "best" },
        enableHighAccuracy: false,
        // @ts-ignore
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
        forceLocationManager: true,
        showLocationDialog: true,
      }
    );
  };

  const handleUserHeading = (event: any) => {
    const heading = event?.nativeEvent?.coordinate?.heading;
    if (heading && heading !== compassHeading.current) {
      compassHeading.current = heading;
      // @ts-ignore
      mapView.current.animateCamera({
        heading: heading,
      });
    }
  };

  const stopLocationUpdates = () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      Geolocation.stopObserving();
    }
  };

  useEffect(() => {
    handleUserLocationChange();
  }, [latitude, longitude, steps]);

  useEffect(() => {
    if (isFocused) {
      downloadOfflineRegion();
      getFirstLocation();
      activateKeepAwake();
      mapBoxGetRoute();
      getLocationUpdates();
    } else {
      deactivateKeepAwake();
      stopLocationUpdates();
    }
  }, [isFocused]);

  useEffect(() => {
    if (isConnected) handleRegionChange();
  }, [isConnected]);

  const renderManeuverIcon = (maneuver: string) => {
    switch (maneuver) {
      case "turn-left":
        setCurrentRouteIcon(<TurnLeft style={IconWidthHeight} />);
        break;
      case "turn-right":
        setCurrentRouteIcon(<TurnRight style={IconWidthHeight} />);
        break;
      case "turn-slight-left":
        setCurrentRouteIcon(<TurnSlightLeft style={IconWidthHeight} />);
        break;
      case "turn-slight-right":
        setCurrentRouteIcon(<TurnSlightRight style={IconWidthHeight} />);
        break;
      case "turn-sharp-left":
        setCurrentRouteIcon(<TurnSharpLeft style={IconWidthHeight} />);
        break;
      case "turn-sharp-right":
        setCurrentRouteIcon(<TurnSharpRight style={IconWidthHeight} />);
        break;
      case "uturn-left":
        setCurrentRouteIcon(<UTurnLeft style={IconWidthHeight} />);
        break;
      case "uturn-right":
        setCurrentRouteIcon(<UTurnRight style={IconWidthHeight} />);
        break;
      case "ferry":
        setCurrentRouteIcon(<Ferry style={IconWidthHeight} />);
        break;
      case "fork-left":
        setCurrentRouteIcon(<ForkLeft style={IconWidthHeight} />);
        break;
      case "fork-right":
        setCurrentRouteIcon(<ForkRight style={IconWidthHeight} />);
        break;
      case "keep-left":
        setCurrentRouteIcon(<KeepLeft style={IconWidthHeight} />);
        break;
      case "keep-right":
        setCurrentRouteIcon(<KeepRight style={IconWidthHeight} />);
        break;
      case "merge":
        setCurrentRouteIcon(<Merge style={IconWidthHeight} />);
        break;
      case "ramp-left":
        setCurrentRouteIcon(<RampLeft style={IconWidthHeight} />);
        break;
      case "ramp-right":
        setCurrentRouteIcon(<RampRight style={IconWidthHeight} />);
        break;
      case "roundabout-left":
        setCurrentRouteIcon(<RoundaboutLeft style={IconWidthHeight} />);
        break;
      case "roundabout-right":
        setCurrentRouteIcon(<RoundaboutRight style={IconWidthHeight} />);
        break;
      case "straight":
        setCurrentRouteIcon(<Straight style={IconWidthHeight} />);
        break;
      case "merge-type":
        setCurrentRouteIcon(<MergeType style={IconWidthHeight} />);
        break;
      case "train":
        setCurrentRouteIcon(<Train style={IconWidthHeight} />);
        break;
      default:
        setCurrentRouteIcon(null);
        break;
    }
  };

  return (
    <View style={_styles.mainContainer}>
      <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: "rgba(32, 33, 54, 0.94)",
            flexDirection: "row",
            flex: 1,
          }}
        >
          <View
            style={{
              width: currentRouteIcon ? "20%" : 0,
              height: screenHeight * 0.17,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {currentRouteIcon ? currentRouteIcon : ""}
          </View>
          <View
            style={{
              width: currentRouteIcon ? "80%" : "100%",
              height: screenHeight * 0.17,
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: currentRouteIcon ? 0 : 20,
              paddingRight: 20,
              paddingTop: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: "white",
                lineHeight: 22,
              }}
            >
              {selectedStep ? selectedStep?.html_instructions : "Loading..."}
            </Text>
          </View>
        </View>
        <View
          style={{
            position: "relative",
            height: screenHeight * 0.73,
            overflow: "hidden",
            flex: 1,
          }}
        >
          {isConnected && (
            <MapView
              customMapStyle={mapCustomStyle}
              provider={PROVIDER_GOOGLE}
              followsUserLocation
              showsCompass={true}
              ref={mapView}
              zoomControlEnabled={true}
              style={{
                flex: 1,
              }}
              showsMyLocationButton={false}
              zoomEnabled={true}
              scrollEnabled={true}
              showsUserLocation
              initialRegion={{
                latitude: selectedGeoSite.lat_long.coordinates[1],
                longitude: selectedGeoSite.lat_long.coordinates[0],
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onRegionChangeComplete={handleRegionChange}
              onUserLocationChange={handleUserHeading}
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

              {location && location?.coords && (
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title={"Start Location"}
                >
                  <View style={{ width: 30, height: 30 }}>
                    <MarkerIcon />
                  </View>
                </Marker>
              )}
              {location && (
                <MapViewDirections
                  mode={mapMode}
                  // @ts-ignore
                  origin={routeInitialLocation?.coords}
                  destination={{
                    latitude: selectedGeoSite.lat_long.coordinates[1],
                    longitude: selectedGeoSite.lat_long.coordinates[0],
                  }}
                  apikey={Config.GEOCODER_API_KEY}
                  strokeWidth={8}
                  strokeColor="#C881F0"
                  optimizeWaypoints
                  onReady={(result: any) => {
                    const steps = result.legs[0].steps;
                    steps.map((step: StepResponse, index: number) => {
                      step.html_instructions = step.html_instructions.replace(/<[^>]*>?/gm, " ");
                      step.reached = false;
                      step.index = index;
                    });

                    setSteps(steps);
                    setMileDistance(convertKilometersToMiles(result.distance));
                    setDurationMins(result.duration);
                    calculatedEstimatedTime(result.duration);
                  }}
                  onStart={args => {
                    console.log("onStart", args);
                  }}
                  onError={error => console.error("MapViewDirections error:", error)}
                />
              )}
            </MapView>
          )}
          {!isConnected && (
            <MapboxGL.MapView
              ref={mapViewRef}
              style={{ flex: 1 }}
              styleURL={MapboxGL.StyleURL.Dark}
              logoEnabled={false}
              compassEnabled
              scaleBarEnabled={false}
              pitchEnabled
              rotateEnabled
            >
              {/* Center camera on first render or as needed: */}
              <MapboxGL.Camera
                // ref={mapViewRef}
                zoomLevel={18}
                pitch={60} // Sets the 3D pitch angle
                animationMode="flyTo"
                animationDuration={250}
                centerCoordinate={[longitude, latitude]}
              />

              {/* Marker for Destination */}
              <MapboxGL.PointAnnotation
                id="destinationMarker"
                coordinate={[
                  selectedGeoSite.lat_long.coordinates[0],
                  selectedGeoSite.lat_long.coordinates[1],
                ]}
              >
                <View style={{ width: 30, height: 30 }}>
                  <MarkerIcon />
                </View>
              </MapboxGL.PointAnnotation>

              {/* Marker for Current User Location (if you want to show user’s dot yourself) */}
              {latitude && longitude && (
                <MapboxGL.PointAnnotation id="startLocation" coordinate={[longitude, latitude]}>
                  <View style={{ width: 30, height: 30 }}>
                    <MarkerIcon />
                  </View>
                </MapboxGL.PointAnnotation>
              )}

              {router && (
                <>
                  {/* @ts-ignore */}
                  <MapboxGL.ShapeSource id="routeSource" shape={router}>
                    <MapboxGL.LineLayer
                      id="routeLayer"
                      style={{
                        lineColor: "#812fac",
                        lineWidth: 10,
                        lineJoin: "round",
                        lineCap: "round",
                      }}
                    />
                  </MapboxGL.ShapeSource>
                </>
              )}
            </MapboxGL.MapView>
          )}

          {!isConnected && (
            <View
              style={{
                position: "absolute",
                top: 20,
                left: 0,
                right: 0,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  backgroundColor: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  padding: 10,
                  borderRadius: 8,
                  margin: 10,
                }}
              >
                You are offline – using cached region.
              </Text>
            </View>
          )}
        </View>
        <View
          style={{
            backgroundColor: "#131422",
            paddingHorizontal: 20,
            alignItems: "center",
            justifyContent: "center",
            height: screenHeight * 0.1,
          }}
        >
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity onPress={navigateToNextScreen}>
              <CloseBIcon style={{ width: 32, height: 32 }} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMute(currState => {
                  const updatedState = !currState;
                  if (updatedState) {
                    Tts.stop();
                  }

                  return updatedState;
                });
              }}
            >
              {mute ? (
                <Mute style={{ width: 32, height: 32 }} />
              ) : (
                <Unmute style={{ width: 32, height: 32 }} />
              )}
            </TouchableOpacity>
            <View style={{ alignItems: "center", marginVertical: 8 }}>
              <Text style={_styles.site_distance_time_value_text}>
                {minOrHoursWalkDriving(durationMins)}
              </Text>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={[_styles.site_distance_time_text, { fontWeight: "bold" }]}>
                  {mileDistance.toFixed(2)} <Text style={{ fontSize: 10 }}>miles</Text>
                </Text>
                <Text style={_styles.site_distance_time_text}>.</Text>
                <Text style={_styles.site_distance_time_text}>{estimatedTime}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={navigateToNextScreen}>
              <SkipIcon style={{ width: 47, height: 35 }} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const IconWidthHeight = {
  width: 42,
  height: 42,
};

export default GeoArSiteNavigation;
