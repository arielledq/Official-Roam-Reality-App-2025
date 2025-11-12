import React, {useEffect, useCallback, useMemo} from "react";
import {View, Text, StyleSheet, Platform, Alert} from "react-native";
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from "react-native-maps";
import {darkMapStyle} from "./darkMapStyle";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import theme from "assets/theme";
import {TouchableOpacity} from "react-native";
import {Icon} from "@rneui/themed";
import {Icons} from "assets/Icons";
import {AR_MODES} from "constants";
import {getAllHunts, getAllScans} from "network";
import {getDistance} from "geolib";
import {ActivityIndicator} from "react-native";
import {FontSizes} from "util/FontUtils";

// Memoized marker component to prevent unnecessary re-renders
const ARMarkerComponent = React.memo(({item, onPress, anchor, centerOffset, widthPercentage}) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [onPress, item]);

  return (
    <Marker
      key={`marker-${item.id}`}
      coordinate={{
        latitude: item.latitude,
        longitude: item.longitude,
      }}
      anchor={anchor}
      centerOffset={centerOffset}
      tracksViewChanges={false} // Disable view tracking for better performance
      flat={true}
      onPress={handlePress}
    >
      {item.isSelected ? (
        <Icons.ArMarker width={widthPercentage} height={widthPercentage} />
      ) : (
        <Icons.disbaledMarker width={widthPercentage} height={widthPercentage} />
      )}
    </Marker>
  );
});

// Memoized hunt point marker component with separate functionality
const HuntPointMarkerComponent = React.memo(
  ({item, onPress, anchor, centerOffset, widthPercentage}) => {
    const handlePress = useCallback(() => {
      onPress(item);
    }, [onPress, item]);

    return (
      <Marker
        key={`hunt-point-${item.id}`}
        coordinate={{
          latitude: item.latitude,
          longitude: item.longitude,
        }}
        anchor={anchor}
        centerOffset={centerOffset}
        tracksViewChanges={false}
        flat={true}
        onPress={handlePress}
      >
        {item.isSelected ? (
          <Icons.ArMarker width={widthPercentage} height={widthPercentage} />
        ) : (
          <Icons.disbaledMarker width={widthPercentage} height={widthPercentage} />
        )}
      </Marker>
    );
  }
);

