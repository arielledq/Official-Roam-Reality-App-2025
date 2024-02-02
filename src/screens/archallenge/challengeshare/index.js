import React, { useEffect, useState } from "react"

import { Alert, Dimensions, Image, Keyboard, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../../navigation/types"
import BackgroundWithImage from "../../../components/background"
import { useNavigation, useRoute } from "@react-navigation/native"
import AppHeader from "../../../components/header"
import AppText from "../../../components/text"
import useStyles from "./styles"
import AppButton from "../../../components/button"
import moment from "moment";
import FacebookShare from "../../../assets/ar/facebook.svg"
import InstagramShare from "../../../assets/ar/insta.svg"
import TiktokShare from "../../../assets/ar/tiktok.svg"

const ArChallengeShare = ({

}) => {
  const styles = useStyles()
  const route = useRoute()
  const challengeObj = route?.params?.challengeObj;
  const captureData = route?.params?.captureData;
  const startDate = moment(challengeObj.created_at).format('DD-MM-YYYY');


  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader title={challengeObj?.sponsored?.name} backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, overflow: 'hidden' }
        }>
        <AppText numberOfLines={3} style={[styles.headerText]}>Congrats on completing the {challengeObj?.sponsored?.name} Photo AR Experience! </AppText>
        <AppText numberOfLines={3} style={[styles.subHeaderText]}>Please note you must share your experience to at least one social platform to earn all your points.</AppText>
        <View style={styles.detailContainer}>
          <Image source={{ uri: Platform.OS === 'android' ? `file://${captureData}` : captureData }} style={{ width: '100%', height: 318 }} />
          <View style={styles.pointsParentContainer}>
            <View style={styles.detailPointContainter}>
              <Text style={styles.pointCount}>{challengeObj.points}</Text>
              <Text style={styles.pointCountText}>Points</Text>
            </View>
            <View style={{ paddingHorizontal: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image style={{ width: 24, height: 24, marginEnd: 10 }} source={{ uri: challengeObj.sponsored.image }} />
                <Text style={styles.challengeSponsorName}>{challengeObj?.sponsored?.name}</Text>
              </View>
              <View >
                <Text style={styles.challengeSponsorTipText}>Share your recorded experience for extra credits!</Text>
                <Text style={styles.challengeSponsorStartDateText}>Started on : {startDate}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.socialShareContainer}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.shareBtn}>
              <FacebookShare />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn}>
              <InstagramShare />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn}>
              <TiktokShare />
            </TouchableOpacity>
          </View>
          <Text style={styles.shareText}>1 Extra Point Per Platform</Text>
        </View>
      </ScrollView>
      <View style={{ height: 104, justifyContent: 'flex-end', marginBottom: 30 }}>
        <Text style={styles.bottomText}>Link My Profiles</Text>
        <AppButton
          onPress={() => Alert.alert("Development In Progress")}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          title={"Share Please!"}
        />
      </View>
    </BackgroundWithImage>
  )
}



export default ArChallengeShare