import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, ActivityIndicator, FlatList } from "react-native";

import { BlurView } from "@react-native-community/blur";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

import { GeolocationContext } from "GeolocationProvider";

import {
  getARChallenges as getARChallengesApi,
  getNextStar as getNextStarApi,
} from "../../../network";
import { FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils";
import { handleError, showMessage } from "../../../util/helpers";

import { AppHeader, AppText } from "../../../components";

import SiteIcon from "../../../assets/geoar/siteicon.svg";
import StarSiteIcon from "../../../assets/geoar/starsite.svg";
import ArIcon from "../../../assets/geoar/aricon.svg";
import theme from "../../../assets/theme";
import Images from "../../../assets/images";
import RightArrowIcon from "../../../assets/svg/RightArrowIcon";

const HomeScreenData = [
  { id: -1, blank: true },
  {
    id: 1,
    title: "Geo Check-Ins",
    title1: "",
    subtitle:
      "Snap a fun and creative picture standing next to our location pin as proof of your arrival.",
    image: Images.Home,
    Icon: SiteIcon,
    navigation: "PinChallenge",
  },
  // {
  //   id: 2,
  //   title: "Let's go chase the ",
  //   title1: "stars!",
  //   subtitle: "Use our GPS navigation to find all our hidden stars located at this site!",
  //   image: Images.Home1,
  //   Icon: StarSiteIcon,
  //   navigation: "StarChallenge",
  // },
  {
    id: 4,
    title: "AR ",
    title1: "Challenges",
    subtitle: "These are AR Challenges that you can do anytime & anywhere",
    image: Images.Home1,
    Icon: ArIcon,
    navigation: "ARChallenge",
  },
];

const ChallengeSelection = ({ route }) => {
  const experience_type = route.params?.experience_type;
  const coolDown = route.params?.coolDown;
  const checkIns = route.params?.checkIns;

  const [isLoading, setIsLoading] = useState(false);
  const [numberOfChallenges, setNumberOfChallenges] = useState(0);
  const [starsChallenge, setStarsChallenge] = useState();

  const selectedGeoARSiteStars = useSelector(state => state.ar?.selectedGeoARSiteStars);
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { userLocation } = useContext(GeolocationContext);

  const latitude = userLocation?.latitude;
  const longitude = userLocation?.longitude;

  const getNextStar = async () => {
    try {
      const params = {
        geo_site_id: selectedGeoSite.id,
        // geo_site_id: selectedGeoARSiteStars[0]?.id,
        lat: latitude,
        lon: longitude,
      };
      const response = await getNextStarApi(params);
      if (response?.id) {
        setStarsChallenge(response);
      } else {
        setStarsChallenge(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getArChallenges = () => {
    setIsLoading(true);
    getARChallengesApi()
      .then(res => {
        if (res.status == 1) {
          setNumberOfChallenges(res?.data?.length);
        } else {
          res.message.message = "Error in loading Challenges.";
          handleError(res);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const goToRoute = route => {
    switch (route) {
      case "StarChallenge":
        if (selectedGeoARSiteStars.length === 0) {
          showMessage("This Star Challenge is completed.", "error");
          return;
        }
        if (!starsChallenge) return;
        navigation.navigate("GeoArSiteRoutes", { starsChallenge });
        break;
      case "PinChallenge":
        if (!selectedGeoSite.pin_challenge) {
          showMessage("Pin Challenge is unavailable right now", "error");
          return;
        }

        navigation.navigate("ChallengeDetails", {
          challengeObj: selectedGeoSite,
          experience_type: experience_type,
          coolDown,
          checkIns,
        });

        break;

      default:
        navigation.navigate(route);

        break;
    }
  };

  const HomeScreenARItem = item => {
    return (
      <TouchableOpacity style={styles.imageBg} onPress={() => goToRoute(item.navigation)}>
        <View style={styles.row}>
          <View style={styles.innerView}>
            <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
              {item?.Icon && <item.Icon style={{ width: 48, height: 48, marginRight: 20 }} />}
              <AppText style={styles.headerText}>
                {item?.title}
                {item?.title1}
              </AppText>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                flex: 1,
              }}
            >
              <View style={{ flex: 1 }}>
                <AppText style={styles.subtitleText}>{item?.subtitle}</AppText>
                {item?.id === 1 && (
                  <AppText style={styles.challengesText}>My Check-ins: {checkIns}</AppText>
                )}
                {item?.id === 2 && (
                  <AppText style={styles.challengesText}>
                    {starsChallenge
                      ? `Stars collected: ${starsChallenge?.captured_stars}/${starsChallenge?.total_stars}`
                      : "This Star Challenge is completed."}
                  </AppText>
                )}
                {item?.id === 4 && (
                  <AppText style={styles.challengesText}>{numberOfChallenges} Challenges</AppText>
                )}
              </View>
              <View>
                <RightArrowIcon />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    if (isFocused) {
      getArChallenges();
      getNextStar();
    }
  }, [isFocused]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.containerStyle}
            data={HomeScreenData}
            renderItem={({ item }) =>
              item?.blank ? <View style={{ minHeight: 120 }} /> : <HomeScreenARItem {...item} />
            }
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <View style={styles.blurView}>
        <BlurView
          blurType="regular"
          overlayColor="transparent"
          style={{ backgroundColor: "transparent" }}
        >
          <AppHeader title={"Explore The Site"} containerStyle={styles.headerContainer} />
        </BlurView>
      </View>
    </View>
  );
};

export default ChallengeSelection;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#202136",
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
  },
  imageBg: {
    width: "100%",
    minHeight: 180,
    borderRadius: 20,
    marginBottom: 20,
    paddingVertical: 8,
    backgroundColor: "#131422",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 25,
    flex: 1,
  },
  headerText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S26,
    lineHeight: FontLineHeights.LH35,
    marginVertical: 0,
    flex: 1,
    color: theme.lightColors?.white,
  },
  innerView: {
    flex: 1,
  },
  challengesText: {
    ...fontGroup.nunitoBold,
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH15,
    marginTop: 10,
    marginStart: 3,
    color: theme.lightColors?.white,
  },
  subtitleText: {
    ...fontGroup.nunitoRegular,
    fontSize: FontSizes.S12,
    lineHeight: FontLineHeights.LH15,
    marginTop: 10,
    marginStart: 3,
    flex: 1,
    color: theme.lightColors?.white,
  },
  containerStyle: {
    marginTop: 10,
  },
  list: {
    marginBottom: 20,
    flex: 1,
  },
  blurView: {
    overflow: "hidden",
    position: "absolute",
    top: 0,
    zIndex: 10,
  },
  headerContainer: {
    paddingVertical: 15,
    borderBottomWidth: 0,
    backgroundColor: "rgba(0, 0, 0, 0.0)",
  },
});
