import * as React from "react"
import Svg, { SvgProps, Path, Rect } from "react-native-svg"
const RightArrowIcon = (props: SvgProps) => (
    <Svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Rect width="40" height="40" rx="20" fill="#9003E0"/>
        <Path d="M13 20H27" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <Path d="M20 13L27 20L20 27" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </Svg>
)
export default RightArrowIcon
