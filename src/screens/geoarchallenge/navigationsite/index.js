import React, { useEffect, useRef, useState } from "react"

import { ActivityIndicator, FlatList, Image, ImageBackground, Keyboard, PermissionsAndroid, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import MapView, { Marker } from 'react-native-maps';
import HomeIcon from "../../../assets/geoar/home.svg"
import CloseBIcon from "../../../assets/geoar/close-square.svg"
import SkipIcon from "../../../assets/geoar/skip.svg"
import MarkerIcon from "../../../assets/geoar/marker_img.svg"
import VIForegroundService from '@voximplant/react-native-foreground-service';

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import { useNavigation } from "@react-navigation/native";
import GetLocation from "react-native-get-location";
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
import MapViewDirections from "react-native-maps-directions";
import { convertKilometersToMiles } from "../../../util/helpers";


const GeoArSiteNavigation = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [mileDistance, setMileDistance] = useState(0)
  const [durationMins, setDurationMins] = useState(0)

  const getCurrentLocation = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        setCurrentLocation({
          latitude: location.latitude,
          longitude: location.longitude
        })
      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      })
  }


  const [forceLocation, setForceLocation] = useState(true);
  const [highAccuracy, setHighAccuracy] = useState(true);
  const [locationDialog, setLocationDialog] = useState(true);
  const [significantChanges, setSignificantChanges] = useState(false);
  const [observing, setObserving] = useState(false);
  const [foregroundService, setForegroundService] = useState(false);
  const [useLocationManager, setUseLocationManager] = useState(false);
  const [location, setLocation] = useState(null);

  const watchId = useRef(null);

  const stopLocationUpdates = () => {
    if (Platform.OS === 'android') {
      VIForegroundService.getInstance()
        .stopService()
        .catch((err) => err);
    }
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setObserving(false);
    }
  };

  useEffect(() => {
    getCurrentLocation()
    getLocation()
    getLocationUpdates()
    return () => {
      stopLocationUpdates();
    };
  }, []);

  const hasPermissionIOS = async () => {
    const openSetting = () => {
      Linking.openSettings().catch(() => {
        Alert.alert('Unable to open settings');
      });
    };
    const status = await Geolocation.requestAuthorization('whenInUse');

    if (status === 'granted') {
      return true;
    }

    if (status === 'denied') {
      Alert.alert('Location permission denied');
    }

    if (status === 'disabled') {
      Alert.alert(
        `Turn on Location Services to allow "${appConfig.displayName}" to determine your location.`,
        '',
        [
          { text: 'Go to Settings', onPress: openSetting },
          { text: "Don't Use Location", onPress: () => { } },
        ],
      );
    }

    return false;
  };

  const hasLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const hasPermission = await hasPermissionIOS();
      return hasPermission;
    }

    if (Platform.OS === 'android' && Platform.Version < 23) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'Location permission denied by user.',
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Location permission revoked by user.',
        ToastAndroid.LONG,
      );
    }

    return false;
  };

  const getLocation = async () => {
    const hasPermission = await hasLocationPermission();

    if (!hasPermission) {
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        setLocation(position);
        console.log("getLocation", position);
      },
      error => {
        Alert.alert(`Code ${error.code}`, error.message);
        setLocation(null);
        console.log(error);
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: highAccuracy,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: forceLocation,
        forceLocationManager: useLocationManager,
        showLocationDialog: locationDialog,
      },
    );
  };

  const getLocationUpdates = async () => {
    const hasPermission = await hasLocationPermission();
    console.log("hasPermission", hasPermission)
    if (!hasPermission) {
      return;
    }
    if (Platform.OS === 'android' && foregroundService) {
      await startForegroundService();
    }
    setObserving(true);
    watchId.current = Geolocation.watchPosition(
      position => {
        console.log("getLocationUpdates:", position);
        setLocation(position);
      },
      error => {
        setLocation(null);
        console.log(error);
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: highAccuracy,
        distanceFilter: 100,
        interval: 5000,
        fastestInterval: 2000,
        forceRequestLocation: forceLocation,
        forceLocationManager: useLocationManager,
        showLocationDialog: locationDialog,
        useSignificantChanges: significantChanges,
      },
    );
  };

  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        rightComponent={() => <TouchableOpacity onPress={() => navigation.navigate("GeoArSiteArrived")}><SkipIcon style={{ width: 48, height: 36 }} /></TouchableOpacity>}
        centerComponent={{
          text: "Navigate to Site",
          style: [_styles.heading],
        }} backgroundColor="transparent" />

      {isLoading && <ActivityIndicator size="large" />}
      <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
        <View style={{ position: 'relative', height: 546, borderRadius: 16, overflow: 'hidden', marginTop: 20, marginHorizontal: 30 }}>
          <MapView
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            zoomEnabled={true}
            scrollEnabled={true}
            showsUserLocation={true}
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
                longitude: selectedGeoSite.lat_long.coordinates[0]
              }}
              title={selectedGeoSite.name}
            >
              <View style={{ width: 30, height: 30 }}>
                <MarkerIcon />
              </View>
            </Marker>

            {location && <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              }}
              title={'Current Location'}
            >
              <View style={{ width: 30, height: 30 }}>
                <MarkerIcon />
              </View>
            </Marker>
            }
            {currentLocation &&
              <MapViewDirections
                origin={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude
                }}
                precision={"high"}
                timePrecision={"now"}
                mode={"DRIVING"}
                destination={{
                  latitude: selectedGeoSite.lat_long.coordinates[1],
                  longitude: selectedGeoSite.lat_long.coordinates[0]
                }}
                apikey={"AIzaSyAd_EZRrfSjO2OS6p-h89wrT3y8xyREpTA"}
                strokeWidth={3}
                strokeColor="hotpink"
                optimizeWaypoints={true}
                onStart={(params) => {
                  console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                }}
                onReady={result => {
                  console.log(result)
                  console.log(result.legs)
                  console.log(`Distance: ${result.distance} km`)
                  console.log(`Duration: ${result.duration} min.`)
                  setMileDistance(convertKilometersToMiles(result.distance))
                  setDurationMins(result.duration)

                  // mapView.fitToCoordinates(result.coordinates, {
                  //   edgePadding: {
                  //     right: (width / 20),
                  //     bottom: (height / 20),
                  //     left: (width / 20),
                  //     top: (height / 20),
                  //   }
                  // });
                }}
                onError={(errorMessage) => {
                  // console.log('GOT AN ERROR');
                }}
              />
            }
          </MapView>
        </View>
        <View style={{ backgroundColor: "#131422", borderRadius: 16, paddingHorizontal: 20, paddingBottom: 20, marginVertical: 20, alignItems: 'center' }}>
          <HomeIcon style={{ width: 42, height: 4, marginBottom: 15, marginTop: 10 }} />
          <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <CloseBIcon style={{ width: 32, height: 32 }} />
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <Text style={_styles.site_distance_time_value_text}>{Math.round(durationMins)} <Text style={{ fontSize: 14 }}>mins</Text></Text>
              <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                <Text style={_styles.site_distance_time_text}>{mileDistance.toFixed(2)} <Text style={{ fontSize: 10 }}>miles</Text></Text>
                <Text style={_styles.site_distance_time_text}>.</Text>
                <Text style={_styles.site_distance_time_text}>10:10 am</Text>
              </View>
            </View>
            <View></View>
          </View>
        </View>
      </ScrollView>
    </BackgroundWithImage >
  )
}



export default GeoArSiteNavigation