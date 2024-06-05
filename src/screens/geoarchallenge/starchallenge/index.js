import React, { useEffect, useState } from "react"

import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background"
import AppHeader from "../../../components/header"
import SpeakerIcon from "../../../assets/geoar/speaker_icon.svg"
import InfoIcon from "../../../assets/geoar/Info.svg"
import MenIcon from "../../../assets/geoar/men_icon.svg"
import RadarBlipIcon from "../../../assets/geoar/radar_blip.svg"
import StarIcon from "../../../assets/geoar/star_icon.svg"
import TrophyIcon from "../../../assets/geoar/trophy_icon.svg"
import CaptureIcon from "../../../assets/geoar/capture_icon.svg"



import { useDispatch, useSelector } from "react-redux"
import useStyles from "./styles"
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
          text: "AR Star Hunt\nArima",
          numberOfLines: 2,
          style: [_styles.heading],
        }} backgroundColor="transparent" />

      {isLoading && <ActivityIndicator size="large" />}
      <View style={{ width: '100%', flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{
          backgroundColor: "#131422",
          borderRadius: 100,
          paddingHorizontal: 8,
          alignItems: 'center',
          height: 65,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          <View style={{ flexDirection: 'row' }}>
            <StarIcon style={{ width: 48, height: 48, marginEnd: 10 }} />
            <View>
              <Text style={_styles.exploringText}>Stars Collected</Text>
              <Text style={_styles.arrivedText}>4 / 12</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ marginEnd: 10 }}>
              <Text style={_styles.exploringText}>Points</Text>
              <Text style={_styles.arrivedText}>100</Text>
            </View>
            <TrophyIcon style={{ width: 48, height: 48 }} />
          </View>
        </View>
        <View style={{ backgroundColor: "#131422", position: 'relative', flex: 1, borderRadius: 16, marginVertical: 20 }}>
          <TouchableOpacity style={{
            width: 56, height: 56, position: "absolute", bottom: -28, alignSelf: 'center', marginLeft: 0, marginRight: 0
          }}>
            <CaptureIcon />
          </TouchableOpacity>
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
      </View>
    </BackgroundWithImage >
  )
}




export default StarChallenge