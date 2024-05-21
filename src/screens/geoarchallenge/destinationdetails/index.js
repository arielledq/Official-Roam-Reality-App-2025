import React, { useEffect, useRef, useState } from "react"

import { ActivityIndicator, FlatList, Image, ImageBackground, Keyboard, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { handleError } from "../../../util/helpers"
import { getARChallenges, getARProfile, getARStettings } from '../../../network'
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import { useNavigation } from "@react-navigation/native"
import SiteIcon from "../../../assets/geoar/siteicon.svg"
import StarSiteIcon from "../../../assets/geoar/starsite.svg"
import GradientDown from "../../../assets/geoar/gradient_down.svg"
import GradientDownPNG from "../../../assets/geoar/gradient_down.png"
import BellIcon from "../../../assets/geoar/bell.svg"
import LocationIcon from "../../../assets/geoar/location.png"
import BackImg from "../../../assets/geoar/back_img.png"
import ArIcon from "../../../assets/geoar/aricon.svg"
import PinIcon from "../../../assets/geoar/pinicon.svg"
import SitesIcon from "../../../assets/geoar/sites.svg"
import Map from "../../../assets/geoar/map.png"
import MapView from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
Geocoder.init("AIzaSyAd_EZRrfSjO2OS6p-h89wrT3y8xyREpTA");

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"


const GeoArChallengeDetails = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()
  const mapView = useRef();
  const selectedDestination = useSelector(state => state.ar?.selectedDestination)
  console.log("selectedDestination", selectedDestination)

  const setMapBounds = () => {
    console.log("mapView")
    var address = selectedDestination.name;
    Geocoder.from(address)
      .then(json => {
        var location = json.results[0].geometry.location;
        var bounds = json.results[0].geometry.bounds
        console.log(location);
        console.log(bounds);
        mapView.current.setMapBoundaries({ latitude: bounds.northeast.lat, longitude: bounds.northeast.lng },
          { latitude: bounds.southwest.lat, longitude: bounds.southwest.lng }
        );
        mapView.current.animateToRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 1,
        })
      })
      .catch(error => console.warn(error));
  }

  useEffect(() => {
    setTimeout(setMapBounds, 500)

  }, []);

  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: "Trinidad",
          style: [_styles.heading],
        }} backgroundColor="transparent" />

      {isLoading && <ActivityIndicator size="large" />}
      <View style={{ marginVertical: 20 }}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ width: '100%', height: 50 }} contentContainerStyle={_styles.rowView}>
          <TouchableOpacity activeOpacity={.5} style={_styles.selectButtonStyle}>
            <Text style={_styles.buttonSelectText}>Full</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("GeoArSiteDetails")} activeOpacity={.5} style={_styles.unSelectButtonStyle}>
            <Text style={_styles.buttonSelectText}>Diego Martin Region</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={.5} style={_styles.unSelectButtonStyle}>
            <Text style={_styles.buttonSelectText}>San Juan-Laventille Region</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <View style={{ width: '100%', position: 'relative', flex: 1, borderRadius: 16, overflow: 'hidden' }}>
        <MapView
          ref={mapView}
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%', alignItems: "flex-start", marginTop: 20, marginBottom: 30 }}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <SiteIcon style={{ width: 48, height: 48 }} />
          <Text style={_styles.s_list_count}>18+</Text>
          <Text style={_styles.s_list_text}>Sites</Text>
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <SitesIcon style={{ width: 48, height: 48 }} />
          <Text style={_styles.s_list_count}>8+</Text>
          <Text style={_styles.s_list_text}>Star Sites</Text>
        </View><View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <StarSiteIcon style={{ width: 48, height: 48 }} />
          <Text style={_styles.s_list_count}>100+</Text>
          <Text style={_styles.s_list_text}>Hidden Sites</Text>
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <ArIcon style={{ width: 48, height: 48 }} />
          <Text style={_styles.s_list_count}>64+</Text>
          <Text style={_styles.s_list_text}>AR Challenges</Text>
        </View>
      </View>
    </BackgroundWithImage >
  )
}



export default GeoArChallengeDetails