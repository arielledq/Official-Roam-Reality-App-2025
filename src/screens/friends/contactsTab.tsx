import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  PermissionsAndroid,
  Platform,
  Pressable,
  ImageBackground,
  Keyboard,
} from "react-native";
// TODO: Library is giving errors on latest ios sdk
// import Contacts from "react-native-contacts";
import { useNavigation } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import theme from "../../assets/theme";
import useStyles from "./styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AppInput } from "../../components";
import useDebounce from "../../hooks/debounce";
import { DEBOUNCE_TIME, showMessage, truncateText } from "../../util/helpers";
import { Icon } from "react-native-elements";
import Images from "../../assets/images";

interface Contact {
  id?: string;
  user_profile?: { image?: string | null };
  name?: string;
  email?: string;
}

const ContactsTab = () => {
  const _styles = useStyles() || {};
  const navigation = useNavigation();
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [searchText, setSearchText] = React.useState("");
  const [filteredUsers, setFilteredUsers] = React.useState<Contact[]>([]);
  const [error, setError] = React.useState("");
  const debounceQuery = useDebounce(searchText, DEBOUNCE_TIME);

  useEffect(() => {
    const filterContacts = () => {
      try {
        const filteredContacts = contacts.filter((contact: Contact) => {
          if (!contact || typeof contact !== "object") return false;
          const name = contact.name || "";
          if (typeof name !== "string") return false;
          return name.toLowerCase().includes((debounceQuery || "").toLowerCase());
        });
        setFilteredUsers(filteredContacts);
      } catch (err) {
        showMessage(JSON.stringify(err, null, 2), "error", "Error filtering contacts");
        setFilteredUsers([]);
      }
    };

    filterContacts();
  }, [contacts, debounceQuery]);

  useEffect(() => {
    const requestContactsPermission = async () => {
      try {
        if (Platform.OS === "ios") {
          await fetchContacts();
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            {
              title: "Contacts Permission",
              message: "This app needs access to your contacts.",
              buttonPositive: "OK",
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            await fetchContacts();
          } else {
            setError("Permission to access contacts was denied");
          }
        }
      } catch (err) {
        console.warn("Error requesting permissions:", err);
        setError("Failed to request contact permissions");
      }
    };

    requestContactsPermission();
  }, []);

  const fetchContacts = async () => {
    try {
      // const contactArr = await Contacts.getAll();
      // const contactsList: Contact[] = [];
      // contactArr?.forEach(contact => {
      //   if (!contact || typeof contact !== "object") return;
      //   const emailAddresses = contact.emailAddresses || [];
      //   if (Array.isArray(emailAddresses) && emailAddresses.length) {
      //     emailAddresses.forEach(email => {
      //       if (email && typeof email === "object" && email.email) {
      //         let name = "";
      //         if (contact.displayName) {
      //           name = contact.displayName;
      //         } else if (contact.givenName) {
      //           name = contact?.givenName + " " + contact?.familyName;
      //         } else {
      //           name = email.email;
      //         }
      //         const newContact = {
      //           id: `${contact.recordID || Math.random().toString()}-${email.email}`,
      //           user_profile: { image: null },
      //           name: name,
      //           email: email.email,
      //         };
      //         contactsList.push(newContact);
      //       }
      //     });
      //   }
      // });
      // setContacts(contactsList);
      // setFilteredUsers(contactsList);
    } catch (err) {
      showMessage(JSON.stringify(err, null, 2), "error", "Error fetching contacts");
      setError("Failed to fetch contacts");
      setContacts([]);
      setFilteredUsers([]);
    }
  };

  const onAddFriendClick = (user: Contact) => {
    if (user.email) {
      // @ts-ignore
      navigation.navigate("InviteFriends", { email: user.email });
    } else {
      showMessage("Cannot add friend: email is missing", "error", "Add Friend Error");
    }
  };

  const renderContact = ({ item }: { item: Contact }) => {
    if (!item || typeof item !== "object") return null;

    return (
      <View style={localStyle.contactContainer}>
        <View style={localStyle.contactLeftWrapper}>
          <ImageBackground source={Images.BGBlur} style={localStyle.imageBG} resizeMode="stretch">
            <FastImage
              style={localStyle.image}
              source={
                item.user_profile && item.user_profile.image
                  ? { uri: item.user_profile.image }
                  : Images.BGBlur
              }
              resizeMode={FastImage.resizeMode.cover}
              defaultSource={Images.BGBlur}
            />
          </ImageBackground>
          <View>
            <Text style={_styles.title || {}}>{truncateText(item.name || "Unknown", 18)}</Text>
            <Text
              style={[_styles.subTitle || {}, { marginVertical: 5, maxWidth: 180 }]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {truncateText(item.email || "", 22)}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => onAddFriendClick(item)} style={{ marginLeft: 10, padding: 16 }}>
          <Text style={localStyle.addButton}>Add as friend</Text>
        </Pressable>
      </View>
    );
  };

  if (error) {
    return (
      <View style={[_styles.container || {}, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={_styles.title || {}}>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled
      contentContainerStyle={_styles.scroll || {}}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <View style={_styles.container || {}}>
        <AppInput
          inputContainerStyle={[_styles.input || {}]}
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
          data={filteredUsers}
          keyExtractor={item => (item && item.id ? item.id : Math.random().toString())}
          renderItem={renderContact}
          ListEmptyComponent={
            <Text style={[_styles.title || {}, { textAlign: "center", marginTop: 20 }]}>
              No contacts found
            </Text>
          }
        />
      </View>
    </KeyboardAwareScrollView>
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
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    backgroundColor: theme.lightColors?.inputBG,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
    flex: 1,
  },
  contactLeftWrapper: {
    flexDirection: "row" as const,
    justifyContent: "flex-start" as const,
    alignItems: "center" as const,
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

export default ContactsTab;
