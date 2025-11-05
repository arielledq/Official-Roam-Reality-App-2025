import React, {useCallback, useEffect, useRef, useState} from "react";
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import useStyles from "./styles";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {RootStackParamList, ScreenStackComponent} from "../../constants/types";
import BackgroundWithImage from "../../components/background";
import AppHeader from "../../components/header";
import {MenuIcon} from "../../assets/svg";
import UserInfoCard from "../../components/userInfoCard";
import {AppButton, AppText} from "../../components";
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
  getAllMemories,
  getProfieDetails,
  getUserCollectedStarCount,
  getUserRankCount,
  sendCode,
  updateArrMemories,
  getMyRank,
} from "../../network";
import {useDispatch, useSelector} from "react-redux";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import ScreenLoader from "../../components/screenLoader";
import {updateARUserData} from "../../redux/AR";
import {BlurView} from "@react-native-community/blur";
import ScreenContainer from "components/ScreenContainer";
import {height} from "util/AppDimensions";
import {heightPercentageToDP} from "react-native-responsive-screen";
import {getProfilePicture} from "util/imageUtils";

const SCROLL_AMOUNT = 150;

const Profile: ScreenStackComponent<RootStackParamList, "Profile"> = () => {
  const navigation = useNavigation();
  const _styles = useStyles();
  const dispatch = useDispatch();
  const userProfile = useSelector((state: any) => state.login?.data?.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [totalLength, setTotalLength] = useState(0);
  const [globalPoints, setGlobalPoints] = useState(0);
  const [profileDetails, setProfileDetails] = useState<any>(null);
  const [arMemories, setARMemories] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const arProfile = useSelector((state: any) => state.ar?.arProfile);
  const [showArMemories, setShowArMemories] = useState(true);
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [starsCount, setStarsCount] = useState(0);
  const [countryCount, setCountryCount] = useState(0);
  const [globalRank, setGlobalRank] = useState(0);
  const [myCheckIns, setMyCheckIns] = useState(0);
  const scrollPositionRef = useRef(0); // Ref to hold the scroll position
  const flatListRef = useRef(null);

  const handleScroll = (event: any) => {
    const {contentOffset} = event.nativeEvent;
    const currentScrollPosition = contentOffset.x;

    // Update the ref directly
    scrollPositionRef.current = currentScrollPosition;
  };

  const scrollRegionsPressHandler = () => {
    const newPosition = scrollPositionRef.current + SCROLL_AMOUNT;

    // Scroll to the new position
    // @ts-ignore
    flatListRef.current?.scrollToOffset({
      offset: newPosition,
      animated: true,
    });

    // Update the ref with the new position immediately
    scrollPositionRef.current = newPosition;
  };

  const getMyRankPoints = (destination = "") => {
    getMyRank(destination)
      .then(response => {
        if (response) {
          console.log("My Rank Point", response);
          setGlobalRank(response?.my_rank || 0);
          setGlobalPoints(response?.my_points || 0);

          // setRankMine(response);
        }
      })
      .finally(() => {
        fetchARUserProfile();
      });
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
            console.log("res", res);
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

  // const getRank = async () => {
  //   getUserRankCount({
  //     user_id: userProfile.id,
  //   })
  //     .then(res => {
  //       if (res.status == 1) {
  //         setGlobalRank(res.rank);
  //       }
  //     })
  //     .catch(err => {
  //       console.error("Error", "Error fetching ar memories: ");
  //     })
  //     .finally(() => setloading(false));
  // };

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
      getAllMemories(currentPage, pageSize)
        .then(res => {
          if (res.status == 1) {
            setARMemories(res.results);

            setTotalLength(res.total_record);
          } else {
            console.error("Error", "Error fetching ar memories: ");
          }
        })
        .catch(err => {
          console.error("Error", "Error fetching ar memories: ", err);
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
      getMyRankPoints();
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
          // @ts-expect-error
          navigation.openDrawer();
        }}
        style={_styles.menuIcon}
      >
        <MenuIcon />
      </TouchableOpacity>
    );
  };

  const data = [
    {id: 1, value: myCheckIns, property: "Sites Visited"},
    {id: 2, value: starsCount, property: "Stars"},
    {id: 3, value: arProfile?.challenge_completed, property: "AR Challenges"},
    {id: 4, value: profileDetails?.friends?.length, property: "Friends"},
  ];
  // Split the data into chunks of 3 for each row
  const rows = [];
  for (let i = 0; i < data.length; i += 3) {
    rows.push(data.slice(i, i + 3));
  }
  const navigateToVerifyMail = (email: string) => {
    // sendCode({ email: email.toLowerCase() });
    setIsTransitioning(true);
    // @ts-expect-error
    navigation.navigate("EmailVerification", {
      email: email.toLowerCase(),
      profile: true,
    });
  };

  const handleChaangePrivacy = (item: any, value: any) => {
    const Memories = arMemories.map((memory: any) => {
      if (memory.id === item.id) {
        return {...memory, privacy: value};
      }
      return memory;
    });
    setARMemories(Memories);

    const payLoadData = {
      privacy: value,
    };

    updateArrMemories(item.id, payLoadData)
      .then(res => {
        if (res.status === 1) {
        } else {
        }
      })
      .catch(err => {
        console.error("Error updating privacy: ", err);
      });
  };

  const lodeMoreData = () => {
    console.log("lodeMoreData called", totalLength, arMemories.length);
    if (arMemories.length < totalLength) {
      setCurrentPage(prevPage => prevPage + 1);
      getAllMemories(currentPage + 1, pageSize)
        .then(res => {
          if (res.status == 1) {
            setARMemories(prevMemories => [...prevMemories, ...res.results]);
          } else {
            console.error("Error", "Error fetching more memories: ");
          }
        })
        .catch(err => {
          console.error("Error", "Error fetching more memories: ", err);
        });
    }
  };

  const profilePicture = getProfilePicture(
    profileDetails?.image || userProfile?.user_profile?.image
  );

  const renderHeader = () => (
    <KeyboardAwareScrollView style={_styles.header}>
      <View style={_styles.avatarContainer}>
        {profilePicture ? (
          <>
            <View
              style={{
                width: "100%",
                height: height * 0.12,
              }}
            />
            <FastImage
              style={{
                width: "100%",
                height: height * 0.4,
              }}
              //  @ts-ignore
              source={{uri: profilePicture}}
              resizeMode={FastImage.resizeMode.cover}
              defaultSource={Images.AppLogo}
            />
            <LinearGradient
              colors={["rgba(32, 33, 54, 1)", "rgba(32, 33, 54, 0)"]}
              start={{x: 0.5, y: 1}}
              end={{x: 0.5, y: 0.7}}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
              }}
            />
          </>
        ) : (
          <>
            <View
              style={{
                width: "100%",
                height: height * 0.52,
              }}
            />
          </>
        )}
      </View>

      <View style={_styles.scroll}>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            marginTop: heightPercentageToDP(1),
            justifyContent: "space-between",
          }}
        >
          <View style={{width: "70%"}}>
            <UserInfoCard
              // @ts-ignore
              image={profileDetails?.image ? true : false}
              name={profileDetails?.user.name}
              email={profileDetails?.user.email}
              verifyAction={() => navigateToVerifyMail(profileDetails?.user.email)}
              isVerified={userProfile?.user_profile?.is_verified}
            />
          </View>

          <AppButton
            customColors={["#7a00cf", "#5532ff"]}
            buttonStyle={_styles.editButton}
            containerStyle={[_styles.editButtonContainer]}
            onPress={() => {
              setIsTransitioning(true);
              //  @ts-ignore
              navigation.navigate("EditProfile", {
                edit: true,
                profileDetails,
                onProfileUpdate,
              });
            }}
          >
            <Icon name={"edit"} family="antdesign" color={"white"} size={16} />
            {/* @ts-ignore */}
            <AppText style={_styles.buttonText}>Edit Profile </AppText>
          </AppButton>
        </View>
        <View style={_styles.scoreboardContainer}>
          <AppText
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            // @ts-ignore
            onPress={() => navigation.navigate("ScoreBoard")}
            // @ts-ignore
            style={_styles.scoreboard}
          >
            SCOREBOARD
          </AppText>
        </View>
        <View style={_styles.statContainerStyle}>
          <StatContainer value={globalRank?.toString()} property={"Global Rank"} />
          <StatContainer value={globalPoints?.toString()} property={"Points"} />
          <StatContainer value={profileDetails?.friends?.length} property={"Friends"} />
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
      isMemory: true,
    });
  };

  const renderFooter = () => (
    <View style={_styles.scroll}>
      <View style={_styles.headingView}>
        <AppText style={_styles.heading}>Player AR Memories</AppText>
        <AppButton
          containerStyle={_styles.shadowBoxImage}
          customColors={["#7a00cf", "#5532ff"]}
          showButton={false}
        >
          <TouchableOpacity onPress={() => setShowArMemories(!showArMemories)}>
            {showArMemories ? (
              <Icon name="chevron-down" family="ionicon" size={26} color={"#fff"} />
            ) : (
              <Icon name="chevron-up" family="ionicon" size={26} color={"#fff"} />
            )}
          </TouchableOpacity>
        </AppButton>
      </View>
      {showArMemories && (
        <FlatList
          ref={flatListRef}
          style={{
            paddingHorizontal: 10,
          }}
          columnWrapperStyle={{
            gap: heightPercentageToDP("2%"),
            marginBottom: 10,
          }}
          data={arMemories}
          key={(item: any) => item?.id?.toString()}
          numColumns={3}
          onEndReachedThreshold={0.5}
          onEndReached={lodeMoreData}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <MemoryContainer
              item={item}
              onPressAction={navigateToShare}
              onChnagePrivacy={(item: any, privacy: any) => {
                handleChaangePrivacy(item, privacy);
              }}
            />
          )}
          keyExtractor={(item: any) => item?.id?.toString()}
        />
      )}
    </View>
  );

  return (
    <ScreenContainer style={{..._styles.mainContainer, paddingHorizontal: 0, paddingTop: 0}}>
      <>
        {loading ? (
          <ScreenLoader style={{}} />
        ) : (
          <FlatList
            contentContainerStyle={_styles.container_style}
            keyExtractor={item => item.id.toString()}
            ListHeaderComponent={renderHeader}
            numColumns={3}
            nestedScrollEnabled={true}
            ListFooterComponent={renderFooter}
          />
        )}
        <View style={_styles.blurView}>
          <BlurView
            blurType="light"
            overlayColor="#00000050"
            enabled={!isTransitioning}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
          />
          <AppHeader
            containerStyle={_styles.headerContainer}
            title={"Profile"}
            leftComponent={handleMenuButton()}
          />
        </View>
      </>
    </ScreenContainer>
  );
};

export default Profile;
