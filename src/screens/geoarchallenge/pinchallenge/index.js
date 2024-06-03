import React, { useEffect, useState } from "react"

import { ActivityIndicator, FlatList, Image, ImageBackground, Keyboard, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import SpeakerIcon from "../../../assets/geoar/speaker_icon.svg"
import InfoIcon from "../../../assets/geoar/Info.svg"
import MenIcon from "../../../assets/geoar/men_icon.svg"
import RadarBlipIcon from "../../../assets/geoar/radar_blip.svg"


import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
import { height, width } from "../../../util/AppDimensions";
import { useNavigation } from "@react-navigation/native";


const PinChallenge = ({

}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation()

  return (

    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: "Location Check In\nArima",
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
          alignItems: 'center'
        }}>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
            <View style={{ flexDirection: 'row' }}>
              <MenIcon style={{ width: 40, height: 40 }} />
              <View>
                <Text style={_styles.exploringText}>Pin</Text>
                <Text style={_styles.arrivedText}>4 feet away</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <RadarBlipIcon style={{ width: 10, height: 10, marginEnd: 25 }} />
              <TouchableOpacity>
                <SpeakerIcon style={{ width: 40, height: 40 }} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <InfoIcon style={{ width: 20, height: 20, marginEnd: 6 }} />
            <Text style={_styles.infoText}>The closer you get to the Pin faster the chime beeps and quicker the dot pulsates. You can switch off the Sound by clicking on the speaker</Text>
          </View>
        </View>
      </ScrollView>
    </BackgroundWithImage >
  )
}



export default PinChallenge