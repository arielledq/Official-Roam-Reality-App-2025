import * as React from "react"
import Svg, { SvgProps, Path, Rect } from "react-native-svg"
const EyeIcon = (props: SvgProps) => (
  <Svg width={36} height={37} fill="none" viewBox="0 0 36 37" {...props}>
    <Rect y="0.5" width="36" height="36" rx="10" fill="#F6E6FF" />
    <Path
      d="M20.5 23.5L15.5 18.5L20.5 13.5"
      stroke="black"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
)
export default EyeIcon