const ARMapView = ({userLocation, validUserLocation, selectedMode, selectedSite}) => {
  const [region, setRegion] = React.useState(null);
  const [AllHunts, setAllHunts] = React.useState([]);
  const [userLiveLocation, setUserLiveLocation] = React.useState(null);
  const [AllScans, setAllScans] = React.useState([]);
  const [polylineCoordinates, setPolylineCoordinates] = React.useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = React.useState(false);
  const [huntPoits, setHuntPoints] = React.useState([]);
  const [currentWalikngTime, setCurrentWalkingTime] = React.useState(null);

  // State for tracking user movement and selected AR
  const [previousUserLocation, setPreviousUserLocation] = React.useState(null);
  const [lastPolylineUpdateLocation, setLastPolylineUpdateLocation] = React.useState(null);
  const [selectedAR, setSelectedAR] = React.useState(null);
  const [selectedHuntPoint, setSelectedHuntPoint] = React.useState(null);
  const [visibleHuntPoints, setVisibleHuntPoints] = React.useState([]);

  const mapRef = React.useRef(null);
  const regionSetCounterRef = React.useRef(0); // Counter to track if region has been set
  const MOVEMENT_THRESHOLD = 10; // meters

  useEffect(() => {
    // Only set region once when component mounts and validUserLocation is available
    if (validUserLocation && regionSetCounterRef.current === 0) {
      const latitude = validUserLocation?.latitude;
      const longitude = validUserLocation?.longitude;

      setRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Increment counter to prevent further updates
      regionSetCounterRef.current = 1;
    }
  }, [validUserLocation]);

  // Reset counter when component unmounts
  useEffect(() => {
    return () => {
      regionSetCounterRef.current = 0;
    };
  }, []);

  useEffect(() => {
    if (userLocation) {
      setUserLiveLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
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
      // Check if we have a selected hunt point (takes priority)
      if (selectedHuntPoint) {
        console.log("Updating polyline for selected hunt point:", selectedHuntPoint.id);
        updatePolylineForMovement(currentLocation, selectedHuntPoint);
        setLastPolylineUpdateLocation(currentLocation);
      } else if (selectedAR) {
        console.log("Updating polyline for selected AR:", selectedAR.id);
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
  ]);

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
    console.log(`Distance to selected AR hunt: ${distanceToSelectedAR}m`);

    if (distanceToSelectedAR <= 100) {
      // User is within 100m, show hunt points

      setVisibleHuntPoints(huntPoits);
    } else {
      // User is outside 100m, hide hunt points

      setVisibleHuntPoints([]);
    }
  }, [userLiveLocation, selectedAR, huntPoits, selectedSite]);

  useEffect(() => {
    // Clear polyline when switching modes
    setPolylineCoordinates([]);
    // Clear walking time when switching modes
    setCurrentWalkingTime(null);
    // Reset location tracking when switching modes
    setPreviousUserLocation(null);
    setLastPolylineUpdateLocation(null);
    // Clear selected AR when switching modes
    setSelectedAR(null);
    // Clear hunt points and selected hunt point when switching modes
    setHuntPoints([]);
    setVisibleHuntPoints([]);
    setSelectedHuntPoint(null);

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
      console.log("resu", result);
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
      console.log(`User movement distance: ${distanceInMeters}m`);

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
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000 // duration in ms
      );
    }
  };

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

    console.log(`Distance to marker: ${distanceInKm.toFixed(2)} km`);

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

  // Function to fetch walking directions from Google Directions API
  const fetchWalkingDirections = async (startLat, startLng, destLat, destLng) => {
    try {
      setIsLoadingRoute(true);

      // TODO: Replace with your actual Google Maps API key
      // You can get this from Google Cloud Console: https://console.cloud.google.com/
      // Enable the "Directions API" for your project
      const GOOGLE_MAPS_API_KEY = "AIzaSyCrsgDowsVe8v8zbZ2yq0qkOr7ocQVztgc";

      if (GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
        console.warn("Google Maps API key not configured. Using fallback straight line.");
        // Clear walking time for fallback
        setCurrentWalkingTime(null);
        // Fallback: create a simple straight line
        setPolylineCoordinates([
          {latitude: startLat, longitude: startLng},
          {latitude: destLat, longitude: destLng},
        ]);
        return;
      }

      const origin = `${startLat},${startLng}`;
      const destination = `${destLat},${destLng}`;

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.routes.length > 0) {
        const route = data.routes[0];
        const points = decodePolyline(route.overview_polyline.points);
        setPolylineCoordinates(points);

        // Extract walking time from the API response
        if (route.legs && route.legs.length > 0) {
          const leg = route.legs[0];
          const durationInSeconds = leg.duration.value;
          const durationInMinutes = Math.ceil(durationInSeconds / 60); // Convert to minutes and round up

          setCurrentWalkingTime(`${durationInMinutes} min`);
        }
      } else {
        console.error("Directions API error:", data.status);
        // Clear walking time for fallback
        setCurrentWalkingTime(null);
        // Fallback: create a simple straight line
        setPolylineCoordinates([
          {latitude: startLat, longitude: startLng},
          {latitude: destLat, longitude: destLng},
        ]);
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      // Clear walking time for error case
      setCurrentWalkingTime(null);
      // Fallback: create a simple straight line
      setPolylineCoordinates([
        {latitude: startLat, longitude: startLng},
        {latitude: destLat, longitude: destLng},
      ]);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Function to update polyline when user moves significantly
  const updatePolylineForMovement = useCallback(
    async (currentUserLocation, selectedAR) => {
      if (!currentUserLocation || !selectedAR) return;

      console.log("Updating polyline for movement - From:", currentUserLocation, "To:", selectedAR);

      try {
        await fetchWalkingDirections(
          currentUserLocation.latitude,
          currentUserLocation.longitude,
          selectedAR.latitude,
          selectedAR.longitude
        );

        console.log("Polyline updated successfully for user movement");
      } catch (error) {
        console.error("Error updating polyline for movement:", error);
      }
    },
    [fetchWalkingDirections]
  );

  const onMarkerPress = useCallback(
    async site => {
      console.log("Marker pressed:", site);

      // Check if user is within 5km of the marker
      const isWithinRange = checkDistanceToMarker(site.latitude, site.longitude);

      if (isWithinRange) {
        // User is within range, proceed with marker functionality
        console.log("User is within range. Proceeding with AR selection.");

        // Update marker selection state
        const isScansMode = selectedSite === AR_MODES.SCAN_MODE;
        updateMarkerSelection(site.id, isScansMode);

        // Set the selected AR with all details
        setSelectedAR(site);

        // Only set hunt points for hunt mode
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

        // Clear any existing polyline and walking time
        setPolylineCoordinates([]);
        setCurrentWalkingTime(null);

        // Fetch and draw walking route polyline
        if (userLiveLocation) {
          await fetchWalkingDirections(
            userLiveLocation.latitude,
            userLiveLocation.longitude,
            site.latitude,
            site.longitude
          );
        }

        // Add your existing marker press logic here
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

      // Clear any existing polyline and walking time
      setPolylineCoordinates([]);
      setCurrentWalkingTime(null);

      // Draw polyline from user location to hunt point
      if (userLiveLocation) {
        console.log("Drawing polyline to hunt point:", huntPoint.id);
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
          showsMyLocationButton={true}
        >
          {/* Add markers for AR sites here if needed */}
          {AllScans.map(scan => (
            <ARMarkerComponent
              key={`scan-${scan.id}`}
              item={scan}
              onPress={onMarkerPress}
              anchor={ANCHOR}
              centerOffset={CENTEROFFSET}
              widthPercentage={widthPercentageToDP(8)}
            />
          ))}
          {AllHunts.map(hunt => (
            <ARMarkerComponent
              key={`hunt-${hunt.id}`}
              item={hunt}
              onPress={onMarkerPress}
              anchor={ANCHOR}
              centerOffset={CENTEROFFSET}
              widthPercentage={widthPercentageToDP(8)}
            />
          ))}

          {/* Hunt points - only visible when user is within 100m of selected AR hunt */}
          {visibleHuntPoints.map(point => (
            <HuntPointMarkerComponent
              key={`hunt-point-${point.id}`}
              item={point}
              onPress={onHuntPointPress}
              anchor={ANCHOR}
              centerOffset={CENTEROFFSET}
              widthPercentage={widthPercentageToDP(6)}
            />
          ))}

          {/* Polyline for walking route */}
          {polylineCoordinates.length > 0 && (
            <Polyline
              coordinates={polylineCoordinates}
              strokeColor="#007AFF" // Blue color for the walking route
              strokeWidth={4}
            />
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
          <Icons.walk width={widthPercentageToDP(6)} height={widthPercentageToDP(6)} />
          <Text style={styles.travelTimeText}>{currentWalikngTime}</Text>
        </View>
      )}

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
    marginBottom: widthPercentageToDP(50),
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
    color: theme.lightColors?.grey0,
    fontSize: FontSizes.S10,
    marginTop: heightPercentageToDP(0.2),
  },
});
