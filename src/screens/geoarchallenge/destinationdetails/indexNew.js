import React, { useContext, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";
import { useNavigation } from "@react-navigation/native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import MapboxGL from "@rnmapbox/maps";
import MarkerIcon from "../../../assets/geoar/marker_img.svg";
import ARSiteCountBG from "../../../assets/geoar/ar_site_count_bg.svg";
import FriendsMarkerIcon from "../../../assets/geoar/friend_marker.svg";

import { useDispatch, useSelector } from "react-redux";
import useStyles from "./styles";
import { updateSelectedSites } from "../../../redux/AR";
import {
  getARSitesHiddenStars,
  getARSitesStars,
  getDestinationFacts,
  getUserFriendList,
} from "../../../network";
import AppSwitch from "../../../components/Switch";
import { getBounds, getCenterOfBounds, isLocationPointInPolygon } from "../../../util/LocationLib";
import DestinationFactPopUp from "../destinactionfactpopup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "../../../components/Icon";
import { GeolocationContext } from "../../../GeolocationProvider";

const SCROLL_AMOUNT = 70;

const GeoArChallengeDetails = ({}) => {
  const _styles = useStyles();
  const dispatch = useDispatch();
  const { userLocation } = useContext(GeolocationContext);
  const latitude = userLocation?.latitude;
  const longitude = userLocation?.longitude;
  const [isLoading, setIsLoading] = useState(false);
  const [hiddenStars, setHiddenStars] = useState(0);
  const [starsSites, setStarsSites] = useState(0);
  const [arSitesOn, setARSitesOnSwitch] = useState(true);
  const [selectedRegionName, setSelectedRegionName] = useState("Full");
  const [friendsLocationSitesOn, setFriendsLocationSitesOn] = useState(true);
  const navigation = useNavigation();
  const mapView = useRef();
  const selectedDestination = useSelector(state => state.ar?.selectedDestination);
  const [selectedPoint, setSelectedPoint] = useState(null);

  console.log("selectedDestination ", selectedDestination);
  const regions = selectedDestination?.regions;
  const [fullRegion, setFullRegion] = useState(null);
  const [friendList, setFriendList] = useState([]);
  const [filteredUsers, setFilteredUsers] = React.useState([]);
  const [popUpFacts, setPopUpFacts] = useState(null);
  const scrollViewRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const scrollRegionsPressHandler = () => {
    const newPosition = scrollPosition + SCROLL_AMOUNT;
    scrollViewRef.current?.scrollTo({ x: newPosition, y: 0, animated: true });
    setScrollPosition(newPosition);
  };

  const setMapBounds = () => {
    var address = selectedDestination.name;
    Geocoder.from(address)
      .then(json => {
        var location = json.results[0].geometry.location;
        var bounds = json.results[0].geometry.bounds;
        mapView.current.setMapBoundaries(
          { latitude: bounds.northeast.lat, longitude: bounds.northeast.lng },
          { latitude: bounds.southwest.lat, longitude: bounds.southwest.lng }
        );
        const fullRegion = {
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: Number(bounds.northeast.lat - bounds.southwest.lat),
          longitudeDelta: Number(bounds.northeast.lng - bounds.southwest.lng),
        };
        if (mapView && mapView.current) {
          mapView.current.animateToRegion(fullRegion);
          setFullRegion(fullRegion);
        }
      })
      .catch(error => console.warn(error));
  };

  const moveToFullRegion = () => {
    if (mapView && mapView.current) {
      mapView.current.animateToRegion(fullRegion);
    }
    setSelectedRegionName("Full");
  };

  const getHiddenStar = () => {
    getARSitesHiddenStars({ id: selectedDestination.id }).then(res => {
      setHiddenStars(res.data[0]);
    });
  };

  const getARStarSites = () => {
    getARSitesStars({ id: selectedDestination.id }).then(res => {
      setStarsSites(res.data[0]);
    });
  };

  const loadDFacts = async id => {
    getDestinationFacts({
      destination_id: id,
    }).then(async res => {
      for (let i = 0; i < res.data.length; i++) {
        const facts = res.data[i];
        const arrayPoints = [];
        if (facts?.border?.coordinates) {
          for (let i = 0; i < facts.border.coordinates.length; i++) {
            const points = facts.border.coordinates[i];
            for (let j = 0; j < points.length; j++) {
              const point = points[j];
              arrayPoints.push({
                latitude: point[1],
                longitude: point[0],
              });
            }
          }
        }
        const isInsideSiteArea = isLocationPointInPolygon({ latitude, longitude }, arrayPoints);
        if (isInsideSiteArea) {
          const isOpened = await AsyncStorage.getItem(`open_${facts.id}`);
          // if don't want to open popup again and again
          if (!isOpened || isOpened !== "opened") {
            setPopUpFacts(facts);
          }
          break;
        }
      }
    });
  };

  const _markerView = o => {
    if (o.lat_long) {
      const coordinates = [o.lat_long.coordinates[0], o.lat_long.coordinates[1]];

      return (
        <>
          {/* MarkerView allows us to fully customize the marker and its interactivity */}
          <MapboxGL.MarkerView id={o.id + "-coordinates"} coordinate={coordinates}>
            <View
              style={{
                alignItems: "center",
                width: 120,
                height: 120,
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* Custom Marker Icon */}
              <Pressable
                onPress={() => {
                  console.log("Marker pressed:", o.name);
                  setSelectedPoint(o.id);
                }}
                style={{ width: 30, height: 40 }}
              >
                <MarkerIcon />
              </Pressable>

              {/* Show callout when marker is selected */}
              {selectedPoint === o.id && (
                <View
                  style={{
                    position: "absolute",
                    top: -5,
                    padding: 5,
                    backgroundColor: "white",
                    borderRadius: 8,
                    borderColor: "#ccc",
                    borderWidth: 1,
                    width: 100,
                    marginTop: 10,
                    alignItems: "center",
                  }}
                >
                  <Pressable
                    onPress={() => {
                      dispatch(updateSelectedSites(o));
                      navigation.navigate("GeoArSiteDetails");
                    }}
                  >
                    <Text
                      style={{ fontWeight: "bold", fontSize: 14 }}
                      numberOfLines={1} // Limit to one line
                      ellipsizeMode="tail"
                    >
                      {o.name}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </MapboxGL.MarkerView>
        </>
      );
    }
  };

  const getFullBounds = () => {
    if (selectedDestination.border) {
      let arrayPoints = [];
      for (let i = 0; i < selectedDestination.border.coordinates.length; i++) {
        const points = selectedDestination.border.coordinates[i];
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

  const getFriends = () => {
    getUserFriendList()
      .then(response => {
        if (response) {
          setFriendList(response?.data[0]?.friends || []);
          setFilteredUsers(response?.data[0]?.friends || []);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const getFullCenter = () => {
    if (selectedDestination.border) {
      let arrayPoints = [];
      for (let i = 0; i < selectedDestination.border.coordinates.length; i++) {
        const points = selectedDestination.border.coordinates[i];
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

  const moveToRegion = r => {
    let arrayPoints = [];
    for (let i = 0; i < r.geo_region.coordinates.length; i++) {
      const points = r.geo_region.coordinates[i];
      for (let j = 0; j < points.length; j++) {
        const point = points[j];
        arrayPoints.push({ latitude: point[1], longitude: point[0] });
      }
    }
    const latitude_longitude = getCenterOfBounds(arrayPoints);
    const bounds = getBounds(arrayPoints);
    if (mapView && mapView.current) {
      mapView.current.animateToRegion({
        latitude: Number(latitude_longitude.latitude),
        longitude: Number(latitude_longitude.longitude),
        latitudeDelta: Number(bounds.maxLat - bounds.minLat),
        longitudeDelta: Number(bounds.maxLng - bounds.minLng),
      });
      setSelectedRegionName(r.name);
    }
  };
  const initialRegion = {
    latitude:
      selectedDestination.geo_location && selectedDestination.geo_location?.coordinates.length > 0
        ? selectedDestination.geo_location?.coordinates[1]
        : latitude,
    longitude:
      selectedDestination.geo_location && selectedDestination.geo_location?.coordinates.length > 0
        ? selectedDestination.geo_location?.coordinates[0]
        : longitude,
    latitudeDelta: selectedDestination.map_latitude_delta
      ? Number(selectedDestination.map_latitude_delta)
      : 0.0922,
    longitudeDelta: selectedDestination.map_longitude_delta
      ? Number(selectedDestination.map_longitude_delta)
      : 0.0421,
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
    if (
      !selectedDestination.geo_location ||
      selectedDestination.geo_location.coordinates.length == 0
    ) {
      setTimeout(setMapBounds, 500);
    } else {
      const fullRegion = {
        latitude: selectedDestination.geo_location?.coordinates[1],
        longitude: selectedDestination.geo_location?.coordinates[0],
        latitudeDelta: Number(selectedDestination.map_latitude_delta),
        longitudeDelta: Number(selectedDestination.map_longitude_delta),
      };
      const full_latitude_longitude = getFullCenter();
      const full_bounds = getFullBounds();
      if (full_bounds) {
        fullRegion.latitudeDelta = Number(full_bounds.maxLat - full_bounds.minLat);
        fullRegion.longitudeDelta = Number(full_bounds.maxLng - full_bounds.minLng);
      }
      if (full_latitude_longitude) {
        fullRegion.latitude = Number(full_latitude_longitude.latitude);
        fullRegion.longitude = Number(full_latitude_longitude.longitude);
      }
      setFullRegion(fullRegion);
    }
    getHiddenStar();
    loadDFacts(selectedDestination?.id);
    getFriends();
    getARStarSites();
  }, []);

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
      <View
        style={{
          marginBottom: 10,
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <TouchableOpacity onPress={scrollRegionsPressHandler}>
          <Icon name={"angle-double-right"} family="font-awesome" size={25} color="gray" />
        </TouchableOpacity>
        <ScrollView
          ref={scrollViewRef}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{ width: "100%", height: 50 }}
          contentContainerStyle={_styles.rowView}
        >
          <TouchableOpacity
            onPress={moveToFullRegion}
            activeOpacity={0.5}
            style={
              selectedRegionName === "Full"
                ? _styles.selectButtonStyle
                : _styles.unSelectButtonStyle
            }
          >
            <Text style={_styles.buttonSelectText}>Full</Text>
          </TouchableOpacity>
          {regions.map(e => {
            if (e.geo_region)
              return (
                <TouchableOpacity
                  key={e.id}
                  activeOpacity={0.5}
                  onPress={() => moveToRegion(e)}
                  style={
                    selectedRegionName === e.name
                      ? _styles.selectButtonStyle
                      : _styles.unSelectButtonStyle
                  }
                >
                  <Text style={_styles.buttonSelectText}>{e.name}</Text>
                </TouchableOpacity>
              );
          })}
        </ScrollView>
      </View>
      <View
        style={{
          flexDirection: "row",
          marginBottom: 20,
          justifyContent: "space-between",
        }}
      >
        <View style={_styles.selectionsContainer}>
          <View>
            <Text style={_styles.selectionTextHeading}>Sites</Text>
            <Text style={_styles.selectionTextDetails}>Sites with AR</Text>
          </View>
          <AppSwitch onValueChange={setARSitesOnSwitch} value={arSitesOn} />
        </View>
        <View style={_styles.selectionsContainer}>
          <View>
            <Text style={_styles.selectionTextHeading}>My Friends</Text>
            <Text style={_styles.selectionTextDetails}>Live Location</Text>
          </View>
          <AppSwitch onValueChange={setFriendsLocationSitesOn} value={friendsLocationSitesOn} />
        </View>
      </View>
      <View
        style={{
          width: "100%",
          position: "relative",
          flex: 1,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <MapboxGL.MapView
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
          compassEnabled
          scaleBarEnabled={false}
        >
          <MapboxGL.Camera
            zoomLevel={16}
            centerCoordinate={[initialRegion.longitude, initialRegion.latitude]}
            pitch={0} // Sets the 3D pitch angle
            animationMode="none"
            animationDuration={0}
          />

          {arSitesOn &&
            selectedDestination.star_ar_sites.map(o => {
              return _markerView(o);
            })}
        </MapboxGL.MapView>
      </View>
      <View>
        <Text style={_styles.s_list_text}>Tap the pin to see more details</Text>
      </View>
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
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 80,
          }}
        >
          <ARSiteCountBG style={{ width: 48, height: 48 }}></ARSiteCountBG>
          <Text style={_styles.s_list_count}>{selectedDestination.star_ar_sites.length}</Text>
          <Text style={_styles.s_list_text}>Sites</Text>
        </View>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 80,
          }}
        >
          <ARSiteCountBG style={{ width: 48, height: 48 }}></ARSiteCountBG>
          <Text style={_styles.s_list_count}>{starsSites}</Text>
          <Text style={_styles.s_list_text}>Star Sites</Text>
        </View>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 80,
          }}
        >
          <ARSiteCountBG style={{ width: 48, height: 48 }}></ARSiteCountBG>
          <Text style={_styles.s_list_count}>{selectedDestination.unique_ar_sites.length}</Text>
          <Text style={_styles.s_list_text}>AR Experiences</Text>
        </View>
      </View>
      {popUpFacts && (
        <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
          <DestinationFactPopUp
            facts={popUpFacts}
            onClose={async () => {
              setPopUpFacts(null);
              await AsyncStorage.setItem(`open_${popUpFacts.id}`, "opened");
            }}
          />
        </View>
      )}
    </BackgroundWithImage>
  );
};

export default GeoArChallengeDetails;
