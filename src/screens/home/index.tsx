import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { AppButton } from '../../components'
import { resetState } from '../../redux/Login'
import { getProfieDetails, logout } from '../../network'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { handleError } from '../../util/helpers'

const Home = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  // const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const handleLogout = () => {
    logout()
    dispatch(resetState())
  }
  const handleChangePassword = () => {
    navigation.navigate('ChangePassword')
  }

  const handleEditProfile = () => {
    navigation.navigate('EditProfile')
  }

  const handleProfile = () => {
    navigation.navigate('Profile')
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
      <AppButton
        containerStyle={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          width: '70%', marginTop: 100
        }}
        title="Edit Profile"
        onPress={handleEditProfile}
      />
      <AppButton
        containerStyle={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          width: '70%', marginTop: 100
        }}
        title="Profile"
        onPress={handleProfile}
      />
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})