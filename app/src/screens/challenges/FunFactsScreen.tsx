import React, {useRef, useState} from "react";
import {Image, Text, View, Dimensions} from "react-native";
import {useNavigation} from "@react-navigation/native";
// @ts-ignore
import ViewShot, {captureRef} from "react-native-view-shot";
import {useDispatch} from "react-redux";

import {AR_MODES_MENU, SSNN} from "../../constants";
import {starFoundAndSaveApi} from "network";
import {fontGroup, FontSizes} from "util/FontUtils";

import BackgroundWithImage from "components/background";
import AppText from "components/text";
import AppButton from "components/button";
import ChallengeScreen from "components/ChallengeScreen";
import ShareToSocialsModal from "components/ShareToSocialsModal";

import theme from "assets/theme";
// @ts-ignore
import BGArShare from "assets/ar/bg-ar-share.png";
import useArScreenHook from "../../hooks/useArScreenHook";
import RenderHTML from "react-native-render-html";

const FunFactsScreen = ({route}: any) => {
  const [shareToSocialsIsOpen, setShareToSocialsIsOpen] = useState(false);
  const [socialPointsCounter, setSocialPointsCounter] = useState({
    facebook: 0,
    instagram: 0,
    others: 0,
  });
  const [filePath, setFilePath] = useState("");

  const funFactCardRef = useRef(null);

  const {getNextStar: getNextStarApi} = useArScreenHook();
  const dispatch = useDispatch();

  const width = Dimensions.get("screen").width;
  const navigation = useNavigation();

  const challengeObj = route?.params?.challengeObj;

  let challengePoints = 0;
  const initialPoints = challengeObj?.pin_challenge?.points;
  if (initialPoints) {
    challengePoints =
      initialPoints +
      socialPointsCounter.facebook +
      socialPointsCounter.instagram +
      socialPointsCounter.others;
  }
  const fileExt = "png";

  const handleCaptureScreenshot = async () => {
    try {
      const uri = await captureRef(funFactCardRef, {
        format: "png",
        quality: 0.9,
        result: "tmpfile", // or 'data-uri' if you prefer base64
      });
      setFilePath(uri);
      console.log("Screenshot URI:", uri);

      // Optional: Open share modal
      setShareToSocialsIsOpen(true);
      // or pass URI to ShareToSocialsModal
    } catch (error) {
      console.error("Screenshot capture error:", error);
    }
  };

  const countSocialPoints = (
    selectedSSNN: string,
    grantSocialPointsHandler: (selectedSSNN: string) => {}
  ) => {
    switch (selectedSSNN) {
      case SSNN.FACEBOOK:
        setSocialPointsCounter(currCounter => {
          let updatedCounter = currCounter.facebook;
          if (currCounter.facebook === 0) {
            // console.log("granting points for facebook");
            updatedCounter = 1;
            grantSocialPointsHandler(selectedSSNN);
          } else {
            // console.log(" not counting more points but allowing to share... ");
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
            // console.log("granting points for instagram");
            updatedCounter = 1;
            grantSocialPointsHandler(selectedSSNN);
          } else {
            // console.log(" not counting more points but allowing to share... ");
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
            // console.log("granting points for others");
            updatedCounter = 1;
            grantSocialPointsHandler(selectedSSNN);
          } else {
            // console.log(" not counting more points but allowing to share... ");
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

  // const shareToRoamProfile = async (endExperienceHandler?: () => void) => {
  //   let filename = capturedDataUri.split("/").pop();
  //   let shareFile = {
  //     uri: Platform.OS === "android" ? `file://${capturedDataUri}` : capturedDataUri,
  //     type: fileExt == "mp4" ? "video/mp4" : `image/{${fileExt}}`,
  //     name: filename,
  //   };

  //   const formData = new FormData();
  //   let res;

  //   try {
  //     // let successMessage = "Successfully, completed your challenge.";
  //     switch (challengeType) {
  //       case CHALLENGES_TYPE.PHOTO_VIDEO:
  //         formData.append("challenges", challengeObj.id);
  //         formData.append("memory_file", shareFile);
  //         formData.append("memory_type", fileExt == "mp4" ? "VIDEO" : "PHOTO");
  //         res = await postArMemory(formData);
  //         break;

  //       case CHALLENGES_TYPE.PIN_CHECK_IN:
  //         formData.append("geo_challenge", challengeObj.id);
  //         formData.append("geo_site", challengeObj?.geo_site?.id);
  //         formData.append("memory_file", shareFile);

  //         res = await postGeoPinCheckIn(formData);
  //         break;
  //       // case CHALLENGES_TYPE.STAR:
  //       //   res = await starFoundAndSaveApi({
  //       //     geo_site: challengeObj?.geo_ar_star?.geo_site?.id, // sitio
  //       //     geo_ar_star: challengeObj?.geo_ar_star?.id, // challenge
  //       //     geo_ar_star_point: challengeObj?.id, // id de la estrella
  //       //     latitude: userLocation?.latitude,
  //       //     longitude: userLocation?.longitude,
  //       //   });

  //       //   const remainingStars = challengeObj?.remaining_stars;
  //       //   // if (remainingStars > 1) {
  //       //   //   successMessage = "Success, continue to the next Star.";
  //       //   // }

  //       //   break;

  //       default:
  //         break;
  //     }

  //     setHasSharedToRoamProfile(true);
  //     ARUserProfile();

  //     if (res.status === 1) {
  //       if (endExperienceHandler) {
  //         endExperienceHandler();
  //       }
  //     } else {
  //       console.error("Success - Error al compartir el desafío:", res);
  //       handleError("There was an error sharing your challenge: " + res?.message);
  //     }
  //   } catch (error) {
  //     console.error("Catch - Error al compartir el desafío:", error);
  //     handleError("There was an error sharing your challenge: " + error);
  //   }
  // };

  // useEffect(() => {
  //   if (
  //     !hasSharedToRoamProfile &&
  //     (socialPointsCounter.facebook === 1 ||
  //       socialPointsCounter.instagram === 1 ||
  //       socialPointsCounter.others === 1)
  //   ) {
  //     shareToRoamProfile();
  //   }
  // }, [socialPointsCounter, hasSharedToRoamProfile]);

  // const ARUserProfile = () => {
  //   getARProfile().then(res => {
  //     if (res.status == 1) {
  //       dispatch(updateARUserData(res));
  //     }
  //   });
  // };

  const resetNavigation = () => {
    navigation.reset({
      index: 0,
      // @ts-ignore
      routes: [{name: "TabNavigator", params: {screen: "GeoArChallenge"}}],
    });
  };

  const endFunFactsButtonHandler = async () => {
    const geoSiteId = challengeObj?.huntChallenge?.geo_ar_star?.geo_site?.id;
    const challengeId = challengeObj?.huntChallenge?.geo_ar_star?.id;
    const starPointId = challengeObj?.huntChallenge?.id;
    const lat = challengeObj?.lat_long?.coordinates[1];
    const lon = challengeObj?.lat_long?.coordinates[0];

    // Record hunt challenge
    try {
      await starFoundAndSaveApi({
        geo_site: geoSiteId, // Site ID
        geo_ar_star: challengeId, // Challenge ID
        geo_ar_star_point: starPointId, // Star/Hunt Point ID
        latitude: lat,
        longitude: lon,
      });
    } catch (error) {
      console.error("Error al guardar el desafío:", error);
    }

    let newHuntPointChallenge: any;
    try {
      newHuntPointChallenge = await getNextStarApi(geoSiteId, lat, lon);
    } catch (error) {
      console.error("Error al obtener el siguiente desafío:", error);
    }

    // Extract remaining hunt pins
    const remainingStars = newHuntPointChallenge?.remaining_stars || 0;

    let navigationParams = {};
    if (remainingStars >= 1) {
      const huntChallenge = {
        ...challengeObj,
        selectedMode: AR_MODES_MENU[2],
        huntChallenge: newHuntPointChallenge,
      };
      navigationParams = {
        huntChallenge,
      };
    } else {
      navigationParams = {
        huntChallengeFinished: true,
      };
    }

    setTimeout(() => {
      // @ts-ignore
      navigation.navigate("TabNavigator", {
        screen: "Tab",
        params: {screen: "Go Navigate"}, //TODO Temp
      });
    }, 250);
  };

  const closeShareToSocialMediaButtonHandler = () => {
    setShareToSocialsIsOpen(false);
  };

  const screenModals = (
    <>
      <ShareToSocialsModal
        fileUri={filePath}
        fileExt={fileExt}
        isVisible={shareToSocialsIsOpen}
        isMemory={false}
        onPointsGranted={countSocialPoints}
        onClose={closeShareToSocialMediaButtonHandler}
      />
    </>
  );

  const funFactImage = challengeObj?.huntChallenge?.image;
  const siteImage = challengeObj?.geo_ar_star?.geo_site?.image;
  const siteName = challengeObj?.geo_ar_star?.geo_site?.name;
  const funFactDetail = challengeObj?.huntChallenge?.fun_facts;
  // const funFactImage = "https://placehold.co/400x400.png";
  // const siteImage = "https://placehold.co/80x80.png";
  // const siteName = "Fort James Tobago";
  // const funFactDetail =
  //   "Built by the British in 1770, Fort James was named after King James Il of England. It was one of the main military outposts in Tobago, guarding the western coastline from invaders and pirates";

  const funFactSponsors = [];

  return (
    <ChallengeScreen
      title="Fun Facts"
      style={{
        justifyContent: "space-between",
        gap: 16,
        paddingHorizontal: 24,
        paddingBottom: 50,
      }}
      modals={screenModals}
      hideBackButton
      scrollable
    >
      {/* Fun facts card */}
      <ViewShot ref={funFactCardRef} options={{format: "png", quality: 0.9}}>
        <View
          style={{
            backgroundColor: "#272741",
            gap: 16,
            borderRadius: 12,
            overflow: "hidden",
            paddingBottom: 16,
          }}
        >
          {/* Card Image */}
          <Image
            resizeMode={"contain"}
            source={{uri: funFactImage}}
            style={{
              minWidth: 300,
              maxWidth: "100%",
              minHeight: 300,
              aspectRatio: 1,
              resizeMode: "cover",
              backgroundColor: "transparent",
            }}
          />

          {/* Card Content */}
          <View style={{paddingHorizontal: 16, gap: 16}}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Image style={{width: 25, height: 25, borderRadius: 25}} source={{uri: siteImage}} />
              <Text
                style={{
                  ...fontGroup.nunitoBold,
                  fontWeight: "700",
                  fontSize: FontSizes.S20,
                  color: theme.lightColors?.white,
                }}
              >
                {siteName}
              </Text>
            </View>

            <View>
              <RenderHTML
                contentWidth={width}
                tagsStyles={{
                  p: {
                    color: "#9CA3AF",
                    fontSize: FontSizes.S14,
                  },
                  strong: {
                    color: "#fff",
                    fontSize: FontSizes.S14,
                  },
                  ol: {
                    color: "#fff",
                  },
                  li: {
                    color: "#fff",
                  },
                  em: {fontStyle: "italic"},
                  u: {textDecorationLine: "underline"},
                  s: {textDecorationLine: "line-through"},
                }}
                source={{
                  html: `${funFactDetail}`,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  ...fontGroup.nunitoBold,
                  fontWeight: "700",
                  fontSize: FontSizes.S14,
                  color: theme.lightColors?.white,
                }}
              >
                Brought to you by
              </Text>
              <View style={{flexDirection: "row", alignItems: "center", gap: 8}}>
                <Image style={{width: 40, height: 40, borderRadius: 8}} source={{uri: siteImage}} />
                <Image style={{width: 40, height: 40, borderRadius: 8}} source={{uri: siteImage}} />
                <Image style={{width: 40, height: 40, borderRadius: 8}} source={{uri: siteImage}} />
              </View>
            </View>
          </View>
        </View>
      </ViewShot>

      <View
        style={{
          backgroundColor: "#272741",
          gap: 24,
          borderRadius: 12,
          overflow: "hidden",
          padding: 16,
          paddingBottom: 24,
        }}
      >
        {/* Points */}
        <View style={{flexDirection: "row", gap: 16}}>
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

          <View style={{flex: 1}}>
            <AppText
              style={{
                ...fontGroup.nunitoBold,
                fontSize: FontSizes.S18,
                fontWeight: "900",
                color: theme.lightColors?.white,
              }}
            >
              Share this fun fact!
            </AppText>
            <AppText
              style={{
                ...fontGroup.nunitoRegular,
                fontSize: FontSizes.S12,
                fontWeight: "400",
                color: theme.lightColors?.white,
              }}
            >
              Users will not earn any points unless they share to social media & tag @roamreality
            </AppText>
          </View>
        </View>

        {/* Buttons */}
        <View style={{flexDirection: "row", gap: 16}}>
          <AppButton
            onPress={handleCaptureScreenshot}
            containerStyle={{flex: 1, height: 30, justifyContent: "center"}}
            titleStyle={{fontSize: FontSizes.S12, fontWeight: "bold"}}
            title={"Share To Socials"}
          />

          <AppButton
            onPress={endFunFactsButtonHandler}
            containerStyle={{flex: 1, height: 30, justifyContent: "center"}}
            titleStyle={{fontSize: FontSizes.S12, fontWeight: "bold"}}
            title={"End"}
          />
        </View>
      </View>
    </ChallengeScreen>
  );
};

export default FunFactsScreen;
