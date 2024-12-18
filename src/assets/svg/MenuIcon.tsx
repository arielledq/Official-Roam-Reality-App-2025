import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";
const MenuIcon = (props: SvgProps) => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M20 7L4 7" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" />
    <Path d="M20 12L4 12" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" />
    <Path d="M20 17L4 17" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" />
  </Svg>
);
export default MenuIcon;
