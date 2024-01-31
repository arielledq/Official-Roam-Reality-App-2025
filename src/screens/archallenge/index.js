import React, { useEffect, useState } from "react"

import { ActivityIndicator, FlatList, Image, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { handleError } from "../../util/helpers"
import { getARChallenges, getARProfile } from '../../network'
import BackgroundWithImage from "../../components/background"
import AppHeader from "../../components/header"
import AppText from "../../components/text"
import { useNavigation } from "@react-navigation/native"
import PointBoardBG from "../../assets/ar/point_board_bg.png"

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"


const ArChallenge = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [challengeChoice, setChallengeChoice] = useState("SPONSORED")
  const [sponsoredDataAll, setSponsoredDataAll] = useState([])
  const [sponsoredData, setSponsoredData] = useState([])
  const [arProfile, setARProfile] = useState({})
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
      console.log("getARProfile::", res)
      if (res.status == 1) {
        setARProfile(res)
      } else {
        res.message.message = "Error in loading Challenges."
        handleError(res)
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
  }, []);

  const navigateToChallengeDetails = (obj) => {
    navigation.navigate("ArChallengeDetails", { challengeObj: obj });
  }

  const Item = ({ obj }) => (
    <TouchableOpacity onPress={() => navigateToChallengeDetails(obj)} style={_styles.list_item}>
      <Image style={_styles.list_image} source={{ uri: obj.sponsored.image }} />
      <Text style={_styles.list_title}>{obj.sponsored.name}</Text>
    </TouchableOpacity>
  );

  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader titleStyle={{fontSize:16}} title={"Anywhere AR Challenges"} backgroundColor="transparent" />
      <View style={_styles.rowView}>
        <View style={{ flex: .5 }}>
          <AppText style={[_styles.headerText]}>Choose You AR Challenge</AppText>
          <AppText style={[_styles.subHeaderText]}>Sponsored</AppText>
        </View>
        <BackgroundWithImage
          style={{ backgroundColor: "transparent", flex: .5, height: 94, justifyContent: "center", alignItems: 'center' }}
          imageSource={PointBoardBG}>
          <AppText style={[_styles.headerText]}>{arProfile?.points}</AppText>
          <AppText style={[_styles.subHeaderText]}>Your Total Points</AppText>
        </BackgroundWithImage>
      </View>
      <View style={_styles.rowView}>
        <TouchableOpacity onPress={() => setDataWithChoice("SPONSORED")} activeOpacity={.5} style={challengeChoice == "SPONSORED" ? _styles.selectButtonStyle : _styles.unSelectButtonStyle}>
          <Text style={_styles.buttonSelectText}>Photo Challenges</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDataWithChoice("DANCE")} activeOpacity={.5} style={challengeChoice == "DANCE" ? _styles.selectButtonStyle : _styles.unSelectButtonStyle}>
          <Text style={_styles.buttonSelectText}>Dance Challenges </Text>
        </TouchableOpacity>
      </View>

      {isLoading && <ActivityIndicator size="large" /> }
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



export default ArChallenge