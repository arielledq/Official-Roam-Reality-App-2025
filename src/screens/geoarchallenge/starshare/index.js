import React, { useEffect, useState } from 'react'

import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import BackgroundWithImage from '../../../components/background'
import AppHeaderPopUp from '../../../components/headerPopup'
import AppText from '../../../components/text'
import useStyles from './styles'
import { FontSizes } from '../../../util/FontUtils'
import moment from 'moment'
import FacebookShareImg from '../../../assets/ar/facebook.svg'
import InstagramShareImg from '../../../assets/ar/insta.svg'
import TiktokShareImg from '../../../assets/ar/tiktok.svg'
import {
  getARProfile,
  postArMemory,
  postGeoPinCheckIn,
  socialPointsARUpdateAPI,
} from '../../../network'
import { useDispatch, useSelector } from 'react-redux'
import { updateARUserData } from '../../../redux/AR'
import { ShareDialog } from 'react-native-fbsdk-next'
import Share from 'react-native-share'
import RNFS from 'react-native-fs'
import { share, init, events } from 'react-native-tiktok'
import BGArShare from '../../../assets/ar/bg-ar-share.png'
import StarShare from '../../../assets/geoar/star_share.svg'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import { moderateScale } from '../../../util/AppDimensions'
import RenderHTML from 'react-native-render-html'
import { showMessage, handleError } from '../../../util/helpers'
const { width } = Dimensions.get('window')

