import React, { useContext, useEffect, useRef, useState } from 'react'

import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import BackgroundWithImage from '../../../components/background'
import AppHeader from '../../../components/header'
import { useNavigation } from '@react-navigation/native'
import CarIcon from '../../../assets/geoar/car.svg'
import RoadIcon from '../../../assets/geoar/road.svg'
import TimeIcon from '../../../assets/geoar/time.svg'

import { useDispatch, useSelector } from 'react-redux'
import useStyles from './styles'
import { height, width } from '../../../util/AppDimensions'
import { AppButton } from '../../../components'
import Geocoder from 'react-native-geocoding'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import MarkerIcon from '../../../assets/geoar/marker_img.svg'
import MapViewDirections from 'react-native-maps-directions'
import GetLocation from 'react-native-get-location'
import { convertKilometersToMiles } from '../../../util/helpers'
import Strings from '../../../constants/Strings'
import { getBounds, getCenterOfBounds } from '../../../util/LocationLib'
import { GeolocationContext } from '../../../GeolocationProvider'

const GeoArSiteRoutes = ({}) => {
  const _styles = useStyles()
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()
  const mapView = useRef()
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite)
  const { userLocation } = useContext(GeolocationContext)
  const latitude = userLocation?.latitude
  const longitude = userLocation?.longitude
  const [mileDistance, setMileDistance] = useState(0)
  const [durationMins, setDurationMins] = useState(0)
  const [walkDurationMins, setWalkDurationMins] = useState(0)
  const [routes, setRoutes] = useState(0)

  const getFullBounds = _ => {
    if (selectedGeoSite.geo_site_border) {
      let arrayPoints = []
      for (let i = 0; i < selectedGeoSite.geo_site_border.coordinates.length; i++) {
        const points = selectedGeoSite.geo_site_border.coordinates[i]
        for (let j = 0; j < points.length; j++) {
          const point = points[j]
          arrayPoints.push({ latitude: point[1], longitude: point[0] })
        }
      }
      const bounds = getBounds(arrayPoints)
      return bounds
    } else {
      return null
    }
  }

  const getFullCenter = _ => {
    if (selectedGeoSite.geo_site_border) {
      let arrayPoints = []
      for (let i = 0; i < selectedGeoSite.geo_site_border.coordinates.length; i++) {
        const points = selectedGeoSite.geo_site_border.coordinates[i]
        for (let j = 0; j < points.length; j++) {
          const point = points[j]
          arrayPoints.push({ latitude: point[1], longitude: point[0] })
        }
      }
      const latitude_longitude = getCenterOfBounds(arrayPoints)
      return latitude_longitude
    } else {
      return null
    }
  }

  const initialRegion = {
    latitude: selectedGeoSite.lat_long.coordinates[1],
    longitude: selectedGeoSite.lat_long.coordinates[0],
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }
  const full_latitude_longitude = getFullCenter()
  const full_bounds = getFullBounds()
  if (full_bounds) {
    initialRegion.latitudeDelta = Number(full_bounds.maxLat - full_bounds.minLat)
    initialRegion.longitudeDelta = Number(full_bounds.maxLng - full_bounds.minLng)
  }
  if (full_latitude_longitude) {
    initialRegion.latitude = Number(full_latitude_longitude.latitude)
    initialRegion.longitude = Number(full_latitude_longitude.longitude)
  }

  const minOrHoursWalkDriving = (walkDurationMins, mode) => {
    if (walkDurationMins < 60) {
      return (
        <>
          {Math.round(walkDurationMins)} <Text style={{ fontSize: 10 }}>mins ({mode})</Text>
        </>
      )
    } else if (walkDurationMins >= 60) {
      var hours = Math.floor(walkDurationMins / 60)
      return (
        <>
          {Math.round(hours)} <Text style={{ fontSize: 10 }}>hours ({mode})</Text>
        </>
      )
    }
  }

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: selectedGeoSite.name,
          style: [_styles.heading],
        }}
        backgroundColor='transparent'
      />

      {isLoading && <ActivityIndicator size='large' />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            width: '100%',
            position: 'relative',
            height: 292,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            ref={mapView}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            initialRegion={initialRegion}
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

            {latitude && longitude && (
              <Marker
                coordinate={{
                  latitude: latitude,
                  longitude: longitude,
                }}
                title={'Current Location'}
              >
                <View style={{ width: 30, height: 30 }}>
                  <MarkerIcon />
                </View>
              </Marker>
            )}
            {latitude && longitude && (
              <MapViewDirections
                origin={{
                  latitude: latitude,
                  longitude: longitude,
                }}
                precision={'high'}
                timePrecision={'now'}
                mode={'DRIVING'}
                destination={{
                  latitude: selectedGeoSite.lat_long.coordinates[1],
                  longitude: selectedGeoSite.lat_long.coordinates[0],
                }}
                apikey={Strings.GOOGLE_PLACE_API_KEY}
                strokeWidth={3}
                strokeColor='hotpink'
                optimizeWaypoints={true}
                onStart={params => {}}
                onReady={result => {
                  setMileDistance(convertKilometersToMiles(result.distance))
                  setDurationMins(result.duration)
                  setRoutes(1)
                }}
                onError={errorMessage => {
                  console.error('GOT AN ERROR', errorMessage)
                  setRoutes(0)
                }}
              />
            )}
            {latitude && longitude && (
              <MapViewDirections
                origin={{
                  latitude: latitude,
                  longitude: longitude,
                }}
                precision={'high'}
                timePrecision={'now'}
                mode={'WALKING'}
                destination={{
                  latitude: selectedGeoSite.lat_long.coordinates[1],
                  longitude: selectedGeoSite.lat_long.coordinates[0],
                }}
                apikey={Strings.GOOGLE_PLACE_API_KEY}
                strokeWidth={0}
                strokeColor='hotpink'
                optimizeWaypoints={true}
                onStart={params => {}}
                onReady={result => {
                  setWalkDurationMins(result.duration)
                  setRoutes(1)
                }}
                onError={errorMessage => {
                  console.error('GOT AN ERROR', errorMessage)
                  setRoutes(0)
                }}
              />
            )}
          </MapView>
        </View>

        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 20,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={_styles.site_d_header_text}>Routes</Text>
          <TouchableOpacity>
            <Text style={_styles.site_d_header_number_text}>{routes}</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{ backgroundColor: '#131422', borderRadius: 16, padding: 20, marginBottom: 20 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CarIcon style={{ width: 32, height: 32 }} />
            <View style={{ marginHorizontal: 20, justifyContent: 'flex-start' }}>
              <Text style={_styles.site_via_text}>Route Available</Text>
              <Text style={_styles.site_via_des_text}>
                Fastest route now due to traffic conditions
              </Text>
            </View>
          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 10 }}
          >
            <RoadIcon style={{ width: 20, height: 20 }} />
            <Text style={_styles.site_distance_time_text}>Distance</Text>
            <Text style={_styles.site_distance_time_value_text}>
              {mileDistance.toFixed(2)} <Text style={{ fontSize: 10 }}>miles</Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TimeIcon style={{ width: 20, height: 20 }} />
            <Text style={_styles.site_distance_time_text}>Est. Time</Text>
            <Text style={_styles.site_distance_time_value_text}>
              {minOrHoursWalkDriving(durationMins, 'Drive')} /{' '}
              {minOrHoursWalkDriving(walkDurationMins, 'Walk')}
            </Text>
          </View>
          <View style={{ justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
            <AppButton
              onPress={() => navigation.navigate('GeoArSiteNavigation', { mapMode: 'driving' })}
              buttonStyle={_styles.buttonStyle}
              containerStyle={_styles.buttonContainerStyle}
              title={'Drive To Location'}
              loading={isLoading}
            />
          </View>
          <View style={{ justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
            <AppButton
              onPress={() => navigation.navigate('GeoArSiteNavigation', { mapMode: 'walking' })}
              buttonStyle={_styles.buttonStyle}
              containerStyle={_styles.buttonContainerStyle}
              title={'Walk to Location'}
              loading={isLoading}
            />
          </View>
        </View>
        {/* <View style={{ backgroundColor: "#131422", borderRadius: 16, padding: 20, marginBottom: 20 }}>
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
        </View> */}
      </ScrollView>
    </BackgroundWithImage>
  )
}

export default GeoArSiteRoutes
