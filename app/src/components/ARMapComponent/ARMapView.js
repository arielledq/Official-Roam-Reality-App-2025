import React, {useEffect, useCallback, useMemo, useState} from "react";
import {View, Text, StyleSheet, Platform, Alert, Image, Switch} from "react-native";
import MapView, {Callout, Marker, Polyline, PROVIDER_GOOGLE} from "react-native-maps";
import {darkMapStyle} from "./darkMapStyle";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import theme from "assets/theme";
import {TouchableOpacity} from "react-native";
import {Icon} from "@rneui/themed";
import {Icons} from "assets/Icons";
import {AR_MODES} from "constants";
import {getAllHunts, getAllScans, getUserFriendList} from "network";
import {getDistance} from "geolib";
import {ActivityIndicator} from "react-native";
import {FontSizes} from "util/FontUtils";
import RNFS from "react-native-fs";
import MarkerIcon from "components/marker";
import {useNavigation} from "@react-navigation/native";
import {pinColor} from "util/helpers";
import BouncingMarker from "./BouncingMarker";
import Config from "config";
import {useSharedValue} from "react-native-reanimated";
import CustomCompass from "./CustomCompass";
import ARProximityAlert from "components/ARProximityAlert";
import AppSwitch from "components/Switch";

// Memoized marker component to prevent unnecessary re-renders
const ARMarkerComponent = React.memo(
  ({
    item,
    onPress,
    anchor,
    centerOffset,
    widthPercentage,
    androidTrackViewChnages,
    showCallout,
    isCalloutVisible,
    markerRef,
  }) => {
    const handlePress = useCallback(() => {
      onPress(item);
    }, [onPress, item]);

    // Track if this specific marker should show callout
    const prevVisibleRef = React.useRef(isCalloutVisible);

    // Show callout programmatically when isCalloutVisible changes
    React.useEffect(() => {
      if (isCalloutVisible && !prevVisibleRef.current && markerRef?.current) {
        // Callout should be shown (transition from false to true)
        setTimeout(() => {
          if (markerRef?.current) {
            markerRef.current.showCallout();
          }
        }, 100); // Small delay to ensure marker is ready
      } else if (!isCalloutVisible && prevVisibleRef.current && markerRef?.current) {
        // Callout should be hidden (transition from true to false)
        markerRef.current.hideCallout();
      }

      // Update previous state
      prevVisibleRef.current = isCalloutVisible;
    }, [isCalloutVisible, markerRef]);

    return (
      <Marker
        ref={markerRef}
        key={`marker-${item.id}`}
        coordinate={{
          latitude: item.latitude,
          longitude: item.longitude,
        }}
        anchor={anchor}
        centerOffset={centerOffset}
        tracksViewChanges={Platform.OS == "android" ? androidTrackViewChnages : false}
        flat={true}
        onPress={handlePress}
      >
        <View
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.35,
            shadowRadius: 4.5,
            elevation: 8,
          }}
        >
          {item.isSelected ? (
            <BouncingMarker>
              <Icons.ArMarker width={widthPercentage} height={widthPercentage} />
            </BouncingMarker>
          ) : (
            <Icons.disbaledMarker width={widthPercentage} height={widthPercentage} />
          )}
        </View>

        <Callout tooltip={true}>
          <View
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: 10,
              borderRadius: 8,
              minWidth: 100,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {item.name || "AR Location"}
            </Text>
          </View>
        </Callout>
      </Marker>
    );
  }
);

// Memoized hunt point marker component with separate functionality
const HuntPointMarkerComponent = React.memo(
  ({
    item,
    onPress,
    anchor,
    centerOffset,
    widthPercentage,
    androidTrackViewChnages,
    showCallout,
    isCalloutVisible,
    markerRef,
  }) => {
    const handlePress = useCallback(() => {
      onPress(item);
    }, [onPress, item]);

    // Track if this specific marker should show callout
    const prevVisibleRef = React.useRef(isCalloutVisible);

    // Show callout programmatically when isCalloutVisible changes
    React.useEffect(() => {
      if (isCalloutVisible && !prevVisibleRef.current && markerRef?.current) {
        // Callout should be shown (transition from false to true)
        setTimeout(() => {
          if (markerRef?.current) {
            markerRef.current.showCallout();
          }
        }, 100); // Small delay to ensure marker is ready
      } else if (!isCalloutVisible && prevVisibleRef.current && markerRef?.current) {
        // Callout should be hidden (transition from true to false)
        markerRef.current.hideCallout();
      }

      // Update previous state
      prevVisibleRef.current = isCalloutVisible;
    }, [isCalloutVisible, markerRef]);

    return (
      <Marker
        ref={markerRef}
        key={`hunt-point-${item.id}`}
        coordinate={{
          latitude: item.latitude,
          longitude: item.longitude,
        }}
        anchor={anchor}
        centerOffset={centerOffset}
        tracksViewChanges={Platform.OS == "android" ? androidTrackViewChnages : false}
        flat={true}
        onPress={handlePress}
      >
        <View
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.35,
            shadowRadius: 4.5,
            elevation: 8,
          }}
        >
          {item.isSelected ? (
            <BouncingMarker>
              <Icons.ArMarker width={widthPercentage} height={widthPercentage} />
            </BouncingMarker>
          ) : (
            <Icons.disbaledMarker width={widthPercentage} height={widthPercentage} />
          )}
        </View>

        <Callout tooltip={true}>
          <View
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: 10,
              borderRadius: 8,
              minWidth: 100,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {item.title || "Hunt Point"}
            </Text>
          </View>
        </Callout>
      </Marker>
    );
  }
);

