import React, {useRef, useState, useMemo} from "react";
import {Image, Text, View, Dimensions, PixelRatio} from "react-native";
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

const SHARE_PRESETS = {
  instagramStory: { width: 1080, height: 1920 },
  instagramPost45: { width: 1080, height: 1350 },
  instagramSquare: { width: 1080, height: 1080 },
  facebookFeed: { width: 1200, height: 1500 },
} as const;
type PresetKey = keyof typeof SHARE_PRESETS;

const pxToDp = (px: number) => px / PixelRatio.get();
type FitMode = "contain" | "cover";

const FIT_MODE: FitMode = "contain";

const OffscreenShareCard = React.forwardRef<any, {
  widthDp: number;
  heightDp: number;
  funFactImage?: string;
  siteImage?: string;
  siteName?: string;
  funFactDetail?: string;
  onReady?: () => void;
}>(({ widthDp, heightDp, funFactImage, siteImage, siteName, funFactDetail, onReady }, ref) => {
  const [cardSize, setCardSize] = useState<{w: number; h: number}>({ w: 0, h: 0 });

  const { scale, containerStyle } = useMemo(() => {
    const w = Math.max(1, cardSize.w);
    const h = Math.max(1, cardSize.h);
    if (!w || !h) {
      return {
        scale: 1,
        containerStyle: { justifyContent: "center", alignItems: "center" } as const,
      };
    }
    const sx = widthDp / w;
    const sy = heightDp / h;

    const s = FIT_MODE === "cover" ? Math.max(sx, sy) : Math.min(sx, sy);

    return {
      scale: s,
      containerStyle: { justifyContent: "center", alignItems: "center" } as const,
    };
  }, [cardSize, widthDp, heightDp]);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        opacity: 0,          
        pointerEvents: "none",
        width: widthDp,
        height: heightDp,
      }}
      onLayout={onReady}
    >
      <ViewShot
        ref={ref}
        options={{ format: "png", quality: 1 }}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#272741",
        }}
        collapsable={false}
      >
        <View style={{ width: "100%", height: "100%", ...containerStyle }}>
          <View style={{ transform: [{ scale }] }}>
            <View
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                if (width && height) {
                  setCardSize({ w: width, h: height });
                }
              }}
              style={{ width: widthDp }}
            >
              <View
                style={{
                  backgroundColor: "#272741",
                  gap: 16,
                  borderRadius: 12,
                  overflow: "hidden",
                  paddingBottom: 16,
                }}
              >
                <Image
                  source={{ uri: funFactImage }}
                  style={{
                    width: "100%",
                    height: undefined,
                    aspectRatio: 1,
                    backgroundColor: "transparent",
                  }}
                  resizeMode="cover"
                />

                <View style={{ paddingHorizontal: 16, gap: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                    {!!siteImage && (
                      <Image
                        style={{ width: 25, height: 25, borderRadius: 25 }}
                        source={{ uri: siteImage }}
                      />
                    )}
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 20,
                        color: "#fff",
                      }}
                      numberOfLines={1}
                    >
                      {siteName}
                    </Text>
                  </View>

                  <RenderHTML
                    contentWidth={widthDp }
                    tagsStyles={{
                      p: { color: "#9CA3AF", fontSize: 14 },
                      strong: { color: "#fff", fontSize: 14 },
                      ol: { color: "#fff" },
                      li: { color: "#fff" },
                      em: { fontStyle: "italic" },
                      u: { textDecorationLine: "underline" },
                      s: { textDecorationLine: "line-through" },
                    }}
                    source={{ html: `${funFactDetail ?? ""}` }}
                  />

                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "700", fontSize: 14, color: "#fff" }}>
                      Brought to you by
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {!!siteImage && <Image style={{ width: 40, height: 40, borderRadius: 8 }} source={{ uri: siteImage }} />}
                      {!!siteImage && <Image style={{ width: 40, height: 40, borderRadius: 8 }} source={{ uri: siteImage }} />}
                      {!!siteImage && <Image style={{ width: 40, height: 40, borderRadius: 8 }} source={{ uri: siteImage }} />}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ViewShot>
    </View>
  );
});




