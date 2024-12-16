import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { FontLineHeights, FontSizes, fontGroup } from "../../../util/FontUtils";
import theme from "../../../assets/theme";
import Images from "../../../assets/images";
import useStyles from "./styles";
import RightArrowIcon from "../../../assets/svg/RightArrowIcon";
import { handleError, showMessage } from "../../../util/helpers";
import { BlurView } from "@react-native-community/blur";
import SiteIcon from "../../../assets/geoar/siteicon.svg";
import StarSiteIcon from "../../../assets/geoar/starsite.svg";
import ArIcon from "../../../assets/geoar/aricon.svg";
import { screenHorizontalPadding } from "../../../util/AppDimensions";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { AppHeader, AppText } from "../../../components";
import {
  checkGeoPinCheckInDoneAPI,
  getARChallenges,
  getCheckInCount,
  getCollectedStarCount,
} from "../../../network";

const HomeScreenData = [
  {
    id: -1,
    blank: true,
  },
  {
    id: 1,
    title: "Check in with our ",
    title1: "Roam Pin!",
    subtitle:
      "Snap a fun and creative picture standing next to our location pin as proof of your arrival.",
    image: Images.Home,
    Icon: SiteIcon,
    navigation: "PinChallenge",
  },
  {
    id: 2,
    title: "Let's go chase the ",
    title1: "stars!",
    subtitle: "Use our GPS navigation to find all our hidden stars located at this site!",
    image: Images.Home1,
    Icon: StarSiteIcon,
    navigation: "StarChallenge",
  },
  // {
  //   id: 3,
  //   title: "Engage in unique ",
  //   title1: "AR Experiences!",
  //   subtitle: "Participate in some extra fun AR experiences found at this site for extra points.",
  //   image: Images.Home1,
  //   Icon: ArIcon,
  //   navigation: "UniqueArChallenge",
  // },
  {
    id: 4,
    title: "AR Photo ",
    title1: "Challenges",
    subtitle: "These are AR Photo Challenges that you can do anytime & anywhere",
    image: Images.Home1,
    Icon: ArIcon,
    navigation: "ARChallenge",
  },
];

const ChallengeSelection = ({ route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfChallenges, setNumberOfChallenges] = useState(0);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const styles = useStyles();
  const selectedDestination = useSelector(state => state.ar?.selectedDestination);
  const selectedGeoARSiteStars = useSelector(state => state.ar?.selectedGeoARSiteStars);
  const selectedGeoSite = useSelector(state => state.ar?.selectedGeoSite);
  const [starsCount, setStarsCount] = useState(0);
  const [collectedStars, setCollectedStars] = useState(0);
  const [myCheckIns, setMyCheckIns] = useState(0);
  const [uniqueExperiences, setUniqueExperiences] = useState(0);
  const [isPinCheckIsDone, setIsPinCheckIsDone] = useState(false);
  const isFocused = useIsFocused();

  const checkIfPinCheckIsDone = () => {
    checkGeoPinCheckInDoneAPI({
      geo_site: selectedGeoSite.id,
    })
      .then(res => {
        if (res.errorStatus === 403) {
          setIsPinCheckIsDone(true);
        } else {
          setIsPinCheckIsDone(false);
        }
      })
      .finally(() => {});
  };

  const getMyCheckInsCount = () => {
    getCheckInCount({})
      .then(res => {
        if (res.status === 1) {
          setMyCheckIns(res.count);
        }
      })
      .finally(() => {});
  };

  const getStarsCollectCount = () => {
    getCollectedStarCount({
      geo_site: selectedGeoSite.id,
    })
      .then(res => {
        if (res.status == 1) {
          setCollectedStars(res.count);
        }
      })
      .finally(() => {});
  };

  useEffect(() => {
    if (isFocused) {
      checkIfPinCheckIsDone();
      getStarsCollectCount();
      getMyCheckInsCount();
    }
  }, [isFocused]);

  useEffect(() => {
    setIsLoading(true);
    getARChallenges()
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
  }, []);

  const goToRoute = route => {
    if (route === "PinChallenge" && !selectedGeoSite.pin_challenge) {
      showMessage("Pin Challenge is unavailable right now", "error");
    }
    if (route === "StarChallenge" && selectedGeoARSiteStars.length == 0) {
      showMessage("Stars Challenges are unavailable right now", "error");
    } else {
      navigation.navigate(route);
    }
  };

  const setStarCounts = () => {
    let count = 0;
    for (const stars_site of selectedGeoARSiteStars) {
      if (stars_site.star_location && stars_site.star_location.coordinates) {
        count += stars_site.star_location.coordinates.length;
      }
    }
    setStarsCount(count);
  };

  useEffect(() => {
    setStarCounts();
  }, [selectedGeoARSiteStars]);

  const HomeScreenARItem = item => {
    return (
      <TouchableOpacity style={styles.imageBg} onPress={() => goToRoute(item.navigation)}>
        <View style={styles.row}>
          <View style={styles.innerView}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              <item.Icon style={{ width: 48, height: 48, marginRight: 20 }} />
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
                {item?.id == 1 && (
                  <AppText style={styles.challengesText}>
                    Pin located: {isPinCheckIsDone ? 1 : 0}/1 • My Check-ins: {myCheckIns}
                  </AppText>
                )}
                {item?.id == 2 && (
                  <AppText style={styles.challengesText}>
                    {" "}
                    Stars collected: {collectedStars}/{starsCount}
                  </AppText>
                )}
                {item?.id == 3 && (
                  <AppText style={styles.challengesText}>
                    {selectedDestination.unique_ar_sites.length} Challenges
                  </AppText>
                )}
                {item?.id == 4 && (
                  <AppText style={styles.challengesText}>{numberOfChallenges} Challenges</AppText>
                )}
              </View>
              <TouchableOpacity onPress={() => goToRoute(item.navigation)}>
                <RightArrowIcon />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
              item.blank ? <View style={{ minHeight: 120 }} /> : <HomeScreenARItem {...item} />
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
  },
  container: {
    flex: 1,
    height: "100%",
    marginVertical: 10,
    paddingHorizontal: screenHorizontalPadding + 5,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    ...fontGroup.ns700,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH25,
    marginVertical: 8,
  },
  logoutText: {
    ...fontGroup.ns400,
    fontSize: FontSizes.S18,
    lineHeight: FontLineHeights.LH20,
  },
  horizontalLine: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: theme.darkColors?.dividerGrey,
    opacity: 0.4,
    marginVertical: 8,
  },
  cancelButton: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  cancelButtonText: {
    ...fontGroup.ns800,
    color: theme.darkColors?.inputBlue,
    fontSize: FontSizes.S16,
    lineHeight: FontLineHeights.LH20,
  },
  buttonheaderContainer: {
    paddingHorizontal: screenHorizontalPadding + 5,
    alignItems: "center",
    marginBottom: 15,
    marginTop: 7,
  },
  buttonContainer: {
    paddingHorizontal: screenHorizontalPadding - 5,
  },
  buttonStyle: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainerStyle: {
    marginTop: 10,
  },
  buttonTitle: {
    ...fontGroup.p600,
    fontSize: FontSizes.S16,
  },
});