const ARMapView = ({
  userLocation,
  validUserLocation,
  selectedMode,
  selectedSite,
  onSwitchToLiveView,
  refresh,
  sendRefreshSignal,
}) => {
  const [region, setRegion] = React.useState(null);
  const [lastMileLine, setLastMileLine] = useState([]);
  const [AllHunts, setAllHunts] = React.useState([]);
  const [androidTrackViewChnages, setAndroidTrackViewChanges] = useState(true);
  const [userLiveLocation, setUserLiveLocation] = React.useState(null);
  const [AllScans, setAllScans] = React.useState([]);
  const [polylineCoordinates, setPolylineCoordinates] = React.useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = React.useState(false);
  const [huntPoits, setHuntPoints] = React.useState([]);
  const [currentWalikngTime, setCurrentWalkingTime] = React.useState(null);
  const [currentDistance, setCurrentDistance] = React.useState(null);

  // State for tracking user movement and selected AR
  const [previousUserLocation, setPreviousUserLocation] = React.useState(null);
  const [friendImageStates, setFriendImageStates] = useState({});
  const [friendList, setFriendList] = React.useState([]);
  const [loadingCustomMarkers, setLoadingCustomMarkers] = React.useState(false);
  const [lastPolylineUpdateLocation, setLastPolylineUpdateLocation] = React.useState(null);
  const [selectedAR, setSelectedAR] = React.useState(null);
  const [selectedHuntPoint, setSelectedHuntPoint] = React.useState(null);
  const [visibleHuntPoints, setVisibleHuntPoints] = React.useState([]);

  // State to track if map should follow user (like Google Maps)
  const [isFollowingUser, setIsFollowingUser] = React.useState(true);

  // State for proximity alert
  const [showProximityAlert, setShowProximityAlert] = React.useState(false);

  // State for callout display (Scan Mode only)
  const [showCallout, setShowCallout] = React.useState(false);
  const [calloutMarkerId, setCalloutMarkerId] = React.useState(null);
  const calloutTimerRef = React.useRef(null);

  // State for showing/hiding friends
  const [showFriendsOnly, setShowFriendsOnly] = React.useState(false);

  // Compass heading state
  const heading = useSharedValue(0);

  const navigation = useNavigation();

  const mapRef = React.useRef(null);
  const markerRefs = React.useRef({}); // Store marker refs by ID
  const regionSetCounterRef = React.useRef(0); // Counter to track if region has been set
  const hasAutoZoomedRef = React.useRef(false); // Track if we've auto-zoomed for proximity
  const hasShownProximityAlertRef = React.useRef(false); // Track if we've shown proximity alert for current selection
  const currentSelectionIdRef = React.useRef(null); // Track the current selected item ID
  const MOVEMENT_THRESHOLD = 5; // meters

  useEffect(() => {
    if (refresh) {
      resetAll();
    }
  }, [refresh]);

  useEffect(() => {
    // Only set region once when component mounts and validUserLocation is available
    if (validUserLocation && regionSetCounterRef.current === 0) {
      const latitude = validUserLocation?.latitude;
      const longitude = validUserLocation?.longitude;

      setRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      // Increment counter to prevent further updates
      regionSetCounterRef.current = 1;
    }
  }, [validUserLocation]);

  useEffect(() => {
    getFriends();
  }, []);

  setTimeout(() => {
    setAndroidTrackViewChanges(false);
  }, 1000);

  // Reset counter when component unmounts
  useEffect(() => {
    return () => {
      regionSetCounterRef.current = 0;
      // Clean up callout timer on unmount
      if (calloutTimerRef.current) {
        clearTimeout(calloutTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation) {
      setUserLiveLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });

      // Only animate map to follow user if isFollowingUser is true
    }
  }, [userLocation]);

  // Monitor user location changes and update polyline when user moves significantly
  useEffect(() => {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) return;

    const currentLocation = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    };

    // Update previous location if this is the first location update
    if (!previousUserLocation) {
      setPreviousUserLocation(currentLocation);
      setLastPolylineUpdateLocation(currentLocation);
      return;
    }

    // Check if user has moved significantly
    const hasMovedSignificantly = hasUserMovedSignificantly(
      currentLocation,
      lastPolylineUpdateLocation
    );

    if (hasMovedSignificantly) {
      if (isFollowingUser && mapRef.current && userLocation.latitude && userLocation.longitude) {
        mapRef.current
          .getCamera()
          .then(currentCamera => {
            // Preserve the current zoom level (altitude) and pitch
            const newCamera = {
              center: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
              heading: userLocation.heading || 0, // Use the heading from watchPosition
              pitch: currentCamera.pitch || 0,
              altitude: currentCamera.altitude, // Preserve zoom level
            };

            // Smoothly animate to new position with heading
            mapRef.current.animateCamera(newCamera, {duration: 500});

            // Update the shared heading value for the compass
            heading.value = userLocation.heading || 0;
          })
          .catch(error => {
            console.error("Error getting camera:", error);
          });
      }

      // Check if we have a selected hunt point (takes priority)
      if (selectedHuntPoint) {
        updatePolylineForMovement(currentLocation, selectedHuntPoint);
        setLastPolylineUpdateLocation(currentLocation);
      } else if (selectedAR) {
        updatePolylineForMovement(currentLocation, selectedAR);
        setLastPolylineUpdateLocation(currentLocation);
      }
    }

    // Always update previous location
    setPreviousUserLocation(currentLocation);
  }, [
    userLocation,
    hasUserMovedSignificantly,
    selectedAR,
    lastPolylineUpdateLocation,
    updatePolylineForMovement,
    isFollowingUser,
  ]);

  // Auto-zoom when user is within 50m of selected target (AR in Scan Mode, Hunt Point in Hunt Mode)
  useEffect(() => {
    // Check if we have valid user location
    if (!userLiveLocation || !userLiveLocation.latitude || !userLiveLocation.longitude) {
      return;
    }

    // Determine the target to track based on the mode
    let targetCoords = null;
    let targetName = null;
    let targetId = null;

    if (selectedSite === AR_MODES.SCAN_MODE && selectedAR) {
      // In Scan Mode, track the selected AR
      targetCoords = {
        latitude: selectedAR.latitude,
        longitude: selectedAR.longitude,
      };
      targetName = selectedAR.name || "AR Location";
      targetId = `scan-${selectedAR.id}`;
    } else if (selectedSite === AR_MODES.HUNT_MODE && selectedHuntPoint) {
      // In Hunt Mode, track the selected hunt point (not the AR)
      targetCoords = {
        latitude: selectedHuntPoint.latitude,
        longitude: selectedHuntPoint.longitude,
      };
      targetName = selectedHuntPoint.title || "Hunt Point";
      targetId = `hunt-point-${selectedHuntPoint.id}`;
    } else {
      // No valid target to track
      return;
    }

    // Check if this is a new selection - reset the alert flag if so
    if (currentSelectionIdRef.current !== targetId) {
      currentSelectionIdRef.current = targetId;
      hasShownProximityAlertRef.current = false;
      hasAutoZoomedRef.current = false;
    }

    const userCoords = {
      latitude: userLiveLocation.latitude,
      longitude: userLiveLocation.longitude,
    };

    // Calculate distance to target
    const distanceToTarget = getDistance(userCoords, targetCoords);

    // If within 20 meters, zoom in to show both user and target clearly
    // Only show alert if we haven't shown it before for this selection
    if (distanceToTarget <= 20 && mapRef.current && !hasShownProximityAlertRef.current) {
      // Mark that we've auto-zoomed
      hasAutoZoomedRef.current = true;

      // Mark that we've shown the proximity alert for this selection
      hasShownProximityAlertRef.current = true;

      // Show proximity alert
      setShowProximityAlert(true);

      // Calculate the midpoint between user and target
      const midLat = (userLiveLocation.latitude + targetCoords.latitude) / 2;
      const midLng = (userLiveLocation.longitude + targetCoords.longitude) / 2;

      // Zoom IN with tight view - smaller delta = closer zoom
      // Using fixed small values for close-up view (like Google Maps near destination)
      const latDelta = 0.001; // Very tight zoom in
      const lngDelta = 0.001; // Very tight zoom in

      // Animate to the zoomed-in region
      mapRef.current.animateToRegion(
        {
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        },
        1000 // Smooth 1 second animation
      );
    }
  }, [userLiveLocation, selectedAR, selectedHuntPoint, selectedSite]);

  // Monitor user location and show/hide hunt points based on proximity (100m radius)
  useEffect(() => {
    if (
      !userLiveLocation ||
      !selectedAR ||
      selectedSite !== AR_MODES.HUNT_MODE ||
      huntPoits.length === 0
    ) {
      setVisibleHuntPoints([]);
      return;
    }

    const userCoords = {
      latitude: userLiveLocation.latitude,
      longitude: userLiveLocation.longitude,
    };

    const selectedARCoords = {
      latitude: selectedAR.latitude,
      longitude: selectedAR.longitude,
    };

    // Check if user is within 100m of the selected AR hunt
    const distanceToSelectedAR = getDistance(userCoords, selectedARCoords);

    if (distanceToSelectedAR <= 100) {
      // User is within 100m, show hunt points

      setVisibleHuntPoints(huntPoits);
    } else {
      setVisibleHuntPoints([]);
    }
  }, [userLiveLocation, selectedAR, huntPoits, selectedSite]);

  useEffect(() => {
    // Clear polyline when switching modes
    setPolylineCoordinates([]);
    // Clear walking time when switching modes
    setCurrentWalkingTime(null);
    // Clear distance when switching modes
    setCurrentDistance(null);
    // Reset location tracking when switching modes
    setPreviousUserLocation(null);
    setLastPolylineUpdateLocation(null);
    // Clear selected AR when switching modes
    setSelectedAR(null);
    // Clear hunt points and selected hunt point when switching modes
    setHuntPoints([]);
    setVisibleHuntPoints([]);
    setSelectedHuntPoint(null);
    // Reset auto-zoom flag when switching modes
    hasAutoZoomedRef.current = false;
    // Reset proximity alert tracking when switching modes
    hasShownProximityAlertRef.current = false;
    currentSelectionIdRef.current = null;
    // Clear callout when switching modes
    setShowCallout(false);
    setCalloutMarkerId(null);
    if (calloutTimerRef.current) {
      clearTimeout(calloutTimerRef.current);
    }

    if (selectedSite == AR_MODES.SCAN_MODE) {
      getScans();
      setAllHunts([]);
    }
    if (selectedSite == AR_MODES.HUNT_MODE) {
      getHunts();
      setAllScans([]);
    }
  }, [selectedSite]);
  const getScans = async () => {
    try {
      const result = await getAllScans();
      // Add isSelected property to each scan
      const scansWithSelection = (result?.data || []).map(scan => ({
        ...scan,
        isSelected: false,
      }));
      setAllScans(scansWithSelection);
    } catch (error) {}
  };

  const getHunts = async () => {
    try {
      // Placeholder for fetching hunts logic
      const result = await getAllHunts();

      // Add isSelected property to each hunt
      const huntsWithSelection = (result?.data || []).map(hunt => ({
        ...hunt,
        isSelected: false,
      }));
      setAllHunts(huntsWithSelection);
    } catch (error) {
      console.error("Error fetching hunts:", error);
    }
  };

  // Helper function to update selection state in arrays
  const updateMarkerSelection = (selectedId, isScansMode) => {
    if (isScansMode) {
      setAllScans(prevScans =>
        prevScans.map(scan => ({
          ...scan,
          isSelected: scan.id === selectedId,
        }))
      );
    } else {
      setAllHunts(prevHunts =>
        prevHunts.map(hunt => ({
          ...hunt,
          isSelected: hunt.id === selectedId,
        }))
      );
    }
  };

  // Function to check if user has moved significantly
  const hasUserMovedSignificantly = useCallback(
    (currentLocation, previousLocation) => {
      if (!currentLocation || !previousLocation) return false;

      const currentCoords = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      };

      const previousCoords = {
        latitude: previousLocation.latitude,
        longitude: previousLocation.longitude,
      };

      const distanceInMeters = getDistance(currentCoords, previousCoords);

      return distanceInMeters >= MOVEMENT_THRESHOLD;
    },
    [MOVEMENT_THRESHOLD]
  );

  const MARKER_WIDTH = 50;
  /** Marker's height */
  const MARKER_HEIGHT = 70; // marker height

  const getCenterOffsetForAnchor = (anchor, markerWidth, markerHeight) => ({
    x: markerWidth * 0.5 - markerWidth * anchor.x,
    y: markerHeight * 0.5 - markerHeight * anchor.y,
  });

  // Memoize anchor and centerOffset to prevent recalculation
  const ANCHOR = useMemo(() => ({x: 0.5, y: 0.5}), []);
  const CENTEROFFSET = useMemo(
    () => getCenterOffsetForAnchor(ANCHOR, MARKER_WIDTH, MARKER_HEIGHT),
    [ANCHOR]
  );

  const handleCurrentLocationPress = () => {
    if (validUserLocation && mapRef.current) {
      // Re-enable following mode (like Google Maps)
      setIsFollowingUser(true);

      // Get current camera settings to preserve zoom level
      mapRef.current
        .getCamera()
        .then(currentCamera => {
          const newCamera = {
            center: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
            heading: 0,
            pitch: 0,
            altitude: 5000, // Fallback altitude if needed
          };

          mapRef.current.animateCamera(newCamera, {duration: 1000});
          heading.value = userLocation.heading || 0;
        })
        .catch(error => {
          // Fallback to animateToRegion if getCamera fails
          mapRef.current.animateToRegion(
            {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            1000
          );
        });
    }
  };

  // Handle map region change to update compass heading
  const handleRegionChange = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      const camera = await mapRef.current.getCamera();
      if (camera && camera.heading !== undefined) {
        heading.value = camera.heading;
      }
    } catch (error) {
      // Silently handle error
    }
  }, [heading]);

  // Handle when user starts interacting with the map (pan, zoom, rotate)
  const handlePanDrag = useCallback(() => {
    // Disable following mode when user manually interacts (like Google Maps)
    setIsFollowingUser(false);
  }, []);

  // Reset compass rotation (reset map heading to 0)
  const resetCompassRotation = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.animateCamera({heading: 0}, {duration: 300});
    heading.value = 0;
  }, [heading]);

  const checkDistanceToMarker = (markerLat, markerLng) => {
    if (!userLiveLocation || !userLiveLocation.latitude || !userLiveLocation.longitude) {
      Alert.alert(
        "Location Error",
        "Unable to determine your current location. Please enable location services."
      );
      return false;
    }

    const userCoords = {
      latitude: userLiveLocation.latitude,
      longitude: userLiveLocation.longitude,
    };

    const markerCoords = {
      latitude: markerLat,
      longitude: markerLng,
    };

    // Calculate distance in meters
    const distanceInMeters = getDistance(userCoords, markerCoords);
    // Convert to kilometers
    const distanceInKm = distanceInMeters / 1000;

    // Check if within 5km radius
    if (distanceInKm <= 5) {
      return true;
    } else {
      Alert.alert(
        "Location Restriction",
        "You are not in the site area to select this AR. Please get within 5km of the location to access this content.",
        [{text: "OK"}]
      );
      return false;
    }
  };

  // Function to decode polyline from Google Directions API
  const decodePolyline = encoded => {
    let points = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  const getFriends = () => {
    setLoadingCustomMarkers(true);
    getUserFriendList()
      .then(async response => {
        if (response) {
          const friends = response?.data[0]?.friends || [];

          // Download and cache friend profile images
          const friendsWithLocalImages = await Promise.all(
            friends.map(async (friend, index) => {
              if (friend?.user_profile?.image) {
                try {
                  const url = friend.user_profile.image;
                  const fileName =
                    `friend_${friend.id}_${index}_` +
                    url.substring(url.lastIndexOf("/") + 1).split("?")[0];
                  const localFilePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

                  // Check if file already exists to avoid re-downloading
                  const fileExists = await RNFS.exists(localFilePath);

                  if (!fileExists) {
                    const downloadResult = await RNFS.downloadFile({
                      fromUrl: url,
                      toFile: localFilePath,
                      background: false,
                      discretionary: true,
                      cacheable: true,
                    }).promise;

                    if (downloadResult.statusCode === 200) {
                      const updatedLocalFilePath =
                        Platform.OS === "android" ? `file://${localFilePath}` : localFilePath;
                      return {
                        ...friend,
                        user_profile: {
                          ...friend.user_profile,
                          localImagePath: updatedLocalFilePath,
                        },
                      };
                    } else {
                      // Download failed, keep original
                      return friend;
                    }
                  } else {
                    // File exists, use cached version
                    const updatedLocalFilePath =
                      Platform.OS === "android" ? `file://${localFilePath}` : localFilePath;
                    return {
                      ...friend,
                      user_profile: {
                        ...friend.user_profile,
                        localImagePath: updatedLocalFilePath,
                      },
                    };
                  }
                } catch (error) {
                  console.error("Error downloading friend image:", error);
                  // Return original friend data if download fails
                  return friend;
                }
              } else {
                // No profile image, return as is
                return friend;
              }
            })
          );

          // Reset friend image states for new friends
          setFriendImageStates({});
          setFriendList(friendsWithLocalImages);
        }
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        setTimeout(() => {
          setLoadingCustomMarkers(false);
        }, 500);
      });
  };

  const fetchWalkingDirections = async (startLat, startLng, destLat, destLng) => {
    try {
      setIsLoadingRoute(true);

      // Enable the "Directions API" for your project
      const GOOGLE_MAPS_API_KEY = Config.GOOGLE_MAPS_API_KEY;

      if (GOOGLE_MAPS_API_KEY === null) {
        // Clear walking time and distance for fallback
        setCurrentWalkingTime(null);
        setCurrentDistance(null);
        // Fallback: create a simple straight line
        setPolylineCoordinates([
          {latitude: startLat, longitude: startLng},
          {latitude: destLat, longitude: destLng},
        ]);
        return;
      }

      const origin = `${startLat},${startLng}`;
      const destination = `${destLat},${destLng}`;

      // FETCH THE ROUTE
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.routes.length > 0) {
        const route = data.routes[0];
        const points = decodePolyline(route.overview_polyline.points);

        if (route.legs && route.legs.length > 0) {
          const leg = route.legs[0];
          const durationInSeconds = leg.duration.value;
          const durationInMinutes = Math.ceil(durationInSeconds / 60); // Convert to minutes and round up
          const distanceInMeters = leg.distance.value; // Distance in meters

          setCurrentWalkingTime(`${durationInMinutes} min`);

          // Format distance based on value
          if (distanceInMeters >= 1000) {
            const distanceInKm = (distanceInMeters / 1000).toFixed(1);
            setCurrentDistance(`${distanceInKm} km`);
          } else {
            setCurrentDistance(`${distanceInMeters} m`);
          }
        } else {
          console.error("Directions API error:", data.status);
          // Clear walking time and distance for fallback
          setCurrentWalkingTime(null);
          setCurrentDistance(null);
          // Fallback: create a simple straight line
          setPolylineCoordinates([
            {latitude: startLat, longitude: startLng},
            {latitude: destLat, longitude: destLng},
          ]);
        }

        // 1. Set the solid line (Road Path)
        setPolylineCoordinates(points);

        // 2. Create the "Last Mile" dotted line
        // Get the last point returned by Google (the road snap point)
        const lastRoadPoint = points[points.length - 1];

        setLastMileLine([
          lastRoadPoint, // Start at the curb
          {latitude: destLat, longitude: destLng}, // End at the AR site
        ]);
      } else {
        // Fallback: Just draw a straight line if Google fails entirely
        setPolylineCoordinates([]);
        setLastMileLine([
          {latitude: startLat, longitude: startLng},
          {latitude: destLat, longitude: destLng},
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Function to update polyline when user moves significantly
  const updatePolylineForMovement = useCallback(
    async (currentUserLocation, selectedAR) => {
      if (!currentUserLocation || !selectedAR) return;

      try {
        await fetchWalkingDirections(
          currentUserLocation.latitude,
          currentUserLocation.longitude,
          selectedAR.latitude,
          selectedAR.longitude
        );
      } catch (error) {
        console.error("Error updating polyline for movement:", error);
      }
    },
    [fetchWalkingDirections]
  );

  const onMarkerPress = useCallback(
    async site => {
      // Check if user is within 5km of the marker
      const isWithinRange = checkDistanceToMarker(site.latitude, site.longitude);

      if (isWithinRange) {
        // User is within range, proceed with marker functionality

        // Update marker selection state
        const isScansMode = selectedSite === AR_MODES.SCAN_MODE;
        console.log("isScansMode:", isScansMode);
        updateMarkerSelection(site.id, isScansMode);

        // Set the selected AR with all details
        setSelectedAR(site);

        // Clear any existing timer
        if (calloutTimerRef.current) {
          clearTimeout(calloutTimerRef.current);
          calloutTimerRef.current = null;
        }

        // First hide any existing callout
        setShowCallout(false);
        setCalloutMarkerId(null);

        // Then show the new callout after a brief delay
        setTimeout(() => {
          setShowCallout(true);
          setCalloutMarkerId(site.id);

          // Hide the callout after 10 seconds
          calloutTimerRef.current = setTimeout(() => {
            setShowCallout(false);
            setCalloutMarkerId(null);
            calloutTimerRef.current = null;
          }, 10000); // 10 seconds
        }, 150); // Brief delay to ensure previous callout is hidden

        // Reset auto-zoom flag for new AR selection
        hasAutoZoomedRef.current = false;

        setPolylineCoordinates([]);
        setCurrentWalkingTime(null);
        setCurrentDistance(null);

        if (selectedSite === AR_MODES.HUNT_MODE && site.star_points) {
          const starPoints = site.star_points.map(point => ({
            ...point,
            isSelected: false,
          }));
          setHuntPoints(starPoints);
        } else {
          // Clear hunt points for scan mode
          setHuntPoints([]);
          setVisibleHuntPoints([]);
        }

        if (userLiveLocation) {
          await fetchWalkingDirections(
            userLiveLocation.latitude,
            userLiveLocation.longitude,
            site.latitude,
            site.longitude
          );
        }
      }
    },
    [selectedSite, userLiveLocation]
  );

  // Separate function for handling hunt point presses
  const onHuntPointPress = useCallback(
    async huntPoint => {
      // Update selection state for hunt points
      setVisibleHuntPoints(prevPoints =>
        prevPoints.map(point => ({
          ...point,
          isSelected: point.id === huntPoint.id,
        }))
      );

      // Also update the main hunt points array
      setHuntPoints(prevPoints =>
        prevPoints.map(point => ({
          ...point,
          isSelected: point.id === huntPoint.id,
        }))
      );

      setAllHunts(prevHunts =>
        prevHunts.map(hunt => ({
          ...hunt,
          isSelected: false,
        }))
      );

      // Set selected hunt point
      setSelectedHuntPoint(huntPoint);

      // Clear any existing timer
      if (calloutTimerRef.current) {
        clearTimeout(calloutTimerRef.current);
        calloutTimerRef.current = null;
      }

      // First hide any existing callout
      setShowCallout(false);
      setCalloutMarkerId(null);

      // Then show the new callout after a brief delay
      setTimeout(() => {
        setShowCallout(true);
        setCalloutMarkerId(huntPoint.id);

        // Hide the callout after 10 seconds
        calloutTimerRef.current = setTimeout(() => {
          setShowCallout(false);
          setCalloutMarkerId(null);
          calloutTimerRef.current = null;
        }, 10000); // 10 seconds
      }, 150); // Brief delay to ensure previous callout is hidden

      // Clear any existing polyline and walking time
      setPolylineCoordinates([]);
      setCurrentWalkingTime(null);
      setCurrentDistance(null);

      // Draw polyline from user location to hunt point
      if (userLiveLocation) {
        await fetchWalkingDirections(
          userLiveLocation.latitude,
          userLiveLocation.longitude,
          huntPoint.latitude,
          huntPoint.longitude
        );
      }
    },
    [userLiveLocation, fetchWalkingDirections]
  );

  const f_markerView = o => {
    const friendHasLocation =
      !!o?.ar_user_profile_user?.current_location &&
      !!o?.ar_user_profile_user?.current_location?.coordinates?.length;

    if (friendHasLocation) {
      const friendLat = o?.ar_user_profile_user?.current_location.coordinates[1];
      const friendLong = o?.ar_user_profile_user?.current_location.coordinates[0];

      const hasUserImage = !!o?.user_profile?.image;
      const localImagePath = o?.user_profile?.localImagePath;
      const imageState = friendImageStates[o.id] || {loaded: false, error: false};
      return (
        <Marker
          key={o.id}
          coordinate={{
            latitude: friendLat,
            longitude: friendLong,
          }}
          title={o.name}
          onCalloutPress={() => {
            navigation.navigate("PublicProfile", {userData: o});
          }}
          pinColor={pinColor}
          tracksViewChanges={Platform.OS == "android" ? androidTrackViewChnages : false}
        >
          {Platform.OS === "ios" && (
            <Callout
              onPress={() => {
                navigation.navigate("PublicProfile", {userData: o});
              }}
              style={{
                backgroundColor: "#fff",
                minWidth: 100,
                alignItems: "center",
              }}
            >
              <Text>{o.name}</Text>
            </Callout>
          )}

          <View
            style={{
              width: widthPercentageToDP(10),
              height: widthPercentageToDP(10),
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <>
              {/* Always show placeholder first, then actual image when loaded */}
              <Image
                resizeMode="cover"
                style={{
                  width: widthPercentageToDP(6.5),
                  height: widthPercentageToDP(6.5),
                  position: "absolute",
                  top: 3,
                  borderRadius: 100,
                  zIndex: imageState.loaded && !imageState.error ? 998 : 999,
                  backgroundColor: "#fff",
                }}
                source={localImagePath ? {uri: localImagePath} : {uri: o?.user_profile?.image}}
              />
            </>
            <MarkerIcon
              color={theme.lightColors.green}
              width={widthPercentageToDP(10)}
              height={widthPercentageToDP(10)}
            />
          </View>
        </Marker>
      );
    }
  };

  const resetAll = () => {
    // Clear polyline when switching modes
    setPolylineCoordinates([]);
    setLastMileLine([]);

    // Clear walking time when switching modes
    setCurrentWalkingTime(null);

    // Clear distance when switching modes
    setCurrentDistance(null);

    // Reset location tracking when switching modes
    setPreviousUserLocation(null);
    setLastPolylineUpdateLocation(null);

    // Clear selected AR when switching modes
    setSelectedAR(null);

    // Clear hunt points and selected hunt point when switching modes
    setHuntPoints([]);
    setVisibleHuntPoints([]);
    setSelectedHuntPoint(null);

    // Reset all marker selections (but keep the data)
    setAllScans(prevScans =>
      prevScans.map(scan => ({
        ...scan,
        isSelected: false,
      }))
    );

    setAllHunts(prevHunts =>
      prevHunts.map(hunt => ({
        ...hunt,
        isSelected: false,
      }))
    );

    // Reset auto-zoom flag when switching modes
    hasAutoZoomedRef.current = false;

    // Reset proximity alert tracking when switching modes
    hasShownProximityAlertRef.current = false;
    currentSelectionIdRef.current = null;

    // Clear callout when switching modes
    setShowCallout(false);
    setCalloutMarkerId(null);
    if (calloutTimerRef.current) {
      clearTimeout(calloutTimerRef.current);
      calloutTimerRef.current = null;
    }

    // Reset following user mode
    setIsFollowingUser(true);

    // Hide proximity alert
    setShowProximityAlert(false);
    sendRefreshSignal();
  };
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 500,
      }}
    >
      {region && validUserLocation ? (
        <MapView
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          region={region}
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
          onRegionChange={handleRegionChange}
          onPanDrag={handlePanDrag}
        >
          {/* Add markers for AR sites here if needed - only show when friends are hidden */}
          {!showFriendsOnly &&
            AllScans.map(scan => {
              // Create or get ref for this marker
              if (!markerRefs.current[`scan-${scan.id}`]) {
                markerRefs.current[`scan-${scan.id}`] = React.createRef();
              }

              return (
                <ARMarkerComponent
                  key={`scan-${scan.id}`}
                  item={scan}
                  onPress={onMarkerPress}
                  anchor={ANCHOR}
                  centerOffset={CENTEROFFSET}
                  widthPercentage={widthPercentageToDP(15)}
                  androidTrackViewChnages={androidTrackViewChnages}
                  showCallout={scan.isSelected && selectedSite === AR_MODES.SCAN_MODE}
                  isCalloutVisible={showCallout && calloutMarkerId === scan.id}
                  markerRef={markerRefs.current[`scan-${scan.id}`]}
                />
              );
            })}
          {!showFriendsOnly &&
            AllHunts.map(hunt => {
              // Create or get ref for this marker
              if (!markerRefs.current[`hunt-${hunt.id}`]) {
                markerRefs.current[`hunt-${hunt.id}`] = React.createRef();
              }

              return (
                <ARMarkerComponent
                  key={`hunt-${hunt.id}`}
                  item={hunt}
                  onPress={onMarkerPress}
                  anchor={ANCHOR}
                  centerOffset={CENTEROFFSET}
                  widthPercentage={widthPercentageToDP(15)}
                  androidTrackViewChnages={androidTrackViewChnages}
                  showCallout={hunt.isSelected && selectedSite === AR_MODES.HUNT_MODE}
                  isCalloutVisible={showCallout && calloutMarkerId === hunt.id}
                  markerRef={markerRefs.current[`hunt-${hunt.id}`]}
                />
              );
            })}

          {/* Hunt points - only visible when user is within 100m of selected AR hunt and friends are hidden */}
          {!showFriendsOnly &&
            visibleHuntPoints.map(point => {
              // Create or get ref for this marker
              if (!markerRefs.current[`hunt-point-${point.id}`]) {
                markerRefs.current[`hunt-point-${point.id}`] = React.createRef();
              }

              return (
                <HuntPointMarkerComponent
                  key={`hunt-point-${point.id}`}
                  item={point}
                  onPress={onHuntPointPress}
                  anchor={ANCHOR}
                  centerOffset={CENTEROFFSET}
                  widthPercentage={widthPercentageToDP(10)}
                  androidTrackViewChnages={androidTrackViewChnages}
                  showCallout={point.isSelected}
                  isCalloutVisible={showCallout && calloutMarkerId === point.id}
                  markerRef={markerRefs.current[`hunt-point-${point.id}`]}
                />
              );
            })}

          {/* Friend markers - only visible when showFriendsOnly is true */}
          {showFriendsOnly &&
            friendList.length > 0 &&
            friendList.map(o => {
              return f_markerView(o);
            })}

          {/* Polyline for walking route */}
          {polylineCoordinates.length > 0 && (
            <Polyline
              coordinates={polylineCoordinates}
              strokeColor="#34c303" // Blue color for the walking route
              strokeWidth={10}
            />
          )}

          {lastMileLine.length > 0 && (
            <Polyline coordinates={lastMileLine} strokeColor="#34c303" strokeWidth={6} />
          )}
        </MapView>
      ) : (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.99)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{color: "#fff", marginTop: 10}}>Locating your position...</Text>
        </View>
      )}
      {/* Route loading indicator */}
      {isLoadingRoute && (
        <View
          style={{
            position: "absolute",
            top: 50,
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.8)",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
            }}
          >
            <ActivityIndicator size="small" color="#fff" />
            <Text style={{color: "#fff", marginTop: 5, fontSize: 12}}>
              Calculating walking route...
            </Text>
          </View>
        </View>
      )}
      {currentWalikngTime && (
        <View style={[styles.travelTime]}>
          <Icons.walk
            width={widthPercentageToDP(8)}
            height={widthPercentageToDP(8)}
            color={"#000000ff"}
          />
          <Text style={styles.travelTimeText}>{currentWalikngTime}</Text>
        </View>
      )}

      {/* Distance Display */}
      {currentDistance && (
        <View style={[styles.distanceDisplay]}>
          <Text style={styles.distanceText}>{currentDistance}</Text>
        </View>
      )}

      {/* Friends Toggle - Bottom Left */}
      <View style={styles.friendsToggleContainer}>
        <Text style={styles.friendsToggleText}>
          {showFriendsOnly ? "Hide Friends" : "Show Friends"}
        </Text>
        <AppSwitch
          onValueChange={val => {
            setShowFriendsOnly(val);
            resetAll();
          }}
          value={showFriendsOnly}
        />
      </View>

      {/* Custom Compass */}
      <CustomCompass heading={heading} onPress={resetCompassRotation} />

      <TouchableOpacity
        style={[styles.myLocationButton]}
        activeOpacity={0.7}
        onPress={handleCurrentLocationPress}
      >
        <Icons.currentLocation
          width={widthPercentageToDP(6)}
          height={widthPercentageToDP(6)}
          color={"#000000ff"}
        />
      </TouchableOpacity>

      {/* Proximity Alert */}
      <ARProximityAlert
        isVisible={showProximityAlert}
        onClose={() => setShowProximityAlert(false)}
        onSwitchToLive={() => {
          if (onSwitchToLiveView) {
            onSwitchToLiveView();
          }
        }}
        arName={
          selectedSite === AR_MODES.SCAN_MODE
            ? selectedAR?.name || "AR Location"
            : selectedHuntPoint?.title || "Hunt Point"
        }
      />
    </View>
  );
};

