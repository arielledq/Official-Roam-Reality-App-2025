import React, { useState } from "react";

import { Image, Text, View } from "react-native";
import BackgroundWithImage from "../../../components/background";
import { useNavigation, useRoute } from "@react-navigation/native";
import AppText from "../../../components/text";
import AppButton from "../../../components/button";
import moment from "moment";

import { getARProfile, postArMemory, postGeoPinCheckIn } from "../../../network";
import { handleError, showMessage } from "../../../util/helpers";
import Video from "react-native-video";
import { useDispatch } from "react-redux";
import { updateARUserData } from "../../../redux/AR";

import BGArShare from "../../../assets/ar/bg-ar-share.png";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import ChallengeScreen from "components/ChallengeScreen";
import { fontGroup, FontSizes } from "util/FontUtils";
import theme from "assets/theme";
import { CHALLENGES_TYPE } from "constants";
import ShareToSocialsModal from "components/ShareToSocialsModal";

const ArChallengeShare = () => {
  const route = useRoute();
  const challengeObj = route?.params?.challengeObj;
  const captureData = route?.params?.captureData;
  const challengeType = route?.params?.challengeType;

  let screenTitle = "";
  let selectedGeoSite;
  switch (challengeType) {
    case CHALLENGES_TYPE.PHOTO_VIDEO:
      screenTitle = CHALLENGES_TYPE.PHOTO_VIDEO_TITLE;
      break;
    case CHALLENGES_TYPE.PIN_CHECK_IN:
      screenTitle = CHALLENGES_TYPE.PIN_CHECK_IN_TITLE;
      break;

    default:
      break;
  }
  const startDate = moment().format("MM-DD-YYYY");

  const navigation = useNavigation();
  const capturedDataUri = `file://${captureData}`;

  const filePath = capturedDataUri.split("?")[0];
  const fileExt = filePath.split(".").pop();

  const [isLoading, setIsLoading] = useState(false);
  const [shareToSocialsIsOpen, setShareToSocialsIsOpen] = useState(false);

  const dispatch = useDispatch();

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

  const endExperience = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "TabNavigator", params: { screen: "GeoArChallenge" } }],
    });
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
      switch (challengeType) {
        case CHALLENGES_TYPE.PHOTO_VIDEO:
          formData.append("challenges", challengeObj.id);
          formData.append("memory_file", shareFile);
          formData.append("memory_type", fileExt == "mp4" ? "VIDEO" : "PHOTO");

          res = await postArMemory(formData);
          break;

        case CHALLENGES_TYPE.PIN_CHECK_IN:
          formData.append("challenges", challengeObj.id);
          formData.append("geo_site", selectedGeoSite?.geo_site?.id);
          formData.append("check_in_image", shareFile);

          res = await postGeoPinCheckIn(formData);
          break;

        default:
          break;
      }

      ARUserProfile();

      if (res.status === 1) {
        showMessage("Successfully, completed your challenge.", "success", `${screenTitle} Share!`);
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

  const checkPermission = () => {
    CameraRoll.saveAsset(capturedDataUri, {
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

  return (
    <ChallengeScreen title={screenTitle}>
      <View style={{ flex: 1, paddingHorizontal: 32 }}>
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
                ...fontGroup.p900,
                fontSize: FontSizes.S24,
                color: theme.lightColors.white,
                margin: 0,
              }}
            >
              {challengeObj.points}
            </AppText>
            <AppText
              style={{
                ...fontGroup.p400,
                fontSize: FontSizes.S10,
                color: theme.lightColors.white,
              }}
            >
              Points
            </AppText>
          </View>

          <AppText
            numberOfLines={3}
            style={{
              ...fontGroup.ns900,
              fontSize: FontSizes.S20,
              color: theme.lightColors.white,
              flex: 1,
            }}
          >
            Congrats on completing the {challengeObj?.sponsored?.name} AR Experience!
          </AppText>
        </View>

        <View
          style={{
            width: "100%",
            height: 440,

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
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "flex-end",
                width: "100%",
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
                backgroundColor: "transparent",
                width: "70%",
                flex: 1,
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
              source={{ uri: challengeObj?.sponsored?.image }}
            />
            <Text
              style={{
                ...fontGroup.p700,
                fontSize: FontSizes.S20,
                color: theme.lightColors.white,
              }}
            >
              {challengeObj?.sponsored?.name}
            </Text>
          </View>

          {/* Completition date */}
          <Text
            style={{
              ...fontGroup.p300,
              fontSize: FontSizes.S10,
              color: theme.lightColors.white,
            }}
          >
            Completed on: {startDate}
          </Text>
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: FontSizes.S12,
              color: theme.lightColors.grey,
            }}
          >
            Must share to at least one social media platform to earn any points. Users earn one
            additional point per social platform.
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            {/* Share to socials button */}
            <AppButton
              onPress={shareToSocialMediaButtonHandler}
              containerStyle={{ flex: 1, justifyContent: "center" }}
              titleStyle={{ fontSize: FontSizes.S16 }}
              title={"Share To Socials"}
            />

            <AppButton
              onPress={checkPermission}
              containerStyle={{ flex: 1, justifyContent: "center" }}
              titleStyle={{ fontSize: FontSizes.S16 }}
              title={"Save Image"}
            />
          </View>

          <View style={{ paddingHorizontal: 10 }}>
            <View style={{ width: "100%" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                  marginTop: 2,
                }}
              ></View>
            </View>
          </View>
        </View>

        <AppButton
          onPress={endShareProfileButtonHandler}
          buttonStyle={{ height: 55 }}
          containerStyle={{}}
          title={"End & Share to Roam Profile"}
          loading={isLoading}
        />
      </View>

      <ShareToSocialsModal
        fileUri={filePath}
        fileExt={fileExt}
        isVisible={shareToSocialsIsOpen}
        onClose={closeShareToSocialMediaButtonHandler}
      />
    </ChallengeScreen>
  );
};

export default ArChallengeShare;
