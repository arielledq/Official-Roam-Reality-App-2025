import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  PermissionsAndroid,
  Platform,
  Pressable,
  Alert,
  ImageBackground,
  Keyboard
} from "react-native"
import Contacts from "react-native-contacts"
import { findFriends, sendFriendRequest } from "../../network"
import FastImage from "react-native-fast-image"
import theme from "../../assets/theme"
import { color } from "@rneui/base"
import useStyles from "./styles"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { AppInput } from "../../components"
import useDebounce from "../../hooks/debounce"
import { DEBOUNCE_TIME, showMessage } from "../../util/helpers"
import { Icon } from "react-native-elements"
import Images from "../../assets/images"

const ContactsTab = () => {
  const _styles = useStyles()
  const [contacts, setContacts] = useState([])
  const [searchText, setSearchText] = React.useState("")
  const [filteredUsers, setFilteredUsers] = React.useState([])
  const debounceQuery = useDebounce(searchText, DEBOUNCE_TIME)
  useEffect(() => {
    const filterContacts = () => {
      const filteredContacts = contacts.filter(contact =>
        contact?.name.toLowerCase().includes(debounceQuery.toLowerCase())
      )
      setFilteredUsers(filteredContacts)
    }

    filterContacts()
  }, [contacts, debounceQuery])

  useEffect(() => {
    const requestContactsPermission = async () => {
      if (Platform.OS === "ios") {
        fetchContacts()
      } else {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            {
              title: "Contacts Permission",
              message: "This app needs access to your contacts.",
              buttonPositive: "OK"
            }
          )
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Contacts permission granted")
            fetchContacts()
          } else {
            console.log("Contacts permission denied")
          }
        } catch (err) {
          console.warn(err)
        }
      }
    }

    requestContactsPermission()
  }, [])

  const fetchContacts = () => {
    Contacts.getAll().then(contactArr => {
      console.log("Contacts", JSON.stringify(contactArr))
      findFriends(contactArr).then(response => {
        console.log("Find Friends Response", response)
        if (response && response?.data) {
          setContacts(response?.data)
          setFilteredUsers(response?.data)
        }
      })
    })
  }

  const onAddFriendClick = (user: any) => {
    // Call api to send friend request to user
    sendFriendRequest({ to_user: user?.id })
      .then(response => {
        if (response && response?.status === 1) {
          showMessage("Friend request sent successfully")
        } else {
          showMessage(response?.message?.message, 'error', "Friend Request Error")
        }
      })
      .catch(error => {
        showMessage(error?.message, 'error', "Friend Request Error")
      })
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
          rightIcon={
            <Icon
              name="closecircleo"
              type="antdesign"
              size={15}
              color={theme.darkColors?.grey}
              onPress={() => setSearchText("")}
            />
          }
        />
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id}
          renderItem={({ item }) =>
            renderContact(item, onAddFriendClick, _styles)
          }
        />
      </View>
    </KeyboardAwareScrollView>
  )
}

const renderContact = (
  item: any,
  onAddFriendClick: (user: any) => void,
  styles: any
) => {
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
            source={{ uri: item?.user_profile?.image }}
            resizeMode={FastImage.resizeMode.cover}
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
      <Pressable
        onPress={() => onAddFriendClick(item)}
        style={{ marginLeft: 10 }}
      >
        <Text style={localStyle.addButton}>Add as friend</Text>
      </Pressable>
    </View>
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
    paddingVertical: 10,
    paddingHorizontal: 20,
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

export default ContactsTab
