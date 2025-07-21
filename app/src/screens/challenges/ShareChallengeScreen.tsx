import React, {useContext, useEffect, useRef, useState} from "react";
import {Image, Platform, Text, View, Dimensions} from "react-native";
import {useNavigation, useRoute} from "@react-navigation/native";
import moment from "moment";
// @ts-ignore
import Video from "react-native-video";
import {useDispatch} from "react-redux";
import {RouteProp} from "@react-navigation/native";

import {SHARE_CONDITIONS_TEXT, SSNN} from "../../constants";
import {
  getARProfile,
  postArMemory,
  postGeoPinCheckIn,
  starFoundAndSaveApi,
  getNextStar as getNextStarApi,
  updateUserPointAPI,
} from "network";
import {fontGroup, FontSizes} from "util/FontUtils";
import {getFileExtension, handleError, saveToGallery, showMessage} from "util/helpers";
// @ts-ignore
import {CHALLENGES_TYPE} from "constants";
import {updateARUserData} from "../../redux/AR";

import BackgroundWithImage from "components/background";
import AppText from "components/text";
import AppButton from "components/button";
import ChallengeScreen from "components/ChallengeScreen";
import ShareToSocialsModal from "components/ShareToSocialsModal";

import theme from "assets/theme";
// @ts-ignore
import BGArShare from "assets/ar/bg-ar-share.png";
import {GeolocationContext} from "GeolocationProvider";
import FullScreenLoadingSpinner from "components/FullScreenLoadingSpinner";

interface ShareChallengeRouteParams {
  challengeObj: any; // Replace 'any' with proper type if available
  captureData: string;
  challengeType: string;
  isMemory: boolean;
}

