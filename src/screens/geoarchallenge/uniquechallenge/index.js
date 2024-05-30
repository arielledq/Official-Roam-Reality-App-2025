import React, { useEffect, useState } from "react"

import { ActivityIndicator, FlatList, Image, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { handleError } from "../../../util/helpers"
import { getARChallenges, getARProfile, getARStettings } from '../../../network'
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import AppText from "../../../components/text"
import { useNavigation } from "@react-navigation/native"
import PointBoardBG from "../../../assets/ar/point_board_bg.png"
import { updateARUserData, updateARSettings } from "../../../redux/AR"

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"


const UniqueArChallenge = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [challengeChoice, setChallengeChoice] = useState("PHOTO")
  const [sponsoredDataAll, setSponsoredDataAll] = useState([])
  const [sponsoredData, setSponsoredData] = useState([])
  const selectedDestination = useSelector(state => state.ar?.selectedDestination)
  const arProfile = useSelector(state => state.ar?.arProfile)
  const navigation = useNavigation()
  const unique_ar_sites = selectedDestination.unique_ar_sites


  const ARSposored = () => {
    setIsLoading(true)
    let challengesArray = []
    unique_ar_sites.forEach(element => {
      console.log("unique_ar_sites.forEach")
      challengesArray = [...challengesArray, ...element.challenge]
    });
    setSponsoredDataAll(challengesArray)
    const filterData = challengesArray.filter(x => x.challenge_requirement == 'PHOTO')
    setSponsoredData(filterData)
    setIsLoading(false)
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
    if (choice == 'PHOTO') {
      const filteredArray = sponsoredDataAll.filter(x => x.challenge_requirement == 'PHOTO')
      setSponsoredData(filteredArray.slice())
    } else {
      const filteredArray = sponsoredDataAll.filter(x => x.challenge_requirement !== 'PHOTO')
      setSponsoredData(filteredArray.slice())
    }
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
    <TouchableOpacity onPress={() => navigateToChallengeDetails(obj)} style={_styles.list_item}>
      <Image style={_styles.list_image} resizeMode="stretch" source={{ uri: obj.image }} />
      <View style={[_styles.list_image, { backgroundColor: '#00000080' }]} />
      <Text style={_styles.list_title}>{obj.name}</Text>
      <Text style={_styles.s_list_title}>Sponsored By {obj.sponsored.name}</Text>
    </TouchableOpacity>
  );

  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: "Unique Site AR",
          style: [_styles.heading],
        }} backgroundColor="transparent" />
      <View style={_styles.rowView}>
        <View style={{ flex: .5 }}>
          <AppText style={[_styles.headerText]}>Choose Your AR Challenge</AppText>
          <AppText style={[_styles.subHeaderText]}>Sponsored</AppText>
        </View>
        <BackgroundWithImage
          style={{ backgroundColor: "transparent", flex: .5, height: 94, justifyContent: "center", alignItems: 'center' }}
          imageSource={PointBoardBG}>
          <AppText style={[_styles.pointsText]}>{arProfile?.points}</AppText>
          <AppText style={[_styles.yourPointsText]}>Your Total Points</AppText>
        </BackgroundWithImage>
      </View>
      <View style={_styles.rowView}>
        <TouchableOpacity onPress={() => setDataWithChoice("PHOTO")} activeOpacity={.5} style={challengeChoice == "PHOTO" ? _styles.selectButtonStyle : _styles.unSelectButtonStyle}>
          <Text style={_styles.buttonSelectText}>Photo Challenges</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDataWithChoice("VIDEO")} activeOpacity={.5} style={challengeChoice == "VIDEO" ? _styles.selectButtonStyle : _styles.unSelectButtonStyle}>
          <Text style={_styles.buttonSelectText}>Video Challenges </Text>
        </TouchableOpacity>
      </View>

      {isLoading && <ActivityIndicator size="large" />}
      <FlatList
        style={{ flex: 1, marginVertical: 15 }}
        data={sponsoredData}
        numColumns={2}
        renderItem={({ item }) => <Item obj={item} />}
        keyExtractor={item => item.id}
      />
    </BackgroundWithImage >
  )
}



export default UniqueArChallenge