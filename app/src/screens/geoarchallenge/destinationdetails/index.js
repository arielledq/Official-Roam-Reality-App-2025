import React, {useCallback, useContext, useEffect, useRef, useState} from "react";

import {FlatList, Platform, ScrollView, Text, TouchableOpacity, View, Image} from "react-native";
import BackgroundWithImage from "../../../components/background";
import AppHeader from "../../../components/header";
import {useFocusEffect, useNavigation, useRoute} from "@react-navigation/native";
import MapView, {Marker, PROVIDER_GOOGLE, Callout} from "react-native-maps";
import Geocoder from "react-native-geocoding";
import ARSiteCountBG from "../../../assets/geoar/ar_site_count_bg.svg";
import FriendsMarkerIcon from "../../../assets/geoar/friend_marker.svg";
import {useDispatch, useSelector} from "react-redux";
import useStyles from "./styles";
import {
  updateSelectedSites,
  updateSelectedDestinationBandLocation,
  updateMapRegion,
  updateMapMarkers,
} from "../../../redux/AR";
import {
  getARSiteCategories,
  getARSiteLocation,
  getARSitesHiddenStars,
  getARSitesStars,
  getDestinationFacts,
  getUserFriendList,
} from "../../../network";
import AppSwitch from "../../../components/Switch";
import {getBounds, getCenterOfBounds, isLocationPointInPolygon} from "../../../util/LocationLib";
import DestinationFactPopUp from "../destinactionfactpopup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "../../../components/Icon";
import {GeolocationContext} from "../../../GeolocationProvider";
import MarkerIcon from "components/marker";
import {pinColor, showMessage, tracksViewChanges, useCustomMarkers} from "util/helpers";
import {EXPERIENCE_TYPE_CHOICES} from "../../../constants";
import RNFS from "react-native-fs";
import theme from "assets/theme";
import MapSkeletonLoader from "components/MapSkeletonLoader";
import TransparentSearchBar from "components/transparentSearchBar";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import Images from "assets/images";

const SCROLL_AMOUNT = 70;
const BAND_LOCATION_UPDATE_INTERVAL_SECONDS = 1000 * 60; // 60 seconds
const FRIENDS_LOCATION_UPDATE_INTERVAL_SECONDS = 1000 * 60; // 60 seconds
const INITIAL_CATEGORIES = [{name: "Full"}];

