import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { AppButton, AppText } from '../../components'
import { resetState } from '../../redux/Login'
import { logout } from '../../network'
import { useDispatch } from 'react-redux'

const Home = () => {
  const dispatch = useDispatch()
  const handleLogout = () => {
    logout()
    dispatch(resetState())
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
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})