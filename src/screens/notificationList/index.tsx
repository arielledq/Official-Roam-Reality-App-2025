import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, FlatList, Pressable } from "react-native"
import {
  clearNotificationList,
  getUserNotificationList,
  markAllNotificationAsRead
} from "../../network"
import BackgroundWithImage from "../../components/background"
import { AppHeader } from "../../components"
import theme from "../../assets/theme"
import useStyles from "./styles"
import { DateFormat, formatDate } from "../../util/DateUtils"
import { Icon } from "@rneui/base"

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState([])
  const _styles = useStyles()

  useEffect(() => {
    getUserNotificationList()
      .then(response => {
        if (response && response?.data?.length > 0) {
          setNotifications(response.data)
        }
      })
      .catch(error => console.error(error))
  }, [])

  const markAsRead = (notificationId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const clearAll = () => {
    clearNotificationList()
      .then(response => {
        if (response) {
          setNotifications([])
        }
      })
      .catch(error => console.error(error))
  }

  const markAllAsRead = () => {
    markAllNotificationAsRead()
      .then(response => {
        if (response) {
          setNotifications([])
        }
      })
      .catch(error => console.error(error))
  }

  const renderItem = ({ item }) => (
    <View style={_styles.row}>
      <View>
        <Text style={_styles.title}>{item.title}</Text>
        <Text style={_styles.date}>
          {formatDate(item.created_at, DateFormat.MMDDYYHH)}
        </Text>
        <Text style={_styles.message}>{item.message}</Text>
      </View>
      {!item.isRead && (
        <Pressable onPress={() => markAsRead(item.id)} hitSlop={10}>
          <Icon name="close" size={25} color={theme.lightColors?.grey2} />
        </Pressable>
      )}
    </View>
  )

  return (
    <BackgroundWithImage>
      <AppHeader title="Notifications" backgroundColor="transparent" />
      <View style={_styles.container}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 10
          }}
        >
          <TouchableOpacity onPress={clearAll}>
            <Text style={_styles.actionLabel}>Mark As Read</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={_styles.actionLabel}>Clear All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      </View>
    </BackgroundWithImage>
  )
}

export default NotificationList
