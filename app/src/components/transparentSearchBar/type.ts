import { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native";

export interface TransparentSearchBarProps extends Omit<TextInputProps, "style"> {
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
}
