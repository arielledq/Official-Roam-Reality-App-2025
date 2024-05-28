import React, { useEffect, useState } from "react"

import { ActivityIndicator, FlatList, Image, ImageBackground, Keyboard, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import MapView from 'react-native-maps';
import HomeIcon from "../../../assets/geoar/home.svg"
import CloseBIcon from "../../../assets/geoar/close-square.svg"
import SkipIcon from "../../../assets/geoar/skip.svg"


import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"


const GeoArSiteArrived = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)

  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        rightComponent={() => <TouchableOpacity><SkipIcon style={{ width: 48, height: 36 }} /></TouchableOpacity>}
        centerComponent={{
          text: "You have Arrived",
          style: [_styles.heading],
        }} backgroundColor="transparent" />

      {isLoading && <ActivityIndicator size="large" />}
      <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
        <View style={{ position: 'relative', height: 546, borderRadius: 16, overflow: 'hidden', marginTop: 20, marginHorizontal: 30 }}>
          <MapView
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        </View>
        <View style={{ backgroundColor: "#131422", borderRadius: 16, padding: 20, paddingBottom: 20, marginVertical: 20, alignItems: 'center' }}>
          <View>
            <Text style={_styles.arrivedText}>Arrived</Text>
            <Text style={_styles.exploringText}>Begin exploring</Text>
            <Text style={_styles.infoText}>Explore with your camera to find hidden stars. Collect them to uncover interesting facts and earn credits. Remember to take a picture with our pin for additional points.</Text>
          </View>
        </View>
      </ScrollView>
    </BackgroundWithImage >
  )
}



export default GeoArSiteArrived