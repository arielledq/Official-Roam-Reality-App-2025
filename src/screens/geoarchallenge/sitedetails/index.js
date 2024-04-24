import React, { useEffect, useState } from "react"

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
import PlaceholderImg from "../../../assets/geoar/ph_sites.png"
import MapView from 'react-native-maps';
import CloseBIcon from "../../../assets/geoar/close-square.svg"
import ProTipIcon from "../../../assets/geoar/pro-tip.svg"


import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import { height, width } from "../../../util/AppDimensions";
import { AppButton } from "../../../components";


const GeoArSiteDetails = ({

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
        <View style={{ marginVertical: 20 }}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ width: '100%', height: 50 }} contentContainerStyle={_styles.rowView}>
            <TouchableOpacity activeOpacity={.5} style={_styles.selectButtonStyle}>
              <Text style={_styles.buttonSelectText}>Full</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={.5} style={_styles.unSelectButtonStyle}>
              <Text style={_styles.buttonSelectText}>Diego Martin Region</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={.5} style={_styles.unSelectButtonStyle}>
              <Text style={_styles.buttonSelectText}>San Juan-Laventille Region</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <View style={{ width: '100%', position: 'relative', height: 160, borderRadius: 16, overflow: 'hidden' }}>
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
          <Text style={_styles.site_d_header_text}>Site Details</Text>
          <TouchableOpacity>
            <CloseBIcon style={{ height: 32, width: 32 }} />
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: "#131422", borderRadius: 16, padding: 20, marginBottom: 30 }}>
          <Image source={PlaceholderImg} />
          <Text style={_styles.site_d_header}>Arima</Text>
          <Text style={_styles.site_d_text}>De Best Laundromat, 59 Tunapuna Rd, Tunapuna, Trinidad & Tobago</Text>
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
          <Text style={_styles.site_d_text}>Tunapuna, a town in northern Trinidad, is known for its rich cultural heritage, bustling markets, and mix of traditional and modern amenities. The Tunapuna Market offers fresh produce, local crafts, and street food. It's also home to historical landmarks and cultural sites such as the Tunapuna Hindu Temple and Cemetery. For nature lovers, Tunapuna is a gateway to nearby attractions such as the Caroni Swamp and Asa Wright Nature Centre.</Text>
          <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
              <ProTipIcon style={{ width: 24, height: 24 }} source={ProTipIcon} />
              <Text style={_styles.protip_text}>Pro Tips</Text>
            </View>
            <View>
              <AppButton
                buttonStyle={_styles.buttonStyle}
                containerStyle={_styles.buttonContainerStyle}
                title={"Lets Roam"}
                loading={isLoading}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </BackgroundWithImage >
  )
}



export default GeoArSiteDetails