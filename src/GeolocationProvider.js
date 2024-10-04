import React, { createContext, useEffect, useState } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { hasLocationPermission } from './util/LocationLib'
import Geolocation from 'react-native-geolocation-service'
import {getDestinationFactsAll, updateUserLocation} from './network'
import {handleError, isPointInPolygon, showMessage} from "./util/helpers";
import DestinationFactModal from "./screens/DestinationFactModal/DestinationFactModal";
import {updateDestinationVisited} from "./redux/AR/reducer";

export const GeolocationContext = createContext()

export const GeolocationProvider = ({ children }) => {
  const userToken = useSelector(state => state.login.data.token)
  const userVisitedDestinations = useSelector(state => state.ar.destinationVisited)
  const dispatch = useDispatch()
  const [userLocation, setUserLocation] = useState(null)
  const [destinationFactsAll, setDestinationFactsAll] = useState([])
  const [openDestinationFactModal, setOpenDestinationFactModal] = useState(false)
  const [destinationFact, setDestinationFact] = useState(null)

  const getLocation = async () => {
    const hasPermission = await hasLocationPermission()

    if (!hasPermission) {
      return
    }

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })
      },
      error => {
        console.log(error)
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
        forceLocationManager: true,
        showLocationDialog: true,
      }
    )
  }

  const getDestinationFacts =  () => {
    getDestinationFactsAll()
      .then(res => {
        if (res.status === 1) {
          setDestinationFactsAll(res.data)
        }
      })
  }


  useEffect(() => {
    if (userToken) {
      getDestinationFacts()
      setTimeout(() => {
        setInterval(() => {
          getLocation()
        }, 10000)
      }, 1000)
    }
  }, [])

  useEffect(() => {
    if (userLocation) {
      // console.log('GeolocationProvider userLocation', userLocation)
      updateUserLocation(userLocation)
        .then(res => {
          // console.log('GeolocationProvider updateUserLocation', res)
        })
        .catch(error => {
          // console.log('GeolocationProvider updateUserLocation error', error)
        })

      if (!openDestinationFactModal) {
        for (let i = 0; i < destinationFactsAll.length; i++) {
          const isInside = isPointInPolygon([userLocation.longitude, userLocation.latitude], destinationFactsAll[i].border.coordinates)
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
