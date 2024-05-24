import React, { useEffect, useRef, useState } from "react"

import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import { useNavigation } from "@react-navigation/native"
import CarIcon from "../../../assets/geoar/car.svg"
import RoadIcon from "../../../assets/geoar/road.svg"
import TimeIcon from "../../../assets/geoar/time.svg"


import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import { height, width } from "../../../util/AppDimensions";
import { AppButton } from "../../../components";
import Geocoder from 'react-native-geocoding';
import MapView, { Marker } from 'react-native-maps';
import MarkerIcon from "../../../assets/geoar/marker_img.svg"
import MapViewDirections from 'react-native-maps-directions';
import GetLocation from "react-native-get-location";


const GeoArSiteRoutes = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()
  const mapView = useRef();

  const selectedDestination = useSelector(state => state.ar?.selectedDestination)
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite)
  const anywhereARChallenges = useSelector(state => state.ar?.anywhereChallenges)
  const [currentLocation, setCurrentLocation] = useState(null)

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

  useEffect(() => {
    getCurrentLocation()
  }, []);

  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: selectedGeoSite.name,
          style: [_styles.heading],
        }} backgroundColor="transparent" />

      {isLoading && <ActivityIndicator size="large" />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', position: 'relative', height: 292, borderRadius: 16, overflow: 'hidden' }}>
          <MapView
            ref={mapView}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            initialRegion={{
              latitude: selectedGeoSite.lat_long.coordinates[1],
              longitude: selectedGeoSite.lat_long.coordinates[0],
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
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

            {currentLocation && <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude
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
                  console.log(`Distance: ${result.distance} km`)
                  console.log(`Duration: ${result.duration} min.`)

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

        <View style={{ flexDirection: 'row', paddingVertical: 20, justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={_styles.site_d_header_text}>Routes</Text>
          <TouchableOpacity>
            <Text style={_styles.site_d_header_number_text}>02</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: "#131422", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CarIcon style={{ width: 32, height: 32 }} />
            <View style={{ marginHorizontal: 20, justifyContent: 'flex-start' }}>
              <Text style={_styles.site_via_text}>via Churchill Roosevelt Hwy</Text>
              <Text style={_styles.site_via_des_text}>Fastest route now due to traffic conditions</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 10 }}>
            <RoadIcon style={{ width: 20, height: 20 }} />
            <Text style={_styles.site_distance_time_text}>Distance</Text>
            <Text style={_styles.site_distance_time_value_text}>18.4 <Text style={{ fontSize: 10 }}>miles</Text></Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TimeIcon style={{ width: 20, height: 20 }} />
            <Text style={_styles.site_distance_time_text}>Est. Time</Text>
            <Text style={_styles.site_distance_time_value_text}>31 <Text style={{ fontSize: 10 }}>mins</Text></Text>
          </View>
          <View style={{ justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
            <AppButton
              onPress={() => navigation.navigate("GeoArSiteNavigation")}
              buttonStyle={_styles.buttonStyle}
              containerStyle={_styles.buttonContainerStyle}
              title={"Navigate"}
              loading={isLoading}
            />
          </View>
        </View>
        <View style={{ backgroundColor: "#131422", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CarIcon style={{ width: 32, height: 32 }} />
            <View style={{ marginHorizontal: 20, justifyContent: 'flex-start' }}>
              <Text style={_styles.site_via_text}>via Southern Main Rd and Churchill Roosevelt Hwy</Text>
              <Text style={_styles.site_via_des_text}>Fastest route now due to traffic conditions</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 10 }}>
            <RoadIcon style={{ width: 20, height: 20 }} />
            <Text style={_styles.site_distance_time_text}>Distance</Text>
            <Text style={_styles.site_distance_time_value_text}>21.4 <Text style={{ fontSize: 10 }}>miles</Text></Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TimeIcon style={{ width: 20, height: 20 }} />
            <Text style={_styles.site_distance_time_text}>Est. Time</Text>
            <Text style={_styles.site_distance_time_value_text}>40 <Text style={{ fontSize: 10 }}>mins</Text></Text>
          </View>
          <View style={{ justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
            <AppButton
              onPress={() => navigation.navigate("GeoArSiteNavigation")}
              buttonStyle={_styles.buttonStyle}
              containerStyle={_styles.buttonContainerStyle}
              title={"Navigate"}
              loading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </BackgroundWithImage >
  )
}



export default GeoArSiteRoutes