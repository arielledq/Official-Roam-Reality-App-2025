import React, { useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
  GoogleSignin,
  statusCodes
} from '@react-native-google-signin/google-signin'
import DividerWithText from '../dividerwithtextcomponent'
import { AppleIcon, FacebookIcon, GoogleIcon } from '../../assets/svg'

const SocialSignin = () => {
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices()
      const userinfo = await GoogleSignin.signIn()
      const tokens = await GoogleSignin.getTokens()
      console.log({ userinfo })
      console.log({ tokens })
      //   dispatch(
      //     LoginActions.google_login({
      //       access_token: tokens.accessToken
      //       // code: userinfo.serverAuthCode
      //     })
      //   )
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        // alert('Cancel')
      } else if (error.code === statusCodes.IN_PROGRESS) {
        alert('Signin in progress')
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        alert('PLAY_SERVICES_NOT_AVAILABLE')
        // play services not available or outdated
      } else {
        // some other error happened
        console.log({ errorHere: error })
      }
    }
  }
  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['email', 'profile']
    })
  }, [])
  return (
    <View>
      <DividerWithText containerStyle={styles.divider} label={'OR'} />
      <View style={styles.socialSUcontainer}>
        <TouchableOpacity onPress={handleGoogleLogin}>
          <FacebookIcon style={styles.socialSIicon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <GoogleIcon style={styles.socialSIicon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <AppleIcon style={styles.socialSIicon} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default SocialSignin

const styles = StyleSheet.create({
  divider: {
    marginVertical: '10%'
  },
  socialSUcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  socialSIicon: {
    marginHorizontal: 10
  }
})
