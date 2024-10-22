import React, { useContext, useEffect, useRef, useState } from 'react'

import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import BackgroundWithImage from '../../../components/background'
import AppHeader from '../../../components/header'
import HomeIcon from '../../../assets/geoar/home.svg'
import CloseBIcon from '../../../assets/geoar/close-square.svg'
import SkipIcon from '../../../assets/geoar/skip.svg'
import MarkerIcon from '../../../assets/geoar/marker_img.svg'
import CenterIcon from '../../../assets/Icons/CenterIcon.svg'

import { useSelector } from 'react-redux'
import useStyles from './styles'
import { useNavigation, useRoute } from '@react-navigation/native'
import { convertKilometersToMiles, showMessage } from '../../../util/helpers'
import moment from 'moment'
import { getLocationDistance, hasLocationPermission } from '../../../util/LocationLib'
import { GeolocationContext } from '../../../GeolocationProvider'
import Sound from 'react-native-sound'
import Config from '../../../config'
import MapboxGL from '@rnmapbox/maps'

const GeoArSiteNavigation = () => {
  const route = useRoute()
  const _styles = useStyles()
  const navigation = useNavigation()
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite)
  const { userLocation } = useContext(GeolocationContext)
  const [latitude, setLatitude] = useState(userLocation?.latitude)
  const [longitude, setLongitude] = useState(userLocation?.longitude)
  const [mileDistance, setMileDistance] = useState(0)
  const [durationMins, setDurationMins] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState('')
  const [location, setLocation] = useState(null)
  const [router, setRoute] = useState(null)
  const [originMap, setOriginMap] = useState(null)
  const [destinationMap, setDestinationMap] = useState(null)
  const [path, setPath] = useState(null)
  const [currentHeading, setCurrentHeading] = useState(0)
  const [mapHeading, setMapHeading] = useState(0)
  const [rerouting, setRerouting] = useState(false)
  const [nextCoordinateS, setNextCoordinateS] = useState(null)
  const mapView = useRef(null)
  const currentPathRef = useRef(null)

  const calculatedEstimatedTime = duration => {
    const now = new Date()
    const calcTime = moment(now).add(duration, 'minutes').format('hh:mm A')
    setEstimatedTime(calcTime)
  }

  const getFirstLocation = () => {
    const position = { coords: { latitude, longitude } }

    const endPosition = {
      latitude: selectedGeoSite.lat_long.coordinates[1],
      longitude: selectedGeoSite.lat_long.coordinates[0],
    }

    const initialHeading = calculateBearing(
      position.coords.latitude,
      position.coords.longitude,
      endPosition.latitude,
      endPosition.longitude
    )
    setCurrentHeading(initialHeading)

    const origin = [position.coords.longitude, position.coords.latitude]

    const destination = [
      selectedGeoSite.lat_long.coordinates[0],
      selectedGeoSite.lat_long.coordinates[1],
    ]

    setOriginMap(origin)
    setDestinationMap(destination)
    setLocation(position)
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

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in kilometers
    return distance * 1000 // Convert to meters
  }

  function findNextCoordinate(currentLocation, coordinates) {
    if (!currentLocation || !path) return false
    let closestCoordinate = null
    let closestDistance = Infinity

    for (let i = 0; i < coordinates?.length; i++) {
      const coord = coordinates[i]
      const distance = getDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        coord[1], // Latitude
        coord[0] // Longitude
      )

      if (distance < closestDistance) {
        closestDistance = distance
        closestCoordinate = coord
      }
    }

    return closestCoordinate
  }

  const isOffRoute = (currentLocation, path, threshold = 25) => {
    const nextCoordinate = findNextCoordinate(currentLocation, path)
    if (!nextCoordinate) return false

    const distanceToPath = getDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      nextCoordinate[1],
      nextCoordinate[0]
    )
    //
    // console.log('isOffRoute currentPathRef.current ', currentPathRef.current )
    // console.log('isOffRoute path', path)
    // console.log('isOffRoute distanceToPath', distanceToPath)
    // console.log('isOffRoute threshold', threshold)

    return distanceToPath > threshold
  }

  function compareArrays(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false; // Arrays do not have the same length
    }

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i].length !== arr2[i].length) {
        return false; // Nested arrays do not have the same length
      }

      for (let j = 0; j < arr1[i].length; j++) {
        if (arr1[i][j] !== arr2[i][j]) {
          return false; // Found a difference in a nested element
        }
      }
    }

    return true; // Arrays are identical
  }


  const getLocationUpdates = async () => {
    const hasPermission = await hasLocationPermission()
    if (!hasPermission) {
      return
    }

    const position = { coords: { latitude, longitude } }

    const dis = getLocationDistance(position.coords, {
      latitude: selectedGeoSite.lat_long.coordinates[1],
      longitude: selectedGeoSite.lat_long.coordinates[0],
    })

    if (rerouting) return

    if (isOffRoute(position.coords, path)) {
      mapBoxGetRoute()
      const compRes = compareArrays(currentPathRef.current, path)
      if (!compRes) {
        setRerouting(true)
        setOriginMap([position.coords.longitude, position.coords.latitude])
        const heading = calculateBearing(
          position.coords.latitude,
          position.coords.longitude,
          path[0][1],
          path[0][0]
        )
        setCurrentHeading(heading)
        playProximitySound()
        setTimeout(() => {
          setRerouting(false)
        }, 2000)
      }
      return
    }

    const nextCoordinate = findNextCoordinate(position.coords, path)

    if (nextCoordinate && nextCoordinateS !== nextCoordinate) {
      setNextCoordinateS(nextCoordinate)
      const heading = calculateBearing(
        position.coords.latitude,
        position.coords.longitude,
        nextCoordinate[1],
        nextCoordinate[0]
      )
      setCurrentHeading(heading)
    } else {
      if (Platform.OS === 'ios') setCurrentHeading(mapHeading)
    }

    if (dis < selectedGeoSite.check_in_site_radius) {
      navigation.replace('GeoArSiteArrived')
      return
    }

    if (location && location.coords) {
      const lastLocationDistance = getLocationDistance(position.coords, location.coords)
      if (lastLocationDistance > 10) {
        setLocation(position)
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

  const mapBoxGetRoute = () => {
    // console.log("mapBoxGetRoute")
    if (!originMap || !destinationMap) {
      return
    }

    const origin = originMap.join(',')
    const destination = destinationMap.join(',')
    const mapType = route?.params?.mapMode
    const MBUrlBase = 'https://api.mapbox.com/directions/v5/mapbox/'
    const MBUrlParams = `?geometries=geojson&steps=true&access_token=${Config.MAPBOX_PUBLIC_KEY}`
    const MBUrl = `${MBUrlBase}${mapType}/${origin};${destination}${MBUrlParams}`

    // Fetch route data from Mapbox Directions API
    fetch(MBUrl)
      .then(response => response.json())
      .then(data => {
        if (data?.routes?.length) {
          const distance = data.routes[0].distance
          const duration = data.routes[0].duration
          setMileDistance(convertKilometersToMiles(distance / 1000))
          setDurationMins(duration / 60)
          calculatedEstimatedTime(duration / 60)
          setPath(data.routes[0].geometry.coordinates)
          currentPathRef.current = data.routes[0].geometry.coordinates
          const routeLine = {
            type: 'Feature',
            geometry: data.routes[0].geometry,
          }
          setRoute(routeLine)
        }
      })
      .catch(error => console.error(error))
  }

  useEffect(() => {
    if (userLocation) {
      getLocationUpdates()
    }
  }, [userLocation, path, latitude, longitude])

  useEffect(() => {
    mapBoxGetRoute()
  }, [originMap, destinationMap])

  useEffect(() => {
    getFirstLocation()
  }, [])

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      {rerouting && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              borderRadius: 16,
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 5,
              paddingTop: 5,
              justifyContent: 'center',
              alignItems: 'center',
              width: 250,
              height: 200,
            }}
          >
            <ActivityIndicator size='large' color={'#ffffff'} />
            <Text style={{ color: '#fff', fontSize: 20, marginTop: 20 }}>Calculating route...</Text>
          </View>
        </View>
      )}
      <AppHeader
        rightComponent={() => (
          <TouchableOpacity
            onPress={() => {
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
          <TouchableOpacity
            onPress={() => mapView.current?.setCamera({ centerCoordinate: [longitude, latitude], heading: currentHeading, animationDuration:500 })}
            style={{
              position: 'absolute',
              bottom: 5,
              right:5,
              zIndex: 1000,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 25,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CenterIcon  />
          </TouchableOpacity>
          {originMap && destinationMap && (
            <MapboxGL.MapView style={{ flex: 1 }} compassEnabled scaleBarEnabled={false}>
              <MapboxGL.Camera
                ref={mapView}
                zoomLevel={18}
                centerCoordinate={[longitude, latitude]}
                pitch={60} // Sets the 3D pitch angle
                animationMode='flyTo'
                animationDuration={250}
                heading={currentHeading}
              />
              <MapboxGL.UserLocation
                visible={true}
                minDisplacement={5}
                onUpdate={location => {
                  if(location.coords.latitude !== latitude || location.coords.longitude !== longitude) {
                    const distance = getDistance(
                      location.coords.latitude,
                      location.coords.longitude,
                      latitude,
                      longitude
                    )
                    if (distance < 5) return
                    console.log('distance', distance)
                    setLatitude(location.coords.latitude)
                    setLongitude(location.coords.longitude)
                    if (Platform.OS === 'ios') {
                      setMapHeading(location.coords.heading)
                    }
                  }
                }}
              />

              {/*<MapboxGL.PointAnnotation id='currentLocation' coordinate={[longitude, latitude]} />*/}

              {/* Origin and Destination Markers */}
              {/*<MapboxGL.PointAnnotation id="origin" coordinate={originMap} />*/}
              <MapboxGL.PointAnnotation id='currentLocation' coordinate={originMap}>
                <MarkerIcon style={{ width: 25, height: 40 }} />
              </MapboxGL.PointAnnotation>
              <MapboxGL.PointAnnotation id='currentLocation' coordinate={destinationMap}>
                <MarkerIcon style={{ width: 25, height: 40 }} />
              </MapboxGL.PointAnnotation>

              {/* Display Route if Available */}
              {router && (
                <MapboxGL.ShapeSource id='routeSource' shape={router}>
                  <MapboxGL.LineLayer
                    id='routeLayer'
                    style={{
                      lineColor: '#812fac',
                      lineWidth: 10,
                      lineJoin: 'round',
                      lineCap: 'round',
                    }}
                  />
                </MapboxGL.ShapeSource>
              )}
            </MapboxGL.MapView>
          )}
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
