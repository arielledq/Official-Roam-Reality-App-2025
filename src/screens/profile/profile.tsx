import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useStyles from "./styles";
import { RootStackParamList, ScreenStackComponent } from "../../navigation/types";
import BackgroundWithImage from "../../components/background";
import AppHeader from "../../components/header";
import { MenuIcon } from "../../assets/svg";
import UserInfoCard from "../../components/userInfoCard";
import { AppButton, AppText } from "../../components";
import StatContainer from "../../components/statContainer";
import BoxStatContainer from "../../components/boxStatContainer";
import Images from "../../assets/images";
import MemoryContainer from "../../components/memoryContainer";
import Icon from "../../components/Icon";
import LinearGradient from "react-native-linear-gradient";
import {
  getARProfile,
  getCheckInCount,
  getCountryCount,
  getProfieARMemoriesAPI,
  getProfieDetails,
  getUserCollectedStarCount,
  getUserRankCount,
  sendCode,
} from "../../network";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import ScreenLoader from "../../components/screenLoader";
import { updateARUserData } from "../../redux/AR";
import { BlurView } from "@react-native-community/blur";

const SCROLL_AMOUNT = 150;

const Profile: ScreenStackComponent<RootStackParamList, "Profile"> = () => {
  const navigation = useNavigation();
  const _styles = useStyles();
  const dispatch = useDispatch();
  const userProfile = useSelector(state => state.login?.data?.user);
  const [profileDetails, setProfileDetails] = useState(null);
  const [arMemories, setARMemories] = useState([]);
  const [loading, setloading] = useState(true);
  const arProfile = useSelector(state => state.ar?.arProfile);
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [starsCount, setStarsCount] = useState(0);
  const [countryCount, setCountryCount] = useState(0);
  const [globalRank, setGlobalRank] = useState(0);
  const [myCheckIns, setMyCheckIns] = useState(0);
  const flatListRef = useRef(null);
  const scrollPositionRef = useRef(0); // Ref to hold the scroll position

  const handleScroll = event => {
    const { contentOffset } = event.nativeEvent;
    const currentScrollPosition = contentOffset.x;

    // Update the ref directly
    scrollPositionRef.current = currentScrollPosition;
  };

  const scrollRegionsPressHandler = () => {
    const newPosition = scrollPositionRef.current + SCROLL_AMOUNT;

    // Scroll to the new position
    flatListRef.current?.scrollToOffset({ offset: newPosition, animated: true });

    // Update the ref with the new position immediately
    scrollPositionRef.current = newPosition;
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

  const fetchProfileDetails = async () => {
    try {
      getProfieDetails({
        id: userProfile.user_profile.id,
      })
        .then(res => {
          if (res.status == 1) {
            setProfileDetails(res);
          } else {
            console.error("Error", "Error fetching profile details: ");
          }
        })
        .catch(err => {
          console.error("Error", "Error fetching profile details: ");
        })
        .finally(() => setloading(false));
    } catch (error) {
      console.error("Error", "Error fetching profile details: ");
    }
  };

  const fetchARUserProfile = () => {
    getARProfile()
      .then(res => {
        if (res.status == 1) {
          dispatch(updateARUserData(res));
        }
      })
      .finally(() => {});
  };

  const getUserCollectedStar = async () => {
    getUserCollectedStarCount({
      user_id: userProfile.id,
    })
      .then(res => {
        if (res.status == 1) {
          setStarsCount(res.count);
        }
      })
      .catch(err => {
        console.error("Error", "Error fetching ar memories: ");
      })
      .finally(() => setloading(false));
  };

  const getRank = async () => {
    getUserRankCount({
      user_id: userProfile.id,
    })
      .then(res => {
        if (res.status == 1) {
          setGlobalRank(res.rank);
        }
      })
      .catch(err => {
        console.error("Error", "Error fetching ar memories: ");
      })
      .finally(() => setloading(false));
  };

  const getCountry = async () => {
    getCountryCount({
      user_id: userProfile.id,
    })
      .then(res => {
        if (res.status == 1) {
          setCountryCount(res.count);
        }
      })
      .catch(err => {
        console.error("Error", "Error fetching ar memories: ");
      })
      .finally(() => setloading(false));
  };

  const getProfieARMemories = async () => {
    try {
      getProfieARMemoriesAPI()
        .then(res => {
          if (res.status == 1) {
            setARMemories(res.data);
          } else {
            console.error("Error", "Error fetching ar memories: ");
          }
        })
        .catch(err => {
          console.error("Error", "Error fetching ar memories: ");
        })
        .finally(() => setloading(false));
    } catch (error) {
      console.error("Error", "Error fetching ar memories: ");
    }
  };

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      getProfieARMemories();
      fetchARUserProfile();
      getUserCollectedStar();
      getRank();
      getCountry();
    }, [])
  );

  useEffect(() => {
    getMyCheckInsCount();
    fetchProfileDetails();
  }, [isProfileUpdated, userProfile]);

  const onProfileUpdate = () => {
    setIsProfileUpdated(prev => !prev);
  };

  const handleMenuButton = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          setIsTransitioning(true);
          navigation.openDrawer();
        }}
        style={_styles.menuIcon}
      >
        <MenuIcon />
      </TouchableOpacity>
    );
  };

  const data = [
    { id: 1, value: myCheckIns, property: "Sites Visited" },
    { id: 2, value: starsCount, property: "Stars" },
    { id: 3, value: arProfile?.challenge_completed, property: "AR Photo Challenges" },
    { id: 4, value: profileDetails?.friends?.length, property: "Friends" },
  ];
  // Split the data into chunks of 3 for each row
  const rows = [];
  for (let i = 0; i < data.length; i += 3) {
    rows.push(data.slice(i, i + 3));
  }
  const navigateToVerifyMail = email => {
    sendCode({ email: email.toLowerCase() });
    setIsTransitioning(true);
    navigation.navigate("EmailVerificationC", {
      email: email.toLowerCase(),
      profile: true,
    });
  };
  const renderHeader = () => (
    <KeyboardAwareScrollView style={_styles.header}>
      {profileDetails?.image ? (
        <View style={[_styles.avatarContainer]}>
          <LinearGradient
            colors={["rgba(32, 33, 54, 1)", "rgba(32, 33, 54, 0)"]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0.7 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
            }}
          />
          <FastImage
            style={{
              width: "100%",
              marginTop: 80,
              aspectRatio: 1,
            }}
            source={{ uri: profileDetails?.image }}
            resizeMode={FastImage.resizeMode.cover}
          />

          <AppButton
            customColors={["#7B16FF", "#1158F4"]}
            buttonStyle={_styles.editButton}
            containerStyle={_styles.editButtonContainer}
            onPress={() => {
              setIsTransitioning(true);
              navigation.navigate("EditProfile", {
                edit: true,
                profileDetails,
                onProfileUpdate,
              });
            }}
          >
            <Icon name={"edit-2"} family="feather" color={"white"} size={16} />
            <AppText style={_styles.buttonText}>Edit Profile</AppText>
          </AppButton>
        </View>
      ) : (
        <AppButton
          customColors={["#7B16FF", "#1158F4"]}
          buttonStyle={_styles.editButton}
          containerStyle={_styles.editButtonContainer}
          onPress={() => {
            setIsTransitioning(true);
            navigation.navigate("EditProfile", {
              edit: true,
              profileDetails,
              onProfileUpdate,
            });
          }}
          // onPress={() => navigation.navigate("EditProfile", { edit: true ,profileDetails,onProfileUpdate})}
        >
          <Icon name={"edit-2"} family="feather" color={"white"} size={16} />
          <AppText style={_styles.buttonText}>Edit Profile</AppText>
        </AppButton>
      )}
      <View style={_styles.scroll}>
        <UserInfoCard
          image={profileDetails?.image ? true : false}
          name={profileDetails?.user.name}
          email={profileDetails?.user.email}
          verifyAction={() => navigateToVerifyMail(profileDetails?.user.email)}
          isVerified={profileDetails?.user.user_profile.is_verified}
        />
        <View style={_styles.scoreboardContainer}>
          <AppText
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            onPress={() => navigation.navigate("ScoreBoard")}
            style={_styles.scoreboard}
          >
            SCOREBOARD
          </AppText>
        </View>
        <View style={_styles.statContainerStyle}>
          <StatContainer value={"" + globalRank} property={"Global Rank"} />
          <StatContainer value={arProfile?.points} property={"Points"} />
          <StatContainer value={"0"} property={"TT Rank"} />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );

  const navigateToShare = (captureData: any, challengeObj: any) => {
    // @ts-ignore
    navigation.navigate("ArChallengeShare", {
      challengeObj: challengeObj,
      captureData,
      hideBottomTab: true,
    });
  };

  const renderFooter = () => (
    <View style={_styles.scroll}>
      <View style={_styles.headingView}>
        <AppText style={_styles.heading}>Player AR Memories</AppText>
        <TouchableOpacity style={_styles.arrow_3} onPress={scrollRegionsPressHandler}>
          <Image source={Images.ForwardIcon} />
        </TouchableOpacity>
      </View>
      <View style={{ marginHorizontal: -10, marginBottom: 50 }}>
        <FlatList
          ref={flatListRef}
          onScroll={handleScroll}
          scrollEventThrottle={32} // Adjust this value for performance
          style={{ width: "100%" }}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 18 }}
          data={arMemories}
          horizontal={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <MemoryContainer item={item} onPressAction={navigateToShare} />}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <BoxStatContainer key={item.id} boxId={item.id} value={item.value} property={item.property} />
  );

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      {loading ? (
        <ScreenLoader />
      ) : (
        <FlatList
          data={data}
          contentContainerStyle={_styles.container_style}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          numColumns={3}
          nestedScrollEnabled={true}
          ListFooterComponent={renderFooter}
        />
      )}
      <View style={_styles.blurView}>
        <BlurView blurType="light" overlayColor="#00000050" enabled={!isTransitioning}>
          <AppHeader
            containerStyle={_styles.headerContainer}
            title={"Profile"}
            leftComponent={handleMenuButton()}
            isBottomTab
          />
        </BlurView>
      </View>
    </BackgroundWithImage>
  );
};

export default Profile;
