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


import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import { height, width } from "../../../util/AppDimensions";
import { AppButton } from "../../../components";


const GeoArSiteRoutes = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)


  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: "Trinidad",
          style: [_styles.heading],
        }} backgroundColor="transparent" />

      {isLoading && <ActivityIndicator size="large" />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', position: 'relative', height: 292, borderRadius: 16, overflow: 'hidden' }}>
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

        <View style={{ flexDirection: 'row', paddingVertical: 20, justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={_styles.site_d_header_text}>Routes</Text>
          <TouchableOpacity>
            <Text style={_styles.site_d_header_number_text}>02</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: "#131422", borderRadius: 16, padding: 20, marginBottom: 30 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CarIcon style={{ width: 32, height: 32 }} />
            <View style={{ marginHorizontal: 20, justifyContent: 'flex-start' }}>
              <Text style={_styles.site_via_text}>via Churchill Roosevelt Hwy</Text>
              <Text style={_styles.site_via_des_text}>Fastest route now due to traffic conditions</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 10 }}>
            <RoadIcon style={{ width: 20, height: 20 }} />
            <Text style={_styles.site_distance_time_text}>Distance</Text>
            <Text style={_styles.site_distance_time_value_text}>18.4 <Text style={{ fontSize: 10 }}>miles</Text></Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TimeIcon style={{ width: 20, height: 20 }} />
            <Text style={_styles.site_distance_time_text}>Est. Time</Text>
            <Text style={_styles.site_distance_time_value_text}>31 <Text style={{ fontSize: 10 }}>mins</Text></Text>
          </View>
          <View style={{ justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
            <AppButton
              buttonStyle={_styles.buttonStyle}
              containerStyle={_styles.buttonContainerStyle}
              title={"Navigate"}
              loading={isLoading}
            />
          </View>
        </View>
        <View style={{ backgroundColor: "#131422", borderRadius: 16, padding: 20, marginBottom: 30 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CarIcon style={{ width: 32, height: 32 }} />
            <View style={{ marginHorizontal: 20, justifyContent: 'flex-start' }}>
              <Text style={_styles.site_via_text}>via Southern Main Rd and Churchill Roosevelt Hwy</Text>
              <Text style={_styles.site_via_des_text}>Fastest route now due to traffic conditions</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 10 }}>
            <RoadIcon style={{ width: 20, height: 20 }} />
            <Text style={_styles.site_distance_time_text}>Distance</Text>
            <Text style={_styles.site_distance_time_value_text}>21.4 <Text style={{ fontSize: 10 }}>miles</Text></Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TimeIcon style={{ width: 20, height: 20 }} />
            <Text style={_styles.site_distance_time_text}>Est. Time</Text>
            <Text style={_styles.site_distance_time_value_text}>40 <Text style={{ fontSize: 10 }}>mins</Text></Text>
          </View>
          <View style={{ justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
            <AppButton
              buttonStyle={_styles.buttonStyle}
              containerStyle={_styles.buttonContainerStyle}
              title={"Navigate"}
              loading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </BackgroundWithImage >
  )
}



export default GeoArSiteRoutes