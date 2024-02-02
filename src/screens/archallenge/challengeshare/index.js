import React, { useEffect, useState } from "react"

import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
import { postArMemory } from "../../../network";
import { handleError } from "../../../util/helpers";
import Video from 'react-native-video';

const ArChallengeShare = ({

}) => {
  const styles = useStyles()
  const route = useRoute()
  const challengeObj = route?.params?.challengeObj;
  const captureData = route?.params?.captureData;
  const fileExt = captureData.split('.').pop();
  const startDate = moment(challengeObj.created_at).format('DD-MM-YYYY');
  const [isLoading, setIsLoading] = useState(false)

  const shareBtnOnPress = () => {
    setIsLoading(true)
    let filename = captureData.split('/').pop()
    let shareFile = {
      uri: captureData,
      type: fileExt == '.mp4' ? 'video/mp4' : 'image/png',
      name: filename
    }
    const formData = new FormData()
    formData.append("challenges", challengeObj.id)
    formData.append("memory_file", shareFile)
    postArMemory(formData).then((res) => {
      console.log("shareBtnOnPress::", res)
      if (res.status == 1) {
        Alert.alert("AR Challenge Share!", "Successfully, completed you challenge.")
      } else {
        res.message.message = "Error in Sharing Challenges."
        handleError(res)
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }

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

          {fileExt == '.mp4' ? <Video repeat={true} style={{ width: '100%', height: 318 }} source={{
            uri: captureData
          }} />
            :
            <Image source={{ uri: captureData }} style={{ width: '100%', height: 318 }} />}
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
          onPress={() => shareBtnOnPress()}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          title={"Share Please!"}
          loading={isLoading}
        />
      </View>
    </BackgroundWithImage>
  )
}



export default ArChallengeShare