const GeoArChallengeDetails = ({}) => {
  const route = useRoute();
  const {isEvent, experienceType} = route?.params;
  const _styles = useStyles();
  const dispatch = useDispatch();
  const {userLocation} = useContext(GeolocationContext);
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
  const [androidTrackViewChnages, setAndroidTrackViewChanges] = useState(true);
  const regions = selectedDestination?.regions;
  const [fullRegion, setFullRegion] = useState(null);
  const [friendList, setFriendList] = useState([]);
  const [popUpFacts, setPopUpFacts] = useState(null);
  const scrollViewRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [updatedMarkers, setUpdatedMarkers] = useState([]);
  const [filteredUpdatedMarkers, setFilteredUpdatedMarkers] = useState([]);
  const [loadingCustomMarkers, setLoadingCustomMarkers] = useState(false);
  const [shouldShowMap, setShouldShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [markersFullyLoaded, setMarkersFullyLoaded] = useState(false);
  const markerRefs = useRef({});
  const autoTooltipShownRef = useRef(false);
  const [friendImageStates, setFriendImageStates] = useState({});

  const bandLocationUpdatesIntervalId = useRef(null);
  const friendsLocationUpdatesIntervalId = useRef(null);

  const scrollRegionsPressHandler = () => {
    const newPosition = scrollPosition + SCROLL_AMOUNT;
    scrollViewRef.current?.scrollTo({x: newPosition, y: 0, animated: true});
    setScrollPosition(newPosition);
  };

  const setMapBounds = () => {
    var address = selectedDestination.name;
    Geocoder.from(address)
      .then(json => {
        var location = json.results[0].geometry.location;
        var bounds = json.results[0].geometry.bounds;
        mapView.current.setMapBoundaries(
          {latitude: bounds.northeast.lat, longitude: bounds.northeast.lng},
          {latitude: bounds.southwest.lat, longitude: bounds.southwest.lng}
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
    getARSitesHiddenStars({id: selectedDestination.id})
      .then(res => {
        setHiddenStars(res.data[0]);
      })
      .finally(() => {});
  };

  const getArSiteCategories = () => {
    if (experienceType === EXPERIENCE_TYPE_CHOICES.GEO_AR_CHALLENGE) {
      getARSiteCategories({is_band: false})
        .then(res => {
          setCategories([...INITIAL_CATEGORIES, ...res.data]);
        })
        .finally(() => {});
    } else {
      const extractedCategories = new Set(updatedMarkers.map(item => item?.category));
      setCategories([...INITIAL_CATEGORIES, ...extractedCategories]);
    }
  };

  const getARStarSites = () => {
    getARSitesStars({id: selectedDestination.id})
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
            dispatch(updateSelectedDestinationBandLocation({id: siteId, lat: lat, long: long}));
          }
        } catch (error) {
          console.error("error", error);
        }
      });
    }
  };

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
          const isInsideSiteArea = isLocationPointInPolygon({latitude, longitude}, arrayPoints);
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

  const updateFriendImageState = (friendId, updates) => {
    setFriendImageStates(prev => ({
      ...prev,
      [friendId]: {
        ...prev[friendId],
        ...updates,
      },
    }));
  };

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
          {useCustomMarkers && (
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
    if (o?.lat_long) {
      return (
        <Marker
          ref={ref => {
            if (ref) {
              markerRefs.current[`marker-${o.id}`] = ref;
            }
          }}
          key={`marker-${o.id}`}
          coordinate={{
            latitude: o?.lat_long.coordinates[1],
            longitude: o?.lat_long.coordinates[0],
          }}
          title={o?.name}
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
            <View
              style={{
                width: widthPercentageToDP(10),
                height: widthPercentageToDP(10),
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Image
                resizeMode="cover"
                style={{
                  width: widthPercentageToDP(7),
                  height: widthPercentageToDP(7),
                  position: "absolute",
                  top: 2.5,
                  borderRadius: 100,
                }}
                source={{uri: o.localFilePath}}
              />
              <MarkerIcon
                color={o?.category?.color}
                width={widthPercentageToDP(10)}
                height={widthPercentageToDP(10)}
              />
            </View>
          )}
        </Marker>
      );
    }

    return null;
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
          arrayPoints.push({latitude: point[1], longitude: point[0]});
        }
      }
      const bounds = getBounds(arrayPoints);
      return bounds;
    } else {
      return null;
    }
  };

  const getFriends = () => {
    setLoadingCustomMarkers(true);
    getUserFriendList()
      .then(async response => {
        if (response) {
          console.log("Friend List Response:", response);
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

  const getFullCenter = () => {
    const bordersOfDestination = getBordersOfDestination();
    if (bordersOfDestination) {
      let arrayPoints = [];
      for (let i = 0; i < bordersOfDestination.coordinates.length; i++) {
        const points = bordersOfDestination.coordinates[i];
        for (let j = 0; j < points.length; j++) {
          const point = points[j];
          arrayPoints.push({latitude: point[1], longitude: point[0]});
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
        arrayPoints.push({latitude: point[1], longitude: point[0]});
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
      const originalMarkers = updatedMarkers;
      const filteredMarkers = originalMarkers.filter(site => site.category?.id === category);
      setFilteredUpdatedMarkers(filteredMarkers);
    } else {
      setFilteredUpdatedMarkers(updatedMarkers);
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

  const showAutoTooltipOnFirstMarker = () => {
    if (filteredUpdatedMarkers.length > 0 && !autoTooltipShownRef.current) {
      // Function to calculate distance between two coordinates (in meters)
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
      };

      // Find a marker that has no friends nearby
      const markerWithoutNearbyFriends = filteredUpdatedMarkers.find(marker => {
        if (!marker?.lat_long) return false;

        const markerLat = marker.lat_long.coordinates[1];
        const markerLon = marker.lat_long.coordinates[0];

        // Check if any friend is nearby (within 100 meters)
        const hasNearbyFriend = friendList.some(friend => {
          const friendHasLocation =
            !!friend?.ar_user_profile_user?.current_location &&
            !!friend?.ar_user_profile_user?.current_location?.coordinates?.length;

          if (!friendHasLocation) return false;

          const friendLat = friend.ar_user_profile_user.current_location.coordinates[1];
          const friendLon = friend.ar_user_profile_user.current_location.coordinates[0];

          const distance = calculateDistance(markerLat, markerLon, friendLat, friendLon);
          return distance <= 100; // 100 meters threshold
        });

        return !hasNearbyFriend;
      });

      // If no marker without nearby friends found, fallback to first valid marker
      const targetMarker =
        markerWithoutNearbyFriends || filteredUpdatedMarkers.find(marker => marker?.lat_long);

      if (targetMarker) {
        const markerRef = markerRefs.current[`marker-${targetMarker.id}`];
        if (markerRef) {
          // Delay to ensure marker is rendered and ready
          setTimeout(() => {
            markerRef.showCallout();
            autoTooltipShownRef.current = true;
          }, 800);
        }
      }
    }
  };

  const debounceSetMarkersData = markers => {
    setUpdatedMarkers(markers);
    setFilteredUpdatedMarkers(markers);
    setMarkersFullyLoaded(false);

    setTimeout(() => {
      setFilteredUpdatedMarkers([]);
    }, 250);

    setTimeout(() => {
      setLoadingCustomMarkers(false);
      setFilteredUpdatedMarkers(markers);
      setMarkersFullyLoaded(true);
    }, 500);
  };

  const refreshMapButtonHandler = () => {
    showMessage(
      "The map is now updated with the latest locations.",
      "success",
      "Location updated!"
    );
    getBandLocationUpdates();
  };

  const searchLocation = () => {
    if (!searchQuery.trim() || !filteredUpdatedMarkers.length) return;

    const lowercaseQuery = searchQuery.trim().toLowerCase();
    const matchedMarker = filteredUpdatedMarkers.find(
      marker => marker.name && marker.name.toLowerCase().includes(lowercaseQuery)
    );

    if (matchedMarker && matchedMarker.lat_long) {
      const markerCoordinate = {
        latitude: matchedMarker.lat_long.coordinates[1],
        longitude: matchedMarker.lat_long.coordinates[0],
        latitudeDelta: 0.01, // Closer zoom for better visibility of the marker
        longitudeDelta: 0.01,
      };

      // First animate to the marker location
      mapView.current?.animateToRegion(markerCoordinate, 1000);

      // After animation completes, show the callout
      setTimeout(() => {
        const markerRef = markerRefs.current[`marker-${matchedMarker.id}`];
        if (markerRef) {
          markerRef.showCallout();
        }
      }, 1500); // Wait a bit after animation to show callout
    } else {
      showMessage("No locations found matching your search.", "error", "Search failed");
    }
  };

  setTimeout(() => {
    setAndroidTrackViewChanges(false);
  }, 10000);

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

    if (experienceType === EXPERIENCE_TYPE_CHOICES.BAND) {
      bandLocationUpdatesIntervalId.current = setInterval(
        getBandLocationUpdates,
        BAND_LOCATION_UPDATE_INTERVAL_SECONDS
      );
    } else {
      friendsLocationUpdatesIntervalId.current = setInterval(
        getFriends,
        FRIENDS_LOCATION_UPDATE_INTERVAL_SECONDS
      );
    }

    return () => {
      clearInterval(bandLocationUpdatesIntervalId?.current);
      clearInterval(friendsLocationUpdatesIntervalId?.current);
    };
  }, []);

  useEffect(() => {
    let markers = [];
    switch (experienceType) {
      case EXPERIENCE_TYPE_CHOICES.BAND:
        if (selectedDestination?.ar_event_sites?.length) {
          markers = selectedDestination?.ar_event_sites.filter(
            site => !!site?.band_user && !!site?.category?.id
          );
        }
        break;
      case EXPERIENCE_TYPE_CHOICES.EVENT:
        if (selectedDestination?.ar_event_sites?.length) {
          markers = selectedDestination?.ar_event_sites.filter(
            site => !site?.band_user && !!site?.category?.id
          );
        }
        break;

      default:
        if (selectedDestination?.star_ar_sites?.length) {
          markers = selectedDestination?.star_ar_sites.filter(
            site => !site?.band_user && !site?.category?.id
          );
        }
        break;
    }

    const downloadAllImages = async () => {
      setLoadingCustomMarkers(true);

      const results = await Promise.all(
        markers.map(async (marker, index) => {
          const url = marker?.pin_challenge?.sponsored?.image;
          const fileName = `${index}_` + url.substring(url.lastIndexOf("/") + 1).split("?")[0];
          const localFilePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

          try {
            const downloadResult = await RNFS.downloadFile({
              fromUrl: url,
              toFile: localFilePath,
              background: false,
              discretionary: true,
              cacheable: true,
            }).promise;

            const updatedLocalFilePath =
              Platform.OS === "android" ? `file://${localFilePath}` : localFilePath;
            if (downloadResult.statusCode === 200) {
              return {...marker, localFilePath: updatedLocalFilePath};
            } else {
              return {...marker, localFilePath: null}; // Download failed, return null path
            }
          } catch (error) {
            return {...marker, localFilePath: null}; // Download error, return null path
          }
        })
      );

      debounceSetMarkersData(results);
    };

    downloadAllImages();
  }, [selectedDestination]);

  useEffect(() => {
    if (arSitesOn) {
      setFilteredUpdatedMarkers(updatedMarkers);
    } else {
      setFilteredUpdatedMarkers([]);
    }
  }, [arSitesOn]);

  // Auto show tooltip when all markers are fully loaded
  useEffect(() => {
    if (markersFullyLoaded && filteredUpdatedMarkers.length > 0 && !loadingCustomMarkers) {
      showAutoTooltipOnFirstMarker();
    }
  }, [markersFullyLoaded, filteredUpdatedMarkers, loadingCustomMarkers]);

  useFocusEffect(
    useCallback(() => {
      setShouldShowMap(true);
      // Reset auto tooltip flag when screen is focused
      autoTooltipShownRef.current = false;
      setMarkersFullyLoaded(false);

      return () => {
        setShouldShowMap(false);
      };
    }, [])
  );

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
          width: "100%",
          paddingTop: heightPercentageToDP(2),
          paddingBottom: heightPercentageToDP(2),
          alignItems: "center",
          flexDirection: "row",
          gap: 10,
        }}
      >
        <TransparentSearchBar
          placeholder="Search Locations"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchLocation}
        />
        <TouchableOpacity onPress={scrollRegionsPressHandler} style={_styles.scrollButton}>
          <Icon name={"doubleright"} family="antdesign" size={25} color="gray" />
        </TouchableOpacity>
      </View>

      <View
        style={{
          marginBottom: 10,
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        {isEvent ? (
          <FlatList
            style={{width: "100%", height: 50}}
            horizontal={true}
            data={categories}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => showFilteredList(item?.id)}
                activeOpacity={0.5}
                style={
                  item?.name === "Full"
                    ? _styles.selectButtonStyle
                    : {..._styles.unSelectButtonStyle, backgroundColor: item?.color}
                }
              >
                <Text style={_styles.buttonSelectText}>{item?.name}</Text>
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
            style={{width: "100%", height: 50}}
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
            {regions?.length
              ? regions.map(e => {
                  if (e?.geo_region)
                    return (
                      <TouchableOpacity
                        key={e?.id}
                        activeOpacity={0.5}
                        onPress={() => moveToRegion(e)}
                        style={
                          selectedRegionName === e?.name
                            ? _styles.selectButtonStyle
                            : _styles.unSelectButtonStyle
                        }
                      >
                        <Text style={_styles.buttonSelectText}>{e?.name || ""}</Text>
                      </TouchableOpacity>
                    );
                })
              : null}
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
            <AppSwitch
              onValueChange={() => setARSitesOnSwitch(currState => !currState)}
              value={arSitesOn}
            />
          </View>
        )}

        <View style={_styles.selectionsContainer}>
          <View>
            <Text style={_styles.selectionTextHeading}>My Friends</Text>
            <Text style={_styles.selectionTextDetails}>Live Location</Text>
          </View>
          <AppSwitch onValueChange={setFriendsLocationSitesOn} value={friendsLocationSitesOn} />
        </View>
        {experienceType === EXPERIENCE_TYPE_CHOICES.BAND && (
          <TouchableOpacity style={_styles.selectionsContainer} onPress={refreshMapButtonHandler}>
            <View style={{flexDirection: "row", gap: 16, justifyContent: "center"}}>
              <Text style={_styles.selectionTextHeading}>Refresh map</Text>
              <Icon name="reload1" family="antdesign" color={theme.lightColors.magenta} size={20} />
            </View>
          </TouchableOpacity>
        )}
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
        {shouldShowMap && (
          <MapView
            provider={PROVIDER_GOOGLE}
            ref={mapView}
            style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0}}
            initialRegion={initialRegion}
          >
            {!!filteredUpdatedMarkers?.length &&
              filteredUpdatedMarkers.map(marker => {
                return _markerView(marker);
              })}
            {friendsLocationSitesOn &&
              friendList.map(o => {
                return f_markerView(o);
              })}
          </MapView>
        )}
        {loadingCustomMarkers && (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: theme.lightColors.inputBG,
              flex: 1,
            }}
          >
            <MapSkeletonLoader shimmerBaseColor={theme.lightColors.inputBG} />
          </View>
        )}
      </View>
      <View>
        <View style={_styles.textView}>
          <Text style={_styles.s_list_text}>Click the pins to see more details.</Text>
        </View>
      </View>

      {popUpFacts && (
        <View style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0}}>
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
