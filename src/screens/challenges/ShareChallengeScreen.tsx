import React, { useContext, useEffect, useState } from "react";
import { Image, Platform, Text, View, Dimensions, Linking } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";
// @ts-ignore
import Video from "react-native-video";
import { useDispatch } from "react-redux";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { RouteProp } from "@react-navigation/native";
import { PERMISSIONS, RESULTS, request, requestMultiple } from "react-native-permissions";

import { SSNN } from "../../constants";
import {
  getARProfile,
  postArMemory,
  postGeoPinCheckIn,
  starFoundAndSaveApi,
  getNextStar as getNextStarApi,
} from "network";
import { fontGroup, FontSizes } from "util/FontUtils";
import { handleError, showMessage } from "util/helpers";
// @ts-ignore
import { CHALLENGES_TYPE } from "constants";
import { updateARUserData } from "../../redux/AR";

import BackgroundWithImage from "components/background";
import AppText from "components/text";
import AppButton from "components/button";
import ChallengeScreen from "components/ChallengeScreen";
import ShareToSocialsModal from "components/ShareToSocialsModal";

import theme from "assets/theme";
// @ts-ignore
import BGArShare from "assets/ar/bg-ar-share.png";
import { GeolocationContext } from "GeolocationProvider";
import RNFetchBlob from "rn-fetch-blob";
import { Alert } from "react-native";

// Add this interface near the top of the file, after the imports
interface ShareChallengeRouteParams {
  challengeObj: any; // Replace 'any' with proper type if available
  captureData: string;
  challengeType: string;
  isMemory: boolean;
}

function getFileExtension(url: string) {
  const match = url.match(/\.([a-zA-Z0-9]+)(?=\?|$)/);
  return match ? `.${match[1]}` : "";
}

