import React, {useEffect, useRef, useState} from "react";
import {Text, View, ImageBackground, TouchableOpacity, FlatList, Image} from "react-native";

import FastImage from "react-native-fast-image";
import {useSelector} from "react-redux";
import {DrawerActions, useNavigation} from "@react-navigation/native";

import {getMyRank, getProfieDetails, getScoreboardList} from "../../network";
import {truncateText} from "util/helpers";

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
import {getProfilePicture} from "util/imageUtils";

const ITEM_WIDTH = 60;

const ScoreBoard = ({}) => {
  const [users, setUsers] = React.useState<any>([]);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(30);
  const [total_record, setTotalLength] = React.useState(0);
  const [rankMine, setRankMine] = useState<any>();
  const [destinations, setDestinations] = useState<any>();
  const [selectedDestination, setSelectedDestination] = useState<any>();
  const [challengeChoice, setChallengeChoice] = useState(SCOREBOARD_TYPE.SPONSOR);
  const [refreshing, setRefreshing] = useState(false);
  const [profileDetails, setProfileDetails] = useState<any>();
  const {sponsors} = useScoreboardHook();

  const destinationData = useSelector((state: any) => state?.ar?.destinationData);

  const _styles = useStyles();
  const desRef = useRef<FlatList>(null);
  const scrollPositionRef = useRef(0);

  const navigation = useNavigation();
  const userProfile = useSelector((state: any) => state?.login?.data?.user);

  let filtersData = challengeChoice === SCOREBOARD_TYPE.DESTINATION ? destinations : sponsors;
  filtersData = [...(filtersData || [])]; // Create a new array to avoid mutating the original

  if (selectedDestination?.id) {
    const selectedDestinationIndex = filtersData.findIndex(
      (filter: any) => filter?.id === selectedDestination.id
    );

    if (selectedDestinationIndex !== -1) {
      const selectedDestinationItem = filtersData[selectedDestinationIndex];
      // Create a new array without the selected item
      const filteredData = filtersData.filter(
        (_: any, index: number) => index !== selectedDestinationIndex
      );
      // Insert the selected item at position 1
      // filtersData = [filteredData[0], selectedDestinationItem, ...filteredData.slice(1)];
    }
  }

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
        });
    } catch (error) {
      console.error("Error", "Error fetching profile details: ");
    }
  };

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
      setTotalLength(scoreBoardResponse?.total_record || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterDestinations = (o: any) => {
    let pageToSet = 1;
    setPageNumber(pageToSet);
    setSelectedDestination(o);

    let destination = "";
    let sponsor = "";
    if (challengeChoice === SCOREBOARD_TYPE.DESTINATION) {
      destination = o.id || "";
    } else {
      sponsor = o.id || "";
    }
    getScoreboard(pageToSet, destination, sponsor);
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
    setPageNumber(newPage);
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
    if (!desRef.current) return;
    const currentIndex = Math.round(scrollPositionRef.current / ITEM_WIDTH);
    const newIndex = Math.min(currentIndex + 3, filtersData.length - 1);

    desRef.current.scrollToIndex({
      index: newIndex,
      animated: true,
      viewPosition: 0.5,
    });
  };

  const getInitialData = () => {
    const newPage = 1;
    setPageNumber(newPage);
    let destination = "";
    let sponsor = "";
    if (challengeChoice === SCOREBOARD_TYPE.DESTINATION) {
      destination = selectedDestination?.id || "";
    } else {
      sponsor = selectedDestination?.id || "";
    }
    getScoreboard(newPage, destination, sponsor);
    fetchProfileDetails();
  };

  React.useEffect(() => {
    getInitialData();
  }, []);

  const skeletonItem = () => {
    return (
      <View
        style={{
          height: 50,
          width: 50,
          borderRadius: 4,
          backgroundColor: "#131422",
          marginHorizontal: 5,
          marginVertical: 10,
        }}
      />
    );
  };

  const FilterItem = React.memo(({obj}: {obj: any}) => {
    let filterImage = "";
    if (challengeChoice === SCOREBOARD_TYPE.DESTINATION) {
      filterImage = obj?.flag_image;
    } else {
      filterImage = obj?.image;
    }

    if (!obj?.name) return skeletonItem();

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

  const loadMore = () => {
    if (users.length < total_record) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      let destination = "";
      let sponsor = "";
      if (challengeChoice === SCOREBOARD_TYPE.DESTINATION) {
        destination = selectedDestination?.id || "";
      } else {
        sponsor = selectedDestination?.id || "";
      }
      getScoreboard(newPage, destination, sponsor);
    }
  };

  const Item = React.memo(({obj, index}: {obj: any; index: number}) => {
    const userPosition = index + 1;
    const userRank = userPosition;
    const profilePicture = getProfilePicture(obj?.user_profile?.image);
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
            <Image
              style={{
                width: 40,
                aspectRatio: 1,
                borderRadius: 5,
                height: 40,
              }}
              source={{uri: profilePicture}}
              resizeMode="cover"
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

  const profilePicture = getProfilePicture(profileDetails?.image);

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
      <View style={{..._styles.countryFiltersContainer, height: ITEM_WIDTH}}>
        <FlatList
          ref={desRef}
          horizontal
          nestedScrollEnabled={true}
          scrollEnabled={true}
          data={filtersData?.length ? filtersData : [1, 2, 3, 4]}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => <FilterItem obj={item} />}
          contentContainerStyle={{gap: 4}}
          onScroll={({nativeEvent}) => {
            scrollPositionRef.current = nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
          style={{height: ITEM_WIDTH}}
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
              <Image
                style={{
                  width: 40,
                  aspectRatio: 1,
                  borderRadius: 5,
                  height: 40,
                }}
                source={{uri: profilePicture}}
                resizeMode="cover"
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

  useEffect(() => {
    const defaultDestination = {name: "Global", id: "", flag_image: ""};
    let updatedDestinations = [defaultDestination];
    if (destinationData?.length) {
      updatedDestinations = [defaultDestination, ...destinationData];
    }
    setDestinations(updatedDestinations);
  }, [destinationData]);

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
        initialNumToRender={30}
        maxToRenderPerBatch={30}
        windowSize={5}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
      />
    </ScreenContainer>
  );
};

export default ScoreBoard;
