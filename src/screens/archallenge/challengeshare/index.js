import React, { useEffect, useState } from "react";

import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BackgroundWithImage from "../../../components/background";
import { useNavigation, useRoute } from "@react-navigation/native";
import AppHeader from "../../../components/header";
import AppText from "../../../components/text";
import useStyles from "./styles";
import AppButton from "../../../components/button";
import moment from "moment";
import FacebookShareImg from "../../../assets/ar/facebook.svg";
import InstagramShareImg from "../../../assets/ar/insta.svg";
import TiktokShareImg from "../../../assets/ar/tiktok.svg";
import { getARProfile, postArMemory, socialPointsARUpdateAPI } from "../../../network";
import { handleError, showMessage } from "../../../util/helpers";
import Video from "react-native-video";
import { useDispatch, useSelector } from "react-redux";
import { updateARUserData } from "../../../redux/AR";
import { ShareDialog } from "react-native-fbsdk-next";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import { share, init, events } from "react-native-tiktok";
import BGArShare from "../../../assets/ar/bg-ar-share.png";
import DownloadImg from "../../../assets/ar/download.svg";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { moderateScale } from "../../../util/AppDimensions";

const ArChallengeShare = ({}) => {
  const getPathFromUrl = url => {
    return url.split("?")[0];
  };

  const styles = useStyles();
  const route = useRoute();
  const navigation = useNavigation();
  const challengeObj = route?.params?.challengeObj;
  const captureData = route?.params?.captureData;
  const correctedCaptureData = `file://${captureData}`;
  const hideBottomTab = route?.params?.hideBottomTab;
  let filePath = getPathFromUrl(correctedCaptureData);
  const fileExt = filePath.split(".").pop();
  const startDate = moment(new Date()).format("DD-MM-YYYY");
  const [isLoading, setIsLoading] = useState(false);
  const [imageHeight, setImageHeight] = useState(0);
  const dispatch = useDispatch();

  console.log("challenges", challengeObj.id);
  console.log("fileExt", fileExt);
  console.log("captureData", correctedCaptureData);

  // useEffect(() => {
  //   const shareListener = events.addListener('onShareCompleted', resp => {
  //     console.log('Tiktok: onShareCompleted', resp)
  //     // response contains returned errorCode
  //   })
  //   if (fileExt !== 'mp4') {
  //     Image.getSize(correctedCaptureData, (width, height) => {
  //       const screenWidth = Dimensions.get('window').width - 2 * moderateScale(26);
  //       const scaleFactor = width / screenWidth;
  //       const imageHeight = height / scaleFactor;
  //       setImageHeight(imageHeight);
  //     }, error => {
  //       console.error('Error al obtener el tamaño de la imagen', error)
  //     })
  //   }
  // }, [])

  const shareBtnOnPress = () => {
    setIsLoading(true);
    let filename = correctedCaptureData.split("/").pop();
    let shareFile = {
      uri: correctedCaptureData,
      type: fileExt == "mp4" ? "video/mp4" : `image/{${fileExt}}`,
      name: filename,
    };
    const formData = new FormData();
    formData.append("challenges", challengeObj.id);
    formData.append("memory_file", shareFile);
    formData.append("memory_type", fileExt == "mp4" ? "VIDEO" : "PHOTO");
    postArMemory(formData)
      .then(res => {
        ARUserProfile();
        if (res.status === 1) {
          showMessage(
            "Successfully, completed your challenge.",
            "success",
            "AR Photo Challenge Share!"
          );
        } else {
          handleError(res.message);
        }
      })
      .catch(error => {
        console.error("Error al compartir el desafío:", error);
        handleError(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateARSocialPoints = social_network => {
    socialPointsARUpdateAPI({
      social_network,
    }).then(res => {
      if (res.status == 1) {
      }
    });
  };

  const ARUserProfile = () => {
    getARProfile()
      .then(res => {
        if (res.status == 1) {
          dispatch(updateARUserData(res));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // const facebookShareAndroid = async () => {
  //   const filebase64 = await RNFS.readFile(correctedCaptureData, 'base64')
  //   let shareContent = {}
  //   if (fileExt == 'mp4') {
  //     shareContent = {
  //       appId: '746185200437639',
  //       backgroundVideo: `data:video/mp4;base64,${filebase64}`,
  //       url: `data:video/mp4;base64,${filebase64}`,
  //       social: Platform.OS == 'android' ? Share.Social.FACEBOOK : Share.Social.FACEBOOK_STORIES,
  //     }
  //   }
  //   if (fileExt == 'png' || fileExt == 'jpg') {
  //     shareContent = {
  //       social: Platform.OS == 'android' ? Share.Social.FACEBOOK : Share.Social.FACEBOOK_STORIES,
  //       backgroundImage: `data:image/${fileExt};base64,${filebase64}`,
  //       type: `image/*`,
  //       appId: '746185200437639',
  //     }
  //   }
  //   try {
  //     const ShareResponse = await Share.shareSingle(shareContent)
  //     if (ShareResponse.success == true) {
  //       console.log('ShareResponse true =>', ShareResponse)
  //       updateARSocialPoints('FACEBOOK')
  //     } else {
  //       console.log('ShareResponse false =>', ShareResponse)
  //     }
  //   } catch (error) {
  //     console.log('Error =>', error)
  //   }
  // }

  const facebookShareIOS = async () => {
    const filebase64 = await RNFS.readFile(correctedCaptureData, "base64");
    console.log("Facebook Share", fileExt);
    console.log("Facebook Share", correctedCaptureData);
    ShareDialog.setMode("native");

    if (fileExt == "png" || fileExt == "jpg") {
      shareContent = {
        contentType: "photo",
        photos: [
          {
            imageUrl: correctedCaptureData,
          },
        ],
      };
    }
    if (fileExt == "mp4") {
      shareContent = {
        contentType: "link",
        contentUrl: `data:video/mp4;base64,${filebase64}`,
        contentDescription: "Wow, check out this great site!",
      };
    }
    ShareDialog.canShow(shareContent)
      .then(canShow => {
        if (canShow) {
          return ShareDialog.show(shareContent);
        }
      })
      .then(result => {
        if (result.isCancelled) {
        } else {
          updateARSocialPoints("FACEBOOK");
        }
      })
      .catch(e => {
        console.error("catch", e.toString());
      });
  };

  const FacebookShareImgOnPress = async () => {
    if (Platform.OS == "android") {
      facebookShareAndroid();
    } else {
      facebookShareAndroid();
    }
  };

  const InstagramShareImgOnPress = async () => {
    const filebase64 = await RNFS.readFile(correctedCaptureData, "base64");

    let shareContent = {};
    if (fileExt == "mp4") {
      shareContent = {
        type: "video/mp4",
        backgroundVideo: `data:video/mp4;base64,${filebase64}`,
        url: `data:video/${fileExt};base64,${filebase64}`,
        social: Platform.OS == "android" ? Share.Social.INSTAGRAM : Share.Social.INSTAGRAM_STORIES,
        appId: "746185200437639",
      };
    }
    if (fileExt == "png" || fileExt == "jpg") {
      shareContent = {
        type: `image/*`,
        url: `data:image/${fileExt};base64,${filebase64}`,
        backgroundImage: `data:image/${fileExt};base64,${filebase64}`,
        social: Platform.OS == "android" ? Share.Social.INSTAGRAM : Share.Social.INSTAGRAM_STORIES,
        appId: "746185200437639",
        BackgroundAndStickerImage: `data:image/${fileExt};base64,${filebase64}`,
      };
    }
    try {
      const ShareResponse = await Share.shareSingle(shareContent);
      if (ShareResponse.success == true) {
        updateARSocialPoints("INSTAGRAM");
      }
    } catch (error) {
      console.error("Error =>", error);
    }
  };

  const TiktokShareImgOnPress = async () => {
    if (fileExt == "mp4") {
      const filebase64 = await RNFS.readFile(correctedCaptureData, "base64");
      init("aw5g4n448236v4uh");
      share(correctedCaptureData, code => {
        console.log(code);
        updateARSocialPoints("TIKTOK");
      });
    } else {
      showMessage("Only Video Supported to share.", "error", "Share Support Issue:");
    }
  };

  const checkPermission = () => {
    CameraRoll.saveAsset(correctedCaptureData, {
      type: fileExt == "mp4" ? "video" : "photo",
    })
      .then(() => {
        showMessage("Saved to Camera Roll.");
      })
      .catch(err => {
        console.error("err:", err);
        showMessage("Not able to save, please check permission.", "error");
      });
  };
  console.log(correctedCaptureData);
  return (
    <BackgroundWithImage style={styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: "AR Challenges",
          numberOfLines: 2,
          style: [styles.heading],
        }}
        backgroundColor="transparent"
      />
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, overflow: "hidden" }}>
        <AppText numberOfLines={3} style={[styles.headerText]}>
          Congrats on completing the {challengeObj?.sponsored?.name} AR Experience!{" "}
        </AppText>
        <View style={[styles.detailContainer, { minHeight: fileExt == "mp4" ? 500 : "50%" }]}>
          {fileExt == "mp4" ? (
            <Video
              resizeMode={"cover"}
              repeat={true}
              style={{
                width: "70%",
                flex: 1,
                marginTop: Platform.OS == "ios" && challengeObj?.ar_filters?.length == 0 ? -200 : 0,
              }}
              source={{
                uri: correctedCaptureData,
              }}
            />
          ) : (
            <Image
              resizeMode={"contain"}
              source={{ uri: correctedCaptureData }}
              style={{
                backgroundColor: "transparent",
                width: "70%",
                flex: 1,
                marginTop: Platform.OS == "ios" && challengeObj?.ar_filters?.length == 0 ? -200 : 0,
              }}
            />
          )}
          <View style={styles.pointsParentContainer}>
            <View style={styles.detailPointContainter}>
              <BackgroundWithImage
                imageSource={BGArShare}
                style={{
                  backgroundColor: "transparent",
                  position: "absolute",
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
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Image
                  style={{ width: 24, height: 24, marginEnd: 10 }}
                  source={{ uri: challengeObj?.sponsored?.image }}
                />
                <Text style={styles.challengeSponsorName}>{challengeObj?.sponsored?.name}</Text>
              </View>
              <View style={{ width: "100%" }}>
                <Text style={styles.challengeSponsorTipText}>
                  Share your content to earn points!
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "space-between",
                    marginTop: 2,
                  }}
                >
                  <Text style={styles.challengeSponsorStartDateText}>
                    Completed on : {startDate}
                  </Text>
                  <TouchableOpacity onPress={checkPermission} style={styles.shareBtn}>
                    <DownloadImg />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.socialShareContainer}>
          {/*<View style={{ flexDirection: 'row' }}>*/}
          {/*  /!*<TouchableOpacity onPress={FacebookShareImgOnPress} style={styles.shareBtn}>*!/*/}
          {/*    <FacebookShareImg />*/}
          {/*  /!*</TouchableOpacity>*!/*/}
          {/*  /!*<TouchableOpacity onPress={InstagramShareImgOnPress} style={styles.shareBtn}>*!/*/}
          {/*    <InstagramShareImg />*/}
          {/*  /!*</TouchableOpacity>*!/*/}
          {/*  {fileExt == 'mp4' && (*/}
          {/*    // <TouchableOpacity onPress={TiktokShareImgOnPress} style={styles.shareBtn}>*/}
          {/*      <TiktokShareImg />*/}
          {/*    // </TouchableOpacity>*/}
          {/*  )}*/}
          {/*</View>*/}
          <Text style={styles.shareText}>Tap the icons to share and earn points</Text>
        </View>
        {!hideBottomTab && (
          <View
            style={{
              justifyContent: "flex-end",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Settings");
              }}
            >
              <Text style={styles.bottomText}>Link My Profiles</Text>
            </TouchableOpacity>

            <AppButton
              onPress={() => shareBtnOnPress()}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              title={"Share Please!"}
              loading={isLoading}
            />

            <AppButton
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "TabNavigator", params: { screen: "GeoArChallenge" } }],
                });
              }}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              title={"End Experience"}
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
  );
};

export default ArChallengeShare;
