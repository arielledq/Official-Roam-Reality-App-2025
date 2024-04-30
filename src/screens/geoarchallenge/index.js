import React, { useEffect, useState } from "react"

import { ActivityIndicator, FlatList, Image, ImageBackground, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { handleError } from "../../util/helpers"
import { getGeoARDestinations, getARProfile, getARStettings } from '../../network'
import BackgroundWithImage from "../../components/background"
import AppHeader from "../../components/header"
import { useNavigation } from "@react-navigation/native"
import SiteIcon from "../../assets/geoar/siteicon.svg"
import StarSiteIcon from "../../assets/geoar/starsite.svg"
import GradientDown from "../../assets/geoar/gradient_down.svg"
import GradientDownPNG from "../../assets/geoar/gradient_down.png"
import BellIcon from "../../assets/geoar/bell.svg"
import LocationIcon from "../../assets/geoar/location.png"
import BackImg from "../../assets/geoar/back_img.png"
import ArIcon from "../../assets/geoar/aricon.svg"
import { updateARUserData, updateARSettings } from "../../redux/AR"

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import LinearGradient from "react-native-linear-gradient";
import { height, width } from "../../util/AppDimensions";


const GeoArChallenge = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [destinationData, setDestinationData] = useState([])
  const navigation = useNavigation()

  const ARSposored = () => {
    setIsLoading(true)
    getGeoARDestinations().then((res) => {
      console.log(res.data)
      if (res.status == 1) {
        setDestinationData(res.data)
      } else {
        res.message.message = "Error in loading Challenges."
        handleError(res)
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const ARUserProfile = () => {
    setIsLoading(true)
    getARProfile().then((res) => {
      if (res.status == 1) {
        dispatch(updateARUserData(res))
      } else {
        res.message.message = "Error in loading Challenges."
        handleError(res)
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const getSettings = () => {
    setIsLoading(true)
    getARStettings().then((res) => {
      if (res.data.length > 0) {
        dispatch(updateARSettings(res.data[0]))
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }


  useEffect(() => {
    ARSposored()
    ARUserProfile()
    getSettings()
  }, []);

  const navigateToChallengeDetails = (obj) => {
    navigation.navigate("GeoArChallengeDetails", { challengeObj: obj });
  }

  const Item = ({ obj }) => (
    <TouchableOpacity onPress={() => navigateToChallengeDetails(obj)} style={{ width: '100%' }}>
      <ImageBackground style={_styles.containerView} resizeMode="cover" source={{uri:obj.image}}>
        <Image source={GradientDownPNG} resizeMode="cover" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, width: '110%' }} />
        <View style={{ width: '100%', marginBottom: 10 }}>
          <Text style={_styles.list_title}>{obj.name}</Text>
          <View style={{ flexDirection: 'row', justifyContent: "flex-start", width: '100%', alignItems: "flex-start", marginTop: 20 }}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <SiteIcon style={{ width: 48, height: 48 }} />
              <Text style={_styles.s_list_count}>18+</Text>
              <Text style={_styles.s_list_text}>Sites</Text>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginStart: 22, marginEnd: 10 }}>
              <StarSiteIcon style={{ width: 48, height: 48 }} />
              <Text style={_styles.s_list_count}>8+</Text>
              <Text style={_styles.s_list_text}>Star Sites</Text>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <ArIcon style={{ width: 48, height: 48 }} />
              <Text style={_styles.s_list_count}>64+</Text>
              <Text style={_styles.s_list_text}>AR Challenges</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        rightComponent={<BellIcon />}
        centerComponent={{
          text: "AR Experiences",
          style: [_styles.heading],
        }} backgroundColor="transparent" />

      {isLoading && <ActivityIndicator size="large" />}
      <FlatList
        style={{ flex: 1, marginVertical: 15 }}
        data={destinationData}
        numColumns={1}
        renderItem={({ item }) => <Item obj={item} />}
        keyExtractor={item => item.id}
      />
    </BackgroundWithImage >
  )
}



export default GeoArChallenge