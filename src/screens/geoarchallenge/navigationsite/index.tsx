import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  // Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  // PermissionsAndroid,
} from "react-native";

import { useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import Sound from "react-native-sound";
// import MapboxGL from "@rnmapbox/maps";
import moment from "moment";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";

import { GeolocationContext } from "../../../GeolocationProvider";
import Config from "../../../config";
import { convertKilometersToMiles, showMessage } from "../../../util/helpers";
import {
  getLocationDistance,
  //  hasLocationPermission
} from "../../../util/LocationLib";
import mapCustomStyle from "../../../constants/MapCustomStyles";

// @ts-ignore
import HomeIcon from "../../../assets/geoar/home.svg";
// @ts-ignore
import CloseBIcon from "../../../assets/geoar/close-square.svg";
// @ts-ignore
import SkipIcon from "../../../assets/geoar/skip.svg";
// @ts-ignore
import MarkerIcon from "../../../assets/geoar/marker_img.svg";
// import CenterIcon from "../../../assets/Icons/CenterIcon.svg";

import useStyles from "./styles";

const MARGIN_ARRIVAL_METERS = 50;

// Navigation Step 2
const GeoArSiteNavigation = () => {
  const [mileDistance, setMileDistance] = useState(0);
  const [durationMins, setDurationMins] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [location, setLocation] = useState<{
    coords: { latitude: number; longitude: number };
  } | null>(null);
  // const [router, setRoute] = useState(null);
  // const [originMap, setOriginMap] = useState(null);
  // const [originMapPoint, setOriginMapPoint] = useState(null);
  // const [destinationMap, setDestinationMap] = useState(null);
  // const [path, setPath] = useState(null);
  // const [currentHeading, setCurrentHeading] = useState(0);
  // const [mapHeading, setMapHeading] = useState(0);
  // const [rerouting, setRerouting] = useState(false);
  // const [nextCoordinateS, setNextCoordinateS] = useState(null);
  const [hideRoute, setHideRoute] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    longitude: 0,
    latitude: 0,
    longitudeDelta: 0.004,
    latitudeDelta: 0.009,
  });
  const [routeInitialLocation, setRouteInitialLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);

  const selectedGeoSite = useSelector((state: any) => state.ar?.selectedGeoSite);
  const { userLocation } = useContext(GeolocationContext);
  const [latitude, setLatitude] = useState(userLocation?.latitude);
  const [longitude, setLongitude] = useState(userLocation?.longitude);

  const mapView = useRef(null);
  // const currentPathRef = useRef(null);
  // const nextCoordinateDistance = useRef(0);
  // const nextCoordinateRef = useRef(null);
  const compassHeading = useRef(0);

  const route = useRoute();
  const _styles = useStyles();
  const navigation = useNavigation();

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

    const currentRegion = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      latitudeDelta: 0.0032,
      longitudeDelta: 0.0032,
    };
    setMapRegion(currentRegion);

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
    setCurrentLocation(position);
    // @ts-ignore
    setRouteInitialLocation(position);
    if (mapView && mapView.current) {
      setTimeout(() => {
        // @ts-ignore
        mapView?.current?.animateCamera({
          center: position.coords,
          heading: compassHeading.current,
          zoom: 17,
        });
      }, 500);
    }

    // const initialHeading = calculateBearing(
    //   position.coords.latitude,
    //   position.coords.longitude,
    //   endPosition.latitude,
    //   endPosition.longitude
    // );
    // setCurrentHeading(initialHeading);

    // const origin = [position.coords.longitude, position.coords.latitude];

    // const destination = [longitudeDestination, latitudeDestination];

    // setOriginMap(origin);
    // setOriginMapPoint(origin);
    // setDestinationMap(destination);
    // setLocation(position);
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

  // function getDistance(lat1, lon1, lat2, lon2) {
  //   const R = 6371; // Radius of the Earth in kilometers
  //   const dLat = ((lat2 - lat1) * Math.PI) / 180;
  //   const dLon = ((lon2 - lon1) * Math.PI) / 180;
  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos((lat1 * Math.PI) / 180) *
  //       Math.cos((lat2 * Math.PI) / 180) *
  //       Math.sin(dLon / 2) *
  //       Math.sin(dLon / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   const distance = R * c; // Distance in kilometers
  //   return distance * 1000; // Convert to meters
  // }

  // function findNextCoordinate(currentLocation, coordinates) {
  //   if (!currentLocation || !currentPathRef.current) return false;

  //   let closestCoordinate = null;
  //   let closestDistance = Infinity;

  //   let lastVisitedIndex = -1;

  //   // Find the last index where `visited` is `true`
  //   for (let i = coordinates.length - 1; i >= 0; i--) {
  //     if (coordinates[i].visited === true) {
  //       lastVisitedIndex = i;
  //       break;
  //     }
  //   }

  //   // Mark all items before `lastVisitedIndex` where `visited` is `false` as `true`
  //   if (lastVisitedIndex !== -1) {
  //     for (let i = 0; i < lastVisitedIndex; i++) {
  //       if (coordinates[i].visited === false) {
  //         coordinates[i].visited = true;
  //       }
  //     }
  //   }

  //   const filteredCoordinates = coordinates.filter(coord => !coord.visited);

  //   for (let i = 0; i < filteredCoordinates?.length; i++) {
  //     const coord = filteredCoordinates[i];
  //     const distance = getDistance(
  //       currentLocation.latitude,
  //       currentLocation.longitude,
  //       coord["coordinates"][1], // Latitude
  //       coord["coordinates"][0] // Longitude
  //     );

  //     if (distance < closestDistance) {
  //       closestDistance = distance;
  //       closestCoordinate = coord;
  //     }
  //   }

  //   if (closestCoordinate && closestDistance <= 10) {
  //     closestCoordinate.visited = true;
  //   }

  //   return closestCoordinate;
  // }

  // const isOffRoute = (currentLocation, path, threshold) => {
  //   const nextCoordinate = findNextCoordinate(currentLocation, path);
  //   if (!nextCoordinate || rerouting || nextCoordinate.visited) return false;

  //   const distanceToPath = getDistance(
  //     currentLocation.latitude,
  //     currentLocation.longitude,
  //     nextCoordinate["coordinates"][1],
  //     nextCoordinate["coordinates"][0]
  //   );

  //   if (nextCoordinateRef.current === null || nextCoordinateRef.current !== nextCoordinate) {
  //     nextCoordinateDistance.current = 0;
  //   }

  //   if (nextCoordinateDistance.current === 0) {
  //     nextCoordinateDistance.current = distanceToPath;
  //     nextCoordinateRef.current = nextCoordinate;
  //     return false;
  //   }

  //   if (distanceToPath < nextCoordinateDistance.current) {
  //     nextCoordinateDistance.current = distanceToPath;
  //     nextCoordinateRef.current = nextCoordinate;
  //     return false;
  //   }
  //   if (
  //     distanceToPath > nextCoordinateDistance.current &&
  //     distanceToPath - nextCoordinateDistance.current > threshold
  //   ) {
  //     nextCoordinateDistance.current = 0;
  //     nextCoordinateRef.current = null;
  //     return true;
  //   }
  //   return false;
  // };

  const navigateToNextScreen = () => {
    // stopLocationUpdates();
    // navigation.replace('ChallengeSelection')
    //@ts-ignore
    navigation.replace("GeoArSiteArrived", { starsChallenge: starChallengeObj });
  };

  // const getLocationUpdates = async () => {
  //   const hasPermission = await hasLocationPermission();
  //   if (!hasPermission) {
  //     return;
  //   }

  //   const position = { coords: { latitude, longitude } };

  //   const dis = getLocationDistance(position.coords, {
  //     latitude: latitudeDestination,
  //     longitude: longitudeDestination,
  //   });

  //   if (rerouting) return;

  //   // Platform.OS === 'ios' ? 30 : 20

  //   let threshold = 20;

  //   if (mapMode === "driving") {
  //     threshold = 35;
  //   }

  //   if (isOffRoute(position.coords, currentPathRef.current, threshold)) {
  //     setOriginMap([position.coords.longitude, position.coords.latitude]);
  //     const heading = calculateBearing(
  //       position.coords.latitude,
  //       position.coords.longitude,
  //       currentPathRef.current[0]["coordinates"][1],
  //       currentPathRef.current[0]["coordinates"][0]
  //     );
  //     setCurrentHeading(heading);
  //     setRerouting(true);
  //     playProximitySound();
  //     setTimeout(() => {
  //       setRerouting(false);
  //     }, 1000);
  //     return;
  //   }

  //   const nextCoordinate = findNextCoordinate(position.coords, currentPathRef.current);

  //   if (nextCoordinate && nextCoordinateS !== nextCoordinate) {
  //     setNextCoordinateS(nextCoordinate);
  //     const heading = calculateBearing(
  //       position.coords.latitude,
  //       position.coords.longitude,
  //       nextCoordinate["coordinates"][1],
  //       nextCoordinate["coordinates"][0]
  //     );
  //     setCurrentHeading(heading);
  //   } else {
  //     if (Platform.OS === "ios") setCurrentHeading(mapHeading);
  //   }

  //   if (isStarChallenge) {
  //     if (dis < starChallengeObj?.geo_ar_star?.geo_site?.check_in_site_radius) {
  //       navigateToNextScreen();
  //       return;
  //     }
  //   } else {
  //     if (dis < selectedGeoSite.check_in_site_radius) {
  //       navigateToNextScreen();
  //       return;
  //     }
  //   }

  //   if (location && location.coords) {
  //     const lastLocationDistance = getLocationDistance(position.coords, location.coords);
  //     if (lastLocationDistance > 10) {
  //       setLocation(position);
  //     }
  //   }
  // };

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
    Sound.setCategory("Playback");
    let proximitySound = new Sound("record.mp3", Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.error("failed to load the sound", error);
      } else {
        proximitySound.play();
      }
    });
  };

  // const mapBoxGetRoute = () => {
  //   if (!originMap || !destinationMap) {
  //     return;
  //   }

  //   const origin = originMap.join(",");
  //   const destination = destinationMap.join(",");
  //   const MBUrlBase = "https://api.mapbox.com/directions/v5/mapbox/";
  //   const MBUrlParams = `?geometries=geojson&steps=true&access_token=${Config.MAPBOX_PUBLIC_KEY}&overview=full`;
  //   const MBUrl = `${MBUrlBase}${mapMode}/${origin};${destination}${MBUrlParams}`;

  //   // Fetch route data from Mapbox Directions API
  //   fetch(MBUrl)
  //     .then(response => response.json())
  //     .then(data => {
  //       if (data?.routes?.length) {
  //         const distance = data.routes[0].distance;
  //         const duration = data.routes[0].duration;
  //         setMileDistance(convertKilometersToMiles(distance / 1000));
  //         setDurationMins(duration / 60);
  //         calculatedEstimatedTime(duration / 60);
  //         const calculatedPath = data.routes[0].geometry.coordinates;
  //         const position = { coords: { latitude, longitude } };
  //         currentPathRef.current = calculatedPath.map((coord, index) => {
  //           if (index === 0) {
  //             const firstCoordinateDis = getLocationDistance(coord, position.coords);
  //             return {
  //               coordinates: coord,
  //               visited: firstCoordinateDis < 10,
  //             };
  //           } else {
  //             return {
  //               coordinates: coord,
  //               visited: false,
  //             };
  //           }
  //         });

  //         const routeLine = {
  //           type: "Feature",
  //           geometry: data.routes[0].geometry,
  //         };
  //         setRoute(routeLine);
  //       }
  //     })
  //     .catch(error => console.error(error));
  // };

  const closeHandler = () => {
    // navigation.replace('ChallengeSelection')
    navigation.goBack();
  };

  const adjustZoomLevel = (distance: number) => {
    if (distance < 3) return 19; // Close-up for short distances
    if (distance < 10) return 18; // Medium zoom for moderate distances
    return 17; // Wider view for long distances
  };

  const handleUserLocationChange = (event: any) => {
    // Ensure nativeEvent and coordinate are defined
    if (!event?.nativeEvent?.coordinate) {
      console.error("Location event is missing coordinate data");
      return;
    }

    // if (hideRoute) return;

    const userCoords = {
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude,
    };

    // @ts-ignore
    setCurrentLocation(userCoords);

    // Recalculate route if off-route
    if (routeCoords.length > 0) {
      const closestPoint = routeCoords.reduce((prev, curr) => {
        return getLocationDistance(curr, userCoords) < getLocationDistance(prev, userCoords)
          ? curr
          : prev;
      });

      const distanceFromRoute = getLocationDistance(userCoords, closestPoint);

      console.log("Distance from route:", distanceFromRoute);

      if (distanceFromRoute > MARGIN_ARRIVAL_METERS) {
        // setHideRoute(true);
        playProximitySound();

        // @ts-ignore
        // mapView?.current?.animateCamera({
        //   center: userCoords,
        //   heading: compassHeading.current,
        //   zoom: 17,
        // });
        // setTimeout(() => {
        //   setHideRoute(false);
        // }, 500);
        // @ts-ignore
        setRouteInitialLocation({ coords: userCoords });
      }

      const position = {
        coords: {
          latitude,
          longitude,
        },
      };

      const dis = getLocationDistance(position.coords, {
        latitude: selectedGeoSite.lat_long.coordinates[1],
        longitude: selectedGeoSite.lat_long.coordinates[0],
      });

      if (dis < selectedGeoSite.check_in_site_radius) {
        // @ts-ignore
        navigation.replace("GeoArSiteArrived");
        return;
      }

      const bearing = calculateBearing(
        userCoords.latitude,
        userCoords.longitude,
        selectedGeoSite.lat_long.coordinates[1],
        selectedGeoSite.lat_long.coordinates[0]
      );

      // const distance = getLocationDistance(userCoords, {
      //   latitude: selectedGeoSite.lat_long.coordinates[1],
      //   longitude: selectedGeoSite.lat_long.coordinates[0],
      // });
      // console.log("Distance from route outside if:", distance);

      const zoom = adjustZoomLevel(distanceFromRoute);

      // Animate camera to the new position
      if (mapView.current) {
        // @ts-ignore
        mapView.current?.animateCamera({
          center: userCoords,
          zoom: zoom,
          heading: bearing,
        });
      }
    }
  };

  // useEffect(() => {
  //   if (userLocation) {
  //     getLocationUpdates();
  //   }
  // }, [userLocation]);

  // useEffect(() => {
  //   mapBoxGetRoute();
  // }, [originMap, destinationMap]);

  useEffect(() => {
    getFirstLocation();
  }, []);

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      {/* {mapMode === "walking" && rerouting && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.8)",
              borderRadius: 16,
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 5,
              paddingTop: 5,
              justifyContent: "center",
              alignItems: "center",
              width: 250,
              height: 200,
            }}
          >
            <ActivityIndicator size="large" color={"#ffffff"} />
            <Text style={{ color: "#fff", fontSize: 20, marginTop: 20 }}>Calculating route...</Text>
          </View>
        </View>
      )} */}
      <AppHeader
        rightComponent={
          <TouchableOpacity onPress={navigateToNextScreen}>
            <SkipIcon style={{ width: 48, height: 36 }} />
          </TouchableOpacity>
        }
        centerComponent={{
          text: "Navigate to Site",
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
          {/* <TouchableOpacity
            onPress={() =>
              mapView.current?.setCamera({
                centerCoordinate: [longitude, latitude],
                heading: currentHeading,
                animationDuration: 500,
              })
            }
            style={{
              position: "absolute",
              bottom: 5,
              right: 5,
              zIndex: 1000,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderRadius: 25,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CenterIcon />
          </TouchableOpacity> */}
          {/* {originMapPoint && destinationMap && (
            <MapboxGL.MapView style={{ flex: 1 }} compassEnabled scaleBarEnabled={false}>
              <MapboxGL.Camera
                ref={mapView}
                zoomLevel={18}
                centerCoordinate={[longitude, latitude]}
                pitch={60} // Sets the 3D pitch angle
                animationMode="flyTo"
                animationDuration={250}
                heading={currentHeading}
              />
              <MapboxGL.UserLocation
                visible={true}
                minDisplacement={5}
                onUpdate={location => {
                  if (
                    location.coords.latitude !== latitude ||
                    location.coords.longitude !== longitude
                  ) {
                    const distance = getDistance(
                      location.coords.latitude,
                      location.coords.longitude,
                      latitude,
                      longitude
                    );
                    if (distance < 5) return;
                    setLatitude(location.coords.latitude);
                    setLongitude(location.coords.longitude);
                    if (Platform.OS === "ios") {
                      setMapHeading(location.coords.heading);
                    }
                  }
                }}
              />

              <MapboxGL.PointAnnotation id="currentLocation" coordinate={originMapPoint}>
                <MarkerIcon style={{ width: 25, height: 40 }} />
              </MapboxGL.PointAnnotation>
              <MapboxGL.PointAnnotation id="currentLocation" coordinate={destinationMap}>
                <MarkerIcon style={{ width: 25, height: 40 }} />
              </MapboxGL.PointAnnotation>

              {router && (
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
              )}
            </MapboxGL.MapView>
          )} */}
          <MapView
            customMapStyle={mapCustomStyle}
            provider={PROVIDER_GOOGLE}
            followsUserLocation
            showsCompass={true}
            ref={mapView}
            zoomControlEnabled={true}
            onUserLocationChange={handleUserLocationChange}
            // showsTraffic={true}
            // region={mapRegion}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
            showsMyLocationButton={true}
            zoomEnabled={true}
            scrollEnabled={true}
            showsUserLocation
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
                strokeColor="#01AFFC"
                optimizeWaypoints
                onReady={(result: any) => {
                  setRouteCoords(result?.coordinates);
                  setMileDistance(convertKilometersToMiles(result.distance));
                  setDurationMins(result.duration);
                  calculatedEstimatedTime(result.duration);
                }}
                onError={error => console.error("MapViewDirections error:", error)}
              />
            )}
          </MapView>
        </View>
        <View
          style={{
            backgroundColor: "#131422",
            borderRadius: 16,
            paddingHorizontal: 20,
            paddingBottom: 20,
            marginVertical: 20,
            alignItems: "center",
          }}
        >
          <HomeIcon style={{ width: 42, height: 4, marginBottom: 15, marginTop: 10 }} />
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity onPress={closeHandler}>
              <CloseBIcon style={{ width: 32, height: 32 }} />
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
                <Text style={_styles.site_distance_time_text}>
                  {mileDistance.toFixed(2)} <Text style={{ fontSize: 10 }}>miles</Text>
                </Text>
                <Text style={_styles.site_distance_time_text}>.</Text>
                <Text style={_styles.site_distance_time_text}>{estimatedTime}</Text>
              </View>
            </View>
            <View></View>
          </View>
        </View>
      </ScrollView>
    </BackgroundWithImage>
  );
};

export default GeoArSiteNavigation;
