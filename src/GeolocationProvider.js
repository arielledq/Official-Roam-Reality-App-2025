import React, { createContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { hasLocationPermission } from './util/LocationLib'
import { getDestinationFactsAll, updateUserLocation } from './network'
import { handleError, isPointInPolygon, showMessage } from './util/helpers'
import DestinationFactModal from './screens/DestinationFactModal/DestinationFactModal'
import { updateDestinationVisited } from './redux/AR/reducer'
import Geolocation from '@react-native-community/geolocation'

export const GeolocationContext = createContext()

export const GeolocationProvider = ({ children }) => {
  const userToken = useSelector(state => state.login.data.token)
  const userVisitedDestinations = useSelector(state => state.ar.destinationVisited)
  const dispatch = useDispatch()
  const [userLocation, setUserLocation] = useState(null)
  const [destinationFactsAll, setDestinationFactsAll] = useState([])
  const [openDestinationFactModal, setOpenDestinationFactModal] = useState(false)
  const [destinationFact, setDestinationFact] = useState(null)

  const getLocation = () => {
    const hasPermission = hasLocationPermission()

    if (!hasPermission) {
      return
    }

    Geolocation.setRNConfiguration({
      authorizationLevel: 'whenInUse',
      enableBackgroundLocationUpdates: true,
    })

    Geolocation.requestAuthorization(
      () => {
        console.log('Authorization success')
      },error => {
        console.log('Authorization error', error)
      }
    )


    Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })
      },
      error => {
        console.error('error ', error)
      },
      {
        interval: 5000,
        fastestInterval: 2000,
        timeout: 15000,
        maximumAge: 10000,
        enableHighAccuracy: true,
        distanceFilter: 1,
        useSignificantChanges: true,
      }
    )

  }

  const getDestinationFacts = () => {
    getDestinationFactsAll().then(res => {
      if (res.status === 1) {
        setDestinationFactsAll(res.data)
      }
    })
  }

  useEffect(() => {
    if (userToken) {
      getDestinationFacts()
      // setInterval(
      //   () => getLocation(),
      //   3000
      // )
      getLocation()

    }
  }, [userToken])

  useEffect(() => {
    if (userLocation) {
      updateUserLocation(userLocation)
        .then(res => {})
        .catch(error => {})

      if (!openDestinationFactModal) {
        for (let i = 0; i < destinationFactsAll.length; i++) {
          const isInside = isPointInPolygon(
            [userLocation.longitude, userLocation.latitude],
            destinationFactsAll[i].border.coordinates
          )
          if (isInside && !userVisitedDestinations.includes(destinationFactsAll[i].id)) {
            dispatch(updateDestinationVisited(destinationFactsAll[i].id))
            setOpenDestinationFactModal(true)
            setDestinationFact(destinationFactsAll[i])
            break
          }
        }
      }
    }
  }, [userLocation])

  return (
    <GeolocationContext.Provider value={{ userLocation }}>
      <DestinationFactModal
        isVisible={openDestinationFactModal}
        onClose={() => setOpenDestinationFactModal(false)}
        name={destinationFact?.name}
        facts={destinationFact?.facts}
      />
      {children}
    </GeolocationContext.Provider>
  )
}
