import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import RNFS from "react-native-fs";
import {Alert, Linking, Platform} from "react-native";
// import { PERMISSIONS, RESULTS, request, requestMultiple } from "react-native-permissions";
// import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import {getConfiguration} from "network";
import Config from "config";

export const handleError = (res: any) => {
  let message = "";
  console.error({res, message: res?.message?.message});
  if (res?.message?.message) {
    message = res?.message?.message;
  } else {
    const key = Object.keys(res.message)[0];
    message =
      res?.message?.message || Array.isArray(res.message[key])
        ? res.message[key][0]
        : res.message[key];
  }
  console.error({message});
  showMessage(message, "error");
};

export const getImage = (image: any) => {
  return image.split("?X-Amz-Algorithm=")[0];
};

export const setItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error("error", e);
  }
};

export const getItem = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
  } catch (e) {
    console.error("error", e);
  }
};

export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error("error", e);
  }
};

export const DEBOUNCE_TIME = 1000;

// export const isPointInPolygon = (
//   latitude: Number,
//   longitude: Number,
//   polygon: []
// ) => {
//   if (typeof latitude !== "number" || typeof longitude !== "number") {
//     throw new TypeError("Invalid latitude or longitude. Numbers are expected")
//   } else if (!polygon || !Array.isArray(polygon)) {
//     throw new TypeError("Invalid polygon. Array with locations expected")
//   } else if (polygon.length === 0) {
//     throw new TypeError("Invalid polygon. Non-empty Array expected")
//   }
//
//   const x = latitude
//   const y = longitude
//
//   let inside = false
//   for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
//     const xi = polygon[i][0]
//     const yi = polygon[i][1]
//     const xj = polygon[j][0]
//     const yj = polygon[j][1]
//
//     const intersect =
//       yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
//     if (intersect) inside = !inside
//   }
//   return inside
// }

export const convert = (latitude: Number, longitude: Number, polygon: []) => {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new TypeError("Invalid latitude or longitude. Numbers are expected");
  } else if (!polygon || !Array.isArray(polygon)) {
    throw new TypeError("Invalid polygon. Array with locations expected");
  } else if (polygon.length === 0) {
    throw new TypeError("Invalid polygon. Non-empty Array expected");
  }

  const x = latitude;
  const y = longitude;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export const convertKilometersToMiles = (kilometers: any) => {
  return kilometers * 0.621371;
};

type messageTypes = "error" | "success" | "info";

export const showMessage = (
  error = "An error occurred while communicating with the server, please try again in a few moments",
  type: messageTypes = "success",
  title = "",
  visibilityTime: number = 4000
) => {
  let titleShow = title;
  if (title === "") {
    if (type === "success") {
      titleShow = "Success";
    } else if (type === "info") {
      titleShow = "Info";
    } else {
      titleShow = "Error";
    }
  }

  Toast.show({
    type,
    text1: titleShow,
    text2: error,
    visibilityTime,
  });
};

export const truncateText = (str: string, maxLength: number) => {
  const truncate = str?.length > maxLength ? str.substring(0, maxLength) + "..." : str;

  return truncate;
};

export function isPointInPolygon(point: number[], polygon: any) {
  const [lat, lng] = point;
  const polygonInner = polygon[0];
  let isInside = false;

  for (let i = 0, j = polygonInner.length - 1; i < polygonInner.length; j = i++) {
    const [lat1, lng1] = polygonInner[i];
    const [lat2, lng2] = polygonInner[j];

    const intersect =
      lng1 > lng !== lng2 > lng && lat < ((lat2 - lat1) * (lng - lng1)) / (lng2 - lng1) + lat1;
    if (intersect) isInside = !isInside;
  }

  return isInside;
}

//map issues fixes toggles / consts
export const tracksViewChanges = false;
export const pinColor = undefined; //'#B14FE9'
export const useCustomMarkers = true;

