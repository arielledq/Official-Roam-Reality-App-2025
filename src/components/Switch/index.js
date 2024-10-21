import React from 'react'
import { ActivityIndicator, Switch } from 'react-native'

const AppSwitch = props => {
  if (props?.loading) {
    return <ActivityIndicator />
  }
  return (
    <Switch trackColor={{ false: '#9003E0', true: '#9003E0' }} thumbColor={'#B816E0'} {...props} />
  )
}

export default AppSwitch
