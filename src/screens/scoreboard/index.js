import React, { useCallback, useEffect, useState } from "react"
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
import { getARProfile, getProfieDetails, searchUsers, sendFriendRequest } from "../../network"
import FastImage from "react-native-fast-image"
import Images from "../../assets/images"
import { useDispatch, useSelector } from "react-redux"
import BackgroundWithImage from "../../components/background"
import { updateARUserData } from "../../redux/AR"
import RankBG from "../../assets/geoar/rank_bg.svg"



const ScoreBoard = ({
}) => {
  const _styles = useStyles()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [filteredUsers, setFilteredUsers] = React.useState([])
  const userProfile = useSelector(state => state.login?.data?.user)
  const arProfile = useSelector(state => state.ar?.arProfile)
  const [profileDetails, setProfileDetails] = useState(null)
  const [rankMine, setRankMine] = useState(null)
  const [loading, setloading] = useState(true)

  const fetchUsers = () => {
    const payload = {
      search: ''
    }
    searchUsers(payload).then(response => {
      if (response) {
        if (response?.data?.length > 0) {
          let arProfiles = response?.data.filter(a => a.user_ar_profile)
          arProfiles = arProfiles.filter(a => a.name)
          if(arProfile && userProfile){
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

  React.useEffect(() => {
    fetchProfileDetails();
    fetchUsers()
    fetchARUserProfile()
  }, [])

  const renderFriendItem = (item, onAddFriendClick, styles) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: theme.lightColors?.inputBG,
          paddingRight: 20,
          borderRadius: 10,
          marginVertical: 5,
          flex: 1
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            flex: 0.9
          }}
        >
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
                width: 30,
                aspectRatio: 1,
                borderRadius: 5
              }}
              source={{ uri: item?.user_profile?.image }}
              resizeMode={FastImage.resizeMode.cover}
            />
          </ImageBackground>
          <View>
            <Text style={_styles.title}>{item.name}</Text>
            <Text
              style={[_styles.subTitle, { marginVertical: 5, maxWidth: 180 }]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {item.email}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => onAddFriendClick(item)}
          style={{ marginLeft: 10 }}
        >
          <Text style={_styles.addButton}>Add as friend</Text>
        </Pressable>
      </View>
    )
  }

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