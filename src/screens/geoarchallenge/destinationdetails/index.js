import React, { useEffect, useState } from "react"

import { ActivityIndicator, FlatList, Image, ImageBackground, Keyboard, Text, TouchableOpacity, View } from "react-native";
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
import { updateARUserData, updateARSettings } from "../../../redux/AR"

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import LinearGradient from "react-native-linear-gradient";
import { height, width } from "../../../util/AppDimensions";


const GeoArChallengeDetails = ({

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
    </BackgroundWithImage >
  )
}



export default GeoArChallengeDetails