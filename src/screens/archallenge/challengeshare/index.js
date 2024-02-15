import React, { useState } from "react"

import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background"
import { useRoute } from "@react-navigation/native"
import AppHeader from "../../../components/header"
import AppText from "../../../components/text"
import useStyles from "./styles"
import AppButton from "../../../components/button"
import moment from "moment";
import FacebookShareImg from "../../../assets/ar/facebook.svg"
import InstagramShareImg from "../../../assets/ar/insta.svg"
import TiktokShareImg from "../../../assets/ar/tiktok.svg"
import { getARProfile, postArMemory, socialPointsARUpdateAPI } from "../../../network";
import { handleError } from "../../../util/helpers";
import Video from 'react-native-video';
import { useDispatch, useSelector } from "react-redux"
import { updateARUserData } from "../../../redux/AR";
import { ShareDialog } from "react-native-fbsdk-next";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

const ArChallengeShare = ({

}) => {
  const styles = useStyles()
  const route = useRoute()
  const challengeObj = route?.params?.challengeObj;
  const captureData = route?.params?.captureData;
  const fileExt = captureData.split('.').pop();
  const startDate = moment(challengeObj.created_at).format('DD-MM-YYYY');
  const [isLoading, setIsLoading] = useState(false)
  const [capturedUrl, setCapturedUrl] = useState(false)
  const dispatch = useDispatch()

  const shareBtnOnPress = () => {
    setIsLoading(true)
    let filename = captureData.split('/').pop()
    let shareFile = {
      uri: captureData,
      type: fileExt == 'mp4' ? 'video/mp4' : 'image/png',
      name: filename
    }
    const formData = new FormData()
    formData.append("challenges", challengeObj.id)
    formData.append("memory_file", shareFile)
    formData.append("memory_type", fileExt == 'mp4' ? "VIDEO" : "PHOTO")
    postArMemory(formData).then((res) => {
      ARUserProfile()
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

  const updateARSocialPoints = (social_network) => {
    socialPointsARUpdateAPI({
      social_network
    }).then((res) => {
      if (res.status == 1) {
        console.log(res.message)
      }
    })
  }

  const ARUserProfile = () => {
    getARProfile().then((res) => {
      if (res.status == 1) {
        dispatch(updateARUserData(res))
      }
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const FacebookShareImgOnPress = () => {
    updateARSocialPoints("FACEBOOK")
    Alert.alert("In Progress")
    return;
    console.log("Facebook Share", fileExt)
    console.log("Facebook Share", captureData)
    ShareDialog.setMode("native")
    let shareContent = {}
    if (fileExt == 'png') {
      shareContent = {
        contentType: 'photo',
        photos: [{
          imageUrl: captureData
        }],
      }
    }
    if (fileExt == 'mp4') {
      shareContent = {
        contentType: 'video',
        video: {
          localUrl: captureData
        },
      }
    }
    console.log("Facebook shareContent", shareContent)
    ShareDialog.canShow(shareContent)
      .then((canShow) => {
        console.log("Facebook canShow", canShow)
        if (canShow) {
          return ShareDialog.show(shareContent);
        }
      })
      .then((result) => {
        console.log('Share : '
          + result);
        if (result.isCancelled) {
          console.log('Share cancelled');
        } else {
          console.log('Share success with postId: '
            + result.postId);
        }
      })
      .catch(e => {
        console.log("catch", e.toString())
      });
  }

  const InstagramShareImgOnPress = async () => {
    updateARSocialPoints("INSTAGRAM")
    Alert.alert("In Progress")
    return;
    const filebase64 = await RNFS.readFile(captureData, 'base64')
    console.log('InstagramShareImgOnPress filebase64er =>', filebase64);

    let shareContent = {}
    if (fileExt == 'mp4') {
      shareContent = {
        title: 'Share video to instagram',
        type: 'video/mp4',
        url: filebase64,
        social: Share.Social.INSTAGRAM,
      }
    }
    if (fileExt == 'png') {
      shareContent = {
        title: 'Share image to instagram',
        type: 'image/png',
        url: filebase64,
        social: Share.Social.INSTAGRAM,
      }
    } try {
      const ShareResponse = await Share.shareSingle(shareContent);
      console.log('InstagramShareImgOnPress ShareResponse =>', ShareResponse);
    } catch (error) {
      console.log('Error =>', error);
    }
  }

  const TiktokShareImgOnPress = async () => {
    updateARSocialPoints("TIKTOK")
    Alert.alert("In Progress")
    return;
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

          {fileExt == 'mp4' ? <Video repeat={true} style={{ width: '100%', height: 318 }} source={{
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
            <TouchableOpacity onPress={FacebookShareImgOnPress} style={styles.shareBtn}>
              <FacebookShareImg />
            </TouchableOpacity>
            <TouchableOpacity onPress={InstagramShareImgOnPress} style={styles.shareBtn}>
              <InstagramShareImg />
            </TouchableOpacity>
            <TouchableOpacity onPress={TiktokShareImgOnPress} style={styles.shareBtn}>
              <TiktokShareImg />
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