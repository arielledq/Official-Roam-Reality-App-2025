import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { showMessage } from '../../util/helpers'
import Geolocation from 'react-native-geolocation-service'
import { hasLocationPermission } from '../../util/LocationLib'

const userLocationHook = () => {
  const initalLocationEnabled = useSelector(state => state?.login?.data?.locationEnabled)
  const watchId = useRef(null)

  const [location, setLocation] = useState({})
  const [locationEnabled, setLocationEnabled] = useState(false)

  const getLocation = async () => {
    const hasPermission = await hasLocationPermission()
    if (!hasPermission) {
      return
    }
    watchId.current = Geolocation.watchPosition(
      position => {
        setLocation(position)
      },
      error => {
        setLocation(null)
        console.error(error)
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        distanceFilter: 5,
        interval: 5000,
        fastestInterval: 2000,
        forceRequestLocation: true,
        forceLocationManager: false,
        showLocationDialog: true,
        useSignificantChanges: false,
      }
    )
  }

  const stopLocationUpdates = () => {
    if (watchId.current !== null) {
      Geolocation.clearWatch(watchId.current)
      watchId.current = null
      Geolocation.stopObserving()
    }
  }

  useEffect(() => {
    if (locationEnabled) {
      getLocation()
    } else {
    }
  }, [locationEnabled])

  useEffect(() => {
    if (initalLocationEnabled) getLocation()
  }, [])

  return {
    setLocationEnabled,
  }
}

export default userLocationHook
