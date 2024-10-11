import React, { useContext, useEffect, useRef, useState } from 'react'

import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import BackgroundWithImage from '../../../components/background'
import AppHeader from '../../../components/header'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import HomeIcon from '../../../assets/geoar/home.svg'
import CloseBIcon from '../../../assets/geoar/close-square.svg'
import SkipIcon from '../../../assets/geoar/skip.svg'
import MarkerIcon from '../../../assets/geoar/marker_img.svg'

import { useDispatch, useSelector } from 'react-redux'
import useStyles from './styles'
import { useNavigation, useRoute } from '@react-navigation/native'
import Geolocation, { GeoPosition } from 'react-native-geolocation-service'
import MapViewDirections from 'react-native-maps-directions'
import { convertKilometersToMiles, showMessage } from '../../../util/helpers'
import moment from 'moment'
import Strings from '../../../constants/Strings'
import mapCustomStyle from '../../../constants/MapCustomStyles'
import { getLocationDistance, hasLocationPermission } from '../../../util/LocationLib'
import { GeolocationContext } from '../../../GeolocationProvider'
import Sound from 'react-native-sound'

const MARGIN_ARRIVAL_METERS = 50

const GeoArSiteNavigation = ({}) => {
  const [mapRegion, setMapRegion] = useState({
    longitude: 0,
    latitude: 0,
    longitudeDelta: 0.004,
    latitudeDelta: 0.009,
  })
  const compassHeading = useRef(0)

  const _styles = useStyles()
  const navigation = useNavigation()
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite)
  const { userLocation } = useContext(GeolocationContext)
  const latitude = userLocation?.latitude
  const longitude = userLocation?.longitude
  const [isLoading, setIsLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [mileDistance, setMileDistance] = useState(0)
  const [durationMins, setDurationMins] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState('')
  const [location, setLocation] = useState(null)
  const [isFirstCalculation, setIsFirstCalculation] = useState(true)
  const mapView = useRef()
  const watchId = useRef(null)
  const route = useRoute()

  const stopLocationUpdates = () => {
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current)
      watchId.current = null
      Geolocation.stopObserving()
    }
  }

  const calculatedEstimatedTime = duration => {
    var now = new Date()
    const calcTime = moment(now).add(duration, 'minutes').format('hh:mm A')
    setEstimatedTime(calcTime)
  }

  useEffect(() => {
    getFirstLocation()
    return () => {
      stopLocationUpdates()
    }
  }, [])

  const getFirstLocation = () => {
    const position = {
      coords: {
        latitude,
        longitude,
      },
    }

    const endPosition = {
      latitude: selectedGeoSite.lat_long.coordinates[1],
      longitude: selectedGeoSite.lat_long.coordinates[0],
    }

    const currentRegion = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      latitudeDelta: 0.0032,
      longitudeDelta: 0.0032,
    }
    setMapRegion(currentRegion)

    const headingValue = calculateBearing(
      position.coords.latitude,
      position.coords.longitude,
      endPosition.latitude,
      endPosition.longitude
    )

    compassHeading.current = headingValue

    setLocation(position)
    setCurrentLocation(position)
    if (mapView && mapView.current) {
      setTimeout(() => {
        mapView.current.animateCamera({
          center: position.coords,
          heading: compassHeading.current,
          zoom: 17,
        })
      }, 500)
    }
  }

  function calculateBearing(startLat, startLng, endLat, endLng) {
    const startLatRad = (Math.PI / 180) * startLat
    const startLngRad = (Math.PI / 180) * startLng
    const endLatRad = (Math.PI / 180) * endLat
    const endLngRad = (Math.PI / 180) * endLng

    const dLng = endLngRad - startLngRad

    const x = Math.sin(dLng) * Math.cos(endLatRad)
    const y =
      Math.cos(startLatRad) * Math.sin(endLatRad) -
      Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(dLng)

    let bearing = Math.atan2(x, y)
    bearing = (bearing * 180) / Math.PI // Convert from radians to degrees
    bearing = (bearing + 360) % 360 // Normalize to 0-360

    return bearing
  }

  const getLocationUpdates = async () => {

    const hasPermission = await hasLocationPermission()
    if (!hasPermission) {
      return
    }

    const position = {
      coords: {
        latitude,
        longitude,
      },
    }

    const dis = getLocationDistance(position.coords, {
      latitude: selectedGeoSite.lat_long.coordinates[1],
      longitude: selectedGeoSite.lat_long.coordinates[0],
    })

    if (dis < selectedGeoSite.check_in_site_radius) {
      navigation.replace('GeoArSiteArrived')
      stopLocationUpdates()
      return
    }

    if (location && location.coords) {
      const lastLocationDistance = getLocationDistance(position.coords, location.coords)
      if (lastLocationDistance > 10) {
        setLocation(position)
        // mapView.current.animateCamera({ center: position.coords, heading: compassHeading.current, zoom: 17 });
      }
    }
  }

  const minOrHoursWalkDriving = walkDurationMins => {
    if (walkDurationMins < 60) {
      return (
        <>
          {Math.round(walkDurationMins)} <Text style={{ fontSize: 14 }}>mins</Text>
        </>
      )
    } else if (walkDurationMins >= 60) {
      var hours = Math.floor(walkDurationMins / 60)
      return (
        <>
          {Math.round(hours)} <Text style={{ fontSize: 14 }}>hours</Text>
        </>
      )
    }
  }

  const playProximitySound = () => {
    Sound.setCategory('Playback')
    let proximitySound = new Sound('record.mp3', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.error('failed to load the sound', error)
      } else {
        proximitySound.play()
      }
    })
  }

  useEffect(() => {
    if (userLocation) {
      getLocationUpdates()
    }
  }, [userLocation])

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        rightComponent={() => (
          <TouchableOpacity
            onPress={() => {
              stopLocationUpdates()
              navigation.replace('ChallengeSelection')
            }}
          >
            <SkipIcon style={{ width: 48, height: 36 }} />
          </TouchableOpacity>
        )}
        centerComponent={{
          text: 'Navigate to Site',
          style: [_styles.heading],
        }}
        backgroundColor='transparent'
      />

      {isLoading && <ActivityIndicator size='large' />}
      <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            position: 'relative',
            minHeight: 520,
            borderRadius: 16,
            overflow: 'hidden',
            marginTop: 20,
            marginHorizontal: 30,
          }}
        >
          <MapView
            customMapStyle={mapCustomStyle}
            provider={PROVIDER_GOOGLE}
            showsCompass={true}
            ref={mapView}
            zoomControlEnabled={true}
            showsTraffic={true}
            // region={mapRegion}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
            showsMyLocationButton={true}
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
                longitude: selectedGeoSite.lat_long.coordinates[0],
              }}
              title={selectedGeoSite.name}
            >
              <View style={{ width: 30, height: 30 }}>
                <MarkerIcon />
              </View>
            </Marker>

            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.coords.latitude,
                  longitude: currentLocation.coords.longitude,
                }}
                title={'Start Location'}
              >
                <View style={{ width: 30, height: 30 }}>
                  <MarkerIcon />
                </View>
              </Marker>
            )}
            {location && (
              <MapViewDirections
                origin={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                precision={'high'}
                timePrecision={'now'}
                mode={route?.params?.mapMode}
                destination={{
                  latitude: selectedGeoSite.lat_long.coordinates[1],
                  longitude: selectedGeoSite.lat_long.coordinates[0],
                }}
                apikey={Strings.GOOGLE_PLACE_API_KEY}
                strokeWidth={8}
                strokeColor='#01AFFC'
                optimizeWaypoints={true}
                onStart={params => {}}
                onReady={result => {
                  setMileDistance(convertKilometersToMiles(result.distance))
                  setDurationMins(result.duration)
                  calculatedEstimatedTime(result.duration)
                  if (!isFirstCalculation) {
                    showMessage('Route recalculated!')
                    playProximitySound()
                  } else {
                    setIsFirstCalculation(false) // Mark the first calculation as completed
                  }
                }}
                onError={errorMessage => {
                  console.error('onError', errorMessage)
                }}
              />
            )}
          </MapView>
        </View>
        <View
          style={{
            backgroundColor: '#131422',
            borderRadius: 16,
            paddingHorizontal: 20,
            paddingBottom: 20,
            marginVertical: 20,
            alignItems: 'center',
          }}
        >
          <HomeIcon style={{ width: 42, height: 4, marginBottom: 15, marginTop: 10 }} />
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <TouchableOpacity onPress={() => navigation.replace('ChallengeSelection')}>
              <CloseBIcon style={{ width: 32, height: 32 }} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <Text style={_styles.site_distance_time_value_text}>
                {minOrHoursWalkDriving(durationMins)}
              </Text>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
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
  )
}

export default GeoArSiteNavigation