const FunFactsScreen = ({route}: any) => {
  const [shareToSocialsIsOpen, setShareToSocialsIsOpen] = useState(false);
  const [socialPointsCounter, setSocialPointsCounter] = useState({ facebook: 0, instagram: 0, others: 0 });
  const [filePath, setFilePath] = useState("");

  const funFactCardRef = useRef(null);

  const offscreenRef = useRef(null);
  const [isOffscreenReady, setIsOffscreenReady] = useState(false);
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
  const endOnceRef = useRef(false);
  const lastPressRef = useRef(0);
  const [lockInputs, setLockInputs] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const SELECTED_PRESET_KEY: PresetKey = "instagramStory";
  const SELECTED_PRESET = SHARE_PRESETS[SELECTED_PRESET_KEY];
  const offWdp = pxToDp(SELECTED_PRESET.width);
  const offHdp = pxToDp(SELECTED_PRESET.height);

  const captureForNetwork = async (presetKey: PresetKey) => {
    const { width, height } = SHARE_PRESETS[presetKey];
    const uri = await captureRef(offscreenRef, {
      format: "jpg",
      quality: 0.9,
      result: "tmpfile",
      useRenderInContext: true,
    });
    return uri;
  };

const handleCaptureScreenshot = async () => {
  try {
    if (!isOffscreenReady) {
      await new Promise(r => setTimeout(r, 0));
    }
    const uri = await captureForNetwork(SELECTED_PRESET_KEY);
    setFilePath(uri);
    setShareToSocialsIsOpen(true);
  } catch (error) {
    console.error("Screenshot capture error:", error);
  }
};

  const pressedTooSoon = (ms = 1000) => {
    const now = Date.now();
    if (now - lastPressRef.current < ms) return true;
    lastPressRef.current = now;
    return false;
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
            updatedCounter = 1;
            grantSocialPointsHandler(selectedSSNN);
          }
          return { ...currCounter, facebook: updatedCounter };
        });
        break;
      case SSNN.INSTAGRAM:
        setSocialPointsCounter(currCounter => {
          let updatedCounter = currCounter.instagram;
          if (currCounter.instagram === 0) {
            updatedCounter = 1;
            grantSocialPointsHandler(selectedSSNN);
          }
          return { ...currCounter, instagram: updatedCounter };
        });
        break;
      case SSNN.OTHERS:
        setSocialPointsCounter(currCounter => {
          let updatedCounter = currCounter.others;
          if (currCounter.others === 0) {
            updatedCounter = 1;
            grantSocialPointsHandler(selectedSSNN);
          }
          return { ...currCounter, others: updatedCounter };
        });
        break;
      default:
        break;
    }
  };

  const resetNavigation = () => {
    navigation.reset({
      index: 0,
      // @ts-ignore
      routes: [{name: "TabNavigator", params: {screen: "GeoArChallenge"}}],
    });
  };

  const endFunFactsButtonHandler = async () => {
    if (pressedTooSoon(1000)) return;
    if (endOnceRef.current) return;
    endOnceRef.current = true;
    setLockInputs(true);
    setIsEnding(true);

    const geoSiteId = challengeObj?.huntChallenge?.geo_ar_star?.geo_site?.id;
    const challengeId = challengeObj?.huntChallenge?.geo_ar_star?.id;
    const starPointId = challengeObj?.huntChallenge?.id;
    const lat = challengeObj?.lat_long?.coordinates[1];
    const lon = challengeObj?.lat_long?.coordinates[0];

    try {
      await starFoundAndSaveApi({
        geo_site: geoSiteId,
        geo_ar_star: challengeId,
        geo_ar_star_point: starPointId,
        latitude: lat,
        longitude: lon,
      });

      const newHuntPointChallenge = await getNextStarApi(geoSiteId, lat, lon);
      const remainingStars = newHuntPointChallenge?.remaining_stars || 0;

      let navigationParams: any = {};
      if (remainingStars >= 1) {
        const huntChallenge = {
          ...challengeObj,
          selectedMode: AR_MODES_MENU[2],
          huntChallenge: newHuntPointChallenge,
        };
        navigationParams = {huntChallenge};
      } else {
        navigationParams = {huntChallengeFinished: true};
      }

      setTimeout(() => {
        // @ts-ignore
        navigation.navigate("TabNavigator", {
          screen: "Tab",
          params: {screen: "Go Navigate"},
        });
      }, 250);
    } catch (error) {
      console.error("Error al finalizar:", error);
      endOnceRef.current = false;
      setLockInputs(false);
      setIsEnding(false);
    }
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

  return (
    <ChallengeScreen
      title="Fun Facts"
      style={{ justifyContent: "space-between", gap: 16, paddingHorizontal: 24, paddingBottom: 50 }}
      modals={screenModals}
      hideBackButton
      scrollable
    >
    <OffscreenShareCard
      ref={offscreenRef}
      widthDp={offWdp}
      heightDp={offHdp}
      funFactImage={funFactImage}
      siteImage={siteImage}
      siteName={siteName}
      funFactDetail={funFactDetail}
      onReady={() => setIsOffscreenReady(true)}
    />
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
          <View style={{paddingHorizontal: 16, gap: 16}}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 16}}>
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
                  p: { color: "#9CA3AF", fontSize: FontSizes.S14 },
                  strong: { color: "#fff", fontSize: FontSizes.S14 },
                  ol: { color: "#fff" },
                  li: { color: "#fff" },
                  em: { fontStyle: "italic" },
                  u: { textDecorationLine: "underline" },
                  s: { textDecorationLine: "line-through" },
                }}
                source={{ html: `${funFactDetail}` }}
              />
            </View>

            <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
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
              style={{ backgroundColor: "transparent", position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
            />
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

        <View style={{flexDirection: "row", gap: 16}} pointerEvents={lockInputs ? "none" : "auto"}>
          <AppButton
            onPress={handleCaptureScreenshot}
            containerStyle={{flex: 1, height: 30, justifyContent: "center"}}
            titleStyle={{fontSize: FontSizes.S12, fontWeight: "bold"}}
            title={"Share To Socials"}
            disabled={lockInputs}
          />
          <AppButton
            onPress={endFunFactsButtonHandler}
            containerStyle={{flex: 1, height: 30, justifyContent: "center"}}
            titleStyle={{fontSize: FontSizes.S12, fontWeight: "bold"}}
            title={isEnding ? "Ending..." : "End"}
            disabled={isEnding}
          />
        </View>
      </View>
    </ChallengeScreen>
  );
};

export default FunFactsScreen;
