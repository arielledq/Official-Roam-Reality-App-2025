import React, { useEffect, useState } from "react"

import { FlatList, Image, Keyboard, Text, TouchableOpacity, View } from "react-native";
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
import { handleError } from "../../util/helpers"
import { getARChallenges, getARSposored } from '../../network'
import BackgroundWithImage from "../../components/background"
import AppHeader from "../../components/header"
import AppText from "../../components/text"
import { useNavigation } from "@react-navigation/native"
import PointBoardBG from "../../assets/ar/point_board_bg.png"

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"


const ArChallenge: ScreenStackComponent<RootStackParamList, "ArChallenge"> = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [sponsoredData, setSponsoredData] = useState([])
  const navigation = useNavigation()

  const ARSposored = () => {
    setIsLoading(true)
    getARChallenges().then((res) => {
      if (res.status == 1) {
        setSponsoredData(res.data)
      } else {
        handleError(res)
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    ARSposored()
  }, []);

  const navigateToChallengeDetails = (obj) => {
    navigation.navigate("ArChallengeDetails", { challengeObj: obj });
  }

  type ItemProps = { title: string, image: string };

  const Item = ({ obj }: ItemProps) => (
    <TouchableOpacity onPress={() => navigateToChallengeDetails(obj)} style={_styles.list_item}>
      <Image style={_styles.list_image} source={{ uri: obj.sponsored.image }} />
      <Text style={_styles.list_title}>{obj.sponsored.name}</Text>
    </TouchableOpacity>
  );

  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader title={"Anywhere AR Challenges"} backgroundColor="transparent" />
      <View style={_styles.rowView}>
        <View style={{ flex: .5 }}>
          <AppText style={[_styles.headerText]}>Choose You AR Challenge</AppText>
          <AppText style={[_styles.subHeaderText]}>Sponsored</AppText>
        </View>
        <BackgroundWithImage
          style={{ backgroundColor: "transparent", flex: .5, height: 94, justifyContent: "center", alignItems: 'center' }}
          imageSource={PointBoardBG}>
          <AppText style={[_styles.headerText]}>0</AppText>
          <AppText style={[_styles.subHeaderText]}>Your Total Points</AppText>
        </BackgroundWithImage>
      </View>
      <View style={_styles.rowView}>
        <TouchableOpacity activeOpacity={.5} style={_styles.selectButtonStyle}>
          <Text style={_styles.buttonSelectText}>Photo Challenges</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={.5} style={_styles.unSelectButtonStyle}>
          <Text style={_styles.buttonSelectText}>Dance Challenges </Text>
        </TouchableOpacity>
      </View>
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