import * as React from 'react'
import { Icons } from '../../assets/Icons'

export default function CustomIcon(props) {
  const { name = '', size, style, width } = props
  const SVG = Icons[name]
  return <SVG height={size} width={width || size} style={style} />
}
