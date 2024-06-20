import React, { useCallback, useEffect, useState } from "react"
import {
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
// import { handleErrorMessage } from '../../util/util';
import BackgroundWithImage from "../../components/background"
import AppHeader from "../../components/header"
import { MenuIcon } from "../../assets/svg"
import UserInfoCard from "../../components/userInfoCard"
import { Avatar } from "@rneui/base"
import { AppButton, AppText } from "../../components"
import StatContainer from "../../components/statContainer"
import BoxStatContainer from "../../components/boxStatContainer"
import Images from "../../assets/images"
import MemoryContainer from "../../components/memoryContainer"
import Icon from "../../components/Icon"
import LinearGradient from "react-native-linear-gradient"
import { getARProfile, getProfieARMemoriesAPI, getProfieDetails, sendCode } from "../../network"
import { useDispatch, useSelector } from "react-redux"
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native"
import FastImage from 'react-native-fast-image'
import { heightPercentageToDP, widthPercentageToDP } from "react-native-responsive-screen"
import { height, width } from "../../util/AppDimensions"
import ScreenLoader from "../../components/screenLoader"
import { updateARUserData } from "../../redux/AR"
import { BlurView } from "@react-native-community/blur";

const PublicProfile: ScreenStackComponent<RootStackParamList, "Profile"> = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const _styles = useStyles()
  const dispatch = useDispatch()
  const userProfile = route?.params?.userData;
  const [profileDetails, setProfileDetails] = useState(null)
  const [arMemories, setARMemories] = useState([])
  const [loading, setloading] = useState(true)
  const arProfile = useSelector(state => state.ar?.arProfile)
  const [isTransitioning, setIsTransitioning] = useState(true)

  console.log("userProfile:",userProfile)
  console.log("userProfile: user",userProfile?.user)
  console.log("userProfile: userProfile?.user.image",userProfile?.image)
  

  const fetchProfileDetails = async () => {
    try {
      getProfieDetails({
        id: userProfile.user_profile.id
      }).then(res => {
        if (res.status == 1) {
          setProfileDetails(res)
        } else {
          console.error('Error', "Error fetching profile details: ")
        }
      }).catch(err => {
        console.error('Error', "Error fetching profile details: ")
      }
      ).finally(() => setloading(false))

    } catch (error) {
      console.error('Error', "Error fetching profile details: ")
    }
  }

  const fetchARUserProfile = () => {
    getARProfile().then((res) => {
      if (res.status == 1) {
        dispatch(updateARUserData(res))
      }
    }).finally(() => {
    })
  }


  const getProfieARMemories = async () => {
    try {
      getProfieARMemoriesAPI().then(res => {
        if (res.status == 1) {
          setARMemories(res.data)
        } else {
          console.error('Error', "Error fetching ar memories: ")
        }
      }).catch(err => {
        console.error('Error', "Error fetching ar memories: ")
      }
      ).finally(() => setloading(false))

    } catch (error) {
      console.error('Error', "Error fetching ar memories: ")
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


  const handleMenuButton = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          setIsTransitioning(true)
          navigation.openDrawer()
        }}
        style={_styles.menuIcon}>
        <MenuIcon />
      </TouchableOpacity>
    )
  }

  const data = [
    { id: 1, value: 0, property: "Sites Visited" },
    { id: 2, value: 0, property: "Stars" },
    { id: 3, value: arProfile?.challenge_completed, property: "AR Challenges" },
    { id: 4, value: 0, property: "Friends" },
    { id: 5, value: 0, property: "Credits" },
    { id: 6, value: 0, property: "Tokens" },
    { id: 7, value: 0, property: "Rallies" },
    { id: 8, value: 0, property: "Countries" },

  ]
  // Split the data into chunks of 3 for each row
  const rows = []
  for (let i = 0; i < data.length; i += 3) {
    rows.push(data.slice(i, i + 3))
  }
  const navigateToVerifyMail = email => {
    sendCode({ email: email.toLowerCase() })
    setIsTransitioning(true)
    navigation.navigate('EmailVerificationC', { email: email.toLowerCase(), profile: true })
  }
  const renderHeader = () => (
    <KeyboardAwareScrollView
      style={_styles.header}
    >
      {userProfile?.image &&
        <View style={_styles.avatarContainer}>
          <FastImage
            style={{
              width: '100%',
              height: height * 0.5,
            }}
            source={{ uri: userProfile?.image }}
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
      }
      <View style={_styles.scroll}>
        <UserInfoCard
          image={userProfile?.image ? true : false}
          name={userProfile?.user.name}
          email={userProfile?.user.email}
          verifyAction={() => navigateToVerifyMail(userProfile?.user.email)}
          isVerified={profileDetails?.user.user_profile.is_verified}
        />
        <View style={_styles.scoreboardContainer}>
          <AppText
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            style={_styles.scoreboard}>SCOREBOARD</AppText>
        </View>
        <View style={_styles.statContainerStyle}>
          <StatContainer value={"0"} property={"Global Rank"} />
          <StatContainer value={arProfile?.points} property={"Points"} />
          <StatContainer value={"0"} property={"TT Rank"} />
        </View>
      </View>
    </KeyboardAwareScrollView>
  )

  const navigateToShare = (captureData, challengeObj) => {
    navigation.navigate("ArChallengeShare", { challengeObj: challengeObj, captureData, hideBottomTab: true });
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
            <MemoryContainer onPressAction={navigateToShare} title={"Title"} item={item} description={"description"} image={""} />
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

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      {loading ? <ScreenLoader /> : <FlatList
        data={data}
        contentContainerStyle={_styles.container_style}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        numColumns={3}
        ListFooterComponent={renderFooter}
        nestedScrollEnabled={false}
      />}
      <View style={_styles.blurView}>
        <BlurView blurType="light" overlayColor='#00000050' enabled={!isTransitioning}>
          <AppHeader
            containerStyle={_styles.headerContainer}
            title={""}
            rightComponent={
            <Pressable style={_styles.removeBtnContainer}>
              <AppText style={_styles.removeBtnText}>Remove Friend</AppText>
            </Pressable>}
          />
        </BlurView>
      </View>
    </BackgroundWithImage>
  )
}

export default PublicProfile
