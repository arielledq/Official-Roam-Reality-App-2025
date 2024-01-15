import { Alert } from "react-native"

export const handleError = (res) => {
    console.log({res})
    const key = Object.keys(res.message)[0]
    const message = Array.isArray(res.message[key]) ? res.message[key][0] : res.message[key]
    console.log({ message })
    Alert.alert('Error', message)
}