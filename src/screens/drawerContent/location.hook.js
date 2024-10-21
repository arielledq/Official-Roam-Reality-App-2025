import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Geolocation from 'react-native-geolocation-service'
import { hasLocationPermission } from '../../util/LocationLib'
import { updateUserLocationData } from '../../redux/Login'
import { updateUserLocation } from '../../network'

const WATCH_POSITION_CONFIG = {
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

const userLocationHook = () => {
  const [loading, setLoading] = useState(false)

  const userData = useSelector(state => state?.login?.data)

  const dispatch = useDispatch()

  const userLocation = userData?.user?.user_ar_profile?.current_location?.coordinates
  const locationIsEnabled = !!userLocation?.length

  const getLocation = async () => {
    const hasPermission = await hasLocationPermission()
    if (!hasPermission) {
      return
    }
    setLoading(true)

    Geolocation.watchPosition(
      position => {
        const coords = {
          latitude: position?.coords?.latitude,
          longitude: position?.coords?.longitude,
        }
        updateUserLocationAPI(coords)
        setLoading(false)
      },
      error => {
        console.error('[location.hook] Geolocation watchPosition error', error)
        setLoading(false)
        clearLocation()
      },
      WATCH_POSITION_CONFIG
    )
  }

  const toggleUserLocation = () => {
    if (locationIsEnabled) {
      clearLocation()
    } else {
      getLocation()
    }
  }

  const updateUserLocationAPI = async ({ latitude, longitude }) => {
    if (!isNaN(latitude) && !isNaN(longitude)) {
      try {
        await updateUserLocation({ latitude, longitude })
        dispatch(updateUserLocationData({ latitude, longitude }))
      } catch (error) {
        clearLocation()
        console.error('[location.hook] updateUserLocationAPI error', error)
      }
    } else {
      clearLocation()
      console.error('[location.hook] location is not a number', { latitude, longitude })
    }
  }

  const clearLocation = () => {
    updateUserLocation({ latitude: null, longitude: null })
    dispatch(updateUserLocationData())
    Geolocation.stopObserving()
  }

  return {
    loading,
    userLocation,
    locationIsEnabled,
    toggleUserLocation,
  }
}

export default userLocationHook
