import React, { useEffect, useRef, useState } from "react"

import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
import { getARSitesHiddenStars } from "../../../network";
import AppSwitch from "../../../components/Switch";
import { getBounds, getCenterOfBounds } from "../../../util/LocationLib";


const GeoArChallengeDetails = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [hiddenStars, setHiddenStars] = useState(0)
  const [arSitesOn, setARSitesOnSwitch] = useState(true)
  const [selectedRegionName, setSelectedRegionName] = useState('Full')
  const [friendsLocationSitesOn, setFriendsLocationSitesOn] = useState(true)
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
          latitudeDelta: Number(bounds.northeast.lat - bounds.southwest.lat),
          longitudeDelta: Number(bounds.northeast.lng - bounds.southwest.lng),
        }
        mapView.current.animateToRegion(fullRegion)
        setFullRegion(fullRegion)
      })
      .catch(error => console.warn(error));
  }

  const moveToFullRegion = () => {
    mapView.current.animateToRegion(fullRegion)
    setSelectedRegionName("Full")
  }

  const getHiddenStar = () => {
    getARSitesHiddenStars({ id: selectedDestination.id }).then((res) => {
      setHiddenStars(res.data[0])
    }).finally(() => {
    })
  }

  useEffect(() => {
    if (!selectedDestination.geo_location || selectedDestination.geo_location.coordinates.length == 0) {
      console.log("setMapBounds")
      setTimeout(setMapBounds, 500)
    } else {
      const fullRegion = {
        latitude: selectedDestination.geo_location?.coordinates[1],
        longitude: selectedDestination.geo_location?.coordinates[0],
        latitudeDelta: Number(selectedDestination.map_latitude_delta),
        longitudeDelta: Number(selectedDestination.map_longitude_delta),
      }
      setFullRegion(fullRegion)
    }
    getHiddenStar()
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
    let arrayPoints = []
    for (i = 0; i < r.geo_region.coordinates.length; i++) {
      const points = r.geo_region.coordinates[i];
      for (j = 0; j < points.length; j++) {
        const point = points[j]
        arrayPoints.push({ latitude: point[1], longitude: point[0] })
      }
    }
    const latitude_longitude = getCenterOfBounds(arrayPoints)
    const bounds = getBounds(arrayPoints)
    mapView.current.animateToRegion({
      latitude: Number(latitude_longitude.latitude),
      longitude: Number(latitude_longitude.longitude),
      latitudeDelta: Number(bounds.maxLat - bounds.minLat),
      longitudeDelta: Number(bounds.maxLng - bounds.minLng),
    })
    setSelectedRegionName(r.name)
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
          <TouchableOpacity onPress={moveToFullRegion} activeOpacity={.5} style={selectedRegionName == 'Full' ? _styles.selectButtonStyle : _styles.unSelectButtonStyle}>
            <Text style={_styles.buttonSelectText}>Full</Text>
          </TouchableOpacity>
          {
            regions.map(e => {
              if (e.geo_region)
                return (
                  <TouchableOpacity key={e.id} activeOpacity={.5} onPress={() => moveToRegion(e)} style={selectedRegionName == e.name ? _styles.selectButtonStyle : _styles.unSelectButtonStyle}>
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
      <View style={{ flexDirection: 'row', marginBottom: 20, justifyContent: 'space-between' }}>
        <View style={_styles.selectionsContainer}>
          <View>
            <Text style={_styles.selectionTextHeading}>Sites</Text>
            <Text style={_styles.selectionTextDetails}>Sites with AR</Text>
          </View>
          <AppSwitch
            onValueChange={setARSitesOnSwitch}
            value={arSitesOn} />
        </View>
        <View style={_styles.selectionsContainer}>
          <View>
            <Text style={_styles.selectionTextHeading}>My Friends</Text>
            <Text style={_styles.selectionTextDetails}>Live Location</Text>
          </View>
          <AppSwitch
            onValueChange={setFriendsLocationSitesOn}
            value={friendsLocationSitesOn} />
        </View>
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
          {arSitesOn &&
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
          <Text style={_styles.s_list_count}>{hiddenStars}</Text>
          <Text style={_styles.s_list_text}>Hidden Stars</Text>
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