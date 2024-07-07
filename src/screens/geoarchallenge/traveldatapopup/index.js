import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  ViroImage,
  ViroNode,
  ViroARScene,
  ViroText,
  ViroConstants,
  ViroARSceneNavigator,
  ViroFlexView
} from 'react-viro';
import CompassHeading from 'react-native-compass-heading';
import { distanceBetweenPoints, transformGpsToAR } from "../../../util/LocationLib";
import { getNearbyPlaces } from "../../../util/PlacesAPI";

const TravelDataPopUp = ({
  currentLocation
}) => {

  const [setCompassHeading, compassHeading] = useState(0)
  const [setPlaces, places] = useState([])

  const loadPlaces = () => {
    getNearbyPlaces(currentLocation, 50, (places) => {
      console.log("getNearbyPlaces", places)
      setPlaces(setPlaces)
    })
  }

  const placeARObjects = () => {
    if (places.length == 0) {
      return undefined;
    }
    const ARTags = this.state.nearbyPlaces.map((item) => {
      const coords = transformGpsToAR(currentLocation, { latitude: item.lat, longitude: item.lng }, compassHeading);
      const scale = Math.abs(Math.round(coords.z / 15));
      const distance = distanceBetweenPoints(currentLocation, { latitude: item.lat, longitude: item.lng });
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
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

export default TravelDataPopUp