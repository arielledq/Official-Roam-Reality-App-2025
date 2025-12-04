import * as React from "react";
import {OneSignal} from "react-native-onesignal";
import {setDevice} from "../network";

type NotificationClickHandler = (additionalData: Record<string, any>) => void;

export const useOneSignal = (onNotificationClick?: NotificationClickHandler) => {
  const setOnesignalDevice = async () => {
    try {
      const pushSubscription = OneSignal.User.pushSubscription;
      const subscriptionId = await pushSubscription.getIdAsync(); // antes: getPushSubscriptionId()
      const optedIn = await pushSubscription.getOptedInAsync(); // antes: getOptedIn()
      //       const token = await pushSubscription.getTokenAsync();              // APNs/FCM token

      //     console.log("🆔 OneSignal:", { subscriptionId, optedIn, hasToken: !!token });

      //       console.log("pushSubscription, subscriptionId, optedIn", pushSubscription, subscriptionId, optedIn)
      if (subscriptionId && optedIn) {
        const deviceData = {userId: subscriptionId, active: optedIn};
        setDevice(deviceData)
          .then(res => {})
          .catch(err => {
            console.error("Device Data Update Error", err);
          });
      } else {
      }
    } catch (error) {
      console.error("Error getting OneSignal device state:", error);
    }
  };

  React.useEffect(() => {
    const shouldHandleClicks = !!onNotificationClick;
    if (!shouldHandleClicks) return;

    const clickListener = (event: any) => {
      const notification = event.getNotification();
      const additionalData = notification?.additionalData;

      if (additionalData) {
        onNotificationClick(additionalData);
      }
    };

    OneSignal.Notifications.addEventListener("click", clickListener);

    return () => {
      OneSignal.Notifications.removeEventListener("click", clickListener);
    };
  }, [onNotificationClick]);

  return {
    setOnesignalDevice,
  };
};
