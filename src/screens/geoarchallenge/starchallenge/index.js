import React, { useEffect, useState } from "react"

import { ActivityIndicator, FlatList, Image, ImageBackground, Keyboard, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import MapView from 'react-native-maps';
import MoveForwardIcon from "../../../assets/geoar/large-step.svg"
import CloseBIcon from "../../../assets/geoar/Close.svg"

import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import { height, width } from "../../../util/AppDimensions";
import { useNavigation } from "@react-navigation/native";


const StarChallenge = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()

  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: "AR Star Hunt - Arima",
          numberOfLines: 2,
          style: [_styles.heading],
        }} backgroundColor="transparent" />

      {isLoading && <ActivityIndicator size="large" />}
      <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
        <View style={{ position: 'relative', height: 546, borderRadius: 16, overflow: 'hidden', marginTop: 20, marginHorizontal: 30 }}>
          
        </View>
        <View style={{
          backgroundColor: "#131422",
          borderRadius: 16,
          padding: 20,
          paddingBottom: 20,
          marginVertical: 20,
          alignItems: 'center',
          flexDirection: 'row'
        }}>
          <View style={{ flex: 1,marginEnd:12 }}>
            <Text style={_styles.arrivedText}>Arrived</Text>
            <Text style={_styles.exploringText}>Begin exploring</Text>
            <Text style={_styles.infoText}>Explore with your camera to find hidden stars. Collect them to uncover interesting facts and earn credits. Remember to take a picture with our pin for additional points.</Text>
          </View>
          <TouchableOpacity onPress={()=>navigation.navigate("ChallengeSelection")}>
            <MoveForwardIcon style={{ width: 56, height: 56 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BackgroundWithImage >
  )
}



export default StarChallenge