import React from 'react'
import { getIconType } from './getIconType'

const Icon = props => {
  const { name = '', family = '', size, color = 'black', ...rest } = props
  const IconInstance = getIconType(family)
  return (
    <IconInstance
      name={name}
      size={size || 20}
      color={color || 'black'}
      {...rest}
    />
  )
}

export default Icon
