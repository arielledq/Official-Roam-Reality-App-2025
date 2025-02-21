import React, { useRef, useState } from "react";
import { Text, View, ImageBackground, TouchableOpacity, ActivityIndicator } from "react-native";

import { FlatList } from "react-native-gesture-handler";
import FastImage from "react-native-fast-image";
import { useDispatch, useSelector } from "react-redux";
import { DrawerActions, useNavigation } from "@react-navigation/native";

import { getARProfile, getGeoARDestinations, getProfieDetails, searchUsers } from "../../network";
import { isLocationPointInPolygon } from "../../util/LocationLib";
import { handleError } from "util/helpers";
import { updateARUserData } from "../../redux/AR";

import { AppHeader } from "../../components";
import ScreenContainer from "components/ScreenContainer";

import useStyles from "./styles";

import Images from "../../assets/images";
// @ts-ignore
import RankBG from "../../assets/geoar/rank_bg.svg";
import { MenuIcon } from "assets/svg";

const ScoreBoard = ({}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = React.useState<[]>([]);
  const [allUsers, setAllUsers] = React.useState([]);
  const [profileDetails, setProfileDetails] = useState<any>(null);
  const [rankMine, setRankMine] = useState<number | null>(null);
  const [destinationData, setDestinationData] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);

  const _styles = useStyles();
  const dispatch = useDispatch();
  const desRef = useRef();
  const navigation = useNavigation();

  const userProfile = useSelector((state: any) => state?.login?.data?.user);
  const arProfile = useSelector((state: any) => state?.ar?.arProfile);

  const fetchUsers = (userId: number) => {
    const payload = {
      search: "",
    };
    searchUsers(payload).then(response => {
      if (response) {
        if (response?.data?.length > 0) {
          let arProfiles = response?.data.filter((a: any) => a?.user_ar_profile);
          arProfiles = arProfiles.filter((a: any) => a?.name);
          if (arProfile && userProfile) {
            arProfiles.push(userProfile);
          }
          const aa = arProfiles.sort(
            (a: any, b: any) => b?.user_ar_profile?.points - a?.user_ar_profile?.points
          );
          for (var i = 0; i < aa.length; i++) {
            aa[i].rank = i + 1;
            if (aa[i].id == userId) {
              setRankMine(i + 1);
            }
          }
          setFilteredUsers(aa);
          setAllUsers(aa);
        }
      }
    });
  };

  const fetchProfileDetails = async (userProfileId: number) => {
    try {
      getProfieDetails({
        id: userProfileId,
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
        .finally(() => setIsLoading(false));
    } catch (error) {
      console.error("Error", "Error fetching profile details: ");
    }
  };

  const ARDestinations = () => {
    setIsLoading(true);
    getGeoARDestinations()
      .then(res => {
        if (res.status == 1) {
          setDestinationData(res.data);
        } else {
          res.message.message = "Error in loading Destinations.";
          handleError(res);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
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

  const getAllPoints = (destination: any) => {
    const arrayPoints = [];
    if (destination?.border?.coordinates) {
      for (let i = 0; i < destination.border.coordinates.length; i++) {
        const points = destination.border.coordinates[i];
        for (let j = 0; j < points.length; j++) {
          const point = points[j];
          arrayPoints.push({ latitude: point[1], longitude: point[0] });
        }
      }
      return arrayPoints;
    }
    return null;
  };

  const filterDestinations = (o: any, index: number) => {
    setSelectedDestination(o);
    // @ts-ignore
    desRef?.current?.scrollToIndex({
      animated: true,
      index: index,
    });
    const destinationPoints = getAllPoints(o);
    if (destinationPoints) {
      const filterUserWithDes = [];
      let count = 1;
      for (let i = 0; i < allUsers.length; i++) {
        let userCheck: any = allUsers[i];
        if (
          userCheck?.user_ar_profile &&
          userCheck?.user_ar_profile?.current_location?.coordinates?.length > 0
        ) {
          const pointUser = {
            latitude: userCheck?.user_ar_profile?.current_location?.coordinates[1],
            longitude: userCheck?.user_ar_profile?.current_location?.coordinates[0],
          };

          const isInsideSiteArea = isLocationPointInPolygon(pointUser, destinationPoints);
          if (isInsideSiteArea) {
            userCheck.rank = count;
            filterUserWithDes.push(userCheck);
            count++;
          }
        }
        // @ts-ignore
        setFilteredUsers(filterUserWithDes);
      }
    }
  };

  const DestinationItem = ({ obj, index }: { obj: any; index: number }) => (
    <View
      // TODO: Temporarily disabled (Pressable) - 2025-02-21
      // onPress={() => filterDestinations(obj, index)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: 48,
        borderRadius: 100,
        borderColor: "#9003E0",
        backgroundColor: "#323250",
        paddingHorizontal: 8,
        marginHorizontal: 5,
        borderWidth: obj.id == selectedDestination?.id ? 1 : 0,
      }}
    >
      <FastImage
        style={{
          width: 40,
          aspectRatio: 1,
          height: 40,
          borderRadius: 100,
          overflow: "hidden",
          marginEnd: 8,
        }}
        source={{ uri: obj?.flag_image }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View>
        <Text style={_styles.destinationText}>{obj?.name}</Text>
        <Text style={_styles.destinationText}>Scoreboard</Text>
      </View>
    </View>
  );

  const Item = ({ obj }: { obj: any }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#131422",
          borderRadius: 12,
          marginVertical: 4,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ marginStart: 10, alignItems: "center" }}>
            <Text style={_styles.rankText}>Rank</Text>
            <Text style={_styles.rankTextNumber}>{obj?.rank}</Text>
          </View>
          <ImageBackground
            source={Images.BGBlur}
            style={{
              width: 80,
              aspectRatio: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            resizeMode="stretch"
          >
            <FastImage
              style={{
                width: 40,
                aspectRatio: 1,
                borderRadius: 5,
                height: 40,
              }}
              source={{ uri: obj?.user_profile?.image }}
              resizeMode={FastImage.resizeMode.cover}
            />
          </ImageBackground>
          <Text numberOfLines={2} style={_styles.nameText}>
            {obj?.name?.replace(" ", "\n")}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={_styles.rankText}>Site Visited</Text>
          <Text style={_styles.rankTextNumber}>{obj?.user_ar_profile?.check_ins}</Text>
        </View>
        <View style={{ marginEnd: 10, alignItems: "center" }}>
          <Text style={_styles.rankText}>Points</Text>
          <Text style={_styles.rankTextNumber}>{obj?.user_ar_profile?.points}</Text>
        </View>
      </View>
    );
  };

  const handleMenuButton = () => {
    return (
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
        style={{ paddingLeft: 5 }}
      >
        <MenuIcon />
      </TouchableOpacity>
    );
  };

  const myRank = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <RankBG style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} />
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ marginStart: 10, alignItems: "center" }}>
            <Text style={_styles.rankText}>Rank</Text>
            <Text style={_styles.rankTextNumber}>{rankMine}</Text>
          </View>
          <ImageBackground
            source={Images.BGBlur}
            style={{
              width: 80,
              aspectRatio: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            resizeMode="stretch"
          >
            <FastImage
              style={{
                width: 40,
                aspectRatio: 1,
                borderRadius: 5,
                height: 40,
              }}
              source={{ uri: profileDetails?.image }}
              resizeMode={FastImage.resizeMode.cover}
            />
          </ImageBackground>
          <Text numberOfLines={2} style={_styles.nameText}>
            {userProfile?.name ? userProfile?.name?.replace(" ", "\n") : "You"}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={_styles.rankText}>Site Visited</Text>
          <Text style={_styles.rankTextNumber}>{arProfile?.check_ins}</Text>
        </View>
        <View style={{ marginEnd: 10, alignItems: "center" }}>
          <Text style={_styles.rankText}>Points</Text>
          <Text style={_styles.rankTextNumber}>{arProfile?.points}</Text>
        </View>
      </View>
    );
  };

  React.useEffect(() => {
    ARDestinations();
    fetchARUserProfile();
  }, []);

  React.useEffect(() => {
    const userId = userProfile?.id;
    if (userId) {
      fetchUsers(userId);
    }

    const userProfileId = userProfile?.user_profile?.id;
    if (userProfileId) {
      fetchProfileDetails(userProfileId);
    }
  }, [userProfile]);

  return (
    <ScreenContainer>
      <>
        <AppHeader
          leftComponent={handleMenuButton()}
          centerComponent={{
            text: "Scoreboard",
            style: [_styles.heading],
          }}
          backgroundColor="transparent"
          isBottomTab
        />
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <>
            <View style={{ height: 50 }}>
              <FlatList
                horizontal
                // @ts-ignore
                ref={desRef}
                data={destinationData}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => <DestinationItem index={index} obj={item} />}
              />
            </View>
            <Text style={_styles.subTitle}>Your rank</Text>
            {myRank()}
            <Text style={_styles.subTitle}>Leaderboard</Text>
            <FlatList
              style={{ flex: 1, marginTop: 15 }}
              data={filteredUsers}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <Item obj={item} />}
              keyExtractor={(item: any) => item?.id}
            />
          </>
        )}
      </>
    </ScreenContainer>
  );
};

export default ScoreBoard;
