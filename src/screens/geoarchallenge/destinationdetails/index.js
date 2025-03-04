import React, { useContext, useEffect, useRef, useState } from "react";

import { FlatList, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import ARSiteCountBG from "../../../assets/geoar/ar_site_count_bg.svg";
import FriendsMarkerIcon from "../../../assets/geoar/friend_marker.svg";
import { useDispatch, useSelector } from "react-redux";
import useStyles from "./styles";
import { updateSelectedSites, updateSelectedDestinationBandLocation } from "../../../redux/AR";
import {
  getARSiteCategories,
  getARSiteLocation,
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
import MarkerIcon from "components/marker";
import { pinColor, tracksViewChanges, useCustomMarkers } from "util/helpers";
import { EXPERIENCE_TYPE_CHOICES } from "constants";

const SCROLL_AMOUNT = 70;
const BAND_LOCATION_UPDATE_INTERVAL_SECONDS = 1000 * 60; // 1 minute

const GeoArChallengeDetails = ({}) => {
  const route = useRoute();
  const { isEvent, experienceType } = route?.params;
  const _styles = useStyles();
  const dispatch = useDispatch();
  const { userLocation } = useContext(GeolocationContext);
  const latitude = userLocation?.latitude;
  const longitude = userLocation?.longitude;
  const [hiddenStars, setHiddenStars] = useState(0);
  const [starsSites, setStarsSites] = useState(0);
  const [arSitesOn, setARSitesOnSwitch] = useState(true);
  const [selectedRegionName, setSelectedRegionName] = useState("Full");
  const [friendsLocationSitesOn, setFriendsLocationSitesOn] = useState(true);
  const navigation = useNavigation();
  const mapView = useRef();
  const selectedDestination = useSelector(state => state.ar?.selectedDestination);
  const regions = selectedDestination?.regions;
  const [fullRegion, setFullRegion] = useState(null);
  const [friendList, setFriendList] = useState([]);
  const [filteredUsers, setFilteredUsers] = React.useState([]);
  const [popUpFacts, setPopUpFacts] = useState(null);
  const scrollViewRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [categories, setCategories] = useState([{ name: "Full" }]);
  const [filteredSites, setFilteredSites] = useState([]);

  const bandLocationUpdatesIntervalId = useRef(null);

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
    getARSitesHiddenStars({ id: selectedDestination.id })
      .then(res => {
        setHiddenStars(res.data[0]);
      })
      .finally(() => {});
  };

  const getArSiteCategories = () => {
    const isBand = experienceType === EXPERIENCE_TYPE_CHOICES.BAND;

    getARSiteCategories({ is_band: isBand })
      .then(res => {
        setCategories([...categories, ...res.data]);
      })
      .finally(() => {});
  };

  const getARStarSites = () => {
    getARSitesStars({ id: selectedDestination.id })
      .then(res => {
        setStarsSites(res.data[0]);
      })
      .finally(() => {});
  };

  const getBandLocationUpdates = () => {
    if (isEvent) {
      const bandSites = selectedDestination?.ar_event_sites?.filter(site => !!site.band_user);
      bandSites.forEach(async site => {
        const siteId = site?.id;
        try {
          const response = await getARSiteLocation(siteId);
          if (!!response?.lat_long?.coordinates?.length) {
            const lat = response?.lat_long?.coordinates[1];
            const long = response?.lat_long?.coordinates[0];
            dispatch(updateSelectedDestinationBandLocation({ id: siteId, lat: lat, long: long }));
          }
        } catch (error) {
          console.error("error", error);
        }
      });
    }
  };

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
    getFriends();
    loadDFacts(selectedDestination?.id);
    getARStarSites();
    getArSiteCategories();

    bandLocationUpdatesIntervalId.current = setInterval(
      getBandLocationUpdates,
      BAND_LOCATION_UPDATE_INTERVAL_SECONDS
    );

    return () => {
      clearInterval(bandLocationUpdatesIntervalId.current);
    };
  }, []);

  const loadDFacts = async id => {
    getDestinationFacts({
      destination_id: id,
    })
      .then(async res => {
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
      })
      .finally(() => {});
  };

  const f_markerView = o => {
    if (
      o?.user_ar_profile?.current_location &&
      o?.user_ar_profile?.current_location?.coordinates?.length
    ) {
      return (
        <Marker
          key={o.id}
          coordinate={{
            latitude: o?.user_ar_profile?.current_location.coordinates[1],
            longitude: o?.user_ar_profile?.current_location.coordinates[0],
          }}
          title={o.name}
          onCalloutPress={() => {
            navigation.navigate("PublicProfile", { userData: o });
          }}
          pinColor={pinColor}
          tracksViewChanges={tracksViewChanges}
        >
          {Platform.OS === "ios" && (
            <Callout
              onPress={() => {
                navigation.navigate("PublicProfile", { userData: o });
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
          {useCustomMarkers && (
            <View style={{ width: 30, height: 30 }}>
              <FriendsMarkerIcon />
            </View>
          )}
        </Marker>
      );
    }
  };

  const navigateToNextScreen = updatedSelectedSite => {
    dispatch(updateSelectedSites(updatedSelectedSite));

    navigation.navigate("GeoArSiteDetails", {
      experience_type: experienceType,
    });
  };

  const _markerView = o => {
    if (o.lat_long) {
      return (
        <Marker
          key={o.id}
          coordinate={{
            latitude: o.lat_long.coordinates[1],
            longitude: o.lat_long.coordinates[0],
          }}
          title={o.name}
          onCalloutPress={() => navigateToNextScreen(o)}
          pinColor={pinColor}
          tracksViewChanges={tracksViewChanges}
        >
          {Platform.OS === "ios" && (
            <Callout
              onPress={() => navigateToNextScreen(o)}
              style={{
                backgroundColor: "#fff",
                minWidth: 100,
                alignItems: "center",
              }}
            >
              <Text>{o.name}</Text>
            </Callout>
          )}
          {useCustomMarkers && (
            <View style={{ width: 30, height: 30 }}>
              <MarkerIcon color={o?.category?.color} />
            </View>
          )}
        </Marker>
      );
    }
  };

  const getBordersOfDestination = () => {
    let bordersOfDestination;

    switch (experienceType) {
      case EXPERIENCE_TYPE_CHOICES.EVENT:
        bordersOfDestination = selectedDestination?.event_borders;
        break;
      case EXPERIENCE_TYPE_CHOICES.BAND:
        bordersOfDestination = selectedDestination?.band_borders;
        break;

      default:
        bordersOfDestination = selectedDestination?.border;
        break;
    }

    return bordersOfDestination;
  };

  const getFullBounds = () => {
    const bordersOfDestination = getBordersOfDestination();
    if (bordersOfDestination) {
      let arrayPoints = [];
      for (let i = 0; i < bordersOfDestination.coordinates.length; i++) {
        const points = bordersOfDestination.coordinates[i];
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
    const bordersOfDestination = getBordersOfDestination();
    if (bordersOfDestination) {
      let arrayPoints = [];
      for (let i = 0; i < bordersOfDestination.coordinates.length; i++) {
        const points = bordersOfDestination.coordinates[i];
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

  const showFilteredList = category => {
    if (category) {
      const filteredEventSites = selectedDestination.ar_event_sites.filter(
        site => site.category?.id === category
      );

      setFilteredSites(filteredEventSites);
    } else {
      setFilteredSites([]);
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

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: selectedDestination.name,
          style: [_styles.heading],
        }}
        backgroundColor="transparent"
      />

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

        {isEvent ? (
          <FlatList
            style={{ width: "100%", height: 50 }}
            horizontal={true}
            data={categories}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => showFilteredList(item.id)}
                activeOpacity={0.5}
                style={
                  item.name === "Full"
                    ? _styles.selectButtonStyle
                    : { ..._styles.unSelectButtonStyle, backgroundColor: item.color }
                }
              >
                <Text style={_styles.buttonSelectText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item?.id?.toString()}
            showsVerticalScrollIndicator={false}
          />
        ) : (
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
                selectedRegionName == "Full"
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
                      selectedRegionName == e.name
                        ? _styles.selectButtonStyle
                        : _styles.unSelectButtonStyle
                    }
                  >
                    <Text style={_styles.buttonSelectText}>{e.name}</Text>
                  </TouchableOpacity>
                );
            })}
          </ScrollView>
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          marginBottom: 20,
          justifyContent: "space-between",
        }}
      >
        {!isEvent && (
          <View style={_styles.selectionsContainer}>
            <View>
              <Text style={_styles.selectionTextHeading}>Sites</Text>
              <Text style={_styles.selectionTextDetails}>Sites with AR</Text>
            </View>
            <AppSwitch onValueChange={setARSitesOnSwitch} value={arSitesOn} />
          </View>
        )}

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
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapView}
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
          initialRegion={initialRegion}
        >
          {isEvent
            ? filteredSites.length > 0
              ? filteredSites.map(o => {
                  return _markerView(o);
                })
              : selectedDestination.ar_event_sites.map(o => {
                  return _markerView(o);
                })
            : arSitesOn &&
              selectedDestination.star_ar_sites.map(o => {
                return _markerView(o);
              })}
          {friendsLocationSitesOn &&
            friendList.map(o => {
              return f_markerView(o);
            })}
        </MapView>
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
            width: 70,
          }}
        >
          <ARSiteCountBG style={{ width: 48, height: 48 }}></ARSiteCountBG>
          <Text style={_styles.s_list_count}>
            {isEvent
              ? selectedDestination?.ar_event_sites?.length
              : selectedDestination?.star_ar_sites?.length}
          </Text>
          <Text style={_styles.s_list_text}>Sites</Text>
        </View>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 70,
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
            width: 100,
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
