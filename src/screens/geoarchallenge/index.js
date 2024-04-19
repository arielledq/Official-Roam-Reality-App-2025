import React, { useEffect, useState } from "react"

import { ActivityIndicator, FlatList, Image, ImageBackground, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { handleError } from "../../util/helpers"
import { getARChallenges, getARProfile, getARStettings } from '../../network'
import BackgroundWithImage from "../../components/background"
import AppHeader from "../../components/header"
import AppText from "../../components/text"
import { useNavigation } from "@react-navigation/native"
import SiteIcon from "../../assets/geoar/siteicon.svg"
import StarSiteIcon from "../../assets/geoar/starsite.svg"
import BellIcon from "../../assets/geoar/bell.svg"
import BackImg from "../../assets/geoar/back_img.png"
import ArIcon from "../../assets/geoar/aricon.svg"
import { updateARUserData, updateARSettings } from "../../redux/AR"

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import LinearGradient from "react-native-linear-gradient";


const GeoArChallenge = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [challengeChoice, setChallengeChoice] = useState("SPONSORED")
  const [sponsoredDataAll, setSponsoredDataAll] = useState([])
  const [sponsoredData, setSponsoredData] = useState([])
  const arProfile = useSelector(state => state.ar?.arProfile)
  const navigation = useNavigation()

  const ARSposored = () => {
    setIsLoading(true)
    getARChallenges().then((res) => {
      if (res.status == 1) {
        setSponsoredDataAll(res.data)
        setSponsoredData(res.data.filter(x => x.challenge_choice == challengeChoice))
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

  const setDataWithChoice = (choice) => {
    setChallengeChoice(choice);
    const filteredArray = sponsoredDataAll.filter(x => x.challenge_choice == choice)
    setSponsoredData(filteredArray.slice())
  }

  useEffect(() => {
    ARSposored()
    ARUserProfile()
    getSettings()
  }, []);

  const navigateToChallengeDetails = (obj) => {
    navigation.navigate("ArChallengeDetails", { challengeObj: obj });
  }

  const Item = ({ obj }) => (
    <TouchableOpacity onPress={() => navigateToChallengeDetails(obj)}>
      <ImageBackground style={_styles.containerView} resizeMode="contain" source={BackImg}>
        <LinearGradient
          colors={['#4F0F9350', '#344CAA50']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={_styles.gradient} 
        >
        </LinearGradient>
        <View style={[_styles.list_image, { backgroundColor: '#00000080' }]} />
        <Text style={_styles.list_title}>{obj.name}</Text>
        <Text style={_styles.s_list_title}>Sponsored By {obj.sponsored.name}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: "AR Experiences",
          style: [_styles.heading],
        }} backgroundColor="transparent" />

      {isLoading && <ActivityIndicator size="large" />}
      <FlatList
        style={{ flex: 1, marginVertical: 15 }}
        data={sponsoredData}
        numColumns={1}
        renderItem={({ item }) => <Item obj={item} />}
        keyExtractor={item => item.id}
      />
    </BackgroundWithImage >
  )
}



export default GeoArChallenge