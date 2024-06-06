import React, { useEffect, useRef, useState } from "react"

import { ActivityIndicator, Platform, ScrollView, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import { useNavigation } from "@react-navigation/native"
import SiteIcon from "../../../assets/geoar/siteicon.svg"
import StarSiteIcon from "../../../assets/geoar/starsite.svg"
import ArIcon from "../../../assets/geoar/aricon.svg"
import SitesIcon from "../../../assets/geoar/sites.svg"
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import MarkerIcon from "../../../assets/geoar/marker_img.svg"

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import { updateSelectedSites } from "../../../redux/AR";


const GeoArChallengeDetails = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()
  const mapView = useRef();
  const selectedDestination = useSelector(state => state.ar?.selectedDestination)
  const anywhereARChallenges = useSelector(state => state.ar?.anywhereChallenges)
  const regions = selectedDestination?.regions
  const [fullRegion, setFullRegion] = useState(null)

  const setMapBounds = () => {
    var address = selectedDestination.name;
    Geocoder.from(address)
      .then(json => {
        var location = json.results[0].geometry.location;
        var bounds = json.results[0].geometry.bounds
        mapView.current.setMapBoundaries({ latitude: bounds.northeast.lat, longitude: bounds.northeast.lng },
          { latitude: bounds.southwest.lat, longitude: bounds.southwest.lng }
        );
        const fullRegion = {
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: Number(selectedDestination.map_latitude_delta),
          longitudeDelta: Number(selectedDestination.map_longitude_delta),
        }
        mapView.current.animateToRegion(fullRegion)
        setFullRegion(fullRegion)
      })
      .catch(error => console.warn(error));
  }

  moveToFullRegion = () => {
    mapView.current.animateToRegion(fullRegion)
  }

  useEffect(() => {
    if (!selectedDestination.geo_location || selectedDestination.geo_location.coordinates.length == 0) {
      console.log("setMapBounds")
      setTimeout(setMapBounds, 500)
    }
  }, []);

  const _markerView = (o) => {
    if (o.lat_long) {
      return (
        <Marker
          key={o.id}
          coordinate={{
            latitude: o.lat_long.coordinates[1],
            longitude: o.lat_long.coordinates[0]
          }}
          title={o.name}
          onCalloutPress={() => { dispatch(updateSelectedSites(o)); navigation.navigate("GeoArSiteDetails") }}
        >
          {Platform.OS == 'ios' && <Callout onPress={() => { dispatch(updateSelectedSites(o)); navigation.navigate("GeoArSiteDetails") }}
            style={{ backgroundColor: '#fff', minWidth: 100, alignItems: 'center' }}>
            <Text>{o.name}</Text>
          </Callout>}
          <View style={{ width: 30, height: 30 }}>
            <MarkerIcon />
          </View>
        </Marker>
      )
    }
  }

  const moveToRegion = (r) => {
    mapView.current.animateToRegion({
      latitude: Number(r.latitude_longitude.coordinates[0]),
      longitude: Number(r.latitude_longitude.coordinates[1]),
      latitudeDelta: Number(r.map_latitude_delta),
      longitudeDelta: Number(r.map_longitude_delta),
    })
  }

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: selectedDestination.name,
          style: [_styles.heading],
        }} backgroundColor="transparent" />

      {isLoading && <ActivityIndicator size="large" />}
      <View style={{ marginVertical: 20 }}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ width: '100%', height: 50 }} contentContainerStyle={_styles.rowView}>
          <TouchableOpacity onPress={moveToFullRegion} activeOpacity={.5} style={_styles.selectButtonStyle}>
            <Text style={_styles.buttonSelectText}>Full</Text>
          </TouchableOpacity>
          {
            regions.map(e => {
              return (
                <TouchableOpacity activeOpacity={.5} onPress={() => moveToRegion(e)} style={_styles.unSelectButtonStyle}>
                  <Text style={_styles.buttonSelectText}>{e.name}</Text>
                </TouchableOpacity>
              )
            })
          }
          {/* <TouchableOpacity onPress={() => navigation.navigate("GeoArSiteDetails")} activeOpacity={.5} style={_styles.unSelectButtonStyle}>
            <Text style={_styles.buttonSelectText}>Diego Martin Region</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={.5} style={_styles.unSelectButtonStyle}>
            <Text style={_styles.buttonSelectText}>San Juan-Laventille Region</Text>
          </TouchableOpacity> */}
        </ScrollView>
      </View>
      <View style={{ width: '100%', position: 'relative', flex: 1, borderRadius: 16, overflow: 'hidden' }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapView}
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          initialRegion={{
            latitude: selectedDestination.geo_location && selectedDestination.geo_location?.coordinates.length > 0 ?
              selectedDestination.geo_location?.coordinates[1] : 21.758821200665473,
            longitude: selectedDestination.geo_location && selectedDestination.geo_location?.coordinates.length > 0 ?
              selectedDestination.geo_location?.coordinates[0] : -80.41984442094248,
            latitudeDelta: selectedDestination.map_latitude_delta ? Number(selectedDestination.map_latitude_delta) : 0.0922,
            longitudeDelta: selectedDestination.map_longitude_delta ? Number(selectedDestination.map_longitude_delta) : 0.0421,
          }}
        >
          {/* {
            selectedDestination.unique_ar_sites.map((o) => {
              return _markerView(o)
            })
          } */}
          {
            selectedDestination.star_ar_sites.map((o) => {
              return _markerView(o)
            })
          }

        </MapView>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%', alignItems: "flex-start", marginTop: 20, marginBottom: 30 }}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <SiteIcon style={{ width: 48, height: 48 }} />
          <Text style={_styles.s_list_count}>{selectedDestination.unique_ar_sites.length}</Text>
          <Text style={_styles.s_list_text}>Sites</Text>
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <SitesIcon style={{ width: 48, height: 48 }} />
          <Text style={_styles.s_list_count}>{selectedDestination.star_ar_sites.length}</Text>
          <Text style={_styles.s_list_text}>Star Sites</Text>
        </View><View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <StarSiteIcon style={{ width: 48, height: 48 }} />
          <Text style={_styles.s_list_count}>0</Text>
          <Text style={_styles.s_list_text}>Hidden Sites</Text>
        </View>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <ArIcon style={{ width: 48, height: 48 }} />
          <Text style={_styles.s_list_count}>{anywhereARChallenges.length}</Text>
          <Text style={_styles.s_list_text}>AR Challenges</Text>
        </View>
      </View>
    </BackgroundWithImage >
  )
}



export default GeoArChallengeDetails