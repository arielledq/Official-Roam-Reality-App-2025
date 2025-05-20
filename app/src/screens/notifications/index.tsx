import React, {useEffect, useState} from "react";
import {View, Text, TouchableOpacity, FlatList} from "react-native";
import {
  clearNotificationList,
  getUserNotificationList,
  markAllNotificationAsRead,
  markNotificationAsRead,
} from "../../network";
import BackgroundWithImage from "../../components/background";
import {AppHeader} from "../../components";
import theme from "../../assets/theme";
import useStyles from "./styles.ts";
import {formatDate} from "../../util/DateUtils";
import MoreMenuIcon from "assets/svg/MoreMenuIcon.tsx";
import {Menu} from "react-native-paper";
import NotificationModal from "components/NotificationModal.tsx";
import {useSelector} from "react-redux";

const dummyNotifications = [
  {
    id: "1",
    title: "Your submission was rejected.",
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ac mi aliquam, auctor magna eget, vehicula quam. Sed sed imperdiet nulla.",
    created_at: "2025-04-30T10:20:00Z",
    is_read: false,
    image_url: "https://webtoapp.design/static/img/articles/app-screenshots/youtube.webp", // Replace with actual if needed
    location_label: "Wrightson Road, Downtown, Port of Spain",
  },
  {
    id: "2",
    title: "Your submission was rejected.",
    message:
      "Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. In condimentum facilisis porta.",
    created_at: "2025-04-30T09:21:00Z",
    is_read: false,
    image_url: "https://placehold.co/300x600?text=Another+Rejection",
    location_label: "Independence Square, Port of Spain",
  },
  {
    id: "3",
    title: "Your submission was rejected.",
    message:
      "Aenean nec eros. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia.",
    created_at: "2025-04-30T08:15:00Z",
    is_read: false,
    image_url: "https://placehold.co/300x600?text=Third+Rejection",
    extra_data: {
      image: "https://placehold.co/300x600?text=Third+Rejection"
    },
    location_label: "Chaguanas Main Road",
  },
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState([]);
  const _styles = useStyles();
  const [readAllMenuVisible, setReadAllMenuVisible] = React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState(null);
  const user = useSelector(state => state?.login?.data?.user);
  const userName = user?.name || "";

  const openMenu = () => setReadAllMenuVisible(true);
  const closeMenu = () => setReadAllMenuVisible(false);

  const openDetails = selectedNotif => {
    setSelectedNotification(selectedNotif);
    // TODO: also mark as read
  };
  const closeDetails = () => setSelectedNotification(null);

  useEffect(() => {
    // getUserNotifications();
    setNotifications(dummyNotifications); // ← Temporarily use dummy data
  }, []);

  const getUserNotifications = async () =>
    getUserNotificationList()
      .then(response => {
        if (response && response?.data?.length > 0) {
          // Show only unread notifications
          // const unreadNotifications = response.data.filter(notification => !notification?.is_read);
          setNotifications(response?.data);
        }
      })
      .catch(error => console.error(error));

  const markAsRead = (notificationId: string) => {
    const data = {
      is_read: true,
    };
    markNotificationAsRead(notificationId, data).then(response => {
      if (response) {
        console.info(response);
        const newNotifications = notifications.filter(
          notification => notification.id !== notificationId
        );
        setNotifications(newNotifications);
      }
    });
  };

  const markAllAsRead = () => {
    markAllNotificationAsRead()
      .then(response => {
        if (response) {
          getUserNotifications()
          // setNotifications([]);
        }
      })
      .catch(error => console.error(error));
  };

  const renderItem = ({item}) => {
    const isUnread = !item.is_read;

    return (
      <View
        style={[
          {
            backgroundColor: "#1E1E2E",
            padding: 16,
            borderRadius: 12,
            marginVertical: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          },
          isUnread && {
            borderWidth: 2,
            borderColor: theme.lightColors?.inputBlue,
          },
        ]}
      >
        <TouchableOpacity style={{flex: 1}} onPress={() => openDetails(item)}>
          <Text style={{color: theme.lightColors?.white, fontWeight: "bold", marginBottom: 4}}>
            {userName}
          </Text>
          <Text style={{color: theme.lightColors?.white}}>{item.title}</Text>
          <Text style={{color: theme.lightColors?.white, textAlign: "right", marginLeft: 8}}>
            {formatDate(item.created_at, "hh:mm A")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <BackgroundWithImage>
      <AppHeader
        title="Notifications"
        backgroundColor="transparent"
        rightComponent={
          <Menu
            visible={readAllMenuVisible}
            onDismiss={closeMenu}
            anchorPosition="bottom"
            anchor={
              <TouchableOpacity onPress={openMenu} style={{marginRight: 8}}>
                <MoreMenuIcon />
              </TouchableOpacity>
            }
            contentStyle={{
              backgroundColor: "#1E1E2E",
              borderRadius: 8,
              paddingVertical: 4,
            }}
          >
            <Menu.Item
              onPress={() => {
                // Handle mark as read
                closeMenu();
              }}
              title="Mark all as read"
              titleStyle={{color: "white", fontWeight: "bold"}}
            />
          </Menu>
        }
      />
      <View style={_styles.container}>
        <FlatList data={notifications} renderItem={renderItem} keyExtractor={item => item.id} />
        <NotificationModal
          isVisible={!!selectedNotification}
          notification={selectedNotification}
          onClose={closeDetails}
        />
      </View>
    </BackgroundWithImage>
  );
};

export default Notifications;