const ArChallengeShare = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [shareToSocialsIsOpen, setShareToSocialsIsOpen] = useState(false);
  const [socialPointsCounter, setSocialPointsCounter] = useState({
    facebook: 0,
    instagram: 0,
    others: 0,
  });

  const { userLocation } = useContext(GeolocationContext);
  const dispatch = useDispatch();

  // Update the route type
  const route =
    useRoute<RouteProp<{ ShareChallenge: ShareChallengeRouteParams }, "ShareChallenge">>();
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
  let challengeTitle = `Congrats on completing the ${sponsor?.name} AR Experience!`;
  let sponsorImage = sponsor?.image || "";
  let sponsorName = sponsor?.name || "";
  let startDate = moment().format("MM-DD-YYYY");
  let endChallengeButtonText = "End & Share to Roam Profile";
  switch (challengeType) {
    case CHALLENGES_TYPE.PHOTO_VIDEO:
      screenTitle = CHALLENGES_TYPE.PHOTO_VIDEO_TITLE;
      if (isMemory) startDate = "-";
      break;
    case CHALLENGES_TYPE.PIN_CHECK_IN:
      screenTitle = CHALLENGES_TYPE.PIN_CHECK_IN_TITLE;
      if (isMemory) startDate = "-";
      break;
    case CHALLENGES_TYPE.STAR:
      screenTitle = CHALLENGES_TYPE.STAR_TITLE;

      sponsor = challengeObj?.geo_ar_star?.geo_site?.pin_challenge?.sponsored;
      sponsorImage = sponsor?.image;
      sponsorName = sponsor?.name;
      if (isMemory) startDate = "-";
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

  const capturedDataUri = isMemory ? captureData : `file://${captureData}`;

  const filePath = isMemory ? captureData : capturedDataUri.split("?")[0];
  const fileExt = isMemory ? getFileExtension(captureData) : filePath.split(".").pop();

  const countSocialPoints = (
    selectedSSNN: string,
    grantSocialPointsHandler: (selectedSSNN: string) => {}
  ) => {
    switch (selectedSSNN) {
      case SSNN.FACEBOOK:
        setSocialPointsCounter(currCounter => {
          let updatedCounter = currCounter.facebook;
          if (currCounter.facebook === 0) {
            updatedCounter = 1;
            grantSocialPointsHandler(selectedSSNN);
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
            updatedCounter = 1;
            grantSocialPointsHandler(selectedSSNN);
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
          updatedCounter += 1;
          grantSocialPointsHandler(selectedSSNN);
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
    navigation.reset({
      index: 0,
      // @ts-ignore
      routes: [{ name: "TabNavigator", params: { screen: "GeoArChallenge" } }],
    });
  };

  const endExperience = async () => {
    if (challengeType === CHALLENGES_TYPE.STAR) {
      const remainingStars = challengeObj?.remaining_stars;

      if (remainingStars > 1) {
        const updatedChallengeObj = await getNextStar();
        // @ts-ignore
        navigation.navigate("GeoArSiteRoutes", { starsChallenge: updatedChallengeObj });
      } else {
        resetNavigation();
      }
    } else {
      resetNavigation();
    }
  };

  const endShareProfileButtonHandler = async () => {
    setIsLoading(true);
    let filename = capturedDataUri.split("/").pop();
    let shareFile = {
      uri: capturedDataUri,
      type: fileExt == "mp4" ? "video/mp4" : `image/{${fileExt}}`,
      name: filename,
    };

    const formData = new FormData();
    let res;

    try {
      let successMessage = "Successfully, completed your challenge.";
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
        case CHALLENGES_TYPE.STAR:
          res = await starFoundAndSaveApi({
            geo_site: challengeObj?.geo_ar_star?.geo_site?.id, // sitio
            geo_ar_star: challengeObj?.geo_ar_star?.id, // challenge
            geo_ar_star_point: challengeObj?.id, // id de la estrella
            latitude: userLocation?.latitude,
            longitude: userLocation?.longitude,
          });

          const remainingStars = challengeObj?.remaining_stars;
          if (remainingStars > 1) {
            successMessage = "Success, continue to the next Star.";
          }

          break;

        default:
          break;
      }

      ARUserProfile();

      if (res.status === 1) {
        showMessage(successMessage, "success", `${screenTitle} Share!`);
        endExperience();
      } else {
        console.error("Success - Error al compartir el desafío:", res);
        handleError("There was an error sharing your challenge: " + res?.message);
      }
    } catch (error) {
      console.error("Catch - Error al compartir el desafío:", error);
      handleError("There was an error sharing your challenge: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const shareToSocialMediaButtonHandler = () => {
    setShareToSocialsIsOpen(true);
  };

  const closeShareToSocialMediaButtonHandler = () => {
    setShareToSocialsIsOpen(false);
  };

  const getAndroidPermissions = () => {
    const androidVersion = Platform.Version;
    if (androidVersion >= 33) {
      return [PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, PERMISSIONS.ANDROID.READ_MEDIA_VIDEO];
    } else {
      return PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
    }
  };

  const requestCameraRollPermission = async () => {
    try {
      const perms =
        Platform.OS === "ios" ? PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY : getAndroidPermissions();
      let res;

      if (Array.isArray(perms)) {
        res = await requestMultiple(perms);
      } else {
        res = await request(perms);
      }

      if (Platform.OS === "android" && Platform.Version >= 33) {
        if (
          res[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.GRANTED &&
          res[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] === RESULTS.GRANTED
        ) {
          setHasPermission(true);
          return true;
        } else {
          const deniedPerms = Object.keys(res).filter(
            perm => res[perm] === RESULTS.DENIED || res[perm] === RESULTS.BLOCKED
          );
          const permNames = deniedPerms.map(perm => {
            if (perm === PERMISSIONS.ANDROID.READ_MEDIA_IMAGES) return "images";
            if (perm === PERMISSIONS.ANDROID.READ_MEDIA_VIDEO) return "videos";
            return "storage"; // Fallback
          });

          Alert.alert(
            "Permission Denied",
            `This app needs access to your ${permNames.join(
              " and "
            )} to save images. Please go to your device settings to grant permission.`,
            [
              { text: "Cancel", style: "cancel" },
              { text: "OK", onPress: () => Linking.openSettings() },
            ]
          );
          return false;
        }
      } else {
        // iOS or older Android
        if (res === RESULTS.GRANTED || res === RESULTS.LIMITED) {
          setHasPermission(true);
          return true;
        } else {
          Alert.alert(
            "Permission Denied",
            "This app needs access to your photo library to save images. Please go to your device settings to grant permission.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "OK", onPress: () => Linking.openSettings() },
            ]
          );
          return false;
        }
      }
    } catch (err) {
      return false;
    }
  };

  const cameraRollSaveAsset = async (asset: string, fileExt: string) => {
    if (!hasPermission) {
      const granted = await requestCameraRollPermission();
      if (!granted) return; // Don't proceed if permission is not granted
    }

    if (!asset || !fileExt) {
      showMessage("There was an error generating the file.", "error", "AR Memories!");
      return;
    }

    const newURI = await CameraRoll.saveAsset(asset, {
      type: fileExt == "mp4" ? "video" : "photo",
    });

    showMessage("Saved to Camera Roll.", "success", "AR Memories!");
  };

  const saveToGallery = () => {
    if (isMemory) {
      const getPathFromUrl = (url: String) => {
        return url.split("?")[0];
      };

      let memoryURL = capturedDataUri;
      let memoryPath = getPathFromUrl(capturedDataUri);
      const fileExt = memoryPath.split(".").pop();

      let newMemoryUri = memoryPath.lastIndexOf("/");
      let memoryName = memoryPath.substring(newMemoryUri);

      let dirs = RNFetchBlob.fs.dirs;
      const path =
        Platform.OS === "ios" ? dirs.LibraryDir + memoryName : dirs.PictureDir + memoryName;

      RNFetchBlob.config({
        fileCache: true,
        appendExt: fileExt,
        indicator: true,
        IOSBackgroundTask: true,
        path: path,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: path,
          description: fileExt == "mp4" ? "Video" : "Image",
        },
      })
        .fetch("GET", memoryURL)
        .then(res => {
          if (Platform.OS == "ios") {
            cameraRollSaveAsset(res.data, fileExt);
          } else {
            showMessage("Saved to Camera Roll", "success", "AR Memories!");
          }
        });
    } else {
      cameraRollSaveAsset(capturedDataUri, fileExt);
    }
  };

  useEffect(() => {
    async function checkPermissions() {
      const perm =
        Platform.OS === "ios" ? PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY : getAndroidPermissions();
      let res;
      if (Array.isArray(perm)) {
        res = await requestMultiple(perm);
      } else {
        res = await request(perm);
      }
      if (Platform.OS === "android" && Platform.Version >= 33) {
        if (
          res[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.GRANTED &&
          res[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] === RESULTS.GRANTED
        ) {
          setHasPermission(true);
        }
      } else {
        if (res === RESULTS.GRANTED || res === RESULTS.LIMITED) {
          setHasPermission(true);
        }
      }
    }
    checkPermissions();
  }, []);

  const imageContainerHeight = Dimensions.get("screen").height - 540;

  return (
    <ChallengeScreen title={screenTitle} style={{ justifyContent: "space-between", flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 32 }}>
        <View style={{ flex: 1 }}>
          {challengeTitle && (
            <View style={{ flexDirection: "row", gap: 12 }}>
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
              backgroundColor: "#272741",

              gap: 8,

              paddingVertical: 8,

              marginTop: 16,
              marginBottom: 8,

              borderRadius: 12,

              alignItems: "center",
            }}
          >
            {fileExt == "mp4" ? (
              <Video
                resizeMode={"contain"}
                repeat={true}
                style={{
                  height: imageContainerHeight,
                  maxHeight: 440,
                  width: "60%",
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
                source={{ uri: capturedDataUri }}
                style={{
                  height: imageContainerHeight,
                  maxHeight: 440,
                  backgroundColor: "transparent",
                  width: "60%",
                }}
              />
            )}

            {/* Sponsor row */}
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                style={{ width: 20, height: 20, marginEnd: 8 }}
                source={{ uri: sponsorImage }}
              />
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
            {!isMemory && challengeTitle && (
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
            )}
          </View>

          <View
            style={{
              flexDirection: "column",
              gap: 16,
              alignItems: "center",
            }}
          >
            {!isMemory && (
              <Text
                style={{
                  fontSize: FontSizes.S12,
                  color: theme.lightColors?.grey0,
                }}
              >
                Must share to at least one social media platform and tag @roamreality as well as the
                brand sponsor to earn your points. Users earn one additional point per social
                platform.
              </Text>
            )}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginTop: isMemory ? 16 : 0,
            }}
          >
            {/* Share to socials button */}
            <AppButton
              onPress={shareToSocialMediaButtonHandler}
              containerStyle={{ flex: 1, justifyContent: "center" }}
              titleStyle={{ fontSize: FontSizes.S16, fontWeight: "bold" }}
              title={"Share To Socials"}
            />

            <AppButton
              onPress={saveToGallery}
              containerStyle={{ flex: 1, justifyContent: "center" }}
              titleStyle={{ fontSize: FontSizes.S16, fontWeight: "bold" }}
              title={"Save Image"}
            />
          </View>
          {!isMemory && (
            <AppButton
              onPress={endShareProfileButtonHandler}
              buttonStyle={{ height: 55 }}
              containerStyle={{}}
              titleStyle={{ fontSize: FontSizes.S18, fontWeight: "bold" }}
              title={endChallengeButtonText}
              loading={isLoading}
            />
          )}
        </View>
      </View>

      <ShareToSocialsModal
        fileUri={filePath}
        fileExt={fileExt}
        isVisible={shareToSocialsIsOpen}
        isMemory={isMemory}
        sponsor={sponsor}
        onPointsGranted={countSocialPoints}
        onClose={closeShareToSocialMediaButtonHandler}
      />
    </ChallengeScreen>
  );
};

export default ArChallengeShare;
