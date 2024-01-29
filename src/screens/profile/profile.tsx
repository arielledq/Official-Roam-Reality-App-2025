import React, { useCallback, useState } from "react"
import {
  FlatList,
  Image,
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
import { getProfieDetails } from "../../network"
import { useSelector } from "react-redux"
import { useFocusEffect, useNavigation } from "@react-navigation/native"

const Profile: ScreenStackComponent<RootStackParamList, "Profile"> = () => {
  const navigation = useNavigation()
  const _styles = useStyles()
  const userProfile = useSelector(state => state.login?.data?.user)
  const [profileDetails, setProfileDetails] = useState(null)

  const fetchProfileDetails = async () => {
    try {
      const details = await getProfieDetails({
        id: userProfile.user_profile.id
      })

      // Store the details in the state variable
      setProfileDetails(details)
    } catch (error) {
      console.error("Error fetching profile details: ", error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchProfileDetails()
    }, [])
  )

  const handleMenuButton = () => {
    return (
      <TouchableOpacity
        onPress={() => navigation.openDrawer()}
        style={_styles.menuIcon}>
        <MenuIcon />
      </TouchableOpacity>
    )
  }

  const data = [
    { id: 1, value: 50, property: "Sites Viewed" },
    { id: 2, value: 60, property: "Likes Received" },
    { id: 3, value: 40, property: "Comments Posted" },
    { id: 4, value: 75, property: "Photos Uploaded" },
    { id: 5, value: 55, property: "Friends Added" },
    { id: 6, value: 30, property: "Articles Read" },
    { id: 7, value: 80, property: "Messages Sent" },
    { id: 8, value: 65, property: "Logins This Month" }
  ]
  // Split the data into chunks of 3 for each row
  const rows = []
  for (let i = 0; i < data.length; i += 3) {
    rows.push(data.slice(i, i + 3))
  }
  const navigateToVerifyMail = email => {
    // navigation.navigate('EmailVerification', { email: email.toLowerCase() })
  }
  const renderHeader = () => (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled
      style={_styles.header}
    >
      <AppHeader
        containerStyle={_styles.headerContainer}
        titleStyle={_styles.headerStyle}
        title={"Profile"}
        leftComponent={handleMenuButton()}
      />
      <View style={_styles.avatarContainer}>
        {profileDetails?.image && (
          <Avatar
            size={405}
            source={{ uri: profileDetails.image }}
            avatarStyle={_styles.profileImage}
          />
        )}
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
        {!profileDetails?.image && (
          <View style={{ width: 405, height: 405, backgroundColor: "gray" }}>
            <AppText style={{ color: "white" }}>Image not available</AppText>
          </View>
        )}
        {/* Edit Profile button */}
        <AppButton
          customColors={["#7B16FF", "#1158F4"]}
          buttonStyle={_styles.editButton}
          containerStyle={_styles.editButtonContainer}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Icon name={"edit-2"} family="feather" color={"white"} size={16} />
          <AppText style={_styles.buttonText}>Edit Profile</AppText>
        </AppButton>
      </View>
      <View style={_styles.scroll}>
        <UserInfoCard
          name={profileDetails?.user.name}
          email={profileDetails?.user.email}
          verifyAction={() => navigateToVerifyMail(profileDetails?.user.email)}
          isVerified={profileDetails?.user.user_profile.is_verified}
        />

        <AppText style={_styles.scoreboard}>SCOREBOARD</AppText>
        <View style={_styles.statContainerStyle}>
          <StatContainer value={"178/1000"} property={"Global Rank"} />
          <StatContainer value={"23"} property={"Points"} />
          <StatContainer value={"23"} property={"TT Rank"} />
        </View>
      </View>
    </KeyboardAwareScrollView>
  )

  const renderFooter = () => (
    <View style={_styles.scroll}>
      <TouchableOpacity style={_styles.headingView}>
        <AppText style={_styles.heading}>Player AR Memories</AppText>
        <View style={_styles.arrow_3}>
          <Image source={Images.ForwardIcon} />
        </View>
      </TouchableOpacity>
      <View style={{ marginHorizontal: -22 }}>
        <FlatList
          contentContainerStyle={{ marginBottom: 50 }}
          data={data}
          horizontal={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <MemoryContainer title={"Title"} description={"description"} image={""} />
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
      <FlatList
        data={data}
        // contentContainerStyle={_styles.scroll}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        numColumns={3}
        ListFooterComponent={renderFooter}
        nestedScrollEnabled={false}
      />
    </BackgroundWithImage>
  )
}

export default Profile
