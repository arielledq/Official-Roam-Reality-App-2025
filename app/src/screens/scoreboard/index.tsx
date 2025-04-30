import React, {useRef, useState} from "react";
import {Text, View, ImageBackground, TouchableOpacity} from "react-native";

import {FlatList} from "react-native-gesture-handler";
import FastImage from "react-native-fast-image";
import {useDispatch, useSelector} from "react-redux";
import {DrawerActions, useNavigation} from "@react-navigation/native";

import {getARProfile, getGeoARDestinations, getMyRank, getScoreboardList} from "../../network";
import {handleError} from "util/helpers";
import {updateARUserData} from "../../redux/AR";

import {AppHeader} from "../../components";
import ScreenContainer from "components/ScreenContainer";

import useStyles from "./styles";

import Images from "../../assets/images";
// @ts-ignore
import RankBG from "../../assets/geoar/rank_bg.svg";
import {MenuIcon} from "assets/svg";
import FullScreenLoadingSpinner from "components/FullScreenLoadingSpinner";

const ScoreBoard = ({}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = React.useState([]);
  const [rankMine, setRankMine] = useState<any>();
  const [destinationData, setDestinationData] = useState([{name: "Global"}]);
  const [selectedDestination, setSelectedDestination] = useState<any>();

  const _styles = useStyles();
  const dispatch = useDispatch();
  const desRef = useRef();
  const navigation = useNavigation();
  const userProfile = useSelector((state: any) => state?.login?.data?.user);
  const arProfile = useSelector((state: any) => state?.ar?.arProfile);

  const getScoreboard = (destination = "", firstLoad = false) => {
    setIsLoading(true);
    getScoreboardList(destination)
      .then(response => {
        if (response) {
          setUsers(response?.data);
        }
      })
      .finally(() => {
        if (firstLoad) {
          ARDestinations();
        } else {
          setIsLoading(false);
        }
      });
  };

  const filterDestinations = (o: any, index: number) => {
    setSelectedDestination(o);
    getScoreboard(o.id);
    getMyRankPoints(o.id);
  };

  const ARDestinations = () => {
    getGeoARDestinations()
      .then(res => {
        if (res.status == 1) {
          setDestinationData(currDestinations => [...currDestinations, ...res.data]);
        } else {
          res.message.message = "Error in loading Destinations.";
          handleError(res);
        }
      })
      .finally(() => {
        getMyRankPoints();
      });
  };

  const getMyRankPoints = (destination = "") => {
    getMyRank(destination)
      .then(response => {
        if (response) {
          setRankMine(response);
        }
      })
      .finally(() => {
        fetchARUserProfile();
      });
  };

  const fetchARUserProfile = () => {
    getARProfile()
      .then(res => {
        if (res.status == 1) {
          dispatch(updateARUserData(res));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const DestinationItem = ({obj, index}: {obj: any; index: number}) => (
    <TouchableOpacity
      onPress={() => filterDestinations(obj, index)}
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
        source={{uri: obj?.flag_image}}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View>
        <Text style={_styles.destinationText}>{obj?.name}</Text>
        <Text style={_styles.destinationText}>Scoreboard</Text>
      </View>
    </TouchableOpacity>
  );

  const Item = ({obj, rank}: {obj: any; rank: number}) => {
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
        <View style={{flexDirection: "row", alignItems: "center"}}>
          <View style={{marginStart: 10, alignItems: "center"}}>
            <Text style={_styles.rankText}>Rank</Text>
            <Text style={_styles.rankTextNumber}>{rank + 1}</Text>
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
              source={{uri: obj?.user_profile?.image}}
              resizeMode={FastImage.resizeMode.cover}
            />
          </ImageBackground>
          <Text numberOfLines={2} style={_styles.nameText}>
            {obj?.name?.replace(" ", "\n")}
          </Text>
        </View>
        <View style={{alignItems: "center"}}>
          <Text style={_styles.rankText}>Site Visited</Text>
          <Text style={_styles.rankTextNumber}>{obj?.user_ar_profile?.check_ins}</Text>
        </View>
        <View style={{marginEnd: 10, alignItems: "center"}}>
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
        style={{paddingLeft: 5}}
      >
        <MenuIcon />
      </TouchableOpacity>
    );
  };

  const handlePullDownToRefresh = () => {
    const destination = selectedDestination?.id;
    const isFirstLoad = false;
    getScoreboard(destination, isFirstLoad);
    getMyRankPoints(destination);
  };

  const myRank = () => {
    return (
      <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
        <RankBG style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0}} />
        <View style={{flexDirection: "row", alignItems: "center"}}>
          <View style={{marginStart: 10, alignItems: "center"}}>
            <Text style={_styles.rankText}>Rank</Text>
            <Text style={_styles.rankTextNumber}>{rankMine?.my_rank}</Text>
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
              source={{uri: userProfile?.image}}
              resizeMode={FastImage.resizeMode.cover}
            />
          </ImageBackground>
          <Text numberOfLines={2} style={_styles.nameText}>
            {userProfile?.name ? userProfile?.name?.replace(" ", "\n") : "You"}
          </Text>
        </View>
        <View style={{alignItems: "center"}}>
          <Text style={_styles.rankText}>Site Visited</Text>
          <Text style={_styles.rankTextNumber}>{arProfile?.check_ins}</Text>
        </View>
        <View style={{marginEnd: 10, alignItems: "center"}}>
          <Text style={_styles.rankText}>Points</Text>
          <Text style={_styles.rankTextNumber}>{rankMine?.my_points}</Text>
        </View>
      </View>
    );
  };

  React.useEffect(() => {
    const destination = "";
    const isFirstLoad = true;
    getScoreboard(destination, isFirstLoad);
    getMyRankPoints(destination);
  }, []);

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

        <View style={{height: 50}}>
          <FlatList
            horizontal
            // @ts-ignore
            ref={desRef}
            data={destinationData}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            renderItem={({item, index}) => <DestinationItem index={index} obj={item} />}
          />
        </View>
        <Text style={_styles.subTitle}>Your rank</Text>
        {myRank()}
        <Text style={_styles.subTitle}>Leaderboard</Text>

        <FlatList
          style={{flex: 1, marginTop: 15}}
          data={users}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) => <Item obj={item} rank={index} />}
          keyExtractor={(item: any) => item?.id}
          onRefresh={handlePullDownToRefresh}
          refreshing={isLoading}
        />
        <FullScreenLoadingSpinner isLoading={isLoading} />
      </>
    </ScreenContainer>
  );
};

export default ScoreBoard;
