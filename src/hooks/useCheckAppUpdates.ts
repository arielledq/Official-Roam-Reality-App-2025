import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
  IAUInstallStatus,
} from "sp-react-native-in-app-updates";
import { Platform } from "react-native";
import { useEffect, useRef, useState } from "react";

const CHECK_UPDATES_INTERVAL_HOURS = 1000 * 60 * 60 * 6; // 6 Hours

const useCheckAppUpdates = () => {
  const [appHasUpdates, setAppHasUpdates] = useState(false);
  const updatesIntervalId = useRef<any>(null);

  const checkForUpdates = async () => {
    const inAppUpdates = new SpInAppUpdates(
      false // isDebug
    );
    // curVersion is optional if you don't provide it will automatically take from the app using react-native-device-info
    try {
      await inAppUpdates.checkNeedsUpdate().then(result => {
        try {
          if (result.shouldUpdate) {
            setAppHasUpdates(true);

            let updateOptions: StartUpdateOptions = {};
            if (Platform.OS === "android") {
              // android only, on iOS the user will be promped to go to your app store page
              updateOptions = {
                updateType: IAUUpdateKind.IMMEDIATE,
              };
            }
            if (Platform.OS === "ios") {
              updateOptions = {
                title: "Update available",
                message:
                  "There is a new version of the app available on the App Store, do you want to update it?",
                buttonUpgradeText: "Update",
                buttonCancelText: "Cancel",
                forceUpgrade: true,
              };
            }
            inAppUpdates.addStatusUpdateListener(downloadStatus => {
              console.log("download status", downloadStatus);
              if (downloadStatus.status === IAUInstallStatus.DOWNLOADED) {
                console.log("downloaded");
                inAppUpdates.installUpdate();
                inAppUpdates.removeStatusUpdateListener(finalStatus => {
                  console.log("final status", finalStatus);
                });
              }
            });
            inAppUpdates.startUpdate(updateOptions);
          } else {
            setAppHasUpdates(false);
          }
        } catch (error) {
          console.log(error);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    updatesIntervalId.current = setInterval(checkForUpdates, CHECK_UPDATES_INTERVAL_HOURS);

    return () => {
      clearInterval(updatesIntervalId.current);
    };
  }, []);

  return {
    appHasUpdates,
    checkForUpdates,
  };
};

export default useCheckAppUpdates;
