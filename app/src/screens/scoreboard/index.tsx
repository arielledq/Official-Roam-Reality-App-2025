import React, {useRef, useState} from "react";
import {Text, View, ImageBackground, TouchableOpacity, FlatList} from "react-native";

import FastImage from "react-native-fast-image";
import {useSelector} from "react-redux";
import {DrawerActions, useNavigation} from "@react-navigation/native";

import {getGeoARDestinations, getMyRank, getScoreboardList} from "../../network";
import {handleError} from "util/helpers";

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

const SCROLL_AMOUNT = 70;

const ScoreBoard = ({}) => {
  const [users, setUsers] = React.useState([]);
  const [rankMine, setRankMine] = useState<any>();
  const [destinationData, setDestinationData] = useState([{name: "Global"}]);
  const [selectedDestination, setSelectedDestination] = useState<any>();
  const [challengeChoice, setChallengeChoice] = useState(SCOREBOARD_TYPE.DESTINATION);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const _styles = useStyles();
  const desRef = useRef(null);
  const navigation = useNavigation();
  const userProfile = useSelector((state: any) => state?.login?.data?.user);

  const getScoreboard = async (destination = "") => {
    setRefreshing(true);
    try {
      const scoreBoardResponse = await getScoreboardList(destination);
      const myRankResponse = await getMyRank(destination);

      setUsers(scoreBoardResponse?.data || []);
      setRankMine(myRankResponse?.data || {});
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterDestinations = (o: any) => {
    setSelectedDestination(o);
    getScoreboard(o.id);
  };

  const ARDestinations = async () => {
    try {
      const res = await getGeoARDestinations();
      if (res.status == 1) {
        setDestinationData(currDestinations => [...currDestinations, ...res.data]);
      } else {
        res.message.message = "Error in loading Destinations.";
        handleError(res);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const DestinationItem = React.memo(({obj}: {obj: any}) => (
    <TouchableOpacity
      onPress={() => filterDestinations(obj)}
      style={[
        _styles.countryButtonStyle,
        obj.id == selectedDestination?.id
          ? _styles.countrySelectedButtonStyle
          : _styles.countryUnSelectedButtonStyle,
      ]}
    >
      <FastImage
        style={{
          width: 40,
          height: 40,
          aspectRatio: 1,
          overflow: "hidden",
          borderRadius: 80,
        }}
        source={{
          uri: obj?.flag_image,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Text style={[_styles.buttonSelectText, {fontSize: FontSizes.S8, fontWeight: "normal"}]}>
        {obj?.name}
      </Text>
    </TouchableOpacity>
  ));

  const Item = React.memo(({obj, rank}: {obj: any; rank: number}) => {
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
            <Text style={_styles.rankTextPosition}>{rankMine?.my_rank || "-"}</Text>
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
          <Text style={_styles.pointsText}>{obj?.user_ar_profile?.points}</Text>
        </View>
      </View>
    );
  });

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
    const destination = selectedDestination?.id || "";
    getScoreboard(destination);
  };

  const scrollRegionsPressHandler = () => {
    const newPosition = scrollPosition + SCROLL_AMOUNT;
    desRef.current?.scrollTo({x: newPosition, y: 0, animated: true});
    setScrollPosition(newPosition);
  };

  const getInitialData = () => {
    const destination = "";
    getScoreboard(destination);
    ARDestinations();
  };

  React.useEffect(() => {
    getInitialData();
  }, []);

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
          data={destinationData}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) => <DestinationItem index={index} obj={item} />}
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
        renderItem={({item, index}) => <Item obj={item} rank={index} />}
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
