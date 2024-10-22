import React, { createContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getDestinationFactsAll } from './network'
import { isPointInPolygon } from './util/helpers'
import DestinationFactModal from './screens/DestinationFactModal/DestinationFactModal'
import { updateDestinationVisited } from './redux/AR/reducer'
import userLocationHook from './screens/drawerContent/location.hook'

export const GeolocationContext = createContext()

export const GeolocationProvider = ({ children }) => {
  const userToken = useSelector(state => state.login.data.token)
  const userVisitedDestinations = useSelector(state => state.ar.destinationVisited)
  const dispatch = useDispatch()
  const [destinationFactsAll, setDestinationFactsAll] = useState([])
  const [openDestinationFactModal, setOpenDestinationFactModal] = useState(false)
  const [destinationFact, setDestinationFact] = useState(null)

  const { initialUserLocation: userLocation, getLocation } = userLocationHook()

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
      getLocation()
    }
  }, [userToken])

  useEffect(() => {
    if (userLocation && !openDestinationFactModal) {
      for (let i = 0; i < destinationFactsAll.length; i++) {
        const isInside = isPointInPolygon(
          [userLocation?.longitude, userLocation?.latitude],
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
