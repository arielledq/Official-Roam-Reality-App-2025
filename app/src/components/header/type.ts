import { HeaderProps } from "@rneui/base";
import { TextStyle } from "react-native";

export interface AppHeaderProps extends HeaderProps {
  title?: string;
  titleStyle?: TextStyle;
  hideBackButton?: boolean;
  disableBackButton?: boolean;
  onBackPress?: () => void;
  onTitlePress?: () => void;
  isBottomTab?: boolean;
}
