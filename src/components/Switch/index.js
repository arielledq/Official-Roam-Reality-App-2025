import React, { FC, useState } from "react"
import { Switch } from "react-native"

const AppSwitch = props => {
  const { onValueChange, value, ...otherProps } = props
  const [focus, setFocus] = useState(false)

  return (
    <Switch
      trackColor={{ false: "#9003E0", true: "#9003E0" }}
      thumbColor={"#B816E0"}
      // ios_backgroundColor="#9003E0"
      onValueChange={onValueChange}
      value={value}
    />
  )
}

export default AppSwitch
