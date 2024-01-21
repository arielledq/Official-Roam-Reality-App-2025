import React, { useEffect, useState } from "react"

import { Dimensions, Image, Keyboard, ScrollView, Text, View } from "react-native";
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../../navigation/types"
import BackgroundWithImage from "../../../components/background"
import { useNavigation, useRoute } from "@react-navigation/native"
import AppHeader from "../../../components/header"
import AppText from "../../../components/text"
import useStyles from "./styles"
import ShareImg from "../../../assets/ar/share_img.png"
import Coke from "../../../assets/ar/sponsored/coke.png"

const ArChallengeShare = ({

}) => {
  const styles = useStyles()
  const route = useRoute()
  const challengeObj = route?.params?.challengeObj;

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader title={challengeObj?.sponsored?.name} backgroundColor="transparent" />
      <AppText style={[styles.headerText]}>Congrats on completing the {challengeObj?.sponsored?.name} Photo AR Experience! </AppText>
      <AppText style={[styles.subHeaderText]}>Please note you must share your experience to at least one social platform to earn all your points.</AppText>
      <View style={{ borderRadius: 12, height: 422, width: '100%', backgroundColor: "#272741", marginVertical: 20, overflow: 'hidden' }}>
        <Image source={ShareImg} style={{ width: '100%', height: 318 }} />
        <View style={{ width: '100%', height: 104, borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: "#B816E0", width: 73, height: 63, borderRadius: 8 }}>
            <Text style={styles.pointCount}>50</Text>
            <Text style={styles.pointCountText}>Points</Text>
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image style={{ width: 24, height: 24, marginEnd: 10 }} source={Coke} />
              <Text style={styles.challengeSponsorName}>Coca Cola</Text>
            </View>
            <View >
              <Text style={styles.challengeSponsorTipText}>Share your recorded experience for extra credits!</Text>
              <Text style={styles.challengeSponsorStartDateText}>Started on : 12-12-23</Text>
            </View>
          </View>
        </View>
      </View>
    </BackgroundWithImage>
  )
}



export default ArChallengeShare