const ArStarChallengeShare = props => {
  const getPathFromUrl = url => {
    if (url) {
      return url.split('?')[0]
    } else {
      return ''
    }
  }

  const styles = useStyles()
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite)
  const closeCallBack = props?.closeCallBack
  const challengeObj = props?.challengeObj
  const starObj = props?.starObj
  const captureData = selectedGeoSite.image
  let filePath = getPathFromUrl(captureData)
  const fileExt = filePath.split('.').pop()
  const startDate = moment(new Date()).format('DD-MM-YYYY')
  const [isLoading, setIsLoading] = useState(false)
  const [imageHeight, setImageHeight] = useState(0)
  const dispatch = useDispatch()
  const sponsors = starObj?.sponsors

  useEffect(() => {
    const shareListener = events.addListener('onShareCompleted', resp => {
      // response contains returned errorCode
    })
    if (fileExt !== 'mp4') {
      Image.getSize(captureData, (width, height) => {
        // calculate image width and height
        const screenWidth = Dimensions.get('window').width - 2 * moderateScale(26)
        const scaleFactor = width / screenWidth
        const imageHeight = height / scaleFactor
        setImageHeight(imageHeight)
      })
    }
    shareBtnOnPress()
  }, [])

  const shareBtnOnPress = () => {
    setIsLoading(true)
    let filename = captureData.split('/').pop()
    let shareFile = {
      uri: captureData,
      type: fileExt == 'mp4' ? 'video/mp4' : `image/{${fileExt}}`,
      name: filename,
    }
    const formData = new FormData()
    formData.append('geo_site', selectedGeoSite.id)
    formData.append('check_in_image', shareFile)
    postGeoPinCheckIn(formData)
      .then(res => {
        ARUserProfile()
        if (res.status == 1) {
          showMessage(
            'Successfully, completed your challenge.',
            'success',
            'Location Check In Challenge Share!'
          )
          updateUserPoint()
        } else {
          res.message.message =
            'You already completed the challenge or there is some issue with completing the challenge.'
          handleError(res)
        }
      })
      .catch(error => {
        console.error('error sharing location check in', error)
      })

      .finally(() => {
        setIsLoading(false)
      })
  }

  const updateARSocialPoints = social_network => {
    socialPointsARUpdateAPI({
      social_network,
    }).then(res => {
      if (res.status == 1) {
      }
    })
  }

  const ARUserProfile = () => {
    getARProfile()
      .then(res => {
        if (res.status == 1) {
          dispatch(updateARUserData(res))
        }
      })
      .finally(() => {
        setIsLoading(false)
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
        appId: '746185200437639',
      }
    }
    try {
      const ShareResponse = await Share.shareSingle(shareContent)
      if (ShareResponse.success == true) {
        updateARSocialPoints('FACEBOOK')
      } else {
      }
    } catch (error) {
      console.error('Error =>', error)
    }
  }

  const facebookShareIOS = async () => {
    const filebase64 = await RNFS.readFile(captureData, 'base64')

    ShareDialog.setMode('native')

    if (fileExt == 'png' || fileExt == 'jpg') {
      shareContent = {
        contentType: 'photo',
        photos: [
          {
            imageUrl: captureData,
          },
        ],
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
      .then(canShow => {
        if (canShow) {
          return ShareDialog.show(shareContent)
        }
      })
      .then(result => {
        if (result.isCancelled) {
        } else {
          updateARSocialPoints('FACEBOOK')
        }
      })
      .catch(e => {
        console.error('catch', e.toString())
      })
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
        appId: '746185200437639',
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
      const ShareResponse = await Share.shareSingle(shareContent)
      if (ShareResponse.success == true) {
        updateARSocialPoints('INSTAGRAM')
      } else {
      }
    } catch (error) {
      console.error('Error =>', error)
    }
  }

  const TiktokShareImgOnPress = async () => {
    if (fileExt == 'mp4') {
      const filebase64 = await RNFS.readFile(captureData, 'base64')
      init('aw5g4n448236v4uh')
      share(captureData, code => {
        updateARSocialPoints('TIKTOK')
      })
    } else {
      showMessage('Only Video Supported to share.', 'error', 'Share Support Issue:')
    }
  }

  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeaderPopUp
        centerComponent={{
          text: 'Travel Insights',
          numberOfLines: 2,
          style: [styles.heading],
        }}
        backgroundColor='transparent'
        onBackPress={closeCallBack}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, overflow: 'hidden' }}>
        <AppText numberOfLines={3} style={[styles.headerText]}>
          Congrats on completing the {challengeObj?.sponsored?.name} AR Experience!{' '}
        </AppText>
        <View style={styles.imageContainer}>
          <Image
            resizeMode={'stretch'}
            source={{ uri: captureData }}
            style={{
              backgroundColor: 'transparent',
              width: '70%',
              height: Platform.OS === 'ios' ? imageHeight * 0.6 : imageHeight * 0.7,
              marginTop: 0,
            }}
          />
          <View style={{ padding: 20 }}>
            <Text style={styles.titleText}>{starObj?.name}</Text>
            <RenderHTML
              contentWidth={width}
              tagsStyles={{
                p: {
                  lineHeight: 13.64,
                  color: '#fff',
                  fontSize: FontSizes.S10,
                },
                strong: {
                  lineHeight: 13.64,
                  color: '#fff',
                  fontSize: FontSizes.S10,
                },
              }}
              source={{
                html: `${starObj?.fun_facts}`,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 15,
                alignItems: 'center',
              }}
            >
              <Text style={styles.sponsoredByText}>Sponsored By</Text>
              <View style={{ flexDirection: 'row' }}>
                {sponsors.map((s, index) => (
                  <Image style={{ width: 26, height: 26 }} key={i} source={{ uri: s.image }} />
                ))}
              </View>
            </View>
          </View>
        </View>
        <View style={styles.detailContainer}>
          <View style={styles.pointsParentContainer}>
            <View style={styles.detailPointContainter}>
              <BackgroundWithImage
                imageSource={BGArShare}
                style={{
                  backgroundColor: 'transparent',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                }}
              ></BackgroundWithImage>
              <AppText style={styles.pointCount}>{challengeObj?.points}</AppText>
              <AppText style={styles.pointCountText}>Points</AppText>
            </View>
            <View style={{ paddingHorizontal: 10, flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <StarShare style={{ width: 20, height: 20, marginEnd: 10 }} />
                <Text style={styles.challengeSponsorName}>Travel Insights</Text>
              </View>
              <View style={{ width: '100%' }}>
                <Text style={styles.challengeSponsorTipText}>
                  Must share this to at least one platform to earn all your star points!
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'space-between',
                    marginTop: 2,
                  }}
                >
                  <Text style={styles.challengeSponsorStartDateText}>
                    Completed on : {startDate}
                  </Text>
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
            {fileExt == 'mp4' && (
              <TouchableOpacity onPress={TiktokShareImgOnPress} style={styles.shareBtn}>
                <TiktokShareImg />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.shareText}>1 Extra Point Per Platform</Text>
        </View>
        <TouchableOpacity onPress={closeCallBack}>
          <Text style={styles.notShareBottomText}>Do not Share</Text>
        </TouchableOpacity>
      </ScrollView>
    </BackgroundWithImage>
  )
}

export default ArStarChallengeShare
