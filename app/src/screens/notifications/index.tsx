import React, {useEffect, useState} from "react";
import {View, Text, TouchableOpacity, FlatList} from "react-native";
import {
  getUserNotificationList,
  markAllNotificationAsRead,
  markNotificationAsRead,
} from "../../network";
import BackgroundWithImage from "../../components/background";
import {AppHeader} from "../../components";
import theme from "../../assets/theme";
import {formatDate} from "../../util/DateUtils";
import MoreMenuIcon from "assets/svg/MoreMenuIcon.tsx";
import {Menu} from "react-native-paper";
import NotificationModal from "components/NotificationModal.tsx";
import {useSelector} from "react-redux";

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any>([]);
  const [readAllMenuVisible, setReadAllMenuVisible] = React.useState(false);
  const [selectedNotification, setSelectedNotification] = React.useState<any>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const user = useSelector((state: any) => state?.login?.data?.user);
  const userName = user?.name || "";

  const openMenu = () => setReadAllMenuVisible(true);
  const closeMenu = () => setReadAllMenuVisible(false);

  const openDetails = (selectedItem: any) => {
    setSelectedNotification(selectedItem);
    setNotifications(
      notifications.map((notification: any) => {
        if (notification.id === selectedItem.id) {
          return {...notification, is_read: true};
        }
        return notification;
      })
    );
    markAsRead(selectedItem.id);
  };

  const closeDetails = () => setSelectedNotification(null);

  useEffect(() => {
    getUserNotifications();
  }, []);

  const getUserNotifications = async () => {
    try {
      setRefreshing(true);
      const response = await getUserNotificationList();
      console.log(response?.data);
      if (response && response?.data?.length > 0) {
        setNotifications(response?.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const data = {
        is_read: true,
      };
      await markNotificationAsRead(notificationId, data);
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationAsRead();
      await getUserNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({item}: {item: any}) => {
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
                closeMenu();
                markAllAsRead();
              }}
              title="Mark all as read"
              titleStyle={{color: "white", fontWeight: "bold"}}
            />
          </Menu>
        }
      />
      <View style={{flex: 1, paddingHorizontal: 15}}>
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          refreshing={refreshing}
          onRefresh={getUserNotifications}
        />
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
