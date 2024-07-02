import React, { useCallback, useEffect, useState } from "react"
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  TouchableOpacity,
  View
} from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import useStyles from "./styles"
import {
  RootStackParamList,
  ScreenStackComponent
} from "../../navigation/types"
import BackgroundWithImage from "../../components/background"
import AppHeader from "../../components/header"
import { MenuIcon } from "../../assets/svg"
import { AppText } from "../../components"
import StatContainer from "../../components/statContainer"
import BoxStatContainer from "../../components/boxStatContainer"
import Images from "../../assets/images"
import MemoryContainer from "../../components/memoryContainer"
import LinearGradient from "react-native-linear-gradient"
import {
  getPublicARProfile,
  getPublicProfieARMemoriesAPI,
  removeUserFromFriends,
  reportContentOrUser,
  sendCode
} from "../../network"
import { useDispatch, useSelector } from "react-redux"
import {
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native"
import FastImage from "react-native-fast-image"
import { height } from "../../util/AppDimensions"
import ScreenLoader from "../../components/screenLoader"
import { BlurView } from "@react-native-community/blur"
import UserReportCard from "../../components/userInfoCard"
import ReportUserModal from "../reportUser/ReportUser"

const PublicProfile: ScreenStackComponent<
  RootStackParamList,
  "Profile"
> = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const _styles = useStyles()
  const dispatch = useDispatch()
  const userProfile = route?.params?.userData
  const [arMemories, setARMemories] = useState([])
  const [loading, setloading] = useState(true)
  const [arProfile, updateARUserData] = useState({})
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)

  const fetchARUserProfile = () => {
    getPublicARProfile(userProfile?.user_profile?.id)
      .then(res => {
        if (res.status == 1) {
          updateARUserData(res)
        }
      })
      .finally(() => {})
  }

  const getProfieARMemories = async () => {
    try {
      getPublicProfieARMemoriesAPI(userProfile?.user_profile?.id)
        .then(res => {
          if (res.status == 1) {
            setARMemories(res.data)
          } else {
            console.error("Error", "Error fetching ar memories: ")
          }
        })
        .catch(err => {
          console.error("Error", "Error fetching ar memories: ")
        })
        .finally(() => setloading(false))
    } catch (error) {
      console.error("Error", "Error fetching ar memories: ")
    }
  }

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        setIsTransitioning(false)
      }, 500)
      getProfieARMemories()
      fetchARUserProfile()
    }, [])
  )

  const data = [
    { id: 1, value: 0, property: "Sites Visited" },
    { id: 2, value: 0, property: "Stars" },
    { id: 3, value: arProfile?.challenge_completed, property: "AR Challenges" },
    { id: 4, value: 0, property: "Friends" },
    { id: 5, value: 0, property: "Credits" },
    { id: 6, value: 0, property: "Tokens" },
    { id: 7, value: 0, property: "Rallies" },
    { id: 8, value: 0, property: "Countries" }
  ]
  // Split the data into chunks of 3 for each row
  const rows = []
  for (let i = 0; i < data.length; i += 3) {
    rows.push(data.slice(i, i + 3))
  }

  const onReportCloseClick = () => {
    setModalVisible(visible => !visible)
  }

  const onReportUser = (reportReason, issueDescripton = "") => {
    setModalVisible(false)
    const reportData = {
      reason: reportReason,
      custom_reason: issueDescripton,
      report_user: userProfile?.user_profile?.id
    }
    reportContentOrUser(reportData)
      .then(resposne => {
        if (resposne && resposne?.status === 1) {
          Alert.alert("Reported", "User has been reported successfully")
        }
      })
      .catch(error => {
        console.error("Error", "Error reporting user")
      })
  }

  const renderHeader = () => (
    <KeyboardAwareScrollView style={_styles.header}>
      {userProfile?.user_profile?.image && (
        <View style={_styles.avatarContainer}>
          <FastImage
            style={{
              width: "100%",
              height: height * 0.5
            }}
            source={{ uri: userProfile?.user_profile?.image }}
            resizeMode={FastImage.resizeMode.cover}
          />
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
              zIndex: 1
            }}
          />
        </View>
      )}
      <View style={_styles.scroll}>
        <UserReportCard
          image={userProfile?.user_profile?.image ? true : false}
          name={userProfile?.name}
          email={userProfile?.email}
          reportAction={() => setModalVisible(true)}
        />
        <View style={_styles.scoreboardContainer}>
          <AppText
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            onPress={()=>navigation.navigate("ScoreBoard")}
            style={_styles.scoreboard}
          >
            SCOREBOARD
          </AppText>
        </View>
        <View style={_styles.statContainerStyle}>
          <StatContainer value={"0"} property={"Global Rank"} />
          <StatContainer value={arProfile?.points} property={"Points"} />
          <StatContainer value={"0"} property={"TT Rank"} />
        </View>
        <ReportUserModal
          isVisible={modalVisible}
          onClose={onReportCloseClick}
          onReportUser={onReportUser}
        />
      </View>
    </KeyboardAwareScrollView>
  )

  const navigateToShare = (captureData, challengeObj) => {
    navigation.navigate("ArChallengeShare", {
      challengeObj: challengeObj,
      captureData,
      hideBottomTab: true
    })
  }

  const renderFooter = () => (
    <View style={_styles.scroll}>
      <TouchableOpacity style={_styles.headingView}>
        <AppText style={_styles.heading}>MY AR Adventures</AppText>
        <View style={_styles.arrow_3}>
          <Image source={Images.ForwardIcon} />
        </View>
      </TouchableOpacity>
      <View style={{ marginHorizontal: -22 }}>
        <FlatList
          contentContainerStyle={{ marginBottom: 50 }}
          data={arMemories}
          horizontal={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <MemoryContainer
              onPressAction={navigateToShare}
              title={"Title"}
              item={item}
              description={"description"}
              image={""}
            />
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    </View>
  )

  const renderItem = ({ item }) => (
    <BoxStatContainer
      key={item.id}
      boxId={item.id}
      value={item.value}
      property={item.property}
    />
  )

  const onRemoveConfirm = () => {
    // Call API to remove friend
    removeUserFromFriends(userProfile?.id)
      .then(resposne => {
        if (resposne && resposne.status === 1) {
          console.log("removeUserFromFriends", resposne)
          Alert.alert("Success", "Friend removed successfully", [
            {
              text: "OK",
              onPress: () => {
                navigation.goBack()
              }
            }
          ])
        }
      })
      .catch(error => {
        Alert.alert("Error", "Error removing friend")
      })
  }

  const onRemoveFriendClick = () => {
    // Prompt user wether they really want to unfriend
    Alert.alert(
      "Remove Friend",
      "Are you sure you want to remove this friend?",
      [
        {
          text: "Yes",
          onPress: () => {
            // Call API to remove friend
            onRemoveConfirm()
          }
        },
        {
          text: "No",
          onPress: () => {}
        }
      ]
    )
  }

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
        >
          <AppHeader
            containerStyle={_styles.headerContainer}
            title={""}
            rightComponent={
              <Pressable
                style={_styles.removeBtnContainer}
                onPress={onRemoveFriendClick}
              >
                <AppText style={_styles.removeBtnText}>Remove Friend</AppText>
              </Pressable>
            }
          />
        </BlurView>
      </View>
    </BackgroundWithImage>
  )
}

export default PublicProfile
