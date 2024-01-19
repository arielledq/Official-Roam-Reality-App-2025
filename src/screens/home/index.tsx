import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { AppButton, AppText } from '../../components'
import { resetState } from '../../redux/Login'
import { logout } from '../../network'
import { useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native'

const Home = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const handleLogout = () => {
    logout()
    dispatch(resetState())
  }
  const handleChangePassword = () => {
    navigation.navigate('ChangePassword')
  }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'

      }}
    >
      <Text>Home</Text>
      <AppButton
        containerStyle={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          width: '70%', marginTop: 100
        }}
        title="Log Out"
        onPress={handleLogout}
      />
      <AppButton
        containerStyle={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          width: '70%', marginTop: 100
        }}
        title="Change Password"
        onPress={handleChangePassword}
      />
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})