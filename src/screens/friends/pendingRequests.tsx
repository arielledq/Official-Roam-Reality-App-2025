// PendingRequests.tsx
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import React, { useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  ImageBackground
} from "react-native"
import {
  acceptFriendRequests,
  getPendingFriendRequests,
  rejectFriendRequests
} from "../../network"
import useStyles from "./styles"
import theme from "../../assets/theme"
import { Icon } from "@rneui/base"
import FastImage from "react-native-fast-image"
import Images from "../../assets/images"

const PendingRequests = () => {
  const [pendingRequests, setPendingRequests] = React.useState([])
  const _styles = useStyles()

  useFocusEffect(
    useCallback(() => {
      getPendingRequests()
    }, [])
  )

  const getPendingRequests = () => {
    getPendingFriendRequests()
      .then(response => {
        console.info(response)
        if (response) {
          setPendingRequests(response?.data)
        }
      })
      .catch(error => console.error(error))
  }

  const onAccept = (user: any) => {
    acceptFriendRequests(user.id)
      .then(response => {
        Alert.alert("Requests", "You are now friends", [
          { text: "OK", onPress: () => getPendingRequests() }
        ])
      })
      .catch(error => {
        Alert.alert("Error", "Something went wrong")
      })
  }

  const onReject = (request: any) => {
    console.info(request)
    rejectFriendRequests(request.id)
      .then(response => {
        console.log("rea", response)
        if (response && response?.status === 1) {
          Alert.alert("Requests", "Request has been rejected", [
            { text: "OK", onPress: () => getPendingRequests() }
          ])
        } else {
          Alert.alert("Error", "Something went wrong")
        }
      })
      .catch(error => {
        Alert.alert("Error", "Something went wrong")
      })
  }

  return (
    <View style={_styles.container}>
      <FlatList
        data={pendingRequests}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => renderFriendItem(item, onAccept, onReject)}
        contentContainerStyle={_styles.scroll}
      />
    </View>
  )
}

const renderFriendItem = (item, onAccept, onReject) => {
  const { from_user } = item
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.lightColors?.inputBG,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginVertical: 5
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <ImageBackground
          source={Images.BGBlur}
          style={localStyles.imageBg}
          resizeMode="stretch"
        >
          <FastImage
            style={localStyles.image}
            source={{ uri: from_user?.user_profile?.image }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </ImageBackground>
        <View>
          <Text style={{ color: theme.lightColors?.white }}>
            {from_user.name}
          </Text>
          <Text style={{ color: theme.lightColors?.white }}>
            {from_user.email}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row" }}>
        <Pressable style={{ marginRight: 20 }} onPress={() => onReject(item)}>
          <Icon name="times" type="font-awesome" color="red" size={25} />
        </Pressable>
        <Pressable onPress={() => onAccept(item)}>
          <Icon name="check" type="font-awesome" color="green" size={25} />
        </Pressable>
      </View>
    </View>
  )
}

export const localStyles = {
  imageBg: {
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

export default PendingRequests
