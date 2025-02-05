import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

export const handleError = (res: any) => {
  let message = "";
  console.error({ res, message: res?.message?.message });
  if (res?.message?.message) {
    message = res?.message?.message;
  } else {
    const key = Object.keys(res.message)[0];
    message =
      res?.message?.message || Array.isArray(res.message[key])
        ? res.message[key][0]
        : res.message[key];
  }
  console.error({ message });
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
  title = ""
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
