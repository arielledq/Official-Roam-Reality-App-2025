import React, {useEffect} from "react";
import {View, Text, StyleSheet} from "react-native";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import {darkMapStyle} from "./darkMapStyle";
import {widthPercentageToDP} from "react-native-responsive-screen";
import theme from "assets/theme";
import {TouchableOpacity} from "react-native";
import {Icon} from "@rneui/themed";
import {Icons} from "assets/Icons";
import {AR_MODES} from "constants";
import {getAllHunts, getAllScans} from "network";

const ARMapView = ({
  userLocation,
  validUserLocation,
  selectedMode,
  onMarkerPress,
  selectedSite,
}) => {
  const [region, setRegion] = React.useState(null);
  const [AllHunts, setAllHunts] = React.useState([]);
  const [AllScans, setAllScans] = React.useState([]);
  const mapRef = React.useRef(null);
  useEffect(() => {
    if (validUserLocation) {
      const latitude = validUserLocation?.latitude;
      const longitude = validUserLocation?.longitude;

      setRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [validUserLocation]);

  useEffect(() => {
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
      setAllScans(result?.data || []);
    } catch (error) {}
  };

  const getHunts = async () => {
    try {
      // Placeholder for fetching hunts logic
      const result = await getAllHunts();
      console.log("result", result);
      setAllHunts(result?.data || []);
    } catch (error) {
      console.error("Error fetching hunts:", error);
    }
  };

  const MARKER_WIDTH = 50;
  /** Marker's height */
  const MARKER_HEIGHT = 70; // marker height

  const getCenterOffsetForAnchor = (anchor, markerWidth, markerHeight) => ({
    x: markerWidth * 0.5 - markerWidth * anchor.x,
    y: markerHeight * 0.5 - markerHeight * anchor.y,
  });

  const ANCHOR = {x: 0.5, y: 0.5};

  const CENTEROFFSET = getCenterOffsetForAnchor(ANCHOR, MARKER_WIDTH, MARKER_HEIGHT);

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
        customMapStyle={darkMapStyle}
      >
        {/* Add markers for AR sites here if needed */}
        {AllScans.map((scans, index) => (
          <Marker
            key={scans?.id}
            coordinate={{
              latitude: scans.latitude,
              longitude: scans.longitude,
            }}
            anchor={ANCHOR}
            centerOffset={CENTEROFFSET}
            tracksViewChanges={Platform.OS === "android" ? true : false}
            flat={true}
          >
            <Icons.ArMarker width={widthPercentageToDP(10)} height={widthPercentageToDP(10)} />
          </Marker>
        ))}
        {AllHunts.map((hunts, index) => (
          <Marker
            key={hunts?.id}
            coordinate={{
              latitude: hunts.latitude,
              longitude: hunts.longitude,
            }}
            anchor={ANCHOR}
            centerOffset={CENTEROFFSET}
            tracksViewChanges={Platform.OS === "android" ? true : false}
            flat={true}
          >
            <Icons.ArMarker width={widthPercentageToDP(10)} height={widthPercentageToDP(10)} />
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        style={[styles.myLocationButton]}
        activeOpacity={0.7}
        onPress={handleCurrentLocationPress}
      >
        <Icons.currentLocation
          width={widthPercentageToDP(6)}
          height={widthPercentageToDP(6)}
          color={"#ffffff"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default ARMapView;

const styles = StyleSheet.create({
  myLocationButton: {
    backgroundColor: theme.lightColors?.grey4,

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
});
