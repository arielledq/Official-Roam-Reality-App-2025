import React, { useEffect, useState } from "react"

import { ActivityIndicator, FlatList, Image, ImageBackground, Keyboard, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { handleError } from "../../../util/helpers"
import { getARChallenges, getARProfile, getARStettings } from '../../../network'
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import { useNavigation } from "@react-navigation/native"
import PlaceholderImg from "../../../assets/geoar/ph_sites.png"
import MapView from 'react-native-maps';
import ProTipIcon from "../../../assets/geoar/pro-tip.svg"
import CarIcon from "../../../assets/geoar/car.svg"
import RoadIcon from "../../../assets/geoar/road.svg"
import TimeIcon from "../../../assets/geoar/time.svg"
import HomeIcon from "../../../assets/geoar/home.svg"
import CloseBIcon from "../../../assets/geoar/close-square.svg"


import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import { height, width } from "../../../util/AppDimensions";
import { AppButton } from "../../../components";


const GeoArSiteNavigation = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)


  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: "Navigate to Site",
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
        <View style={{ backgroundColor: "#131422", borderRadius: 16, paddingHorizontal: 20, paddingBottom: 20, marginVertical: 20, alignItems: 'center' }}>
          <HomeIcon style={{ width: 42, height: 4, marginBottom: 15, marginTop: 10 }} />
          <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <CloseBIcon style={{ width: 32, height: 32 }} />
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <Text style={_styles.site_distance_time_value_text}>31 <Text style={{ fontSize: 14 }}>mins</Text></Text>
              <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                <Text style={_styles.site_distance_time_text}>18.4 <Text style={{ fontSize: 10 }}>miles</Text></Text>
                <Text style={_styles.site_distance_time_text}>.</Text>
                <Text style={_styles.site_distance_time_text}>10:10 am</Text>
              </View>
            </View>
            <View></View>
          </View>
        </View>
      </ScrollView>
    </BackgroundWithImage >
  )
}



export default GeoArSiteNavigation