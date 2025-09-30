import React, {useCallback, useContext, useEffect, useState} from "react";
import {Image, Text, View, Dimensions, StyleSheet} from "react-native";
import {useNavigation, useRoute} from "@react-navigation/native";
import {useDispatch} from "react-redux";
import {RouteProp} from "@react-navigation/native";

import {AR_MODES, SHARE_CONDITIONS_TEXT} from "../../../constants";
import {getARProfile, getNextStar as getNextStarApi, updateUserPointAPI} from "network";
import {fontGroup, FontSizes} from "util/FontUtils";
import {getFileExtension, saveToGallery} from "util/helpers";
// @ts-ignore
import {CHALLENGES_TYPE} from "constants";
import {updateARUserData} from "../../../redux/AR";

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
import ResponsiveMedia from "components/ResponsiveMedia";
import {
  challengeData,
  countSocialPoints,
  ShareChallengeRouteParams,
  shareToRoamProfile,
} from "./shareChallengeUtils";

const ArChallengeShare = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDisplay, setIsLoadingDisplay] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [shareToSocialsIsOpen, setShareToSocialsIsOpen] = useState(false);
  const [disableBackButton, setDisableBackButton] = useState(false);
  const [hideBackButton, setHideBackButton] = useState(false);
  const [socialPointsCounter, setSocialPointsCounter] = useState({
    facebook: 0,
    instagram: 0,
    others: 0,
  });
  const [hasSharedToRoamProfile, setHasSharedToRoamProfile] = useState(false);
  const [viewHeight, setViewHeight] = useState(0);

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
  const scan_picture = route?.params?.scan_picture;

  const {
    screenTitle,
    challengePoints,
    sponsor,
    challengeTitle,
    sponsorImage,
    sponsorName,
    startDate,
    endChallengeButtonText,
  } = challengeData(challengeObj, scan_picture, challengeType, isMemory, socialPointsCounter);

  const capturedDataUri = captureData;
  const isVideo = capturedDataUri?.includes(".mp4");
  const filePath = isMemory ? captureData : capturedDataUri?.split("?")[0];
  const fileExt = isMemory ? getFileExtension(captureData) : filePath?.split(".").pop() || "";

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
        // @ts-ignore
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
    navigation.reset({
      index: 0,
      // @ts-ignore
      routes: [{name: "TabNavigator", params: {screen: "Tab", params: {screen: "GeoArChallenge"}}}],
    });
  };

  const endExperience = async () => {
    if (challengeType === CHALLENGES_TYPE.STAR) {
      const remainingStars = challengeObj?.remaining_stars || 0;

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
      shareToRoamProfile(
        endExperience,
        capturedDataUri,
        fileExt,
        challengeType,
        challengeObj,
        setIsLoading,
        setHasSharedToRoamProfile,
        ARUserProfile
      );
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
    const {height} = event.nativeEvent.layout;
    setViewHeight(height);
  };

  const toggleLoading = (value: boolean) => {
    if (isMemory) {
      setIsLoadingDisplay(value);
    } else {
      setIsLoadingDisplay(false);
    }
  };

  const handlePointsGranted = useCallback(
    (selectedSSNN: string, grantSocialPointsHandler: (selectedSSNN: string) => {}) => {
      countSocialPoints(
        selectedSSNN,
        grantSocialPointsHandler,
        setSocialPointsCounter,
        setDisableBackButton
      );
    },
    []
  );

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

  useEffect(() => {
    if (
      challengeObj?.selectedMode?.mode === AR_MODES.SCAN_MODE ||
      challengeObj?.selectedMode?.mode === AR_MODES.GEO_TAG_MODE ||
      challengeObj?.selectedMode?.mode === AR_MODES.HUNT_MODE ||
      screenTitle === CHALLENGES_TYPE.PIN_CHECK_IN_TITLE ||
      screenTitle === CHALLENGES_TYPE.PHOTO_VIDEO_TITLE
    ) {
      setHideBackButton(true);
    }
  }, [challengeObj]);

  useEffect(() => {
    let isMounted = true;

    if (!isMemory && isMounted) {
      updateUserPointAPI({points: challengePoints});
    }

    return () => {
      isMounted = false;
    };
  }, [isMemory, challengePoints]);

  const screenModals = (
    <>
      <ShareToSocialsModal
        fileUri={filePath}
        fileExt={fileExt}
        isVisible={shareToSocialsIsOpen}
        isMemory={isMemory}
        sponsor={sponsor}
        onPointsGranted={handlePointsGranted}
        onClose={closeShareToSocialMediaButtonHandler}
      />
      <FullScreenLoadingSpinner isLoading={isLoading} />
    </>
  );

  const shareButtonTextSize = width < 420 ? FontSizes.S12 : FontSizes.S16;

  return (
    <ChallengeScreen
      title={screenTitle}
      style={styles.screenContainer}
      modals={screenModals}
      disableBackButton={disableBackButton}
      hideBackButton={hideBackButton}
    >
      <View style={styles.content}>
        {challengeTitle && (
          <View style={styles.titleContainer}>
            <View style={styles.pointsBox}>
              <BackgroundWithImage
                imageSource={BGArShare}
                style={styles.pointsBoxBackground}
              ></BackgroundWithImage>
              <AppText style={styles.pointsBoxText}>{challengePoints || 0}</AppText>
              <AppText style={styles.pointsBoxTextTitle}>Points</AppText>
            </View>
            <AppText numberOfLines={3} style={styles.titleText}>
              {challengeTitle}
            </AppText>
          </View>
        )}

        <View style={styles.mediaContainer}>
          <View
            style={[
              {
                opacity: isLoadingDisplay ? 0 : 1,
              },
              styles.mediaResponsiveContainer,
            ]}
            onLayout={handleLayout}
          >
            <ResponsiveMedia
              source={{uri: capturedDataUri}}
              containerHeight={viewHeight}
              isImage={fileExt !== "mp4" && !isVideo}
              onLoadEnd={() => toggleLoading(false)}
            />
          </View>

          <View style={styles.mediaFooterContainer}>
            <View style={styles.mediaFooterSponsorContainer}>
              <Image style={styles.mediaFooterSponsorImage} source={{uri: sponsorImage}} />
              <Text style={styles.mediaFooterSponsorText}>{sponsorName}</Text>
            </View>

            <Text style={styles.mediaFooterCompletionDateText}>Completed on: {startDate}</Text>
          </View>

          <FullScreenLoadingSpinner isLoading={isLoadingDisplay} />
        </View>

        <View style={styles.conditionsContainer}>
          {!isMemory && <Text style={styles.conditionsText}>{SHARE_CONDITIONS_TEXT}</Text>}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[{marginTop: isMemory ? 16 : 0}, styles.footerButtonContainer]}>
          <AppButton
            onPress={shareToSocialMediaButtonHandler}
            containerStyle={styles.footerButton}
            titleStyle={{fontSize: shareButtonTextSize, fontWeight: "bold"}}
            title={"Share To Socials"}
          />

          <AppButton
            onPress={saveToGalleryButtonHandler}
            containerStyle={styles.footerButton}
            titleStyle={{fontSize: shareButtonTextSize, fontWeight: "bold"}}
            title={isVideo ? "Save Video" : "Save Image"}
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
            disabled={isLoading}
          />
        )}
      </View>
    </ChallengeScreen>
  );
};

