import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  Text,
  View,
  Pressable,
  ImageBackground,
} from "react-native"
import { AppHeader, AppInput } from "../../components"
import { FlatList } from "react-native-gesture-handler"
import useStyles from "./styles"
import theme from "../../assets/theme"
import { getARProfile, getGeoARDestinations, getProfieDetails, searchUsers, sendFriendRequest } from "../../network"
import FastImage from "react-native-fast-image"
import Images from "../../assets/images"
import { useDispatch, useSelector } from "react-redux"
import BackgroundWithImage from "../../components/background"
import { updateARUserData } from "../../redux/AR"
import RankBG from "../../assets/geoar/rank_bg.svg"
import { isLocationPointInPolygon } from "../../util/LocationLib"



const ScoreBoard = ({
}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [filteredUsers, setFilteredUsers] = React.useState([])
  const [allUsers, setAllUsers] = React.useState([])
  const userProfile = useSelector(state => state.login?.data?.user)
  const arProfile = useSelector(state => state.ar?.arProfile)
  const [profileDetails, setProfileDetails] = useState(null)
  const [rankMine, setRankMine] = useState(null)
  const [destinationData, setDestinationData] = useState([])
  const [selectedDestination, setSelectedDestination] = useState(null)
  const desRef = useRef();

  const fetchUsers = () => {
    const payload = {
      search: ''
    }
    searchUsers(payload).then(response => {
      if (response) {
        if (response?.data?.length > 0) {
          let arProfiles = response?.data.filter(a => a.user_ar_profile)
          arProfiles = arProfiles.filter(a => a.name)
          if (arProfile && userProfile) {
            userProfile.user_ar_profile = arProfile
            arProfiles.push(userProfile)
          }
          const aa = arProfiles.sort((a, b) => b?.user_ar_profile?.points - a?.user_ar_profile?.points)
          for (var i = 0; i < aa.length; i++) {
            aa[i].rank = (i + 1)
            if (aa[i].id == userProfile.id) {
              setRankMine((i + 1))
            }
          }
          setFilteredUsers(aa)
          setAllUsers(aa)
        }
      }
    })
  }

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
      ).finally(() => setIsLoading(false))

    } catch (error) {
      console.error('Error', "Error fetching profile details: ")
    }
  }

  const ARDestinations = () => {
    setIsLoading(true)
    getGeoARDestinations()
      .then(res => {
        if (res.status == 1) {
          setDestinationData(res.data)
        } else {
          res.message.message = "Error in loading Destinations."
          handleError(res)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const fetchARUserProfile = () => {
    getARProfile().then((res) => {
      if (res.status == 1) {
        dispatch(updateARUserData(res))
      }
    }).finally(() => {
    })
  }

  React.useEffect(() => {
    fetchProfileDetails();
    fetchUsers()
    fetchARUserProfile()
    ARDestinations()
  }, [])

  const myRank = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <RankBG style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ marginStart: 10, alignItems: 'center' }}>
            <Text style={_styles.rankText}>Rank</Text>
            <Text style={_styles.rankTextNumber}>{rankMine}</Text>
          </View>
          <ImageBackground
            source={Images.BGBlur}
            style={{
              width: 80,
              aspectRatio: 1,
              justifyContent: "center",
              alignItems: "center"
            }}
            resizeMode="stretch"
          >
            <FastImage
              style={{
                width: 40,
                aspectRatio: 1,
                borderRadius: 5,
                height: 40
              }}
              source={{ uri: profileDetails?.image }}
              resizeMode={FastImage.resizeMode.cover}
            />
          </ImageBackground>
          <Text numberOfLines={2} style={_styles.nameText}>{userProfile?.name.replace(" ", "\n")}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={_styles.rankText}>Site Visited</Text>
          <Text style={_styles.rankTextNumber}>{arProfile.check_ins}</Text>
        </View>
        <View style={{ marginEnd: 10, alignItems: 'center' }}>
          <Text style={_styles.rankText}>Points</Text>
          <Text style={_styles.rankTextNumber}>{arProfile.points}</Text>
        </View>
      </View>)
  }

  const getAllPoints = (destination) => {
    const arrayPoints = []
    if (destination?.border?.coordinates) {
      for (i = 0; i < destination.border.coordinates.length; i++) {
        const points = destination.border.coordinates[i];
        for (j = 0; j < points.length; j++) {
          const point = points[j]
          arrayPoints.push({ latitude: point[1], longitude: point[0] })
        }
      }
      return arrayPoints;
    }
    return null;
  }

  const filterDestinations = (o, index) => {
    setSelectedDestination(o)
    desRef?.current?.scrollToIndex({
      animated: true,
      index: index,
    });
    const destinationPoints = getAllPoints(o);
    if (destinationPoints) {
      const filterUserWithDes = []
      for (let i = 0; i < allUsers.length; i++) {
        const userCheck = allUsers[i];
        if (userCheck.user_ar_profile && userCheck.user_ar_profile?.current_location) {
          const pointUser = {
            latitude: userCheck.user_ar_profile?.current_location.coordinates[1],
            longitude: userCheck.user_ar_profile?.current_location.coordinates[0]
          }
          const isInsideSiteArea = isLocationPointInPolygon(pointUser, destinationPoints)
          console.log("filterDestinations", userCheck.user_ar_profile?.current_location, isInsideSiteArea)
          if (isInsideSiteArea) {
            filterUserWithDes.push(userCheck)
          }
        }
        setFilteredUsers(filterUserWithDes)
      }
    }
  }

  const DestinationItem = ({ obj, index }) => (
    <Pressable onPress={() => filterDestinations(obj, index)} style={{
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      borderRadius: 100,
      backgroundColor: "",
      borderColor: "#9003E0",
      backgroundColor: "#323250",
      paddingHorizontal: 8,
      marginHorizontal: 5,
      borderWidth: obj.id == selectedDestination?.id ? 1 : 0
    }}>
      <FastImage
        style={{
          width: 40,
          aspectRatio: 1,
          borderRadius: 5,
          height: 40,
          borderRadius: 100,
          overflow: 'hidden',
          marginEnd: 8
        }}
        source={{ uri: obj?.flag_image }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View>
        <Text style={_styles.destinationText}>{obj.name}</Text>
        <Text style={_styles.destinationText}>Scoreboard</Text>
      </View>
    </Pressable>
  )

  const Item = ({ obj }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#131422', borderRadius: 12, marginVertical: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ marginStart: 10, alignItems: 'center' }}>
          <Text style={_styles.rankText}>Rank</Text>
          <Text style={_styles.rankTextNumber}>{obj.rank}</Text>
        </View>
        <ImageBackground
          source={Images.BGBlur}
          style={{
            width: 80,
            aspectRatio: 1,
            justifyContent: "center",
            alignItems: "center"
          }}
          resizeMode="stretch"
        >
          <FastImage
            style={{
              width: 40,
              aspectRatio: 1,
              borderRadius: 5,
              height: 40
            }}
            source={{ uri: obj?.user_profile?.image }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </ImageBackground>
        <Text numberOfLines={2} style={_styles.nameText}>{obj?.name?.replace(" ", "\n")}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text style={_styles.rankText}>Site Visited</Text>
        <Text style={_styles.rankTextNumber}>{obj?.user_ar_profile?.check_ins}</Text>
      </View>
      <View style={{ marginEnd: 10, alignItems: 'center' }}>
        <Text style={_styles.rankText}>Points</Text>
        <Text style={_styles.rankTextNumber}>{obj?.user_ar_profile?.points}</Text>
      </View>
    </View>
  );

  return (
    <BackgroundWithImage style={_styles.mainContainer}>
      <AppHeader
        centerComponent={{
          text: 'Scoreboard',
          style: [_styles.heading],
        }} backgroundColor="transparent" />
      <View style={{ height: 50 }}>
        <FlatList horizontal
          ref={desRef}
          data={destinationData}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => <DestinationItem index={index} obj={item} />} />
      </View>
      <Text style={_styles.subTitle}>Your rank</Text>
      {myRank()}
      <Text style={_styles.subTitle}>Leaderboard</Text>
      <FlatList
        style={{ flex: 1, marginVertical: 15 }}
        data={filteredUsers}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <Item obj={item} />}
        keyExtractor={item => item.id}
      />
    </BackgroundWithImage>
  )
}

export default ScoreBoard