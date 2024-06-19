import { Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const handleError = res => {
  let message = ""
  console.log({ res, message: res?.message?.message })
  if (res?.message?.message) {
    message = res?.message?.message
  } else {
    const key = Object.keys(res.message)[0]
    message =
      res?.message?.message || Array.isArray(res.message[key])
        ? res.message[key][0]
        : res.message[key]
  }
  console.log({ message })
  Alert.alert("Error", message)
}

export const getImage = image => {
  return image.split("?X-Amz-Algorithm=")[0]
}

export const setItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (e) {
    console.log("error", e)
  }
}

export const getItem = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key)
    if (value !== null) {
      return value
    }
  } catch (e) {
    console.log("error", e)
  }
}

export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key)
  } catch (e) {
    console.log("error", e)
  }
}

export const DEBOUNCE_TIME = 1000

export const isPointInPolygon = (latitude: Number, longitude: Number, polygon: []) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new TypeError('Invalid latitude or longitude. Numbers are expected')
  } else if (!polygon || !Array.isArray(polygon)) {
    throw new TypeError('Invalid polygon. Array with locations expected')
  } else if (polygon.length === 0) {
    throw new TypeError('Invalid polygon. Non-empty Array expected')
  }

  const x = latitude; const y = longitude

  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]; const yi = polygon[i][1]
    const xj = polygon[j][0]; const yj = polygon[j][1]

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
};