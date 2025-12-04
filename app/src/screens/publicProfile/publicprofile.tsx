import React, {useCallback, useEffect, useRef, useState} from "react";
import {FlatList, Image, Pressable, RefreshControl, TouchableOpacity, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import useStyles from "./styles";
import {RootStackParamList, ScreenStackComponent} from "../../constants/types";
import BackgroundWithImage from "../../components/background";
import AppHeader from "../../components/header";
import {AppButton, AppText} from "../../components";
import StatContainer from "../../components/statContainer";
import BoxStatContainer from "../../components/boxStatContainer";
import Images from "../../assets/images";
import MemoryContainer from "../../components/memoryContainer";
import LinearGradient from "react-native-linear-gradient";
import {
  getCountryCount,
  getProfieDetails,
  getPublicARProfile,
  getPublicProfieARMemoriesAPI,
  getUserCollectedStarCount,
  getUserRankCount,
  removeUserFromFriends,
  reportContentOrUser,
} from "../../network";
import {useDispatch} from "react-redux";
import {useNavigation, useRoute} from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import {height} from "../../util/AppDimensions";
import ScreenLoader from "../../components/screenLoader";
import {BlurView} from "@react-native-community/blur";
import UserReportCard from "../../components/userInfoCard";
import ReportUserModal from "../reportUser/ReportUser";
import {showMessage} from "../../util/helpers";
import ConfirmationPopUp from "../../components/confirmationPopUp";
import {getProfilePicture} from "util/imageUtils";
import {heightPercentageToDP} from "react-native-responsive-screen";
import Icon from "components/Icon";

const PublicProfile: ScreenStackComponent<RootStackParamList, "PublicProfile"> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const _styles = useStyles();
  const dispatch = useDispatch();
  const userProfile = route?.params?.userData;
  const [totalLength, setTotalLength] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const flatListRef = useRef(null);
  const [showArMemories, setShowArMemories] = useState(true);
  const [globalPoints, setGlobalPoints] = useState(0);
  const [pageSize, setPageSize] = useState(30);
  const [arMemories, setARMemories] = useState([]);
  const [loading, setloading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onEndReachedCalledDuringMomentum = useRef(true); // Prevent multiple calls during momentum
  const [arProfile, updateARUserData] = useState({});
  const [profileDetails, setProfileDetails] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [starsCount, setStarsCount] = useState(0);
  const [countryCount, setCountryCount] = useState(0);
  const [globalRank, setGlobalRank] = useState(0);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);

  const fetchARUserProfile = () => {
    getPublicARProfile(userProfile?.id)
      .then(res => {
        if (res.status == 1) {
          updateARUserData(res);
        }
      })
      .finally(() => {});
  };

  const getProfieARMemories = async () => {
    try {
      getPublicProfieARMemoriesAPI(userProfile?.id, currentPage, pageSize)
        .then(res => {
          if (res.status == 1) {
            setARMemories(res.results);
            setTotalLength(res.total_record);
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

  const lodeMoreData = useCallback(() => {
    // Prevent multiple simultaneous calls
    if (isLoadingMore) {
      return;
    }

    // Validate totalLength is set (data has been loaded)
    if (totalLength === 0) {
      return;
    }

    // Check if we have more data to load
    if (arMemories.length >= totalLength) {
      return;
    }

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    getPublicProfieARMemoriesAPI(userProfile?.id, nextPage, pageSize)
      .then(res => {
        if (res.status == 1) {
          setARMemories(prevMemories => [...prevMemories, ...res.results]);
          setCurrentPage(nextPage);
        } else {
          console.error("Error", "Error fetching more memories: ");
        }
      })
      .catch(err => {
        console.error("Error", "Error fetching more memories: ", err);
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [isLoadingMore, totalLength, arMemories.length, currentPage, pageSize, userProfile?.id]);

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
          setGlobalPoints(response?.points || 0);
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

  // Initial load only - runs once when component mounts
  useEffect(() => {
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);

    // Initialize momentum ref
    onEndReachedCalledDuringMomentum.current = true;

    // Fetch initial data
    getProfieARMemories();
    fetchARUserProfile();
    getUserCollectedStar();
    getRank();
    getCountry();
    fetchProfileDetails();

    // Cleanup function to prevent state updates after unmount
    return () => {
      setIsLoadingMore(false);
      setRefreshing(false);
    };
  }, []); // Empty dependency array - runs only on mount

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Reset pagination state
    setCurrentPage(1);
    setARMemories([]);
    setIsLoadingMore(false);
    onEndReachedCalledDuringMomentum.current = true; // Reset momentum flag

    // Fetch fresh data
    Promise.all([
      getProfieARMemories(),
      fetchARUserProfile(),
      getUserCollectedStar(),
      getRank(),
      getCountry(),
      fetchProfileDetails(),
    ]).finally(() => {
      setRefreshing(false);
    });
  }, []);

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

  const data = [
    // {id: 1, value: arProfile?.check_ins, property: "Sites Visited"},
    {id: 1, value: starsCount, property: "Stars"},
    {id: 2, value: arProfile?.challenge_completed, property: "AR Challenges"},
    {id: 3, value: 0, property: "Friends"},
    // { id: 5, value: 0, property: "Credits" },
    // { id: 6, value: 0, property: "Tokens" },
    // { id: 7, value: 0, property: "Rallies" },
    // { id: 8, value: countryCount, property: "Countries" },
  ];
  // Split the data into chunks of 3 for each row
  const rows = [];
  for (let i = 0; i < data.length; i += 3) {
    rows.push(data.slice(i, i + 3));
  }

  const onReportCloseClick = () => {
    setModalVisible(visible => !visible);
  };

  const onReportUser = (reportReason, issueDescripton = "") => {
    setModalVisible(false);
    const reportData = {
      reason: reportReason,
      custom_reason: issueDescripton,
      reported_user: userProfile?.id,
    };
    reportContentOrUser(reportData)
      .then(resposne => {
        if (resposne && resposne?.status === 1) {
          showMessage("User has been reported successfully");
        }
      })
      .catch(error => {
        showMessage("Error reporting user", "error");
      });
  };

  const profilePicture = getProfilePicture(userProfile?.user_profile?.image || "");
  const renderHeader = () => (
    <KeyboardAwareScrollView style={_styles.header}>
      <View style={_styles.avatarContainer}>
        <View
          style={{
            width: "100%",
            height: height * 0.13,
          }}
        />
        <Image
          style={{
            width: "100%",
            height: height * 0.4,
          }}
          source={{uri: profilePicture}}
          resizeMode="cover"
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
            <UserReportCard
              image={userProfile?.user_profile?.image ? true : false}
              name={userProfile?.name}
              email={userProfile?.email}
              reportAction={() => setModalVisible(true)}
              isVerified
            />
          </View>

          <Pressable style={_styles.removeBtnContainer} onPress={onRemoveFriendClick}>
            <AppText style={_styles.removeBtnText}>Remove Friend</AppText>
          </Pressable>
        </View>
        <View style={_styles.scoreboardContainer}>
          <AppText
            onPress={() => {
              navigation.navigate("TabNavigator", {screen: "Tab", params: {screen: "Scores"}});
            }}
            adjustsFontSizeToFit={true}
            numberOfLines={1}
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
        <ReportUserModal
          isVisible={modalVisible}
          onClose={onReportCloseClick}
          onReportUser={onReportUser}
        />
      </View>
    </KeyboardAwareScrollView>
  );

  const navigateToShare = (captureData: any, challengeObj: any, scan_picture: any) => {
    // @ts-ignore
    navigation.navigate("ArChallengeShare", {
      challengeObj: challengeObj,
      scan_picture: scan_picture,
      captureData,
      hideBottomTab: true,
      //       isMemory: true,
    });
  };

  const renderFooter = () => (
    <View style={_styles.scroll}>
      <TouchableOpacity style={_styles.headingView}>
        <AppText style={_styles.heading}>My AR Adventures</AppText>
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
      </TouchableOpacity>
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
          numColumns={3}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!onEndReachedCalledDuringMomentum.current) {
              lodeMoreData();
              onEndReachedCalledDuringMomentum.current = true;
            }
          }}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <MemoryContainer item={item} onPressAction={navigateToShare} showPrivacy={false} />
          )}
          keyExtractor={(item: any) => item?.id?.toString()}
        />
      )}
    </View>
  );

  const renderItem = ({item}) => (
    <BoxStatContainer key={item.id} boxId={item.id} value={item.value} property={item.property} />
  );

  const onRemoveConfirm = () => {
    // Call API to remove friend
    removeUserFromFriends(userProfile?.id)
      .then(resposne => {
        if (resposne && resposne.status === 1) {
          showMessage("Friend removed successfully");
          navigation.goBack();
        }
      })
      .catch(error => {
        showMessage("Error removing friend", "error");
      });
  };

  const onRemoveFriendClick = () => setConfirmationModalVisible(true);

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      {loading ? (
        <ScreenLoader style={{}} />
      ) : (
        <FlatList
          data={data}
          contentContainerStyle={_styles.container_style}
          keyExtractor={item => item.id.toString()}
          renderItem={() => null} // No rendering needed, using header/footer
          ListHeaderComponent={renderHeader}
          numColumns={3}
          ListFooterComponent={renderFooter}
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7a00cf"
              colors={["#7a00cf", "#5532ff"]}
              title="Pull to refresh"
              titleColor="#7a00cf"
              progressViewOffset={0}
            />
          }
        />
      )}
      <View style={_styles.blurView} pointerEvents="box-none">
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
          pointerEvents="none"
        />
        <AppHeader containerStyle={_styles.headerContainer} title={""} />
      </View>
      <ConfirmationPopUp
        title={"Remove Friend"}
        description={"Are you sure you want to remove this friend?"}
        confirmText={"Confirm"}
        confirmHandler={onRemoveConfirm}
        isVisible={confirmationModalVisible}
        cancelText={"Cancel"}
        cancelHandler={() => setConfirmationModalVisible(false)}
      />
    </BackgroundWithImage>
  );
};

export default PublicProfile;
