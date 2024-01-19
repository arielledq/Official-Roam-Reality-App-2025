import { Alert } from "react-native"

export const handleError = (res) => {
    let message = ''
    console.log({ res, message: res?.message?.message })
    if (res?.message?.message) {
        message = res?.message?.message
    } else {
        const key = Object.keys(res.message)[0]
        message = res?.message?.message || Array.isArray(res.message[key]) ? res.message[key][0] : res.message[key]
    }
    console.log({ message })
    Alert.alert('Error', message)
}