// MyFriends.tsx
import React, { useCallback, useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  FlatList,
  Keyboard,
  ImageBackground,
  Pressable
} from "react-native"
import BackgroundWithImage from "../../components/background"
import { AppButton, AppHeader, AppInput } from "../../components"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import useStyles from "./styles"
import theme from "../../assets/theme"
import { Icon } from "react-native-elements"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { getUserFriendList } from "../../network"
import FastImage from "react-native-fast-image"
import useDebounce from "../../hooks/debounce"
import { DEBOUNCE_TIME } from "../../util/helpers"
import Images from "../../assets/images"

const MyFriends = () => {
  const [searchText, setSearchText] = React.useState("")
  const [friendList, setFriendList] = useState([])
  const [filteredUsers, setFilteredUsers] = React.useState([])
  const _styles = useStyles()
  const debounceQuery = useDebounce(searchText, DEBOUNCE_TIME)
  const navigation = useNavigation()

  useFocusEffect(
    useCallback(() => {
      getUserFriendList()
        .then(response => {
          console.info("friends", JSON.stringify(response))
          if (response) {
            setFriendList(response?.data || [])
            setFilteredUsers(response?.data || [])
          }
        })
        .catch(error => console.error(error))
    }, [])
  )

  const onChangeText = () => {
    const filtered = friendList?.filter(item =>
      item?.user?.name?.toLowerCase().includes(debounceQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  React.useEffect(() => {
    onChangeText()
  }, [debounceQuery])

  const renderFriendItem = (item, styles) => {
    return (
      <View style={localStyle.contactContainer}>
        <View style={localStyle.contactLeftWrapper}>
          <ImageBackground
            source={Images.BGBlur}
            style={localStyle.imageBG}
            resizeMode="stretch"
          >
            <FastImage
              style={localStyle.image}
              source={{ uri: item?.image }}
              resizeMode={FastImage.resizeMode.stretch}
            />
          </ImageBackground>
          <View>
            <Text style={styles.title}>{item?.user?.name}</Text>
            <Text
              style={[styles.subTitle, { marginVertical: 5, maxWidth: 180 }]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {item?.home_country}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => {navigation.navigate("PublicProfile")}} style={{ marginLeft: 10 }}>
          <Icon name="right" type="antdesign" color={theme.lightColors?.white} />
        </Pressable>
      </View>
    )
  }

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
          placeholderTextColor={theme.darkColors?.grey}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
        />
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => renderFriendItem(item, _styles)}
        />
      </View>
    </KeyboardAwareScrollView>
  )
}



const localStyle = {
  container: {
    paddingHorizontal: 20
  },
  addButton: {
    color: theme.lightColors?.green
  },
  contactContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.lightColors?.inputBG,
    paddingRight: 20,
    borderRadius: 10,
    marginVertical: 5,
    flex: 1
  },
  contactLeftWrapper: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    flex: 0.9
  },
  imageBG: {
    width: 80,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    width: 30,
    aspectRatio: 1,
    borderRadius: 5
  }
}

export default MyFriends
