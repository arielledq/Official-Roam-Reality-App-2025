// MyFriends.tsx
import React, {useCallback, useState} from "react";
import {View, Text, FlatList, Keyboard, ImageBackground, Pressable, Image} from "react-native";
import {AppInput} from "../../components";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import useStyles from "./styles";
import theme from "../../assets/theme";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {getUserFriendList} from "../../network";
import useDebounce from "../../hooks/debounce";
import {DEBOUNCE_TIME} from "../../util/helpers";
import Images from "../../assets/images";
import Icon from "components/Icon";
import {getProfilePicture} from "util/imageUtils";

const MyFriends = () => {
  const [searchText, setSearchText] = React.useState("");
  const navigation = useNavigation();
  const [friendList, setFriendList] = useState([]);
  const [filteredUsers, setFilteredUsers] = React.useState([]);
  const _styles = useStyles();
  const debounceQuery = useDebounce(searchText, DEBOUNCE_TIME);
  const [isFetching, setFetching] = useState(false);

  useFocusEffect(useCallback(() => getFriends(), []));

  const getFriends = () => {
    setFetching(true);
    getUserFriendList()
      .then(response => {
        setFetching(false);
        if (response) {
          setFriendList(response?.data[0]?.friends || []);
          setFilteredUsers(response?.data[0]?.friends || []);
        }
      })
      .catch(error => {
        setFetching(false);
        console.error(error);
      });
  };

  const onChangeText = () => {
    const filtered = friendList?.filter(item =>
      // @ts-ignore
      item?.name?.toLowerCase().includes(debounceQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  React.useEffect(() => {
    onChangeText();
  }, [debounceQuery]);

  const onRefresh = () => getFriends();

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled
      contentContainerStyle={_styles.scroll}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <View style={_styles.container}>
        <AppInput
          inputContainerStyle={[_styles.input]}
          selectionColor={"white"}
          placeholder="Search for a friend"
          onSubmitEditing={Keyboard.dismiss}
          placeholderTextColor={theme.darkColors?.grey0}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
        />
        <FlatList
          data={filteredUsers}
          keyExtractor={(item: any) => item?.id?.toString()}
          renderItem={({item}: {item: any}) => renderFriendItem(item, _styles, navigation)}
          onRefresh={() => onRefresh()}
          refreshing={isFetching}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

const renderFriendItem = (item: any, styles: any, navigation: any) => {
  const profilePicture = getProfilePicture(item?.user_profile?.image);
  return (
    <View style={localStyle.contactContainer}>
      <View style={localStyle.contactLeftWrapper}>
        <ImageBackground source={Images.BGBlur} style={localStyle.imageBG} resizeMode="stretch">
          <Image style={localStyle.image} source={{uri: profilePicture}} resizeMode="cover" />
        </ImageBackground>
        <View>
          <Text style={styles.title}>{item?.name}</Text>
          <Text
            style={[styles.subTitle, {marginVertical: 5, maxWidth: 180}]}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {item?.user_profile?.home_country}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={() => {
          navigation.navigate("PublicProfile", {userData: item});
        }}
        style={{marginLeft: 10, padding: 16}}
      >
        <Icon name="right" type="antdesign" color={theme.lightColors?.white} />
      </Pressable>
    </View>
  );
};

const localStyle = {
  container: {
    paddingHorizontal: 20,
  },
  addButton: {
    color: theme.lightColors?.green,
  },
  contactContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.lightColors?.inputBG,
    paddingRight: 20,
    borderRadius: 10,
    marginVertical: 5,
    flex: 1,
  },
  contactLeftWrapper: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    flex: 0.9,
  },
  imageBG: {
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

export default MyFriends;