export const processCoolDownPeriod = (remaining: string) => {
  const timeString = remaining;
  // Split the string into hours, minutes, seconds, and milliseconds
  const [hours, minutes, seconds] = timeString.split(/[:.]/);

  // Convert to a Date object (assuming today's date)
  const date = new Date();
  // @ts-ignore
  date.setHours(hours, minutes, seconds);

  // Extract the time in hours (24-hour format)
  const hoursOnly = date.getHours();
  const minutesOnly = date.getMinutes();
  const secondsOnly = date.getSeconds();

  let coolDownHasFinished = false;
  if (hoursOnly === 0 && minutesOnly === 0 && secondsOnly === 0) {
    coolDownHasFinished = true;
  }

  let remainingText = "";

  if (hoursOnly >= 1) {
    remainingText = `${hoursOnly}h`;
  } else {
    remainingText = `<1h`;
  }
  if (coolDownHasFinished) {
    remainingText = `0h`;
  }
  return {
    coolDownHasFinished: coolDownHasFinished,
    remainingText: remainingText,
  };
};

export const processMyCheckIns = (user_attempts: number, challenge_attempt: number) => {
  if (!isNaN(user_attempts) && !isNaN(challenge_attempt)) {
    return `${user_attempts || 0}/${challenge_attempt || 0}`;
  } else {
    return "";
  }
};

export const accountSetupIsComplete = (userObj: any) => {
  let isComplete = false;
  if (
    userObj?.user?.email &&
    userObj?.user?.name &&
    userObj?.user?.user_profile?.account_setup &&
    userObj?.user?.user_profile?.phone_number &&
    userObj?.user?.user_profile?.home_address &&
    userObj?.user?.user_profile?.gender &&
    userObj?.user?.user_profile?.home_country &&
    userObj?.date_of_birth
  ) {
    isComplete = true;
  }
  return isComplete;
};

export function getFileExtension(url: string) {
  const match = url.match(/\.([a-zA-Z0-9]+)(?=\?|$)/);
  return match ? `.${match[1]}` : "";
}

// const getAndroidPermissions = () => {
//   const androidVersion = Platform.Version;
//   if (+androidVersion >= 33) {
//     return [PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, PERMISSIONS.ANDROID.READ_MEDIA_VIDEO];
//   } else {
//     return PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
//   }
// };

const requestCameraRollPermission = async (onPermissionsGranted: () => void) => {
  try {
    // const perms =
    //   Platform.OS === "ios" ? PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY : getAndroidPermissions();
    // let res: any;

    // if (Array.isArray(perms)) {
    //   res = await requestMultiple(perms);
    // } else {
    //   res = await request(perms);
    // }

    // if (Platform.OS === "android" && Platform.Version >= 33) {
    //   if (
    //     res[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.GRANTED &&
    //     res[PERMISSIONS.ANDROID.READ_MEDIA_VIDEO] === RESULTS.GRANTED
    //   ) {
    //     onPermissionsGranted();
    //     return true;
    //   } else {
    //     const deniedPerms = Object.keys(res).filter(
    //       perm => res[perm] === RESULTS.DENIED || res[perm] === RESULTS.BLOCKED
    //     );
    //     const permNames = deniedPerms.map(perm => {
    //       if (perm === PERMISSIONS.ANDROID.READ_MEDIA_IMAGES) return "images";
    //       if (perm === PERMISSIONS.ANDROID.READ_MEDIA_VIDEO) return "videos";
    //       return "storage"; // Fallback
    //     });

    //     Alert.alert(
    //       "Permission Denied",
    //       `This app needs access to your ${permNames.join(
    //         " and "
    //       )} to save images. Please go to your device settings to grant permission.`,
    //       [
    //         { text: "Cancel", style: "cancel" },
    //         { text: "OK", onPress: () => Linking.openSettings() },
    //       ]
    //     );
    //     return false;
    //   }
    // } else {
    //   // iOS or older Android
    //   if (res === RESULTS.GRANTED || res === RESULTS.LIMITED) {
    //     onPermissionsGranted();
    //     return true;
    //   } else {
    //     Alert.alert(
    //       "Permission Denied",
    //       "This app needs access to your photo library to save images. Please go to your device settings to grant permission.",
    //       [
    //         { text: "Cancel", style: "cancel" },
    //         { text: "OK", onPress: () => Linking.openSettings() },
    //       ]
    //     );
    return false;
    //   }
    // }
  } catch (err) {
    return false;
  }
};

const cameraRollSaveAsset = async (
  hasPermission: boolean,
  onPermissionsGranted: () => void,
  asset: string,
  fileExt: string
) => {
  if (!hasPermission) {
    const granted = await requestCameraRollPermission(onPermissionsGranted);
    if (!granted) return; // Don't proceed if permission is not granted
  }

  if (!asset || !fileExt) {
    showMessage("There was an error generating the file.", "error", "AR Memories!");
    return;
  }

  // await CameraRoll.saveAsset(asset, {
  //   type: fileExt == "mp4" ? "video" : "photo",
  // });

  showMessage("Saved to Camera Roll.", "success", "AR Memories!");
};

