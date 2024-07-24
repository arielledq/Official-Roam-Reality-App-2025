import React, { useEffect, useState } from "react"

import {
  FlatList,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { handleError } from "../../util/helpers"
import {
  getGeoARDestinations,
  getARProfile,
  getARStettings,
  getARChallenges,
  updateUserLocation,
  getARSitesStars
} from "../../network"

import BackgroundWithImage from "../../components/background"
import AppHeader from "../../components/header"
import { DrawerActions, useNavigation } from "@react-navigation/native"
import SiteIcon from "../../assets/geoar/siteicon.svg"
import StarSiteIcon from "../../assets/geoar/starsite.svg"
import GradientDownPNG from "../../assets/geoar/gradient_down.png"
import BellIcon from "../../assets/geoar/bell.svg"
import ArIcon from "../../assets/geoar/aricon.svg"
import {
  updateARUserData,
  updateARSettings,
  updateSelectedDestination,
  updateAnyWhereChallenges
} from "../../redux/AR"

import { useDispatch } from "react-redux"
import useStyles from "./styles"
import { hasLocationPermission } from "../../util/LocationLib";
import Geolocation from 'react-native-geolocation-service';
import { MenuIcon } from "../../assets/svg"
import PanicPopUp from "./panicpopup"

const GeoArChallenge = ({ }) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [destinationData, setDestinationData] = useState([])
  const [starSitesCount, setStarSitesCount] = useState({})
  const [numberOfChallenges, setNumberOfChallenges] = useState(0)
  const [openPanicPopUp, setOpenPanicPopup] = useState(false)
  const navigation = useNavigation()

  const ARSposored = () => {
    setIsLoading(true)
    getGeoARDestinations()
      .then(res => {
        if (res.status == 1) {
          setDestinationData(res.data)
          for (let i = 0; i < res.data.length; i++) {
            const d = res.data[i]
            getARStarSites(d.id)
          }
        } else {
          res.message.message = "Error in loading Challenges."
          handleError(res)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const getLocation = async () => {
    const hasPermission = await hasLocationPermission();

    if (!hasPermission) {
      return;
    }
    Geolocation.getCurrentPosition(
      position => {
        console.log("getLocation", position)
        updateUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }).then(res => {
          console.log("updateUserLocation:", res)
        })
          .finally(() => {
          })
      },
      error => {
        console.log(error);
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
        forceLocationManager: true,
        showLocationDialog: true,
      },
    );
  };

  const ARUserProfile = () => {
    setIsLoading(true)
    getARProfile()
      .then(res => {
        if (res.status == 1) {
          dispatch(updateARUserData(res))
        } else {
          res.message.message = "Error in loading Challenges."
          handleError(res)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const getSettings = () => {
    setIsLoading(true)
    getARStettings()
      .then(res => {
        if (res.data.length > 0) {
          dispatch(updateARSettings(res.data[0]))
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const loadDestinations = () => {
    ARSposored()
    ARUserProfile()
    getSettings()
    setIsLoading(true)
    getARChallenges()
      .then(res => {
        if (res.status == 1) {
          setNumberOfChallenges(res?.data?.length)
          dispatch(updateAnyWhereChallenges(res?.data))
        } else {
          res.message.message = "Error in loading Challenges."
          handleError(res)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
    getLocation()
  }

  const getARStarSites = async (id) => {
    const res = await getARSitesStars({ id })
    starSitesCount[id] = res.data[0]
    setStarSitesCount({ ...starSitesCount })
  }

  const getStarCount = (id) => {
    return starSitesCount[id] ? starSitesCount[id] : 0;
  }

  useEffect(() => {
    loadDestinations()
  }, [])

  const navigateToChallengeDetails = obj => {
    dispatch(updateSelectedDestination(obj))
    navigation.navigate("GeoArOutdoor", { challengeObj: obj })
  }

  const Item = ({ obj }) => (
    <TouchableOpacity
      onPress={() => navigateToChallengeDetails(obj)}
      style={{ width: "100%" }}
    >
      <ImageBackground
        style={_styles.containerView}
        resizeMode="cover"
        source={{ uri: obj.image }}
      >
        <Image
          source={GradientDownPNG}
          resizeMode="cover"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
            width: "110%"
          }}
        />
        <View style={{ width: "100%", marginBottom: 10 }}>
          <Text style={_styles.list_title}>{obj.name}</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              width: "100%",
              alignItems: "flex-start",
              marginTop: 20
            }}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <SiteIcon style={{ width: 48, height: 48 }} />
              <Text style={_styles.s_list_count}>
                {obj.star_ar_sites.length}
              </Text>
              <Text style={_styles.s_list_text}>Sites</Text>
            </View>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginStart: 22,
                marginEnd: 10
              }}
            >
              <StarSiteIcon style={{ width: 48, height: 48 }} />
              <Text style={_styles.s_list_count}>
                {getStarCount(obj.id)}
              </Text>
              <Text style={_styles.s_list_text}>Star Sites</Text>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <ArIcon style={{ width: 48, height: 48 }} />
              <Text style={_styles.s_list_count}>{obj.unique_ar_sites.length}</Text>
              <Text style={_styles.s_list_text}>AR Challenges</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  )
  const handleMenuButton = () => {
    return (
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
        style={{ paddingLeft: 5 }}
      >
        <MenuIcon />
      </TouchableOpacity>
    )
  }

  const MenuRightComponent = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          //navigation.navigate("Notifications")
          setOpenPanicPopup(true)
        }}
        style={{ paddingRight: 5 }}
      >
        <BellIcon />
      </TouchableOpacity>
    )
  }

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        rightComponent={<MenuRightComponent />}
        leftComponent={handleMenuButton()}
        centerComponent={{
          text: "AR Experiences",
          style: [_styles.heading]
        }}
        backgroundColor="transparent"
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, marginVertical: 15 }}
        data={destinationData}
        numColumns={1}
        refreshing={isLoading}
        onRefresh={() => {
          loadDestinations()
        }}
        renderItem={({ item }) => <Item obj={item} />}
        keyExtractor={item => item.id}
      />
      {openPanicPopUp &&
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
          <PanicPopUp onClose={() => { setOpenPanicPopup(false) }} />
        </View>}
    </BackgroundWithImage>
  )
}

export default GeoArChallenge
