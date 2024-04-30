import React from 'react'
import { StyleSheet, View, ActivityIndicator } from 'react-native'
import theme from '../../assets/theme'

const ScreenLoader = ({ style }) => (
  <View style={[styles.view, style]}>
    <ActivityIndicator size={'large'} color={theme.lightColors.pink} />
  </View>
)

export default ScreenLoader

const styles = StyleSheet.create({
  view: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '80%',
    width: '100%'
  }
})