export const saveToGallery = async (
  hasPermission: boolean,
  onPermissionsGranted: () => void,
  isMemory: boolean,
  capturedDataUri: string,
  fileExt: string,
  loadingHandler: () => void
) => {
  if (isMemory) {
    const getPathFromUrl = (url: String) => {
      return url.split("?")[0];
    };

    const memoryURL = capturedDataUri;
    const memoryPath = getPathFromUrl(capturedDataUri);
    const updatedFileExt = memoryPath.split(".").pop() || "";

    let newMemoryUri = memoryPath.lastIndexOf("/");
    let memoryName = memoryPath.substring(newMemoryUri);

    try {
      let dirs = RNFS.CachesDirectoryPath;

      const tempFilePath = `${dirs}/${memoryName}`;
      loadingHandler();
      const downloadResult = await RNFS.downloadFile({
        fromUrl: memoryURL,
        toFile: tempFilePath,
        progress: _res => {
          // Optionally track download progress here
        },
      }).promise;

      if (downloadResult.statusCode === 200) {
        if (Platform.OS === "ios") {
          cameraRollSaveAsset(
            hasPermission,
            onPermissionsGranted,
            `file://${tempFilePath}`,
            updatedFileExt
          );
        } else {
          try {
            await cameraRollSaveAsset(
              hasPermission,
              onPermissionsGranted,
              `file://${tempFilePath}`,
              "photo"
            ); // 'photo' or 'video'

            showMessage("Saved to Camera Roll", "success", "AR Memories!"); // Uncomment if you have showMessage
          } catch (error) {
            showMessage("Error saving to Camera Roll", "error", "AR Memories!"); // Uncomment if you have showMessage
          }
        }

        // Clean up the temporary downloaded file
        setTimeout(() => {
          RNFS.unlink(tempFilePath)
            .then(() => console.log("Temporary file deleted."))
            .catch(err => console.log("Error deleting temporary file:", err));
        }, 1000);
      } else {
        showMessage("Download failed", "error", "AR Memories!"); // Uncomment if you have showMessage
      }
    } catch (error) {
      console.error(error);
    } finally {
      loadingHandler();
    }
  } else {
    cameraRollSaveAsset(hasPermission, onPermissionsGranted, capturedDataUri, fileExt);
  }
};

export const checkAppLatestUpdate = async () => {
  let isUpdated = false;
  if (Platform.OS === "ios") {
    try {
      let serverIOSProdVersionNumber;
      let serverIOSDevVersionNumber;

      // Extract app version from API response
      const configurations = await getConfiguration();

      const configurationItemKeys = Object.keys(configurations);
      configurationItemKeys.forEach(configItemKey => {
        const configurationContent = Object.keys(configurations[configItemKey]);
        if (configurationContent?.includes("key") && configurationContent?.includes("value")) {
          if (configurations[configItemKey]["key"] === "CURRENT_APP_VERSION") {
            serverIOSProdVersionNumber = configurations[configItemKey]["value"];
          }
          if (configurations[configItemKey]["key"] === "CURRENT_APP_VERSION_TESTFLIGHT") {
            serverIOSDevVersionNumber = configurations[configItemKey]["value"];
          }
        }
      });

      // Validate app version
      if (serverIOSProdVersionNumber === Config.APP_IOS_PROD_VERSION) {
        isUpdated = true;
        console.info("App updated on PROD");
      } else {
        console.info(
          "App not updated on PROD:",
          serverIOSProdVersionNumber,
          "!==",
          Config.APP_IOS_PROD_VERSION
        );
      }
      if (serverIOSDevVersionNumber === Config.APP_IOS_DEV_VERSION) {
        isUpdated = true;
        console.info("App updated on DEV");
      } else {
        console.info(
          "App not updated on DEV:",
          serverIOSDevVersionNumber,
          "!==",
          Config.APP_IOS_DEV_VERSION
        );
      }
    } catch (error) {
      console.error(error);
    }
    console.log("isUpdated", isUpdated);
    return isUpdated;
  } else {
    return true;
  }
};