export default ARMapView;

const styles = StyleSheet.create({
  myLocationButton: {
    backgroundColor: theme.lightColors?.white,

    position: "absolute",
    right: 0,
    bottom: 0,
    marginBottom: widthPercentageToDP(30),
    marginRight: widthPercentageToDP(5),
    width: widthPercentageToDP(14.5),
    height: widthPercentageToDP(14.5),
    borderRadius: widthPercentageToDP(100),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  travelTime: {
    backgroundColor: theme.lightColors?.white,

    position: "absolute",
    right: 0,
    bottom: 0,
    marginBottom: widthPercentageToDP(70),
    marginRight: widthPercentageToDP(5),
    width: widthPercentageToDP(14.5),
    height: widthPercentageToDP(14.5),
    borderRadius: widthPercentageToDP(100),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  travelTimeText: {
    color: theme.lightColors?.black,
    fontSize: FontSizes.S10,
    marginTop: heightPercentageToDP(0.2),
  },
  distanceDisplay: {
    backgroundColor: "rgba(34, 34, 34, 0.7)",
    position: "absolute",
    right: 0,
    bottom: 0,
    marginBottom: widthPercentageToDP(10),
    marginRight: widthPercentageToDP(6),
    paddingHorizontal: widthPercentageToDP(4),
    paddingVertical: widthPercentageToDP(2),
    borderRadius: widthPercentageToDP(1),
    minWidth: widthPercentageToDP(20),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  distanceText: {
    color: theme.lightColors?.white,
    fontSize: FontSizes.S14,
    fontWeight: "600",
  },
  friendsToggleContainer: {
    backgroundColor: "rgba(34, 34, 34, 0.7)",
    position: "absolute",
    left: 0,
    bottom: 0,
    marginBottom: widthPercentageToDP(10),
    marginLeft: widthPercentageToDP(6),
    paddingHorizontal: widthPercentageToDP(4),
    paddingVertical: widthPercentageToDP(2),
    borderRadius: widthPercentageToDP(1),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: widthPercentageToDP(40),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  friendsToggleText: {
    color: theme.lightColors?.white,
    fontSize: FontSizes.S12,
    fontWeight: "600",
    marginRight: widthPercentageToDP(2),
  },
});
