import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils"
import {
  ViroImage,
  ViroNode,
  ViroText,
  ViroFlexView
} from '@viro-community/react-viro';
import CompassHeading from 'react-native-compass-heading';
import { getLocationDistance, transformGpsToAR } from "../../../util/LocationLib";
import { getNearbyPlaces } from "../../../util/PlacesAPI";

const TravelDataPopUp = ({
  currentLocation
}) => {

  const [compassHeading, setCompassHeading] = useState(0)
  const [places, setPlaces] = useState([])
  const [placeCordinateLoadPoint, setPlaceCordinateLoadPoint] = useState(currentLocation)

  const loadPlaces = () => {
    const distance = getLocationDistance(currentLocation, placeCordinateLoadPoint);
    if (distance > 20) {
      getNearbyPlaces(currentLocation, 50, (places) => {
        console.log("getNearbyPlaces", places)
        setPlaces(places)
      })
      setPlaceCordinateLoadPoint(currentLocation)
    }
  }

  const placeARObjects = () => {
    if (!places && places.length == 0) {
      return (
        null
      )
    }
    const ARTags = places.map((item) => {
      const coords = transformGpsToAR(currentLocation, { latitude: item.lat, longitude: item.lng }, compassHeading);
      const scale = Math.abs(Math.round(coords.z / 15));
      const distance = getLocationDistance(currentLocation, { latitude: item.lat, longitude: item.lng });
      return (
        <ViroNode key={item.id} scale={[scale, scale, scale]} rotation={[0, 0, 0]} position={[coords.x, 0, coords.z]}>
          <ViroFlexView style={{ alignItems: 'center', justifyContent: 'center' }}>
            <ViroText width={4} height={0.5} text={item.title} style={styles.helloWorldTextStyle} />
            <ViroText width={4} height={0.5} text={`${Number(distance).toFixed(2)} km`} style={styles.helloWorldTextStyle} position={[0, -0.75, 0]} />
            <ViroImage width={1} height={1} source={{ uri: item.icon }} position={[0, -1.5, 0]} />
          </ViroFlexView>
        </ViroNode>
      )
    });
    return ARTags;
  }

  useEffect(() => {
    loadPlaces()
  }, [currentLocation]);

  useEffect(() => {
    loadPlaces()
    CompassHeading.start(3, (heading) => {
      setCompassHeading(heading)
    });
    return () => {
      CompassHeading.stop();
    }
  }, []);

  return (
    <>
      {placeARObjects()}
    </>
  )
}

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontSize: FontSizes.S30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

export default TravelDataPopUp