const ArChallengeShare = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDisplay, setIsLoadingDisplay] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [shareToSocialsIsOpen, setShareToSocialsIsOpen] = useState(false);
  const [socialPointsCounter, setSocialPointsCounter] = useState({
    facebook: 0,
    instagram: 0,
    others: 0,
  });
  const [hasSharedToRoamProfile, setHasSharedToRoamProfile] = useState(false);

  const [viewWidth, setViewWidth] = useState(0);
  const viewRef = useRef(null);

  const {userLocation} = useContext(GeolocationContext);
  const dispatch = useDispatch();

  const width = Dimensions.get("screen").width;

  // Update the route type
  const route =
    useRoute<RouteProp<{ShareChallenge: ShareChallengeRouteParams}, "ShareChallenge">>();
  const navigation = useNavigation();

  const challengeObj = route?.params?.challengeObj;
  const captureData = route?.params?.captureData;
  const challengeType = route?.params?.challengeType;
  const isMemory = route?.params?.isMemory;

  let screenTitle = "";
  let challengePoints = 0;
  if (challengeObj?.points) {
    challengePoints =
      challengeObj.points +
      socialPointsCounter.facebook +
      socialPointsCounter.instagram +
      socialPointsCounter.others;
  }

  let sponsor = challengeObj?.sponsored;
  console.log("challengeObj", challengeObj);
  let challengeTitle = `Congrats on completing the ${sponsor?.name} AR Experience!`;
  let sponsorImage = sponsor?.image || "";
  let sponsorName = sponsor?.name || "";
  const startDate = isMemory
    ? moment(challengeObj?.created_at).format("MM-DD-YYYY")
    : moment().format("MM-DD-YYYY");
  let endChallengeButtonText = "End & Share to Roam Profile";

  switch (challengeType) {
    case CHALLENGES_TYPE.PHOTO_VIDEO:
      screenTitle = CHALLENGES_TYPE.PHOTO_VIDEO_TITLE;
      break;
    case CHALLENGES_TYPE.PIN_CHECK_IN:
      screenTitle = CHALLENGES_TYPE.PIN_CHECK_IN_TITLE;
      break;
    case CHALLENGES_TYPE.STAR:
      screenTitle = CHALLENGES_TYPE.STAR_TITLE;

      sponsor = challengeObj?.geo_ar_star?.geo_site?.pin_challenge?.sponsored;
      sponsorImage = sponsor?.image;
      sponsorName = sponsor?.name;
      const remainingStars = challengeObj?.remaining_stars;
      if (remainingStars > 1) {
        challengePoints = 0;
        challengeTitle = "";
        endChallengeButtonText = "Continue to the next Star";
      } else {
        challengePoints = challengeObj?.geo_ar_star?.geo_site?.pin_challenge?.points;
      }
      break;

    default:
      break;
  }

  const capturedDataUri = captureData;
  const isVideo = capturedDataUri?.includes(".mp4");
  const filePath = isMemory ? captureData : capturedDataUri?.split("?")[0];
  const fileExt = isMemory ? getFileExtension(captureData) : filePath?.split(".").pop() || "";

  const countSocialPoints = (
    selectedSSNN: string,
    grantSocialPointsHandler: (selectedSSNN: string) => {}
  ) => {
    switch (selectedSSNN) {
      case SSNN.FACEBOOK:
        setSocialPointsCounter(currCounter => {
          let updatedCounter = currCounter.facebook;
          if (currCounter.facebook === 0) {
            console.log("granting points for facebook");
            updatedCounter = 1;
            grantSocialPointsHandler(selectedSSNN);
          } else {
            console.log(" not counting more points but allowing to share... ");
          }
          return {
            ...currCounter,
            facebook: updatedCounter,
          };
        });
        break;
      case SSNN.INSTAGRAM:
        setSocialPointsCounter(currCounter => {
          let updatedCounter = currCounter.instagram;
          if (currCounter.instagram === 0) {
            console.log("granting points for instagram");
            updatedCounter = 1;
            grantSocialPointsHandler(selectedSSNN);
          } else {
            console.log(" not counting more points but allowing to share... ");
          }
          return {
            ...currCounter,
            instagram: updatedCounter,
          };
        });
        break;
      case SSNN.OTHERS:
        setSocialPointsCounter(currCounter => {
          let updatedCounter = currCounter.others;
          if (currCounter.others === 0) {
            console.log("granting points for others");
            updatedCounter = 1;
            grantSocialPointsHandler(selectedSSNN);
          } else {
            console.log(" not counting more points but allowing to share... ");
          }
          return {
            ...currCounter,
            others: updatedCounter,
          };
        });
        break;

      default:
        break;
    }
  };

  const shareToRoamProfile = async (endExperienceHandler?: () => void) => {
    setIsLoading(true);
    let filename = capturedDataUri.split("/").pop();
    let shareFile = {
      uri: Platform.OS === "android" ? `file://${capturedDataUri}` : capturedDataUri,
      type: fileExt == "mp4" ? "video/mp4" : `image/{${fileExt}}`,
      name: filename,
    };

    const formData = new FormData();
    let res;

    try {
      // let successMessage = "Successfully, completed your challenge.";
      switch (challengeType) {
        case CHALLENGES_TYPE.PHOTO_VIDEO:
          formData.append("challenges", challengeObj.id);
          formData.append("memory_file", shareFile);
          formData.append("memory_type", fileExt == "mp4" ? "VIDEO" : "PHOTO");
          res = await postArMemory(formData);
          break;

        case CHALLENGES_TYPE.PIN_CHECK_IN:
          formData.append("geo_challenge", challengeObj.id);
          formData.append("geo_site", challengeObj?.geo_site?.id);
          formData.append("memory_file", shareFile);

          res = await postGeoPinCheckIn(formData);
          break;
        // case CHALLENGES_TYPE.STAR:
        //   res = await starFoundAndSaveApi({
        //     geo_site: challengeObj?.geo_ar_star?.geo_site?.id, // sitio
        //     geo_ar_star: challengeObj?.geo_ar_star?.id, // challenge
        //     geo_ar_star_point: challengeObj?.id, // id de la estrella
        //     latitude: userLocation?.latitude,
        //     longitude: userLocation?.longitude,
        //   });

        //   const remainingStars = challengeObj?.remaining_stars;
        //   // if (remainingStars > 1) {
        //   //   successMessage = "Success, continue to the next Star.";
        //   // }

        //   break;

        default:
          break;
      }

      setHasSharedToRoamProfile(true);
      ARUserProfile();

      if (res.status === 1) {
        if (endExperienceHandler) {
          endExperienceHandler();
        }
      } else {
        console.error("Success - Error al compartir el desafío:", res);
        handleError("There was an error sharing your challenge");
      }
    } catch (error) {
      console.error("Catch - Error al compartir el desafío:", error);
      handleError("There was an error sharing your challenge");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      !hasSharedToRoamProfile &&
      (socialPointsCounter.facebook === 1 ||
        socialPointsCounter.instagram === 1 ||
        socialPointsCounter.others === 1)
    ) {
      shareToRoamProfile();
    }
  }, [socialPointsCounter, hasSharedToRoamProfile]);

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

  const getNextStar = async () => {
    try {
      const params = {
        geo_site_id: challengeObj?.geo_ar_star?.geo_site?.id, // sitio
        // geo_site_id: selectedGeoARSiteStars[0]?.id,
        lat: userLocation?.latitude,
        lon: userLocation?.longitude,
      };
      const response = await getNextStarApi(params);
      if (response?.id) {
        return response;
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetNavigation = () => {
    console.log("resetNavigation");
    navigation.reset({
      index: 0,
      // @ts-ignore
      routes: [{name: "TabNavigator", params: {screen: "GeoArChallenge"}}],
    });
  };

  const endExperience = async () => {
    if (challengeType === CHALLENGES_TYPE.STAR) {
      const remainingStars = challengeObj?.remaining_stars;

      if (remainingStars > 1) {
        const updatedChallengeObj = await getNextStar();
        // @ts-ignore
        navigation.navigate("GeoArSiteRoutes", {starsChallenge: updatedChallengeObj});
      } else {
        resetNavigation();
      }
    } else {
      resetNavigation();
    }
  };

  const endShareProfileButtonHandler = async () => {
    if (hasSharedToRoamProfile) {
      endExperience();
    } else {
      shareToRoamProfile(() => endExperience());
    }
  };

  const shareToSocialMediaButtonHandler = () => {
    setShareToSocialsIsOpen(true);
  };

  const closeShareToSocialMediaButtonHandler = () => {
    setShareToSocialsIsOpen(false);
  };

  const permissionsGrantedHandler = () => {
    setHasPermission(true);
  };

  const toggleLoadingHandler = () => {
    setIsLoading(currState => !currState);
  };

  const saveToGalleryButtonHandler = () => {
    saveToGallery(
      hasPermission,
      permissionsGrantedHandler,
      isMemory,
      capturedDataUri,
      fileExt,
      toggleLoadingHandler
    );
  };

  const handleLayout = (event: any) => {
    const {width, height} = event.nativeEvent.layout;
    setViewWidth(width);
  };

  const baseOffset = 110;
  let offset = baseOffset;
  if (viewWidth >= 320) {
    offset = baseOffset - (viewWidth / 300) * 8;
  }
  if (viewWidth >= 300 && viewWidth < 320) {
    offset = baseOffset - (viewWidth / 300) * 24;
  }
  if (viewWidth < 300) {
    offset = 150;
  }

  const aspectWidth = viewWidth - offset;
  const aspectHeight = (aspectWidth * 16) / 9; // Calculate height based on 9:16 aspect ratio

  const mediaContainerWidth = aspectWidth;
  const mediaContainerHeight = aspectHeight;

  let shareButtonTextSize = FontSizes.S16;
  if (width < 420) {
    shareButtonTextSize = FontSizes.S12;
  }

  const screenModals = (
    <>
      <ShareToSocialsModal
        fileUri={filePath}
        fileExt={fileExt}
        isVisible={shareToSocialsIsOpen}
        isMemory={isMemory}
        sponsor={sponsor}
        onPointsGranted={countSocialPoints}
        onClose={closeShareToSocialMediaButtonHandler}
      />
      <FullScreenLoadingSpinner isLoading={isLoading} />
    </>
  );

  const toggleLoading = (value: boolean) => {
    if (isMemory) {
      setIsLoadingDisplay(value);
    } else {
      setIsLoadingDisplay(false);
    }
  };

  useEffect(() => {
    if (!isMemory) {
      updateUserPointAPI({points: challengePoints});
    }
  }, [isMemory]);

  return (
    <ChallengeScreen
      title={screenTitle}
      style={{justifyContent: "space-between", flex: 1}}
      modals={screenModals}
    >
      <View style={{flex: 1, paddingHorizontal: 32}}>
        <View style={{flex: 1}}>
          {challengeTitle && (
            <View style={{flexDirection: "row", gap: 12}}>
              {/* Points box */}
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  backgroundColor: "transparent",
                  width: 55,
                  height: 55,
                }}
              >
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
                <AppText
                  style={{
                    ...fontGroup.nunitoBold,
                    fontWeight: "900",
                    fontSize: FontSizes.S24,
                    color: theme.lightColors?.white,
                    margin: 0,
                  }}
                >
                  {challengePoints}
                </AppText>
                <AppText
                  style={{
                    ...fontGroup.nunitoRegular,
                    fontWeight: "400",
                    fontSize: FontSizes.S10,
                    color: theme.lightColors?.white,
                  }}
                >
                  Points
                </AppText>
              </View>
              <AppText
                numberOfLines={3}
                style={{
                  ...fontGroup.nunitoBold,
                  fontWeight: "900",
                  fontSize: FontSizes.S18,
                  color: theme.lightColors?.white,
                  flex: 1,
                }}
              >
                {challengeTitle}
              </AppText>
            </View>
          )}

          <View
            style={{
              flex: 1,
              backgroundColor: "#272741",
              gap: 8,
              paddingVertical: 8,
              marginTop: 16,
              marginBottom: 8,
              borderRadius: 12,
              alignItems: "center",
            }}
            ref={viewRef}
            onLayout={handleLayout}
          >
            <View style={{flex: 1, justifyContent: "center", opacity: isLoadingDisplay ? 0 : 1}}>
              {fileExt == "mp4" || isVideo ? (
                <Video
                  resizeMode={"contain"}
                  onLoadStart={() => toggleLoading(true)}
                  onReadyForDisplay={() => toggleLoading(false)}
                  repeat={true}
                  style={{
                    width: mediaContainerWidth,
                    height: mediaContainerHeight,
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                  }}
                  source={{
                    uri: capturedDataUri,
                  }}
                />
              ) : (
                <Image
                  resizeMode={"contain"}
                  source={{uri: capturedDataUri}}
                  onLoadStart={() => toggleLoading(true)}
                  onLoad={() => toggleLoading(false)}
                  style={{
                    width: mediaContainerWidth,
                    height: mediaContainerHeight,
                    backgroundColor: "transparent",
                  }}
                />
              )}
            </View>
            <FullScreenLoadingSpinner isLoading={isLoadingDisplay} />

            <View style={{alignItems: "center"}}>
              {/* Sponsor row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image style={{width: 20, height: 20, marginEnd: 8}} source={{uri: sponsorImage}} />
                <Text
                  style={{
                    ...fontGroup.nunitoBold,
                    fontWeight: "700",
                    fontSize: FontSizes.S20,
                    color: theme.lightColors?.white,
                  }}
                >
                  {sponsorName}
                </Text>
              </View>

              {/* Completion date */}
              <Text
                style={{
                  ...fontGroup.nunitoLight,
                  fontWeight: "300",
                  fontSize: FontSizes.S10,
                  color: theme.lightColors?.white,
                }}
              >
                Completed on: {startDate}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "column",
              gap: 16,
              alignItems: "center",
              marginTop: 8,
              marginBottom: 16,
            }}
          >
            {!isMemory && (
              <Text
                style={{
                  fontSize: FontSizes.S12,
                  color: theme.lightColors?.grey0,
                }}
              >
                {SHARE_CONDITIONS_TEXT}
              </Text>
            )}
          </View>
        </View>
        <View style={{gap: 8, height: 110}}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginTop: isMemory ? 16 : 0,
              height: 55,
            }}
          >
            {/* Share to socials button */}
            <AppButton
              onPress={shareToSocialMediaButtonHandler}
              containerStyle={{flex: 1, justifyContent: "center"}}
              titleStyle={{fontSize: shareButtonTextSize, fontWeight: "bold"}}
              title={"Share To Socials"}
            />

            <AppButton
              onPress={saveToGalleryButtonHandler}
              containerStyle={{flex: 1, justifyContent: "center"}}
              titleStyle={{fontSize: shareButtonTextSize, fontWeight: "bold"}}
              title={"Save Image"}
            />
          </View>
          {!isMemory && (
            <AppButton
              onPress={endShareProfileButtonHandler}
              buttonStyle={{height: 55}}
              containerStyle={{flex: 1}}
              titleStyle={{fontSize: FontSizes.S18, fontWeight: "bold"}}
              title={endChallengeButtonText}
              loading={isLoading}
            />
          )}
        </View>
      </View>
    </ChallengeScreen>
  );
};

export default ArChallengeShare;
