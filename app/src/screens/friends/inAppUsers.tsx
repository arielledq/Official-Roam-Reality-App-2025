import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  Keyboard,
  Pressable,
  ImageBackground,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {AppButton, AppInput} from "../../components";
import {FlatList} from "react-native-gesture-handler";
import useStyles from "./styles";
import theme from "../../assets/theme";
import {searchUsers, sendFriendRequest} from "../../network";
import FastImage from "react-native-fast-image";
import {color} from "@rneui/base";
import Images from "../../assets/images";
import fontGroup from "../../assets/fonts";
import {FontSizes} from "../../util/FontUtils";
import useDebounce from "../../hooks/debounce";
import {DEBOUNCE_TIME, showMessage} from "../../util/helpers";
import FullScreenLoadingSpinner from "components/FullScreenLoadingSpinner";
import Icon from "components/Icon";
import {getProfilePicture} from "util/imageUtils";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import {width} from "util/AppDimensions";
import LinearGradient from "react-native-linear-gradient";

const InAppUsers = () => {
  const _styles = useStyles();
  const [searchText, setSearchText] = React.useState("");
  const [filteredUsers, setFilteredUsers] = React.useState([]);
  const debounceQuery = useDebounce(searchText, DEBOUNCE_TIME);
  const [loading, setLoading] = React.useState(false);

  const fetchUsers = React.useCallback(() => {
    const payload = {
      search: debounceQuery,
    };
    setLoading(true);
    searchUsers(payload)
      .then(response => {
        if (response) {
          setFilteredUsers(response?.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [debounceQuery]);

  React.useEffect(() => {
    fetchUsers();
  }, [debounceQuery, fetchUsers]);

  const onAddFriendClick = (userObj: any) => {
    setLoading(true);
    // Call api to send friend request to user
    sendFriendRequest({to_user: userObj?.id})
      .then(response => {
        if (response) {
          showMessage("Friend request sent successfully");
          setSearchText("");
          fetchUsers(); // Refresh the list after sending request
        }
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
          placeholderTextColor={theme.lightColors?.grey0}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          rightIcon={
            <Icon
              name="closecircleo"
              type="antdesign"
              size={15}
              color={theme.lightColors?.grey0}
              onPress={() => setSearchText("")}
            />
          }
        />
        <FlatList
          refreshing={loading}
          onRefresh={fetchUsers}
          data={filteredUsers}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => renderFriendItem(item, onAddFriendClick, _styles)}
        />
      </View>
      <FullScreenLoadingSpinner isLoading={loading} isTransparent />
    </KeyboardAwareScrollView>
  );
};

const renderFriendItem = (item: any, onAddFriendClick: any, styles: any) => {
  const profilePicture = getProfilePicture(item?.user_profile?.image || "");

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
        flex: 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          flex: 0.9,
        }}
      >
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
              width: 30,
              aspectRatio: 1,
              borderRadius: 5,
            }}
            source={{uri: profilePicture}}
            resizeMode="cover"
          />
        </ImageBackground>
        <View>
          <Text style={styles.title}>{item.name}</Text>
          {/* <Text
            style={[styles.subTitle, { marginVertical: 5, maxWidth: 180 }]}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {item.email}
          </Text> */}
        </View>
      </View>
      <TouchableOpacity onPress={() => onAddFriendClick(item)}>
        <LinearGradient
          style={localStyle.addButtonContainer}
          colors={["#7a00cf", "#5532ff"]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          <Text style={localStyle.addButton}>Add</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const localStyle = {
  addButton: {
    ...fontGroup.nunitoBold,
    color: theme.lightColors?.white,
    fontSize: FontSizes.S12,
  },
  addButtonContainer: {
    width: width * 0.2,
    height: heightPercentageToDP(4),
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
};

export default InAppUsers;
