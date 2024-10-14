import React, { useEffect, useState } from 'react'

import { Dimensions, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import BackgroundWithImage from '../../../components/background'
import { useNavigation, useRoute } from '@react-navigation/native'
import AppHeader from '../../../components/header'
import AppText from '../../../components/text'
import useStyles from './styles'
import AppButton from '../../../components/button'
import moment from 'moment'
import FacebookShareImg from '../../../assets/ar/facebook.svg'
import InstagramShareImg from '../../../assets/ar/insta.svg'
import TiktokShareImg from '../../../assets/ar/tiktok.svg'
import {
  getARProfile,
  postGeoPinCheckIn,
  socialPointsARUpdateAPI,
  updateUserPointAPI,
} from '../../../network'
import { handleError, showMessage } from '../../../util/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { updateARUserData } from '../../../redux/AR'
import { ShareDialog } from 'react-native-fbsdk-next'
import Share from 'react-native-share'
import RNFS from 'react-native-fs'
import { share, init, events } from 'react-native-tiktok'
import BGArShare from '../../../assets/ar/bg-ar-share.png'
import PinShare from '../../../assets/geoar/pin_share.svg'
import { moderateScale } from '../../../util/AppDimensions'

const ArPinChallengeShare = ({}) => {
  const getPathFromUrl = url => {
    return url.split('?')[0]
  }

  const styles = useStyles()
  const route = useRoute()
  const navigation = useNavigation()
  const challengeObj = route?.params?.challengeObj
  const captureData = route?.params?.captureData
  const hideBottomTab = route?.params?.hideBottomTab
  let filePath = getPathFromUrl(captureData)
  const fileExt = filePath.split('.').pop()
  const startDate = moment(new Date()).format('DD-MM-YYYY')
  const [isLoading, setIsLoading] = useState(false)
  const [imageHeight, setImageHeight] = useState(0)
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite)
  const dispatch = useDispatch()

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

  const updateUserPoint = () => {
    updateUserPointAPI({
      points: challengeObj.points,
    })
      .then(res => {})
      .finally(() => {})
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
      <AppHeader
        centerComponent={{
          text: 'Location Check In',
          numberOfLines: 2,
          style: [styles.heading],
        }}
        backgroundColor='transparent'
      />
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, overflow: 'hidden' }}>
        <AppText numberOfLines={3} style={[styles.headerText]}>
          Congrats on completing the {challengeObj?.sponsored?.name} AR Experience!{' '}
        </AppText>
        <View style={styles.detailContainer}>
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
              <AppText style={styles.pointCount}>{challengeObj.points}</AppText>
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
                <PinShare style={{ width: 24, height: 24, marginEnd: 10 }} />
                <Text style={styles.challengeSponsorName}>Just Arrived</Text>
              </View>
              <View style={{ width: '100%' }}>
                <Text style={styles.challengeSponsorTipText}>
                  Share your content to earn points!
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
          <Text style={styles.shareText}>Tap the icons to share and earn points</Text>
        </View>
        {!hideBottomTab && (
          <View
            style={{
              justifyContent: 'flex-end',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Settings')
              }}
            >
              <Text style={styles.bottomText}>Link My Profiles</Text>
            </TouchableOpacity>

            <AppButton
              onPress={() => shareBtnOnPress()}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              title={'Share Please!'}
              loading={isLoading}
            />

            <AppButton
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'TabNavigator', params: { screen: 'GeoArChallenge' } }],
                })
              }}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              title={'End Experience'}
              loading={isLoading}
            />
          </View>
        )}
        <AppText numberOfLines={3} style={[styles.subHeaderText]}>
          Please note you must share your experience to at least one social platform to earn all
          your points.
        </AppText>
      </ScrollView>
    </BackgroundWithImage>
  )
}

export default ArPinChallengeShare
