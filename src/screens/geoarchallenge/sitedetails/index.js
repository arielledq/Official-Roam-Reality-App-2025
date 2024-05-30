import React, { useEffect, useState } from "react"

import { ActivityIndicator, Image, ImageBackground, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import { useNavigation } from "@react-navigation/native"
import SiteIcon from "../../../assets/geoar/siteicon.svg"
import StarSiteIcon from "../../../assets/geoar/starsite.svg"
import ArIcon from "../../../assets/geoar/aricon.svg"
import MapView, { Marker } from 'react-native-maps';
import CloseBIcon from "../../../assets/geoar/close-square.svg"
import ProTipIcon from "../../../assets/geoar/pro-tip.svg"
import GradientDownPNG from "../../../assets/geoar/gradient_down.png"
import MarkerIcon from "../../../assets/geoar/marker_img.svg"
import Geocoder from 'react-native-geocoding';
import LineIcon from '../../../assets/ar/line.png';


import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import { height, width } from "../../../util/AppDimensions";
import { AppButton } from "../../../components";
import RenderHTML from "react-native-render-html";
import { FontSizes, fontGroup } from "../../../util/FontUtils";


const GeoArSiteDetails = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [showProTips, setShowProTips] = useState(false)
  const navigation = useNavigation()
  const selectedDestination = useSelector(state => state.ar?.selectedDestination)
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite)
  const anywhereARChallenges = useSelector(state => state.ar?.anywhereChallenges)
  const [address, setAddress] = useState(null)

  const getAddress = () => {
    Geocoder.from({
      latitude: selectedGeoSite.lat_long.coordinates[1],
      longitude: selectedGeoSite.lat_long.coordinates[0],
    }).then(json => {
      try {
        var addressComponent = json.results[0].formatted_address;
        setAddress(addressComponent)
      } catch (ex) {
        setAddress('Not found.')
      }
    })
      .catch(error => console.warn(error));
  }

  useEffect(() => {
    getAddress()
  }, []);

  InfoView = () => {
    return (
      <View style={_styles.challengeInfoContainer}>
        <View style={_styles.challengeInfoHeaderContainer}>
          <View onPress={() => setShowProTips(true)} style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
            <ProTipIcon style={{ width: 24, height: 24 }} source={ProTipIcon} />
            <Text style={_styles.protip_text}>Pro Tips</Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, width: '100%', padding: 24 }
          }
        >
          <RenderHTML
            contentWidth={width}
            tagsStyles={{
              p: {
                color: '#9CA3AF',
                fontSize: FontSizes.S14,
              },
              strong: {
                color: '#fff',
                fontSize: FontSizes.S18,
              },
              ol: {
                color: '#fff',
              },
              li: {
                color: '#fff',
              }
            }}
            source={{
              html: `${selectedGeoSite?.pro_tips.toString().replaceAll("#000000", "#fff")}}`
            }}
          />
        </ScrollView>
        <View style={{ width: '100%', paddingHorizontal: 24 }}>
          <AppButton
            onPress={() => setShowProTips(false)}
            buttonStyle={_styles.buttonStyle}
            containerStyle={_styles.buttonContainerStyle}
            title={"Close"}
          />
        </View>
      </View>
    )
  }

  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: selectedDestination.name,
          style: [_styles.heading],
        }} backgroundColor="transparent" />

      {isLoading && <ActivityIndicator size="large" />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', position: 'relative', height: 160, borderRadius: 16, marginVertical: 15, overflow: 'hidden' }}>
          <MapView
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            initialRegion={{
              latitude: selectedGeoSite.lat_long.coordinates[1],
              longitude: selectedGeoSite.lat_long.coordinates[0],
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: selectedGeoSite.lat_long.coordinates[1],
                longitude: selectedGeoSite.lat_long.coordinates[0]
              }}
              title={selectedGeoSite.name}
            >
              <View style={{ width: 30, height: 30 }}>
                <MarkerIcon />
              </View>
            </Marker>
          </MapView>
        </View>

        <View style={{ flexDirection: 'row', paddingVertical: 20, justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={_styles.site_d_header_text}>Site Details</Text>
          <TouchableOpacity>
            <CloseBIcon style={{ height: 32, width: 32 }} />
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: "#131422", borderRadius: 16, padding: 20, marginBottom: 30 }}>
          <ImageBackground style={{ width: '100%', height: 213, borderRadius: 12, overflow: 'hidden' }} source={{ uri: selectedGeoSite.image }} resizeMode="cover" >
            <Image source={GradientDownPNG} resizeMode="cover" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, width: '110%' }} />
          </ImageBackground>
          <Text style={_styles.site_d_header}>{selectedGeoSite.name}</Text>
          <Text style={_styles.site_d_text}>{address}</Text>
          <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%', alignItems: "flex-start", marginTop: 20, marginBottom: 30 }}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <SiteIcon style={{ width: 48, height: 48 }} />
              <Text style={_styles.s_list_count}>0</Text>
              <Text style={_styles.s_list_text}>Check-ins</Text>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <StarSiteIcon style={{ width: 48, height: 48 }} />
              <Text style={_styles.s_list_count}>{selectedDestination.star_ar_sites.length}</Text>
              <Text style={_styles.s_list_text}>Star</Text>
            </View>
            {/* <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <StarSiteIcon style={{ width: 48, height: 48 }} />
              <Text style={_styles.s_list_count}>0</Text>
              <Text style={_styles.s_list_text}>Hidden Sites</Text>
            </View> */}
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <ArIcon style={{ width: 48, height: 48 }} />
              <Text style={_styles.s_list_count}>{anywhereARChallenges.length}</Text>
              <Text style={_styles.s_list_text}>AR Challenges</Text>
            </View>
          </View>
          <RenderHTML
            contentWidth={width}
            tagsStyles={{
              p: {
                ...fontGroup.ns400,
                lineHeight: 19.1,
                color: '#9CA3AF',
                fontSize: FontSizes.S10
              },
              strong: {
                ...fontGroup.ns400,
                lineHeight: 19.1,
                color: '#fff',
                fontSize: FontSizes.S14
              },
              span: {
                ...fontGroup.ns400,
                lineHeight: 19.1,
                color: '#fff',
                fontSize: FontSizes.S10
              }
            }}
            source={{
              html: `${selectedGeoSite?.description?.toString().replaceAll("#000000", "#C8DFFF")}`
            }}
          />
          <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setShowProTips(true)} style={{ justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
              <ProTipIcon style={{ width: 24, height: 24 }} source={ProTipIcon} />
              <Text style={_styles.protip_text}>Pro Tips</Text>
            </TouchableOpacity>
            <View>
              <AppButton
                onPress={() => navigation.navigate("GeoArSiteRoutes")}
                buttonStyle={_styles.buttonStyle}
                containerStyle={_styles.buttonContainerStyle}
                title={"Lets Roam"}
                loading={isLoading}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      {showProTips && InfoView()}
    </BackgroundWithImage >
  )
}



export default GeoArSiteDetails