export default ArChallengeShare;

const styles = StyleSheet.create({
  screenContainer: {
    justifyContent: "space-between",
    flex: 1,
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 12,
  },
  pointsBox: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "transparent",
    width: 55,
    height: 55,
  },
  pointsBoxBackground: {
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  pointsBoxText: {
    ...fontGroup.nunitoBold,
    fontWeight: "900",
    fontSize: FontSizes.S24,
    color: theme.lightColors?.white,
    margin: 0,
  },
  pointsBoxTextTitle: {
    ...fontGroup.nunitoRegular,
    fontWeight: "400",
    fontSize: FontSizes.S10,
    color: theme.lightColors?.white,
  },
  titleText: {
    ...fontGroup.nunitoBold,
    fontWeight: "900",
    fontSize: FontSizes.S18,
    color: theme.lightColors?.white,
    flex: 1,
  },
  mediaContainer: {
    flex: 1,
    backgroundColor: "#272741",
    gap: 8,
    paddingVertical: 8,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  mediaResponsiveContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  mediaFooterContainer: {
    width: "100%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaFooterSponsorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaFooterSponsorImage: {
    width: 20,
    height: 20,
    marginEnd: 8,
  },
  mediaFooterSponsorText: {
    ...fontGroup.nunitoBold,
    fontWeight: "700",
    fontSize: FontSizes.S20,
    color: theme.lightColors?.white,
  },
  mediaFooterCompletionDateText: {
    ...fontGroup.nunitoLight,
    fontWeight: "300",
    fontSize: FontSizes.S10,
    color: theme.lightColors?.white,
  },
  conditionsContainer: {
    flexDirection: "column",
    gap: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  conditionsText: {
    fontSize: FontSizes.S12,
    color: theme.lightColors?.grey0,
  },
  footer: {
    gap: 8,
    height: 110,
  },
  footerButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    height: 55,
  },
  footerButton: {
    flex: 1,
    justifyContent: "center",
  },
});
