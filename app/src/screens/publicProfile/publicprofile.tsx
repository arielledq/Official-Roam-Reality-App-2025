import React, {useCallback, useState} from "react";
import {FlatList, Image, Pressable, TouchableOpacity, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import useStyles from "./styles";
import {RootStackParamList, ScreenStackComponent} from "../../constants/types";
import BackgroundWithImage from "../../components/background";
import AppHeader from "../../components/header";
import {AppText} from "../../components";
import StatContainer from "../../components/statContainer";
import BoxStatContainer from "../../components/boxStatContainer";
import Images from "../../assets/images";
import MemoryContainer from "../../components/memoryContainer";
import LinearGradient from "react-native-linear-gradient";
import {
  getCountryCount,
  getPublicARProfile,
  getPublicProfieARMemoriesAPI,
  getUserCollectedStarCount,
  getUserRankCount,
  removeUserFromFriends,
  reportContentOrUser,
} from "../../network";
import {useDispatch} from "react-redux";
import {useFocusEffect, useNavigation, useRoute} from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import {height} from "../../util/AppDimensions";
import ScreenLoader from "../../components/screenLoader";
import {BlurView} from "@react-native-community/blur";
import UserReportCard from "../../components/userInfoCard";
import ReportUserModal from "../reportUser/ReportUser";
import {showMessage} from "../../util/helpers";
import ConfirmationPopUp from "../../components/confirmationPopUp";
import {getProfilePicture} from "util/imageUtils";

const PublicProfile: ScreenStackComponent<RootStackParamList, "PublicProfile"> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const _styles = useStyles();
  const dispatch = useDispatch();
  const userProfile = route?.params?.userData;
  const [arMemories, setARMemories] = useState([]);
  const [loading, setloading] = useState(true);
  const [arProfile, updateARUserData] = useState({});
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
      getPublicProfieARMemoriesAPI(userProfile?.id)
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
        <Image
          style={{
            width: "100%",
            height: height * 0.5,
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
        <UserReportCard
          image={userProfile?.user_profile?.image ? true : false}
          name={userProfile?.name}
          email={userProfile?.email}
          reportAction={() => setModalVisible(true)}
          isVerified
        />
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
          <StatContainer value={"" + globalRank} property={"Global Rank"} />
          <StatContainer value={arProfile?.points} property={"Points"} />
          <StatContainer value={arProfile?.check_ins} property={"Sites Visited"} />
        </View>
        <ReportUserModal
          isVisible={modalVisible}
          onClose={onReportCloseClick}
          onReportUser={onReportUser}
        />
      </View>
    </KeyboardAwareScrollView>
  );

  const navigateToShare = (captureData, challengeObj) => {
    navigation.navigate("ArChallengeShare", {
      challengeObj: challengeObj,
      captureData,
      hideBottomTab: true,
    });
  };

  const renderFooter = () => (
    <View style={_styles.scroll}>
      <TouchableOpacity style={_styles.headingView}>
        <AppText style={_styles.heading}>My AR Adventures</AppText>
        <View>
          <Image source={Images.ForwardIcon} />
        </View>
      </TouchableOpacity>
      <View style={{marginHorizontal: -22}}>
        <FlatList
          contentContainerStyle={{marginBottom: 50}}
          data={arMemories}
          horizontal={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => <MemoryContainer onPressAction={navigateToShare} item={item} />}
          keyExtractor={item => item.id.toString()}
        />
      </View>
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
        <ScreenLoader />
      ) : (
        <FlatList
          data={data}
          contentContainerStyle={_styles.container_style}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          numColumns={3}
          ListFooterComponent={renderFooter}
          nestedScrollEnabled={false}
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
          title={""}
          rightComponent={
            <Pressable style={_styles.removeBtnContainer} onPress={onRemoveFriendClick}>
              <AppText style={_styles.removeBtnText}>Remove Friend</AppText>
            </Pressable>
          }
        />
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
