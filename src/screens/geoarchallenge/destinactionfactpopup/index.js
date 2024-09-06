import React, { useEffect, useState } from "react"

import { Alert, Dimensions, Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import BackgroundWithImage from "../../../components/background"
import { useNavigation, useRoute } from "@react-navigation/native"
import AppHeader from "../../../components/header"
import AppText from "../../../components/text"
import useStyles from "./styles"
import { FontSizes } from "../../../util/FontUtils"
import moment from "moment";
import FacebookShareImg from "../../../assets/ar/facebook.svg"
import InstagramShareImg from "../../../assets/ar/insta.svg"
import TiktokShareImg from "../../../assets/ar/tiktok.svg"
import { getARProfile, postGeoPinCheckIn, socialPointsARUpdateAPI } from "../../../network";
import { handleError } from "../../../util/helpers";
import { useDispatch, useSelector } from "react-redux"
import { updateARUserData } from "../../../redux/AR";
import { ShareDialog } from "react-native-fbsdk-next";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { share, init, events } from 'react-native-tiktok';
import BGArShare from "../../../assets/ar/bg-ar-share.png"
import StarShare from "../../../assets/geoar/star_share.svg"
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { moderateScale } from "../../../util/AppDimensions";
import RenderHTML from "react-native-render-html";
const { width } = Dimensions.get('window');

const DestinationFactPopUp = ({
  facts, onClose
}) => {

  const getPathFromUrl = (url) => {
    return url.split("?")[0];
  }
  const styles = useStyles()
  const route = useRoute()
  const captureData = facts.image;
  let filePath = getPathFromUrl(captureData)
  const fileExt = filePath.split('.').pop();
  const startDate = moment(new Date()).format('DD-MM-YYYY');
  const [imageHeight, setImageHeight] = useState(0)
  const dispatch = useDispatch()
  const sponsors = facts?.sponsors;


  useEffect(() => {
    const shareListener = events.addListener('onShareCompleted', (resp) => {
      console.log("Tiktok: onShareCompleted", resp)
      // response contains returned errorCode
    });
    if (fileExt !== 'mp4') {
      Image.getSize(captureData, (width, height) => {
        // calculate image width and height 
        const screenWidth = Dimensions.get('window').width - (2 * moderateScale(26))
        const scaleFactor = width / screenWidth
        const imageHeight = height / scaleFactor
        setImageHeight(imageHeight)
      })
    }
  }, []);


  const updateARSocialPoints = (social_network) => {
    socialPointsARUpdateAPI({
      social_network
    }).then((res) => {
      if (res.status == 1) {
        console.log(res.message)
      }
    })
  }

  const facebookShareAndroid = async () => {
    const filebase64 = await RNFS.readFile(captureData, 'base64')
    let shareContent = {}
    if (fileExt == 'mp4') {
      shareContent = {
        appId: '746185200437639',
        backgroundVideo: `data:video/mp4;base64,${filebase64}`,
        url: `data:video/mp4;base64,${filebase64}`,
        social: Platform.OS == 'android' ? Share.Social.FACEBOOK : Share.Social.FACEBOOK_STORIES,
      }
    }
    if (fileExt == 'png' || fileExt == 'jpg') {
      shareContent = {
        social: Platform.OS == 'android' ? Share.Social.FACEBOOK : Share.Social.FACEBOOK_STORIES,
        backgroundImage: `data:image/${fileExt};base64,${filebase64}`,
        type: `image/*`,
        appId: '746185200437639'
      }
    }
    try {
      const ShareResponse = await Share.shareSingle(shareContent);
      if (ShareResponse.success == true) {
        console.log('ShareResponse true =>', ShareResponse);
        updateARSocialPoints("FACEBOOK")
      } else {
        console.log('ShareResponse false =>', ShareResponse);
      }
    } catch (error) {
      console.log('Error =>', error);
    }
  }

  const facebookShareIOS = async () => {
    const filebase64 = await RNFS.readFile(captureData, 'base64')
    console.log("Facebook Share", fileExt)
    console.log("Facebook Share", captureData)
    ShareDialog.setMode("native")

    if (fileExt == 'png' || fileExt == 'jpg') {
      shareContent = {
        contentType: 'photo',
        photos: [{
          imageUrl: captureData,
        }],
      }
    }
    if (fileExt == 'mp4') {
      shareContent = {
        contentType: 'link',
        contentUrl: `data:video/mp4;base64,${filebase64}`,
        contentDescription: 'Wow, check out this great site!',
      }
    }
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
          updateARSocialPoints("FACEBOOK")
        }
      })
      .catch(e => {
        console.log("catch", e.toString())
      });
  }

  const FacebookShareImgOnPress = async () => {
    if (Platform.OS == 'android') {
      facebookShareAndroid()
    } else {
      facebookShareAndroid()
    }
  }

  const InstagramShareImgOnPress = async () => {
    const filebase64 = await RNFS.readFile(captureData, 'base64')

    let shareContent = {}
    if (fileExt == 'mp4') {
      shareContent = {
        type: 'video/mp4',
        backgroundVideo: `data:video/mp4;base64,${filebase64}`,
        url: `data:video/${fileExt};base64,${filebase64}`,
        social: Platform.OS == 'android' ? Share.Social.INSTAGRAM : Share.Social.INSTAGRAM_STORIES,
        appId: '746185200437639'
      }
    }
    if (fileExt == 'png' || fileExt == 'jpg') {
      shareContent = {
        type: `image/*`,
        url: `data:image/${fileExt};base64,${filebase64}`,
        backgroundImage: `data:image/${fileExt};base64,${filebase64}`,
        social: Platform.OS == 'android' ? Share.Social.INSTAGRAM : Share.Social.INSTAGRAM_STORIES,
        appId: '746185200437639',
        BackgroundAndStickerImage: `data:image/${fileExt};base64,${filebase64}`,
      }
    }
    try {
      const ShareResponse = await Share.shareSingle(shareContent);
      if (ShareResponse.success == true) {
        console.log('ShareResponse true =>', ShareResponse);
        updateARSocialPoints("INSTAGRAM")
      } else {
        console.log('ShareResponse false =>', ShareResponse);
      }
    } catch (error) {
      console.log('Error =>', error);
    }
  }

  const TiktokShareImgOnPress = async () => {
    if (fileExt == 'mp4') {
      const filebase64 = await RNFS.readFile(captureData, 'base64')
      init('aw5g4n448236v4uh');
      share(captureData, (code) => {
        console.log(code);
        updateARSocialPoints("TIKTOK")
      });
    } else {
      Alert.alert("Share Support Issue:", "Only Video Supported to share.")
    }
  }

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader leftComponent={null} centerComponent={{
        text: "Destination Facts",
        numberOfLines: 2,
        style: [styles.heading],
      }} backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, overflow: 'hidden' }
        }>
        <View style={styles.imageContainer}>
          <Image resizeMode={"contain"} source={{ uri: captureData }} style={{ width: '100%', height: imageHeight }} />
          <View style={{ padding: 20 }}>
            <Text style={styles.titleText}>{facts?.name}</Text>
            <RenderHTML
              contentWidth={width}
              tagsStyles={{
                p: {
                  lineHeight: 13.64,
                  color: '#fff',
                  fontSize: FontSizes.S10
                },
                strong: {
                  lineHeight: 13.64,
                  color: '#fff',
                  fontSize: FontSizes.S10
                }
              }}
              source={{
                html: `${facts?.facts}`
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, alignItems: "center" }}>
              <Text style={styles.sponsoredByText}>Sponsored By</Text>
              <View style={{ flexDirection: 'row' }}>
                {
                  sponsors.map((s, index) =>
                    <Image style={{ width: 26, height: 26 }} key={index} source={{ uri: s.image }} />
                  )
                }
              </View>
            </View>
          </View>
        </View>
        <View style={styles.detailContainer}>
          <View style={styles.pointsParentContainer}>
            <View style={styles.detailPointContainter}>
              <BackgroundWithImage imageSource={BGArShare} style={{ backgroundColor: 'transparent', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
              </BackgroundWithImage>
              <AppText style={styles.pointCount}>{facts?.points}</AppText>
              <AppText style={styles.pointCountText}>Points</AppText>
            </View>
            <View style={{ paddingHorizontal: 10, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <StarShare style={{ width: 20, height: 20, marginEnd: 10 }} />
                <Text style={styles.challengeSponsorName}>Travel Insights</Text>
              </View>
              <View style={{ width: '100%' }}>
                <Text style={styles.challengeSponsorTipText}>Must share this to at least one platform to earn points!</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginTop: 2 }}>
                  <Text style={styles.challengeSponsorStartDateText}>Completed on : {startDate}</Text>
                </View>
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
        <TouchableOpacity onPress={() => { navigation.navigate("Settings") }}>
          <Text style={styles.bottomText}>Link My Profiles</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { onClose() }}>
          <Text style={styles.notShareBottomText}>Do not Share</Text>
        </TouchableOpacity>
      </ScrollView>
    </BackgroundWithImage>
  )
}



export default DestinationFactPopUp