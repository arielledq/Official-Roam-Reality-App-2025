import React, {useRef, useState} from "react";
import {Text, View, ImageBackground, TouchableOpacity, FlatList, Image} from "react-native";

import FastImage from "react-native-fast-image";
import {useSelector} from "react-redux";
import {DrawerActions, useNavigation} from "@react-navigation/native";

import {getGeoARDestinations, getMyRank, getScoreboardList} from "../../network";
import {handleError, truncateText} from "util/helpers";

import {AppHeader} from "../../components";
import ScreenContainer from "components/ScreenContainer";

import useStyles from "./styles";

import Images from "../../assets/images";

import {MenuIcon} from "assets/svg";
import {SCOREBOARD_TYPE} from "../../constants";
import Icon from "components/Icon";
import {FontSizes} from "util/FontUtils";
// @ts-ignore
import RankBG from "../../assets/geoar/rank_bg.svg";
import useScoreboardHook from "hooks/useScoreboardHook";

const SCROLL_AMOUNT = 70;

const ScoreBoard = ({}) => {
  const [users, setUsers] = React.useState<any>([]);
  const [rankMine, setRankMine] = useState<any>();
  const [destinationData, setDestinationData] = useState<any>();
  const [selectedDestination, setSelectedDestination] = useState<any>();
  const [challengeChoice, setChallengeChoice] = useState(SCOREBOARD_TYPE.DESTINATION);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const {sponsors} = useScoreboardHook();

  const _styles = useStyles();
  const desRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const userProfile = useSelector((state: any) => state?.login?.data?.user);

  const getScoreboard = async (pageNumber = 1, destination = "", sponsor = "") => {
    setRefreshing(true);
    // Get the logged in user rank
    try {
      const myRankResponse = await getMyRank(destination);
      setRankMine(myRankResponse || {});
    } catch (error) {
      console.error(error);
    }

    // Get the leaderboard list
    try {
      const scoreBoardResponse = await getScoreboardList(pageNumber, destination, sponsor);
      const scoreboardUsers = scoreBoardResponse?.results || [];
      setUsers((prevUsers: any) =>
        pageNumber === 1 ? scoreboardUsers : [...prevUsers, ...scoreboardUsers]
      );
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterDestinations = (o: any) => {
    setSelectedDestination(o);
    const newPage = 1;
    let destination = "";
    let sponsor = "";
    if (challengeChoice === SCOREBOARD_TYPE.DESTINATION) {
      destination = o.id || "";
    } else {
      sponsor = o.id || "";
    }
    getScoreboard(newPage, destination, sponsor);
  };

  const ARDestinations = async () => {
    if (destinationData?.length) return;
    setRefreshing(true);
    try {
      const res = await getGeoARDestinations();
      if (res.status == 1) {
        const defaultDestination = {name: "Global", id: "", flag_image: ""};
        const updatedDestinations = [defaultDestination, ...res.data];
        setDestinationData(updatedDestinations);
      } else {
        res.message.message = "Error in loading Destinations.";
        handleError(res);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMenuButton = () => {
    return (
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer)}
        style={{paddingLeft: 5}}
      >
        <MenuIcon />
      </TouchableOpacity>
    );
  };

  const handlePullDownToRefresh = () => {
    const newPage = 1;
    let destination = "";
    let sponsor = "";
    if (challengeChoice === SCOREBOARD_TYPE.DESTINATION) {
      destination = selectedDestination?.id || "";
    } else {
      sponsor = selectedDestination?.id || "";
    }
    getScoreboard(newPage, destination, sponsor);
  };

  const scrollRegionsPressHandler = () => {
    const newPosition = scrollPosition + SCROLL_AMOUNT;
    desRef.current?.scrollToOffset({offset: newPosition, animated: true});
    setScrollPosition(newPosition);
  };

  const getInitialData = () => {
    const newPage = 1;
    let destination = "";
    let sponsor = "";
    if (challengeChoice === SCOREBOARD_TYPE.DESTINATION) {
      destination = selectedDestination?.id || "";
    } else {
      sponsor = selectedDestination?.id || "";
    }
    getScoreboard(newPage, destination, sponsor);
    ARDestinations();
  };

  React.useEffect(() => {
    getInitialData();
  }, []);

  const DestinationItem = React.memo(({obj}: {obj: any}) => {
    let filterImage = "";
    if (challengeChoice === SCOREBOARD_TYPE.DESTINATION) {
      filterImage = obj?.flag_image;
    } else {
      filterImage = obj?.image;
    }
    return (
      <TouchableOpacity
        onPress={() => filterDestinations(obj)}
        style={[
          _styles.countryButtonStyle,
          obj.id === selectedDestination?.id
            ? _styles.countrySelectedButtonStyle
            : _styles.countryUnSelectedButtonStyle,
        ]}
      >
        {obj?.id ? (
          <FastImage
            style={{
              width: 40,
              height: 40,
              aspectRatio: 1,
              overflow: "hidden",
              borderRadius: 80,
            }}
            source={{
              uri: filterImage,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <Image source={Images.Earth} style={{width: 40, height: 40, aspectRatio: 1}} />
        )}
        <Text
          style={[
            _styles.buttonSelectText,
            {fontSize: FontSizes.S8, fontWeight: "normal", textAlign: "center"},
          ]}
        >
          {truncateText(obj?.name, 10)}
        </Text>
      </TouchableOpacity>
    );
  });

  const Item = React.memo(({obj, index}: {obj: any; index: number}) => {
    const userPosition = index + 1;
    const userRank = userPosition;
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#131422",
          borderRadius: 12,
          marginVertical: 4,
          paddingHorizontal: 16,
        }}
      >
        <View style={{flexDirection: "row", alignItems: "center"}}>
          <View style={{alignItems: "center"}}>
            <Text style={_styles.rankText}>Rank</Text>
            <Text style={_styles.rankTextPosition}>{userRank || "-"}</Text>
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
              source={{
                uri: obj?.user_profile?.image,
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
              resizeMode={FastImage.resizeMode.cover}
            />
          </ImageBackground>
          <Text numberOfLines={2} style={_styles.nameText}>
            {obj?.name}
          </Text>
        </View>
        <View style={{marginEnd: 10, alignItems: "center"}}>
          <Text style={_styles.rankText}>Points</Text>
          <Text style={_styles.pointsText}>{obj?.ar_user_profile_user?.points}</Text>
        </View>
      </View>
    );
  });

  console.log("userProfile", userProfile);

  const ListHeaderComponent = () => (
    <View style={_styles.listHeaderContainer}>
      {/* Tabs */}
      <View style={_styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setChallengeChoice(SCOREBOARD_TYPE.DESTINATION)}
          activeOpacity={0.5}
          style={
            challengeChoice == SCOREBOARD_TYPE.DESTINATION
              ? _styles.selectButtonStyle
              : _styles.unSelectButtonStyle
          }
        >
          <Text style={_styles.buttonSelectText}>Destination Scoreboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setChallengeChoice(SCOREBOARD_TYPE.SPONSOR)}
          activeOpacity={0.5}
          style={
            challengeChoice == SCOREBOARD_TYPE.SPONSOR
              ? _styles.selectButtonStyle
              : _styles.unSelectButtonStyle
          }
        >
          <Text style={_styles.buttonSelectText}>Sponsor Scoreboard</Text>
        </TouchableOpacity>
      </View>

      {/* Country filters */}
      <View style={_styles.countryFiltersContainer}>
        <FlatList
          horizontal
          ref={desRef}
          data={challengeChoice == SCOREBOARD_TYPE.DESTINATION ? destinationData : sponsors}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => <DestinationItem obj={item} />}
          contentContainerStyle={{gap: 4}}
        />
        <TouchableOpacity
          onPress={scrollRegionsPressHandler}
          style={{width: 24, alignItems: "center"}}
        >
          <Icon name={"doubleright"} family="antdesign" size={16} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={_styles.rankTitle}>Your Rank</Text>
      <View style={{height: 68, width: "100%"}}>
        <RankBG style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: -1}} />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{flexDirection: "row", alignItems: "center"}}>
            <View style={{alignItems: "center"}}>
              <Text style={_styles.rankText}>Rank</Text>
              <Text style={_styles.rankTextPosition}>{rankMine?.my_rank}</Text>
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
                source={{
                  uri: userProfile?.user_profile?.image,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </ImageBackground>
            <Text style={_styles.nameText}>{userProfile?.name ? userProfile?.name : "You"}</Text>
          </View>
          <View style={{marginEnd: 10, alignItems: "center"}}>
            <Text style={_styles.rankText}>Points</Text>
            <Text style={_styles.pointsText}>{rankMine?.my_points}</Text>
          </View>
        </View>
      </View>

      <Text style={_styles.leaderboardTitle}>Leaderboard</Text>
    </View>
  );

  return (
    <ScreenContainer>
      <AppHeader
        leftComponent={handleMenuButton()}
        centerComponent={{
          text: "Scoreboard",
          style: [_styles.heading],
        }}
        backgroundColor="transparent"
        isBottomTab
      />

      <FlatList
        ListHeaderComponent={ListHeaderComponent}
        data={users}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => <Item obj={item} index={index} />}
        keyExtractor={(item: any, index: number) => item?.id?.toString() || index.toString()}
        refreshing={refreshing}
        onRefresh={handlePullDownToRefresh}
        contentContainerStyle={{flexGrow: 1}}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </ScreenContainer>
  );
};

export default ScoreBoard;
