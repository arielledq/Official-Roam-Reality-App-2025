// PendingRequests.tsx
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import React, { useCallback, useState } from "react"
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
import { set } from "react-native-reanimated"
import { showMessage } from "../../util/helpers"

const PendingRequests = () => {
  const [pendingRequests, setPendingRequests] = React.useState([])
  const [isFetching, setFetching] = useState(false)
  const _styles = useStyles()

  useFocusEffect(
    useCallback(() => {
      getPendingRequests()
    }, [])
  )

  const getPendingRequests = () => {
    setFetching(true)
    getPendingFriendRequests()
      .then(response => {
        setFetching(false)
        if (response) {
          setPendingRequests(response?.data)
        }
      })
      .catch(error => {
        setFetching(false)
      })
  }

  const onAccept = (user: any) => {
    acceptFriendRequests(user.id)
      .then(response => {
        if (response && response?.status === 1) {
          showMessage("You are now friends")
        }
      })
      .catch(error => {
        showMessage("Something went wrong", 'error')
      })
  }

  const onReject = (request: any) => {
    rejectFriendRequests(request.id)
      .then(response => {
        if (response && response?.status === 1) {
          showMessage("Request has been rejected", 'error')
          getPendingRequests()
        } else {
          showMessage("Something went wrong", 'error')
        }
      })
      .catch(error => {
        showMessage("Something went wrong", 'error')
      })
  }

  const onRefresh = () => getPendingRequests()

  return (
    <View style={_styles.container}>
      <FlatList
        data={pendingRequests}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => renderFriendItem(item, onAccept, onReject)}
        contentContainerStyle={_styles.scroll}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
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
