// PendingRequests.tsx
import {useFocusEffect} from "@react-navigation/native";
import React, {useCallback, useState} from "react";
import {View, Text, FlatList, Pressable, ImageBackground, Image} from "react-native";
import {acceptFriendRequests, getPendingFriendRequests, rejectFriendRequests} from "../../network";
import useStyles from "./styles";
import theme from "../../assets/theme";
import {Icon} from "@rneui/base";
import Images from "../../assets/images";
import {showMessage, truncateText} from "../../util/helpers";
import FullScreenLoadingSpinner from "components/FullScreenLoadingSpinner";
import {getProfilePicture} from "util/imageUtils";

const PendingRequests = () => {
  const [pendingRequests, setPendingRequests] = React.useState([]);
  const [isFetching, setFetching] = useState(false);
  const _styles = useStyles();
  const [loading, setLoading] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      getPendingRequests();
    }, [])
  );

  const getPendingRequests = () => {
    setFetching(true);
    getPendingFriendRequests()
      .then(response => {
        setFetching(false);
        if (response) {
          setPendingRequests(response?.data);
        }
      })
      .catch(error => {
        setFetching(false);
      });
  };

  const onAccept = (user: any) => {
    setLoading(true);

    acceptFriendRequests(user.id)
      .then(response => {
        if (response && response?.status === 1) {
          showMessage("You are now friends");
          getPendingRequests();
        }
      })
      .catch(error => {
        showMessage("Something went wrong", "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onReject = (request: any) => {
    setLoading(true);

    rejectFriendRequests(request.id)
      .then(response => {
        if (response && response?.status === 1) {
          showMessage("Request has been rejected", "error");
          getPendingRequests();
        } else {
          showMessage("Something went wrong", "error");
        }
      })
      .catch(error => {
        showMessage("Something went wrong", "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onRefresh = () => getPendingRequests();

  return (
    <View style={_styles.container}>
      <FlatList
        data={pendingRequests}
        keyExtractor={(item: any) => item?.id?.toString()}
        renderItem={({item}: {item: any}) => renderFriendItem(item, onAccept, onReject)}
        contentContainerStyle={_styles.scroll}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
      />
      <FullScreenLoadingSpinner isLoading={loading} />
    </View>
  );
};

const renderFriendItem = (item: any, onAccept: any, onReject: any) => {
  const {from_user} = item;
  const profilePicture = getProfilePicture(from_user?.user_profile?.image);
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.lightColors?.inputBG,
        paddingVertical: 10,
        paddingHorizontal: 0,
        borderRadius: 10,
        marginVertical: 5,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ImageBackground source={Images.BGBlur} style={localStyles.imageBg} resizeMode="stretch">
          <Image style={localStyles.image} source={{uri: profilePicture}} resizeMode="cover" />
        </ImageBackground>
        <View>
          <Text style={{color: theme.lightColors?.white}}>{from_user.name}</Text>
          <Text style={{color: theme.lightColors?.white}}>{truncateText(from_user.email, 18)}</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          marginRight: 20,

          gap: 20,
        }}
      >
        <Pressable onPress={() => onReject(item)}>
          <Icon name="close" type="antdesign" color="red" size={25} />
        </Pressable>
        <Pressable onPress={() => onAccept(item)}>
          <Icon name="check" type="antdesign" color="green" size={25} />
        </Pressable>
      </View>
    </View>
  );
};

export const localStyles = {
  imageBg: {
    width: 80,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 30,
    aspectRatio: 1,
    borderRadius: 5,
  },
};

export default PendingRequests;
